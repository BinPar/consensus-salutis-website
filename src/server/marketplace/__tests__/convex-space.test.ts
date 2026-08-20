/**
 * Los tres endpoints del espacio de cliente en Convex, vistos desde este lado
 * (issue #7 §3 y §4).
 *
 * Lo que se prueba es **el contrato**: qué se manda, qué se acepta de vuelta y
 * —sobre todo— qué se descarta en la frontera. `parseState` no se exporta a
 * propósito (es la reja, no una utilidad), así que se ejercita a través de las
 * tres funciones que la usan, que es como se usa de verdad.
 *
 * El `fetcher` se inyecta, nunca se parchea el `fetch` global: así el test dice
 * exactamente qué petición sale y no depende de qué haya hecho otro archivo.
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    NEXT_PUBLIC_CONVEX_SITE_URL: "https://deployment.convex.site",
    MARKETPLACE_SESSION_SECRET: "secreto-de-pruebas-con-mas-de-32-caracteres",
  },
}));

import { env } from "~/env";
import { SOPORTE_ULTIMO_RECURSO } from "~/lib/espacio";
import {
  fetchSpaceState,
  redeemSpaceToken,
  requestSpaceLink,
  SpaceRequestError,
} from "~/server/marketplace/convex-space";

const BASE = "https://deployment.convex.site";
const NOW_MS = 1_760_000_000_000;

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** El estado tal y como lo devuelven el canje y la consulta, en su forma mínima. */
const estadoValido = () => ({
  status: "licensed",
  statusSince: NOW_MS,
  awsLast4: "4471",
  soporte: { email: "soporte@consensussalutis.com" },
});

const fetcherQueDevuelve = (body: unknown, status = 200) =>
  vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(body, status));

/** El cuerpo que salió, ya parseado. Los tres endpoints mandan siempre JSON. */
function cuerpoJson(init: RequestInit | undefined): unknown {
  const body = init?.body;
  if (typeof body !== "string")
    throw new Error("el cuerpo saliente no es una cadena JSON");
  return JSON.parse(body) as unknown;
}

/** Silencia los `console.error` de los caminos degradados, que son esperados. */
function silenciaLog() {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
}

describe("requestSpaceLink · pedir el enlace de acceso", () => {
  it("manda el email y la clave de cliente al endpoint de solicitud", async () => {
    const fetcher = fetcherQueDevuelve({ ok: true });

    await requestSpaceLink(
      { email: "compras@hospital.example", clientKey: "clave-hmac-de-cliente" },
      { fetcher },
    );

    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe(`${BASE}/marketplace-space-request`);
    expect(init?.method).toBe("POST");
    // `no-store`: una solicitud de enlace no se puede servir de una caché.
    expect(init?.cache).toBe("no-store");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
    });
    expect(cuerpoJson(init)).toEqual({
      email: "compras@hospital.example",
      clientKey: "clave-hmac-de-cliente",
    });
  });

  it("un 200 no devuelve nada: el resultado no se le puede contar a quien pregunta", async () => {
    const fetcher = fetcherQueDevuelve({ ok: true });

    await expect(
      requestSpaceLink(
        { email: "compras@hospital.example", clientKey: "k" },
        { fetcher },
      ),
    ).resolves.toBeUndefined();
  });

  // Criterio de aceptación §7: el 429 es la única respuesta distinta, y se puede
  // porque depende de cuánto ha pedido quien pregunta, no de quién es el email.
  it("un 429 llega como rate-limited y no como fallo genérico", async () => {
    const fetcher = fetcherQueDevuelve({ error: "demasiadas" }, 429);

    await expect(
      requestSpaceLink(
        { email: "compras@hospital.example", clientKey: "k" },
        { fetcher },
      ),
    ).rejects.toMatchObject({
      name: "SpaceRequestError",
      reason: "rate-limited",
    });
  });

  /*
    Un 401 es el secreto compartido mal puesto y un 500 es el otro lado roto: las
    dos son culpa nuestra, no de quien rellena el formulario, y la ruta las trata
    igual —contesta `ok`— pero el motivo tiene que distinguirse en el log o nadie
    sabrá que hay una variable de entorno sin poner.
  */
  for (const status of [401, 500]) {
    it(`un ${status} es configuración nuestra, no del cliente`, async () => {
      const fetcher = fetcherQueDevuelve({ error: "no" }, status);
      let capturado: unknown;

      try {
        await requestSpaceLink(
          { email: "compras@hospital.example", clientKey: "k" },
          { fetcher },
        );
      } catch (error) {
        capturado = error;
      }

      expect(capturado).toBeInstanceOf(SpaceRequestError);
      expect((capturado as SpaceRequestError).reason).toBe("misconfigured");
    });
  }

  it("un fetch que no llega es unavailable", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      requestSpaceLink(
        { email: "compras@hospital.example", clientKey: "k" },
        { fetcher },
      ),
    ).rejects.toMatchObject({ reason: "unavailable" });
  });
});

describe("redeemSpaceToken · canjear el enlace", () => {
  it("mapea una respuesta en contrato a los campos con los que se firma la cookie", async () => {
    const fetcher = fetcherQueDevuelve({
      ok: true,
      subscriptionId: "sub_1",
      ...estadoValido(),
      status: "provisioned",
      reportSlug: "s".repeat(43),
      plazoLimite: NOW_MS + 86_400_000,
      soporte: { email: "soporte@consensussalutis.com", contacto: "Adrián" },
    });

    const result = await redeemSpaceToken(
      { tokenHash: "hash-del-token" },
      { fetcher },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.subscriptionId).toBe("sub_1");
    expect(result.status).toBe("provisioned");
    // Milisegundos allí, y aquí también: el nombre lo dice y no se mezcla con un `exp`.
    expect(result.statusSinceMs).toBe(NOW_MS);
    expect(result.plazoLimiteMs).toBe(NOW_MS + 86_400_000);
    expect(result.awsLast4).toBe("4471");
    expect(result.reportSlug).toBe("s".repeat(43));
    expect(result.soporte).toEqual({
      email: "soporte@consensussalutis.com",
      contacto: "Adrián",
    });
  });

  it("manda el hash al endpoint de canje, con el portador y sin caché", async () => {
    const fetcher = fetcherQueDevuelve({ ok: false });

    await redeemSpaceToken({ tokenHash: "hash-del-token" }, { fetcher });

    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe(`${BASE}/marketplace-space-redeem`);
    expect(init?.method).toBe("POST");
    expect(init?.cache).toBe("no-store");
    expect(cuerpoJson(init)).toEqual({ tokenHash: "hash-del-token" });
  });

  // Las cuatro causas de rechazo —caducado, ya usado, inexistente, email que no
  // casa— llegan colapsadas en un solo `{ ok: false }`. Aquí no hay nada que
  // desdoblar: si esta función devolviera el motivo, alguien lo pintaría.
  it("un rechazo del otro lado es un solo ok:false, sin motivo", async () => {
    const fetcher = fetcherQueDevuelve({ ok: false, reason: "already-used" });

    const result = await redeemSpaceToken({ tokenHash: "hash" }, { fetcher });

    expect(result).toEqual({ ok: false });
  });

  it("un no-200 no lanza: devuelve ok:false y lo registra", async () => {
    silenciaLog();
    const fetcher = fetcherQueDevuelve({ error: "vaya" }, 500);

    // Lanzar aquí dejaría al cliente con un 500 del framework en vez de con la
    // pantalla de «este enlace ya no vale», que es lo que tiene que ver.
    await expect(
      redeemSpaceToken({ tokenHash: "hash" }, { fetcher }),
    ).resolves.toEqual({
      ok: false,
    });
  });

  it("un fetch que no llega tampoco lanza", async () => {
    silenciaLog();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(
      redeemSpaceToken({ tokenHash: "hash" }, { fetcher }),
    ).resolves.toEqual({
      ok: false,
    });
  });

  it("una respuesta en contrato pero sin subscriptionId no vale", async () => {
    silenciaLog();
    const fetcher = fetcherQueDevuelve({ ok: true, ...estadoValido() });

    await expect(
      redeemSpaceToken({ tokenHash: "hash" }, { fetcher }),
    ).resolves.toEqual({
      ok: false,
    });
  });

  /*
    LA REJA. Es el test que importa de este archivo.

    El día que alguien añada un campo al payload del otro lado sin pensar en esta
    página —el `awsAccountId` completo, el `licenseArn`, el email de contacto—
    aparecería en el HTML sin que nadie lo decidiera. `parseState` recorta a lo
    que está escrito, y esto comprueba que sigue recortando: se manda de todo y se
    mira, con `Object.keys`, qué ha sobrevivido.
  */
  it("los campos que no son del contrato SE DESCARTAN en la frontera", async () => {
    const fetcher = fetcherQueDevuelve({
      ok: true,
      subscriptionId: "sub_1",
      ...estadoValido(),
      awsAccountId: "123456784471",
      licenseArn: "arn:aws:license-manager:eu-west-1:1:license/l-1",
      contactEmail: "direccion.medica@hospital.example",
      email: "compras@hospital.example",
    });

    const result = await redeemSpaceToken({ tokenHash: "hash" }, { fetcher });

    expect(result.ok).toBe(true);
    for (const prohibido of [
      "awsAccountId",
      "licenseArn",
      "contactEmail",
      "email",
    ]) {
      expect(Object.keys(result), prohibido).not.toContain(prohibido);
    }
    // Y los cuatro dígitos sí, que es lo que el badge enseña.
    expect(Object.keys(result)).toContain("awsLast4");
  });
});

describe("fetchSpaceState · releer el estado en cada visita", () => {
  it("pide el estado por subscriptionId, codificado en la query", async () => {
    const fetcher = fetcherQueDevuelve(estadoValido());

    await fetchSpaceState("sub/con espacios", { fetcher });

    const [url, init] = fetcher.mock.calls[0] ?? [];
    expect(url).toBe(
      `${BASE}/marketplace-space-status?subscriptionId=${encodeURIComponent("sub/con espacios")}`,
    );
    expect(init?.method).toBe("GET");
    // El estado se refleja, no se cachea: lo mueven eventos de fuera de aquí.
    expect(init?.cache).toBe("no-store");
    expect(init?.headers).toMatchObject({
      Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
    });
  });

  it("devuelve el estado cuando la respuesta cumple el contrato", async () => {
    const fetcher = fetcherQueDevuelve(estadoValido());

    const state = await fetchSpaceState("sub_1", { fetcher });

    expect(state).toEqual({
      status: "licensed",
      statusSinceMs: NOW_MS,
      awsLast4: "4471",
      soporte: { email: "soporte@consensussalutis.com" },
    });
  });

  it("los campos opcionales no se inventan cuando no vienen", async () => {
    const fetcher = fetcherQueDevuelve(estadoValido());

    const state = await fetchSpaceState("sub_1", { fetcher });

    // Ausentes, y no `undefined`: `plazoLimiteMs` a `undefined` en un objeto
    // hace que `state.plazoLimiteMs === undefined` y el `??` de la página
    // funcione igual, pero un `Object.keys` con el campo dentro invita a pintar
    // «te contacta antes del undefined».
    expect(Object.keys(state ?? {})).not.toContain("plazoLimiteMs");
    expect(Object.keys(state ?? {})).not.toContain("reportSlug");
    expect(Object.keys(state?.soporte ?? {})).not.toContain("contacto");
  });

  /*
    El canal de soporte no puede quedar en blanco, y no es cosmético: el bloque
    de soporte visible dentro de la aplicación es un requisito de AWS, y una
    tarjeta con el hueco vacío no lo cumple. El endpoint manda la cadena vacía
    cuando ni el criterio activo ni el deployment tienen canal, así que la reja
    la sustituye aquí y no en la vista —donde habría que acordarse en cada sitio
    que lo pinte.
  */
  it("un canal de soporte vacío se sustituye por el de último recurso", async () => {
    const fetcher = fetcherQueDevuelve({
      ...estadoValido(),
      soporte: { email: "" },
    });

    const state = await fetchSpaceState("sub_1", { fetcher });

    expect(state?.soporte.email).toBe(SOPORTE_ULTIMO_RECURSO);
    expect(state?.soporte.email.length).toBeGreaterThan(0);
  });

  it("el canal del canje también se sustituye: es la misma reja", async () => {
    const fetcher = fetcherQueDevuelve({
      ok: true,
      subscriptionId: "sub_1",
      ...estadoValido(),
      soporte: { email: "" },
    });

    const result = await redeemSpaceToken({ tokenHash: "hash" }, { fetcher });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.soporte.email).toBe(SOPORTE_ULTIMO_RECURSO);
  });

  it("un canal con valor NO se toca", async () => {
    const fetcher = fetcherQueDevuelve(estadoValido());

    const state = await fetchSpaceState("sub_1", { fetcher });

    // El canal de verdad vive en el deployment; el último recurso es solo red.
    expect(state?.soporte.email).toBe("soporte@consensussalutis.com");
    expect(state?.soporte.email).not.toBe(SOPORTE_ULTIMO_RECURSO);
  });

  it("un canal de soporte AUSENTE del todo NO invalida el estado", async () => {
    silenciaLog();
    // Decisión explícita: la ausencia se trata como la cadena vacía. Invalidar el
    // estado entero por un campo con sustituto costaría el estado en vivo, el
    // `reportSlug` y el plazo —el cliente se quedaría con la fecha vieja de la
    // cookie y sin enlace al informe— y todo por no poder imprimir una dirección
    // de correo que sí sabemos. El requisito de AWS lo sigue cumpliendo la
    // constante; lo que no se sacrifica es el resto de la página.
    const fetcher = fetcherQueDevuelve({
      status: "licensed",
      statusSince: NOW_MS,
      awsLast4: "4471",
    });

    const state = await fetchSpaceState("sub_1", { fetcher });

    expect(state).not.toBeNull();
    expect(state?.soporte.email).toBe(SOPORTE_ULTIMO_RECURSO);
    expect(state?.status).toBe("licensed");
  });

  it("un 404 es una suscripción que no se puede leer, no un error de página", async () => {
    silenciaLog();
    const fetcher = fetcherQueDevuelve({ error: "no encontrada" }, 404);

    // `null` y no una excepción: quien llama es una página de servidor con una
    // cookie válida en la mano, y lo correcto es el espacio degradado.
    expect(await fetchSpaceState("sub_1", { fetcher })).toBeNull();
  });

  it("un fallo de red no revienta la página del cliente", async () => {
    silenciaLog();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new Error("ECONNREFUSED"));

    expect(await fetchSpaceState("sub_1", { fetcher })).toBeNull();
  });

  /*
    Las tres formas de estar fuera de contrato que de verdad pueden pasar: un
    estado nuevo añadido en el monorepo, el bloque de soporte olvidado y una
    fecha que llega como cadena porque alguien la serializó por el camino.
  */
  for (const [nombre, payload] of [
    [
      "un status que no es uno de los cuatro",
      { ...estadoValido(), status: "cancelled" },
    ],
    [
      "con statusSince que no es número",
      { ...estadoValido(), statusSince: "2026-01-15" },
    ],
  ] as const) {
    it(`descarta una respuesta ${nombre}`, async () => {
      silenciaLog();
      const fetcher = fetcherQueDevuelve(payload);

      expect(await fetchSpaceState("sub_1", { fetcher })).toBeNull();
    });
  }
});

/**
 * `POST /api/espacio/canje` — el canje del enlace de un solo uso (issue #7 §3).
 *
 * Criterios de aceptación §7 que se cierran aquí:
 *
 *   Un canje bueno abre sesión y deja la cookie firmada; las cuatro causas de
 *   rechazo dan la misma pantalla; y un `GET` no gasta el enlace.
 *
 * El último es el que justifica que esta ruta exista separada de la pantalla del
 * token: los antivirus de correo corporativos y el prefetch del navegador hacen
 * `GET` a lo que encuentran, y si el `GET` canjeara, el escáner del propio
 * hospital quemaría el enlace antes de que nadie lo pulsara.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as ConvexSpaceModule from "~/server/marketplace/convex-space";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const PEPPER = "pimienta-de-pruebas-con-mas-de-32-caracteres";

/**
 * Una marca de transición que **no es múltiplo de mil**.
 *
 * A propósito: es lo que hace visible la aritmética de la conversión. Con un
 * número redondo, un `Math.round` mal puesto —o directamente ninguna división—
 * daría el mismo resultado que el `Math.floor` correcto en algunos casos y el
 * test no diría nada.
 */
const STATUS_SINCE_MS = 1_759_740_800_999;
const STATUS_SINCE_SECONDS = 1_759_740_800;

/** Un token con forma de los que emite Convex, y distinguible en cualquier cadena. */
const TOKEN = "token-de-un-solo-uso-de-pruebas-4Xk9wQ2rTuv";

// El entorno, antes de importar la ruta: `~/env` lo valida al cargarse y la ruta
// deriva el hash con la pimienta y firma la cookie con el secreto.
vi.stubEnv("MARKETPLACE_SESSION_SECRET", SECRET);
vi.stubEnv("MARKETPLACE_TOKEN_PEPPER", PEPPER);
vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");

/**
 * El canje contra Convex, sustituido. Se conserva el resto del módulo
 * —`importOriginal`— para no cambiar por clases falsas los tipos que la ruta usa.
 */
const redeemSpaceToken =
  vi.fn<
    (input: {
      tokenHash: string;
    }) => Promise<ConvexSpaceModule.SpaceRedeemResult>
  >();
vi.mock("~/server/marketplace/convex-space", async (importOriginal) => {
  const original = await importOriginal<typeof ConvexSpaceModule>();
  return { ...original, redeemSpaceToken };
});

const { GET, POST } = await import("~/app/api/espacio/canje/route");
const { hashToken } = await import("~/server/marketplace/one-time-tokens");
const { SPACE_COOKIE_NAME, verifySpaceSession } =
  await import("~/server/marketplace/space-session");

const URL_CANJE = "https://consensussalutis.com/api/espacio/canje";
const ESPACIO = "https://consensussalutis.com/espacio";
const ESPACIO_NO_VALIDO =
  "https://consensussalutis.com/espacio?enlace=no-valido";

/**
 * El POST tal y como lo manda la pantalla del token: un `<form method="post">`
 * sin JavaScript —así que `form-urlencoded`— y del mismo origen, que es el único
 * llamante legítimo de esta ruta.
 */
function postCanje(
  fields: Record<string, string>,
  headers: Record<string, string> = {},
) {
  return new Request(URL_CANJE, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://consensussalutis.com",
      "x-forwarded-host": "consensussalutis.com",
      ...headers,
    },
    body: new URLSearchParams(fields),
  });
}

function cookieDeLaRespuesta(response: Response): string | null {
  const header = response.headers.get("set-cookie");
  if (header === null) return null;
  const match = new RegExp(`${SPACE_COOKIE_NAME}=([^;]+)`).exec(header);
  return match?.[1] ?? null;
}

/** Los claims dentro de la cookie, sin verificar: para mirar la aritmética. */
function claimsDeLaCookie(response: Response): Record<string, unknown> {
  const payload = cookieDeLaRespuesta(response)?.split(".")[0] ?? "";
  return JSON.parse(
    Buffer.from(payload, "base64url").toString("utf8"),
  ) as Record<string, unknown>;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);

  redeemSpaceToken.mockResolvedValue({
    ok: true,
    subscriptionId: "sub_1",
    status: "provisioned",
    statusSinceMs: STATUS_SINCE_MS,
    awsLast4: "4471",
    soporte: { email: "soporte@consensussalutis.com" },
  });
});

describe("un canje que cuela abre el espacio", () => {
  it("redirige con 303 al espacio, no con 302", async () => {
    const response = await POST(postCanje({ token: TOKEN }));

    // `303` convierte el POST en GET: la página del espacio se puede recargar sin
    // volver a canjear, cosa que además fallaría porque el token ya está gastado.
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("deja la cookie firmada, con la suscripción, los cuatro dígitos y el estado", async () => {
    const response = await POST(postCanje({ token: TOKEN }));

    const cookie = cookieDeLaRespuesta(response);
    expect(cookie).not.toBeNull();

    const verified = verifySpaceSession(cookie, { secret: SECRET });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.session.subscriptionId).toBe("sub_1");
    expect(verified.session.awsLast4).toBe("4471");
    expect(verified.session.status).toBe("provisioned");
  });

  /*
    La conversión de milisegundos a segundos, y esta ruta es el ÚNICO sitio donde
    ocurre: Convex cuenta en ms y el sobre firmado en segundos, junto a `iat` y
    `exp`. El campo existe porque sin él la página degradada pintaba el `iat`
    —cuándo se pinchó el enlace— bajo «Activa desde el …».
  */
  it("firma la fecha de transición convertida a segundos, truncando", async () => {
    const response = await POST(postCanje({ token: TOKEN }));

    const verified = verifySpaceSession(cookieDeLaRespuesta(response), {
      secret: SECRET,
    });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.session.statusSinceSeconds).toBe(STATUS_SINCE_SECONDS);
    // Ni los milisegundos en crudo, ni el segundo siguiente por redondear arriba:
    // los dos son errores que un número redondo habría escondido.
    expect(verified.session.statusSinceSeconds).not.toBe(STATUS_SINCE_MS);
    expect(verified.session.statusSinceSeconds).not.toBe(
      STATUS_SINCE_SECONDS + 1,
    );
  });

  it("y no se cuela ninguna marca en milisegundos dentro del sobre", async () => {
    const response = await POST(postCanje({ token: TOKEN }));
    const claims = claimsDeLaCookie(response);

    // Todo lo que hay dentro cuenta en segundos: si algún día entra un `…Ms`,
    // conviviría con `iat` y `exp` y el error de mil veces sería cuestión de
    // tiempo.
    for (const clave of Object.keys(claims)) {
      expect(clave, clave).not.toMatch(/Ms$/);
    }
    expect(Object.values(claims)).not.toContain(STATUS_SINCE_MS);
  });

  it("la cookie es HttpOnly y SameSite=Lax", async () => {
    const response = await POST(postCanje({ token: TOKEN }));
    const header = response.headers.get("set-cookie") ?? "";

    expect(header).toContain("HttpOnly");
    // `Lax` y no `Strict`: es la misma disciplina que las otras dos cookies de
    // esta landing, y `Strict` la mataría en la navegación que sigue al 303.
    expect(header).toContain("SameSite=Lax");
  });

  it("la cuenta de AWS no viaja entera ni en la URL ni en la cookie", async () => {
    // La regla de AWS es literal: solo se confía en los account ids que devuelve
    // AWS o que nuestro sistema ha firmado. Aquí solo hay cuatro dígitos.
    const response = await POST(postCanje({ token: TOKEN }));
    const header = response.headers.get("set-cookie") ?? "";
    const claims = claimsDeLaCookie(response);

    expect(response.headers.get("location")).not.toMatch(/\d{12}/);
    expect(Object.keys(claims)).not.toContain("awsAccountId");
    expect(Object.keys(claims)).not.toContain("licenseArn");
    expect(header).not.toMatch(/\d{12}/);
  });
});

/**
 * El mismo origen, y aquí no es papeleo: es lo que impide la **fijación de
 * sesión**.
 *
 * Sin la comprobación, una página ajena puede hacer `POST` con un token que
 * controla el atacante; el `303` responde con `Set-Cookie`, la cookie es
 * `SameSite=Lax` —así que el navegador la guarda en una navegación de nivel
 * superior— y la víctima acaba con la sesión del espacio de OTRO abierta,
 * creyendo que es la suya.
 *
 * La excepción de `/aws/registration` no aplica: allí el POST lo manda AWS sin
 * `Origin`. El único llamante legítimo de esta ruta es una pantalla nuestra.
 */
describe("un canje de otro origen no canjea ni abre sesión", () => {
  it("de un origen ajeno: 303 al formulario, sin cookie y sin llamar a Convex", async () => {
    const response = await POST(
      postCanje({ token: TOKEN }, { Origin: "https://sitio-ajeno.example" }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO);
    expect(response.headers.get("set-cookie")).toBeNull();
    // Lo importante: el token ni se gasta. Un rechazo que quemara el enlace
    // dejaría a la víctima sin poder entrar con el suyo.
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });

  it("sin cabecera Origin: lo mismo, porque la ausencia no es confianza", async () => {
    // Un formulario nuestro siempre manda `Origin`. Quien no lo manda no puede
    // demostrar su procedencia, y aquí no hay ningún llamante legítimo que no
    // pueda —al revés que en `/aws/registration`, donde el POST es de AWS.
    const response = await POST(
      new Request(URL_CANJE, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "x-forwarded-host": "consensussalutis.com",
        },
        body: new URLSearchParams({ token: TOKEN }),
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });

  it("tampoco vale un Origin de otro host aunque el token sea bueno", async () => {
    const response = await POST(
      postCanje(
        { token: TOKEN },
        { Origin: "https://consensussalutis.com.sitio-ajeno.example" },
      ),
    );

    expect(response.headers.get("set-cookie")).toBeNull();
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });

  it("no revela nada de por qué: la misma pantalla que un cuerpo ilegible", async () => {
    const ajeno = await POST(
      postCanje({ token: TOKEN }, { Origin: "https://sitio-ajeno.example" }),
    );

    expect(ajeno.headers.get("location")).toBe(ESPACIO);
    expect(ajeno.headers.get("location")).not.toContain("origen");
  });
});

/**
 * Lo que se manda a Convex es el HASH, nunca el token.
 *
 * El token es lo que abre un espacio, y con este contrato no aparece en el cuerpo
 * de ninguna petición saliente ni en los logs del deployment. Es un contrato
 * binario con `hashSpaceToken` del monorepo, que calcula la misma cadena.
 */
describe("el token no sale de aquí", () => {
  it("manda el hash HMAC del token, no el token", async () => {
    await POST(postCanje({ token: TOKEN }));

    expect(redeemSpaceToken).toHaveBeenCalledWith({
      tokenHash: hashToken(TOKEN, PEPPER),
    });
  });

  it("el token en claro no aparece en ningún argumento de la llamada", async () => {
    await POST(postCanje({ token: TOKEN }));

    expect(JSON.stringify(redeemSpaceToken.mock.calls)).not.toContain(TOKEN);
  });

  it("tampoco acaba en la URL del 303", async () => {
    const response = await POST(postCanje({ token: TOKEN }));

    expect(response.headers.get("location")).not.toContain(TOKEN);
  });
});

/**
 * Las cuatro causas de rechazo —caducado, ya usado, inexistente y con email que
 * no casa— son una sola pantalla. Contárselas a quien canjea le diría a quien
 * prueba enlaces al azar cuál de ellos existió.
 */
describe("un canje que no cuela", () => {
  it("va al formulario con la marca, y sin abrir ninguna sesión", async () => {
    redeemSpaceToken.mockResolvedValue({ ok: false });

    const response = await POST(postCanje({ token: TOKEN }));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO_NO_VALIDO);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("la marca de la query no dice cuál de las cuatro causas fue", async () => {
    redeemSpaceToken.mockResolvedValue({ ok: false });

    const location =
      (await POST(postCanje({ token: TOKEN }))).headers.get("location") ?? "";

    expect(location).not.toMatch(
      /caducad|expirad|usado|inexistente|correo|email/i,
    );
  });

  for (const [nombre, fields] of [
    ["sin campo token", { otro: "x" }],
    ["con el token vacío", { token: "" }],
    ["con el token en blanco", { token: "   " }],
  ] as const) {
    it(`${nombre}, al formulario y sin llamar a Convex`, async () => {
      const response = await POST(postCanje(fields));

      expect(response.status).toBe(303);
      expect(response.headers.get("location")).toBe(ESPACIO_NO_VALIDO);
      expect(redeemSpaceToken).not.toHaveBeenCalled();
    });
  }

  it("un token absurdamente largo no se canjea", async () => {
    const response = await POST(postCanje({ token: "a".repeat(513) }));

    expect(response.headers.get("location")).toBe(ESPACIO_NO_VALIDO);
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });
});

// Criterio de aceptación §7: el GET del enlace no tiene efectos. Es la ruta a la
// que llegaría un prefetch si alguien pusiera este `href` en un correo por error.
describe("un GET aquí no canjea nada", () => {
  it("redirige al formulario sin tocar el enlace", () => {
    const response = GET(new Request(URL_CANJE));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO);
    expect(response.headers.get("set-cookie")).toBeNull();
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });
});

describe("un cuerpo que no se puede leer", () => {
  it("sale al formulario sin marca: no ha habido enlace que rechazar", async () => {
    // Sin cuerpo, `formData()` lanza. No es un enlace inválido, es una petición
    // que no dice nada, así que la pantalla no acusa a ningún enlace.
    const response = await POST(
      new Request(URL_CANJE, {
        method: "POST",
        headers: {
          Origin: "https://consensussalutis.com",
          "x-forwarded-host": "consensussalutis.com",
        },
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(ESPACIO);
    expect(redeemSpaceToken).not.toHaveBeenCalled();
  });
});

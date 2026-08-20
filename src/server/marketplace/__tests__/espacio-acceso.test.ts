/**
 * `POST /api/espacio/acceso` — el formulario de una línea del espacio de cliente
 * (issue #7 §3).
 *
 * Criterio de aceptación §7, el que manda en este archivo:
 *
 *   Email desconocido y email conocido dan exactamente la misma respuesta.
 *
 * La ruta no puede saber cuál de los dos es —ese dato vive en Convex y no vuelve—
 * así que la garantía se prueba **estructuralmente**: se sustituye
 * `requestSpaceLink` para que en un caso resuelva y en el otro lance, y se
 * comprueba que las dos respuestas son iguales byte a byte. Si algún día alguien
 * añade un `message` distinto en el camino de fallo, este test lo dice.
 *
 * Todo se ejercita contra la ruta REAL, con peticiones de verdad: una prueba que
 * llamara a `validarEmail` por dentro no diría nada sobre lo que contesta el
 * endpoint, que es lo único que ve quien pregunta.
 */

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as ConvexSpaceModule from "~/server/marketplace/convex-space";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const PEPPER = "pimienta-de-pruebas-con-mas-de-32-caracteres";

/*
  El entorno se pone ANTES de importar la ruta: `~/env` lo valida al cargarse, y
  la ruta lee la pimienta para derivar la clave de cliente.
*/
vi.stubEnv("MARKETPLACE_SESSION_SECRET", SECRET);
vi.stubEnv("MARKETPLACE_TOKEN_PEPPER", PEPPER);
vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");

/**
 * La llamada a Convex, sustituida: en CI no hay deployment al que pedir enlaces.
 *
 * Se sustituye **solo esa función** y el resto del módulo se conserva
 * —`importOriginal`—, porque la ruta distingue el límite de tasa por el tipo de
 * error (`SpaceRequestError` con `reason`) y una clase falsa no probaría nada.
 */
const requestSpaceLink =
  vi.fn<(input: { email: string; clientKey: string }) => Promise<void>>();
vi.mock("~/server/marketplace/convex-space", async (importOriginal) => {
  const original = await importOriginal<typeof ConvexSpaceModule>();
  return { ...original, requestSpaceLink };
});

const { POST } = await import("~/app/api/espacio/acceso/route");
const { SpaceRequestError } = await import("~/server/marketplace/convex-space");

const URL_ACCESO = "https://consensussalutis.com/api/espacio/acceso";
const EMAIL = "compras@hospital.example";

/** El POST tal y como lo manda el formulario: JSON, mismo origen. */
function peticion(body: string, headers: Record<string, string> = {}) {
  return new NextRequest(URL_ACCESO, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://consensussalutis.com",
      "x-forwarded-host": "consensussalutis.com",
      ...headers,
    },
    body,
  });
}

const conEmail = (email: string = EMAIL, extra: Record<string, unknown> = {}) =>
  peticion(JSON.stringify({ email, ...extra }));

const conEmailDeOtroOrigen = () =>
  peticion(JSON.stringify({ email: EMAIL }), {
    Origin: "https://sitio-ajeno.example",
  });

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  requestSpaceLink.mockResolvedValue(undefined);
});

// Criterio de aceptación §7: email desconocido y email conocido dan exactamente
// la misma respuesta.
describe("la respuesta es la misma, y por eso el formulario no es un oráculo", () => {
  it("un envío que llega a buen puerto y uno que falla dan la misma respuesta byte a byte", async () => {
    const conSuscripcion = await POST(conEmail());

    // Un fallo del envío solo puede ocurrir cuando hubo algo que enviar: si se
    // contara, sería la única forma de saber desde fuera que este email SÍ tenía
    // suscripción. Así que este camino tiene que salir idéntico al otro.
    requestSpaceLink.mockRejectedValue(new Error("Resend rechazó el envío"));
    const conFallo = await POST(conEmail("otro@hospital.example"));

    expect(conFallo.status).toBe(conSuscripcion.status);
    expect(await conFallo.text()).toBe(await conSuscripcion.text());
  });

  it("las dos son un 200 con ok:true y nada más", async () => {
    const response = await POST(conEmail());

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(JSON.stringify({ ok: true }));
  });

  for (const reason of ["misconfigured", "unavailable"] as const) {
    it(`un fallo ${reason} tampoco se cuenta: sigue siendo 200`, async () => {
      requestSpaceLink.mockRejectedValue(new SpaceRequestError(reason, "vaya"));

      const response = await POST(conEmail());

      expect(response.status).toBe(200);
      expect(await response.text()).toBe(JSON.stringify({ ok: true }));
    });
  }

  // La única respuesta distinta, y se puede: depende de cuánto ha pedido quien
  // pregunta, no de quién es el email.
  it("el límite de tasa sí se cuenta, con un 429", async () => {
    requestSpaceLink.mockRejectedValue(
      new SpaceRequestError("rate-limited", "cinco por hora"),
    );

    const response = await POST(conEmail());

    expect(response.status).toBe(429);
    const body = (await response.json()) as { ok: boolean; message?: string };
    expect(body.ok).toBe(false);
    // Y el mensaje no habla del email, solo de quien pide.
    expect(body.message).not.toMatch(
      /no existe|no encontrad|desconocid|suscripción de ese/i,
    );
  });
});

describe("la puerta de entrada: qué peticiones ni se miran", () => {
  it("de otro origen, 403", async () => {
    // No es CSRF lo que preocupa: es que este formulario manda correo, y si se
    // pudiera disparar desde cualquier página cualquiera montaría un botón que
    // manda correo nuestro al buzón de un tercero.
    const response = await POST(conEmailDeOtroOrigen());

    expect(response.status).toBe(403);
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });

  it("sin cabecera Origin, 403", async () => {
    const response = await POST(
      new NextRequest(URL_ACCESO, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-forwarded-host": "consensussalutis.com",
        },
        body: JSON.stringify({ email: EMAIL }),
      }),
    );

    expect(response.status).toBe(403);
  });

  it("con otro content-type, 415", async () => {
    const response = await POST(
      peticion(JSON.stringify({ email: EMAIL }), {
        "Content-Type": "text/plain",
      }),
    );

    expect(response.status).toBe(415);
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });

  it("un cuerpo desproporcionado, 413", async () => {
    // Un email cabe de sobra en 2 kB. Cualquier cosa mayor no es un formulario
    // de una línea, y leerla entera es trabajo regalado a quien la manda.
    const response = await POST(
      conEmail(`${"a".repeat(2_500)}@hospital.example`),
    );

    expect(response.status).toBe(413);
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });

  it("un content-length desproporcionado se rechaza sin leer el cuerpo", async () => {
    const response = await POST(
      peticion(JSON.stringify({ email: EMAIL }), { "content-length": "50000" }),
    );

    expect(response.status).toBe(413);
  });

  it("un cuerpo que no es JSON, 400", async () => {
    const response = await POST(peticion("{esto no es json"));

    expect(response.status).toBe(400);
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });

  it("un JSON que no es un objeto, 400", async () => {
    const response = await POST(peticion(JSON.stringify("una cadena")));

    expect(response.status).toBe(400);
  });
});

describe("el email", () => {
  for (const malo of [
    "",
    "   ",
    "no-es-un-email",
    "sin@punto",
    "con espacio@hospital.example",
  ]) {
    it(`rechaza ${JSON.stringify(malo)} con el error en el campo`, async () => {
      const response = await POST(conEmail(malo));

      expect(response.status).toBe(400);
      const body = (await response.json()) as {
        ok: boolean;
        fieldErrors?: { email?: string };
      };
      expect(body.ok).toBe(false);
      expect(body.fieldErrors?.email).toBeDefined();
      expect(requestSpaceLink).not.toHaveBeenCalled();
    });
  }

  it("acepta un correo institucional normal y lo manda recortado", async () => {
    await POST(conEmail("  direccion.medica@hospital-universitario.es  "));

    expect(requestSpaceLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "direccion.medica@hospital-universitario.es",
      }),
    );
  });

  /*
    Recorta los espacios —que son un accidente de pegar del buzón— y NO toca nada
    más: ni mayúsculas, ni el dominio.

    Quien normaliza es el receptor, y tiene que ser uno solo: `claimSpaceRequestRow`
    hace `normalizeEmail` antes de leer el índice, y la clave del contador de tasa
    usa su propio `trim().toLowerCase()`. Pasar el email ya en minúsculas desde aquí
    añadiría una segunda implementación de la misma regla —dos sitios que pueden
    divergir— y, peor, ENMASCARARÍA un fallo del receptor: si mañana el índice
    volviera a comparar por igualdad exacta contra un valor guardado en crudo, con
    la landing pre-normalizando el síntoma no aparecería aquí.

    Esta ruta es un tubo transparente, y este test es lo que la mantiene así.
  */
  it("propaga el email tal y como se escribió, sin pasarlo a minúsculas", async () => {
    await POST(conEmail("  Compras.Test@Hospital-Espacio.ES  "));

    expect(requestSpaceLink).toHaveBeenCalledWith(
      expect.objectContaining({ email: "Compras.Test@Hospital-Espacio.ES" }),
    );
  });

  it("y no reescribe el dominio ni le quita puntos", async () => {
    await POST(conEmail("direccion.medica+espacio@hospital.example"));

    expect(requestSpaceLink).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "direccion.medica+espacio@hospital.example",
      }),
    );
  });

  it("un email que no es cadena tampoco pasa", async () => {
    const response = await POST(
      peticion(JSON.stringify({ email: ["a@b.es"] })),
    );

    expect(response.status).toBe(400);
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });
});

describe("la trampa para bots", () => {
  // Rellenado el campo oculto, se contesta como si hubiera funcionado y NO se
  // manda nada: un bot que recibiera un error probaría otra cosa.
  it("con el campo oculto relleno contesta ok y no manda ningún enlace", async () => {
    const response = await POST(
      conEmail(EMAIL, { website: "http://spam.example" }),
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(JSON.stringify({ ok: true }));
    expect(requestSpaceLink).not.toHaveBeenCalled();
  });

  it("el campo oculto vacío es el caso normal y sí manda", async () => {
    await POST(conEmail(EMAIL, { website: "" }));

    expect(requestSpaceLink).toHaveBeenCalledTimes(1);
  });
});

/**
 * La clave de cliente que viaja a Convex.
 *
 * El contador del otro lado tiene que distinguir clientes, no identificarlos: una
 * tabla de direcciones IP en la base de un sistema que trata datos de
 * instituciones sanitarias es un pasivo sin contrapartida.
 */
describe("lo que viaja no es la IP", () => {
  const claveDeLaLlamada = () =>
    requestSpaceLink.mock.calls[0]?.[0].clientKey ?? "";

  it("la clave no contiene la IP ni ninguna dirección decimal", async () => {
    await POST(
      peticion(JSON.stringify({ email: EMAIL }), {
        "x-forwarded-for": "203.0.113.7",
      }),
    );

    const clave = claveDeLaLlamada();
    expect(clave).not.toContain("203.0.113.7");
    expect(clave).not.toMatch(/\d+\.\d+/);
    expect(clave).toHaveLength(32);
  });

  it("distingue clientes: la misma IP da la misma clave y otra IP da otra", async () => {
    await POST(
      peticion(JSON.stringify({ email: EMAIL }), {
        "x-forwarded-for": "203.0.113.7",
      }),
    );
    await POST(
      peticion(JSON.stringify({ email: EMAIL }), {
        "x-forwarded-for": "203.0.113.7",
      }),
    );
    await POST(
      peticion(JSON.stringify({ email: EMAIL }), {
        "x-forwarded-for": "198.51.100.9",
      }),
    );

    const claves = requestSpaceLink.mock.calls.map((call) => call[0].clientKey);
    expect(claves[0]).toBe(claves[1]);
    expect(claves[2]).not.toBe(claves[0]);
  });

  it("sin cabecera de IP no hay clave, y así el contador no agrupa a todos los anónimos", async () => {
    await POST(conEmail());

    // Cadena vacía y no un cubo compartido: agrupar a todos los anónimos sería
    // peor que no contarlos, porque el primero dejaría fuera a los demás.
    expect(claveDeLaLlamada()).toBe("");
  });
});

describe("ninguna respuesta de esta ruta se puede cachear", () => {
  it("todas llevan Cache-Control: no-store", async () => {
    const respuestas = [
      await POST(conEmail()),
      await POST(conEmail("no-es-un-email")),
      await POST(conEmailDeOtroOrigen()),
      await POST(peticion("{no json")),
      await POST(conEmail(EMAIL, { website: "bot" })),
    ];

    for (const response of respuestas) {
      expect(response.headers.get("cache-control")).toBe("no-store");
    }
  });
});

/**
 * La tercera cookie firmada de esta landing (issue #7 §3): `cs_space_session`.
 *
 * Mismo sobre que las otras dos —`signed-payload.ts`, un solo implementador de
 * la firma— así que lo que hay que fijar aquí no es el formato, que ya está
 * probado en `session.test.ts`, sino **los claims que esta cookie exige**: son
 * los que la hacen distinta de las otras dos y los que justifican que haya tres
 * y no una.
 *
 * Criterios de aceptación §7 que se cierran aquí:
 *
 *   La sesión del espacio dura más que el enlace, y una cookie manipulada,
 *   caducada o de otro sujeto no abre el espacio.
 */

import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  SESSION_COOKIE_NAME,
  signSession,
  verifySession,
} from "~/server/marketplace/session";
import {
  SPACE_COOKIE_NAME,
  SPACE_TTL_SECONDS,
  signSpaceSession,
  spaceCookieOptions,
  verifySpaceSession,
} from "~/server/marketplace/space-session";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const OTHER_SECRET = "otro-secreto-de-pruebas-con-mas-de-32-caracteres";
const NOW = 1_760_000_000;

/**
 * La transición es ANTERIOR al canje, y por eso no coincide con `iat`.
 *
 * Que sean valores distintos es lo que hace que el test sirva: con el mismo
 * número, una regresión que volviera a pintar el `iat` pasaría desapercibida.
 */
const STATUS_SINCE = NOW - 60 * 60 * 24 * 3;

const CLAIMS = {
  subscriptionId: "sub_espacio_1",
  awsLast4: "4471",
  status: "licensed",
  statusSinceSeconds: STATUS_SINCE,
} as const;

function tamperOneByteOfPayload(cookie: string) {
  const [payload, signature] = cookie.split(".") as [string, string];
  const decoded = Buffer.from(payload, "base64url");

  // Se altera un byte del payload y se vuelve a codificar, dejando la firma
  // original intacta: es exactamente lo que haría quien edite la cookie a mano.
  const index = decoded.length - 2;
  decoded.writeUInt8(decoded.readUInt8(index) ^ 0x01, index);

  return `${decoded.toString("base64url")}.${signature}`;
}

/** Firma un JSON escrito a mano. La firma sale bien; el contenido es el sujeto. */
function sobreFirmadoCrudo(json: string, secret = SECRET) {
  const payload = Buffer.from(json, "utf8").toString("base64url");
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Un sobre firmado **de verdad** con los claims que se le pidan.
 *
 * Hace falta para probar los claims que faltan: firmar mal no diría nada —lo
 * rechazaría la firma antes de mirar el contenido— y lo que se quiere ver es que
 * un payload nuestro, con la firma correcta, se rechaza igual si no trae los
 * cuatro campos.
 */
function sobreFirmado(claims: Record<string, unknown>, secret = SECRET) {
  return sobreFirmadoCrudo(
    JSON.stringify({ iat: NOW, exp: NOW + 600, ...claims }),
    secret,
  );
}

describe("cookie de sesión del espacio de cliente", () => {
  it("firma y verifica los cuatro claims de una suscripción", () => {
    const cookie = signSpaceSession(CLAIMS, { secret: SECRET, now: NOW });
    const result = verifySpaceSession(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.subscriptionId).toBe("sub_espacio_1");
    expect(result.session.awsLast4).toBe("4471");
    expect(result.session.status).toBe("licensed");
    expect(result.session.iat).toBe(NOW);
    expect(result.session.exp).toBe(NOW + SPACE_TTL_SECONDS);
  });

  /*
    `statusSinceSeconds` va en la cookie porque sin él la página degradada
    MENTÍA: la única fecha a mano era el `iat` —cuándo se pinchó el enlace— y se
    pintaba bajo «Activa desde el …». Este test es el que fija que se conserva y
    que NO es el `iat`.
  */
  it("conserva la fecha de la transición, distinta del momento del canje", () => {
    const cookie = signSpaceSession(CLAIMS, { secret: SECRET, now: NOW });
    const result = verifySpaceSession(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.statusSinceSeconds).toBe(STATUS_SINCE);
    expect(result.session.statusSinceSeconds).not.toBe(result.session.iat);
  });

  it("la fecha de la transición va en SEGUNDOS, como iat y exp", () => {
    const cookie = signSpaceSession(CLAIMS, { secret: SECRET, now: NOW });
    const result = verifySpaceSession(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // Dos unidades en el mismo objeto es donde aparece un error de mil veces: si
    // alguien metiera milisegundos aquí, el orden de magnitud lo delata.
    expect(result.session.statusSinceSeconds).toBeLessThan(result.session.exp);
    expect(String(result.session.statusSinceSeconds)).toHaveLength(
      String(result.session.iat).length,
    );
  });

  /*
    Los cuatro son obligatorios, y el motivo está en la cabecera del módulo: una
    cookie del espacio a la que le falte cualquiera de ellos solo puede venir de
    un formato anterior o de alguien probando, y en los dos casos la respuesta
    correcta es la misma que para una caducada —el formulario de acceso, que
    cuesta un clic— y no un espacio pintado a medias.
  */
  for (const ausente of [
    "subscriptionId",
    "awsLast4",
    "status",
    "statusSinceSeconds",
  ] as const) {
    it(`rechaza un payload firmado sin ${ausente}`, () => {
      const claims: Record<string, unknown> = { ...CLAIMS };
      delete claims[ausente];

      const result = verifySpaceSession(sobreFirmado(claims), {
        secret: SECRET,
        now: NOW,
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.reason).toBe("malformed");
    });
  }

  it("rechaza una fecha de transición que llega como cadena", () => {
    // El caso realista: alguien serializa la fecha por el camino. Un `"1760…"`
    // multiplicado por mil da `NaN`, y `new Date(NaN)` pinta «Invalid Date».
    const result = verifySpaceSession(
      sobreFirmado({ ...CLAIMS, statusSinceSeconds: String(STATUS_SINCE) }),
      { secret: SECRET, now: NOW },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  it("rechaza una fecha de transición no finita", () => {
    // `Infinity` y `NaN` no sobreviven a `JSON.stringify`, así que el payload se
    // escribe a mano: `1e999` es JSON válido y `JSON.parse` lo convierte en
    // `Infinity`. Es la única forma de llegar de verdad al `Number.isFinite`.
    const result = verifySpaceSession(
      sobreFirmadoCrudo(
        `{"subscriptionId":"sub_espacio_1","awsLast4":"4471","status":"licensed","statusSinceSeconds":1e999,"iat":${NOW},"exp":${NOW + 600}}`,
      ),
      { secret: SECRET, now: NOW },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  it("rechaza un status que no es uno de los cuatro estados", () => {
    // `cancelled` es un estado plausible que este sistema no tiene. Aceptarlo
    // dejaría a `ESTADO_COPY[estado]` en `undefined` y a la vista sin copy.
    const result = verifySpaceSession(
      sobreFirmado({ ...CLAIMS, status: "cancelled" }),
      { secret: SECRET, now: NOW },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  // Criterio de aceptación §7: alterar un byte del payload y comprobar el rechazo.
  it("rechaza una cookie con un byte del payload alterado", () => {
    const cookie = signSpaceSession(CLAIMS, { secret: SECRET, now: NOW });
    const tampered = tamperOneByteOfPayload(cookie);

    expect(tampered).not.toBe(cookie);

    const result = verifySpaceSession(tampered, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie firmada con otro secreto", () => {
    const cookie = signSpaceSession(CLAIMS, { secret: OTHER_SECRET, now: NOW });
    const result = verifySpaceSession(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie justo en el segundo de expiración", () => {
    // El sobre compara `exp <= now`, así que el propio segundo de `exp` ya está
    // caducado. Fijarlo importa: es la frontera, y es donde se equivoca quien
    // reescriba la comparación.
    const cookie = signSpaceSession(CLAIMS, {
      secret: SECRET,
      ttlSeconds: 60,
      now: NOW,
    });

    expect(
      verifySpaceSession(cookie, { secret: SECRET, now: NOW + 59 }).ok,
    ).toBe(true);

    const result = verifySpaceSession(cookie, {
      secret: SECRET,
      now: NOW + 60,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("rechaza cookies ausentes o con formato imposible", () => {
    for (const value of [undefined, null, "", "sin-punto"]) {
      expect(verifySpaceSession(value, { secret: SECRET, now: NOW }).ok).toBe(
        false,
      );
    }
  });

  it("dura siete días: la sesión sobrevive al enlace de 30 minutos", () => {
    expect(SPACE_TTL_SECONDS).toBe(60 * 60 * 24 * 7);
  });

  it("usa SameSite=Lax, HttpOnly y Secure en producción", () => {
    const options = spaceCookieOptions({ secure: true });

    expect(options.name).toBe(SPACE_COOKIE_NAME);
    expect(options.name).toBe("cs_space_session");
    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(SPACE_TTL_SECONDS);
  });
});

/**
 * La razón de que haya TRES cookies y no una.
 *
 * Las tres comparten el sobre y el secreto, así que la firma de una vale para la
 * otra: lo único que las separa son los claims que cada una exige. Si alguien
 * relajara esa exigencia —haciendo opcionales los campos para «reutilizar» una
 * cookie— la sesión de la entrevista abriría el espacio de cliente, y al revés.
 * Estos dos tests son ese muro.
 */
describe("cada cookie firmada abre solo su propia puerta", () => {
  it("son cookies con nombres distintos", () => {
    expect(SPACE_COOKIE_NAME).not.toBe(SESSION_COOKIE_NAME);
  });

  it("la cookie de la evaluación NO abre el espacio", () => {
    // Firmada por nosotros y sin caducar: la firma pasa. Lo que no trae es
    // `subscriptionId`, y hay suscripciones que llegan a `licensed` sin que
    // nadie haya hecho la entrevista.
    const evaluacion = signSession(
      { assessmentId: "assess_1" },
      { secret: SECRET, now: NOW },
    );

    const result = verifySpaceSession(evaluacion, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  it("la cookie del espacio NO abre la evaluación", () => {
    const espacio = signSpaceSession(CLAIMS, { secret: SECRET, now: NOW });

    const result = verifySession(espacio, { secret: SECRET, now: NOW + 10 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });
});

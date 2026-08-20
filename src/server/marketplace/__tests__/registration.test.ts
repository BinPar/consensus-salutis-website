/**
 * La cookie de procedencia de AWS y su cruce con el badge del informe.
 *
 * Mismo trato que la cookie de sesión en `session.test.ts`: se altera un byte y
 * tiene que rechazarse, porque es la cookie donde vive el `awsAccountId` y la
 * única razón por la que AWS permite que ese dato esté en el navegador es que la
 * hemos firmado nosotros.
 */

import { describe, expect, it, vi } from "vitest";

// `report-read` lee el entorno al cargarse, y aquí no se consulta ningún
// informe: solo se usa `awsBadgeDigits`, que es una función pura.
vi.mock("~/env", () => ({
  env: { NEXT_PUBLIC_CONVEX_SITE_URL: "https://deployment.convex.site" },
}));

import { awsBadgeDigits } from "~/server/marketplace/report-read";
import {
  REGISTRATION_COOKIE_NAME,
  registrationCookieOptions,
  signRegistration,
  verifyRegistration,
} from "~/server/marketplace/registration";
import { signSession, verifySession } from "~/server/marketplace/session";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const OTHER_SECRET = "otro-secreto-de-pruebas-con-mas-de-32-caracteres";
const NOW = 1_760_000_000;

const CLAIMS = {
  subscriptionId: "sub_1",
  awsAccountId: "123456789012",
  licenseArn: "arn:aws:license-manager:us-east-1:123456789012:license/l-1",
};

function tamperOneByteOfPayload(cookie: string) {
  const [payload, signature] = cookie.split(".") as [string, string];
  const decoded = Buffer.from(payload, "base64url");
  const index = decoded.length - 2;
  decoded.writeUInt8(decoded.readUInt8(index) ^ 0x01, index);

  return `${decoded.toString("base64url")}.${signature}`;
}

describe("cookie de procedencia de AWS", () => {
  it("firma y verifica los tres campos", () => {
    const cookie = signRegistration(CLAIMS, { secret: SECRET, now: NOW });
    const result = verifyRegistration(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.registration.subscriptionId).toBe("sub_1");
    expect(result.registration.awsAccountId).toBe("123456789012");
    expect(result.registration.licenseArn).toBe(CLAIMS.licenseArn);
  });

  it("rechaza una cookie con un byte alterado", () => {
    const cookie = signRegistration(CLAIMS, { secret: SECRET, now: NOW });
    const result = verifyRegistration(tamperOneByteOfPayload(cookie), {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie firmada con otro secreto", () => {
    const cookie = signRegistration(CLAIMS, { secret: OTHER_SECRET, now: NOW });
    const result = verifyRegistration(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie caducada", () => {
    const cookie = signRegistration(CLAIMS, {
      secret: SECRET,
      ttlSeconds: 60,
      now: NOW,
    });
    const result = verifyRegistration(cookie, {
      secret: SECRET,
      now: NOW + 61,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("no acepta una procedencia a medias", () => {
    // Firmada por nosotros pero sin `awsAccountId`: no es una procedencia, y
    // dejarla pasar significaría enseñar el badge sin cuenta detrás.
    const cookie = signRegistration(
      { ...CLAIMS, awsAccountId: "" },
      { secret: SECRET, now: NOW },
    );
    const result = verifyRegistration(cookie, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  it("sin cookie no hay procedencia, y eso no es un error", () => {
    // El caso mayoritario: tráfico público. El evaluador funciona sin AWS.
    const result = verifyRegistration(undefined, { secret: SECRET });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("missing");
  });

  it("es HttpOnly y SameSite=Lax, como la de sesión", () => {
    const options = registrationCookieOptions();

    expect(options.name).toBe(REGISTRATION_COOKIE_NAME);
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
  });

  it("no es la misma cookie que la de sesión", () => {
    // Son dos identidades y dos vidas distintas: la procedencia sobrevive a que
    // caduque la sesión de la entrevista.
    expect(REGISTRATION_COOKIE_NAME).not.toBe("cs_eval_session");
  });
});

describe("badge del informe con la procedencia", () => {
  const ASSESSMENT = "assess_1";

  /** La sesión que firma Convex al arrancar la Etapa 0: sin `awsAccountId`. */
  const sesionDeConvex = () =>
    verifySession(
      signSession(
        { assessmentId: ASSESSMENT, subscriptionId: "sub_1" },
        { secret: SECRET, now: NOW },
      ),
      { secret: SECRET, now: NOW + 10 },
    );

  const procedencia = (claims = CLAIMS) =>
    verifyRegistration(signRegistration(claims, { secret: SECRET, now: NOW }), {
      secret: SECRET,
      now: NOW + 10,
    });

  it("saca los dígitos de la procedencia cuando la sesión no los lleva", () => {
    const digits = awsBadgeDigits(sesionDeConvex(), ASSESSMENT, procedencia());

    expect(digits).toBe("9012");
  });

  it("no enseña el badge sin procedencia", () => {
    // Una evaluación directa tiene sesión pero no suscripción.
    expect(awsBadgeDigits(sesionDeConvex(), ASSESSMENT)).toBeNull();
  });

  it("no enseña el badge si las dos cookies hablan de suscripciones distintas", () => {
    /*
      El caso que importa: alguien con su propia suscripción abre el informe que
      le reenviaron. Su cookie de procedencia es válida y suya, pero no es de
      esta evaluación.
    */
    const otra = procedencia({ ...CLAIMS, subscriptionId: "sub_2" });

    expect(awsBadgeDigits(sesionDeConvex(), ASSESSMENT, otra)).toBeNull();
  });

  it("no enseña el badge en el informe de otra evaluación", () => {
    expect(
      awsBadgeDigits(sesionDeConvex(), "assess_2", procedencia()),
    ).toBeNull();
  });

  it("no se fía de una procedencia con la firma tocada", () => {
    const tocada = verifyRegistration(
      tamperOneByteOfPayload(
        signRegistration(CLAIMS, { secret: SECRET, now: NOW }),
      ),
      { secret: SECRET, now: NOW + 10 },
    );

    expect(awsBadgeDigits(sesionDeConvex(), ASSESSMENT, tocada)).toBeNull();
  });

  it("la sesión manda cuando lleva la cuenta dentro", () => {
    // Camino de compatibilidad: si algún día Convex firma el `awsAccountId` en
    // la sesión, no hace falta la segunda cookie.
    const conCuenta = verifySession(
      signSession(
        { assessmentId: ASSESSMENT, awsAccountId: "210987654321" },
        { secret: SECRET, now: NOW },
      ),
      { secret: SECRET, now: NOW + 10 },
    );

    expect(awsBadgeDigits(conCuenta, ASSESSMENT)).toBe("4321");
  });
});

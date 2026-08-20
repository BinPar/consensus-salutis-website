import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "~/server/marketplace/session";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const OTHER_SECRET = "otro-secreto-de-pruebas-con-mas-de-32-caracteres";
const NOW = 1_760_000_000;

function tamperOneByteOfPayload(cookie: string) {
  const [payload, signature] = cookie.split(".") as [string, string];
  const decoded = Buffer.from(payload, "base64url");

  // Se altera un byte del payload y se vuelve a codificar, dejando la firma
  // original intacta: es exactamente lo que haría quien edite la cookie a mano.
  const index = decoded.length - 2;
  decoded.writeUInt8(decoded.readUInt8(index) ^ 0x01, index);

  return `${decoded.toString("base64url")}.${signature}`;
}

describe("cookie de sesión de registro", () => {
  it("firma y verifica una sesión con solo assessmentId", () => {
    const cookie = signSession(
      { assessmentId: "assess_1" },
      { secret: SECRET, now: NOW },
    );
    const result = verifySession(cookie, { secret: SECRET, now: NOW + 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.assessmentId).toBe("assess_1");
    expect(result.session.subscriptionId).toBeUndefined();
    expect(result.session.awsAccountId).toBeUndefined();
  });

  it("conserva los campos de AWS cuando la evaluación viene de una suscripción", () => {
    const cookie = signSession(
      {
        assessmentId: "assess_2",
        subscriptionId: "sub_1",
        awsAccountId: "123456789012",
        licenseArn: "arn:aws:license-manager:eu-west-1:1:license/l-1",
      },
      { secret: SECRET, now: NOW },
    );
    const result = verifySession(cookie, { secret: SECRET, now: NOW + 10 });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.session.awsAccountId).toBe("123456789012");
    expect(result.session.licenseArn).toContain("arn:aws:license-manager");
  });

  // Criterio de aceptación §6: alterar un byte del payload y comprobar el rechazo.
  it("rechaza una cookie con un byte del payload alterado", () => {
    const cookie = signSession(
      { assessmentId: "assess_3" },
      { secret: SECRET, now: NOW },
    );
    const tampered = tamperOneByteOfPayload(cookie);

    expect(tampered).not.toBe(cookie);

    const result = verifySession(tampered, { secret: SECRET, now: NOW + 10 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie con la firma alterada", () => {
    const cookie = signSession(
      { assessmentId: "assess_4" },
      { secret: SECRET, now: NOW },
    );
    const [payload, signature] = cookie.split(".") as [string, string];
    const flipped =
      signature.slice(0, -1) + (signature.endsWith("A") ? "B" : "A");

    const result = verifySession(`${payload}.${flipped}`, {
      secret: SECRET,
      now: NOW + 10,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  it("rechaza una cookie firmada con otro secreto", () => {
    const cookie = signSession(
      { assessmentId: "assess_5" },
      { secret: OTHER_SECRET, now: NOW },
    );
    const result = verifySession(cookie, { secret: SECRET, now: NOW + 10 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("bad-signature");
  });

  // Criterio de aceptación §6: una cookie expirada se rechaza.
  it("rechaza una cookie expirada", () => {
    const cookie = signSession(
      { assessmentId: "assess_6" },
      { secret: SECRET, ttlSeconds: 60, now: NOW },
    );

    expect(verifySession(cookie, { secret: SECRET, now: NOW + 59 }).ok).toBe(
      true,
    );

    const result = verifySession(cookie, { secret: SECRET, now: NOW + 61 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("rechaza una cookie justo en el segundo de expiración", () => {
    const cookie = signSession(
      { assessmentId: "assess_7" },
      { secret: SECRET, ttlSeconds: 60, now: NOW },
    );
    const result = verifySession(cookie, { secret: SECRET, now: NOW + 60 });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("rechaza cookies ausentes o con formato imposible", () => {
    for (const value of [undefined, null, "", "sin-punto", "solo-payload."]) {
      expect(verifySession(value, { secret: SECRET, now: NOW }).ok).toBe(false);
    }
  });

  it("rechaza un payload firmado que no lleva assessmentId", () => {
    // Firmado correctamente pero sin el único campo obligatorio: la firma pasa y
    // aun así la sesión no vale.
    const payload = Buffer.from(
      JSON.stringify({ iat: NOW, exp: NOW + 600 }),
      "utf8",
    ).toString("base64url");
    const signature = createHmac("sha256", SECRET)
      .update(payload)
      .digest("base64url");

    const result = verifySession(`${payload}.${signature}`, {
      secret: SECRET,
      now: NOW,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("malformed");
  });

  it("usa SameSite=Lax, HttpOnly y Secure en producción", () => {
    const options = sessionCookieOptions({ secure: true });

    expect(options.name).toBe(SESSION_COOKIE_NAME);
    expect(options.httpOnly).toBe(true);
    expect(options.secure).toBe(true);
    // Lax y no Strict: la cookie se escribe en el 303 que sigue al POST
    // cross-origin de AWS, y Strict la mataría en ese caso exacto.
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
  });
});

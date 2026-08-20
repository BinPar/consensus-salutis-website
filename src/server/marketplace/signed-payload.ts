/**
 * El sobre firmado que usan las cookies de esta landing.
 *
 * Formato: `<claims en base64url>.<HMAC-SHA256 en base64url>`, con `iat` y `exp`
 * dentro de los claims. Es el mismo que firma Convex en
 * `marketplace/session.ts` del monorepo para la sesión de la entrevista, y por
 * eso `verifySession` puede verificar una cookie que esta landing no firmó.
 *
 * Vive aparte de `session.ts` porque hay **dos** cookies con este formato y una
 * sola implementación de él:
 *
 * - `session.ts` — la sesión de la evaluación, `{ assessmentId, … }`.
 * - `registration.ts` — la procedencia de AWS, `{ subscriptionId, awsAccountId,
 *   licenseArn }`, que se firma antes de que exista evaluación alguna.
 *
 * Con dos implementadores del formato, el día que uno cambie un campo el otro
 * sigue firmando lo de antes y el fallo aparece como un 401 sin causa aparente.
 */

import { createHmac } from "node:crypto";

import { constantTimeEquals } from "~/server/marketplace/constant-time";

/** Lo que se puede meter en un sobre: escalares, nada anidado. */
export type EnvelopeClaims = Record<string, string | number>;

/** Motivo por el que un sobre no se acepta. Útil para tests y trazas. */
export type EnvelopeFailureReason =
  | "missing"
  | "malformed"
  | "bad-signature"
  | "expired";

export type OpenedEnvelope =
  | { ok: true; claims: Record<string, unknown> & { iat: number; exp: number } }
  | { ok: false; reason: EnvelopeFailureReason };

function base64url(input: Buffer) {
  return input.toString("base64url");
}

function sign(payload: string, secret: string) {
  return base64url(createHmac("sha256", secret).update(payload).digest());
}

export function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

/** Firma los claims con `iat`/`exp` dentro y devuelve el valor de la cookie. */
export function signEnvelope(
  claims: EnvelopeClaims,
  options: { secret: string; ttlSeconds: number; now?: number },
): string {
  const issuedAt = options.now ?? nowInSeconds();
  const payload = base64url(
    Buffer.from(
      JSON.stringify({
        ...claims,
        iat: issuedAt,
        exp: issuedAt + options.ttlSeconds,
      }),
      "utf8",
    ),
  );

  return `${payload}.${sign(payload, options.secret)}`;
}

/**
 * Verifica firma y expiración, y devuelve los claims en crudo.
 *
 * La firma se comprueba **antes** de interpretar el payload: nada de lo que
 * venga del cliente se trata como dato hasta que se sabe que lo firmamos
 * nosotros. Darles tipo a los claims es cosa de quien llama.
 */
export function openEnvelope(
  cookieValue: string | undefined | null,
  options: { secret: string; now?: number },
): OpenedEnvelope {
  if (!cookieValue) return { ok: false, reason: "missing" };

  const separator = cookieValue.lastIndexOf(".");
  if (separator <= 0 || separator === cookieValue.length - 1) {
    return { ok: false, reason: "malformed" };
  }

  const payload = cookieValue.slice(0, separator);
  const signature = cookieValue.slice(separator + 1);

  if (!constantTimeEquals(sign(payload, options.secret), signature)) {
    return { ok: false, reason: "bad-signature" };
  }

  let decoded: unknown;
  try {
    decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as unknown;
  } catch {
    return { ok: false, reason: "malformed" };
  }

  if (typeof decoded !== "object" || decoded === null) {
    return { ok: false, reason: "malformed" };
  }

  const claims = decoded as Record<string, unknown>;
  const { iat, exp } = claims;

  if (typeof iat !== "number" || !Number.isFinite(iat)) {
    return { ok: false, reason: "malformed" };
  }
  if (typeof exp !== "number" || !Number.isFinite(exp)) {
    return { ok: false, reason: "malformed" };
  }

  if (exp <= (options.now ?? nowInSeconds())) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, claims: { ...claims, iat, exp } };
}

/**
 * Atributos comunes de las cookies firmadas de esta landing.
 *
 * `SameSite=Lax` y no `Strict` — deliberado: las dos se escriben en el `303` que
 * sigue al POST de otro origen que manda AWS, y `Strict` las mataría justo en el
 * caso que importa. `Secure` se relaja solo fuera de producción para que
 * `http://localhost` funcione.
 */
export function signedCookieOptions(options: {
  name: string;
  ttlSeconds: number;
  secure?: boolean;
}) {
  return {
    name: options.name,
    httpOnly: true,
    secure: options.secure ?? process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: options.ttlSeconds,
  };
}

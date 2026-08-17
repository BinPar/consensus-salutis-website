/**
 * Sesión de registro del evaluador de idoneidad.
 *
 * Ata un navegador a su evaluación en curso. Es una de las tres identidades del
 * sistema y no se cruza con las otras dos: el espacio de cliente (tokens de un
 * solo uso, `one-time-tokens.ts`) y la plataforma (Clerk, en `apps/chat` del
 * monorepo). Aquí no hay Clerk a propósito: esta landing no tiene middleware, y
 * eso es exactamente lo que la hace segura frente al POST sin autenticar de AWS.
 *
 * La regla que AWS pone por escrito:
 *
 *   Trust only AWS account IDs that are immediately returned from AWS or those
 *   that your system has signed.
 *
 * Por eso `awsAccountId` viaja siempre dentro de esta cookie firmada, y nunca
 * como campo de formulario, parámetro de URL ni valor en almacenamiento del
 * cliente.
 */

import { createHmac } from "node:crypto";

import { constantTimeEquals } from "~/server/marketplace/constant-time";

/** Nombre de la cookie de sesión de registro. */
export const SESSION_COOKIE_NAME = "cs_eval_session";

/** Duración por defecto de la sesión: suficiente para completar la entrevista. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * Contenido de la sesión. `assessmentId` es el único campo obligatorio: el
 * evaluador es público y se construye antes que la integración con AWS, así que
 * hay sesiones sin suscripción detrás. Los tres campos de AWS solo están
 * presentes cuando la evaluación llegó por una suscripción de Marketplace.
 */
export type SessionClaims = {
  assessmentId: string;
  subscriptionId?: string;
  awsAccountId?: string;
  licenseArn?: string;
};

/** Sesión ya verificada, con los tiempos que venían firmados. */
export type VerifiedSession = SessionClaims & {
  /** Emitida en, en segundos desde epoch. */
  iat: number;
  /** Expira en, en segundos desde epoch. */
  exp: number;
};

/** Motivo por el que una cookie no se acepta. Útil para tests y trazas. */
export type SessionFailureReason =
  | "missing"
  | "malformed"
  | "bad-signature"
  | "expired";

export type SessionVerification =
  | { ok: true; session: VerifiedSession }
  | { ok: false; reason: SessionFailureReason };

function base64url(input: Buffer) {
  return input.toString("base64url");
}

function sign(payload: string, secret: string) {
  return base64url(createHmac("sha256", secret).update(payload).digest());
}

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Firma una sesión y devuelve el valor de la cookie.
 *
 * Formato: `<payload en base64url>.<HMAC-SHA256 en base64url>`.
 */
export function signSession(
  claims: SessionClaims,
  options: { secret: string; ttlSeconds?: number; now?: number },
): string {
  const issuedAt = options.now ?? nowInSeconds();
  const ttl = options.ttlSeconds ?? SESSION_TTL_SECONDS;

  // Se serializan solo los campos presentes: una sesión sin AWS detrás no
  // arrastra tres `null` por el mero hecho de existir.
  const claimed: Record<string, string | number> = {
    assessmentId: claims.assessmentId,
    iat: issuedAt,
    exp: issuedAt + ttl,
  };
  if (claims.subscriptionId) claimed.subscriptionId = claims.subscriptionId;
  if (claims.awsAccountId) claimed.awsAccountId = claims.awsAccountId;
  if (claims.licenseArn) claimed.licenseArn = claims.licenseArn;

  const payload = base64url(Buffer.from(JSON.stringify(claimed), "utf8"));

  return `${payload}.${sign(payload, options.secret)}`;
}

function parseClaims(raw: string): VerifiedSession | null {
  let decoded: unknown;
  try {
    decoded = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8"),
    ) as unknown;
  } catch {
    return null;
  }

  if (typeof decoded !== "object" || decoded === null) return null;

  const candidate = decoded as Record<string, unknown>;
  const { assessmentId, iat, exp } = candidate;

  if (typeof assessmentId !== "string" || assessmentId.length === 0) {
    return null;
  }
  if (typeof iat !== "number" || !Number.isFinite(iat)) return null;
  if (typeof exp !== "number" || !Number.isFinite(exp)) return null;

  const session: VerifiedSession = { assessmentId, iat, exp };

  for (const field of ["subscriptionId", "awsAccountId", "licenseArn"] as const) {
    const value = candidate[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length === 0) return null;
    session[field] = value;
  }

  return session;
}

/**
 * Verifica firma y expiración de una cookie de sesión.
 *
 * La firma se comprueba **antes** de interpretar el payload: nada de lo que
 * venga del cliente se trata como dato hasta que se sabe que lo firmamos
 * nosotros.
 */
export function verifySession(
  cookieValue: string | undefined | null,
  options: { secret: string; now?: number },
): SessionVerification {
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

  const session = parseClaims(payload);
  if (!session) return { ok: false, reason: "malformed" };

  if (session.exp <= (options.now ?? nowInSeconds())) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, session };
}

/**
 * Atributos de la cookie de sesión.
 *
 * `SameSite=Lax` y no `Strict` — deliberado: la cookie se escribe en el `303`
 * que sigue al POST de otro origen que manda AWS, y `Strict` la mataría justo en
 * el caso que importa. `Secure` se relaja solo fuera de producción para que
 * `http://localhost` funcione.
 */
export function sessionCookieOptions(options?: {
  ttlSeconds?: number;
  secure?: boolean;
}) {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: options?.secure ?? process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: options?.ttlSeconds ?? SESSION_TTL_SECONDS,
  };
}

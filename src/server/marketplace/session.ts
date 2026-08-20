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
 * Por eso `awsAccountId` viaja siempre dentro de una cookie firmada, y nunca
 * como campo de formulario, parámetro de URL ni valor en almacenamiento del
 * cliente. En esta cookie cuando la evaluación ya existe; en la de
 * `registration.ts` durante el hueco entre el POST de AWS y la Etapa 0.
 *
 * El formato del sobre —firma, `iat`/`exp`, atributos de la cookie— vive en
 * `signed-payload.ts`, que es el único implementador de este lado. Aquí solo se
 * le da tipo a los claims.
 */

import {
  openEnvelope,
  signEnvelope,
  signedCookieOptions,
} from "~/server/marketplace/signed-payload";

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

/**
 * Firma una sesión y devuelve el valor de la cookie.
 *
 * Formato: `<payload en base64url>.<HMAC-SHA256 en base64url>`.
 */
export function signSession(
  claims: SessionClaims,
  options: { secret: string; ttlSeconds?: number; now?: number },
): string {
  // Se serializan solo los campos presentes: una sesión sin AWS detrás no
  // arrastra tres `null` por el mero hecho de existir.
  const claimed: Record<string, string> = { assessmentId: claims.assessmentId };
  if (claims.subscriptionId) claimed.subscriptionId = claims.subscriptionId;
  if (claims.awsAccountId) claimed.awsAccountId = claims.awsAccountId;
  if (claims.licenseArn) claimed.licenseArn = claims.licenseArn;

  return signEnvelope(claimed, {
    secret: options.secret,
    ttlSeconds: options.ttlSeconds ?? SESSION_TTL_SECONDS,
    ...(options.now !== undefined && { now: options.now }),
  });
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
  const opened = openEnvelope(cookieValue, options);
  if (!opened.ok) return { ok: false, reason: opened.reason };

  const { assessmentId, iat, exp } = opened.claims;
  if (typeof assessmentId !== "string" || assessmentId.length === 0) {
    return { ok: false, reason: "malformed" };
  }

  const session: VerifiedSession = { assessmentId, iat, exp };

  for (const field of [
    "subscriptionId",
    "awsAccountId",
    "licenseArn",
  ] as const) {
    const value = opened.claims[field];
    if (value === undefined) continue;
    if (typeof value !== "string" || value.length === 0) {
      return { ok: false, reason: "malformed" };
    }
    session[field] = value;
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
  return signedCookieOptions({
    name: SESSION_COOKIE_NAME,
    ttlSeconds: options?.ttlSeconds ?? SESSION_TTL_SECONDS,
    ...(options?.secure !== undefined && { secure: options.secure }),
  });
}

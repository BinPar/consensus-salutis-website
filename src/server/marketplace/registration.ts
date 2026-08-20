/**
 * Cookie de procedencia de AWS Marketplace.
 *
 * ## Por qué hace falta una segunda cookie
 *
 * El POST de AWS llega **antes de que exista evaluación alguna**: quien viene de
 * Marketplace aún no ha rellenado la Etapa 0. La cookie de sesión
 * (`session.ts`) no sirve para esto porque su único campo obligatorio es
 * `assessmentId`, que en ese instante todavía no existe.
 *
 * Así que la ruta de registro firma esto en su lugar. Es lo que hace que, cuando
 * esa persona envíe la Etapa 0 minutos después, `/api/evaluador` sepa que la
 * evaluación pertenece a una suscripción y se la pase a Convex — que es la única
 * diferencia entre llegar por AWS y llegar por la web pública.
 *
 * ## Qué lleva dentro, y por qué firmada
 *
 *   Trust only AWS account IDs that are immediately returned from AWS or those
 *   that your system has signed.
 *
 * `awsAccountId` está aquí porque es el sitio donde AWS permite que esté: dentro
 * de algo que hemos firmado nosotros. La alternativa —un `?account=` en la URL
 * del `303`, o un campo oculto en el formulario de la Etapa 0— es exactamente lo
 * que la regla prohíbe, y lo que vigila `no-aws-account-id-leak.test.ts`.
 *
 * Es `HttpOnly`: ningún script del navegador la lee, y su contenido no llega al
 * cliente ni siquiera a través de la página.
 */

import {
  openEnvelope,
  signEnvelope,
  signedCookieOptions,
} from "~/server/marketplace/signed-payload";

/** Nombre de la cookie de procedencia. */
export const REGISTRATION_COOKIE_NAME = "cs_aws_registration";

/**
 * Duración de la cookie de procedencia.
 *
 * Larga a propósito, y más que la ventana del token de AWS: el token caduca en
 * ~1 h porque es un secreto de un solo canje, pero el hecho de que esta persona
 * viene de una suscripción no caduca con él. Registrarse por la mañana y
 * rellenar la ficha por la tarde es un caso normal, y perder la procedencia por
 * el camino significa crear la evaluación como si fuera tráfico público — una
 * suscripción de AWS sin evaluación asociada, que es justo lo que no puede pasar
 * en el flujo que revisa AWS.
 */
export const REGISTRATION_TTL_SECONDS = 60 * 60 * 24 * 7;

/** Lo que devolvió `ResolveCustomer`, más la fila que creó Convex. */
export type RegistrationClaims = {
  /** Fila de `marketplaceSubscriptions`. Es lo que viaja a `/eligibility-start`. */
  subscriptionId: string;
  /**
   * `CustomerAWSAccountId` de `ResolveCustomer`.
   *
   * **Nunca `CustomerIdentifier`**: con Concurrent Agreements, obligatorio para
   * productos nuevos desde el 1 de junio de 2026, ese campo ya no viene poblado.
   */
  awsAccountId: string;
  licenseArn: string;
};

export type VerifiedRegistration = RegistrationClaims & {
  /** Emitida en, en segundos desde epoch. */
  iat: number;
  /** Expira en, en segundos desde epoch. */
  exp: number;
};

export type RegistrationVerification =
  | { ok: true; registration: VerifiedRegistration }
  | {
      ok: false;
      reason: "missing" | "malformed" | "bad-signature" | "expired";
    };

/** Firma la procedencia y devuelve el valor de la cookie. */
export function signRegistration(
  claims: RegistrationClaims,
  options: { secret: string; ttlSeconds?: number; now?: number },
): string {
  return signEnvelope(
    {
      subscriptionId: claims.subscriptionId,
      awsAccountId: claims.awsAccountId,
      licenseArn: claims.licenseArn,
    },
    {
      secret: options.secret,
      ttlSeconds: options.ttlSeconds ?? REGISTRATION_TTL_SECONDS,
      ...(options.now !== undefined && { now: options.now }),
    },
  );
}

/**
 * Verifica firma y expiración de la cookie de procedencia.
 *
 * Los tres campos son obligatorios: una procedencia a medias no es una
 * procedencia. Si falta uno, se trata como cookie corrupta y quien la traiga
 * pasa por el evaluador público, que es el camino que nunca falla.
 */
export function verifyRegistration(
  cookieValue: string | undefined | null,
  options: { secret: string; now?: number },
): RegistrationVerification {
  const opened = openEnvelope(cookieValue, options);
  if (!opened.ok) return { ok: false, reason: opened.reason };

  const { subscriptionId, awsAccountId, licenseArn, iat, exp } = opened.claims;

  for (const value of [subscriptionId, awsAccountId, licenseArn]) {
    if (typeof value !== "string" || value.length === 0) {
      return { ok: false, reason: "malformed" };
    }
  }

  return {
    ok: true,
    registration: {
      subscriptionId: subscriptionId as string,
      awsAccountId: awsAccountId as string,
      licenseArn: licenseArn as string,
      iat,
      exp,
    },
  };
}

/** Atributos de la cookie de procedencia. Ver `signedCookieOptions`. */
export function registrationCookieOptions(options?: {
  ttlSeconds?: number;
  secure?: boolean;
}) {
  return signedCookieOptions({
    name: REGISTRATION_COOKIE_NAME,
    ttlSeconds: options?.ttlSeconds ?? REGISTRATION_TTL_SECONDS,
    ...(options?.secure !== undefined && { secure: options.secure }),
  });
}

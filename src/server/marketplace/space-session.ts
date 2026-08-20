import type { EstadoSuscripcion } from "~/lib/espacio";
import {
  openEnvelope,
  signEnvelope,
  signedCookieOptions,
  type EnvelopeFailureReason,
} from "~/server/marketplace/signed-payload";

/**
 * La sesión del espacio de cliente (issue #7 §3): la tercera cookie firmada de
 * esta landing, y la última.
 *
 * ## Por qué una tercera y no una de las dos que ya hay
 *
 * Las tres tienen sujetos distintos, y una cookie es su sujeto:
 *
 * | cookie                | sujeto                        | quién la firma |
 * |-----------------------|-------------------------------|----------------|
 * | `cs_eval_session`     | una EVALUACIÓN (`assessmentId`) | Convex       |
 * | `cs_aws_registration` | la procedencia de un POST de AWS | esta landing |
 * | `cs_space_session`    | una SUSCRIPCIÓN                 | esta landing |
 *
 * `cs_eval_session` exige `assessmentId` y no lo tiene quien entra por el enlace
 * del correo: hay suscripciones que llegan a `licensed` sin que nadie haya hecho
 * la entrevista. Y `cs_aws_registration` prueba que un POST de AWS pasó por aquí
 * hace poco, que no es lo mismo que «esta persona ha canjeado un enlace de un solo
 * uso enviado a su buzón». Meter los tres sujetos en una cookie obligaría a que
 * todos los campos fueran opcionales, y una cookie con todo opcional no puede
 * rechazar nada.
 *
 * El **sobre es el mismo** (`signed-payload.ts`): un solo implementador de la
 * firma en este lado, que es la regla que dejó `website#3`.
 *
 * ## Qué va dentro, y qué no
 *
 * `subscriptionId` y los cuatro últimos dígitos de la cuenta de AWS. La cuenta
 * completa **no**, aunque Convex la tenga: una cookie firmada no está cifrada, se
 * lee con un `atob`, y la regla de AWS sobre los identificadores de cuenta no se
 * cumple mejor por llevarlos de más. Cuatro dígitos es lo que el badge enseña y
 * es todo lo que hace falta.
 *
 * El `status` y su `statusSince` también van dentro, y no para pintarlos en el
 * caso normal: la página relee SIEMPRE el estado del endpoint, porque el estado se
 * refleja y no se cachea. Son la lectura del momento del canje, y sirven para
 * cuando la lectura en vivo falla.
 *
 * **`statusSince` va porque sin él la página degradada mentía.** Con solo el
 * `status`, la fecha que quedaba a mano era el `iat` de la cookie —cuándo se canjeó
 * el enlace— y se pintaba bajo «Activa desde el …»: una fecha plausible, dicha como
 * un hecho, y que no es la de ninguna transición. Es peor que no poner fecha.
 */

export const SPACE_COOKIE_NAME = "cs_space_session";

/**
 * Siete días, como las otras dos.
 *
 * La issue pide que «la sesión posterior dura más» que el enlace de 30 minutos, y
 * siete días es lo que ya hacen las otras dos cookies de este repo: una dirección
 * de compras que entra el lunes tiene que poder volver el jueves sin pedir otro
 * enlace. Más allá de una semana, pedirlo otra vez cuesta un clic y el enlace
 * llega al instante.
 */
export const SPACE_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SpaceClaims = {
  subscriptionId: string;
  /** Cuatro dígitos. Nunca la cuenta completa. */
  awsLast4: string;
  /** El estado en el momento del canje. La página lo relee en vivo. */
  status: EstadoSuscripcion;
  /**
   * Marca de la transición a ese estado, en SEGUNDOS.
   *
   * En segundos y no en milisegundos como la manda Convex: dentro del sobre
   * firmado conviven con `iat` y `exp`, que son segundos, y dos unidades en el
   * mismo objeto es el sitio donde aparece un error de mil veces. La conversión
   * ocurre en la ruta de canje y en ningún otro lado.
   */
  statusSinceSeconds: number;
};

export type VerifiedSpaceSession = SpaceClaims & { iat: number; exp: number };

export type SpaceSessionFailureReason = EnvelopeFailureReason;

export type SpaceSessionVerification =
  | { ok: true; session: VerifiedSpaceSession }
  | { ok: false; reason: SpaceSessionFailureReason };

export function signSpaceSession(
  claims: SpaceClaims,
  options: { secret: string; ttlSeconds?: number; now?: number },
): string {
  return signEnvelope(
    {
      subscriptionId: claims.subscriptionId,
      awsLast4: claims.awsLast4,
      status: claims.status,
      statusSinceSeconds: claims.statusSinceSeconds,
    },
    {
      secret: options.secret,
      ttlSeconds: options.ttlSeconds ?? SPACE_TTL_SECONDS,
      ...(options.now !== undefined && { now: options.now }),
    },
  );
}

/**
 * Verifica firma, formato y caducidad.
 *
 * Los tres campos son obligatorios, y a propósito: una cookie del espacio sin
 * `subscriptionId` no sirve para nada, y una con `subscriptionId` pero sin los
 * otros dos solo puede venir de una versión anterior del formato o de alguien
 * probando. En los dos casos la respuesta correcta es la misma que para una
 * cookie caducada — volver al formulario de acceso, que cuesta un clic— y no un
 * espacio pintado a medias.
 */
export function verifySpaceSession(
  cookieValue: string | undefined | null,
  options: { secret: string; now?: number },
): SpaceSessionVerification {
  const opened = openEnvelope(cookieValue, options);
  if (!opened.ok) return { ok: false, reason: opened.reason };

  const { subscriptionId, awsLast4, status, statusSinceSeconds, iat, exp } =
    opened.claims;
  if (typeof subscriptionId !== "string" || subscriptionId.length === 0) {
    return { ok: false, reason: "malformed" };
  }
  if (typeof awsLast4 !== "string" || awsLast4.length === 0) {
    return { ok: false, reason: "malformed" };
  }
  if (!isEstado(status)) return { ok: false, reason: "malformed" };
  if (
    typeof statusSinceSeconds !== "number" ||
    !Number.isFinite(statusSinceSeconds)
  ) {
    return { ok: false, reason: "malformed" };
  }

  return {
    ok: true,
    session: { subscriptionId, awsLast4, status, statusSinceSeconds, iat, exp },
  };
}

export function spaceCookieOptions(options?: {
  ttlSeconds?: number;
  secure?: boolean;
}) {
  return signedCookieOptions({
    name: SPACE_COOKIE_NAME,
    ttlSeconds: options?.ttlSeconds ?? SPACE_TTL_SECONDS,
    ...(options?.secure !== undefined && { secure: options.secure }),
  });
}

const ESTADOS = new Set(["resolved", "licensed", "provisioned", "ended"]);

function isEstado(value: unknown): value is EstadoSuscripcion {
  return typeof value === "string" && ESTADOS.has(value);
}

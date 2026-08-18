/**
 * Arranque de la evaluación contra Convex: `POST /eligibility-start`.
 *
 * ## Servidor a servidor, y por eso vive aquí
 *
 * Es la única ruta del marketplace que **crea filas**, y se autentica con
 * `MARKETPLACE_SESSION_SECRET` como bearer. Ese secreto no puede acercarse al
 * navegador, así que la llamada sale de la ruta de la Etapa 0 y nunca del
 * cliente. La Etapa 1, en cambio, la llama el navegador directamente contra
 * `/eligibility-stream` con la sesión firmada — ver `~/lib/interview`.
 *
 * ## La sesión la firma Convex, no esta landing
 *
 * `signSession` de `./session` produce exactamente el mismo formato
 * —`base64url(payload).base64url(HMAC-SHA256)` con el mismo secreto— y podría
 * firmarla aquí. No se hace: con dos implementadores del formato, el día que uno
 * cambie un campo el otro sigue firmando lo de antes y el fallo aparece como un
 * 401 sin causa aparente. Convex firma, esta landing **verifica** con
 * `verifySession`, que es la asimetría que evita esa clase de deriva.
 *
 * El token que devuelve es el valor que se guarda tal cual en la cookie
 * `HttpOnly`, y el mismo que la Etapa 1 manda en `Authorization`.
 */

import { env } from "~/env";

/** Los siete campos de la Etapa 0, tal y como los espera Convex. */
export type EligibilityStage0 = {
  emailInstitucional: string;
  nombre: string;
  cargo: string;
  institucion: string;
  ambitoPais: "espana" | "latam" | "otro";
  webInstitucion?: string;
  consentimiento: true;
  /** Milisegundos epoch: es lo que demuestra cuándo se aceptó el texto. */
  consentimientoAt: number;
};

export type StartedAssessment = {
  assessmentId: string;
  /** Sesión firmada. Va a la cookie; nunca al cuerpo de la respuesta. */
  sessionToken: string;
  /** Segundos epoch. Fija el `maxAge` de la cookie. */
  expiresAt: number;
  status: "draft" | "completed";
  reused: boolean;
};

/**
 * Vida de la sesión de la entrevista.
 *
 * La entrevista dura 8–12 minutos, pero la sesión no puede durar eso: el estado
 * «abandono y vuelta» de la issue es un caso normal —alguien la deja a medias y
 * la retoma por la tarde—, y una sesión de dos horas convierte ese caso en el
 * mensaje de sesión caducada. Un día es el tope que admite el endpoint.
 */
export const INTERVIEW_SESSION_TTL_SECONDS = 60 * 60 * 24;

/** Tope de espera del arranque. No hay modelo detrás: es una escritura. */
const START_TIMEOUT_MS = 15_000;

/** Falla el arranque. El mensaje que ve el cliente lo pone la ruta, no esto. */
export class EligibilityStartError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "EligibilityStartError";
    this.status = status;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Crea la evaluación en `draft` y devuelve la sesión firmada.
 *
 * Un `draft` no consume la evaluación de la cuenta y no dispara ningún email:
 * capturar el contacto aunque abandonen la entrevista es justo el motivo de que
 * la Etapa 0 vaya antes del chat.
 */
export async function startEligibilityAssessment(
  stage0: EligibilityStage0,
  options: { subscriptionId?: string; fetcher?: typeof fetch } = {},
): Promise<StartedAssessment> {
  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/eligibility-start`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
      },
      body: JSON.stringify({
        stage0,
        ttlSeconds: INTERVIEW_SESSION_TTL_SECONDS,
        ...(options.subscriptionId !== undefined && {
          subscriptionId: options.subscriptionId,
        }),
      }),
      signal: AbortSignal.timeout(START_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new EligibilityStartError(
      `No se pudo contactar con el backend de la evaluación: ${String(error)}`,
      503,
    );
  }

  if (!response.ok) {
    // El cuerpo se lee para la traza del servidor, no para el cliente: un 401
    // aquí significa que los dos lados tienen secretos distintos, y eso es un
    // problema de configuración nuestro, no algo que explicarle a quien rellenó
    // el formulario.
    const detail = await response.text().catch(() => "");
    throw new EligibilityStartError(
      `\`/eligibility-start\` respondió ${response.status}: ${detail.slice(0, 300)}`,
      response.status === 401 ? 500 : 503,
    );
  }

  const payload = (await response.json().catch(() => null)) as unknown;
  if (
    !isRecord(payload) ||
    typeof payload.assessmentId !== "string" ||
    typeof payload.sessionToken !== "string" ||
    typeof payload.expiresAt !== "number"
  ) {
    throw new EligibilityStartError(
      "`/eligibility-start` devolvió una respuesta sin sesión utilizable.",
      503,
    );
  }

  return {
    assessmentId: payload.assessmentId,
    sessionToken: payload.sessionToken,
    expiresAt: payload.expiresAt,
    status: payload.status === "completed" ? "completed" : "draft",
    reused: payload.reused === true,
  };
}

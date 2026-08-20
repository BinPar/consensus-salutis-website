/**
 * Persistencia de la suscripción canjeada: `POST /marketplace-register`.
 *
 * ## Por qué un endpoint y no un cliente de Convex
 *
 * `registrarSuscripcion` es una `internalMutation` y no se alcanza desde fuera
 * de Convex. La alternativa sería darle a esta landing un `CONVEX_DEPLOY_KEY`,
 * que es una credencial con poder total sobre la base de datos de la plataforma
 * —corpus, usuarios, organizaciones, hilos— para escribir una fila de siete
 * campos. Un endpoint con su secreto solo puede hacer una cosa.
 *
 * El contrato lo define `BinPar/consensus-salutis#92` y es el mismo patrón que
 * `/eligibility-start`: servidor a servidor, `MARKETPLACE_SESSION_SECRET` como
 * bearer y comparación en tiempo constante al otro lado. Se reutiliza ese
 * secreto y no se inventa uno nuevo porque el consumidor es el mismo servidor de
 * Next que ya llama a `/eligibility-start`: misma frontera de confianza, y una
 * variable más solo añade un sitio donde equivocarse.
 *
 * El `subscriptionId` que devuelve es el que **`/eligibility-start` ya acepta**,
 * así que la costura con la Etapa 0 estaba hecha antes de escribir esto.
 */

import { env } from "~/env";

export type SubscriptionRegistration = {
  awsAccountId: string;
  licenseArn: string;
  productCode: string;
  offerType?: string;
};

export type RegisteredSubscription = {
  subscriptionId: string;
  /**
   * `false` cuando esta cuenta ya estaba registrada.
   *
   * Es lo que decide el destino del comprador, y una segunda suscripción de la
   * misma cuenta —renovación, resuscripción, doble clic en el botón de AWS— es
   * un caso REAL y no un error.
   */
  isNew: boolean;
  status: string;
  /**
   * Slug del informe de esta cuenta, si ya completó su evaluación.
   *
   * Es lo que hace que una resuscripción lleve al informe y no a la Etapa 0: una
   * evaluación por cuenta, y para repetir hay que pasar por soporte. Opcional
   * porque la mayoría de registros no tienen informe todavía — y porque su
   * ausencia solo cuesta un rodeo por el evaluador, nunca un error.
   */
  reportSlug?: string;
};

/** Tope de espera. No hay modelo detrás: es una escritura de siete campos. */
const REGISTER_TIMEOUT_MS = 15_000;

/** Por qué no se ha podido persistir. Decide el código que ve AWS. */
export type RegisterFailureReason =
  /** El `productCode` no es el de este producto. Se propaga como 400. */
  | "product-mismatch"
  /** Configuración nuestra: secretos que no casan, variable sin poner. */
  | "misconfigured"
  /** Convex no contestó, o contestó algo que no cumple el contrato. */
  | "unavailable";

export class RegisterSubscriptionError extends Error {
  readonly reason: RegisterFailureReason;

  constructor(reason: RegisterFailureReason, message: string) {
    super(message);
    this.name = "RegisterSubscriptionError";
    this.reason = reason;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Registra la suscripción ya canjeada. Idempotente por `awsAccountId`.
 *
 * La unicidad de la cuenta —«verify that no other accounts in your system share
 * the AWS account ID»— la impone el índice `by_awsAccountId` de Convex, no esto:
 * aquí solo hay que propagar el resultado.
 */
export async function registerSubscription(
  registration: SubscriptionRegistration,
  options: { fetcher?: typeof fetch } = {},
): Promise<RegisteredSubscription> {
  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/marketplace-register`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
      },
      body: JSON.stringify(registration),
      signal: AbortSignal.timeout(REGISTER_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new RegisterSubscriptionError(
      "unavailable",
      `No se pudo contactar con el backend del marketplace: ${String(error)}`,
    );
  }

  if (!response.ok) {
    // El cuerpo se lee para la traza del servidor, nunca para el comprador: un
    // 401 aquí significa que los dos lados tienen secretos distintos, y eso es
    // un problema de configuración nuestro.
    const detail = await response.text().catch(() => "");
    const reason: RegisterFailureReason =
      response.status === 400
        ? "product-mismatch"
        : response.status === 401 || response.status === 500
          ? "misconfigured"
          : "unavailable";

    throw new RegisterSubscriptionError(
      reason,
      `\`/marketplace-register\` respondió ${response.status}: ${detail.slice(0, 300)}`,
    );
  }

  const payload = (await response.json().catch(() => null)) as unknown;
  if (
    !isRecord(payload) ||
    typeof payload.subscriptionId !== "string" ||
    payload.subscriptionId.length === 0 ||
    typeof payload.isNew !== "boolean"
  ) {
    throw new RegisterSubscriptionError(
      "unavailable",
      "`/marketplace-register` devolvió una respuesta sin suscripción utilizable.",
    );
  }

  return {
    subscriptionId: payload.subscriptionId,
    isNew: payload.isNew,
    status: typeof payload.status === "string" ? payload.status : "resolved",
    ...(typeof payload.reportSlug === "string" &&
      payload.reportSlug.length > 0 && { reportSlug: payload.reportSlug }),
  };
}

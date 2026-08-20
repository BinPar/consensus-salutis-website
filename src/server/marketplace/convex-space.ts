import { env } from "~/env";
import { SOPORTE_ULTIMO_RECURSO, type EstadoSuscripcion } from "~/lib/espacio";

/**
 * Los tres endpoints del espacio de cliente en Convex (`BinPar/consensus-salutis#93`),
 * vistos desde el servidor de Next.
 *
 * Mismo patrón que `convex-register.ts` y `convex-eligibility.ts`, y por el mismo
 * motivo: las funciones de Convex que hay detrás son `internalMutation` /
 * `internalQuery`, así que la alternativa a un endpoint con secreto compartido es
 * darle a esta landing una `CONVEX_DEPLOY_KEY`, que es poder total sobre la base.
 *
 * Se reusa `MARKETPLACE_SESSION_SECRET` como portador en vez de inventar una
 * variable nueva: el consumidor es el MISMO servidor de Next que ya llama a
 * `/eligibility-start` y a `/marketplace-register`, así que es la misma frontera
 * de confianza. Una variable más solo añade un sitio donde equivocarse.
 *
 * ## Quién hashea el token, y por qué aquí
 *
 * El canje manda `tokenHash`, **nunca el token en claro**. El token vive en la URL
 * del correo, entra por esta ruta y se convierte en hash aquí mismo
 * (`hashToken` de `one-time-tokens.ts`, HMAC con `MARKETPLACE_TOKEN_PEPPER`): así
 * el valor con el que se abre un espacio no aparece en el cuerpo de ninguna
 * petición saliente ni en los logs de Convex. Es un contrato binario con
 * `hashSpaceToken` del monorepo, que calcula la misma cadena con `crypto.subtle`
 * porque el runtime por defecto de Convex no trae `node:crypto`, y hay un test en
 * el monorepo que compara las dos implementaciones byte a byte.
 *
 * ## Milisegundos allí, segundos aquí
 *
 * Convex maneja `Date.now()` en milisegundos y así viajan `statusSince` y
 * `plazoLimite`. El resto de este repo cuenta en SEGUNDOS (el sobre firmado, los
 * TTL de cookie, el puerto de `store.ts`). La frontera entre las dos unidades es
 * este fichero y nada más: lo que sale de aquí como `Ms` se pinta como fecha y no
 * se mezcla nunca con un `exp`.
 */

const SPACE_TIMEOUT_MS = 10_000;

/** Tope de la respuesta de estado. Son seis campos cortos. */
const MAX_RESPONSE_BYTES = 8 * 1024;

export type SpaceRequestFailure =
  | "rate-limited"
  | "misconfigured"
  | "unavailable";

export class SpaceRequestError extends Error {
  readonly reason: SpaceRequestFailure;

  constructor(reason: SpaceRequestFailure, message: string) {
    super(message);
    this.name = "SpaceRequestError";
    this.reason = reason;
  }
}

/**
 * El estado de la suscripción, tal y como lo devuelven el canje y la consulta.
 *
 * `awsLast4` son cuatro dígitos y no la cuenta entera, y eso lo decide Convex:
 * la regla de AWS es literal —«confía solo en los account ids que AWS devuelve o
 * que tu sistema ha firmado»— y con cuatro dígitos el suscriptor reconoce su
 * cuenta sin que la cookie firmada lleve dentro el identificador completo.
 */
export type SpaceState = {
  status: EstadoSuscripcion;
  /** Marca de la transición al estado actual, en MILISEGUNDOS. */
  statusSinceMs: number;
  awsLast4: string;
  reportSlug?: string;
  /** Fecha comprometida de contacto, en MILISEGUNDOS. Solo con `resolved`. */
  plazoLimiteMs?: number;
  /** Canal de soporte, que vive en el deployment y no en esta landing. */
  soporte: { email: string; contacto?: string };
};

export type SpaceRedeemResult =
  | ({ ok: true; subscriptionId: string } & SpaceState)
  /** Las cuatro causas de rechazo llegan colapsadas en una: así se pintan. */
  | { ok: false };

// ── Solicitud del enlace ───────────────────────────────────────────────────

/**
 * Pide el enlace de acceso para un email.
 *
 * No devuelve nada: **el resultado no se le puede contar a quien pregunta**. Que
 * no lance significa «la petición se ha procesado», y eso es todo lo que la ruta
 * traduce a la respuesta congelada de `ACCESO_ENVIADO`. Si hubiera un valor de
 * vuelta distinguiendo «había suscripción» de «no había», tarde o temprano
 * alguien lo pintaría.
 *
 * `clientKey` es un HMAC de la IP, no la IP: el contador del otro lado tiene que
 * distinguir clientes, no identificarlos, y una tabla de direcciones IP en un
 * sistema que trata datos de instituciones sanitarias es un pasivo sin
 * contrapartida.
 */
export async function requestSpaceLink(
  input: { email: string; clientKey: string },
  options: { fetcher?: typeof fetch } = {},
): Promise<void> {
  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/marketplace-space-request`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(SPACE_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    throw new SpaceRequestError(
      "unavailable",
      `No se pudo contactar con el backend del espacio: ${String(error)}`,
    );
  }

  if (response.status === 429) {
    throw new SpaceRequestError("rate-limited", "Límite de tasa alcanzado.");
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new SpaceRequestError(
      response.status === 401 || response.status === 500
        ? "misconfigured"
        : "unavailable",
      `\`/marketplace-space-request\` respondió ${response.status}: ${detail.slice(0, 300)}`,
    );
  }
}

// ── Canje ──────────────────────────────────────────────────────────────────

/**
 * Canjea un enlace y devuelve con qué firmar la cookie.
 *
 * El canje es UNA operación en Convex, y tiene que serlo: partido en buscar y
 * luego marcar, dos canjes simultáneos del mismo enlace pasarían los dos, y el
 * uso único es la mitad de la seguridad de este mecanismo. Esta función no puede
 * «ayudar» comprobando nada por su cuenta.
 *
 * `expectedSubscriptionId` viaja al otro lado para que se compruebe **antes** de
 * gastar el token: un enlace de otra suscripción se rechaza sin quemarse, que es
 * la garantía que el puerto de `store.ts` tiene documentada y probada.
 */
export async function redeemSpaceToken(
  input: { tokenHash: string; expectedSubscriptionId?: string },
  options: { fetcher?: typeof fetch } = {},
): Promise<SpaceRedeemResult> {
  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/marketplace-space-redeem`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}`,
      },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(SPACE_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[espacio] no se pudo canjear el enlace:", String(error));
    return { ok: false };
  }

  if (!response.ok) {
    // Un `401` o un `500` de Convex son culpa nuestra, no del enlace. Se
    // registran, pero al cliente se le enseña la misma pantalla: contarle que el
    // backend está mal configurado no le sirve de nada y a un atacante sí.
    console.error(
      `[espacio] \`/marketplace-space-redeem\` respondió ${response.status}`,
    );
    return { ok: false };
  }

  const payload = await readJson(response);
  if (!isRecord(payload) || payload.ok !== true) return { ok: false };

  const state = parseState(payload);
  if (state === null || typeof payload.subscriptionId !== "string") {
    console.error(
      "[espacio] el canje devolvió una respuesta fuera de contrato.",
    );
    return { ok: false };
  }

  return { ok: true, subscriptionId: payload.subscriptionId, ...state };
}

// ── Estado ─────────────────────────────────────────────────────────────────

/**
 * Lee el estado de una suscripción. `null` cuando no se puede leer.
 *
 * `null` y no una excepción porque quien llama es una página de servidor con una
 * cookie válida en la mano: lo correcto ahí es enseñar el espacio degradado —el
 * badge, el soporte— y no un error, no romper la página del cliente porque una
 * lectura ha ido mal.
 */
export async function fetchSpaceState(
  subscriptionId: string,
  options: { fetcher?: typeof fetch } = {},
): Promise<SpaceState | null> {
  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/marketplace-space-status?subscriptionId=${encodeURIComponent(subscriptionId)}`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "GET",
      headers: { Authorization: `Bearer ${env.MARKETPLACE_SESSION_SECRET}` },
      signal: AbortSignal.timeout(SPACE_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[espacio] no se pudo leer el estado:", String(error));
    return null;
  }

  if (!response.ok) {
    console.error(
      `[espacio] \`/marketplace-space-status\` respondió ${response.status}`,
    );
    return null;
  }

  const state = parseState(await readJson(response));
  if (state === null) {
    console.error(
      "[espacio] `/marketplace-space-status` devolvió una respuesta fuera de contrato.",
    );
  }
  return state;
}

// ── Frontera de contrato ───────────────────────────────────────────────────

const ESTADOS_VALIDOS = new Set([
  "resolved",
  "licensed",
  "provisioned",
  "ended",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function readJson(response: Response): Promise<unknown> {
  const raw = await response.text().catch(() => "");
  // Un cuerpo enorme por esta puerta no es un caso legítimo: son seis campos.
  if (raw.length > MAX_RESPONSE_BYTES) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Valida y recorta lo que llega. **Es la reja**: lo que no esté aquí no llega a
 * la vista, aunque el endpoint lo mande. Sin ella, un campo añadido al payload
 * del otro lado —el `awsAccountId` completo, el email de contacto, el
 * `licenseArn`— aparecería en el HTML el día que alguien lo añada allí sin
 * pensar en esta página.
 *
 * Escrito a mano y no con zod por la misma razón que los validadores de la Etapa
 * 0: nada que valide un contrato con el monorepo cruza la frontera de versiones
 * de zod entre los dos repos.
 */
function parseState(payload: unknown): SpaceState | null {
  if (!isRecord(payload)) return null;

  const { status, statusSince, awsLast4, reportSlug, plazoLimite, soporte } =
    payload;
  if (typeof status !== "string" || !ESTADOS_VALIDOS.has(status)) return null;
  if (typeof statusSince !== "number" || !Number.isFinite(statusSince))
    return null;
  if (typeof awsLast4 !== "string") return null;
  // **`soporte` ausente NO invalida el estado.** El endpoint siempre manda la
  // clave, pero con la cadena vacía cuando ni el criterio activo ni el deployment
  // tienen canal. Tratar la ausencia como «fuera de contrato» costaría el estado
  // en vivo, el `reportSlug` y el plazo por un campo que tiene sustituto: el
  // cliente se quedaría con la fecha vieja de la cookie y sin enlace al informe,
  // y todo por no poder imprimir una dirección de correo que sí sabemos.
  const canal =
    isRecord(soporte) && typeof soporte.email === "string" ? soporte : null;

  return {
    status: status as EstadoSuscripcion,
    statusSinceMs: statusSince,
    awsLast4,
    ...(typeof reportSlug === "string" &&
      reportSlug.length > 0 && { reportSlug }),
    ...(typeof plazoLimite === "number" &&
      Number.isFinite(plazoLimite) && { plazoLimiteMs: plazoLimite }),
    soporte: {
      // El endpoint manda la cadena vacía cuando no tiene canal (y lo grita en sus
      // logs). Aquí se sustituye por el último recurso en vez de propagarla: el
      // bloque de soporte visible es un requisito de AWS, y una tarjeta con el
      // hueco en blanco no lo cumple.
      email:
        canal !== null && (canal.email as string).length > 0
          ? (canal.email as string)
          : SOPORTE_ULTIMO_RECURSO,
      ...(canal !== null &&
        typeof canal.contacto === "string" &&
        canal.contacto.length > 0 && { contacto: canal.contacto }),
    },
  };
}

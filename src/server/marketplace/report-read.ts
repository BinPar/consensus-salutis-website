/**
 * Lectura del informe por su URL reenviable (issue #6).
 *
 * Habla con `GET /eligibility-report/{slug}` del deployment de Convex
 * (`BinPar/consensus-salutis#90`), que es público: el slug ES la capacidad —
 * 256 bits no adivinables— y la respuesta es solo lectura. Lo que devuelve es
 * todo lo que la página puede saber: **ni estado de suscripción, ni email, ni
 * ficha, ni reglas** viajan por aquí; ese filtrado vive en el lado de Convex
 * (`publicReportPayload`) con su propio test.
 *
 * `assessmentId` sí viene: es lo que el servidor de esta landing compara con la
 * cookie firmada para decidir el badge de suscripción verificada. No se pinta
 * en el HTML.
 *
 * La llamada sale SIEMPRE del servidor de Next, nunca del navegador: la página
 * es un server component y el endpoint no tiene CORS. Eso también significa que
 * quien abre el enlace no ve contra qué deployment habla la landing.
 */

import { z } from "zod";

import { env } from "~/env";
import type { RegistrationVerification } from "~/server/marketplace/registration";
import { isWellFormedReportSlug } from "~/server/marketplace/report";
import type { SessionVerification } from "~/server/marketplace/session";

const semaforoColor = z.enum(["verde", "ambar", "rojo", "gris"]);

export type SemaforoColor = z.infer<typeof semaforoColor>;

/**
 * El literal del nivel cruza aquí — a diferencia de la entrevista, que lo filtra
 * en `~/lib/interview` — porque la página del informe ES el semáforo por diseño
 * (§2 de la issue): la línea del nivel lleva el color del veredicto. La palabra
 * escrita va siempre al lado; el literal no se pinta nunca tal cual.
 */
const publicReportSchema = z.object({
  assessmentId: z.string().min(1),
  institucion: z.string().min(1),
  completedAt: z.number(),
  nivel: z.enum(["listos", "casi", "explorar"]),
  nivelNombre: z.string().min(1),
  /*
    El titular de la página: la oportunidad escrita para ESTA institución
    («Podemos empezar ya, con dos servicios»), no el nombre del nivel. Lo
    redacta el motor (#87) y es opcional porque un informe anterior al cambio
    no lo trae: en ese caso la página cae al titular por nivel de
    `TITULAR_POR_NIVEL`, que dice lo mismo sin los detalles del caso.
  */
  titular: z.string().min(1).optional(),
  diagnostico: z.string(),
  dims: z.array(
    z.object({
      dimension: z.string().min(1),
      color: semaforoColor,
      estado: z.string().min(1),
      motivo: z.string(),
    }),
  ),
  pasos: z.array(
    z.object({
      dimension: z.string().min(1),
      color: semaforoColor,
      texto: z.string().min(1),
      /*
        Qué ponemos NOSOTROS en ese paso — la plantilla, la sesión de trabajo,
        el dossier—. Sin esto el plan se lee como deberes para antes de la
        llamada, que es justo lo que no es. Opcional por la misma razón que
        `titular`: los informes de antes no lo traen y la línea no se pinta.
      */
      apoyo: z.string().min(1).optional(),
    }),
  ),
  encaje: z
    .object({
      dentro: z.array(z.string().min(1)),
      pronto: z.array(
        z.object({ uso: z.string().min(1), puerta: z.string().min(1) }),
      ),
      fuera: z.array(z.string()),
      quien: z.string(),
    })
    .optional(),
  hoyCorto: z.string().optional(),
  plazoHabil: z.string().min(1),
  canalSoporte: z.string().min(1),
  reportMarkdown: z.string().min(1),
});

export type PublicReport = z.infer<typeof publicReportSchema>;

/**
 * Los dígitos del badge «Suscripción de AWS Marketplace verificada», o `null`.
 *
 * Tres condiciones y las tres necesarias (§3 de la issue):
 *
 * 1. Cookie firmada y sin caducar — la verificación ya hecha por `verifySession`.
 * 2. **De esta evaluación**: una sesión válida de otra evaluación no prueba nada
 *    sobre este informe. Es lo que hace que el enlace reenviado no muestre el
 *    badge aunque quien lo abra tenga su propia sesión abierta.
 * 3. Con `awsAccountId` detrás: una evaluación directa tiene cookie pero no
 *    suscripción.
 *
 * ## De dónde salen los dígitos
 *
 * De la sesión cuando los lleva dentro. Pero la sesión de una evaluación que
 * llegó por Marketplace la firma Convex al arrancar la Etapa 0, y Convex solo
 * pone `assessmentId` y `subscriptionId`: el `awsAccountId` nunca sale de la
 * landing hacia allí, precisamente porque no hace falta que salga. Así que el
 * segundo origen es la cookie de procedencia que firmó `/aws/registration`
 * (website#3), atada a esta evaluación por el `subscriptionId` que las dos
 * cookies comparten.
 *
 * Los dos son cookies **firmadas por nosotros** y verificadas antes de leerse,
 * que es la regla que AWS pone por escrito (issue #2 §3): nunca un parámetro de
 * URL, nunca un campo del formulario.
 */
export function awsBadgeDigits(
  verification: SessionVerification,
  assessmentId: string,
  registration?: RegistrationVerification,
): string | null {
  if (!verification.ok) return null;
  if (verification.session.assessmentId !== assessmentId) return null;

  const fromSession = verification.session.awsAccountId;
  if (fromSession !== undefined && fromSession.length >= 4) {
    return fromSession.slice(-4);
  }

  /*
    El cruce por `subscriptionId`: la procedencia solo vale para ESTA evaluación
    si las dos cookies hablan de la misma suscripción. Sin esa comprobación,
    quien tuviera una suscripción propia vería el badge en el informe ajeno que
    alguien le reenvió.
  */
  const subscriptionId = verification.session.subscriptionId;
  if (registration?.ok !== true || subscriptionId === undefined) return null;
  if (registration.registration.subscriptionId !== subscriptionId) return null;

  const fromRegistration = registration.registration.awsAccountId;
  return fromRegistration.length >= 4 ? fromRegistration.slice(-4) : null;
}

/** Tope de espera: es una lectura, no hay modelo detrás. */
const READ_TIMEOUT_MS = 10_000;

/**
 * Devuelve el informe del slug, o `null` si no hay nada que enseñar.
 *
 * `null` cubre a la vez el slug malformado (ni se consulta), el 404 del
 * endpoint y una respuesta que no cumple el contrato: para quien abre el
 * enlace los tres casos son la misma página de «no encontrado». Solo el
 * contrato roto deja traza en el servidor, porque ese sí es problema nuestro.
 */
export async function fetchReportBySlug(
  slug: string,
  options: { fetcher?: typeof fetch } = {},
): Promise<PublicReport | null> {
  if (!isWellFormedReportSlug(slug)) return null;

  const doFetch = options.fetcher ?? fetch;
  const endpoint = `${env.NEXT_PUBLIC_CONVEX_SITE_URL}/eligibility-report/${slug}`;

  let response: Response;
  try {
    response = await doFetch(endpoint, {
      method: "GET",
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch (error) {
    console.error("[informe] no se pudo leer el informe:", String(error));
    return null;
  }

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as unknown;
  const parsed = publicReportSchema.safeParse(payload);
  if (!parsed.success) {
    console.error(
      "[informe] `/eligibility-report` devolvió una respuesta fuera de contrato:",
      parsed.error.message.slice(0, 500),
    );
    return null;
  }
  return parsed.data;
}

/**
 * La página permanente del informe de idoneidad (issue #6).
 *
 * ## Solo lectura, por construcción
 *
 * Esta página se abre con el `reportSlug` — la URL reenviable dentro de la
 * institución — y lo ÚNICO que sabe hacer es leer `GET /eligibility-report` del
 * deployment de Convex. No lee el estado de la suscripción, no emite tokens y no
 * enlaza al espacio de cliente: `REPORT_SLUG_CAPABILITIES` en `report.ts` es el
 * contrato, y esta página su cumplimiento. Un enlace filtrado expone un informe,
 * no una sesión.
 *
 * ## El badge se decide aquí, en el servidor
 *
 * «Suscripción de AWS Marketplace verificada · cuenta ····NNNN» aparece solo si
 * el navegador trae la cookie firmada de SU evaluación con `awsAccountId`
 * dentro (§3 de la issue): es la prueba visual de que `ResolveCustomer`
 * funcionó, que es justo lo que el revisor de AWS dijo no encontrar. Con acceso
 * por enlace reenviado no hay cookie que corresponda y el badge no se muestra —
 * quien abre un enlace reenviado no es necesariamente el suscriptor. Los
 * dígitos salen SIEMPRE de la cookie verificada, nunca de un parámetro.
 *
 * ## No indexable
 *
 * El slug es un secreto compartible: `noindex` evita que un buscador publique lo
 * que la institución decidió compartir por correo. La misma razón por la que la
 * URL no lleva nada más que el slug.
 */

import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";

import { InformeView } from "~/app/_components/informe/informe-view";
import { PageShell } from "~/app/_components/site";
import { env } from "~/env";
import {
  awsBadgeDigits,
  fetchReportBySlug,
} from "~/server/marketplace/report-read";
import {
  REGISTRATION_COOKIE_NAME,
  verifyRegistration,
} from "~/server/marketplace/registration";
import {
  SESSION_COOKIE_NAME,
  verifySession,
} from "~/server/marketplace/session";

export const metadata: Metadata = {
  title: "Informe de idoneidad",
  description: "Informe de idoneidad de Consensus Salutis para su institución.",
  robots: { index: false, follow: false },
};

/** El informe se lee por slug y el badge por cookie: nada es prerrenderizable. */
export const dynamic = "force-dynamic";

export default async function InformePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = await fetchReportBySlug(slug);
  // Slug malformado, inexistente o sin informe: el mismo 404 para los tres.
  if (report === null) notFound();

  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value, {
    secret: env.MARKETPLACE_SESSION_SECRET,
  });
  /*
    La procedencia de AWS va aparte porque se firmó antes de que la evaluación
    existiera: el POST de Marketplace llega antes de la Etapa 0. Las dos cookies
    se cruzan por `subscriptionId` dentro de `awsBadgeDigits`, donde viven (y se
    prueban) las condiciones del badge.
  */
  const registration = verifyRegistration(
    cookieStore.get(REGISTRATION_COOKIE_NAME)?.value,
    { secret: env.MARKETPLACE_SESSION_SECRET },
  );
  const badgeDigits = awsBadgeDigits(
    session,
    report.assessmentId,
    registration,
  );

  /*
    La URL absoluta, del host real de la petición: es lo que copia el botón y lo
    que queda escrito en el pie, y tiene que ser la URL que el lector tiene
    delante — también en un preview deployment.
  */
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "consensussalutis.com";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const url = `${proto}://${host}/informe/${slug}`;

  const fechaTexto = new Date(report.completedAt).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <PageShell>
      <main className="relative isolate">
        <InformeView
          report={report}
          badgeDigits={badgeDigits}
          url={url}
          fechaTexto={fechaTexto}
        />
      </main>
    </PageShell>
  );
}

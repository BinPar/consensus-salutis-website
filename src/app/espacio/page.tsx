import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AccesoForm } from "~/app/_components/espacio/acceso-form";
import { EspacioView } from "~/app/_components/espacio/espacio-view";
import { Eyebrow } from "~/app/_components/eyebrow";
import { HomeMotionBackground } from "~/app/_components/motion-system";
import { PageShell } from "~/app/_components/site";
import { env } from "~/env";
import {
  ENLACE_NO_VALIDO,
  PT_BAJO_CABECERA,
  fechaLarga,
  SOPORTE_ULTIMO_RECURSO,
  TITULAR_INFORME_POR_NIVEL,
} from "~/lib/espacio";
import { fetchSpaceState } from "~/server/marketplace/convex-space";
import { fetchReportBySlug } from "~/server/marketplace/report-read";
import {
  SPACE_COOKIE_NAME,
  verifySpaceSession,
} from "~/server/marketplace/space-session";

/**
 * `/espacio` — el espacio de cliente de AWS Marketplace (issue #7).
 *
 * Una sola ruta con dos caras, y a propósito: **con sesión** pinta los cuatro
 * bloques; **sin sesión** pinta el formulario de acceso. La alternativa —dos rutas
 * y una redirección— haría que la sesión caducada acabara en una URL distinta de
 * la que el cliente tiene guardada en marcadores, y §7 pide justo lo contrario:
 * «con la sesión caducada, vuelta al formulario de acceso sin error feo».
 *
 * No hay error feo porque no hay error: una cookie caducada no es un fallo, es el
 * estado normal de una semana después. Se le dice al cliente en una frase y se le
 * pone el formulario debajo, ya enfocable.
 *
 * ## El estado se relee SIEMPRE
 *
 * La cookie lleva el estado del momento del canje, y no se pinta nunca: la página
 * lo pide al endpoint en cada visita. El estado se **refleja**, no se cachea —lo
 * mueven los eventos de EventBridge y el alta manual, los dos en el monorepo— y
 * una página que enseñara el estado de hace seis días diciendo que es el de hoy
 * sería peor que no tener página.
 *
 * Si la lectura en vivo falla, se cae al de la cookie: es viejo, pero está
 * firmado por nosotros y es mejor que una página en blanco. Los cuatro dígitos y
 * el soporte salen igual.
 */

export const metadata: Metadata = {
  title: "Espacio de cliente",
  description:
    "Estado de tu suscripción de AWS Marketplace, informe de idoneidad y canal de soporte.",
  // Una página con sesión no se indexa. Y el formulario tampoco: no aporta nada a
  // una búsqueda y sí sería una puerta que alguien encuentra sin buscarla.
  robots: { index: false, follow: false },
};

/** La cookie es por visita: nada de esta página se puede prerrenderizar. */
export const dynamic = "force-dynamic";

export default async function EspacioPage({
  searchParams,
}: {
  searchParams: Promise<{ enlace?: string }>;
}) {
  const { enlace } = await searchParams;
  const cookieStore = await cookies();
  const session = verifySpaceSession(
    cookieStore.get(SPACE_COOKIE_NAME)?.value,
    {
      secret: env.MARKETPLACE_SESSION_SECRET,
    },
  );

  if (!session.ok) {
    return (
      <PageShell>
        <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
          <HomeMotionBackground />
          <AccesoPantalla
            motivo={
              // Un enlace que no cuela y una sesión caducada son dos frases
              // distintas, y las dos son normales. Lo que NO se dice nunca es cuál
              // de las cuatro causas de rechazo fue.
              enlace === "no-valido"
                ? "enlace"
                : session.reason === "expired"
                  ? "caducada"
                  : "ninguno"
            }
          />
        </main>
      </PageShell>
    );
  }

  const { subscriptionId, awsLast4 } = session.session;
  const state = await fetchSpaceState(subscriptionId);

  // El informe se lee por su slug con el mismo lector que la página del informe:
  // un solo cliente de ese endpoint, y la reja de zod que decide qué campos
  // existen está escrita una vez.
  const slug = state?.reportSlug;
  const report = slug === undefined ? null : await fetchReportBySlug(slug);

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />
        {/* Un enlace que no cuela cuando YA hay sesión: se dice, y se sigue
            dentro. Sin este aviso, quien pulsa un enlace caducado teniendo la
            sesión abierta ve su espacio de siempre y no entiende nada —peor aún
            si el enlace era de OTRA suscripción, porque parecería que le ha
            llevado a la suya—. Lo que no se dice, aquí tampoco, es cuál de las
            cuatro causas fue. */}
        {enlace === "no-valido" ? <AvisoEnlace /> : null}
        <EspacioView
          pegadoAlAviso={enlace === "no-valido"}
          estado={state?.status ?? session.session.status}
          // La fecha firmada en el canje, no el `iat` de la cookie: el `iat` es
          // cuándo se pinchó el enlace, y pintarlo bajo «Activa desde el …» es una
          // fecha plausible dicha como un hecho. Mejor la de la última lectura
          // buena que una inventada.
          fechaEstado={fechaLarga(
            state?.statusSinceMs ?? session.session.statusSinceSeconds * 1_000,
          )}
          fechaPlazo={
            state?.plazoLimiteMs === undefined
              ? null
              : fechaLarga(state.plazoLimiteMs)
          }
          awsLast4={awsLast4}
          informe={
            report === null || slug === undefined
              ? null
              : {
                  url: `/informe/${slug}`,
                  titular:
                    report.titular ?? TITULAR_INFORME_POR_NIVEL[report.nivel],
                  nivelNombre: report.nivelNombre,
                }
          }
          // Cuando el estado se lee, `parseState` garantiza el canal (y sustituye
          // el último recurso si el endpoint lo omitió). Esta rama es solo para
          // cuando la lectura falla del todo: entonces no hay informe tampoco
          // —`reportSlug` viene con el estado— así que no hay tercera fuente que
          // consultar, y el bloque de soporte se pinta con la constante.
          soporte={state?.soporte ?? { email: SOPORTE_ULTIMO_RECURSO }}
          plataformaUrl={env.NEXT_PUBLIC_PLATFORM_SIGN_IN_URL}
        />
      </main>
    </PageShell>
  );
}

/**
 * El aviso del enlace que no valía, para quien ya tenía sesión. No es un error de
 * la página —la sesión sigue siendo buena— así que va como `status` y no como
 * `alert`, y en el tono neutro del sistema y no en rojo.
 */
function AvisoEnlace() {
  return (
    <div
      className={`relative z-10 mx-auto w-full max-w-4xl px-5 sm:px-8 ${PT_BAJO_CABECERA}`}
    >
      <p
        role="status"
        className="font-body rounded-lg border border-cyan-800/20 bg-cyan-50/70 px-4 py-3 text-xs leading-5 text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-50"
      >
        <span className="font-semibold">{ENLACE_NO_VALIDO.titulo}.</span> Sigues
        dentro con la sesión que ya tenías. {ENLACE_NO_VALIDO.cuerpo}
      </p>
    </div>
  );
}

/** La cara sin sesión: una frase que explica por qué, y el formulario debajo. */
function AccesoPantalla({
  motivo,
}: {
  motivo: "enlace" | "caducada" | "ninguno";
}) {
  return (
    <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-32 pb-24 sm:px-8">
      <Eyebrow>Espacio de cliente</Eyebrow>
      <h1 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-50">
        {motivo === "enlace"
          ? ENLACE_NO_VALIDO.titulo
          : "Entra con tu correo institucional"}
      </h1>
      <p className="font-body mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
        {motivo === "enlace"
          ? ENLACE_NO_VALIDO.cuerpo
          : motivo === "caducada"
            ? "Tu sesión ha caducado, que es lo normal después de unos días. Pide un enlace nuevo y entras al instante: no hay contraseña que recordar."
            : "Te enviamos un enlace de acceso al correo con el que se hizo la evaluación. Sin contraseñas: el enlace caduca en 30 minutos y sirve una sola vez."}
      </p>
      <AccesoForm className="mt-8" />
      <p className="font-body mt-6 text-xs leading-5 text-slate-500 dark:text-slate-400">
        Aquí se consulta el estado de una suscripción de AWS Marketplace. No es
        el acceso a la plataforma clínica.
      </p>
    </div>
  );
}

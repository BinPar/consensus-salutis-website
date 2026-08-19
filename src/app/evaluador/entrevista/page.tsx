/**
 * Etapa 1 del evaluador de idoneidad: la entrevista adaptativa (issue #5).
 *
 * ## Por qué esta página es de servidor y la de dentro no
 *
 * La sesión vive en una cookie `HttpOnly`, así que ningún script del navegador
 * puede leerla. Esta página la lee en el servidor, **comprueba la firma antes de
 * pintar nada**, y entrega el token ya verificado al componente de cliente, que
 * es quien abre el stream contra Convex.
 *
 * Verificarla aquí no es redundante con el 401 del endpoint: sin esta
 * comprobación, quien llega sin cookie —o con una caducada— vería la pantalla de
 * la entrevista montarse entera y colapsar en un error un segundo después. Con
 * ella, ve directamente el mensaje que le corresponde. El endpoint sigue siendo
 * la autoridad; esto es lo que hace que el fallo se vea bien.
 *
 * ## No indexable
 *
 * `noindex`: es una pantalla de sesión, no una página del sitio. Sin esto un
 * buscador acabaría publicando la URL de una entrevista, que siempre respondería
 * «vuelve a identificarte» a quien la abriera desde el resultado.
 *
 * ## El fondo es el del sitio, no el del navegador
 *
 * `HomeMotionBackground` —la rejilla de 44px sobre `#fbfdff` / `#06111f`— va aquí
 * y no dentro de `InterviewScreen`: el aviso de sesión caducada se pinta desde
 * esta misma página y necesita el mismo suelo. Sin él la entrevista quedaba como
 * una tarjeta flotando sobre el color plano del `body`, que es el único sitio del
 * sitio donde ese suelo no aparece. Aquí no se añade `SignalField`: la pantalla
 * es una app a pantalla completa y el campo animado detrás de una tarjeta de
 * cristal a `100dvh` solo se ve por los bordes.
 */

import type { Metadata } from "next";
import { cookies } from "next/headers";

import { InterviewScreen } from "~/app/_components/interview/interview-screen";
import { SessionNotice } from "~/app/_components/interview/session-notice";
import { HomeMotionBackground } from "~/app/_components/motion-system";
import { PageShell } from "~/app/_components/site";
import { env } from "~/env";
import {
  SESSION_COOKIE_NAME,
  verifySession,
} from "~/server/marketplace/session";

export const metadata: Metadata = {
  title: "Entrevista de evaluación",
  description:
    "Entrevista guiada del evaluador de idoneidad de Consensus Salutis.",
  robots: { index: false, follow: false },
};

/** La cookie es por visita: nada de esta página se puede prerrenderizar. */
export const dynamic = "force-dynamic";

export default async function EntrevistaPage() {
  const cookieStore = await cookies();
  const session = verifySession(
    cookieStore.get(SESSION_COOKIE_NAME)?.value,
    { secret: env.MARKETPLACE_SESSION_SECRET },
  );

  /*
    Se distinguen los dos casos porque no significan lo mismo para quien lo lee:
    una sesión caducada dice «lo tuyo sigue ahí, vuelve a entrar»; una ausente es
    casi siempre alguien que ha llegado a la URL sin pasar por el formulario, y
    lo que necesita es saber por dónde se empieza.
  */
  if (!session.ok) {
    return (
      <PageShell>
        <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
          <HomeMotionBackground />
          <SessionNotice expired={session.reason === "expired"} />
        </main>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />
        <InterviewScreen
          token={cookieStore.get(SESSION_COOKIE_NAME)!.value}
          convexSiteUrl={env.NEXT_PUBLIC_CONVEX_SITE_URL}
        />
      </main>
    </PageShell>
  );
}

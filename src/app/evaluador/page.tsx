/**
 * Página del evaluador de idoneidad — Etapa 0.
 *
 * ## Por qué `/evaluador` y no `/aws/eligibility`
 *
 * El evaluador se publica **antes** que el listing y es accesible sin venir de
 * AWS: es un producto público, y un producto público no debería colgar de una
 * ruta que nombra a un canal de distribución concreto. Cuando llegue #3,
 * `/aws/registration` redirige aquí. La única diferencia entre las dos
 * procedencias es la cookie: con suscripción lleva `awsAccountId`, sin ella solo
 * `assessmentId`.
 *
 * ## Es la página de fulfillment que abre el revisor de AWS
 *
 * Tres requisitos del programa se cubren aquí, y los tres son visibles en esta
 * página y no en un footer genérico:
 *
 * - El campo de email, visible sin scroll.
 * - Las opciones de soporte: «Support contact options must be specified on the
 *   fulfillment landing page.»
 * - El acceso para clientes existentes: «If a customer already has an account…
 *   they must have the ability to log in from the fulfillment landing page.» Van
 *   dos enlaces, porque son dos identidades distintas.
 *
 * ## Por qué el shell es el del blog y no `PageHero`
 *
 * `PageHero` monta su propio titular a ancho completo y deja el contenido
 * debajo: aquí el formulario tiene que ir **al lado** del titular para que el
 * campo de email entre sin scroll, así que la cabecera se compone a mano. Lo que
 * no se compone a mano es el fondo: rejilla de 44px + `SignalField` sobre
 * `#fbfdff`, exactamente el mismo par que el home y el índice del blog. Sin eso
 * el evaluador se leía como una pantalla de otro producto pegada al sitio.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, LifeBuoy, LogIn, Mail, ShieldCheck } from "lucide-react";

import { EligibilityForm } from "~/app/_components/eligibility-form";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import { Eyebrow, PageShell, ThemeSection } from "~/app/_components/site";
import { env } from "~/env";
import { RETENTION_STATEMENT } from "~/lib/eligibility";
import {
  SESSION_COOKIE_NAME,
  verifySession,
} from "~/server/marketplace/session";

export const metadata: Metadata = {
  title: "Evaluador de idoneidad",
  description:
    "Comprueba si Consensus Salutis encaja en tu institución. Una entrevista guiada y un informe con el veredicto y sus motivos.",
};

const SUPPORT_EMAIL = "info@binpar.com";

/** Tarjeta de cristal del sistema: el mismo recipiente que métricas y blog. */
const glassCard =
  "rounded-2xl border border-cyan-800/15 bg-white/80 p-6 shadow-big-blocks backdrop-blur-xs dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]";

/** Botón fantasma del sistema, en su versión de bloque con dos líneas de texto. */
const ghostCard =
  "border-primary-light/25 font-body hover:border-primary-light/45 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-xl border bg-white/65 backdrop-blur-sm transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/30 dark:bg-white/3 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10";

export default async function EvaluadorPage() {
  /*
    «Abandono y vuelta» es un caso normal, no un borde: alguien deja la
    entrevista a medias y vuelve por la tarde a la URL que tiene a mano, que es
    ésta. Si su sesión sigue viva se le ofrece retomarla en vez de dejar que
    rellene el formulario otra vez y arranque una evaluación nueva.

    Volver a enviar el formulario también es legítimo —puede ser otra persona de
    la misma institución— y por eso el formulario sigue debajo, entero.
  */
  const cookieStore = await cookies();
  const session = verifySession(cookieStore.get(SESSION_COOKIE_NAME)?.value, {
    secret: env.MARKETPLACE_SESSION_SECRET,
  });

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />

        {/*
          El campo de email tiene que verse **sin scroll**, y en móvil eso manda
          sobre el orden natural de lectura: el formulario va justo detrás del
          titular y los tres pasos bajan al final (`order-last`). En escritorio
          hay sitio para las dos columnas, así que los pasos vuelven a su hueco
          bajo el titular mediante colocación explícita en la rejilla.

          El `pt` no baja de 20 (80px): la cabecera es `fixed` y mide 64px, así
          que menos que eso la solapa. Y no sube a los 32 del blog por lo mismo
          de siempre: cada píxel de aquí arriba empuja el campo de email hacia
          abajo, y ese campo no puede quedar fuera de la primera pantalla.
        */}
        <section className="relative isolate z-10 overflow-hidden border-b border-cyan-800/10 dark:border-cyan-300/10">
          <div className="pointer-events-none absolute inset-0 -right-50 z-0">
            <SignalField
              className="-top-48 h-[calc(100%+12rem)]"
              intensity="hero"
              opacity={0.72}
            />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-5 pt-20 pb-14 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-14 lg:pt-24 lg:pb-16">
            <div className="lg:col-start-1 lg:row-start-1">
              <Eyebrow>Evaluador de idoneidad</Eyebrow>
              <h1 className="font-display mt-4 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl lg:text-5xl dark:text-slate-50">
                ¿Encaja Consensus Salutis en tu institución?
              </h1>
              <p className="font-body mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Empieza por identificarte. Después, una entrevista guiada de
                unos minutos y un informe con el veredicto y sus motivos.
              </p>

              {session.ok ? (
                <Link
                  href="/evaluador/entrevista"
                  className={`${ghostCard} mt-6 flex max-w-xl items-center gap-3 px-4 py-3`}
                >
                  <span className="min-w-0 flex-1">
                    <span className="font-body block text-sm font-semibold text-cyan-800 dark:text-cyan-50">
                      Tienes una evaluación en curso
                    </span>
                    <span className="font-body mt-0.5 block text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Retómala donde la dejaste, con la ficha que ya habías
                      rellenado.
                    </span>
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="text-primary-light dark:text-primary-dark size-4 shrink-0"
                  />
                </Link>
              ) : null}
            </div>

            {/*
              Una sola tarjeta de cristal con las tres filas dentro, no tres
              cajas sueltas: el fondo translúcido de antes dejaba ver la rejilla
              a través del texto, y tres recipientes independientes competían
              con la tarjeta del formulario de al lado en vez de acompañarla.
            */}
            <ol className="font-body shadow-big-blocks order-last overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/80 text-sm text-slate-600 backdrop-blur-xs lg:order-none lg:col-start-1 lg:row-start-2 lg:mt-2 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:text-slate-400 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]">
              {[
                ["01", "Identificación", "Los datos de esta ficha."],
                ["02", "Entrevista guiada", "Preguntas según tu institución."],
                [
                  "03",
                  "Informe",
                  "Veredicto razonado, reenviable a dirección.",
                ],
              ].map(([step, title, detail]) => (
                <li
                  key={step}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-3 border-b border-cyan-800/10 px-5 py-4 last:border-b-0 dark:border-cyan-300/10"
                >
                  <span className="font-display text-primary-light dark:text-primary-dark text-sm font-bold">
                    {step}
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {title}
                    </span>{" "}
                    — {detail}
                  </span>
                </li>
              ))}
            </ol>

            <EligibilityForm className="lg:col-start-2 lg:row-span-2 lg:row-start-1" />
          </div>
        </section>

        {/*
          Soporte y acceso de clientes existentes. En la propia página de
          fulfillment, con contacto directo y no un enlace a un footer.
        */}
        <ThemeSection variant="panel" className="z-10">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <Eyebrow>Soporte y acceso</Eyebrow>
            <h2 className="font-display mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
              Contacto directo y puerta de entrada si ya trabajas con nosotros.
            </h2>
            <p className="font-body mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
              Responde el equipo que mantiene la plataforma. Y si ya tienes una
              evaluación abierta o una cuenta activa, no hace falta empezar de
              cero.
            </p>

            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              <section aria-labelledby="soporte" className={glassCard}>
                <LifeBuoy
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="text-primary-light dark:text-primary-dark size-5"
                />
                <h3
                  id="soporte"
                  className="font-display mt-4 text-lg font-semibold text-[#05215e] dark:text-slate-50"
                >
                  Soporte
                </h3>
                <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Escríbenos y te responde el equipo de BinPar. Tiempo de
                  respuesta habitual: un día laborable.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Soporte%20evaluador%20Consensus%20Salutis`}
                  className="font-body text-primary-light dark:text-secondary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark mt-4 inline-flex items-center gap-2 rounded-sm text-sm font-semibold underline underline-offset-4 hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:text-cyan-200"
                >
                  <Mail
                    aria-hidden="true"
                    strokeWidth={1.8}
                    className="size-4"
                  />
                  {SUPPORT_EMAIL}
                </a>
                <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Si prefieres hablarlo,{" "}
                  <Link
                    href="/contacto"
                    className="text-primary-light dark:text-secondary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
                  >
                    solicita una reunión
                  </Link>
                  .
                </p>
              </section>

              {/*
                Dos enlaces y no uno: son dos identidades distintas. El espacio
                de evaluación es la cookie de esta landing (#7); la plataforma es
                Clerk en apps/chat. No se cruzan nunca.
              */}
              <section
                aria-labelledby="acceso"
                className={`${glassCard} lg:col-span-2`}
              >
                <LogIn
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="text-primary-light dark:text-primary-dark size-5"
                />
                <h3
                  id="acceso"
                  className="font-display mt-4 text-lg font-semibold text-[#05215e] dark:text-slate-50"
                >
                  ¿Ya eres cliente?
                </h3>
                <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Si ya tienes una evaluación en curso o una cuenta en la
                  plataforma, entra directamente.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Link href="/espacio" className={`${ghostCard} px-5 py-4`}>
                    <span className="block text-sm font-semibold text-cyan-800 dark:text-cyan-50">
                      Acceder a mi espacio de evaluación
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Recibe un enlace de acceso en tu correo institucional.
                    </span>
                  </Link>
                  <a
                    href={env.NEXT_PUBLIC_PLATFORM_SIGN_IN_URL}
                    className={`${ghostCard} px-5 py-4`}
                  >
                    <span className="block text-sm font-semibold text-cyan-800 dark:text-cyan-50">
                      Entrar a la plataforma
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-400">
                      Para profesionales ya dados de alta en tu institución.
                    </span>
                  </a>
                </div>
              </section>
            </div>
          </div>
        </ThemeSection>

        <ThemeSection variant="transparent" className="z-10">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <Eyebrow>Protección de datos</Eyebrow>
            <h2 className="font-display mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
              Qué guardamos, y durante cuánto tiempo.
            </h2>
            <div className={`${glassCard} mt-8 flex max-w-3xl gap-4`}>
              <ShieldCheck
                aria-hidden="true"
                strokeWidth={1.8}
                className="text-primary-light dark:text-primary-dark mt-0.5 size-5 shrink-0"
              />
              {/*
                Misma frase, misma constante, que el texto del consentimiento
                del formulario y que /privacidad. Ver RETENTION_STATEMENT.
              */}
              <p className="font-body text-sm leading-6 text-slate-600 dark:text-slate-400">
                {RETENTION_STATEMENT} En esta evaluación no se tratan datos de
                salud de pacientes en ningún momento. El detalle está en la{" "}
                <Link
                  href="/privacidad"
                  className="text-primary-light dark:text-secondary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
                >
                  Política de Privacidad
                </Link>
                .
              </p>
            </div>
          </div>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

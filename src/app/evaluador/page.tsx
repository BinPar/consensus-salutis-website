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
 */

import type { Metadata } from "next";
import Link from "next/link";
import { LifeBuoy, LogIn, Mail, ShieldCheck } from "lucide-react";

import { EligibilityForm } from "~/app/_components/eligibility-form";
import { Eyebrow, PageShell, ThemeSection } from "~/app/_components/site";
import { env } from "~/env";
import { RETENTION_STATEMENT } from "~/lib/eligibility";

export const metadata: Metadata = {
  title: "Evaluador de idoneidad",
  description:
    "Comprueba si Consensus Salutis encaja en tu institución. Una entrevista guiada y un informe con el veredicto y sus motivos.",
};

const SUPPORT_EMAIL = "info@binpar.com";

export default function EvaluadorPage() {
  return (
    <PageShell>
      <main>
        {/*
          El campo de email tiene que verse **sin scroll**, y en móvil eso manda
          sobre el orden natural de lectura: el formulario va justo detrás del
          titular y los tres pasos bajan al final (`order-last`). En escritorio
          hay sitio para las dos columnas, así que los pasos vuelven a su hueco
          bajo el titular mediante colocación explícita en la rejilla.

          El `pt` no baja de 20 (80px): la cabecera es `fixed` y mide 64px, así
          que menos que eso la solapa.
        */}
        <ThemeSection className="!pb-14">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-14">
            <div className="lg:col-start-1 lg:row-start-1">
              <Eyebrow>Evaluador de idoneidad</Eyebrow>
              <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight text-[#05215e] sm:text-4xl lg:text-5xl dark:text-slate-50">
                ¿Encaja Consensus Salutis en tu institución?
              </h1>
              <p className="font-body mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Empieza por identificarte. Después, una entrevista guiada de unos
                minutos y un informe con el veredicto y sus motivos.
              </p>
            </div>

            <ol className="font-body order-last grid gap-3 text-sm text-slate-600 lg:order-none lg:col-start-1 lg:row-start-2 lg:mt-2 dark:text-slate-400">
              {[
                ["01", "Identificación", "Los datos de esta ficha."],
                ["02", "Entrevista guiada", "Preguntas según tu institución."],
                ["03", "Informe", "Veredicto razonado, reenviable a dirección."],
              ].map(([step, title, detail]) => (
                <li
                  key={step}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-3 rounded-md border border-cyan-800/10 bg-white/60 p-3 dark:border-cyan-300/10 dark:bg-white/3"
                >
                  <span className="text-primary-light dark:text-primary-dark text-sm font-semibold">
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
        </ThemeSection>

        {/*
          Soporte y acceso de clientes existentes. En la propia página de
          fulfillment, con contacto directo y no un enlace a un footer.
        */}
        <ThemeSection variant="panel" className="!py-14">
          <div className="mx-auto grid w-full max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-3">
            <section
              aria-labelledby="soporte"
              className="rounded-2xl border border-cyan-800/10 bg-white/75 p-6 shadow-sm backdrop-blur-sm dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-none"
            >
              <LifeBuoy
                aria-hidden="true"
                className="text-primary-light dark:text-primary-dark size-5"
              />
              <h2
                id="soporte"
                className="font-display mt-4 text-lg font-semibold text-[#05215e] dark:text-slate-50"
              >
                Soporte
              </h2>
              <p className="font-body mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Escríbenos y te responde el equipo de BinPar. Tiempo de respuesta
                habitual: un día laborable.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Soporte%20evaluador%20Consensus%20Salutis`}
                className="font-body text-primary-light dark:text-secondary-dark mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
              >
                <Mail aria-hidden="true" className="size-4" />
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
              Dos enlaces y no uno: son dos identidades distintas. El espacio de
              evaluación es la cookie de esta landing (#7); la plataforma es
              Clerk en apps/chat. No se cruzan nunca.
            */}
            <section
              aria-labelledby="acceso"
              className="rounded-2xl border border-cyan-800/10 bg-white/75 p-6 shadow-sm backdrop-blur-sm lg:col-span-2 dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-none"
            >
              <LogIn
                aria-hidden="true"
                className="text-primary-light dark:text-primary-dark size-5"
              />
              <h2
                id="acceso"
                className="font-display mt-4 text-lg font-semibold text-[#05215e] dark:text-slate-50"
              >
                ¿Ya eres cliente?
              </h2>
              <p className="font-body mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Si ya tienes una evaluación en curso o una cuenta en la
                plataforma, entra directamente.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link
                  href="/espacio"
                  className="border-primary-light/25 font-body hover:border-primary-light/45 rounded-xl border bg-white/70 px-5 py-4 transition hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/3 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10"
                >
                  <span className="block text-sm font-semibold text-cyan-800 dark:text-cyan-50">
                    Acceder a mi espacio de evaluación
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600 dark:text-slate-400">
                    Recibe un enlace de acceso en tu correo institucional.
                  </span>
                </Link>
                <a
                  href={env.NEXT_PUBLIC_PLATFORM_SIGN_IN_URL}
                  className="border-primary-light/25 font-body hover:border-primary-light/45 rounded-xl border bg-white/70 px-5 py-4 transition hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/3 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10"
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
        </ThemeSection>

        <ThemeSection className="!py-14">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="flex max-w-3xl gap-4 rounded-2xl border border-cyan-800/10 bg-white/70 p-6 dark:border-cyan-300/10 dark:bg-white/3">
              <ShieldCheck
                aria-hidden="true"
                className="text-primary-light dark:text-primary-dark mt-0.5 size-5 shrink-0"
              />
              <div>
                <h2 className="font-display text-lg font-semibold text-[#05215e] dark:text-slate-50">
                  Datos y retención
                </h2>
                {/*
                  Misma frase, misma constante, que el texto del consentimiento
                  del formulario y que /privacidad. Ver RETENTION_STATEMENT.
                */}
                <p className="font-body mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
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
          </div>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

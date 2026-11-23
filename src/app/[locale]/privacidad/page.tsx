import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import { ThemeSection, Eyebrow, PageShell } from "~/app/_components/site";
import { TranslationNotice } from "~/app/_components/legal-page";
import { localizedMetadata } from "~/i18n/metadata";
import { routing } from "~/i18n/routing";
import { resolveLocale, type LocaleParams } from "~/i18n/server";
import { PURPOSE_STATEMENT, RETENTION_STATEMENT } from "~/lib/eligibility";

import type { Messages } from "../../../../messages/es";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legal.privacy.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/privacidad"),
  };
}

export default async function PrivacyPage({ params }: LocaleParams) {
  const locale = await resolveLocale(params);
  const t = await getTranslations("legal");
  /*
    El evaluador solo existe en castellano y su consentimiento cita estas
    constantes: en castellano la política las usa tal cual, para que los dos
    textos no puedan divergir. En otro idioma va su traducción, y un test
    comprueba que el texto en castellano de los mensajes es idéntico a ellas.
  */
  const isDefaultLocale = locale === routing.defaultLocale;
  const purpose = isDefaultLocale
    ? PURPOSE_STATEMENT
    : t("privacy.evaluatorStatements.purpose");
  const retention = isDefaultLocale
    ? RETENTION_STATEMENT
    : t("privacy.evaluatorStatements.retention");
  const section = (
    id: Exclude<SectionId, "evaluator" | "evaluationRetention">,
  ) => (
    <LegalSection key={id} title={t(`privacy.sections.${id}.title`)}>
      {t(`privacy.sections.${id}.body`)}
    </LegalSection>
  );

  return (
    <PageShell>
      <main>
        <ThemeSection>
          <article className="mx-auto w-full max-w-4xl px-5 sm:px-8">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="font-display text-navy mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-slate-50">
              {t("privacy.title")}
            </h1>
            {!isDefaultLocale && <TranslationNotice />}
            <div className="font-body mt-10 space-y-8 text-base leading-8 text-slate-600 dark:text-slate-400">
              {section("controller")}
              {section("purpose")}
              {section("retention")}
              {/*
                Evaluador de idoneidad. El plazo y la finalidad salen de las
                mismas constantes que el texto del consentimiento en /evaluador:
                los dos textos tienen que decir lo mismo, y compartiendo la
                constante no pueden divergir editando solo uno. El evaluador solo
                existe en castellano, así que el enlace no lleva idioma.
              */}
              <LegalSection title={t("privacy.sections.evaluator.title")}>
                {t.rich("privacy.sections.evaluator.body", {
                  purpose,
                  link: (chunks) => (
                    <Link
                      href="/evaluador"
                      className="text-primary-light dark:text-primary-dark dark:hover:text-primary-dark underline underline-offset-4 hover:text-cyan-800"
                    >
                      {chunks}
                    </Link>
                  ),
                })}
              </LegalSection>
              <LegalSection
                title={t("privacy.sections.evaluationRetention.title")}
              >
                {/*
                  Retención indefinida, sostenida por el consentimiento. Misma
                  constante que el texto del consentimiento en /evaluador.
                */}
                {t("privacy.sections.evaluationRetention.body", {
                  retention,
                })}
              </LegalSection>
              {section("rights")}
              {section("security")}
            </div>
          </article>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

type SectionId = keyof Messages["legal"]["privacy"]["sections"];

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-display text-navy text-xl font-extrabold dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}

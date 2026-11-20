import { useLocale, useTranslations } from "next-intl";

import { ThemeSection, Eyebrow, PageShell } from "~/app/_components/site";
import { Link } from "~/i18n/navigation";
import { routing, type StaticPathname } from "~/i18n/routing";

/** Datos del titular, compartidos por las páginas legales. */
export const LEGAL_OWNER = {
  name: "BinPar Team S.L.",
  nif: "B85271930",
  address: "Paseo de la Castellana, 43, 4.ª planta, 28046 Madrid, España",
  email: "info@binpar.com",
} as const;

export const legalLinkClassName =
  "text-primary-light dark:text-primary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-primary-dark";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("legal");
  const locale = useLocale();

  return (
    <PageShell>
      <main>
        <ThemeSection>
          <article className="mx-auto w-full max-w-4xl px-5 sm:px-8">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="font-display text-navy mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-slate-50">
              {title}
            </h1>
            {locale !== routing.defaultLocale && <TranslationNotice />}
            <div className="font-body mt-10 space-y-8 text-base leading-8 text-slate-600 dark:text-slate-400">
              {children}
            </div>
          </article>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

/**
 * Aviso de las traducciones de los textos legales: el que vincula es el
 * castellano, que es el que se ha revisado jurídicamente.
 */
export function TranslationNotice() {
  const t = useTranslations("legal");

  return (
    <p className="font-body mt-5 max-w-3xl text-sm leading-6 text-slate-500 italic dark:text-slate-400">
      {t("translationNotice")}
    </p>
  );
}

export function LegalSection({
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
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function LegalLink({
  href,
  children,
}: {
  href: StaticPathname;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={legalLinkClassName}>
      {children}
    </Link>
  );
}

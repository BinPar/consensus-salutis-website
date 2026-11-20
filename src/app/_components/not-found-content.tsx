import { getTranslations } from "next-intl/server";

import { PageShell, ThemeSection, Eyebrow } from "~/app/_components/site";
import { Link } from "~/i18n/navigation";

/**
 * La página 404 del sitio, con cabecera y pie.
 *
 * La usan `[locale]/not-found.tsx` (URL con idioma que no existe) y
 * `global-not-found.tsx` (URL que no casa con ninguna ruta).
 */
export async function NotFoundContent() {
  const t = await getTranslations("common.notFound");

  return (
    <PageShell>
      <main>
        <ThemeSection className="min-h-[60vh]">
          <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h1 className="font-display text-navy mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-slate-50">
              {t("title")}
            </h1>
            <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              {t("body")}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="bg-primary-light font-body dark:bg-primary-dark dark:hover:bg-primary-dark/85 min-h-10 rounded-full px-5 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 dark:text-[#04111e]"
              >
                {t("home")}
              </Link>
              <Link
                href="/contacto"
                className="border-primary-light/25 font-body hover:border-primary-light/45 dark:border-primary-dark/30 dark:hover:border-primary-dark/50 dark:hover:bg-primary-dark/10 min-h-10 rounded-full border bg-white/65 px-5 py-2 text-center text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:bg-white/3 dark:text-slate-100"
              >
                {t("contact")}
              </Link>
            </div>
          </div>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

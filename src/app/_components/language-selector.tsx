"use client";

import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

import { usePathname, useRouter } from "~/i18n/navigation";
import { LOCALE_NAMES, routing, type Locale } from "~/i18n/routing";

import { useLocaleAlternates } from "./locale-alternates";
import { SelectMenu } from "./select-menu";

/* Cada idioma con su nombre en ese idioma: así lo reconoce quien lo habla. */
const languages = routing.locales.map((locale) => ({
  value: locale,
  label: LOCALE_NAMES[locale],
  lang: locale,
}));

function isLocalizedPathname(
  pathname: string,
): pathname is keyof typeof routing.pathnames {
  return pathname in routing.pathnames;
}

/**
 * Cambia el idioma quedándose en la misma página.
 *
 * - Una página con las mismas rutas en todos los idiomas: la misma ruta en el
 *   otro idioma (`/plataforma` → `/en/platform`).
 * - Un post o una etiqueta del blog: su versión en el otro idioma, o el índice
 *   del blog si no la hay (`LocaleAlternates`).
 * - Las secciones que solo existen en castellano (el evaluador, el espacio):
 *   la home del otro idioma.
 */
export function LanguageSelector() {
  const t = useTranslations("layout.language");
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const alternates = useLocaleAlternates();
  const [, startTransition] = useTransition();

  function changeLocale(next: Locale) {
    if (next === locale) return;

    startTransition(() => {
      if (alternates) {
        router.replace(alternates.versions[next] ?? alternates.fallback, {
          locale: next,
        });
      } else if (isLocalizedPathname(pathname)) {
        router.replace(
          // @ts-expect-error -- `pathname` y `params` vienen de la misma ruta,
          // así que siempre casan; el tipo no puede saberlo.
          { pathname, params },
          { locale: next },
        );
      } else {
        router.replace("/", { locale: next });
      }
    });
  }

  return (
    <SelectMenu
      value={locale}
      onChange={changeLocale}
      options={languages}
      label={t("select")}
      className="shrink-0"
      menuClassName="w-36"
      triggerClassName="font-body border-primary-light/20 hover:border-primary-light/40 dark:bg-primary-dark/8 dark:text-primary-dark inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border bg-white/30 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none dark:border-primary-dark/20 dark:hover:border-primary-dark/45 dark:hover:bg-primary-dark/15 dark:hover:text-primary-dark dark:focus-visible:outline-primary-dark"
      triggerContent={
        <>
          <Globe aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>{locale.toUpperCase()}</span>
        </>
      }
    />
  );
}

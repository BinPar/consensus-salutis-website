/**
 * Metadatos que dependen del idioma: canonical, hreflang y Open Graph.
 *
 * Cada página de `[locale]` los genera con `localizedMetadata`. Las URL salen
 * de `pathnames` (`./routing`), así que al traducir una ruta el canonical, el
 * hreflang y el sitemap se actualizan solos.
 */
import type { Metadata } from "next";

import { absoluteUrl, getSiteUrl } from "~/lib/site";

import { getPathname } from "./navigation";
import { OG_LOCALES, routing, type Locale } from "./routing";

export type LocalizedHref = Parameters<typeof getPathname>[0]["href"];

/**
 * URL absoluta de una ruta en un idioma, con su prefijo y su slug. La home del
 * idioma por defecto va sin barra final, como en el sitemap.
 */
export function localizedUrl(locale: Locale, href: LocalizedHref) {
  const pathname = getPathname({ locale, href });

  return pathname === "/" ? getSiteUrl() : absoluteUrl(pathname);
}

/** La ruta de la página en cada idioma en que existe. */
export type LocalizedVersions = Partial<Record<Locale, LocalizedHref>>;

/** Una página que existe igual en todos los idiomas (lo normal). */
export function allLocales(href: LocalizedHref): LocalizedVersions {
  return Object.fromEntries(routing.locales.map((locale) => [locale, href]));
}

/**
 * Las versiones de una página para el hreflang, más `x-default` si existe en el
 * idioma por defecto. Un post sin traducir solo lista su propio idioma.
 */
export function languageAlternates(versions: LocalizedVersions) {
  const languages: Record<string, string> = {};

  for (const locale of routing.locales) {
    const href = versions[locale];

    if (href) languages[locale] = localizedUrl(locale, href);
  }

  const fallback = versions[routing.defaultLocale];

  if (fallback) {
    languages["x-default"] = localizedUrl(routing.defaultLocale, fallback);
  }

  return languages;
}

/** El feed RSS del blog en cada idioma. */
export function rssPath(locale: Locale) {
  return locale === routing.defaultLocale
    ? "/blog/rss.xml"
    : `/${locale}/blog/rss.xml`;
}

export function localizedMetadata(
  locale: Locale,
  href: LocalizedHref,
  versions: LocalizedVersions = allLocales(href),
): Pick<Metadata, "alternates" | "openGraph"> {
  const url = localizedUrl(locale, href);

  return {
    alternates: {
      canonical: url,
      languages: languageAlternates(versions),
      /*
        Next no mezcla `alternates` entre layout y página: la de la página
        sustituye entera a la del layout, así que el feed va aquí.
      */
      types: { "application/rss+xml": rssPath(locale) },
    },
    openGraph: {
      type: "website",
      siteName: "BinPar",
      locale: OG_LOCALES[locale],
      url,
    },
  };
}

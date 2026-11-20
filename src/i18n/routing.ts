/**
 * Idiomas y URLs del sitio.
 *
 * - El castellano va sin prefijo (`/plataforma`) y el resto con él
 *   (`/en/...`): las URLs que ya tiene indexadas Google no cambian.
 * - Sin detección automática ni cookie: una URL sirve siempre el mismo idioma,
 *   que es lo que necesita un buscador, y el idioma solo cambia con el selector.
 * - Sin cabecera `Link` de idiomas alternativos: el hreflang sale de los
 *   metadatos de cada página (`~/i18n/metadata`), una sola fuente.
 * - `pathnames` lleva las rutas internas (las carpetas de `src/app/[locale]`) a
 *   la URL pública de cada idioma. Al añadir un idioma se añade aquí su
 *   traducción de cada ruta.
 *
 * El evaluador, el informe, el espacio de cliente y la entrada de AWS quedan
 * fuera a propósito: viven fuera de `[locale]`, solo en castellano, y el
 * middleware no los toca.
 */
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["es", "en"],
  defaultLocale: "es",
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: false,
  alternateLinks: false,
  pathnames: {
    "/": "/",
    "/plataforma": { es: "/plataforma", en: "/platform" },
    "/plataforma/funcionalidades": {
      es: "/plataforma/funcionalidades",
      en: "/platform/features",
    },
    "/equipo": { es: "/equipo", en: "/team" },
    "/contacto": { es: "/contacto", en: "/contact" },
    "/privacidad": { es: "/privacidad", en: "/privacy" },
    "/aviso-legal": { es: "/aviso-legal", en: "/legal-notice" },
    "/cookies": "/cookies",
    "/blog": "/blog",
    /* Los slugs de cada post y cada etiqueta ya están en su idioma. */
    "/blog/[slug]": "/blog/[slug]",
    "/blog/tag/[tag]": "/blog/tag/[tag]",
  },
});

export type Locale = (typeof routing.locales)[number];

/** Ruta interna de una página de `[locale]` (la carpeta, en castellano). */
export type AppPathname = keyof typeof routing.pathnames;

/**
 * Ruta interna sin segmentos dinámicos: la que acepta `Link` como `href` de
 * texto. Las dinámicas (`/blog/[slug]`) van como `{ pathname, params }`.
 */
export type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;

/** Nombre de cada idioma en ese idioma, para el selector. No se traduce. */
export const LOCALE_NAMES: Record<Locale, string> = {
  es: "Español",
  en: "English",
};

/** Etiqueta de idioma completa, para `Intl`, JSON-LD y RSS. */
export const LOCALE_TAGS: Record<Locale, string> = {
  es: "es-ES",
  en: "en-GB",
};

/** Formato de Open Graph (`og:locale`). */
export const OG_LOCALES: Record<Locale, string> = {
  es: "es_ES",
  en: "en_GB",
};

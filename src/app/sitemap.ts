/**
 * Sitemap de **todo el sitio**, no solo del blog: hasta ahora no había ninguno
 * para ninguna página.
 *
 * Las rutas públicas se listan a mano y las del blog salen del loader. A mano
 * porque el sistema de ficheros no distingue una página pública de una privada
 * —`/informe/[slug]` y `/plataforma` son los dos un `page.tsx`— y esa distinción
 * es justo la que no puede equivocarse: lo que entra aquí es lo que Google
 * intentará indexar. El test fija la lista contra las rutas del repositorio para
 * que una página nueva no se quede fuera en silencio.
 *
 * Las páginas de `[locale]` salen una vez por idioma, cada una con la lista de
 * sus versiones en los demás (`alternates.languages`, el hreflang del sitemap).
 * `/evaluador` vive fuera de `[locale]` y solo existe en castellano.
 */
import type { MetadataRoute } from "next";

import {
  allLocales,
  languageAlternates,
  localizedUrl,
  type LocalizedVersions,
} from "~/i18n/metadata";
import { routing, type Locale, type StaticPathname } from "~/i18n/routing";
import { getBlogPosts, getBlogPostVersions, getBlogTags } from "~/lib/blog";
import { getSiteUrl } from "~/lib/site";

/** Rutas públicas estáticas, con su prioridad relativa. */
export const PUBLIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/plataforma", priority: 0.9 },
  { path: "/plataforma/funcionalidades", priority: 0.8 },
  { path: "/equipo", priority: 0.7 },
  { path: "/evaluador", priority: 0.8 },
  { path: "/contacto", priority: 0.6 },
  { path: "/privacidad", priority: 0.3 },
  { path: "/aviso-legal", priority: 0.2 },
  { path: "/cookies", priority: 0.2 },
  { path: "/blog", priority: 0.9 },
] as const;

/**
 * Rutas fuera del índice: ni sitemap ni `robots.txt`.
 *
 * `/informe` y `/espacio` cuelgan de una sesión o de un token de un solo uso,
 * `/aws` es la entrada del canal de distribución y `/evaluador/entrevista` es
 * una conversación en curso. Ninguna es una página que tenga sentido abrir desde
 * un resultado de búsqueda. Las páginas ya llevan `robots: noindex`; esto evita
 * además que se rastreen.
 */
export const PRIVATE_PATH_PREFIXES = [
  "/casos-lab",
  "/informe",
  "/espacio",
  "/aws",
  "/evaluador/entrevista",
  "/api",
] as const;

type SitemapEntry = MetadataRoute.Sitemap[number];
type EntryData = Omit<SitemapEntry, "url" | "alternates">;

function isLocalizedPath(path: string): path is StaticPathname {
  return path in routing.pathnames;
}

/** La entrada de una página en un idioma, con las URL de sus otras versiones. */
function localizedEntry(
  locale: Locale,
  versions: LocalizedVersions,
  entry: EntryData,
): SitemapEntry[] {
  const href = versions[locale];

  if (!href) return [];

  return [
    {
      ...entry,
      url: localizedUrl(locale, href),
      alternates: { languages: languageAlternates(versions) },
    },
  ];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const staticEntries = PUBLIC_ROUTES.flatMap(({ path, priority }) =>
    isLocalizedPath(path)
      ? routing.locales.flatMap((locale) =>
          localizedEntry(locale, allLocales(path), {
            lastModified: now,
            priority,
          }),
        )
      : [
          {
            url: `${siteUrl}${path}`,
            lastModified: now,
            priority,
          },
        ],
  );

  /* Cada post, en su idioma, con sus traducciones como alternativas. */
  const postEntries = routing.locales.flatMap((locale) =>
    getBlogPosts(locale).flatMap((post) =>
      localizedEntry(locale, getBlogPostVersions(post), {
        /* `updatedAt` si el post se ha corregido; si no, su fecha de publicación. */
        lastModified: new Date(post.updatedAt ?? post.date),
        priority: 0.7,
      }),
    ),
  );

  /* Las etiquetas son de cada idioma: cada una solo existe en el suyo. */
  const tagEntries = routing.locales.flatMap((locale) =>
    getBlogTags(getBlogPosts(locale)).flatMap((entry) =>
      localizedEntry(
        locale,
        {
          [locale]: { pathname: "/blog/tag/[tag]", params: { tag: entry.tag } },
        },
        { lastModified: now, priority: 0.5 },
      ),
    ),
  );

  return [...staticEntries, ...postEntries, ...tagEntries];
}

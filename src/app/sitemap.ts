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
 */
import type { MetadataRoute } from "next";

import { getBlogPosts, getBlogTags } from "~/lib/blog";
import { getSiteUrl } from "~/lib/site";

/** Rutas públicas estáticas, con su prioridad relativa. */
export const PUBLIC_ROUTES = [
  { path: "/", priority: 1 },
  { path: "/plataforma", priority: 0.9 },
  { path: "/evidencia", priority: 0.8 },
  { path: "/seguridad", priority: 0.8 },
  { path: "/casos", priority: 0.8 },
  { path: "/evaluador", priority: 0.8 },
  /*
    `/about` y `/contact` no están: son redirecciones a `/plataforma` y
    `/contacto`. Una redirección en el sitemap es una URL que Google sigue para
    encontrar otra que ya está listada.
  */
  { path: "/contacto", priority: 0.6 },
  { path: "/privacidad", priority: 0.3 },
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
  "/informe",
  "/espacio",
  "/aws",
  "/evaluador/entrevista",
  "/api",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const posts = getBlogPosts();
  const now = new Date();

  const staticEntries = PUBLIC_ROUTES.map((route) => ({
    url: `${siteUrl}${route.path === "/" ? "" : route.path}`,
    lastModified: now,
    priority: route.priority,
  }));

  const postEntries = posts.map((post) => ({
    url: `${siteUrl}${post.href}`,
    /* `updatedAt` si el post se ha corregido; si no, su fecha de publicación. */
    lastModified: new Date(post.updatedAt ?? post.date),
    priority: 0.7,
  }));

  const tagEntries = getBlogTags(posts).map((entry) => ({
    url: `${siteUrl}/blog/tag/${entry.tag}`,
    lastModified: now,
    priority: 0.5,
  }));

  return [...staticEntries, ...postEntries, ...tagEntries];
}

/**
 * Feed RSS 2.0 del blog, generado del loader y sin dependencias.
 *
 * Hereda el filtro de borradores y fechas futuras de `getBlogPosts()`, así que
 * en producción el feed no puede adelantar un post que la web todavía no
 * muestra.
 */
import { getBlogPosts } from "~/lib/blog";
import { absoluteUrl, getSiteUrl } from "~/lib/site";

const TITLE = "BinPar · Lecturas clínicas";
const DESCRIPTION =
  "Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas formas de transformar la asistencia al paciente en el sistema de salud.";

/** Escapa los cinco caracteres que no pueden ir crudos en texto XML. */
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* RFC 822 es lo que pide RSS; `toUTCString()` lo da tal cual. */
function toRfc822(day: string) {
  return new Date(`${day}T00:00:00Z`).toUTCString();
}

export function GET() {
  const siteUrl = getSiteUrl();
  const posts = getBlogPosts();
  const lastBuildDate = posts[0]
    ? toRfc822(posts[0].updatedAt ?? posts[0].date)
    : new Date().toUTCString();

  const items = posts
    .map((post) =>
      [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(absoluteUrl(post.href))}</link>`,
        `      <guid isPermaLink="true">${escapeXml(absoluteUrl(post.href))}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`,
        ...post.tags.map(
          (tag) => `      <category>${escapeXml(tag)}</category>`,
        ),
        "    </item>",
      ].join("\n"),
    )
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    /* `dc:creator` y no `<author>`: RSS 2.0 exige un email en `author` y aquí la firma es un nombre. */
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(TITLE)}</title>`,
    `    <link>${escapeXml(`${siteUrl}/blog`)}</link>`,
    `    <description>${escapeXml(DESCRIPTION)}</description>`,
    "    <language>es-ES</language>",
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(`${siteUrl}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />`,
    items,
    "  </channel>",
    "</rss>",
  ]
    /* Sin posts, `items` es cadena vacía y no debe dejar una línea en blanco. */
    .filter((line) => line !== "")
    .join("\n");

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=3600",
    },
  });
}

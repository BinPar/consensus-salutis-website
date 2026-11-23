/**
 * Feed RSS 2.0 del blog de un idioma, generado del loader y sin dependencias.
 *
 * Hereda el filtro de borradores y fechas futuras de `getBlogPosts()`, así que
 * en producción el feed no puede adelantar un post que la web todavía no
 * muestra. Es síncrono a propósito (traductor de `createTranslator` con los
 * mensajes importados): se puede llamar fuera de una petición de Next, como
 * hace el test de descubribilidad.
 */
import { createTranslator } from "next-intl";

import { localizedUrl, rssPath } from "~/i18n/metadata";
import { LOCALE_TAGS, type Locale } from "~/i18n/routing";
import { getBlogPosts } from "~/lib/blog";
import { absoluteUrl } from "~/lib/site";

import ca from "../../messages/ca";
import en from "../../messages/en";
import es from "../../messages/es";
import eu from "../../messages/eu";
import gl from "../../messages/gl";

const messages = { es, en, ca, gl, eu } satisfies Record<Locale, unknown>;

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

export function blogRssResponse(locale: Locale) {
  const t = createTranslator({
    locale,
    messages: messages[locale],
    namespace: "blog.rss",
  });
  const posts = getBlogPosts(locale);
  const lastBuildDate = posts[0]
    ? toRfc822(posts[0].updatedAt ?? posts[0].date)
    : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = localizedUrl(locale, {
        pathname: "/blog/[slug]",
        params: { slug: post.slug },
      });

      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(url)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(url)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.excerpt)}</description>`,
        `      <dc:creator>${escapeXml(post.author.name)}</dc:creator>`,
        ...post.tags.map(
          (tag) => `      <category>${escapeXml(tag)}</category>`,
        ),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    /* `dc:creator` y no `<author>`: RSS 2.0 exige un email en `author` y aquí la firma es un nombre. */
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(t("title"))}</title>`,
    `    <link>${escapeXml(localizedUrl(locale, "/blog"))}</link>`,
    `    <description>${escapeXml(t("description"))}</description>`,
    `    <language>${LOCALE_TAGS[locale]}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(absoluteUrl(rssPath(locale)))}" rel="self" type="application/rss+xml" />`,
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

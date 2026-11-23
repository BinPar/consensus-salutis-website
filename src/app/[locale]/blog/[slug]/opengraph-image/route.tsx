/**
 * Imagen para compartir de cada post, 1200×630.
 *
 * Va aparte de la portada a propósito. La portada es 16:7, decorativa y no lleva
 * texto; la tarjeta de LinkedIn o X necesita 1200×630 y que el título se lea. Y
 * esta se genera **siempre**, a partir del título y de la marca: no depende de
 * que el post tenga `image` ni de que ningún generador externo haya funcionado.
 * El diseño es la tarjeta de marca de `og-card.tsx`.
 *
 * Es un route handler y no el fichero `opengraph-image.tsx` de Next: bajo
 * `[locale]`, Next anunciaría la imagen en `/es/blog/...`, una URL que el
 * middleware redirige. Así la URL la escribe la página (`OG_IMAGE` en
 * `og-image.ts`) y es la misma de siempre, sin prefijo.
 */
import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";

import { formatBlogDate } from "~/app/_components/blog/blog-post-format";
import { ogCard } from "~/app/_components/og-card";
import { routing } from "~/i18n/routing";
import { getBlogPostBySlug } from "~/lib/blog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: requestedLocale, slug } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "blog.og" });
  const format = await getFormatter({ locale });
  const post = getBlogPostBySlug(slug, locale);

  return ogCard({
    eyebrow: t("eyebrow"),
    title: post?.title ?? t("fallbackTitle"),
    footer: post
      ? `${post.author.name} · ${formatBlogDate(format, post.date)}`
      : "binpar.com",
  });
}

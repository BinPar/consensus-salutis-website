/**
 * Añade a los posts del loader las etiquetas en el idioma de la página.
 *
 * Solo servidor. Las páginas lo llaman antes de pasar los posts a componentes
 * de cliente: formatear en el navegador arriesga un desajuste de hidratación si
 * su ICU abrevia distinto que el de Node («sept» / «sep»).
 */
import { getFormatter, getTranslations } from "next-intl/server";

import type { Locale } from "~/i18n/routing";
import type { BlogPost, BlogPostData } from "~/lib/blog";

import { formatBlogDate } from "./blog-post-format";

export async function localizeBlogPosts(
  posts: BlogPostData[],
  locale: Locale,
): Promise<BlogPost[]> {
  const format = await getFormatter({ locale });
  const t = await getTranslations({ locale, namespace: "blog.post" });

  return posts.map((post) => ({
    ...post,
    createdAtLabel: formatBlogDate(format, post.date),
    updatedAtLabel: post.updatedAt
      ? formatBlogDate(format, post.updatedAt)
      : null,
    readTime: t("readTime", { minutes: post.readMinutes }),
  }));
}

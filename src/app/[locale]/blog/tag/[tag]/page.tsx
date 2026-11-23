/**
 * Índice filtrado por etiqueta.
 *
 * Sin paginación: los tags son subconjuntos y añadir `?page=` volvería dinámica
 * una ruta que `generateStaticParams` puede prerenderizar entera. Si algún tag
 * crece hasta necesitarla, se comparte `BlogPagination` con un `basePath`.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { BlogIndexView } from "~/app/_components/blog/blog-index-view";
import { localizeBlogPosts } from "~/app/_components/blog/localize-blog-posts";
import { LocaleAlternates } from "~/app/_components/locale-alternates";
import { PageShell } from "~/app/_components/site";
import { localizedMetadata } from "~/i18n/metadata";
import { routing } from "~/i18n/routing";
import { resolveLocale } from "~/i18n/server";
import {
  getBlogPosts,
  getBlogPostsByTag,
  getBlogTags,
  normalizeTag,
} from "~/lib/blog";

type TagPageProps = {
  params: Promise<{
    locale: string;
    tag: string;
  }>;
};

/*
  Las etiquetas de cada idioma salen de sus propios posts. Pares idioma + tag de
  todos los idiomas por lo mismo que en `[slug]`: un idioma sin tags no puede
  dejar sin prerenderizar a los demás.
*/
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogTags(getBlogPosts(locale)).map((entry) => ({
      locale,
      tag: entry.tag,
    })),
  );
}

/* Un tag que no está en el índice es 404, no una página vacía. */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "blog.meta.tag" });
  const { tag } = await params;
  const entry = getBlogTags(getBlogPosts(locale)).find(
    (candidate) => candidate.tag === normalizeTag(tag),
  );

  if (!entry) {
    return { title: t("notFound") };
  }

  const href = {
    pathname: "/blog/tag/[tag]",
    params: { tag: entry.tag },
  } as const;

  return {
    title: t("title", { tag: entry.label }),
    description: t("description", { tag: entry.label }),
    /* Una etiqueta solo existe en su idioma: no tiene versiones en otros. */
    ...localizedMetadata(locale, href, { [locale]: href }),
  };
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const locale = await resolveLocale(params);
  const { tag } = await params;
  const posts = await localizeBlogPosts(getBlogPosts(locale), locale);
  const tags = getBlogTags(posts);
  const entry = tags.find((candidate) => candidate.tag === normalizeTag(tag));

  if (!entry) {
    notFound();
  }

  const taggedPosts = getBlogPostsByTag(entry.tag, posts);

  return (
    /* Una etiqueta solo existe en su idioma: el selector lleva al blog del otro. */
    <LocaleAlternates
      versions={{
        [locale]: { pathname: "/blog/tag/[tag]", params: { tag: entry.tag } },
      }}
      fallback="/blog"
    >
      <PageShell>
        <BlogIndexView
          posts={taggedPosts}
          allPosts={posts}
          tags={tags}
          initialVisiblePosts={taggedPosts}
          initialPage={1}
          initialTotalPages={1}
          activeTag={entry.tag}
        />
      </PageShell>
    </LocaleAlternates>
  );
}

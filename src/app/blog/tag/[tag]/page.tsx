/**
 * Índice filtrado por etiqueta.
 *
 * Sin paginación: los tags son subconjuntos y añadir `?page=` volvería dinámica
 * una ruta que `generateStaticParams` puede prerenderizar entera. Si algún tag
 * crece hasta necesitarla, se comparte `BlogPagination` con un `basePath`.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  BlogGrid,
  BlogIndexShell,
  BlogTagFilter,
} from "~/app/_components/blog-index";
import { Eyebrow, PageShell } from "~/app/_components/site";
import {
  getBlogPosts,
  getBlogPostsByTag,
  getBlogTags,
  normalizeTag,
} from "~/lib/blog";
import { absoluteUrl } from "~/lib/site";

type TagPageProps = {
  params: Promise<{
    tag: string;
  }>;
};

export function generateStaticParams() {
  return getBlogTags().map((entry) => ({ tag: entry.tag }));
}

/* Un tag que no está en el índice es 404, no una página vacía. */
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { tag } = await params;
  const entry = getBlogTags().find(
    (candidate) => candidate.tag === normalizeTag(tag),
  );

  if (!entry) {
    return { title: "Etiqueta no encontrada" };
  }

  return {
    title: `Artículos sobre ${entry.label}`,
    description: `Lecturas clínicas de BinPar etiquetadas como «${entry.label}».`,
    alternates: {
      canonical: absoluteUrl(`/blog/tag/${entry.tag}`),
    },
  };
}

export default async function BlogTagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const posts = getBlogPosts();
  const tags = getBlogTags(posts);
  const entry = tags.find((candidate) => candidate.tag === normalizeTag(tag));

  if (!entry) {
    notFound();
  }

  const taggedPosts = getBlogPostsByTag(entry.tag, posts);

  return (
    <PageShell>
      <BlogIndexShell>
        <div className="max-w-4xl">
          <Eyebrow>Lecturas clínicas</Eyebrow>
          <h1 className="font-display mt-5 text-4xl font-extrabold tracking-tight text-[#05215e] sm:text-5xl dark:text-slate-50">
            {entry.label}
          </h1>
          <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            {taggedPosts.length === 1
              ? "Un artículo con esta etiqueta."
              : `${taggedPosts.length} artículos con esta etiqueta.`}
          </p>
        </div>

        <BlogTagFilter tags={tags} activeTag={entry.tag} />

        <BlogGrid posts={taggedPosts} />
      </BlogIndexShell>
    </PageShell>
  );
}

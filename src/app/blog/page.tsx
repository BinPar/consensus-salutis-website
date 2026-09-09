import type { Metadata } from "next";

import {
  BLOG_POSTS_PER_PAGE,
  BlogEmptyState,
  BlogGrid,
  BlogIndexShell,
  BlogPagination,
  BlogTagFilter,
} from "~/app/_components/blog-index";
import { Eyebrow, PageShell } from "~/app/_components/site";
import { getBlogPosts, getBlogTags } from "~/lib/blog";

export const metadata: Metadata = {
  title: "Nuestro blog",
  description:
    "Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas formas de transformar la asistencia al paciente en el sistema de salud.",
};

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function getPageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) ? parsed : 1;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const posts = getBlogPosts();
  const tags = getBlogTags(posts);
  const resolvedSearchParams = await searchParams;
  const requestedPage = getPageParam(resolvedSearchParams?.page);
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));
  const currentPage =
    requestedPage >= 1 && requestedPage <= totalPages ? requestedPage : 1;
  const startIndex = (currentPage - 1) * BLOG_POSTS_PER_PAGE;
  const visiblePosts = posts.slice(
    startIndex,
    startIndex + BLOG_POSTS_PER_PAGE,
  );

  return (
    <PageShell>
      <BlogIndexShell>
        <div className="max-w-4xl">
          <Eyebrow>Lecturas clínicas</Eyebrow>
          <h1 className="font-display mt-5 text-5xl font-extrabold tracking-tight text-[#05215e] sm:text-6xl dark:text-slate-50">
            Nuestro blog
          </h1>
          <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
            formas de transformar la asistencia al paciente en el sistema de
            salud.
          </p>
        </div>

        <BlogTagFilter tags={tags} />

        {posts.length === 0 ? (
          <BlogEmptyState />
        ) : (
          <>
            <BlogGrid posts={visiblePosts} />
            <BlogPagination currentPage={currentPage} totalPages={totalPages} />
          </>
        )}
      </BlogIndexShell>
    </PageShell>
  );
}

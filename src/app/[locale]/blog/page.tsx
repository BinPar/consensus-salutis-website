import type { Metadata } from "next";

import { BLOG_POSTS_PER_PAGE } from "~/app/_components/blog-index";
import { BlogIndexView } from "~/app/_components/blog/blog-index-view";
import { PageShell } from "~/app/_components/site";
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
      <BlogIndexView
        posts={posts}
        allPosts={posts}
        tags={tags}
        initialVisiblePosts={visiblePosts}
        initialPage={currentPage}
        initialTotalPages={totalPages}
      />
    </PageShell>
  );
}

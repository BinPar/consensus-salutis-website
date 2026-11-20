import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { BLOG_POSTS_PER_PAGE } from "~/app/_components/blog-index";
import { BlogIndexView } from "~/app/_components/blog/blog-index-view";
import { localizeBlogPosts } from "~/app/_components/blog/localize-blog-posts";
import { PageShell } from "~/app/_components/site";
import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";
import { getBlogPosts, getBlogTags } from "~/lib/blog";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "blog.meta.index" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/blog"),
  };
}

type BlogPageProps = LocaleParams & {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function getPageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) ? parsed : 1;
}

export default async function BlogPage({
  params,
  searchParams,
}: BlogPageProps) {
  const locale = await resolveLocale(params);
  const posts = await localizeBlogPosts(getBlogPosts(locale), locale);
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

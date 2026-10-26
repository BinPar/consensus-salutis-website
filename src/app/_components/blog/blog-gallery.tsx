"use client";

import { useState } from "react";
import type { BlogPost, BlogTag } from "~/lib/blog";
import {
  BlogEmptyState,
  BLOG_POSTS_PER_PAGE,
} from "~/app/_components/blog-index";
import { BlogAnimatedGrid } from "./blog-animated-grid";
import { BlogArticleList } from "./blog-article-list";
import { BlogPagination, type BlogSize } from "./blog-pagination";
import { BlogReveal } from "./blog-reveal";
import { BlogSearch } from "./blog-search";
import { BlogSort, type BlogSort as SortOrder } from "./blog-sort";
import { BlogTagFilter } from "./blog-tag-filter";
import { BlogViewToggle, type BlogGalleryView } from "./blog-view-toggle";
import { blogContentWidth } from "./blog-layout";

const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();

export type BlogGalleryProps = {
  /** Colección ya resuelta por la ruta: índice completo o subconjunto por tag. */
  posts: BlogPost[];
  allPosts: BlogPost[];
  tags: BlogTag[];
  initialVisiblePosts: BlogPost[];
  initialPage: number;
  initialTotalPages: number;
  activeTag?: string;
};

/** Capa de presentación. La ruta conserva la carga, el filtrado por tag y ?page=. */
export function BlogGallery({
  posts,
  allPosts,
  tags,
  initialVisiblePosts,
  initialPage,
  initialTotalPages,
  activeTag,
}: BlogGalleryProps) {
  const defaultSize = activeTag ? "all" : BLOG_POSTS_PER_PAGE;
  const [pageSize, setPageSize] = useState<BlogSize>(defaultSize);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<BlogGalleryView>("grid");
  const searchTerm = normalizeSearch(query);
  const filteredPosts = posts.filter(
    (post) =>
      !searchTerm ||
      normalizeSearch(
        [post.title, post.excerpt, ...post.tagLabels].join(" "),
      ).includes(searchTerm),
  );
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sort === "title")
      return a.title.localeCompare(b.title, "es", { sensitivity: "base" });
    const byDate =
      sort === "oldest"
        ? a.date.localeCompare(b.date)
        : b.date.localeCompare(a.date);
    return byDate || a.slug.localeCompare(b.slug, "es");
  });
  const customPresentation =
    !!searchTerm || sort !== "newest" || pageSize !== defaultSize;
  const totalPages = customPresentation
    ? Math.max(
        1,
        pageSize === "all" ? 1 : Math.ceil(filteredPosts.length / pageSize),
      )
    : initialTotalPages;
  const currentPage = customPresentation
    ? Math.min(page, totalPages)
    : initialPage;
  // El estado inicial utiliza exactamente los artículos seleccionados en el servidor.
  const visiblePosts = !customPresentation
    ? initialVisiblePosts
    : pageSize === "all"
      ? sortedPosts
      : sortedPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const articleNumbers = new Map(
    allPosts.map((post, index) => [post.slug, index + 1]),
  );
  const activeTagLabel = tags.find((tag) => tag.tag === activeTag)?.label;

  return (
    <section
      id="blog-page-gallery"
      tabIndex={-1}
      aria-label="Artículos del blog"
      className="scroll-mt-[calc(var(--blog-header-height,64px)+16px)] bg-[#fbfdff] pb-20 focus:outline-none lg:pb-24 dark:bg-[#06111f]"
    >
      <div className={blogContentWidth}>
        <BlogReveal className="sticky top-[var(--blog-header-height,64px)] z-30 flex flex-nowrap items-center gap-10 border-b border-cyan-800/15 bg-[#fbfdff]/95 py-2 backdrop-blur-xl dark:border-primary-dark/15 dark:bg-[#06111f]/95">
          <p className="font-display hidden shrink-0 text-base font-semibold tracking-tight text-[#05215e] md:block dark:text-slate-100">
            {activeTagLabel ?? "Todos los artículos"}
          </p>
          <div className="relative ml-auto flex min-w-0 flex-nowrap items-center justify-end gap-2 min-[1025px]:flex-1">
            <div className="w-40 min-w-0 shrink min-[1025px]:w-auto min-[1025px]:flex-1 [&>div]:mt-0 [&>nav]:ml-auto [&>nav]:mt-0 [&>nav]:w-max">
              <BlogTagFilter
                tags={tags}
                totalCount={allPosts.length}
                activeTag={activeTag}
              />
            </div>
            <span
              aria-hidden="true"
              className="h-6 w-px shrink-0 bg-cyan-800/20 dark:bg-primary-dark/20"
            />
            <BlogSort
              value={sort}
              onChange={(value) => {
                setSort(value);
                setPage(1);
              }}
            />
            <div className="flex shrink-0 items-center justify-end gap-2">
              <BlogViewToggle value={view} onChange={setView} />
              <BlogSearch
                value={query}
                onChange={(value) => {
                  setQuery(value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </BlogReveal>
        {posts.length === 0 ? (
          <BlogEmptyState />
        ) : filteredPosts.length === 0 ? (
          <div role="status" className="font-body py-16 text-center">
            <p className="text-base font-medium text-[#05215e] dark:text-slate-100">
              No se han encontrado artículos.
            </p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Prueba con otra búsqueda o cambia la etiqueta seleccionada.
            </p>
          </div>
        ) : (
          <>
            {view === "grid" ? (
              <BlogAnimatedGrid
                key={visiblePosts.map((post) => post.slug).join(",")}
                posts={visiblePosts}
              />
            ) : (
              <BlogArticleList
                key={visiblePosts.map((post) => post.slug).join(",")}
                posts={visiblePosts}
                numbers={articleNumbers}
              />
            )}
            <BlogReveal>
              <BlogPagination
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                allowAll={!!activeTag}
                pageHref={
                  !customPresentation && !activeTag
                    ? (nextPage) => `/blog?page=${nextPage}`
                    : undefined
                }
                onPageChange={(nextPage) => {
                  if (customPresentation) setPage(nextPage);
                }}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </BlogReveal>
          </>
        )}
      </div>
    </section>
  );
}

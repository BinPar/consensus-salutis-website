"use client";

import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Eyebrow } from "~/app/_components/eyebrow";
import { VerticalFooter } from "~/app/_components/site-footer";
import type { BlogPost, BlogTag } from "~/lib/blog";
import type { BlogPageDirection } from "./blog-page-directions";
import { BlogPageVariants } from "./blog-page-variants";
import { BlogPageReveal } from "./blog-page-reveal";
import { BlogPageSort, type BlogSort } from "./blog-page-sort";
import { BlogPageSearch } from "./blog-page-search";
import {
  BlogPageViewToggle,
  type BlogGalleryView,
} from "./blog-page-view-toggle";
import { BlogPageArticleList } from "./blog-page-article-list";
import {
  BLOG_POSTS_PER_PAGE,
  BlogPagination,
  type BlogPageSize,
} from "./blog-page-pagination";
import {
  createBlogPageSamples,
  getBlogPageSampleTags,
} from "./blog-page-samples";
import {
  BlogEmptyState,
  BlogGrid,
  BlogIndexShell,
  BlogTagFilter,
} from "./blog-page-reference-index";

const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();

export function BlogPageLab({
  posts: realPosts,
  tags: realTags,
  direction = "base",
}: {
  posts: BlogPost[];
  tags: BlogTag[];
  direction?: BlogPageDirection;
}) {
  const samples = createBlogPageSamples(realPosts[0]);
  const posts = [...realPosts, ...samples];
  const tags = getBlogPageSampleTags(posts);
  const [sample, setSample] = useState<BlogPost | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTitle = useId();
  const [activeTag, setActiveTag] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<BlogPageSize>(BLOG_POSTS_PER_PAGE);
  const [sort, setSort] = useState<BlogSort>("newest");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<BlogGalleryView>("grid");
  const articleNumbers = new Map(
    posts.map((post, index) => [post.slug, index + 1]),
  );
  const tag = tags.find((entry) => entry.tag === activeTag);
  const searchTerm = normalizeSearch(query);
  const filteredPosts = posts.filter(
    (post) =>
      (!tag || post.tags.includes(tag.tag)) &&
      (!searchTerm ||
        normalizeSearch(
          [post.title, post.excerpt, ...post.tagLabels].join(" "),
        ).includes(searchTerm)),
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
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = sortedPosts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const title = tag?.label ?? "Nuestro blog";
  const description = tag
    ? filteredPosts.length === 1
      ? "Un artículo con esta etiqueta."
      : `${filteredPosts.length} artículos con esta etiqueta.`
    : "Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas formas de transformar la asistencia al paciente en el sistema de salud.";
  const filters = (
    <BlogTagFilter
      tags={tags}
      totalCount={posts.length}
      activeTag={activeTag}
      onSelect={(nextTag) => {
        setActiveTag(nextTag);
        setPage(1);
      }}
    />
  );
  const sorting = (
    <BlogPageSort
      value={sort}
      onChange={(value) => {
        setSort(value);
        setPage(1);
      }}
    />
  );
  const search = (
    <BlogPageSearch
      value={query}
      onChange={(value) => {
        setQuery(value);
        setPage(1);
      }}
    />
  );
  const viewToggle = <BlogPageViewToggle value={view} onChange={setView} />;
  const gallery =
    posts.length === 0 ? (
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
      <div
        onClickCapture={(event) => {
          if (!(event.target instanceof Element)) return;
          const href = event.target.closest("a")?.getAttribute("href");
          const selected = samples.find((entry) => entry.href === href);
          if (!selected) return;
          event.preventDefault();
          setSample(selected);
          dialog.current?.showModal();
        }}
      >
        {view === "grid" ? (
          <BlogGrid posts={visiblePosts} />
        ) : (
          <BlogPageArticleList
            key={visiblePosts.map((post) => post.slug).join(",")}
            posts={visiblePosts}
            numbers={articleNumbers}
          />
        )}
        <BlogPageReveal>
          <BlogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </BlogPageReveal>
      </div>
    );

  return (
    <div
      data-blog-page-reference=""
      className="relative isolate z-10 bg-[#fbfdff] [clip-path:inset(0)] dark:bg-[#06111f]"
    >
      {direction === "base" ? (
        <BlogIndexShell>
          <BlogPageReveal className="max-w-4xl">
            <Eyebrow>Lecturas clínicas</Eyebrow>
            <h1
              className={`font-display mt-5 font-extrabold tracking-tight text-[#05215e] dark:text-slate-50 ${tag ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl"}`}
            >
              {title}
            </h1>
            <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              {description}
            </p>
          </BlogPageReveal>

          <BlogPageReveal className="sticky top-[var(--lab-toolbar-height,80px)] z-30 mt-10 ml-auto flex w-full max-w-[640px] flex-nowrap items-center justify-end gap-2 border-b border-cyan-800/15 bg-[#fbfdff]/95 py-2 backdrop-blur-xl md:gap-4 dark:border-cyan-300/15 dark:bg-[#06111f]/95">
            <div className="w-[160px] min-w-0 shrink min-[1025px]:w-auto min-[1025px]:flex-1 [&>div]:mt-0 [&>nav]:mt-0">
              {filters}
            </div>
            <span
              aria-hidden="true"
              className="h-6 w-px shrink-0 bg-cyan-800/20 dark:bg-cyan-300/20"
            />
            {sorting}
            <div className="flex shrink-0 items-center justify-end gap-2 md:gap-4">
              {viewToggle}
              {search}
            </div>
          </BlogPageReveal>
          {gallery}
        </BlogIndexShell>
      ) : (
        <BlogPageVariants
          direction={direction}
          posts={realPosts}
          tags={realTags}
          filters={filters}
          sorting={sorting}
          search={search}
          viewToggle={viewToggle}
          gallery={gallery}
          count={filteredPosts.length}
          activeTagLabel={tag?.label}
        />
      )}
      <VerticalFooter />
      <dialog
        ref={dialog}
        aria-labelledby={dialogTitle}
        className="m-auto w-[calc(100%-40px)] max-w-lg rounded-2xl border border-cyan-800/20 bg-[#fbfdff] p-7 text-[#05215e] shadow-2xl backdrop:bg-[#06111f]/60 dark:border-cyan-300/20 dark:bg-[#102231] dark:text-slate-50"
      >
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Cerrar muestra"
            className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-full p-2 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </button>
        </div>
        <p className="font-body text-primary-light dark:text-primary-dark text-xs font-semibold uppercase">
          Muestra del laboratorio
        </p>
        <h2
          id={dialogTitle}
          className="font-display mt-4 text-2xl font-semibold tracking-tight"
        >
          {sample?.title}
        </h2>
        <p className="font-body mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {sample?.excerpt}
        </p>
        <p className="font-body mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Contenido ficticio para revisar la composición. No es un artículo
          publicado.
        </p>
      </dialog>
    </div>
  );
}

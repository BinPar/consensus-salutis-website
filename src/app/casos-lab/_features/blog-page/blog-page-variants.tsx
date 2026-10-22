import type { ReactNode } from "react";
import type { BlogPost, BlogTag } from "~/lib/blog";
import {
  isNewBlogPageDirection,
  type BlogPageDirection,
} from "./blog-page-directions";
import { BlogPageEntrance } from "./blog-page-entrances";
import { BlogPageNewEntrances } from "./blog-page-new-entrances";
import { BlogPageQuickEntrances } from "./blog-page-quick-entrances";
import { blogPageContentWidth } from "./blog-page-layout";
import { BlogPageReveal } from "./blog-page-reveal";

const container = "mx-auto w-full max-w-[1344px] px-5 sm:px-8";

/** Solo cambia el encuadre. Las cards y las operaciones sobre los datos vienen del controlador común. */
export function BlogPageVariants({
  direction,
  posts,
  tags,
  filters,
  sorting,
  search,
  viewToggle,
  gallery,
  count,
  activeTagLabel,
}: {
  posts: BlogPost[];
  tags: BlogTag[];
  direction: Exclude<BlogPageDirection, "base">;
  filters: ReactNode;
  sorting: ReactNode;
  search: ReactNode;
  viewToggle: ReactNode;
  gallery: ReactNode;
  count: number;
  activeTagLabel?: string;
}) {
  return (
    <main
      id="blog-page-preview"
      data-blog-page-direction={direction}
      className="relative bg-[#fbfdff] dark:bg-[#06111f]"
    >
      {direction === "focus" ||
      direction === "reading" ||
      direction === "impact" ? (
        <BlogPageQuickEntrances direction={direction} posts={posts} />
      ) : isNewBlogPageDirection(direction) ? (
        <BlogPageNewEntrances direction={direction} posts={posts} tags={tags} />
      ) : (
        <BlogPageEntrance direction={direction} posts={posts} tags={tags} />
      )}
      <section
        id="blog-page-gallery"
        tabIndex={-1}
        aria-label="Artículos del blog"
        className="scroll-mt-[calc(var(--lab-toolbar-height,80px)+16px)] bg-[#fbfdff] pt-10 pb-20 focus:outline-none lg:pb-24 dark:bg-[#06111f]"
      >
        <div
          className={direction === "horizon" ? blogPageContentWidth : container}
        >
          <BlogPageReveal className="sticky top-[var(--lab-toolbar-height,80px)] z-30 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-b border-cyan-800/15 bg-[#fbfdff]/95 py-2 backdrop-blur-xl dark:border-cyan-300/15 dark:bg-[#06111f]/95">
            <p className="font-display hidden shrink-0 text-base font-semibold tracking-tight text-[#05215e] md:block dark:text-slate-100">
              {activeTagLabel ?? "Todos los artículos"}
              <span className="font-body ml-3 text-xs font-normal text-slate-500 dark:text-slate-400">
                {count} {count === 1 ? "artículo" : "artículos"}
              </span>
            </p>
            <div className="relative ml-auto flex w-full max-w-[min(640px,100%)] min-w-0 flex-nowrap items-center justify-end gap-2 min-[1025px]:w-[65%] min-[1025px]:shrink md:w-auto md:shrink-0 md:gap-4">
              <div className="w-[160px] max-w-[440px] min-w-0 shrink min-[1025px]:w-auto min-[1025px]:flex-1 [&>div]:mt-0 [&>nav]:mt-0">
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
            </div>
          </BlogPageReveal>
          {gallery}
        </div>
      </section>
    </main>
  );
}

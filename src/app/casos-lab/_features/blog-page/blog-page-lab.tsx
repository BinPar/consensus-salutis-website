"use client";

import { useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { Eyebrow } from "~/app/_components/eyebrow";
import { VerticalFooter } from "~/app/_components/site-footer";
import type { BlogPost, BlogTag } from "~/lib/blog";
import type { BlogPageDirection } from "./blog-page-directions";
import { BlogPageVariants } from "./blog-page-variants";
import { BlogPageReveal } from "./blog-page-reveal";
import {
  createBlogPageSamples,
  getBlogPageSampleTags,
} from "./blog-page-samples";
import {
  BLOG_POSTS_PER_PAGE,
  BlogEmptyState,
  BlogGrid,
  BlogIndexShell,
  BlogPagination,
  BlogTagFilter,
} from "./blog-page-reference-index";

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
  const tag = tags.find((entry) => entry.tag === activeTag);
  const filteredPosts = tag
    ? posts.filter((post) => post.tags.includes(tag.tag))
    : posts;
  // Como en producción: el índice se pagina; las etiquetas muestran su conjunto completo.
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visiblePosts = tag
    ? filteredPosts
    : posts.slice(
        (currentPage - 1) * BLOG_POSTS_PER_PAGE,
        currentPage * BLOG_POSTS_PER_PAGE,
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
      activeTag={activeTag}
      onSelect={(nextTag) => {
        setActiveTag(nextTag);
        setPage(1);
      }}
    />
  );
  const gallery =
    posts.length === 0 ? (
      <BlogEmptyState />
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
        <BlogGrid posts={visiblePosts} />
        {!tag && totalPages > 1 && (
          <BlogPageReveal>
            <BlogPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </BlogPageReveal>
        )}
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

          <BlogPageReveal>{filters}</BlogPageReveal>
          {gallery}
        </BlogIndexShell>
      ) : (
        <BlogPageVariants
          direction={direction}
          posts={realPosts}
          tags={realTags}
          filters={filters}
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

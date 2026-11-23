"use client";

// Copia local de blog-index.tsx: modificar esta referencia no cambia /blog.
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";

import { BlogPageAnimatedGrid } from "./blog-page-animated-grid";
import { BlogPageTagSelect } from "./blog-page-tag-select";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import type { BlogPost, BlogTag } from "~/lib/blog";

/** Fondo y encuadre del índice. Misma receta que el hero de la home. */
export function BlogIndexShell({ children }: { children: React.ReactNode }) {
  return (
    <main
      id="blog-page-preview"
      className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]"
    >
      <HomeMotionBackground />
      <section className="relative isolate z-10 overflow-clip">
        <div className="pointer-events-none fixed inset-0 -right-50 z-0">
          <SignalField
            className="-top-48 h-[calc(100%+12rem)]"
            intensity="hero"
            opacity={0.72}
          />
        </div>
        <ProductSignalLeft className="fixed -bottom-80 -left-155 w-250 rotate-20" />
        <div className="relative z-10 mx-auto w-full px-5 pt-32 pb-20 sm:px-8 lg:pt-36 lg:pb-24">
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <BlogPageAnimatedGrid
      key={posts.map((post) => post.slug).join(",")}
      posts={posts}
    />
  );
}

/**
 * Filtro de tags.
 *
 * `activeTag` en `undefined` marca «Todos» como activo, que es `/blog`. Los tags
 * se pintan en el orden del índice del loader: primero los más usados.
 */
export function BlogTagFilter({
  tags,
  totalCount,
  activeTag,
  onSelect,
}: {
  tags: BlogTag[];
  totalCount: number;
  activeTag?: string;
  onSelect: (tag: string | undefined) => void;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () => {
      const maxScroll = element.scrollWidth - element.clientWidth;
      const left = element.scrollLeft > 1;
      const right = maxScroll - element.scrollLeft > 1;
      setEdges((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener("scroll", measure, { passive: true });
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", measure);
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [tags]);

  if (tags.length === 0) return null;

  const edgeMask =
    edges.left || edges.right
      ? `linear-gradient(to right, ${edges.left ? "transparent, #000 32px" : "#000"}, ${edges.right ? "#000 calc(100% - 32px), transparent" : "#000"})`
      : undefined;

  const entries = [
    { tag: undefined, label: "Todos", href: "/blog", count: totalCount },
    ...tags.map((entry) => ({
      tag: entry.tag,
      label: entry.label,
      count: entry.count,
      href: `/blog/tag/${entry.tag}`,
    })),
  ];

  return (
    <>
      <BlogPageTagSelect
        entries={entries}
        activeTag={activeTag}
        onSelect={onSelect}
      />
      <nav
        ref={scrollRef}
        aria-label="Filtro por etiqueta"
        data-scroll-left={edges.left}
        data-scroll-right={edges.right}
        style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
        className="mt-10 hidden max-w-full [scrollbar-width:thin] flex-nowrap gap-2 overflow-x-auto overscroll-x-contain py-1 min-[1025px]:flex"
      >
        {entries.map((entry) => {
          const active = entry.tag === activeTag;

          return (
            <button
              type="button"
              key={entry.href}
              onClick={() => onSelect(entry.tag)}
              aria-current={active ? "page" : undefined}
              aria-label={`${entry.label}: ${entry.count} ${entry.count === 1 ? "artículo" : "artículos"}`}
              className={`font-body inline-flex h-[32px] shrink-0 items-center gap-2 rounded-full border pr-1.5 pl-4 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                active
                  ? "border-primary-light bg-primary-light shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#03111d]"
                  : "hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 bg-white/80 text-slate-600 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:text-slate-400 dark:hover:text-cyan-100"
              }`}
            >
              {entry.label}
              <span
                aria-hidden="true"
                className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums ${active ? "bg-white/20 text-white dark:bg-[#03111d]/10 dark:text-[#03111d]" : "bg-primary-light/10 text-primary-light dark:bg-primary-dark/15 dark:text-primary-dark"}`}
              >
                {entry.count}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

/**
 * Estado vacío.
 *
 * Sobrio y sin disculpas: el blog puede estar legítimamente vacío —el motor se
 * publica antes que el contenido— y una página vacía con un enlace de vuelta es
 * mejor que una rejilla de tarjetas de relleno.
 */
export function BlogEmptyState({
  title = "Todavía no hay artículos publicados.",
  body = "Estamos preparando las primeras lecturas. Si quieres que te avisemos cuando publiquemos, escríbenos.",
  action = { href: "/contacto", label: "Hablar con el equipo" },
}: {
  title?: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="shadow-big-blocks mt-14 rounded-2xl border border-cyan-800/15 bg-white/80 px-6 py-14 text-center backdrop-blur-xs sm:px-10 dark:border-cyan-300/20 dark:bg-[#152230e6]/90">
      <p className="font-display text-xl font-semibold text-[#05215e] dark:text-slate-100">
        {title}
      </p>
      <p className="font-body mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
        {body}
      </p>
      <Link
        href={action.href}
        className="font-body bg-primary-light shadow-big-blocks dark:bg-primary-dark dark:hover:bg-primary-dark/85 mt-8 inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#087a85] dark:text-[#03111d] dark:shadow-[0_0_24px_rgba(0,188,187,0.18)]"
      >
        {action.label}
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import type { BlogTag } from "~/lib/blog";
import { BlogTagSelect } from "./blog-tag-select";

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
}: {
  tags: BlogTag[];
  totalCount: number;
  activeTag?: string;
}) {
  const router = useRouter();
  const onSelect = (tag: string | undefined) =>
    router.push(`${tag ? `/blog/tag/${tag}` : "/blog"}#blog-page-gallery`);
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
    {
      tag: undefined,
      label: "Todos",
      href: "/blog#blog-page-gallery",
      count: totalCount,
    },
    ...tags.map((entry) => ({
      tag: entry.tag,
      label: entry.label,
      count: entry.count,
      href: `/blog/tag/${entry.tag}#blog-page-gallery`,
    })),
  ];

  return (
    <>
      <BlogTagSelect
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
            <Link
              href={entry.href}
              key={entry.href}
              aria-current={active ? "page" : undefined}
              aria-label={`${entry.label}: ${entry.count} ${entry.count === 1 ? "artículo" : "artículos"}`}
              className={`font-body inline-flex h-[32px] shrink-0 items-center gap-2 rounded-full border pr-1.5 pl-4 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                active
                  ? "border-primary-light bg-primary-light shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#03111d]"
                  : "hover:border-primary-light/35 dark:hover:border-primary-dark/30 border-primary-light/20 bg-primary-light/5 hover:bg-primary-light/10 text-slate-600 hover:text-cyan-800 dark:border-cyan-300/10 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/15 dark:text-slate-400 dark:hover:text-cyan-100"
              }`}
            >
              {entry.label}
              <span
                aria-hidden="true"
                className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums ${active ? "bg-white/20 text-white dark:bg-[#03111d]/10 dark:text-[#03111d]" : "bg-primary-light/10 text-primary-light dark:bg-primary-dark/15 dark:text-primary-dark"}`}
              >
                {entry.count}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

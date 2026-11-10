"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { BlogTag } from "~/lib/blog";
import { BlogTagSelect } from "./blog-tag-select";
import {
  blogPillClass,
  blogPillCountClass,
  useScrollEdges,
} from "./blog-pills";

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
  const { edges, edgeMask } = useScrollEdges(scrollRef, [tags]);

  if (tags.length === 0) return null;

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
              className={blogPillClass(active)}
            >
              {entry.label}
              <span aria-hidden="true" className={blogPillCountClass(active)}>
                {entry.count}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

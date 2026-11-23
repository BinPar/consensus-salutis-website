"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { getPathname, Link } from "~/i18n/navigation";
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
  const t = useTranslations("blog.tagFilter");
  const locale = useLocale();
  const router = useRouter();
  const hrefOf = (tag: string | undefined) =>
    tag
      ? ({
          pathname: "/blog/tag/[tag]",
          params: { tag },
          hash: "blog-page-gallery",
        } as const)
      : ({ pathname: "/blog", hash: "blog-page-gallery" } as const);
  /*
    El router de next-intl no admite `hash`: se compone la URL localizada y se
    añade el ancla para el router de Next.
  */
  const onSelect = (tag: string | undefined) => {
    const { hash, ...href } = hrefOf(tag);
    router.push(`${getPathname({ locale, href })}#${hash}`);
  };
  const scrollRef = useRef<HTMLElement>(null);
  const { edges, edgeMask } = useScrollEdges(scrollRef, [tags]);

  if (tags.length === 0) return null;

  const entries = [
    {
      tag: undefined,
      label: t("all"),
      count: totalCount,
    },
    ...tags.map((entry) => ({
      tag: entry.tag,
      label: entry.label,
      count: entry.count,
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
        aria-label={t("label")}
        data-scroll-left={edges.left}
        data-scroll-right={edges.right}
        style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
        className="mt-10 hidden max-w-full [scrollbar-width:thin] flex-nowrap gap-2 overflow-x-auto overscroll-x-contain py-1 min-[1025px]:flex"
      >
        {entries.map((entry) => {
          const active = entry.tag === activeTag;

          return (
            <Link
              href={hrefOf(entry.tag)}
              key={entry.tag ?? "all"}
              aria-current={active ? "page" : undefined}
              aria-label={t("entry", {
                label: entry.label,
                count: entry.count,
              })}
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

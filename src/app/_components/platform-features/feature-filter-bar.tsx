"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import {
  blogPillClass,
  blogPillCountClass,
  useScrollEdges,
} from "../blog/blog-pills";
import { BlogSearch } from "../blog/blog-search";
import { BlogTagSelect } from "../blog/blog-tag-select";
import { stickyBandClass, useStuck } from "../blog/sticky-band";

export type FeatureFilterEntry = { id: string; label: string; count: number };

/** Height of the fixed site header, as the blog bar assumes it. */
const headerHeight = 64;

/**
 * Sticky bar of the features zone on /plataforma. It reuses the blog gallery
 * bar: title, group pills with their count (a select below 1025px) and the
 * search. The pills jump to their group and follow the scroll; the search
 * filters the features in place. The band spans the full width, transparent
 * until it sticks under the header; its content keeps the page max width.
 */
export function FeatureFilterBar({
  entries,
  query,
  onQueryChange,
  barRef,
}: {
  entries: FeatureFilterEntry[];
  query: string;
  onQueryChange: (value: string) => void;
  barRef: RefObject<HTMLDivElement | null>;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const { edges, edgeMask } = useScrollEdges(scrollRef, [entries.length]);
  const [activeId, setActiveId] = useState(entries[0]?.id);
  // Transparent in its place; it takes the site header surface once it sticks.
  const stuck = useStuck(barRef);

  // Scroll-spy: the active group is the last one whose top is under the bar.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = headerHeight + (barRef.current?.offsetHeight ?? 0) + 2;
      let current = entries[0]?.id;
      for (const { id } of entries) {
        const top = document.getElementById(id)?.getBoundingClientRect().top;
        if (top !== undefined && top <= line) current = id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [entries, barRef]);

  // Keep the active pill in view when the row overflows.
  useEffect(() => {
    const row = scrollRef.current;
    const pill = row?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!row || !pill) return;
    const left = pill.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft) row.scrollLeft = left;
    else if (left + pill.offsetWidth > row.scrollLeft + row.clientWidth)
      row.scrollLeft = left + pill.offsetWidth - row.clientWidth;
  }, [activeId]);

  const jumpTo = (id: string | undefined) => {
    const target = id && document.getElementById(id);
    if (!target) return;
    const offset = headerHeight + (barRef.current?.offsetHeight ?? 0);
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - offset,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
    target.focus({ preventScroll: true });
  };

  const noun = ["funcionalidad", "funcionalidades"] as const;

  return (
    <div
      ref={barRef}
      data-stuck={stuck}
      className={`section-navigation-inset sticky top-[var(--blog-header-height,64px)] z-40 px-5 sm:px-8 lg:px-10 ${stickyBandClass}`}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-nowrap items-center gap-10 py-2">
        <p className="font-display text-navy hidden shrink-0 text-base font-semibold tracking-tight md:block dark:text-slate-100">
          Funcionalidades
        </p>
        <div className="relative ml-auto flex min-w-0 flex-nowrap items-center justify-end gap-2 min-[1025px]:flex-1">
          {entries.length > 0 && (
            <>
              <div className="w-40 min-w-0 shrink min-[1025px]:w-auto min-[1025px]:flex-1 [&>div]:mt-0 [&>nav]:mt-0 [&>nav]:ml-auto [&>nav]:w-max">
                <BlogTagSelect
                  entries={entries.map(({ id, label, count }) => ({
                    tag: id,
                    label,
                    count,
                  }))}
                  activeTag={activeId}
                  onSelect={jumpTo}
                  label="Ir al grupo"
                  noun={noun}
                />
                <nav
                  ref={scrollRef}
                  aria-label="Grupos de funcionalidades"
                  data-scroll-left={edges.left}
                  data-scroll-right={edges.right}
                  style={{ maskImage: edgeMask, WebkitMaskImage: edgeMask }}
                  className="hidden max-w-full [scrollbar-width:thin] flex-nowrap gap-2 overflow-x-auto overscroll-x-contain py-1 min-[1025px]:flex"
                >
                  {entries.map((entry) => {
                    const active = entry.id === activeId;
                    return (
                      <a
                        key={entry.id}
                        href={`#${entry.id}`}
                        aria-current={active ? "true" : undefined}
                        aria-label={`${entry.label}: ${entry.count} ${entry.count === 1 ? noun[0] : noun[1]}`}
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey
                          )
                            return;
                          event.preventDefault();
                          jumpTo(entry.id);
                        }}
                        className={blogPillClass(active)}
                      >
                        {entry.label}
                        <span
                          aria-hidden="true"
                          className={blogPillCountClass(active)}
                        >
                          {entry.count}
                        </span>
                      </a>
                    );
                  })}
                </nav>
              </div>
              <span
                aria-hidden="true"
                className="dark:bg-primary-dark/20 h-6 w-px shrink-0 bg-cyan-800/20"
              />
            </>
          )}
          <div className="flex shrink-0 items-center justify-end gap-2">
            <BlogSearch
              value={query}
              onChange={onQueryChange}
              label="Buscar funcionalidades"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

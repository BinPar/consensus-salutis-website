"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import {
  articleBodyClassName,
  articleLabelClassName as label,
} from "./blog-article-styles";
import { useArticleIndex } from "./use-blog-article-index";

type Index = ReturnType<typeof useArticleIndex>;

function ArticleIndex({ index }: { index: Index }) {
  const listRef = useRef<HTMLOListElement>(null);
  const reducedMotion = useReducedMotion();
  const indicatorY = useMotionValue(7);
  const smoothIndicatorY = useSpring(indicatorY, {
    stiffness: 400,
    damping: 38,
    mass: 0.5,
  });

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    let initialized = false;
    const update = () => {
      if (!list.getBoundingClientRect().width) return;
      const links = [...list.querySelectorAll("a")];
      const progress = index.readingProgress.get();
      const current = Math.min(Math.floor(progress), links.length - 1);
      const from = links[current];
      const to = links[current + 1] ?? from;
      if (!from || !to) return;
      const start = from.offsetTop + from.offsetHeight / 2 - 11;
      const end = to.offsetTop + to.offsetHeight / 2 - 11;
      const position = start + (end - start) * (progress - current);
      if (!initialized) {
        indicatorY.jump(position);
        smoothIndicatorY.jump(position);
        initialized = true;
      } else indicatorY.set(position);
    };
    update();
    const unsubscribe = index.readingProgress.on("change", update);
    const observer = new ResizeObserver(update);
    observer.observe(list);
    document.fonts.addEventListener("loadingdone", update);
    return () => {
      unsubscribe();
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", update);
    };
  }, [index.headings, index.readingProgress, indicatorY, smoothIndicatorY]);

  if (!index.headings.length) return null;
  return (
    <nav
      aria-label="Índice del artículo"
      data-article-toc=""
      className="font-body"
    >
      <div className="before:bg-primary-light/16 dark:before:bg-primary-dark/20 relative before:absolute before:inset-y-0 before:left-[3px] before:w-px">
        <ol ref={listRef}>
          {index.headings.map((heading) => {
            const active = heading.id === index.activeId;
            return (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  aria-current={active ? "location" : undefined}
                  title={heading.title}
                  onClick={(event) => index.navigate(event, heading.id)}
                  className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark relative flex min-h-9 items-center rounded-md py-1.5 pr-1 text-xs leading-[1.5] transition-colors duration-150 focus-visible:outline-2 focus-visible:-outline-offset-2 motion-reduce:transition-none ${heading.level === 3 ? "pl-7" : "pl-5"} ${active ? "text-primary-light dark:text-primary-dark font-bold" : "hover:text-primary-light dark:hover:text-primary-dark font-semibold text-slate-500 dark:text-[#a9bacb]"}`}
                >
                  <span className="line-clamp-1 min-w-0 flex-1">
                    {heading.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
        <motion.span
          data-article-toc-marker=""
          aria-hidden="true"
          className="bg-primary-light dark:bg-primary-dark pointer-events-none absolute top-0 left-[2px] h-[22px] w-[3px] rounded-full"
          style={{ y: reducedMotion ? indicatorY : smoothIndicatorY }}
        />
      </div>
    </nav>
  );
}

/** El MDX y los bloques estáticos llegan como slots del servidor. */
export function BlogArticleReadingLayout({
  slug,
  cover,
  metadata,
  related,
  children,
}: {
  slug: string;
  cover: ReactNode;
  metadata: ReactNode;
  related: ReactNode;
  children: ReactNode;
}) {
  const index = useArticleIndex(slug);
  return (
    <div className="relative mt-6 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_232px] lg:items-stretch lg:gap-8 xl:grid-cols-[minmax(0,1fr)_264px] xl:gap-14">
      <div className="min-w-0">
        {cover}
        <div
          ref={index.bodyRef}
          data-article-body=""
          className={`${articleBodyClassName} relative isolate mt-10 before:pointer-events-none before:absolute before:-inset-x-4 before:-inset-y-6 before:-z-10 before:rounded-3xl before:bg-white/85 before:blur-xl sm:before:-inset-x-6 dark:before:bg-[#06111f]/90 [&>h2]:scroll-mt-24 [&>h3]:scroll-mt-24`}
        >
          {children}
        </div>
        {related && <div className="mt-10 lg:hidden">{related}</div>}
      </div>
      <aside
        aria-label="Guía de lectura del artículo"
        className="hidden min-w-0 lg:block"
      >
        <div
          data-article-sidebar=""
          className="sticky top-22 max-h-[calc(100svh-112px)] [scrollbar-width:thin] space-y-5 overflow-y-auto overscroll-contain pr-2 pb-1"
        >
          {metadata}
          <section className="border-t border-cyan-800/15 pt-5 dark:border-primary-dark/15">
            <h2 className={`${label} mb-3`}>En este artículo</h2>
            <ArticleIndex index={index} />
          </section>
          {related}
          <div className="border-t border-cyan-800/15 pt-5 dark:border-primary-dark/15">
            <Link
              href="/blog"
              className="font-body text-primary-light dark:text-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex items-center gap-2 rounded-full text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Explorar el blog
              <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

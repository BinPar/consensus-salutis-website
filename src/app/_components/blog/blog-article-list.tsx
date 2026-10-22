"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "~/lib/blog";
import { BlogReveal } from "./blog-reveal";

/** Listado editorial: solo utiliza el contenido y los metadatos del artículo. */
export function BlogArticleList({
  posts,
  numbers,
}: {
  posts: BlogPost[];
  numbers: ReadonlyMap<string, number>;
}) {
  return (
    <ul
      data-blog-article-list=""
      aria-label="Artículos en formato lista"
      className="mt-10 list-none p-0"
    >
      {posts.map((post) => (
        <li key={post.slug}>
          <BlogReveal>
            <Link
              href={post.href}
              className="group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 rounded-lg py-3 transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 md:grid-cols-[max-content_minmax(0,1fr)_max-content_17px]"
            >
              <span className="font-body text-primary-light dark:text-primary-dark self-baseline text-[13px] leading-6 font-bold tracking-[0.04em] whitespace-nowrap tabular-nums sm:text-sm">
                Nº {String(numbers.get(post.slug) ?? 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 self-baseline">
                <div className="flex items-baseline gap-4">
                  <h2 className="font-display group-hover:text-primary-light dark:group-hover:text-primary-dark min-w-0 text-base leading-[1.45] font-semibold tracking-tight text-[#05215e] transition-colors sm:text-[19px] dark:text-slate-50">
                    {post.title}
                  </h2>
                  <span
                    aria-hidden="true"
                    className="group-hover:border-primary-light/50 dark:group-hover:border-primary-dark/50 hidden min-w-8 flex-1 border-b border-dotted border-cyan-800/25 transition-colors md:block dark:border-cyan-300/20"
                  />
                </div>
                <p className="font-body mt-2 line-clamp-2 max-w-[640px] text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
                  {post.excerpt}
                </p>
                <div className="font-body mt-3 flex items-center justify-between gap-3 text-[11px] leading-5 text-slate-500 md:hidden dark:text-slate-400">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <time dateTime={post.date}>{post.createdAtLabel}</time>
                    <span aria-hidden="true">·</span>
                    <span>{post.readTime}</span>
                  </span>
                  <ArrowUpRight
                    aria-hidden="true"
                    size={15}
                    strokeWidth={1.8}
                    className="text-primary-light dark:text-primary-dark shrink-0"
                  />
                </div>
              </div>
              <div className="font-body hidden pt-0.5 text-right md:block">
                <p className="text-primary-light dark:text-primary-dark text-xs leading-6 font-medium">
                  {post.readTime}
                </p>
                <time
                  dateTime={post.date}
                  className="mt-1.5 block text-[11px] leading-6 text-slate-500 dark:text-slate-400"
                >
                  {post.createdAtLabel}
                </time>
              </div>
              <ArrowUpRight
                aria-hidden="true"
                size={17}
                strokeWidth={1.8}
                className="text-primary-light dark:text-primary-dark mt-1.5 hidden md:block"
              />
            </Link>
          </BlogReveal>
        </li>
      ))}
    </ul>
  );
}

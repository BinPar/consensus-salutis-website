import { Calendar, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BlogArticle } from "~/app/_components/blog-articles";

export function BlogArticleCard({
  article,
  compact = false,
}: {
  article: BlogArticle;
  compact?: boolean;
}) {
  return (
    <Link href={article.href} className="group block h-full">
      <article className="shadow-big-blocks hover:border-primary-light/30 flex h-full flex-col overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/80 backdrop-blur-xs transition-all duration-150 hover:-translate-y-2 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]">
        <div className="relative aspect-[1.6] overflow-hidden border-b border-cyan-800/10 bg-[#deedf3]/70 dark:border-cyan-300/10 dark:bg-[#06111f]">
          <Image
            src={article.imageSrc}
            alt=""
            width={800}
            height={533}
            className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-105"
          />
        </div>
        <div
          className={
            compact
              ? "flex flex-1 flex-col p-5 pt-4"
              : "flex flex-1 flex-col p-5 pt-4.5! xl:p-6"
          }
        >
          <h2 className="font-display font-body line-clamp-2 text-base text-[#05215e] dark:text-slate-100">
            {article.title}
          </h2>
          <p className="font-body mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
            {article.excerpt}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-4.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Calendar
                aria-hidden="true"
                className="size-3.5 text-slate-500 dark:text-slate-400"
                strokeWidth={1.8}
              />
              {article.createdAtLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock
                aria-hidden="true"
                className="size-3.5 text-slate-500 dark:text-slate-400"
                strokeWidth={1.8}
              />
              {article.readTime}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

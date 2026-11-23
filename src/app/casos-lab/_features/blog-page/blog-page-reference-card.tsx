import Image from "next/image";
import Link from "next/link";

import { BlogCover } from "~/app/_components/blog-cover";
import type { BlogPost } from "~/lib/blog";

export function BlogPageReferenceCard({
  article,
}: {
  article: BlogPost;
}) {
  return (
    <Link
      href={article.href}
      className="group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark block h-full rounded-2xl transition-[translate] duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:translate-none! motion-reduce:transition-none"
    >
      <article className="flex h-full min-w-0 flex-col rounded-2xl">
        <div className="relative aspect-[1.85] overflow-hidden rounded-2xl bg-[#e5f1f4] dark:bg-[#102231]">
          <div className="absolute inset-0 transition-transform duration-500 ease-out group-focus-within:scale-[1.03] group-hover:scale-[1.03] motion-reduce:scale-100! motion-reduce:transition-none">
            {article.image ? (
              <Image
                src={article.image}
                alt=""
                width={800}
                height={533}
                className="h-full w-full object-cover"
              />
            ) : (
              <BlogCover slug={article.slug} />
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col pt-5">
          <h2 className="font-display min-h-[2.7em] text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] lg:max-xl:min-h-[4.05em] dark:text-slate-50">
            {article.title}
          </h2>
          <p className="font-body mt-2.5 line-clamp-3 min-h-[4.95em] text-[13px] leading-[1.65] text-slate-600 dark:text-slate-400">
            {article.excerpt}
          </p>
          <div className="font-body mt-auto flex flex-wrap items-center gap-x-2 pt-4 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
            <span>{article.createdAtLabel}</span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span>{article.readTime}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import {
  Cover,
  Meta,
  ReadingAction,
  imageMotion,
  type CardProps,
} from "./blog-card-shared";

const title =
  "font-display text-lg font-semibold leading-[1.4] tracking-tight text-[#05215e] dark:text-slate-50";
const summary =
  "font-body text-[13px] leading-[1.7] text-slate-600 dark:text-slate-400";

function MatCard({ article, getSampleAction }: CardProps) {
  return (
    <article className="group focus-within:border-primary-light/35 hover:border-primary-light/35 dark:focus-within:border-primary-dark/40 dark:hover:border-primary-dark/40 relative flex min-w-0 flex-col rounded-3xl border border-cyan-800/10 bg-[#eff6f8] p-2.5 transition-colors duration-300 motion-reduce:transition-none dark:border-cyan-300/12 dark:bg-[#0c1e2d]">
      <div className="rounded-[18px] bg-white p-2 shadow-[0_2px_8px_rgb(0_34_98/4%)] dark:bg-[#162a39] dark:shadow-none">
        <div className="relative aspect-[1.45] overflow-hidden rounded-xl">
          <div className={`absolute inset-0 ${imageMotion}`}>
            <Cover article={article} />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-3.5 pt-5 pb-3">
        <h2 className={`${title} min-h-[4.2em] text-balance`}>
          {article.title}
        </h2>
        <p className={`${summary} mt-3 line-clamp-3`}>{article.excerpt}</p>
        <div className="mt-auto pt-6">
          <div className="border-t border-cyan-800/12 pt-4 dark:border-cyan-300/12">
            <Meta article={article} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-body text-primary-light dark:text-primary-dark text-xs font-semibold">
              Leer artículo
            </span>
            <span
              aria-hidden="true"
              className="text-primary-light group-focus-within:bg-primary-light group-hover:bg-primary-light dark:text-primary-dark dark:group-focus-within:bg-primary-dark dark:group-hover:bg-primary-dark grid size-9 place-items-center rounded-full border border-cyan-800/15 bg-white transition-[background-color,color,rotate] duration-300 group-focus-within:rotate-45 group-focus-within:text-white group-hover:rotate-45 group-hover:text-white motion-reduce:rotate-0 motion-reduce:transition-none dark:border-cyan-300/15 dark:bg-[#162a39] dark:group-focus-within:text-[#06111f] dark:group-hover:text-[#06111f]"
            >
              <ArrowUpRight className="size-4" strokeWidth={1.8} />
            </span>
          </div>
        </div>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

function LapelCard({ article, getSampleAction }: CardProps) {
  return (
    <article className="group relative flex min-w-0 flex-col rounded-3xl">
      <div className="relative aspect-[1.08] overflow-hidden rounded-3xl bg-[#deedf3] dark:bg-[#102432]">
        <div className={`absolute inset-0 ${imageMotion}`}>
          <Cover article={article} />
        </div>
      </div>
      <div className="relative mx-3 -mt-12 flex flex-1 flex-col rounded-[20px] border border-cyan-800/10 bg-white p-5 shadow-[0_8px_30px_-12px_rgb(0_34_98/18%)] transition-transform duration-300 ease-out group-focus-within:-translate-y-1 group-hover:-translate-y-1 motion-reduce:transform-none motion-reduce:transition-none dark:border-cyan-300/15 dark:bg-[#102432] dark:shadow-[0_8px_30px_-12px_rgb(0_0_0/45%)]">
        <span
          aria-hidden="true"
          className="bg-primary-light/60 dark:bg-primary-dark/70 mb-4 h-0.5 w-7 rounded-full transition-[width] duration-300 group-focus-within:w-12 group-hover:w-12 motion-reduce:transition-none"
        />
        <h2 className={`${title} min-h-[4.2em]`}>{article.title}</h2>
        <p className={`${summary} mt-3 line-clamp-3`}>{article.excerpt}</p>
        <div className="mt-auto pt-5">
          <Meta article={article} />
          <span className="font-body text-primary-light dark:text-primary-dark mt-4 inline-flex items-center gap-2 text-xs font-semibold">
            Leer artículo
            <ArrowRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-focus-within:translate-x-1 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
              strokeWidth={1.8}
            />
          </span>
        </div>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

function DiptychCard({ article, getSampleAction }: CardProps) {
  return (
    <article className="group focus-within:border-primary-light/40 hover:border-primary-light/40 dark:focus-within:border-primary-dark/40 dark:hover:border-primary-dark/40 relative flex min-w-0 flex-col rounded-2xl border border-cyan-800/15 bg-white p-4 transition-[background-color,border-color] duration-300 focus-within:bg-[#f4f9fc] hover:bg-[#f4f9fc] motion-reduce:transition-none xl:p-5 dark:border-cyan-300/15 dark:bg-[#0c1e2d] dark:focus-within:bg-[#102432] dark:hover:bg-[#102432]">
      <div className="grid min-h-48 grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] items-start gap-3 xl:gap-4">
        <div className="relative aspect-[0.65] overflow-hidden rounded-t-full rounded-b-xl bg-[#deedf3] dark:bg-[#102432]">
          <div className={`absolute inset-0 ${imageMotion}`}>
            <Cover article={article} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col items-start pt-2">
          <h2 className="font-display text-base leading-[1.45] font-semibold tracking-tight wrap-break-word text-[#05215e] xl:text-[17px] dark:text-slate-50">
            {article.title}
          </h2>
          <ArrowUpRight
            aria-hidden="true"
            className="text-primary-light dark:text-primary-dark mt-4 size-5 transition-transform duration-300 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            strokeWidth={1.8}
          />
        </div>
      </div>
      <p className={`${summary} mt-5 line-clamp-3`}>{article.excerpt}</p>
      <div className="mt-auto pt-6">
        <div className="border-t border-cyan-800/12 pt-4 dark:border-cyan-300/12">
          <Meta article={article} />
        </div>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

export const blogCardExplorations = {
  mat: MatCard,
  lapel: LapelCard,
  diptych: DiptychCard,
};

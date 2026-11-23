"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { BlogCardsDirection } from "./blog-cards-directions";
import {
  BlogHeadingText,
  Cover,
  Meta,
  ReadingAction,
  focus,
  imageMotion,
  type Reading,
  type CardProps,
} from "./blog-card-shared";

type SectionDirection = "signal" | "gallery" | "topics";
type SectionProps = {
  articles: Reading[];
  getSampleAction?: CardProps["getSampleAction"];
};

export function isBlogSectionDirection(
  direction: BlogCardsDirection,
): direction is SectionDirection {
  return (
    direction === "signal" || direction === "gallery" || direction === "topics"
  );
}

const eyebrow =
  "font-display text-[10px] font-bold uppercase tracking-[0.22em] text-primary-light dark:text-primary-dark";
const heading =
  "font-display text-4xl font-extrabold tracking-tight text-[#05215e] xl:text-5xl dark:text-slate-50";
const title =
  "font-display text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] dark:text-slate-50";
const summary =
  "font-body text-[13px] leading-[1.65] text-slate-600 dark:text-slate-400";
const grid = "grid gap-y-9 sm:grid-cols-2 lg:grid-cols-4";

function ArchiveLink({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/blog"
      className={`font-body text-primary-light hover:bg-primary-light/5 dark:text-primary-dark dark:hover:bg-primary-dark/10 inline-flex min-h-10 items-center justify-center gap-3 rounded-full px-5 text-xs font-semibold transition-colors ${focus} ${className}`}
    >
      Ver todos
      <ArrowRight aria-hidden="true" className="size-3.5" strokeWidth={1.8} />
    </Link>
  );
}

function SignalSection({ articles, getSampleAction }: SectionProps) {
  const contours = [
    "rounded-[42%_58%_54%_46%/51%_43%_57%_49%]",
    "rounded-[56%_44%_40%_60%/45%_55%_45%_55%]",
    "rounded-[45%_55%_60%_40%/55%_43%_57%_45%]",
    "rounded-[60%_40%_48%_52%/42%_58%_42%_58%]",
  ];
  return (
    <>
      <header className="text-center">
        <p className={eyebrow}>Lecturas clínicas</p>
        <h1 id="blog-cards-title" className={`${heading} mt-3`}>
          <BlogHeadingText />
        </h1>
        <p className="font-body mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-400">
          Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
          formas de transformar la asistencia al paciente en el sistema de
          salud.
        </p>
      </header>
      <div className="relative mt-8">
        <div
          aria-hidden="true"
          className="bg-primary-light/4 dark:bg-primary-dark/5 pointer-events-none absolute inset-x-0 top-8 h-48 rounded-[50%] blur-2xl"
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 1280 240"
          fill="none"
          preserveAspectRatio="none"
          className="text-primary-light/20 dark:text-primary-dark/20 pointer-events-none absolute inset-x-0 top-0 hidden h-56 w-full lg:block"
        >
          <path
            d="M0 156C115 30 205 40 335 137S548 243 654 133 842 17 966 126 1144 215 1280 79"
            stroke="currentColor"
          />
          <path
            d="M0 169C143 78 223 56 346 146S546 221 660 145 871 52 970 141 1170 181 1280 97"
            stroke="currentColor"
            strokeOpacity=".4"
          />
        </svg>
        <div data-blog-article-grid="" className={`${grid} relative gap-x-8`}>
          {articles.map((article, index) => (
            <article
              key={article.slug}
              className="group relative flex min-w-0 flex-col text-center"
            >
              <div
                className={`relative mx-auto aspect-[1.12] w-full max-w-60 overflow-hidden border border-cyan-800/10 transition-[border-radius] duration-700 group-focus-within:rounded-[48%] group-hover:rounded-[48%] motion-reduce:transition-none dark:border-cyan-300/10 ${contours[index % contours.length]}`}
              >
                <div className={`absolute inset-0 ${imageMotion}`}>
                  <Cover article={article} />
                </div>
              </div>
              <div className="relative mx-auto mt-4 flex h-5 items-center justify-center">
                <span
                  aria-hidden="true"
                  className="absolute top-0 bottom-0 w-px bg-cyan-800/15 dark:bg-cyan-300/15"
                />
                <span
                  aria-hidden="true"
                  className="group-focus-within:bg-primary-light group-hover:bg-primary-light dark:group-focus-within:bg-primary-dark dark:group-hover:bg-primary-dark relative size-2 rounded-full bg-[#a8d3d7] ring-4 ring-white transition-colors dark:bg-[#305963] dark:ring-[#06111f]"
                />
              </div>
              <h2
                className={`${title} mt-2.5 min-h-[2.7em] lg:max-xl:min-h-[4.05em]`}
              >
                {article.title}
              </h2>
              <p className={`${summary} mt-3 line-clamp-2`}>
                {article.excerpt}
              </p>
              <div className="mt-auto flex justify-center pt-4">
                <Meta article={article} />
              </div>
              <span className="font-body text-primary-light dark:text-primary-dark mt-3 inline-flex items-center justify-center gap-2 text-[11px] font-semibold">
                Leer artículo
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-focus-within:translate-x-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                  strokeWidth={1.8}
                />
              </span>
              <ReadingAction
                article={article}
                getSampleAction={getSampleAction}
              />
            </article>
          ))}
        </div>
      </div>
      <div className="mt-6 text-center">
        <ArchiveLink className="border border-cyan-800/15 dark:border-cyan-300/15" />
      </div>
    </>
  );
}

function GallerySection({ articles, getSampleAction }: SectionProps) {
  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className={eyebrow}>Lecturas clínicas</p>
          <h1 id="blog-cards-title" className={`${heading} mt-3`}>
            <BlogHeadingText />
          </h1>
          <p className="font-body mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
            formas de transformar la asistencia al paciente en el sistema de
            salud.
          </p>
        </div>
        <ArchiveLink className="self-start border border-cyan-800/15 sm:self-end dark:border-cyan-300/15" />
      </header>
      <div
        data-blog-article-grid=""
        className="mt-8 grid gap-x-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group relative row-span-4 grid min-w-0 grid-rows-subgrid rounded-2xl"
          >
            <div className="relative aspect-[1.45] overflow-hidden rounded-2xl bg-[#e6f2f4] dark:bg-[#102432]">
              <div className={`absolute inset-0 ${imageMotion}`}>
                <Cover article={article} />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-linear-to-b from-white/0 from-65% via-white/45 via-82% to-white dark:from-[#06111f]/0 dark:via-[#06111f]/45 dark:to-[#06111f]"
              />
            </div>
            <div className="relative z-10 -mt-3 pl-2">
              <h2 className={`${title} line-clamp-3`}>{article.title}</h2>
            </div>
            <div className="pt-3 pl-2">
              <p className={`${summary} line-clamp-3 min-h-[5.1em]`}>
                {article.excerpt}
              </p>
            </div>
            <div className="pt-5 pb-5 pl-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Meta article={article} />
                </div>
                <span
                  aria-hidden="true"
                  className="text-primary-light dark:text-primary-dark grid size-8 shrink-0 place-items-center"
                >
                  <ArrowUpRight
                    className="size-3.5 transition-transform duration-250 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
                    strokeWidth={1.8}
                  />
                </span>
              </div>
            </div>
            <ReadingAction
              article={article}
              getSampleAction={getSampleAction}
            />
          </article>
        ))}
      </div>
    </>
  );
}

function GridSection({ articles, getSampleAction }: SectionProps) {
  return (
    <>
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className={eyebrow}>Lecturas clínicas</p>
          <h1 id="blog-cards-title" className={`${heading} mt-3`}>
            <BlogHeadingText />
          </h1>
          <p className="font-body mt-4 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
            Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
            formas de transformar la asistencia al paciente en el sistema de
            salud.
          </p>
        </div>
        <ArchiveLink className="self-start sm:self-end" />
      </header>
      <div data-blog-article-grid="" className={`${grid} mt-8 gap-x-5`}>
        {articles.map((article) => (
          <article
            key={article.slug}
            className="group relative flex min-w-0 flex-col overflow-hidden rounded-xl border border-cyan-800/15 bg-white dark:border-cyan-300/15 dark:bg-[#0c1e2d]"
          >
            <div className="relative aspect-[1.75] overflow-hidden">
              <div className={`absolute inset-0 ${imageMotion}`}>
                <Cover article={article} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <h2 className={`${title} min-h-[2.7em] lg:max-xl:min-h-[4.05em]`}>
                {article.title}
              </h2>
              <p className={`${summary} mt-3 line-clamp-2`}>
                {article.excerpt}
              </p>
              <div className="mt-auto pt-4">
                <Meta article={article} />
              </div>
            </div>
            <ReadingAction
              article={article}
              getSampleAction={getSampleAction}
            />
          </article>
        ))}
      </div>
    </>
  );
}

export function BlogSectionExploration({
  direction,
  articles,
  getSampleAction,
  replay,
}: SectionProps & { direction: SectionDirection; replay: number }) {
  const reduced = useReducedMotion();
  const Section = {
    signal: SignalSection,
    gallery: GallerySection,
    topics: GridSection,
  }[direction];
  return (
    <motion.div
      data-blog-section={direction}
      key={`${direction}-${replay}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration: reduced ? 0 : 0.35 }}
      className="motion-reduce:opacity-100!"
    >
      {articles.length ? (
        <Section articles={articles} getSampleAction={getSampleAction} />
      ) : (
        <>
          <p className={eyebrow}>Lecturas clínicas</p>
          <h1 id="blog-cards-title" className={`${heading} mt-3`}>
            <BlogHeadingText />
          </h1>
          <p className={`${summary} mt-6`}>No hay artículos disponibles.</p>
        </>
      )}
    </motion.div>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useId, useRef, useState } from "react";
import { VolumeSection } from "~/app/_components/volume-section";
import { ProductStrataSection } from "~/app/_components/product-strata/product-strata-section";
import { VerticalFooter } from "~/app/_components/site-footer";
import type { BlogPost } from "~/lib/blog";
import { ContactAssistant } from "../contact/contact-assistant";
import {
  BlogHeadingText,
  Cover,
  ReadingAction,
  Meta,
  focus,
  imageMotion,
  type Reading,
  type CardProps,
} from "./blog-card-shared";
import {
  BlogSectionExploration,
  isBlogSectionDirection,
} from "./blog-section-explorations";
import type { BlogCardsDirection } from "./blog-cards-directions";
import { blogCardExplorations } from "./blog-card-explorations";

// Composition samples use only fields available on the real article card.
const samples: Reading[] = [
  {
    slug: "lab-blog-trazabilidad",
    title: "De la pregunta clínica a la fuente original.",
    excerpt:
      "El recorrido de la evidencia y las referencias que permiten revisar cada respuesta y recuperar el contexto de la fuente original.",
    createdAtLabel: "10 feb 2026",
    readTime: "6 min de lectura",
    image: "/lab/blog-cards/imagen-eureka.jpg",
    href: "/blog/lab-blog-trazabilidad",
  },
  {
    slug: "lab-blog-conocimiento",
    title: "El conocimiento cambia. La práctica también.",
    excerpt:
      "Cómo incorporar nuevas fuentes a los flujos de trabajo sanitarios y mantener el conocimiento actualizado, revisable y útil para el equipo.",
    createdAtLabel: "9 feb 2026",
    readTime: "4 min de lectura",
    image: null,
    href: "/blog/lab-blog-conocimiento",
  },
  {
    slug: "lab-blog-practica",
    title: "Qué necesita una IA para ser útil en el hospital.",
    excerpt:
      "Integración, contexto y revisión profesional para conectar la inteligencia artificial con las necesidades del trabajo asistencial.",
    createdAtLabel: "8 feb 2026",
    readTime: "5 min de lectura",
    image: null,
    href: "/blog/lab-blog-practica",
  },
];
const sampleSlugs = new Set(samples.map((article) => article.slug));

function OpenCard({
  article,
  getSampleAction,
  fadeBottom = false,
}: CardProps & { fadeBottom?: boolean }) {
  return (
    <article className="group relative flex min-w-0 flex-col rounded-2xl transition-[translate] duration-300 ease-out focus-within:-translate-y-1.5 hover:-translate-y-1.5 motion-reduce:translate-none! motion-reduce:transition-none">
      <div
        className={`relative aspect-[1.85] overflow-hidden bg-[#e5f1f4] dark:bg-[#102231] ${fadeBottom ? "rounded-t-2xl" : "rounded-2xl"}`}
      >
        <div
          className={`absolute inset-0 ${imageMotion} motion-reduce:group-focus-within:scale-100 motion-reduce:group-hover:scale-100`}
        >
          <Cover article={article} />
        </div>
        {fadeBottom && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[24%] bg-linear-to-b from-white/0 via-white/20 to-white dark:from-[#06111f]/0 dark:via-[#06111f]/20 dark:to-[#06111f]"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col pt-5">
        <h2 className="font-display min-h-[2.7em] text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] lg:max-xl:min-h-[4.05em] dark:text-slate-50">
          {article.title}
        </h2>
        <p className="font-body mt-2.5 line-clamp-3 min-h-[4.95em] text-[13px] leading-[1.65] text-slate-600 dark:text-slate-400">
          {article.excerpt}
        </p>
        <div className="mt-auto pt-4">
          <Meta article={article} />
        </div>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

function OpenFadeCard(props: CardProps) {
  return <OpenCard {...props} fadeBottom />;
}

function CutCard({ article, getSampleAction }: CardProps) {
  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl bg-[#eef5f7] dark:bg-[#102432]">
      <div className="relative aspect-[1.5]">
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 ${imageMotion}`}>
            <Cover article={article} />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-focus-within:translate-x-full group-hover:translate-x-full motion-reduce:hidden"
          />
        </div>
        <div className="absolute right-0 bottom-0 flex size-13 items-center justify-center rounded-tl-2xl bg-[#eef5f7] pt-1 pl-1 dark:bg-[#102432]">
          <span className="border-primary-light/20 text-primary-light group-focus-within:border-primary-light group-focus-within:bg-primary-light group-hover:border-primary-light group-hover:bg-primary-light dark:border-primary-dark/25 dark:text-primary-dark dark:group-focus-within:border-primary-dark dark:group-focus-within:bg-primary-dark dark:group-hover:border-primary-dark dark:group-hover:bg-primary-dark flex size-9 items-center justify-center rounded-full border bg-white transition-[background-color,color,border-color] duration-250 group-focus-within:text-white group-hover:text-white motion-reduce:transition-none dark:bg-[#102432] dark:group-focus-within:text-[#06111f] dark:group-hover:text-[#06111f]">
            <ArrowUpRight
              aria-hidden="true"
              className="size-4 transition-transform duration-250 group-focus-within:rotate-45 group-hover:rotate-45 motion-reduce:transform-none motion-reduce:transition-none"
              strokeWidth={1.8}
            />
          </span>
        </div>
      </div>
      <div className="relative flex flex-1 flex-col px-5 pt-4 pb-5">
        <h2 className="font-display min-h-[2.7em] text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] lg:max-xl:min-h-[4.05em] dark:text-slate-50">
          {article.title}
        </h2>
        <p className="font-body mt-3 line-clamp-2 text-[13px] leading-[1.65] text-slate-600 dark:text-slate-400">
          {article.excerpt}
        </p>
        <div className="mt-auto pt-4">
          <Meta article={article} />
        </div>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

function HeadlineCard({ article, getSampleAction }: CardProps) {
  return (
    <article className="group relative flex min-w-0 flex-col border-t border-cyan-800/20 pt-4 dark:border-cyan-300/20">
      <p className="font-body text-[11px] text-slate-500 dark:text-slate-400">
        {article.readTime}
      </p>
      <h2 className="font-display group-focus-within:text-primary-light group-hover:text-primary-light dark:group-focus-within:text-primary-dark dark:group-hover:text-primary-dark mt-3 min-h-[2.7em] text-lg leading-[1.35] font-semibold tracking-tight text-[#05215e] transition-colors duration-250 motion-reduce:transition-none lg:max-xl:min-h-[4.05em] dark:text-slate-50">
        {article.title}
      </h2>
      <div className="relative mt-4 aspect-[1.4] overflow-hidden rounded-lg">
        <div className={`absolute inset-0 ${imageMotion}`}>
          <Cover article={article} />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 ring-1 ring-cyan-800/5 ring-inset dark:ring-cyan-300/10"
        />
      </div>
      <p className="font-body mt-4 line-clamp-2 text-[13px] leading-[1.65] text-slate-600 dark:text-slate-400">
        {article.excerpt}
      </p>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="font-body text-[11px] text-slate-500 dark:text-slate-400">
          {article.createdAtLabel}
        </span>
        <span className="font-body text-primary-light dark:text-primary-dark inline-flex items-center gap-2 text-[11px] font-semibold">
          Leer
          <ArrowRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-250 group-focus-within:translate-x-1 group-hover:translate-x-1 motion-reduce:transform-none motion-reduce:transition-none"
            strokeWidth={1.8}
          />
        </span>
      </div>
      <ReadingAction article={article} getSampleAction={getSampleAction} />
    </article>
  );
}

const cards = {
  open: OpenCard,
  "open-2": OpenFadeCard,
  cut: CutCard,
  headline: HeadlineCard,
  ...blogCardExplorations,
};

export function BlogCardsLab({
  direction,
  context,
  replay,
  posts,
}: {
  direction: BlogCardsDirection;
  context: boolean;
  replay: number;
  posts: BlogPost[];
}) {
  const reducedMotion = useReducedMotion();
  const [sample, setSample] = useState<Reading | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const dialogTitle = useId();
  const articles = [...posts, ...samples].slice(0, 4);
  const getSampleAction = (article: Reading) => {
    if (!sampleSlugs.has(article.slug)) return undefined;
    return () => {
      setSample(article);
      dialog.current?.showModal();
    };
  };
  const sectionDirection = isBlogSectionDirection(direction) ? direction : null;
  const Card =
    direction in cards ? cards[direction as keyof typeof cards] : OpenCard;

  return (
    <>
      <main
        aria-label="Laboratorio de fichas del blog"
        className="section-navigation-layout relative z-10"
      >
        {context && (
          <>
            <ProductStrataSection layout="mobile" />
            <VolumeSection palette="original" />
          </>
        )}
        <section
          id="blog-cards-preview"
          aria-labelledby="blog-cards-title"
          className="relative scroll-mt-[calc(var(--lab-toolbar-height,80px)+24px)] bg-white px-5 py-12 sm:px-10 dark:bg-[#06111f]"
        >
          <div className="mx-auto w-full max-w-7xl">
            {sectionDirection ? (
              <BlogSectionExploration
                direction={sectionDirection}
                articles={articles}
                getSampleAction={getSampleAction}
                replay={replay}
              />
            ) : (
              <>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                  <div>
                    <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.22em] uppercase">
                      Lecturas clínicas
                    </p>
                    <h1
                      id="blog-cards-title"
                      className="font-display mt-3 text-4xl font-extrabold tracking-tight text-[#05215e] xl:text-5xl dark:text-slate-50"
                    >
                      <BlogHeadingText />
                    </h1>
                    <p className="font-body mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 dark:text-slate-400">
                      Lecturas recientes sobre IA médica, tendencias sanitarias
                      y nuevas formas de transformar la asistencia al paciente
                      en el sistema de salud.
                    </p>
                  </div>
                  <Link
                    href="/blog"
                    className={`font-body text-primary-light dark:text-primary-dark hover:bg-primary-light/5 dark:hover:bg-primary-dark/10 inline-flex min-h-10 shrink-0 items-center gap-3 self-start rounded-full border border-cyan-800/20 px-5 text-xs font-semibold transition-colors sm:self-end dark:border-cyan-300/20 ${focus}`}
                  >
                    Ver todos
                    <ArrowRight
                      aria-hidden="true"
                      className="size-3.5"
                      strokeWidth={1.8}
                    />
                  </Link>
                </div>
                <motion.div
                  key={`${direction}-${replay}`}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: reducedMotion ? 0 : 0.3 }}
                  className="mt-8 grid items-stretch gap-x-6 gap-y-9 motion-reduce:opacity-100! sm:grid-cols-2 lg:grid-cols-4"
                >
                  {articles.length === 0 ? (
                    <p className="font-body text-slate-600 dark:text-slate-400">
                      No hay artículos disponibles.
                    </p>
                  ) : (
                    articles.map((article) => (
                      <Card
                        key={article.slug}
                        article={article}
                        getSampleAction={getSampleAction}
                      />
                    ))
                  )}
                </motion.div>
              </>
            )}
            <div
              aria-hidden="true"
              className="mt-10 border-t border-cyan-800/10 dark:border-cyan-300/10"
            />
          </div>
        </section>
        {context && <ContactAssistant />}
      </main>
      {context && <VerticalFooter />}
      <dialog
        ref={dialog}
        aria-labelledby={dialogTitle}
        className="m-auto w-[calc(100%-40px)] max-w-lg rounded-2xl border border-cyan-800/20 bg-[#fbfdff] p-7 text-[#05215e] shadow-2xl backdrop:bg-[#06111f]/60 dark:border-cyan-300/20 dark:bg-[#102231] dark:text-slate-50"
      >
        <form method="dialog" className="flex justify-end">
          <button
            aria-label="Cerrar muestra"
            className={`rounded-full p-2 ${focus}`}
          >
            <X aria-hidden="true" className="size-5" strokeWidth={1.8} />
          </button>
        </form>
        <p className="font-body text-primary-light dark:text-primary-dark text-xs font-semibold uppercase">
          Muestra del laboratorio
        </p>
        <h2
          id={dialogTitle}
          className="font-display mt-4 text-2xl font-semibold tracking-tight"
        >
          {sample?.title}
        </h2>
        <p className="font-body mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400">
          {sample?.excerpt}
        </p>
        <p className="font-body mt-5 text-xs leading-6 text-slate-500 dark:text-slate-400">
          Contenido de muestra para revisar la composición. No es un artículo
          publicado.
        </p>
      </dialog>
    </>
  );
}

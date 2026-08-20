import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BlogArticleCard } from "~/app/_components/blog-article-card";
import { latestBlogArticles } from "~/app/_components/blog-articles";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { Eyebrow, PageShell } from "~/app/_components/site";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";

export const metadata: Metadata = {
  title: "Nuestro blog",
  description:
    "Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas formas de transformar la asistencia al paciente en el sistema de salud.",
};

const articlesPerPage = 12;

type BlogPageProps = {
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

function getPageParam(page: string | string[] | undefined) {
  const value = Array.isArray(page) ? page[0] : page;
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) ? parsed : 1;
}

function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const previousPage = Math.max(currentPage - 1, 1);
  const nextPage = Math.min(currentPage + 1, totalPages);

  return (
    <nav
      aria-label="Paginación del blog"
      className="mt-12 flex items-center justify-center gap-2"
    >
      <Link
        href={`/blog?page=${previousPage}`}
        aria-disabled={currentPage === 1}
        className={`grid size-10 place-items-center rounded-full border text-slate-600 transition dark:text-slate-400 ${
          currentPage === 1
            ? "border-primary-light/60 pointer-events-none bg-white/60 opacity-45 dark:border-cyan-300/10 dark:bg-white/3"
            : "hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 bg-white/80 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:hover:text-cyan-100"
        }`}
      >
        <ChevronLeft aria-hidden="true" className="size-4" strokeWidth={1.8} />
        <span className="sr-only">Página anterior</span>
      </Link>

      {pages.map((page) => {
        const active = page === currentPage;

        return (
          <Link
            key={page}
            href={`/blog?page=${page}`}
            aria-current={active ? "page" : undefined}
            className={`font-body grid size-10 place-items-center rounded-full border text-sm font-semibold transition ${
              active
                ? "border-primary-light bg-primary-light shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#03111d]"
                : "hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 bg-white/80 text-slate-600 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:text-slate-400 dark:hover:text-cyan-100"
            }`}
          >
            {page}
          </Link>
        );
      })}

      <Link
        href={`/blog?page=${nextPage}`}
        aria-disabled={currentPage === totalPages}
        className={`grid size-10 place-items-center rounded-full border text-slate-600 transition dark:text-slate-400 ${
          currentPage === totalPages
            ? "border-primary-light/60 pointer-events-none bg-white/60 opacity-45 dark:border-cyan-300/10 dark:bg-white/3"
            : "hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 bg-white/80 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:hover:text-cyan-100"
        }`}
      >
        <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
        <span className="sr-only">Página siguiente</span>
      </Link>
    </nav>
  );
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedPage = getPageParam(resolvedSearchParams?.page);
  const totalPages = Math.ceil(latestBlogArticles.length / articlesPerPage);
  const currentPage =
    requestedPage >= 1 && requestedPage <= totalPages ? requestedPage : 1;
  const startIndex = (currentPage - 1) * articlesPerPage;
  const visibleArticles = latestBlogArticles.slice(
    startIndex,
    startIndex + articlesPerPage,
  );

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />
        <section className="relative isolate z-10 overflow-hidden">
          <div className="pointer-events-none fixed inset-0 -right-50 z-0">
            <SignalField
              className="-top-48 h-[calc(100%+12rem)]"
              intensity="hero"
              opacity={0.72}
            />
          </div>
          <ProductSignalLeft className="fixed -bottom-80 -left-155 w-250 rotate-20" />
          <div className="relative z-10 mx-auto w-full px-5 pt-32 pb-20 sm:px-8 lg:pt-36 lg:pb-24">
            <div className="mx-auto max-w-7xl">
              <div className="max-w-4xl">
                <Eyebrow>Lecturas clínicas</Eyebrow>
                <h1 className="font-display mt-5 text-5xl font-extrabold tracking-tight text-[#05215e] sm:text-6xl dark:text-slate-50">
                  Nuestro blog
                </h1>
                <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  Lecturas recientes sobre IA médica, tendencias sanitarias y
                  nuevas formas de transformar la asistencia al paciente en el
                  sistema de salud.
                </p>
              </div>

              <div className="mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visibleArticles.map((article) => (
                  <BlogArticleCard key={article.title} article={article} />
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          </div>
        </section>
      </main>
    </PageShell>
  );
}

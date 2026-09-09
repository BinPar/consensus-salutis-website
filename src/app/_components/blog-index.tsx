/**
 * Piezas compartidas por `/blog` y `/blog/tag/<tag>`.
 *
 * Las dos rutas son el mismo índice con distinto filtro, así que el shell, la
 * rejilla, el filtro de tags, el estado vacío y la paginación viven aquí y no
 * duplicados en dos páginas.
 */
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { BlogArticleCard } from "~/app/_components/blog-article-card";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import type { BlogPost, BlogTag } from "~/lib/blog";

export const BLOG_POSTS_PER_PAGE = 12;

/** Fondo y encuadre del índice. Misma receta que el hero de la home. */
export function BlogIndexShell({ children }: { children: React.ReactNode }) {
  return (
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
          <div className="mx-auto max-w-7xl">{children}</div>
        </div>
      </section>
    </main>
  );
}

export function BlogGrid({ posts }: { posts: BlogPost[] }) {
  return (
    <div className="mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {posts.map((post) => (
        <BlogArticleCard key={post.slug} article={post} />
      ))}
    </div>
  );
}

/**
 * Filtro de tags.
 *
 * `activeTag` en `undefined` marca «Todos» como activo, que es `/blog`. Los tags
 * se pintan en el orden del índice del loader: primero los más usados.
 */
export function BlogTagFilter({
  tags,
  activeTag,
}: {
  tags: BlogTag[];
  activeTag?: string;
}) {
  if (tags.length === 0) return null;

  const entries = [
    { tag: undefined, label: "Todos", href: "/blog" },
    ...tags.map((entry) => ({
      tag: entry.tag,
      label: entry.label,
      href: `/blog/tag/${entry.tag}`,
    })),
  ];

  return (
    <nav
      aria-label="Filtro por etiqueta"
      className="mt-10 flex flex-wrap gap-2"
    >
      {entries.map((entry) => {
        const active = entry.tag === activeTag;

        return (
          <Link
            key={entry.href}
            href={entry.href}
            aria-current={active ? "page" : undefined}
            className={`font-body inline-flex h-8 items-center rounded-full border px-4 text-xs font-semibold transition-all duration-150 ${
              active
                ? "border-primary-light bg-primary-light shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#03111d]"
                : "hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 bg-white/80 text-slate-600 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:text-slate-400 dark:hover:text-cyan-100"
            }`}
          >
            {entry.label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Estado vacío.
 *
 * Sobrio y sin disculpas: el blog puede estar legítimamente vacío —el motor se
 * publica antes que el contenido— y una página vacía con un enlace de vuelta es
 * mejor que una rejilla de tarjetas de relleno.
 */
export function BlogEmptyState({
  title = "Todavía no hay artículos publicados.",
  body = "Estamos preparando las primeras lecturas. Si quieres que te avisemos cuando publiquemos, escríbenos.",
  action = { href: "/contacto", label: "Hablar con el equipo" },
}: {
  title?: string;
  body?: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="shadow-big-blocks mt-14 rounded-2xl border border-cyan-800/15 bg-white/80 px-6 py-14 text-center backdrop-blur-xs sm:px-10 dark:border-cyan-300/20 dark:bg-[#152230e6]/90">
      <p className="font-display text-xl font-semibold text-[#05215e] dark:text-slate-100">
        {title}
      </p>
      <p className="font-body mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
        {body}
      </p>
      <Link
        href={action.href}
        className="font-body bg-primary-light shadow-big-blocks dark:bg-primary-dark dark:hover:bg-primary-dark-lighter mt-8 inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#087a85] dark:text-[#03111d] dark:shadow-[0_0_24px_rgba(0,188,187,0.18)]"
      >
        {action.label}
      </Link>
    </div>
  );
}

export function BlogPagination({
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

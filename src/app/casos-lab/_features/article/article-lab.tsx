import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { BlogCover } from "~/app/_components/blog-cover";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { Eyebrow } from "~/app/_components/eyebrow";
import { VerticalFooter } from "~/app/_components/site-footer";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import type { BlogPost } from "~/lib/blog";
import { articleBodyClassName } from "./article-typography";
import { ArticleSidebarLayout } from "./article-sidebar-layout";
import type { ArticleDirection } from "./article-directions";

/** Copia editable del artículo actual; la barra del lab sustituye al header fijo. */
export function ArticleLab({
  post,
  children,
  direction = "reference",
  posts = [],
}: {
  post?: BlogPost;
  children: ReactNode;
  direction?: ArticleDirection;
  posts?: BlogPost[];
}) {
  if (!post)
    return (
      <main
        id="article-preview"
        className="font-body px-5 py-20 text-center text-slate-600 dark:text-slate-400"
      >
        No hay artículos disponibles para esta referencia.
      </main>
    );
  if (direction === "sidebar")
    return (
      <ArticleSidebarLayout key={post.slug} post={post} posts={posts}>
        {children}
      </ArticleSidebarLayout>
    );
  return (
    <>
      <main
        id="article-preview"
        data-article-reference=""
        className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]"
      >
        <HomeMotionBackground />
        <article className="relative isolate z-10 overflow-hidden">
          <div className="pointer-events-none fixed inset-0 -right-50 z-0">
            <SignalField
              className="-top-48 h-[calc(100%+12rem)]"
              intensity="hero"
              opacity={0.72}
            />
          </div>
          <ProductSignalLeft className="fixed -bottom-80 -left-155 w-250 rotate-20" />

          <div className="relative z-10 mx-auto w-full px-5 pt-16 pb-20 sm:px-8 lg:pt-20 lg:pb-24">
            <div className="mx-auto max-w-4xl">
              <div className="px-5 sm:px-8">
                <Link
                  href="/blog"
                  className="font-body bg-primary-light shadow-big-blocks dark:bg-primary-dark dark:hover:bg-primary-dark/85 inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#087a85] sm:self-end dark:text-[#03111d] dark:shadow-[0_0_24px_rgba(0,188,187,0.18)]"
                >
                  <ArrowLeft
                    aria-hidden="true"
                    className="size-4"
                    strokeWidth={1.8}
                  />
                  Volver
                </Link>

                <header className="mt-10">
                  <Eyebrow>Lecturas clínicas</Eyebrow>
                  <h1 className="font-display mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-[#05215e] sm:text-5xl lg:text-6xl dark:text-slate-50">
                    {post.title}
                  </h1>
                  <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                    {post.excerpt}
                  </p>
                  <p className="font-body mt-7 text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-semibold text-[#05215e] dark:text-slate-100">
                      {post.author.name}
                    </span>
                    <span className="text-slate-500 dark:text-slate-500">
                      {" · "}
                      {post.author.role}
                    </span>
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Calendar
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.8}
                      />
                      {post.createdAtLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.8}
                      />
                      {post.readTime}
                    </span>
                    {post.updatedAtLabel ? (
                      <span>Actualizado el {post.updatedAtLabel}</span>
                    ) : null}
                  </div>
                  <nav
                    aria-label="Etiquetas del artículo"
                    className="mt-6 flex flex-wrap gap-2"
                  >
                    {post.tags.map((tag, position) => (
                      <Link
                        key={tag}
                        href={`/blog/tag/${tag}`}
                        className="font-body hover:border-primary-light/35 dark:hover:border-primary-dark border-primary-light/60 inline-flex h-8 items-center rounded-full border bg-white/80 px-4 text-xs font-semibold text-slate-600 transition-all duration-150 hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:text-slate-400 dark:hover:text-cyan-100"
                      >
                        {post.tagLabels[position] ?? tag}
                      </Link>
                    ))}
                  </nav>
                </header>
              </div>
              <div className="px-5 sm:px-8">
                <div className="shadow-big-blocks relative mt-12 overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/70 dark:border-cyan-300/20 dark:bg-[#152230e6]/80">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt ?? ""}
                      width={1600}
                      height={700}
                      priority
                      className="aspect-16/7 w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-16/7 w-full">
                      <BlogCover slug={post.slug} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 rounded-2xl px-5 pb-6 backdrop-blur-xs sm:px-8 sm:pb-7">
                <div className={articleBodyClassName}>{children}</div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <VerticalFooter />
    </>
  );
}

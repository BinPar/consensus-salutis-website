"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Calendar, Clock, User } from "lucide-react";
import type { ReactNode } from "react";
import type { BlogPost } from "~/lib/blog";
import { BlogCover } from "~/app/_components/blog-cover";
import { Eyebrow } from "~/app/_components/eyebrow";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { VerticalFooter } from "~/app/_components/site-footer";
import { articleBodyClassName } from "./article-typography";
import { useArticleIndex } from "./use-article-index";

const container =
  "mx-auto w-[calc(100%-40px)] max-w-[832px] sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] lg:max-w-[1152px]";
const label =
  "font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase";
type Index = ReturnType<typeof useArticleIndex>;

function ArticleMetadata({ post }: { post: BlogPost }) {
  return (
    <section aria-label="Información del artículo" className="font-body">
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs leading-[1.5] font-semibold text-slate-500 lg:flex-col lg:gap-2 dark:text-[#a9bacb]">
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <User aria-hidden="true" size={14} strokeWidth={2} />
          Por {post.author.name}
        </span>
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Calendar aria-hidden="true" size={14} strokeWidth={2} />
          <time dateTime={post.date}>{post.createdAtLabel}</time>
        </span>
        <span className="inline-flex items-center gap-2 whitespace-nowrap">
          <Clock aria-hidden="true" size={14} strokeWidth={2} />
          {post.readTime}
        </span>
      </div>
      {post.updatedAtLabel && (
        <p className="mt-2 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
          Actualizado el {post.updatedAtLabel}
        </p>
      )}
      <p
        className={`${label} mt-5 hidden border-t border-cyan-800/15 pt-5 lg:block dark:border-cyan-300/15`}
      >
        Temas
      </p>
      <nav
        aria-label="Etiquetas del artículo"
        className="mt-4 flex flex-wrap gap-1.5 lg:mt-3"
      >
        {post.tags.map((tag, index) => (
          <Link
            key={tag}
            href={`/blog/tag/${tag}`}
            className="font-body border-primary-light/20 hover:border-primary-light/50 hover:text-primary-light dark:hover:text-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:border-primary-dark/50 inline-flex min-h-6 max-w-full items-center rounded-full border bg-white/50 px-2.5 py-0.5 text-[10px] leading-4 font-medium text-slate-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/15 dark:bg-[#152230]/50 dark:text-slate-300"
          >
            {post.tagLabels[index] ?? tag}
          </Link>
        ))}
      </nav>
    </section>
  );
}

function ArticleIndex({ index }: { index: Index }) {
  if (!index.headings.length) return null;
  return (
    <nav
      aria-label="Índice del artículo"
      data-article-toc=""
      className="font-body"
    >
      <ol className="before:bg-primary-light/16 dark:before:bg-primary-dark/20 relative before:absolute before:inset-y-0 before:left-[3px] before:w-px">
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
                {active && (
                  <span
                    aria-hidden="true"
                    className="bg-primary-light dark:bg-primary-dark pointer-events-none absolute top-1/2 left-[2px] h-[22px] w-[3px] -translate-y-1/2 rounded-full"
                  />
                )}
                <span className="line-clamp-1 min-w-0 flex-1">
                  {heading.title}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function RelatedArticles({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null;
  return (
    <section
      aria-label="Artículos relacionados"
      className="border-t border-cyan-800/15 pt-5 dark:border-cyan-300/15"
    >
      <h2 className={label}>Quizá te interese</h2>
      <ul className="mt-3 divide-y divide-cyan-800/10 dark:divide-cyan-300/10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={post.href}
              className="group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark block rounded-lg py-3 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span className="flex items-start gap-3">
                <span className="font-display group-hover:text-primary-light dark:group-hover:text-primary-dark text-[13px] leading-5 font-semibold tracking-tight text-[#05215e] transition-colors dark:text-slate-100">
                  {post.title}
                </span>
                <ArrowUpRight
                  aria-hidden="true"
                  size={14}
                  strokeWidth={1.8}
                  className="text-primary-light dark:text-primary-dark mt-1 shrink-0"
                />
              </span>
              <span className="font-body mt-2 block text-[11px] text-slate-500 dark:text-slate-400">
                {post.readTime}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function ArticleSidebarLayout({
  post,
  posts,
  children,
}: {
  post: BlogPost;
  posts: BlogPost[];
  children: ReactNode;
}) {
  const index = useArticleIndex(post.slug);
  const relatedPosts = posts
    .filter((candidate) => candidate.slug !== post.slug)
    .map((candidate) => ({
      post: candidate,
      shared: candidate.tags.filter((tag) => post.tags.includes(tag)).length,
    }))
    .filter((candidate) => candidate.shared > 0)
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        b.post.date.localeCompare(a.post.date) ||
        a.post.slug.localeCompare(b.post.slug),
    )
    .slice(0, 3)
    .map((candidate) => candidate.post);
  return (
    <>
      <main
        id="article-preview"
        data-article-column-layout=""
        className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 overflow-clip [clip-path:inset(0)]"
        >
          <HomeMotionBackground />
          <div className="fixed inset-0 -right-50">
            <SignalField
              className="-top-48 h-[calc(100%+12rem)]"
              intensity="hero"
              opacity={0.72}
            />
          </div>
          <ProductSignalLeft className="fixed -bottom-80 -left-155 w-250 rotate-20" />
        </div>
        <article
          className={`${container} relative pt-8 pb-20 sm:pt-12 lg:pt-16 lg:pb-24`}
        >
          <header className="lg:max-w-[832px]">
            <Eyebrow>
              <Link
                href="/blog"
                className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                <ArrowLeft aria-hidden="true" size={15} strokeWidth={1.8} />
                Volver al blog
              </Link>
            </Eyebrow>
            <h1 className="font-display mt-4 text-[32px] leading-[1.08] font-extrabold tracking-tight text-[#05215e] sm:text-[40px] lg:mt-5 lg:text-[54px] dark:text-slate-50">
              {post.title}
            </h1>
            <p className="font-body mt-4 text-base leading-7 text-slate-600 lg:mt-6 lg:text-lg lg:leading-8 dark:text-slate-400">
              {post.excerpt}
            </p>
          </header>
          <div className="mt-5 lg:hidden">
            <ArticleMetadata post={post} />
          </div>
          <div className="relative mt-6 lg:mt-10 lg:grid lg:grid-cols-[minmax(0,1fr)_232px] lg:items-stretch lg:gap-8 xl:grid-cols-[minmax(0,1fr)_264px] xl:gap-14">
            <div className="min-w-0">
              <div className="shadow-big-blocks relative overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/70 dark:border-cyan-300/20 dark:bg-[#152230]/80">
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
              <div
                ref={index.bodyRef}
                data-article-body=""
                className={`${articleBodyClassName} relative isolate mt-10 before:pointer-events-none before:absolute before:-inset-x-4 before:-inset-y-6 before:-z-10 before:rounded-3xl before:bg-white/85 before:blur-xl sm:before:-inset-x-6 dark:before:bg-[#06111f]/90`}
              >
                {children}
              </div>
              {relatedPosts.length > 0 && (
                <div className="mt-10 lg:hidden">
                  <RelatedArticles posts={relatedPosts} />
                </div>
              )}
            </div>
            <aside
              aria-label="Guía de lectura del artículo"
              className="hidden min-w-0 lg:block"
            >
              <div
                data-article-sidebar=""
                className="sticky top-[calc(var(--lab-toolbar-height,80px)+24px)] max-h-[calc(100svh-var(--lab-toolbar-height,80px)-48px)] [scrollbar-width:thin] space-y-5 overflow-y-auto overscroll-contain pr-2 pb-1"
              >
                <ArticleMetadata post={post} />
                <section className="border-t border-cyan-800/15 pt-5 dark:border-cyan-300/15">
                  <h2 className={`${label} mb-3`}>En este artículo</h2>
                  <ArticleIndex index={index} />
                </section>
                <RelatedArticles posts={relatedPosts} />
                <div className="border-t border-cyan-800/15 pt-5 dark:border-cyan-300/15">
                  <Link
                    href="/blog"
                    className="font-body text-primary-light dark:text-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex items-center gap-2 rounded-full text-xs font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    Explorar el blog
                    <ArrowUpRight
                      aria-hidden="true"
                      size={14}
                      strokeWidth={1.8}
                    />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </main>
      <VerticalFooter />
    </>
  );
}

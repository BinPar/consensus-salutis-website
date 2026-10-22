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
import { SideLinkedInLink } from "~/app/_components/side-linkedin-link";
import { BlogArticleReadingLayout } from "./blog-article-reading-layout";
import { articleLabelClassName as label } from "./blog-article-styles";

const container =
  "mx-auto w-[calc(100%-40px)] max-w-[832px] sm:w-[calc(100%-64px)] lg:w-[calc(100%-80px)] lg:max-w-[1152px]";

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

/** Presentación del artículo; conserva el contenido y los datos resueltos por la ruta. */
export function BlogArticleView({
  post,
  posts,
  children,
}: {
  post: BlogPost;
  posts: BlogPost[];
  children: ReactNode;
}) {
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
    <main
      data-article-column-layout=""
      className="relative isolate bg-[#fbfdff] pt-16 dark:bg-[#06111f]"
    >
      <SideLinkedInLink />
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
        <BlogArticleReadingLayout
          key={post.slug}
          slug={post.slug}
          cover={
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
          }
          metadata={<ArticleMetadata post={post} />}
          related={
            relatedPosts.length ? (
              <RelatedArticles posts={relatedPosts} />
            ) : null
          }
        >
          {children}
        </BlogArticleReadingLayout>
      </article>
    </main>
  );
}

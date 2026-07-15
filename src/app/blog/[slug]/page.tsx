import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import SampleArticle from "~/app/blog/_articles/sample-article.mdx";
import {
  blogArticles,
  getBlogArticleBySlug,
} from "~/app/_components/blog-articles";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import { Eyebrow, PageShell } from "~/app/_components/site";
import {
  HomeMotionBackground,
  SignalField,
} from "~/app/_components/motion-system";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const articleContentBySlug = Object.fromEntries(
  blogArticles.map((article) => [article.slug, SampleArticle]),
);

const articleBodyClassName = [
  "font-body mx-auto text-base leading-7 text-slate-700 dark:text-slate-300",
  "[&>*:first-child]:mt-0",
  "[&>p]:mt-4 [&>p]:text-justify [&>p]:leading-[26px] [&>p]:text-slate-700 dark:[&>p]:text-slate-300",
  "[&>h1]:mt-0 [&>h1]:font-display [&>h1]:text-3xl [&>h1]:font-extrabold [&>h1]:tracking-tight [&>h1]:text-[#05215e] dark:[&>h1]:text-slate-50",
  "[&>h2]:mt-9 [&>h2]:font-display [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:tracking-tight [&>h2]:text-[#05215e] dark:[&>h2]:text-slate-50",
  "[&>h3]:mt-7 [&>h3]:font-display [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-[#05215e] dark:[&>h3]:text-slate-100",
  "[&>h4]:mt-5 [&>h4]:font-display [&>h4]:text-lg [&>h4]:font-semibold [&>h4]:text-primary-light dark:[&>h4]:text-primary-dark",
  "[&>ul]:my-4 [&>ul]:list-disc [&>ul]:space-y-1.5 [&>ul]:pl-6",
  "[&>ol]:my-4 [&>ol]:list-decimal [&>ol]:space-y-1.5 [&>ol]:pl-6",
  "[&>blockquote]:my-6 [&>blockquote]:rounded-xl [&>blockquote]:border [&>blockquote]:border-primary-light/60 [&>blockquote]:border-l-5 [&>blockquote]:border-primary-light [&>blockquote]:bg-primary-light/8 [&>blockquote]:py-3 [&>blockquote]:pr-5 [&>blockquote]:pl-5 [&>blockquote]:text-base [&>blockquote]:leading-7 [&>blockquote]:font-medium [&>blockquote]:text-[#05215e] dark:[&>blockquote]:border-primary-dark dark:[&>blockquote]:bg-primary-dark/8 dark:[&>blockquote]:text-slate-100",
  "[&>img]:my-7 [&>img]:w-full [&>img]:rounded-xl [&>img]:border [&>img]:border-cyan-800/10 [&>img]:shadow-big-blocks dark:[&>img]:border-cyan-300/15",
  "[&>hr]:my-8 [&>hr]:border-cyan-800/15 dark:[&>hr]:border-cyan-300/15",
  "[&_a]:font-semibold [&_a]:text-primary-light [&_a]:underline-offset-4 hover:[&_a]:underline dark:[&_a]:text-primary-dark",
  "[&_strong]:font-semibold [&_strong]:text-[#05215e] dark:[&_strong]:text-slate-100",
].join(" ");

export function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.imageSrc],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  const ArticleContent = articleContentBySlug[slug];

  if (!article || !ArticleContent) {
    notFound();
  }

  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
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

          <div className="relative z-10 mx-auto w-full px-5 pt-32 pb-20 sm:px-8 lg:pt-36 lg:pb-24">
            <div className="mx-auto max-w-4xl">
              <div className="sm:px-8 px-5">
                <Link
                  href="/blog"
                  className="font-body inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary-light px-6 text-sm font-semibold text-white shadow-big-blocks transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#087a85] sm:self-end dark:bg-primary-dark dark:text-[#03111d] dark:shadow-[0_0_24px_rgba(0,188,187,0.18)] dark:hover:bg-primary-dark-lighter"
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
                    {article.title}
                  </h1>
                  <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                    {article.excerpt}
                  </p>
                  <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2">
                      <Calendar
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.8}
                      />
                      {article.createdAtLabel}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock
                        aria-hidden="true"
                        className="size-4"
                        strokeWidth={1.8}
                      />
                      {article.readTime}
                    </span>
                  </div>
                </header>
              </div>
              <div className="px-5 sm:px-8">
                <div className="shadow-big-blocks relative mt-12 overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/70 dark:border-cyan-300/20 dark:bg-[#152230e6]/80">
                  <Image
                    src={article.imageSrc}
                    alt=""
                    width={1600}
                    height={900}
                    priority
                    className="aspect-16/7 w-full object-cover"
                  />
                </div>
              </div>

              <div className="mt-10 rounded-2xl px-5 pb-6 backdrop-blur-xs sm:px-8 sm:pb-7">
                <div className={articleBodyClassName}>
                  <ArticleContent />
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
    </PageShell>
  );
}

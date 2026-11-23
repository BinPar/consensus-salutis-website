import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { LocaleAlternates } from "~/app/_components/locale-alternates";
import { PageShell } from "~/app/_components/site";
import { BlogArticleView } from "~/app/_components/blog/blog-article-view";
import { localizeBlogPosts } from "~/app/_components/blog/localize-blog-posts";
import { localizedMetadata, localizedUrl } from "~/i18n/metadata";
import { LOCALE_TAGS, routing, type Locale } from "~/i18n/routing";
import { resolveLocale } from "~/i18n/server";
import {
  getBlogPostBySlug,
  getBlogPosts,
  getBlogPostVersions,
  type BlogPost,
} from "~/lib/blog";
import { absoluteUrl } from "~/lib/site";

import { OG_IMAGE } from "~/app/_components/og-image";

type ArticlePageProps = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

/*
  Un post que se publica después del build (su fecha llega más tarde) se
  renderiza al pedirlo, como antes: el layout de `[locale]` cierra sus propios
  parámetros, no los de esta página.
*/
export const dynamicParams = true;

/*
  Pares idioma + slug de todos los idiomas, no solo los del idioma padre: si un
  idioma devuelve `[]`, Next da la ruta entera por incompleta y no prerenderiza
  ningún post (404 en producción). Next mezcla cada par sobre el padre y el
  `locale` del par manda; los duplicados se funden por ruta.
*/
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    getBlogPosts(locale).map((post) => ({ locale, slug: post.slug })),
  );
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "blog" });
  const { slug } = await params;
  const post = getBlogPostBySlug(slug, locale);

  if (!post) {
    return {
      title: t("meta.post.notFound"),
    };
  }

  const href = { pathname: "/blog/[slug]", params: { slug } } as const;
  /* El hreflang solo enlaza los idiomas en que el post está traducido. */
  const localized = localizedMetadata(locale, href, getBlogPostVersions(post));

  return {
    title: post.title,
    description: post.excerpt,
    alternates: localized.alternates,
    openGraph: {
      ...localized.openGraph,
      type: "article",
      title: post.title,
      description: post.excerpt,
      images: [
        {
          ...OG_IMAGE,
          alt: t("og.alt"),
          /* La fecha cambia la URL cuando cambia el post: las redes vuelven a pedirla. */
          url: `${localizedUrl(locale, href)}/opengraph-image?v=${post.updatedAt ?? post.date}`,
        },
      ],
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
    },
  };
}

/**
 * `schema.org/Article` en línea.
 *
 * Apunta a la imagen OG y no a `image` del frontmatter a propósito: la OG existe
 * siempre y tiene el formato que piden los validadores; la portada es opcional y
 * es 16:7.
 */
async function ArticleJsonLd({
  post,
  locale,
}: {
  post: BlogPost;
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "blog.authors" });
  const url = localizedUrl(locale, {
    pathname: "/blog/[slug]",
    params: { slug: post.slug },
  });
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    inLanguage: LOCALE_TAGS[locale],
    mainEntityOfPage: url,
    url,
    image: [`${url}/opengraph-image`],
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: t(`${post.author.id}.role`),
    },
    publisher: {
      "@type": "Organization",
      name: "BinPar",
      url: absoluteUrl("/"),
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/favicon.svg"),
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      /* El JSON viene de nuestro propio frontmatter validado, no de entrada externa. */
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const locale = await resolveLocale(params);
  const { slug } = await params;
  const posts = await localizeBlogPosts(getBlogPosts(locale), locale);
  const post = posts.find((candidate) => candidate.slug === slug);

  if (!post) {
    notFound();
  }

  /*
    Import dinámico con plantilla: es lo que permite que publicar un post sea
    crear un fichero y nada más. Verificado bajo Turbopack (`pnpm dev`) y bajo
    el build de producción. El `slug` no es entrada libre —viene de
    `getBlogPostBySlug`, que solo devuelve ficheros que existen— así que el
    contexto que genera el bundler no abre ninguna ruta que no sea un post.
  */
  const { default: PostBody } = (await import(
    `../../../../content/blog/${locale}/${post.slug}.mdx`
  )) as { default: React.ComponentType };

  return (
    /* El selector de idioma lleva a la traducción del post, o al blog si no la hay. */
    <LocaleAlternates versions={getBlogPostVersions(post)} fallback="/blog">
      <PageShell>
        <ArticleJsonLd post={post} locale={locale} />
        <BlogArticleView post={post} posts={posts}>
          <PostBody />
        </BlogArticleView>
      </PageShell>
    </LocaleAlternates>
  );
}

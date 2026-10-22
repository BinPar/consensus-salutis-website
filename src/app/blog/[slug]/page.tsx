import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "~/app/_components/site";
import { BlogArticleView } from "~/app/_components/blog/blog-article-view";
import { getBlogPostBySlug, getBlogPosts, type BlogPost } from "~/lib/blog";
import { absoluteUrl } from "~/lib/site";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artículo no encontrado",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: absoluteUrl(post.href),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: absoluteUrl(post.href),
      publishedTime: post.date,
      modifiedTime: post.updatedAt ?? post.date,
      /* La imagen la aporta `opengraph-image.tsx`: 1200×630 con el título dentro. */
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
function ArticleJsonLd({ post }: { post: BlogPost }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    inLanguage: "es-ES",
    mainEntityOfPage: absoluteUrl(post.href),
    url: absoluteUrl(post.href),
    image: [absoluteUrl(`${post.href}/opengraph-image`)],
    keywords: post.tags.join(", "),
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
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
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);

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
    `../../../content/blog/${post.slug}.mdx`
  )) as { default: React.ComponentType };

  return (
    <PageShell>
      <ArticleJsonLd post={post} />
      <BlogArticleView post={post} posts={getBlogPosts()}>
        <PostBody />
      </BlogArticleView>
    </PageShell>
  );
}

/**
 * Motor de contenido del blog.
 *
 * Un fichero `.mdx` en `src/content/blog/<idioma>/` es un post en ese idioma.
 * La traducción de un post es otro fichero en la carpeta de su idioma, con su
 * propio slug y `translationKey` igual al slug del original en castellano: así
 * se enlazan las versiones para el hreflang y el selector. Todo lo que no es cuerpo
 * vive en el frontmatter, y todo lo que se puede derivar del fichero —slug,
 * href, minutos de lectura— se deriva aquí y no se escribe a mano en ningún
 * sitio.
 *
 * El loader no sabe de idiomas: devuelve fechas ISO y minutos (`BlogPostData`).
 * La etiqueta de fecha y la copy «6 min de lectura» las añade la página en el
 * servidor, con su idioma (`localizeBlogPosts`), y los componentes reciben
 * `BlogPost` con las cadenas ya hechas: así servidor y navegador pintan lo
 * mismo aunque su ICU no coincida.
 *
 * El esquema es Zod y es estricto a propósito: un post con frontmatter inválido
 * rompe `pnpm test` y el build, en vez de publicarse mal. El test de
 * `__tests__/blog.test.ts` valida **el contenido real**, no fixtures.
 *
 * Solo servidor: usa `node:fs`. Los componentes de cliente reciben los posts ya
 * serializados por props (ver `src/app/[locale]/page.tsx`).
 */
import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

import { getBlogAuthor, type BlogAuthor } from "~/content/blog/authors";
import type { LocalizedVersions } from "~/i18n/metadata";
import { routing, type Locale } from "~/i18n/routing";

export const BLOG_CONTENT_DIR = path.join(process.cwd(), "src/content/blog");

export const blogPostTypes = [
  "marco",
  "mecanismo",
  "sector",
  "evidencia",
  "nota-de-producto",
] as const;

export type BlogPostType = (typeof blogPostTypes)[number];

/*
  Ritmo de lectura de texto técnico en cada idioma (el castellano necesita más
  palabras para lo mismo). Redondea siempre a >= 1 minuto.
*/
const WORDS_PER_MINUTE: Record<Locale, number> = {
  es: 210,
  en: 230,
  ca: 210,
  gl: 210,
  /* El euskera aglutina: menos palabras, más largas, para el mismo contenido. */
  eu: 180,
};

export function blogContentDir(locale: Locale) {
  return path.join(BLOG_CONTENT_DIR, locale);
}

const dateSchema = z.coerce
  .date()
  .refine((value) => !Number.isNaN(value.getTime()), {
    message: "Fecha inválida: usa `YYYY-MM-DD` sin comillas.",
  });

const frontmatterSchema = z
  .object({
    title: z.string().trim().min(1, "`title` es obligatorio."),
    excerpt: z.string().trim().min(1, "`excerpt` es obligatorio."),
    date: dateSchema,
    updatedAt: dateSchema.optional(),
    author: z.string().trim().min(1, "`author` es obligatorio."),
    type: z.enum(blogPostTypes),
    tags: z
      .array(z.string().trim().min(1))
      .min(1, "`tags` necesita al menos una etiqueta."),
    image: z
      .string()
      .trim()
      .startsWith("/", "`image` debe ser una ruta absoluta de `public/`.")
      .optional(),
    imageAlt: z.string().trim().min(1).optional(),
    /* Minutos, no la etiqueta: la copy «6 min de lectura» la compone la página. */
    readTime: z.number().int().positive().optional(),
    draft: z.boolean().default(false),
    /* Solo en traducciones: el slug del post original en castellano. */
    translationKey: z.string().trim().min(1).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.image && !value.imageAlt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageAlt"],
        message: "`imageAlt` es obligatorio cuando hay `image`.",
      });
    }

    if (!getBlogAuthor(value.author)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["author"],
        message: `Autor «${value.author}» no está en el registro de \`src/content/blog/authors.ts\`.`,
      });
    }

    if (value.updatedAt && value.updatedAt < value.date) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["updatedAt"],
        message: "`updatedAt` no puede ser anterior a `date`.",
      });
    }
  });

export type BlogFrontmatter = z.infer<typeof frontmatterSchema>;

export type BlogPostData = {
  locale: Locale;
  /* El slug del original en castellano; es el mismo en todas sus traducciones. */
  translationKey: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  type: BlogPostType;
  /* ISO corto `YYYY-MM-DD`: serializable a props de cliente, ordenable como texto. */
  date: string;
  updatedAt: string | null;
  author: BlogAuthor;
  /* Slugs normalizados: son la clave de las rutas `/blog/tag/<tag>`. */
  tags: string[];
  /* Las mismas etiquetas como las escribió el autor, para pintarlas. */
  tagLabels: string[];
  image: string | null;
  imageAlt: string | null;
  draft: boolean;
  wordCount: number;
  readMinutes: number;
};

/**
 * Un post con las etiquetas en el idioma de la página. Lo construye
 * `localizeBlogPosts` (`~/app/_components/blog/localize-blog-posts`).
 */
export type BlogPost = BlogPostData & {
  createdAtLabel: string;
  updatedAtLabel: string | null;
  readTime: string;
};

export type BlogTag = {
  tag: string;
  label: string;
  count: number;
};

/**
 * Normaliza una etiqueta a slug.
 *
 * Los tags son libres por decisión de producto, así que la deriva se mitiga aquí:
 * «IA», «ia» e «I.A.» colapsan en la misma clave. Lo que no colapsa —sinónimos
 * de verdad— lo avisa el test de tags casi duplicados.
 */
export function normalizeTag(tag: string) {
  return tag
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/*
  Orden de slugs y tags normalizados: solo llevan `[a-z0-9-]`, así que comparar
  por código da el mismo orden que la colación de cualquier idioma y no ata el
  loader a uno.
*/
function compareSlugs(left: string, right: string) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function toIsoDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function countWords(body: string) {
  const plain = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|-]+/g, " ");

  return plain.split(/\s+/).filter(Boolean).length;
}

/**
 * ¿Se muestran borradores y fechas futuras?
 *
 * Sí en dev y en preview, no en producción. Es lo que permite escribir un post
 * con un agente, verlo en el deployment de la rama y publicarlo al mergear sin
 * tocar el fichero. `VERCEL_ENV` manda cuando existe porque en un preview
 * `NODE_ENV` ya vale `production`.
 */
export function includesUnpublishedPosts() {
  const vercelEnv = process.env.VERCEL_ENV;

  if (vercelEnv) return vercelEnv !== "production";

  return process.env.NODE_ENV !== "production";
}

export function parseBlogPost(
  fileName: string,
  source: string,
  locale: Locale = routing.defaultLocale,
): BlogPostData {
  const slug = fileName.replace(/\.mdx$/, "");
  const { data, content } = matter(source);
  const parsed = frontmatterSchema.safeParse(data);

  if (!parsed.success) {
    const detail = parsed.error.issues
      .map((issue) => `${issue.path.join(".") || "(raíz)"}: ${issue.message}`)
      .join("; ");

    throw new Error(`Frontmatter inválido en «${fileName}» → ${detail}`);
  }

  const frontmatter = parsed.data;

  if (locale === routing.defaultLocale && frontmatter.translationKey) {
    throw new Error(
      `Frontmatter inválido en «${fileName}» → translationKey: solo lo llevan las traducciones.`,
    );
  }

  if (locale !== routing.defaultLocale && !frontmatter.translationKey) {
    throw new Error(
      `Frontmatter inválido en «${fileName}» → translationKey: una traducción tiene que apuntar al slug de su original.`,
    );
  }

  const author = getBlogAuthor(frontmatter.author, locale);

  /* `superRefine` ya lo ha verificado; el `if` es para el tipo, no para la lógica. */
  if (!author) {
    throw new Error(
      `Autor «${frontmatter.author}» inexistente en «${fileName}».`,
    );
  }

  const wordCount = countWords(content);
  const readMinutes =
    frontmatter.readTime ??
    Math.max(1, Math.round(wordCount / WORDS_PER_MINUTE[locale]));
  const tags: string[] = [];
  const tagLabels: string[] = [];

  frontmatter.tags.forEach((rawTag) => {
    const normalized = normalizeTag(rawTag);

    if (!normalized || tags.includes(normalized)) return;

    tags.push(normalized);
    tagLabels.push(rawTag);
  });

  if (tags.length === 0) {
    throw new Error(
      `Frontmatter inválido en «${fileName}» → tags: ninguna etiqueta sobrevive a la normalización.`,
    );
  }

  return {
    locale,
    translationKey: frontmatter.translationKey ?? slug,
    slug,
    href: `/blog/${slug}`,
    title: frontmatter.title,
    excerpt: frontmatter.excerpt,
    type: frontmatter.type,
    date: toIsoDay(frontmatter.date),
    updatedAt: frontmatter.updatedAt ? toIsoDay(frontmatter.updatedAt) : null,
    author,
    tags,
    tagLabels,
    image: frontmatter.image ?? null,
    imageAlt: frontmatter.imageAlt ?? null,
    draft: frontmatter.draft,
    wordCount,
    readMinutes,
  };
}

function readPostsFromDisk(locale: Locale): BlogPostData[] {
  const directory = blogContentDir(locale);

  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .sort()
    .map((fileName) =>
      parseBlogPost(
        fileName,
        fs.readFileSync(path.join(directory, fileName), "utf8"),
        locale,
      ),
    );
}

function readAllPostsFromDisk(): BlogPostData[] {
  const posts = routing.locales.flatMap(readPostsFromDisk);

  /* Más reciente primero; a igual fecha, el slug decide para que el orden sea estable. */
  return posts.sort(
    (postA, postB) =>
      Date.parse(postB.date) - Date.parse(postA.date) ||
      compareSlugs(postA.slug, postB.slug),
  );
}

let cachedPosts: BlogPostData[] | null = null;

/** Todos los posts del disco, de todos los idiomas, incluidos borradores y futuros. */
export function getAllBlogPosts(): BlogPostData[] {
  /*
    Memo solo en producción: en dev el loader se reevalúa a cada petición y
    cachear aquí obligaría a reiniciar el servidor para ver un post nuevo.
  */
  if (process.env.NODE_ENV === "production") {
    cachedPosts ??= readAllPostsFromDisk();

    return cachedPosts;
  }

  return readAllPostsFromDisk();
}

/**
 * Los posts de un idioma publicables en este entorno.
 *
 * `now` es inyectable para que el test pueda fijar el reloj sin tocar el sistema.
 */
export function getBlogPosts(
  locale: Locale,
  { now = new Date() }: { now?: Date } = {},
) {
  const posts = getAllBlogPosts().filter((post) => post.locale === locale);

  if (includesUnpublishedPosts()) return posts;

  const today = toIsoDay(now);

  return posts.filter((post) => !post.draft && post.date <= today);
}

export function getBlogPostBySlug(slug: string, locale: Locale) {
  return getBlogPosts(locale).find((post) => post.slug === slug);
}

/**
 * El mismo post en cada idioma en que está publicado, él incluido. Es lo que
 * alimenta el hreflang y el sitemap: un idioma sin traducción no aparece.
 */
export function getBlogPostTranslations(
  post: BlogPostData,
): Partial<Record<Locale, BlogPostData>> {
  return Object.fromEntries(
    routing.locales.flatMap((locale) => {
      const match = getBlogPosts(locale).find(
        (candidate) => candidate.translationKey === post.translationKey,
      );

      return match ? [[locale, match]] : [];
    }),
  );
}

/** Las rutas del post en cada idioma en que existe, para el hreflang y el sitemap. */
export function getBlogPostVersions(post: BlogPostData): LocalizedVersions {
  return Object.fromEntries(
    Object.entries(getBlogPostTranslations(post)).map(([locale, version]) => [
      locale,
      { pathname: "/blog/[slug]", params: { slug: version.slug } },
    ]),
  );
}

/** Índice de tags, por frecuencia y luego alfabético. */
export function getBlogTags(posts: BlogPostData[]): BlogTag[] {
  const index = new Map<string, BlogTag>();

  posts.forEach((post) => {
    post.tags.forEach((tag, position) => {
      const existing = index.get(tag);

      if (existing) {
        existing.count += 1;

        return;
      }

      index.set(tag, {
        tag,
        label: post.tagLabels[position] ?? tag,
        count: 1,
      });
    });
  });

  return [...index.values()].sort(
    (tagA, tagB) => tagB.count - tagA.count || compareSlugs(tagA.tag, tagB.tag),
  );
}

/* Genérico para conservar el tipo: con posts localizados devuelve posts localizados. */
export function getBlogPostsByTag<Post extends BlogPostData>(
  tag: string,
  posts: Post[],
): Post[] {
  const normalized = normalizeTag(tag);

  return posts.filter((post) => post.tags.includes(normalized));
}

/** La etiqueta como la escribió el autor, o el slug si el tag no existe. */
export function getBlogTagLabel(tag: string, posts: BlogPostData[]) {
  const normalized = normalizeTag(tag);

  return (
    getBlogTags(posts).find((entry) => entry.tag === normalized)?.label ??
    normalized
  );
}

/**
 * Distancia de edición. Solo la usa el test de tags casi duplicados.
 */
export function editDistance(left: string, right: string) {
  if (left === right) return 0;

  const columns = right.length + 1;
  let previous = Array.from({ length: columns }, (_, index) => index);

  for (let row = 1; row <= left.length; row += 1) {
    const current = new Array<number>(columns).fill(0);
    current[0] = row;

    for (let column = 1; column < columns; column += 1) {
      const substitution =
        (previous[column - 1] ?? 0) +
        (left[row - 1] === right[column - 1] ? 0 : 1);

      current[column] = Math.min(
        (previous[column] ?? 0) + 1,
        (current[column - 1] ?? 0) + 1,
        substitution,
      );
    }

    previous = current;
  }

  return previous[columns - 1] ?? 0;
}

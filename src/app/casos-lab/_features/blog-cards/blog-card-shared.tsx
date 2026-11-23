import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "~/lib/blog";
import { BlogCover } from "~/app/_components/blog-cover";

export type Reading = Pick<
  BlogPost,
  | "slug"
  | "title"
  | "excerpt"
  | "createdAtLabel"
  | "readTime"
  | "image"
  | "href"
>;

export const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark";
export const imageMotion =
  "transition-transform duration-500 ease-out group-hover:scale-[1.03] group-focus-within:scale-[1.03] motion-reduce:transform-none motion-reduce:transition-none";

export type CardProps = {
  article: Reading;
  getSampleAction?: (article: Reading) => (() => void) | undefined;
};

export function BlogHeadingText() {
  return (
    <>
      Últimos{" "}
      <span className="text-primary-light dark:text-primary-dark">
        artículos
      </span>
    </>
  );
}

export function Cover({ article }: { article: Reading }) {
  if (article.image)
    return (
      <Image
        src={article.image}
        alt=""
        width={900}
        height={600}
        className="h-full w-full object-cover"
      />
    );
  // Preserve the same image fallback as the production card.
  return <BlogCover slug={article.slug} />;
}

export function ReadingAction({ article, getSampleAction }: CardProps) {
  const className = `absolute inset-0 z-20 cursor-pointer rounded-[inherit] ${focus}`;
  const onSample = getSampleAction?.(article);
  if (onSample) {
    return (
      <button
        type="button"
        className={className}
        aria-label={`Ver muestra: ${article.title}`}
        onClick={onSample}
      />
    );
  }
  return (
    <Link
      href={article.href}
      className={className}
      aria-label={`Leer: ${article.title}`}
    />
  );
}

export function Meta({ article }: { article: Reading }) {
  return (
    <div className="font-body flex flex-wrap items-center gap-x-2 text-[11px] leading-5 text-slate-500 dark:text-slate-400">
      <span>{article.createdAtLabel}</span>
      <span aria-hidden="true" className="opacity-50">
        ·
      </span>
      <span>{article.readTime}</span>
    </div>
  );
}

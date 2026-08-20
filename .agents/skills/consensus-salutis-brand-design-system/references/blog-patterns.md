# Blog Patterns

> Source: `src/app/blog/page.tsx`, `src/app/blog/[slug]/page.tsx`,
> `src/app/_components/blog-article-card.tsx`, `blog-articles.ts`.

## Article data model

```ts
export type BlogArticle = {
  slug: string;
  createdAt: string;        // ISO "2026-02-11"
  createdAtLabel: string;   // "11 feb 2026" (es-ES short)
  readTime: string;         // "6 min de lectura"
  title: string;
  excerpt: string;          // 1 sentence, institutional tone
  imageLabel: string;
  imageSrc: string;
  href: string;             // "/blog/<slug>"
};
```

Slugs are kebab-case Spanish. Content is MDX under `src/app/blog/_articles/`.

## Blog article card

```tsx
<Link href={article.href} className="group block h-full">
  <article className="flex h-full flex-col overflow-hidden rounded-2xl border
    border-cyan-800/15 bg-white/80 shadow-big-blocks backdrop-blur-xs
    transition-all duration-150 hover:-translate-y-2 hover:border-primary-light/30
    dark:border-cyan-300/20 dark:bg-[#152230e6]/90
    dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]">
    {/* image: aspect-[1.6], border-b, bg-[#deedf3]/70 dark:bg-[#06111f],
        object-cover, group-hover:scale-105 duration-150 */}
    {/* body: p-5 pt-4 (xl:p-6) flex-1 flex-col */}
    {/*   h2: font-display line-clamp-2 text-base text-[#05215e] dark:text-slate-100 */}
    {/*   excerpt: mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 */}
    {/*   meta row: mt-auto pt-4.5 — Calendar + date, Clock + readTime,
          text-xs font-medium text-slate-500, icons size-3.5 strokeWidth 1.8 */}
  </article>
</Link>
```

Whole card is the link; hover = lift `-translate-y-2` + accent border + image
zoom. Meta pinned to the bottom with `mt-auto` for equal-height grids.

## Blog index page

- Shell: `PageShell` (header + VerticalFooter), main `bg-[#fbfdff]
  dark:bg-[#06111f]` with `HomeMotionBackground`, fixed `SignalField
  intensity="hero" opacity={0.72}` and `ProductSignalLeft` blob (same recipe
  as home hero).
- Content: `pt-32 lg:pt-36` (clears fixed header), `max-w-7xl`. Header block:
  Eyebrow "Lecturas clínicas" → H1 "Nuestro blog" (`text-5xl sm:text-6xl
  font-extrabold`) → lede `max-w-3xl text-lg leading-8`.
- Grid: `mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3
  xl:grid-cols-4`.
- Pagination: 12 per page via `?page=` search param; round `size-10` buttons
  (spec in `ui-components.md`), centered `mt-12`.

## Article page

- Same shell/background layers as the index; content column `max-w-4xl`.
- "Volver" pill (primary button with `ArrowLeft`) above the header.
- Header: Eyebrow "Lecturas clínicas" → H1 `text-4xl sm:text-5xl lg:text-6xl
  font-extrabold max-w-3xl` → excerpt as lede → meta row (Calendar/Clock,
  `size-4`, `text-sm font-medium text-slate-500 dark:text-slate-400`).
- Hero image: `mt-12 rounded-2xl border border-cyan-800/15 bg-white/70
  shadow-big-blocks overflow-hidden`, image `aspect-16/7 object-cover`.
- Body: `mt-10 rounded-2xl px-5 sm:px-8 backdrop-blur-xs` wrapper +
  `articleBodyClassName` MDX typography (full recipe in `typography.md`).
- Home "Lecturas clínicas" section shows the latest 4 (`lg:grid-cols-3
  xl:grid-cols-4`, 4th card hidden between lg and xl) with a "Ver todos" pill.

## Editorial tone

Titles are declarative Spanish sentences, sentence case, may end with a period
("Cómo medir la fiabilidad de una respuesta clínica."). Excerpts are one dense,
sober sentence — evidence/governance vocabulary, no hype.

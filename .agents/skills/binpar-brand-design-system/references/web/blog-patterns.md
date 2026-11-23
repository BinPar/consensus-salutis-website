# Blog Patterns

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Source: `src/lib/blog.ts`, `src/content/blog/*.mdx`, `src/content/blog/authors.ts`,
> `src/app/blog/page.tsx`, `src/app/blog/tag/[tag]/page.tsx`,
> `src/app/blog/[slug]/page.tsx`, `src/app/blog/[slug]/opengraph-image.tsx`,
> `src/app/_components/blog-index.tsx`, `blog-article-card.tsx`, `blog-cover.tsx`,
> `src/lib/blog-cover.ts`, `src/app/sitemap.ts`, `robots.ts`,
> `src/app/blog/rss.xml/route.ts`, `src/app/_components/home-blog.css`
> (website HEAD `70613ae`).

## Content engine

One `.mdx` file in `src/content/blog/` **is** a post — the filename is the slug,
and nothing else needs touching to publish. Frontmatter is parsed by
`gray-matter` and validated by a `.strict()` Zod schema in `src/lib/blog.ts`;
invalid frontmatter throws at build and in `pnpm test`, so a bad post fails
loudly instead of publishing wrong.

```yaml
---
title: "Cómo medir la fiabilidad de una respuesta clínica"   # no trailing period (brand voice)
excerpt: "Criterios de evaluación, preguntas de control y revisión experta para sostener confianza institucional."
date: 2026-02-11          # YYYY-MM-DD, unquoted
updatedAt: 2026-03-02     # optional, never earlier than date
author: equipo-consensus-salutis   # id from authors.ts; displays "Equipo BinPar"
type: mecanismo           # marco | mecanismo | sector | evidencia | nota-de-producto
tags: ["Evaluación", "Trazabilidad", "Gobierno del conocimiento"]
image: /blog/portada.webp # optional, absolute path in public/
imageAlt: "…"             # REQUIRED when image is present
readTime: 6               # optional override, in minutes (not the label)
draft: false
---
```

Everything derivable is derived by the loader, never written by hand: `slug`,
`href` (`/blog/<slug>`), `createdAtLabel` / `updatedAtLabel` (`"11 feb 2026"`,
es-ES short, formatted in **UTC** so a negative timezone can't subtract a day),
`wordCount`, `readMinutes` (210 wpm, floor 1) and `readTime`
(`"6 min de lectura"`). `tags` are kept twice: `tags` normalized to slugs (the
`/blog/tag/<tag>` keys — «IA», «ia» and «I.A.» collapse) and `tagLabels` exactly
as the author wrote them, which is what gets painted.

Authors are a registry, not free text: `src/content/blog/authors.ts` maps an id
to `{ name, role }`. No photo — the byline is text. Ids are stable keys: the
team author kept the id `equipo-consensus-salutis` after the rename; only its
display name changed to "Equipo BinPar" (role "Producto y evidencia clínica").
Never rename an id to match a brand change.

Drafts and future dates show in dev and preview, never in production
(`includesUnpublishedPosts()`, `VERCEL_ENV` wins over `NODE_ENV`). Order is
newest first, slug as tie-breaker.

## Cover chain

Three links, in order: `image` from frontmatter → `BlogCover` → nothing else.
There is no filler image and no per-post design work.

`BlogCover` (`blog-cover.tsx`) draws the brand signal-field as inline SVG,
1600×700 (16:7), `preserveAspectRatio="xMidYMid slice"`; the card crops it to
1.6. Geometry is pure and deterministic per slug — `src/lib/blog-cover.ts`
hashes the slug (FNV-1a) into a mulberry32 PRNG, so the same post always paints
the same cover and two posts never share one. No `Math.random()`, no `useId()`.
Palette: teal `rgb(8 145 178)` → aqua `rgb(20 184 166)` → lime
`rgb(246 255 83)`, stroke on `currentColor` (`text-primary-light
dark:text-primary-dark`), ground `#cfe6ee→#eef7fa` light / `#06111f→#0a1a2b`
dark. Gradient ids are derived from the seed so two covers on one page don't
clobber each other's `defs`, and linear gradients use
`gradientUnits="userSpaceOnUse"`.

**Deliberately unanimated** — it shares the frame with the animated `SignalField`
background and with four cards at once on the home; two competing morph layers
don't read.

## Open Graph image

`src/app/blog/[slug]/opengraph-image.tsx` generates 1200×630 for every post,
always, from the title and the brand — independent of `image`. Deep navy
`#06111f`, two radial turquoise/teal glows, two signal curves in `#00BCBB`,
eyebrow "Lecturas clínicas" with a turquoise dot, title in three size steps
(72 / 62 / 52 by length), footer rule with `autor · fecha` (fallback
"consensussalutis.com", the domain) and the text signature "BinPar" (Sora 800,
26px, `#f8fafc` — text, not the logo graphic). `alt = "BinPar · Lecturas
clínicas"`. Sora arrives as committed `.ttf` bytes from `src/app/_fonts/`
(ExtraBold 800 + SemiBold 600) read with `node:fs` — `next/og` knows nothing
about `next/font/google`, and `next.config.js` keeps the files in the function
bundle via `outputFileTracingIncludes`.

## Blog article card

```tsx
<Link href={article.href} className="group block h-full">
  <article className="flex h-full flex-col overflow-hidden rounded-2xl border
    border-cyan-800/15 bg-white/80 shadow-big-blocks backdrop-blur-xs
    transition-all duration-150 hover:-translate-y-2 hover:border-primary-light/30
    dark:border-cyan-300/20 dark:bg-[#152230e6]/90
    dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]">
    {/* cover: aspect-[1.6], border-b, bg-[#deedf3]/70 dark:bg-[#06111f];
        <Image object-cover> when post.image, else <BlogCover slug>;
        group-hover:scale-105 duration-150 */}
    {/* body: p-5 pt-4.5! xl:p-6 (compact: p-5 pt-4) flex-1 flex-col */}
    {/*   h2: font-display line-clamp-2 text-base text-[#05215e] dark:text-slate-100 */}
    {/*   excerpt: mt-3 line-clamp-3 text-sm text-slate-600 dark:text-slate-400 */}
    {/*   meta row: mt-auto pt-4.5 — Calendar + createdAtLabel, Clock + readTime,
          text-xs font-medium text-slate-500, icons size-3.5 strokeWidth 1.8 */}
  </article>
</Link>
```

Whole card is the link; hover = lift `-translate-y-2` + accent border + cover
zoom. Meta pinned to the bottom with `mt-auto` for equal-height grids. `compact`
tightens the padding for the horizontal rail.

## Shared index pieces

`/blog` and `/blog/tag/<tag>` are the same index with a different filter, so
everything shared lives in `src/app/_components/blog-index.tsx`:

- `BlogIndexShell` — `main bg-[#fbfdff] dark:bg-[#06111f]` + `HomeMotionBackground`,
  fixed `SignalField intensity="hero" opacity={0.72}` and `ProductSignalLeft`
  blob (same recipe as the home hero); content `px-5 sm:px-8 pt-32 lg:pt-36
  pb-20 lg:pb-24`, `max-w-7xl`.
- `BlogGrid` — `mt-14 grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3
  xl:grid-cols-4`.
- `BlogTagFilter` — `mt-10 flex flex-wrap gap-2` pills, `h-8 rounded-full px-4
  text-xs font-semibold`. First entry is always "Todos" → `/blog`; the rest come
  in loader order (most used first). Active pill = filled
  `bg-primary-light dark:bg-primary-dark` + `aria-current="page"`; the rest are
  glass. `nav aria-label="Filtro por etiqueta"`.
- `BlogEmptyState` — glass panel, `mt-14 rounded-2xl px-6 py-14 text-center`;
  sober and unapologetic (the engine ships before the content), with a primary
  pill to `/contacto`.
- `BlogPagination` — `BLOG_POSTS_PER_PAGE = 12`, `?page=`; round `size-10`
  buttons (spec in `ui-components.md`), centered `mt-12`, `nav aria-label=
  "Paginación del blog"`, disabled arrows `pointer-events-none opacity-45`.

Index header block: Eyebrow "Lecturas clínicas" → H1 "Nuestro blog"
(`text-5xl sm:text-6xl font-extrabold`) → lede `max-w-3xl text-lg leading-8`.

Tag pages: H1 is the tag label (`text-4xl sm:text-5xl`), lede is the count
("Un artículo con esta etiqueta." / "N artículos con esta etiqueta."), no
pagination (they're subsets, and it keeps `generateStaticParams` fully
prerenderable). An unknown tag is a 404, not an empty grid.

## Article page

- Same shell/background layers as the index; content column `max-w-4xl`, inner
  blocks `px-5 sm:px-8`.
- "Volver" pill (primary button with `ArrowLeft`) above the header.
- Header: Eyebrow "Lecturas clínicas" → H1 `text-4xl sm:text-5xl lg:text-6xl
  font-extrabold max-w-3xl` → excerpt as lede → byline
  (`mt-7 text-sm`, name `font-semibold text-[#05215e]` + `" · "` + role in
  `text-slate-500`) → meta row (Calendar/Clock `size-4`, `text-sm font-medium
  text-slate-500`, plus "Actualizado el …" when `updatedAtLabel`) → tag pills
  linking to `/blog/tag/<tag>` (`nav aria-label="Etiquetas del artículo"`).
- Hero frame: `mt-12 rounded-2xl border border-cyan-800/15 bg-white/70
  shadow-big-blocks overflow-hidden`, `aspect-16/7` — `<Image priority
  object-cover>` with `imageAlt`, or `BlogCover` when there's no image.
- Body: `mt-10 rounded-2xl px-5 sm:px-8 backdrop-blur-xs` wrapper +
  `articleBodyClassName` MDX typography (full recipe in `typography-classes.md`). The
  body component is a templated dynamic import of
  `src/content/blog/<slug>.mdx`, so publishing stays "add a file".
- Metadata: title/description from frontmatter, canonical `absoluteUrl(href)`,
  `openGraph type: "article"` with `publishedTime` / `modifiedTime` (image comes
  from `opengraph-image.tsx`), plus inline `schema.org/Article` JSON-LD that
  points at the OG image — it always exists and has the shape validators want.
  Publisher: `{ "@type": "Organization", name: "BinPar", url, logo:
  absoluteUrl("/favicon.svg") }` (the bare isotipo); author is a `Person` with
  `name` + `jobTitle` from the registry.
- Home "Lecturas clínicas" section (`HOME_POSTS = 4`, `#lecturas`, rendered
  only when posts exist): Eyebrow → H2 "Últimos artículos" `text-5xl
  font-extrabold` → lede → "Ver todos" pill with `ArrowRight`; grid `mt-8 gap-4
  lg:grid-cols-3 xl:grid-cols-4`, 4th card hidden between lg and xl, cards
  staggered 0.12s and reduced-motion safe. Surface `.home-blog-surface`: white
  that fades to transparent over the last 128px (96px below 640px), so the
  section dissolves into the contact area; transparent in dark.

## Discoverability

- `src/app/sitemap.ts` — the **whole site**: public routes listed by hand with
  priorities (the filesystem can't tell a public page from a session-gated one),
  plus every post (`lastModified` = `updatedAt ?? date`, priority 0.7) and every
  tag page (0.5). `PRIVATE_PATH_PREFIXES` (incl. the `/casos-lab` lab route)
  stays out; deleted routes (`/casos`, `/evidencia`, `/seguridad`) were
  removed from the list.
- `src/app/robots.ts` — serves the sitemap and disallows the private prefixes;
  outside production it disallows everything, so a preview with drafts and
  future posts can't get indexed.
- `src/app/blog/rss.xml/route.ts` — hand-built RSS 2.0 from the loader, so the
  feed inherits the draft/future filter. `dc:creator` for the byline (RSS 2.0
  `<author>` demands an email), tags as `<category>`, `s-maxage=3600`. Channel
  title "BinPar · Lecturas clínicas". Linked from `layout.tsx` via
  `alternates.types["application/rss+xml"]`.

## Editorial tone

Titles are declarative Spanish sentences in sentence case, with no trailing
period. The seed post's title ("Cómo medir la fiabilidad de una respuesta
clínica.") and the site's display headings end with one: an observed exception
on the site, known debt in `binpar-brand-voice` (L1), not a model.
Excerpts are one dense, sober sentence with its full stop — evidence/governance
vocabulary, no hype. Tags are written as prose labels ("Gobierno del
conocimiento"), and the slug is derived. `type` classifies the piece, it isn't
shown as a badge. Wording rules live in the brand voice skill.

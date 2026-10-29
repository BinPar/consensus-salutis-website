# Typography

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Sources: production setup in `src/app/layout.tsx` and `src/styles/globals.css`
> (unchanged by the BinPar rebrand), plus `home-cover.css`,
> `clinical-process-player.tsx`, `product-strata/product-strata-scene.tsx`,
> `platform-walkthrough.tsx`, `volume-section.css`,
> `contact-assistant/contact-assistant.css`, `section-navigation.css`,
> `footer-design.css`; legacy: the Consensus Salutis brand manual.

## Typefaces

| Family | Role | Weights used | Token |
|--------|------|--------------|-------|
| **Sora** | Display: headings, eyebrows, step numbers, card titles | 600 (semibold), 700 (bold), 800 (extrabold) | `.font-display` / `--font-sora` |
| **Plus Jakarta Sans** | Body: paragraphs, buttons, links, forms, nav, meta | 400, 500 (medium), 600 (semibold) | `.font-body`, default `--font-sans` |

**The BinPar wordmark is not a font.** It is outlined paths (square tittle on
the `i`, double-storey `a`), so the face is unverified: don't assume it is
Sora or Plus Jakarta Sans. Never typeset "BinPar" as a logo; place the SVG
(`../logo.md`). Where the name
appears as text inside UI (eyebrow "BinPar", app-header label next to the
isotipo, map label), it is set in the surrounding UI face.

**Legacy**: the Consensus Salutis manual set the logotype and brand headlines
in Plus Jakarta Sans ExtraBold. That rule is unconfirmed for BinPar: default to
Sora display + PJS body everywhere (web, product, print, social) until a BinPar
brand source says otherwise.

Both fonts are loaded via `next/font/google` (SIL OFL, no local files needed):

```tsx
import { Plus_Jakarta_Sans, Sora } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

// <body className={`${plusJakartaSans.variable} ${sora.variable} font-sans antialiased`}>
```

`--font-sans` (body default) resolves to Plus Jakarta Sans, so unstyled text is
already on-brand; `.font-display` opts into Sora.

## Hierarchy

| Level | Classes | Notes |
|-------|---------|-------|
| Eyebrow | `font-display text-xs font-bold tracking-[0.22em] uppercase text-primary-light dark:text-primary-dark` | Above every H1/H2, except the cover (it uses the app-icon tile instead) and centered two-line accent display headings: `/plataforma` H1, strata H2 |
| Cover H1 (home) | `font-display font-extrabold tracking-tight`, 54px / 48px ≤1023px / 36px ≤767px, `line-height: 1.12`, `#05215e` / `#f8fafc`; accent `<span>` block 40px, `line-height: 1`, `margin-top: 16px` | "BinPar" + "Respuestas clínicas trazables." (`home-cover.css:25-36,96-108`) |
| Hero H1 (legacy horizontal home) | `font-display text-6xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50` | Mobile: `text-4xl sm:text-5xl` |
| Hero section H2 (vertical home) | `font-display mt-5 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl` | Same colors; the hero became a section after the cover |
| Two-line display (accent 2nd line) | `font-display text-[32px] sm:text-[40px] lg:text-[54px] leading-[1.08] font-extrabold tracking-tight text-[#05215e] dark:text-slate-50` + `<br/><span class="text-primary-light dark:text-primary-dark">` | `/plataforma` H1 (`platform-walkthrough.tsx`); strata H2 `text-4xl sm:text-5xl lg:text-[54px] leading-[1.08]`; cases H2 |
| Stage H3 | `font-display mt-3.5 max-w-xl text-4xl font-extrabold tracking-tight text-[#05215e] sm:mt-6 sm:text-5xl dark:text-slate-50` | Process player (`clinical-process-player.tsx:30-31`) |
| Stage counter / signal | eyebrow recipe: "01 / 05" above the H3, signal label below | `text-xs font-bold tracking-[0.22em] uppercase` accent |
| Page H1 | `font-display text-4xl sm:text-5xl font-extrabold tracking-tight` (blog index: `text-5xl sm:text-6xl`) | Same colors as hero |
| Section H2 | `font-display text-5xl font-extrabold tracking-tight` (desktop panels) / `text-3xl sm:text-4xl` (mobile/compact) | Constrain with `max-w-*` per content |
| Card / sub H3 | `font-display text-base`–`text-lg font-semibold text-[#05215e] dark:text-slate-100` | |
| Lede paragraph | `font-body text-lg leading-8 text-slate-600 dark:text-slate-400` (hero: `text-xl leading-9 text-slate-700 dark:text-slate-300`) | `max-w-2xl`–`max-w-5xl` |
| Body | `font-body text-base leading-7 text-slate-700 dark:text-slate-300` | |
| Card body | `font-body text-sm leading-6 text-slate-600 dark:text-slate-400` | |
| Micro-label / signal | `font-body text-[10px] font-semibold tracking-[0.12em] uppercase text-primary-light dark:text-primary-dark` | Pillar roles (`text-xs tracking-[0.13em]`–`[0.18em]`) |
| Micro-label (display) | `font-display text-[10px] font-semibold uppercase tracking-[.19em]` accent ("Capa 01 / 03"); `text-[10px] font-bold tracking-[0.22em]` (chat-mock / replica welcome eyebrow) | Strata, product replica |
| Band H2 (contrast band) | Sora 800, 48px / 40px ≤1100px / 30px ≤767px, `letter-spacing: -0.045em`, `line-height: 1.16`; figures 38px 700 `-0.04em` `tabular-nums` | `volume-section.css` |
| Assistant heading | Sora 700, 32px, `line-height: 1.25`, `letter-spacing: -0.035em`; dialogue PJS 18px/30px | `contact-assistant.css` |
| Section index link | 13px 600 (current 700), right-aligned | `section-navigation.css` |
| Footer (contrast) | eyebrow Sora 9px 700 `0.16em` uppercase; links 12px/20px; legal 10px/18px | `footer-design.css` |
| Meta (dates, read time) | `text-xs font-medium text-slate-500 dark:text-slate-400` | With lucide icons `size-3.5 strokeWidth={1.8}` |
| Footer band link (legacy horizontal home) | `text-[9px] font-semibold tracking-[0.16em] uppercase` | |

## Rules

- Headings: always `font-display` + `font-extrabold` (page/section) or
  `font-semibold` (card level) + `tracking-tight`. Heading color is `#05215e`
  light / `slate-50`–`slate-100` dark — never pure black.
- Eyebrows and micro-labels: always UPPERCASE with wide tracking
  (`0.12em`–`0.22em`) in the primary accent color.
- Body copy: always `font-body`; never use Sora for paragraphs.
- Buttons/links: `font-body font-semibold text-sm` (never uppercase — unlike
  eyebrows, CTAs use sentence case: "Solicitar reunión", "Ver todos").
- Numbers that need emphasis (metric values, step numbers) use `font-display`.
- Line height is generous: `leading-7`/`leading-8`/`leading-9` for reading text.
- Two-line display headings put the second line in the accent
  (`text-primary-light dark:text-primary-dark`). Punctuation of headings is a
  voice decision (`binpar-brand-voice`), not a type rule.
- Language is Spanish; keep copy institutional, sober and precise ("IA médica
  institucional", "trazable", "fuentes verificables"). Wording rules live in
  the `binpar-brand-voice` skill.
- The brand name in text is always "BinPar"; eyebrows show it uppercase via
  CSS only.

## Article (MDX) typography

Blog article bodies use this exact class recipe on the wrapper
(`src/app/blog/[slug]/page.tsx`):

```ts
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
```

Highlights: justified paragraphs at 26px line height, H4 in the accent color,
blockquotes as teal-tinted callout cards with a thick left border, links in the
accent with `underline-offset-4`, `strong` in heading navy.

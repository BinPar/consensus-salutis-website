# UI Components

> Source: `src/app/_components/` (site.tsx, site-header.tsx, site-footer.tsx,
> footer-band-menu.tsx, mobile-navigation.tsx, contact-form.tsx,
> clinical-chat-mock.tsx, blog pages). Class strings below are the production
> recipes — reuse them verbatim where possible.

## Buttons

### Primary filled (teal/turquoise) — in-page CTAs

```
rounded-full bg-primary-light px-5 py-2 min-h-10 text-center text-sm font-semibold
text-white shadow-md transition hover:bg-cyan-800
dark:bg-primary-dark dark:text-[#04111e]
dark:shadow-[0_0_34px_rgba(45,212,191,0.26)] dark:hover:bg-primary-dark-lighter
```

Variant with icon + lift (blog "Ver todos", "Volver"): `inline-flex h-10 items-center
gap-2 rounded-full bg-primary-light px-6 text-sm font-semibold text-white
shadow-big-blocks transition-all duration-150 hover:-translate-y-0.5
hover:bg-[#087a85] dark:bg-primary-dark dark:text-[#03111d]
dark:shadow-[0_0_24px_rgba(0,188,187,0.18)] dark:hover:bg-primary-dark-lighter`
with lucide `ArrowRight`/`ArrowLeft` at `size-4`, `strokeWidth={1.8}`.

### Secondary / ghost

```
rounded-full border border-primary-light/25 bg-white/65 px-5 py-2 min-h-10
text-center text-sm font-semibold text-cyan-800 backdrop-blur-sm transition
hover:border-primary-light/45 hover:bg-cyan-50
dark:border-cyan-300/30 dark:bg-white/3 dark:text-cyan-50
dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10
```

### Yellow contrast CTA ("Solicitar reunión" in the header)

```
rounded-full bg-secondary-light px-3 py-2 text-xs lg:text-sm font-semibold
text-[#06111f] transition-transform hover:scale-102
focus-visible:outline-2 focus-visible:outline-offset-2
focus-visible:outline-secondary-dark motion-reduce:transform-none
dark:bg-secondary-dark
```

Yellow is the brand's **contrast color**. On the website it appears in the
header and mobile-nav CTA, but this recipe applies to any element that must
stand out above the teal story (key CTAs, highlighted badges/states). Keep it
scarce so it keeps its emphasis. Text on yellow is always near-black navy
`#06111f`, both themes.

### Small tertiary (form "Enviar otro mensaje")

`rounded-md border border-cyan-800/20 bg-primary-light/10 px-4 py-2 text-sm
font-semibold text-cyan-800 hover:bg-primary-light/18` (+ dark equivalents).

### CTAGroup pattern

Hero CTAs come in pairs: primary filled ("Solicitar reunión" → `/contacto`) +
ghost ("Probar plataforma" → `/plataforma`), stacked `flex-col gap-3 sm:flex-row`.

## Cards

### Glass card (metrics, success cases, blog)

```
rounded-2xl border border-cyan-800/15 bg-white/80 shadow-big-blocks backdrop-blur-xs
dark:border-cyan-300/20 dark:bg-[#152230e6]/90
dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]
```

- Metric card: `p-3 sm:p-6`; value `font-display text-xl sm:text-3xl font-semibold
  text-cyan-800 dark:text-primary-dark-lighter`; label `text-xs sm:text-sm
  text-slate-600 dark:text-slate-400`.
- Blog card: see `blog-patterns.md`.
- Hover (interactive cards): `transition-all duration-150 hover:-translate-y-2
  hover:border-primary-light/30`.

### Deep panel (chat mock, contact form)

`rounded-3xl border border-cyan-800/20 bg-white/80–90 shadow-big-blocks
backdrop-blur-xs dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl
dark:shadow-cyan-950/30`.

### Capability card

`rounded-md border border-cyan-800/10 bg-white/80 p-6 shadow-lg shadow-slate-900/5
dark:border-cyan-300/10 dark:bg-[#081a2b]/82` — title `font-display text-lg
font-semibold text-[#05215e] dark:text-slate-50`, body `mt-3 text-sm leading-6`.

## Header

- `ScrollHeaderFrame`: `fixed top-0 z-40 w-full px-5 sm:px-8 backdrop-blur-md`
  + `.header-scroll-backdrop` (bg opacity ∝ scroll over 96px).
- Inner bar: `mx-auto flex h-16 w-full max-w-425 items-center justify-between`.
- Nav links: `font-body text-xs lg:text-sm font-medium text-slate-600
  hover:text-cyan-800 dark:text-slate-400 dark:hover:text-cyan-100`, gap
  `lg:gap-7`, hidden below `md`.
- Right cluster: `ThemeToggle` + yellow CTA + `MobileNavigation` burger.

## Theme toggle button

`grid size-9 place-items-center rounded-full border border-primary-light/20
bg-white/30 text-slate-700 hover:border-primary-light/40 hover:bg-cyan-50
hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-primary-dark/8
dark:text-primary-dark-lighter dark:hover:bg-cyan-300/15` — moon icon in light,
sun in dark. See `light-dark-mode.md` for behavior.

## Mobile navigation

- Trigger: same `size-9` round glass button, three animated 1px lines
  (rotate ±45°, 0.14s) forming an X.
- Panel: `fixed inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] bg-[#f4f9fc]
  dark:bg-[#06111f]`, slides from left (`x: -100%`, 0.18s easeInOut). Links are
  bordered rows (`border-b border-cyan-800/12 py-3 text-sm font-semibold`);
  active link in accent + `h-px w-8` underline bar. Yellow CTA pinned at bottom
  (`mt-auto`). Locks body scroll, closes on Escape/route change/desktop resize.

## Footers

Two footers exist:

1. **VerticalFooter** (subpages + vertical home): band `border-t
   border-cyan-800/10 bg-[#e8f2f7] dark:bg-[#030916]`, `max-w-7xl` grid
   `md:grid-cols-[1.25fr_0.75fr]`: logo + tagline left; "Producto" /
   "Contacto" / "Legal" link columns right (`font-display font-semibold`
   headings, `font-body` links with cyan hover). Bottom strip: BinPar logo +
   "Una iniciativa tecnológica de binpar…" + copyright, `text-xs`.
2. **HomeFooterBand** (horizontal home only): slim `min-h-12` bar,
   `bg-[#edf6f9]/92 dark:bg-[#030b17]/92 backdrop-blur-md`, uppercase 9px
   copyright link + `FooterBandMenu` dropdowns ("Producto", "Contacto") that
   open UPWARD: `details` element, panel `rounded-xl border bg-white/98 p-1.5
   shadow-2xl backdrop-blur-xl dark:bg-[#05111f]/98`, items `rounded-lg px-3
   py-2 text-sm hover:bg-primary-light/10`, `+` marker rotates 45° when open.

## Forms (contact form)

Field recipe:

```
font-body w-full rounded-lg border border-cyan-800/15 bg-white/60 px-4 py-3
text-sm text-slate-900 outline-none transition placeholder:text-slate-500
focus:border-primary-light/55 focus:bg-white focus:ring-2 focus:ring-primary-light/10
disabled:cursor-not-allowed disabled:opacity-60
dark:border-cyan-300/10 dark:bg-[#04111e]/68 dark:text-slate-100
dark:focus:border-cyan-300/55 dark:focus:bg-[#061a2a] dark:focus:ring-cyan-300/10
```

- Labels: `mb-2 block font-body text-sm font-medium text-slate-900
  dark:text-slate-100` with `*` marker.
- Errors: `text-xs text-rose-700 dark:text-rose-300` under the field; general
  message in `aria-live="polite"` region.
- Checkbox: `size-4 accent-primary-light dark:accent-cyan-300`; privacy link
  `text-primary-light underline underline-offset-4 dark:text-secondary-dark`.
- Submit: full-width primary pill; busy state `disabled:cursor-wait
  disabled:opacity-60` + "Enviando...".
- Anti-spam: honeypot field visually hidden + Cloudflare Turnstile
  (`interaction-only`, executed on submit). Success state swaps the whole form
  for a status panel (uppercase accent label + `font-display` heading + body).
- Panel: `rounded-3xl … space-y-5 p-7` (compact: `space-y-3 p-5`).

## Pagination (blog)

Round `size-10` buttons: active = `border-primary-light bg-primary-light
text-white shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark
dark:text-[#03111d]`; inactive = glass (`border-primary-light/60 bg-white/80
text-slate-600 hover:text-cyan-800`); disabled arrows = `opacity-45
pointer-events-none`. Chevron icons `size-4 strokeWidth={1.8}`.

## Clinical chat mock (hero product demo)

Self-running, non-interactive (`pointer-events-none select-none`) chat demo in a
`rounded-3xl` deep panel, `h-110` (compact `h-87.5`):

- **Header bar** (`h-14 border-b bg-white/40 dark:bg-white/3`): brand logo left;
  right status `Entorno seguro` — `text-[10px] font-medium text-teal-700
  dark:text-teal-200` with a pulsing dot `size-1.5 rounded-full bg-teal-300
  shadow-[0_0_10px_rgba(94,234,212,0.7)]`.
- **User bubble**: right-aligned `ml-auto max-w-[88%] rounded-xl rounded-br-sm
  border border-slate-300/80 bg-white/50 dark:border-slate-600/30
  dark:bg-slate-700/35`.
- **Assistant answer**: isotipo avatar `size-6` + uppercase accent kicker
  ("Orientación basada en evidencia") + typed text with a blinking caret
  (`h-3 w-px animate-pulse bg-primary-light`).
- **Processing state**: three pulsing dots (`size-1.5`, staggered 160ms) +
  rotating status text ("Consultando guías", "Contrastando conocimiento
  validado", "Preparando respuesta"), in the accent color.
- **References**: numbered chips `rounded-md border bg-primary-light/5 px-3
  py-2.5`, number badge `size-6 rounded-sm bg-primary-light/10`, trailing "Ver"
  link, staggered in (0.12s).
- **Input bar**: `rounded-2xl border min-h-14` pill that "types" the question;
  idle placeholder "Consulta información clínica..." on `bg-slate-100/70`;
  composing switches to white/`#061a2a` with accent caret and `↗` send glyph.
- Sequence: question types (19ms/char) → 3 processing states (850ms each) →
  answer types (26ms/char) → follow-up → references → 4s hold → fade reset.
  With `prefers-reduced-motion`: everything rendered complete, no animation.

## Icons

Lucide React throughout (`ArrowRight`, `ArrowLeft`, `Calendar`, `Clock`,
`ChevronLeft/Right`), consistently `strokeWidth={1.8}`, sizes `size-3.5`–`size-4`,
always `aria-hidden="true"`. Custom SVGs (sun/moon, send) follow the same stroke
style. No filled icon sets.

## Numbered process milestones

Step node: `grid size-10 place-items-center rounded-full border
border-primary-light bg-white/80 font-display text-xs font-semibold text-cyan-800
shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f]
dark:text-primary-dark-lighter dark:shadow-[0_0_18px_rgba(103,232,249,0.18)]`
(compact `size-8 text-[10px]`). Connected by animated 1px accent lines
(horizontal `scaleX` on desktop grid, vertical `scaleY` on mobile timeline over a
static `bg-cyan-600/15` track). Each milestone: node → `font-display` title →
`text-sm` body → uppercase micro-signal in accent.

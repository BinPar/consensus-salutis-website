# UI Components

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Source: `src/app/_components/` (site.tsx, site-header.tsx,
> scroll-header-frame.tsx, mobile-navigation.tsx, contrast-footer.tsx +
> footer-design.css, site-footer.tsx, footer-band-menu.tsx, home-cover.tsx +
> home-cover.css, section-navigation.tsx + .css, side-linkedin-link.tsx,
> contact-assistant/*, clinical-chat-mock.tsx, clinical-process-player.tsx,
> clinical-process-visuals.tsx, platform-walkthrough.tsx, blog pages; legacy
> contact-form.tsx), website HEAD `70613ae`. Class strings below are the
> production recipes — reuse them verbatim where possible.

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

Yellow is the manual's accent: one element per composition, reserved for the
decisive action (here, the header CTA). Never repeat it on the same screen.
Text on yellow is always near-black navy `#06111f`, both themes.

### Small tertiary (form "Enviar otro mensaje")

`rounded-md border border-cyan-800/20 bg-primary-light/10 px-4 py-2 text-sm
font-semibold text-cyan-800 hover:bg-primary-light/18` (+ dark equivalents).

### CTAGroup pattern

Hero CTAs come in pairs: primary filled ("Solicitar reunión" → `/contacto`) +
ghost ("Probar plataforma" → `/plataforma`), stacked `flex-col gap-3 sm:flex-row`.

### Cover CTA (single exploratory action)

The home cover has ONE action, "Descubrir la plataforma", that scrolls to the
first section (`home-cover.css:42-69`):

```css
display: inline-flex; align-items: center; gap: 24px; padding: 13px 22px;
border: 1px solid transparent; border-radius: 40px;
background: var(--cover-accent); /* #006d79 / #00bcbb */
color: white; /* dark: #06111f */
font-size: 14px; font-weight: 600; transition: background 0.2s;
/* hover: #155e75 (light) / #71fffe (dark); focus-visible: 2px accent outline, offset 5px */
```

Icon: lucide `ArrowUpRight` `size={17} strokeWidth={1.5}` (the one exception to
the 1.8 stroke).

### Closing CTA (subpages)

"Solicitar una demostración" (`platform-walkthrough.tsx`): primary pill
`inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm
font-semibold shadow-md` + `ArrowRight size={17} strokeWidth={1.8}`, after an
eyebrow ("Siguiente paso") + H2 + one-line lede.

## Cards

### Glass card (blog; legacy metric and logo cards)

```
rounded-2xl border border-cyan-800/15 bg-white/80 shadow-big-blocks backdrop-blur-xs
dark:border-cyan-300/20 dark:bg-[#152230e6]/90
dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]
```

- Metric card (**legacy**, horizontal home): `p-3 sm:p-6`; value `font-display
  text-xl sm:text-3xl font-semibold text-cyan-800 dark:text-primary-dark-lighter`;
  label `text-xs sm:text-sm text-slate-600 dark:text-slate-400`. Current KPI
  figures live in the contrast band (`landing-patterns.md` → Volume band).
- Blog card: see `blog-patterns.md`.
- Hover (interactive cards): `transition-all duration-150 hover:-translate-y-2
  hover:border-primary-light/30`.

### Stage frame (chat mock, process player)

`shadow-big-blocks rounded-3xl border border-cyan-800/15 bg-white/80
backdrop-blur-sm dark:border-cyan-300/15 dark:bg-[#06111f]` + internal 44px grid.
Dark fill is opaque page navy, not translucent glass.

### Deep panel (legacy contact form)

`rounded-3xl border border-cyan-800/20 bg-white/80–90 shadow-big-blocks
backdrop-blur-xs dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl
dark:shadow-cyan-950/30`.

### Scene / callout card

Process cards `rounded-2xl border bg-white/95
shadow-[0_8px_24px_rgba(0,109,121,0.05)] dark:bg-[#152230]/95`; map case
callouts `rounded-xl bg-white/95 shadow-[0_8px_24px_-18px_rgba(0,109,121,.25)]
dark:bg-[#102330]/95` with the partner logo.

### Capability card (unused at website HEAD)

`rounded-md border border-cyan-800/10 bg-white/80 p-6 shadow-lg shadow-slate-900/5
dark:border-cyan-300/10 dark:bg-[#081a2b]/82` — title `font-display text-lg
font-semibold text-[#05215e] dark:text-slate-50`, body `mt-3 text-sm leading-6`.

## Header

- `ScrollHeaderFrame`: `header-scroll-backdrop fixed top-0 z-40 w-full px-5
  sm:px-8 backdrop-blur-md transition-opacity duration-500 ease-in-out` (bg
  opacity ∝ scroll over 96px).
- `deferUntilCover` (vertical home only): starts `pointer-events-none
  invisible opacity-0` + `inert` + `aria-hidden`; reveals on the `window`
  event `binpar:home-cover-ready`, when the cover scrolls off, or under
  reduced motion (`motion-system.md` → Brand-intro choreography).
- Inner bar: three-column grid, nav CENTERED:
  `mx-auto grid h-16 w-full max-w-425 grid-cols-[1fr_auto] items-center
  md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]` — logo pair left
  (`h-6 sm:h-8`, `aria-label="Inicio"` link), nav center, actions right
  (`justify-self-end gap-4 lg:gap-6`).
- Nav: `nav aria-label="Navegación principal"`, links `font-body text-xs
  lg:text-sm font-medium text-slate-600 hover:text-cyan-800 dark:text-slate-400
  dark:hover:text-cyan-100`, gap `gap-2 lg:gap-7`, hidden below `md`. Items:
  Inicio · Plataforma · Equipo (disabled) · Blog · Contacto.
- **Disabled nav item** (not yet published): `span role="link"
  aria-disabled="true"` with `cursor-not-allowed opacity-45` — same treatment
  in the mobile drawer and footer links. Never a dead `<a>`.
- Right cluster: `ThemeToggle` + yellow CTA "Solicitar reunión" (`md:block`) +
  `MobileNavigation` burger.

## Theme toggle button

`grid size-9 place-items-center rounded-full border border-primary-light/20
bg-white/30 text-slate-700 hover:border-primary-light/40 hover:bg-cyan-50
hover:text-cyan-800 dark:border-cyan-300/20 dark:bg-primary-dark/8
dark:text-primary-dark-lighter dark:hover:bg-cyan-300/15` — moon icon in light,
sun in dark. See `theming.md` for behavior.

## Mobile navigation

- Trigger: same `size-9` round glass button, three animated 1px lines
  (rotate ±45°, 0.14s) forming an X.
- Panel: `fixed inset-x-0 top-16 z-50 h-[calc(100dvh-4rem)] bg-[#f4f9fc]
  dark:bg-[#06111f]`, slides from left (`x: -100%`, 0.18s easeInOut). Links are
  bordered rows (`border-b border-cyan-800/12 py-3 text-sm font-semibold`);
  active link in accent + `h-px w-8` underline bar; disabled rows
  `cursor-not-allowed opacity-45`. Items are the header's `navItems` as-is
  (Inicio included). Yellow CTA pinned at bottom (`mt-auto`). Locks body
  scroll, closes on Escape/route change/desktop resize.

## Footers

1. **ContrastFooter** — the production footer on every `PageShell` page and the
   vertical home (`VerticalFooter` = `<ContrastFooter palette="original" />`):
   - Compact **always-navy band**, identical in both themes:
     `radial-gradient(ellipse at 90% 90%, rgb(0 109 121 / 22%), transparent
     60%), #081827`; tokens `--ft-heading #f8fafc`, `--ft-text #b5c4d2`,
     `--ft-accent #00bcbb`, `--ft-line rgb(0 188 187 / 22%)`
     (`footer-design.css:352-373`).
   - 44px grid through a fixed window (`.ft-grid-window`, opacity .7 / dark
     .35) with `rgb(0 188 187 / 4.5%)` lines.
   - `motion.footer` fade .35s, `whileInView` once, `amount: 0.15`.
   - Container `calc(100% - 80px)` (mobile `- 40px`), `max-width: 1280px`.
     Three-column panel (`1.2fr .9fr .9fr` ≥1024px, separated by 1px lines):
     brand (`binpar-logo-dark.svg` only, 26px / 24px mobile, `aria-label=
     "BinPar · Inicio"`) + "IA médica institucional para conectar
     conocimiento clínico y respuestas trazables." (12px/20px, max 320px) /
     eyebrow "Explorar" + `navItems` in a 3-column grid / eyebrow
     "Conectemos" + "Solicitar reunión" and `info@binpar.com`, each with
     `ArrowUpRight` 15px.
   - Eyebrow `.ft-eyebrow`: Sora 9px 700, `0.16em`, uppercase, accent.
   - Bottom row (border-top line, 10px/18px): "© BinPar · Todos los derechos
     reservados" + "Política de privacidad".
   - Links `transition: color 150ms ease`, hover accent, focus `2px solid`
     accent outline with offset 4px.
   - The component's `palette="teal"` default is lab-only.
2. **HomeFooterBand** (**legacy**, horizontal home only): slim `min-h-12` bar,
   `bg-[#edf6f9]/92 dark:bg-[#030b17]/92 backdrop-blur-md`, uppercase 9px
   copyright link ("© BinPar all rights reserved") + `FooterBandMenu`
   dropdowns ("Producto", "Contacto") that open UPWARD: `details` element,
   panel `rounded-xl border bg-white/98 p-1.5 shadow-2xl backdrop-blur-xl
   dark:bg-[#05111f]/98`, items `rounded-lg px-3 py-2 text-sm
   hover:bg-primary-light/10`, `+` marker rotates 45° when open.

`ReferenceFooter` (light band, separate company credit) is unused — don't
rebuild it.

## Contact assistant (current contact pattern)

`contact-assistant/*` replaces the form on the home (`#contacto`) and on
`/contacto` (`layout="page"`, `min-height: calc(100svh - 64px)`):

- Section `padding: 64px 40px`, transparent, with a soft radial halo
  (`::before`, `min(1120px, 100% - 40px)` wide; white → `#fbfdff` fades, dark
  `rgb(6 17 31 / 85% → 0)`). Container `max-width: 880px; text-align: center`;
  form `max-width: 768px`.
- Tokens: `--ca-accent #006d79 / #00bcbb`, `--ca-heading #05215e / #f8fafc`,
  `--ca-body #475569 / #a9bacb`, `--ca-line rgb(0 109 121 / 16%) /
  rgb(0 188 187 / 20%)`, `--ca-surface rgb(255 255 255 / 88%) /
  rgb(8 24 39 / 90%)`. Send hover `#085b67`.
- Stack: animated isotipo (`.ca-brand` 56×56, reveal contact variant) →
  eyebrow "Contacto" (Sora 12px 700 `0.22em`) → H2 "Hablemos de tu
  organización." (Sora 32px 700) → typed reply (PJS 18px/30px, 8ms/char) →
  one-field composer.
- Steps, one field at a time, each with a lucide icon: name ("¿Cómo te
  llamas?") → email ("¿Dónde podemos responderte?") → message ("¿Qué te
  gustaría explorar con BinPar?", placeholder "Cuéntanos tu caso de uso o lo
  que necesitas…"), then the privacy checkbox; progress nav `aria-label="Pasos
  del contacto"`. This copy uses *tú*/*nosotros*: an observed exception on
  the site, known debt in `binpar-brand-voice` (M4/M5); reuse the
  layout, take the wording from that skill's rewrites.
- Composer (`contact-message-composer.css`, mirror of the product chat
  composer): grid `56px / 1fr / 56px`, height 52px, radius 28px (expanded 24px),
  `border: 1px solid rgb(0 109 121 / 15%)`, `rgb(255 255 255 / 85%)` +
  `backdrop-filter: blur(12px)`; dark `rgb(21 34 48 / 90%)` + `0 0 32px
  rgb(0 188 187 / 12%)`; height/radius 220ms `cubic-bezier(0.22,1,0.36,1)`.
- Anti-spam: visually hidden `website` honeypot only (Turnstile was removed).
- Validation errors: `p.ca-error role="alert"` linked via
  `aria-describedby` / `aria-invalid`. Completion (`role="status"`): `Check`
  mark + "Gracias, {nombre}." + the message quoted as a blockquote + "Volver
  a empezar".
- Motion and reduced-motion behavior: `motion-system.md` → Assistant intro.

## Forms (legacy contact form)

`ContactForm` survives only in the horizontal home's `ContactPanel`. Its field
recipe is still the brand's form recipe for any classic form. Field recipe:

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
  `text-primary-light underline underline-offset-4 dark:text-secondary-dark` (deviation: links are never yellow — use `dark:text-primary-dark` in new work).
- Submit: full-width primary pill; busy state `disabled:cursor-wait
  disabled:opacity-60` + "Enviando...".
- Anti-spam: visually hidden honeypot field only — Cloudflare Turnstile was
  removed (`contact-form.tsx` comment). Success state swaps the whole form for
  a status panel (uppercase accent label + `font-display` heading + body).
- Panel: `rounded-3xl … space-y-5 p-7` (compact: `space-y-3 p-5`).

## Pagination (blog)

Round `size-10` buttons: active = `border-primary-light bg-primary-light
text-white shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark
dark:text-[#03111d]`; inactive = glass (`border-primary-light/60 bg-white/80
text-slate-600 hover:text-cyan-800`); disabled arrows = `opacity-45
pointer-events-none`. Chevron icons `size-4 strokeWidth={1.8}`.

## Clinical chat mock (hero product demo)

Self-running, non-interactive chat demo (`clinical-chat-mock.tsx`):

- **Panel**: `shadow-big-blocks @container pointer-events-none relative
  isolate overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80
  backdrop-blur-sm select-none dark:border-cyan-300/15 dark:bg-[#06111f]`,
  `h-110` (compact `h-87.5`). Internal 44px grid (phase-synced with the page)
  under a horizontal veil `bg-white dark:bg-[#06111f]
  mask-[linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]`.
- **No header bar.** Empty state centered: isotipo `size-10` → eyebrow
  "BinPar" (Sora 10px bold `tracking-[0.22em]` uppercase accent) → "Comité
  clínico" (`font-display text-lg font-extrabold`). The composer starts at
  `top: 50%` and docks to the bottom on first send.
- **User bubble**: filled `ml-auto max-w-[82%] rounded-2xl rounded-br-md
  bg-primary-light shadow-big-blocks text-white dark:bg-primary-dark
  dark:text-[#04111e]`.
- **Processing label**: isotipo `size-4` + status + "…" with `animate-pulse`
  ("Consultando guías" / "Contrastando conocimiento validado" / "Preparando
  respuesta"; follow-up "Contrastando seguimiento").
- **Answer**: bare text (no bubble, no avatar), with a list; citations
  `<sup>[n]</sup>` in Sora semibold accent, `underline decoration-current/35`.
- **References**: heading "Bibliografía" (Sora 11px bold `tracking-[0.16em]`
  uppercase accent) over a top border; numbered chips `size-5 rounded-md
  border border-primary-light/20 bg-primary-light/8` (Sora 10px semibold).
- **Composer**: `rounded-[28px]` pill (20px when multi-line), grid
  `44px / 1fr / 44px`, `bg-white/85 backdrop-blur-md` / dark
  `bg-[#152230]/90` + `0 0 32px rgba(0,188,187,0.12)` glow; `Paperclip` left,
  filled round send with `ArrowUp` right (opacity .45 → 1 while composing).
  Placeholder "Pregunta clínica al comité..."; while answering "El comité está
  respondiendo...".
- Sequence and timings: `motion-system.md` → Narrative scenes. Reduced
  motion: static condensed consultation.

This mock mirrors the product chat; for product UI, the `/plataforma` replica
(`platform-preview/*`) is the closer reference (sidebar lockup 24px, rail and
mobile-header isotipo 24px, welcome isotipo 64px).

## Icons

Lucide React throughout (`ArrowRight`, `ArrowLeft`, `ArrowUpRight`, `ArrowUp`,
`Paperclip`, `Calendar`, `Clock`, `ChevronLeft/Right`, `Check`, `Mail`,
`MapPin`, `UserRound`, `MessageSquare`, `FileText`, `BookOpen`, `Cloud`,
`Code2`, `HeartPulse`, `Pill`, `Waves`), consistently `strokeWidth={1.8}`,
sizes `size-3.5`–`size-4` (address rows 20px), always `aria-hidden="true"`.
Exceptions: cover CTA `ArrowUpRight` 17px stroke **1.5**; process-scene icons
20px stroke **1.1**. Custom SVGs (sun/moon, send, LinkedIn glyph) follow the
same stroke style. No filled icon sets. The BinPar isotipo is a logo, never an
icon-font glyph.

## Section index (`SectionNavigation`)

Fixed page index for long pages, desktop ≥1280px only (`section-navigation.css`):

- `position: fixed; inset-inline-end: 24px; top: 50%; translateY(-50%)`,
  width 156px, `max-height: calc(100svh - 160px)`, fades 180ms when
  `data-visible="true"`. `nav aria-label="Secciones de esta página"`.
- Links right-aligned, 36px min height, padding `6px 18px 6px 4px`, 13px 600
  (current 700, `aria-current="location"`); `--index-text #64748b / #a9bacb`,
  `--index-accent #006d79 / #00bcbb`; color 150ms ease-out.
- Track: 1px line `rgb(0 109 121 / 16%)` / `rgb(0 188 187 / 20%)`; marker
  3×22px, `border-radius: 999px`, accent, spring-scrubbed.
- Contrast clone (`.section-navigation-contrast`, `#f8fafc` / `#00bcbb`)
  clipped over `[data-section-navigation-surface="dark"]` bands.
- Sections register with `id` + `tabIndex={-1}` + `.section-navigation-region`
  (or `data-section-anchor`), `scroll-margin-top: 96px`. Inside
  `.section-navigation-layout`, bands pad `80px` left / `208px` right
  (contrast band `40px / 168px`) so content clears the index.
- Labels are short nouns: home "Presentación · Casos de éxito · Cómo
  funciona · Arquitectura · Blog"; `/plataforma` "La plataforma · Consulta ·
  Contraste · Fuentes · Seguimiento"; `/contacto` "Hablemos · Dónde estamos".
- `SideLinkedInLink` mirrors it on the left (`inset-inline-start: 20px`, 32px
  strip): "Síguenos" in `writing-mode: vertical-rl` (15px 600) above an 18px
  LinkedIn glyph; `#64748b` / `#a9bacb`, hover accent; same contrast clone;
  visible with the index.

## Process player (`ClinicalProcessShowcase`)

- Section grid `grid items-start gap-8 lg:grid-cols-3 lg:gap-12`; copy column
  `lg:h-[482px]` with stacked chapters crossfading (`duration-350`); `sr-only`
  H2 "De la pregunta a la evidencia.".
- Chapter: eyebrow-style counter "01 / 05" → stage H3 (`typography-classes.md`) →
  `font-body mt-5 text-lg leading-8` body → signal label in eyebrow style.
- Frame (`lg:col-span-2`): `shadow-big-blocks @container relative isolate
  h-[482px] overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80
  backdrop-blur-sm dark:border-cyan-300/15 dark:bg-[#06111f]` + internal 44px
  grid, snapped to the page grid.
- `PlaybackControls`: round `size-8` step buttons (Sora `text-xs` tabular;
  active `bg-primary-light/10 text-primary-light`) with a 0.5 progress
  underline, speed / pause / restart buttons
  `bg-primary-light/10 … rounded-full size-8`.
- Scene cards: `rounded-2xl border bg-white/95
  shadow-[0_8px_24px_rgba(0,109,121,0.05)] dark:bg-[#152230]/95`; borders
  `cyan-800/15` idle → `primary-light/35` active.

## App-icon tile

Tile for the isotipo on intro moments (96×96, radius 28px, mark 56px;
mobile 76/23/44). The surface is a `::before` with a flat `#fff` / `#102535`
fill, which fades in independently. Full spec in `../logo.md`.

## Numbered process milestones (legacy)

**Legacy** — horizontal home only; the vertical home uses the process player.
Step node: `grid size-10 place-items-center rounded-full border
border-primary-light bg-white/80 font-display text-xs font-semibold text-cyan-800
shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f]
dark:text-primary-dark-lighter dark:shadow-[0_0_18px_rgba(103,232,249,0.18)]`
(compact `size-8 text-[10px]`). Connected by animated 1px accent lines
(horizontal `scaleX` on desktop grid, vertical `scaleY` on mobile timeline over a
static `bg-cyan-600/15` track). Each milestone: node → `font-display` title →
`text-sm` body → uppercase micro-signal in accent.

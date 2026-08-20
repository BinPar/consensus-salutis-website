# Landing Patterns (Home)

> Source: `src/app/_components/horizontal-home.tsx`, `site.tsx`, `page.tsx`.
>
> **The definitive home is the VERTICAL layout** (`VerticalHome`, selected with
> `env.VERTICAL_HOME`). A horizontal rail variant (`HorizontalHome`) exists in
> the codebase but is NOT the canonical pattern — don't base new work on it.
> Both share the same panels; only the scroll axis differs.

## Canonical section order

1. **Hero** — eyebrow "IA médica institucional" · H1 "Conocimiento clínico
   gobernado por IA." · lede · CTA pair · **ClinicalChatMock** in the right
   column. Grid `lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center`.
2. **Casos de éxito** — heading block left, success-case logo cards right
   (same 1.15/0.85 grid).
3. **Proceso de consulta** — 5 numbered milestones with animated connectors
   ("De la pregunta a la evidencia.").
4. **Producto / Arquitectura** — 3 product pillars (BinPar · AWS · Editorial
   Médica Panamericana): logo, bordered uppercase role label, body.
5. **Métricas (KPIs operativos)** — intro + 4 animated metric cards
   (+3 TB, +8.327, +30.000, <24h).
6. **Blog (Lecturas clínicas)** — heading + "Ver todos" pill + latest 4
   article cards.
7. **Contacto (Siguiente paso)** — heading block + ContactForm panel, grid
   `lg:grid-cols-[0.85fr_1.15fr]`.

## Page shell (vertical home)

```tsx
<HomeShell vertical>          // relative isolate bg-[#fbfdff] dark:bg-[#06111f] min-h-screen
  <HomeMotionBackground />    // fixed grid layer (z-0)
  <SiteHeader />              // fixed, h-16
  <VerticalHome />
  <VerticalFooter />          // full footer (NOT the slim band)
</HomeShell>
```

## Panel mechanics (vertical)

- Each section is a `VerticalPanel` — a render-prop wrapper that computes its
  own scroll visibility (activation line at 85% of the viewport height,
  reversible on scroll-up) and passes `visible` down to `Reveal` children.
- Panel layout: `px-10 py-20` (hero: `flex min-h-[calc(100svh)] items-center`),
  content constrained to `mx-auto w-full max-w-7xl`, `relative z-10`.
- The first three panels (Hero, Casos, Proceso) are wrapped in a
  `relative [clip-path:inset(0)]` group containing `FixedSignalLayer` — a
  fixed, full-viewport `SignalField intensity="hero" opacity={0.72}` that
  stays pinned behind them while scrolling and clips at the group edge.
- `ProductSignalLeft` blob anchors the hero: `fixed -bottom-80 -left-155 w-250
  rotate-20`.
- Reveal cadence inside each panel: eyebrow (0) → H2 (0.1) → paragraph (0.2)
  → content grid (0.3+ or staggered children). See `motion-system.md`.

## Section backgrounds (alternating rhythm)

| Panel | Background |
|-------|-----------|
| Hero | transparent over grid + signal layers |
| Casos de éxito | `bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40` |
| Proceso | `bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30` |
| Producto | `bg-white dark:bg-transparent` |
| Métricas | gradient band (like Proceso, `/80` start) |
| Blog | `bg-white dark:bg-transparent` |
| Contacto | `bg-[#deedf3]/82 dark:bg-[#030916]/82` + `ProductSignalAccent` blob top-left |

`ThemeSection` variants (`plain`/`panel`/`deep`/`transparent`, `py-20`,
`border-y border-cyan-800/10`) provide the same rhythm on mobile and subpages.

## Mobile home (`MobileHome`, `lg:hidden`)

Single vertical flow with the same order, but the chat mock moves BELOW the
hero copy (compact variant) and CTAs after it. Sections use `ThemeSection`
with `px-5 sm:px-10`; type scales down (H1 `text-4xl sm:text-5xl`, H2
`text-3xl sm:text-4xl`, ledes `text-base leading-7`). Reveals switch to
`ViewportReveal`/`usePassedViewport`. A fixed `SignalField` +
`ProductSignalLeft` still back the first group.

## Content blocks

### Success case card

`rounded-2xl border border-cyan-800/15 bg-white/70 px-5 py-3 shadow-big-blocks
backdrop-blur-xs dark:bg-[#152230e6]/90` — centered logo (`h-14` box,
`max-h-11` logo, dark handled via white variant or `dark:brightness-0
dark:invert`) + org name `font-display text-xs font-semibold tracking-[0.13em]
uppercase text-primary-light dark:text-primary-dark`. Stagger 0.18s.

### Product pillar

No card chrome — open composition: logo (`h-10`–`h-12` box, inverted in dark)
→ role label `border-b border-primary-light pt-4 pb-3 font-display text-xs
font-semibold tracking-[0.13em]–[0.18em] uppercase text-primary-light
dark:border-cyan-300/20 dark:text-primary-dark` → body `text-sm leading-6
text-slate-600 dark:text-slate-400`. Grid `md:grid-cols-3 lg:gap-10`,
stagger 0.24s.

### Clinical process (5 steps)

Desktop: 3-column grid, 2 rows (`col-start`/`row-start` placement 1-2-3 top,
4-5 bottom); connector lines after steps 01, 02 and 04 (`border-t
border-primary-light`, `w-[calc(100%+3.5rem)]`, animated scaleX). Mobile:
vertical timeline `grid-cols-[4.5rem_1fr]` with animated vertical connector.
Node/typography spec in `ui-components.md`; delays in `motion-system.md`.

### Metrics

`grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-8` of glass metric
cards with count-up values (see `motion-system.md`). Intro heading pattern:
eyebrow "KPIs operativos" + H2 + explanatory lede.

### Hero copy rules

- H1 states the value proposition in one sentence ending with a period.
- Lede: 2 sentences max, `max-w-2xl`, mentions "guías, protocolos y corpus
  médico" → "respuestas trazables".
- Eyebrow is category positioning, not marketing ("IA médica institucional").

## Subpage hero (`PageHero`)

For non-home pages: bordered section on `bg-[#fbfdff] dark:bg-[#06111f]` with
a diagonal cyan/teal gradient wash + 40px grid overlay + `SignalField
intensity="hero"`; content `max-w-7xl px-5 py-20 lg:py-24`: Eyebrow → H1
`text-4xl sm:text-5xl` → lede `max-w-3xl`. Blog list/article pages use the
simpler recipe: fixed SignalField layer + `ProductSignalLeft` + content
starting at `pt-32 lg:pt-36` (clearing the fixed header).

## Horizontal home (legacy/optional)

Kept behind `env.VERTICAL_HOME=false`: a `lg:h-screen lg:overflow-hidden`
shell whose wheel events translate to horizontal rail scroll (`w-screen`
panels, keyboard PageUp/Down/Home/End support), a bottom progress bar
(spring scaleX, panel name label) and the slim `HomeFooterBand`. Panels reveal
at 35% horizontal visibility. Mobile falls back to `MobileHome`. Reuse only if
explicitly asked for the horizontal experience.

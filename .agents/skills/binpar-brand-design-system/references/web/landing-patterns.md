# Landing Patterns (Home)

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Source: `src/app/page.tsx`, `src/env.js`, `src/app/_components/horizontal-home.tsx`
> (`VerticalHome`, `HeroPanel`, `MobileHome`), `site.tsx`, `home-cover.tsx`,
> `home-paint-panel.tsx`, `section-navigation.tsx`,
> `success-cases/*`, `clinical-process-showcase.tsx`,
> `product-strata/*`, `volume-section.tsx`, `home-blog.css`,
> `contact-assistant/*`, `contrast-footer.tsx`, `platform-walkthrough.tsx`,
> `contacto/_components/*` (website HEAD `70613ae`).
>
> **The definitive home is the VERTICAL layout** (`VerticalHome`), opened by
> the brand cover (`HomeCover`). It renders only when `VERTICAL_HOME=true`;
> the flag defaults to `"false"` (`src/env.js`), so a deployment without it
> still serves the legacy horizontal rail. Build new work on the vertical
> layout regardless. `HorizontalHome` is legacy — don't base new work on it.

## Canonical section order

| # | Anchor | Section | Content |
|---|--------|---------|---------|
| 0 | — | **Cover** (`HomeCover`) | `.home-entry`, `min-height: 100svh`: app-icon tile with the traced isotipo → H1 "BinPar" + accent line "Respuestas clínicas trazables." → lede → single CTA "Descubrir la plataforma" (scrolls to #1) |
| 1 | `#home-introduction` | **Presentación** (`HeroPanel presentation="section"`) | Eyebrow "IA médica institucional" · **H2** "Conocimiento clínico orquestado por IA." (current site copy; known voice debt, M7: don't reuse, see `binpar-brand-voice`) · lede · CTA pair · `ClinicalChatMock` right (`lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12`) · `IntroductionBottomFade` |
| 2 | `#casos-de-exito` | **Casos de éxito** (`SuccessCasesSection`) | Eyebrow "Casos de éxito" · H2 "El futuro de la salud. / Ya está aquí." (2nd line accent; known voice debt, M8/M9: don't reuse) · lede · numbered case pills · territorial map of Spain with floating case cards (Axia → Catalunya, SERMAS → Madrid) |
| 3 | `#proceso` | **Cómo funciona** (`ClinicalProcessShowcase`) | `sr-only` H2 "De la pregunta a la evidencia." · five-stage process player |
| 4 | `#arquitectura` | **Arquitectura** (`ProductStrataSection`) | Centered H2 "Tres capacidades. / Una sola arquitectura." (no eyebrow) · rotatable 3-layer graphic · three pillars: BinPar "Producto e ingeniería", Editorial Médica Panamericana "Conocimiento clínico", AWS "Infraestructura resiliente" |
| 5 | `#conocimiento` | **Volumen** (`VolumeSection palette="original"`) | Navy **contrast band** in both themes · eyebrow "Volumen y actualización" · typewriter H2 · four STATIC figures (+3 TB, +8.327, +30.000, <24 h) |
| 6 | `#lecturas` | **Blog** (`BlogPanel`) | Only when posts exist ("mejor un panel menos que un panel vacío") · `.home-blog-surface` |
| 7 | `#contacto` | **Contacto** (`ContactAssistant`) | Traced isotipo · eyebrow "Contacto" · H2 "Hablemos de tu organización." (second person: known voice debt, M4/M5) · conversational three-step form |
| — | — | **Footer** | `VerticalFooter` = `<ContrastFooter palette="original" />` |

Section index (`homeSections`): Presentación · Casos de éxito · Cómo funciona
· Arquitectura · Blog (the blog entry drops with the panel). The cover,
volume band and contact are not indexed.

## Page shell (vertical home)

```tsx
<HomeShell vertical>            // relative isolate bg-[#fbfdff] dark:bg-[#06111f] min-h-screen
  <HomeMotionBackground />      // fixed bg + <HomeGrid home /> (z-0)
  <SiteHeader deferUntilCover /> // hidden until binpar:home-cover-ready
  <VerticalHome posts={posts}>
    <SectionNavigation sections={sections} deferUntilContent />
    <main className="section-navigation-layout relative z-10 hidden lg:block">
      <div className="relative [clip-path:inset(0)]">   {/* clip group */}
        <FixedSignalLayer />
        <HomeCover targetId="home-introduction" />
        {/* HomePaintPanel → HeroPanel · Casos · <section id="proceso"> */}
      </div>
      {/* #arquitectura · #conocimiento · #lecturas · #contacto */}
    </main>
    <MobileHome posts={posts} withCover />  {/* lg:hidden */}
  </VerticalHome>
  <VerticalFooter />            // ContrastFooter palette="original"
</HomeShell>
```

## Panel mechanics (vertical)

- Each section is wrapped in **`HomePaintPanel`** (imported as `VerticalPanel`):
  a render-prop wrapper that paints its section when it crosses **85% of the
  viewport** while scrolling down (or ≥5% visible) and un-paints on scroll-up
  past the line; it passes `visible` down. Casos and Arquitectura also wait
  for 20% of their content (max 160px) past the line.
- `Panel` layout: natural `px-10 py-18` (viewport height: `flex
  min-h-[calc(100svh)] items-center px-10 py-20`), content `relative z-10
  mx-auto w-full max-w-7xl`, plus `section-navigation-inset`.
- Index registration: every indexed section has `id` + `tabIndex={-1}` +
  `.section-navigation-region` (wrapper) or `data-section-anchor` (section),
  `scroll-margin-top: 96px`. From 1280px, bands pad `80px` left / `208px`
  right (contrast band `40px / 168px`) to clear the index.
- The **clip group** (Cover + Presentación + Casos + Proceso) holds
  `FixedSignalLayer` — `pointer-events-none fixed inset-0 -right-50 z-0` with
  `SignalField className="-top-48 h-[calc(100%+12rem)]" intensity="hero"
  opacity={0.72}` — pinned behind those sections and clipped at the group
  edge.
- `ProductSignalLeft` anchors the Presentación section: `fixed -bottom-80
  -left-155 w-250 rotate-20`.
- Reveal cadence inside a section: eyebrow (0) → H2 (0.1) → paragraph (0.2)
  → content (0.3) → side media (0.4). See `motion-system.md`.

## Section surfaces (masked blends + one contrast band)

Light sections no longer alternate hard-edged bands: each surface is masked
so it dissolves into the next (`success-cases/success-cases-surfaces.tsx`).

| Section | Surface |
|---------|---------|
| Cover | transparent over grid + signal layers |
| Presentación | transparent; `IntroductionBottomFade` at the bottom: `bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40`, height `clamp(320px, 48vw, 560px)`, mask built from squared stops |
| Casos de éxito | `CasesBackground`: same white / navy gradient, masked in from the top (`transparent → black clamp(64px, 10vw, 144px)`) |
| Proceso | `ProcessBackground`: `bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30` masked with `surfaceMask` (11 stops `[0, .028, .104, .216, .352, .5, .648, .784, .896, .972, 1]`, depth `clamp(112px, 18vw, 280px)`), the cases surface continuing on top, and a fade to the product white at the bottom (`clamp(160px, 18vw, 280px)`) |
| Arquitectura | `bg-white dark:bg-[#06111f]` |
| Volumen | **contrast band** `radial-gradient(ellipse at 90% 90%, rgb(0 109 121 / 22%), transparent 60%), #081827`, both themes, `data-section-navigation-surface="dark"` |
| Blog | `.home-blog-surface`: white with a 128px bottom fade (96px below 640px); transparent in dark |
| Contacto | transparent + the assistant's radial halo |
| Footer | contrast band again (`ContrastFooter`) |

`ThemeSection` variants (`plain`/`panel`/`deep`/`transparent`, `py-20`, or
`py-14 sm:py-18` with `compact`) still provide the rhythm on mobile and
subpages.

## Mobile home (`MobileHome withCover`, `lg:hidden`)

Same order, cover first. Fixed `SignalField` + `ProductSignalLeft` (`-left-200
sm:-left-155`) back the first group; the compact chat mock sits BELOW the
presentation copy; sections use `px-5 sm:px-10`; type scales down (H2
`text-3xl sm:text-4xl`, ledes `text-base leading-7`); reveals use
`ViewportReveal` / `usePassedViewport` (activation at 1.12× / 0.85× the
viewport). No section index on mobile.

## Content blocks

### Cover (`home-cover.tsx` / `.css`)

`padding: 128px 32px 112px` (mobile `112px 24px 80px`), content `max-width:
850px`, centered. Tile (`../logo.md` → App-icon tile) → H1 (54/48/36px,
accent line 40px) → lede `text-lg leading-8 text-slate-600
dark:text-slate-400`, `max-width: 560px`, `margin-top: 28px` → cover CTA
(`ui-components.md`). Entrance: `motion-system.md` → Brand-intro
choreography. The header and section index stay hidden until it completes.

### Casos de éxito (territorial map)

Grid `lg:grid-cols-[.82fr_1.18fr] gap-10 lg:gap-12`. Left: eyebrow, two-line
H2 (accent second line), lede `text-lg leading-8`, numbered pills (`min-h-10
rounded-full border px-4 text-xs font-semibold`; selected = filled primary,
white / `#06111f` text; index at `opacity-60`). Right: hand-drawn SVG map in
`currentColor` primary with gradient land, grid, glow and pin ripples; case
cards (`rounded-xl bg-white/95 dark:bg-[#102330]/95`, partner logo, dark
variant or `dark:brightness-0 dark:invert`) anchored to their regions, gently
repelling each other, draggable. Data model: `success-cases-data.ts` — the map
pin is optional, so adding a case never requires artwork.

### Proceso (process player)

Five stages — 01 "Plantear la consulta", 02 "Consultar el conocimiento", 03
"Contrastar las aportaciones", 04 "Fuentes verificables", 05 "Revisar y
profundizar" — each with a signal label. Layout and controls in
`ui-components.md` → Process player; clock and gating in `motion-system.md`.

### Arquitectura (strata)

Centered two-line H2 + lede "Un producto sólido se construye en profundidad.
Tres capas complementarias sostienen la misma experiencia clínica." Graphic
(`aspect-[650/410]`, max 640px) beside the pillar detail; micro-label "Capa 0N
/ 03" (`text-[10px] font-semibold uppercase tracking-[.19em]`). Pillar logos:
BinPar pair `h-7` (large `h-10`), EMP and AWS inverted in dark. Proof lines:
"+15 años de software sanitario", "+70 años de experiencia editorial",
"Continuidad y capacidad de escala".

### Volume band (contrast band)

`min-height: 420px`, `padding-block: 64px` (56px mobile), container
`calc(100% - 80px)` max 1280px, two columns (`gap: 72px`; one column
≤767px). Left: eyebrow (Sora 12px 700 `0.22em`, `#00bcbb`) → typewriter H2
"El conocimiento avanza. / La base se actualiza." (`#f8fafc`) → intro 18px/32px
`#b5c4d2`. Right: 2×2 tiles (`border-radius: 18px; padding: 16px 20px;
background: rgb(0 188 187 / 5%); border: 1px solid rgb(0 188 187 / 22%)`),
value Sora 38px 700 tabular-nums `#f8fafc`, label 14px/22px `#b5c4d2`.
Figures are static — count-ups are legacy.

### Blog

Eyebrow "Lecturas clínicas" → H2 "Últimos artículos" → lede → "Ver todos"
pill; latest 4 cards (`blog-patterns.md`).

### Contacto

`ContactAssistant` (`ui-components.md` → Contact assistant). No side copy, no
form panel: the assistant is the whole section.

### Copy rules (cover + presentation)

- Cover H1 is the product name only ("BinPar"); the accent line states the
  value in a short phrase; the lede says what it is and what it connects
  ("guías, protocolos y corpus médico" → "práctica clínica"); ONE exploratory
  CTA.
- Presentación: eyebrow is category positioning, not marketing ("IA médica
  institucional"); H2 one sentence; lede ≤2 sentences, `max-w-2xl`, mentions
  "guías, protocolos y corpus médico" → "respuestas trazables"; CTA pair.
- Wording is the brand-voice skill's call. Some current site copy is recorded
  there as known debt (e.g. "orquestado por IA", "agentes expertos",
  "orquestador" in the process scenes, "El futuro de la salud. Ya está aquí.",
  *tú*/*nosotros* in the contact assistant, "Estamos en Madrid.", trailing
  periods on display headings) — quote it when describing the site, never
  reuse it as a model. *comité clínico* / *comité de expertos* are allowed
  public lexicon. The cover lede at HEAD is also missing its verb ("BinPar la
  IA médica institucional que…").

## Subpages (`/plataforma`, `/contacto`)

Same family as the home, without the cover:

- `PageShell` (normal header + contrast footer) around a
  `section-navigation-layout` surface `bg-[#fbfdff] dark:bg-[#06111f]` with
  `HomeMotionBackground` + `SectionNavigation` (own section list) +
  `HomePaintPanel` sections; the first section clips (`[clip-path:inset(0)]`)
  a fixed `SignalField` (`intensity="hero"`) + `ProductSignalLeft` (`fixed
  -bottom-80 -left-200 w-250 rotate-20 sm:-left-155`).
- `/plataforma` (`PlatformWalkthrough`): first section `pt-36 sm:pt-44`,
  centered two-line H1 "De la consulta clínica / a la evidencia." (accent
  second line) + lede, then the interactive product replica
  (`platform-preview/*`, frame aspect 1440/724, radius 20px), then five stage
  sections (01–05) with looping scenes on alternating white-masked bands, then
  a closing CTA block (eyebrow "Siguiente paso" → H2 → lede → "Solicitar una
  demostración"). Index: La plataforma · Consulta · Contraste · Fuentes ·
  Seguimiento.
- `/contacto` (`ContactPageContent`): `#hablemos` = `ContactAssistant
  layout="page"` over the hero signal; `#donde-estamos` = `ContactDetails` band
  (`bg-[#e8f2f7]/80 dark:bg-[#081827]/80`, `lg:grid-cols-2`): eyebrow "Dónde
  encontrarnos", H2 "Estamos en Madrid." (known voice debt), lede, address list with 20px lucide
  icons; right, a MapLibre map in brand colors whose marker is the isotipo
  beacon (`motion-system.md` → Beacon ripple). Index: Hablemos · Dónde
  estamos.
- Blog list/article pages keep the simpler recipe: fixed SignalField +
  `ProductSignalLeft` + content from `pt-32 lg:pt-36` (`blog-patterns.md`).
- `PageHero` (bordered hero with diagonal wash + 40px grid) is unused at HEAD.

**Deleted routes**: `/casos`, `/evidencia` and `/seguridad` were removed in
website `79663ea` with no redirects (they 404). Don't link to them or rebuild
them from old copy. `/casos-lab` is a private, noindex lab route: never cite or
ship its variants (`palette="teal"`, particle entrance, alternative cards) as
production patterns.

## Horizontal home (legacy)

Kept behind `VERTICAL_HOME=false`: a `lg:h-screen lg:overflow-hidden` shell
whose wheel events translate to horizontal rail scroll (`w-screen` panels,
keyboard PageUp/Down/Home/End support), a bottom progress bar (spring scaleX,
panel name label) and the slim `HomeFooterBand`. Panels reveal at 35%
horizontal visibility; no cover, no section index. It is now the only
consumer of the count-up metrics (`MetricsPanel`), the numbered milestones
(`ClinicalProcess`) and `ContactPanel` / `ContactForm`.
Reuse only if explicitly asked for the horizontal experience.

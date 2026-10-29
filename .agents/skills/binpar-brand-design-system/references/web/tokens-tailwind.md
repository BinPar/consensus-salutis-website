# Colors & Design Tokens

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Sources: brand manual palette ("Aspectos técnicos", Consensus Salutis era —
> still the base palette) + production tokens in
> `consensus-salutis-website/src/styles/globals.css` (unchanged by the BinPar
> rebrand) and component usage, incl. `footer-design.css`,
> `volume-section.css`, `section-navigation.css`, `home-cover.css`,
> `contact-assistant/contact-assistant.css` (website HEAD `70613ae`).

Palette and roles: `../color.md`. This file maps them to the website's Tailwind tokens.

## Website theme tokens (Tailwind v4 `@theme`)

This is the exact production token block. Reproduce it verbatim when generating
CSS for any BinPar web property:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --breakpoint-3xl: 2000px;
  --color-primary-dark: #00BCBB;
  --color-primary-dark-lighter: #71fffe;
  --color-primary-light: #006d79;
  --color-secondary-light: #ffd230;
  --color-secondary-dark: #f6ff53;
  --font-sans:
    var(--font-plus-jakarta-sans), "Plus Jakarta Sans", ui-sans-serif,
    system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  --font-system:
    ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
    "Segoe UI Symbol", "Noto Color Emoji";
  --shadow-big-blocks: 0 4px 30px 0 color-mix(in srgb, var(--color-primary-light), transparent 90%),
                0 2px 6px 2px color-mix(in srgb, var(--color-primary-light), transparent 98%);
}

@layer utilities {
  .font-body {
    font-family:
      var(--font-plus-jakarta-sans), "Plus Jakarta Sans", ui-sans-serif,
      system-ui, sans-serif;
  }

  .font-display {
    font-family: var(--font-sora), "Sora", ui-sans-serif, system-ui, sans-serif;
  }
}
```

**Naming convention**: `primary-light` / `secondary-light` = the accent used
**when the LIGHT theme is active** (not a lighter shade); `primary-dark` /
`secondary-dark` = the accent used when the DARK theme is active. Components pair
them: `text-primary-light dark:text-primary-dark`.

## Semantic color map

### Accents

| Role | Light mode | Dark mode |
|------|-----------|-----------|
| Primary accent (links, eyebrows, numbers, focus) | `primary-light` `#006d79` | `primary-dark` `#00BCBB` |
| Primary hover / emphasis | `cyan-800` (Tailwind) / `#087a85`; cover CTA `#155e75`; send buttons `#085b67` | `primary-dark-lighter` `#71fffe` |
| Secondary / contrast accent (yellow) | `secondary-light` `#ffd230` | `secondary-dark` `#f6ff53` |
| Text on secondary CTA | `#06111f` | `#06111f` |
| Text on primary filled button | `#FFFFFF` | `#04111e` / `#03111d` (near-black navy) |

**Rule**: text on turquoise or yellow fills is ALWAYS near-black navy
(`#03111d`–`#06111f`) in dark mode and white only on the light-mode teal
(`#006d79`), which is dark enough for white text.

### Backgrounds & surfaces

| Surface | Light | Dark |
|---------|-------|------|
| Body / page base | `#f4f9fc` | `#06111f` |
| Home shell | `#fbfdff` | `#06111f` |
| Deep band (`ThemeSection variant="deep"`) | `#deedf3` | `#030916` |
| Panel band (`variant="panel"`; contact-details band at `/80`) | `#e8f2f7` | `#081827` |
| Card / glass surface | `bg-white/70`–`bg-white/90` | `bg-[#152230e6]/90` (also `bg-white/3`, `bg-[#081a2b]/82`) |
| Input fields | `bg-white/60` → focus `bg-white` | `bg-[#04111e]/68` → focus `bg-[#061a2a]` |
| Section gradients | `linear-gradient(135deg, rgba(222,237,243,.74–.82), rgba(237,246,249,.3–.42))` | `linear-gradient(135deg, rgba(3,9,22,.74–.82), rgba(8,24,39,.48))` |
| **Contrast band** (volume, footer) | `radial-gradient(ellipse at 90% 90%, rgb(0 109 121 / 22%), transparent 60%), #081827` | **same** (theme-fixed) |
| Contrast-band tiles | `rgb(0 188 187 / 5%)` + `1px solid rgb(0 188 187 / 22%)`, radius 18px | same |
| Process / case card | `bg-white/95` | process `bg-[#152230]/95` · case `bg-[#102330]/95` |
| App-icon tile (`::before`, production) | `#fff` (static variant, unused at HEAD: `linear-gradient(145deg, #fff, #f6fafc)`) | `#102535` (static: `linear-gradient(145deg, #172c3d, #0c1c2b)`) |
| Route-transition overlay | `#deedf3` | `#030916` |

**Contrast band.** The one deliberately theme-fixed surface: a navy band
identical in light and dark (`volume-section.css:233-242`,
`footer-design.css:352-361`, `palette="original"`). At HEAD only the volume
band carries `data-section-navigation-surface="dark"` (`volume-section.tsx:84-86`,
set only for `palette="original"`); `ContrastFooter` does not, so the section
index gets no contrast clone over the footer. Mark any new contrast band the
index can overlap with that attribute so overlays swap to their contrast
colors over it. The logo on a contrast band is always the `-dark` file.
The `palette="teal"` default of those components (`#006d79 → #006875 →
#005b68`) is lab-only — don't ship it.

### Text

| Role | Light | Dark |
|------|-------|------|
| Headings (display) | `#05215e` (heading navy) | `slate-50` |
| Card/subsection headings | `#05215e` | `slate-100` |
| Primary body | `slate-700` | `slate-300` |
| Secondary body | `slate-600` | `slate-400` |
| Muted / meta | `slate-500` | `slate-500` |
| Muted in custom CSS (section index, contact, footer, map labels) | `#64748b` / `#475569` | **`#a9bacb`** |
| Light footer text (`.ft-proposal`, lab palettes) | `#54657b` | `#a9bacb` |
| Composer placeholder / icons | `#647b94` | — |
| Errors (forms) | `rose-700` | `rose-300` |
| Status accent | `teal-700` | `teal-200` |

On the **contrast band** (both themes): heading `#f8fafc`, body `#b5c4d2`,
accent `#00bcbb`, lines `rgb(0 188 187 / 22%)`.

**Navy `#05215e`** is the manual navy for headings and the wordmark, in every medium.

### Borders

Borders are translucent cyan, never opaque gray:

| Weight | Light | Dark |
|--------|-------|------|
| Default | `border-cyan-800/10` | `border-cyan-300/10` |
| Card | `border-cyan-800/15`–`/20` | `border-cyan-300/15`–`/20` |
| Strong / active | `border-cyan-800/25`, `border-primary-light` | `border-cyan-300/25`, `border-cyan-300`, `border-primary-dark` |
| Hover | `border-primary-light/35`–`/45` | `border-cyan-200/45`–`/50` |

### Shadows & glows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-big-blocks` | see `@theme` above (soft teal-tinted double shadow) | Cards, CTAs, panels in light mode (also kept in dark) |
| Dark card glow | `shadow-[0_0_18px_rgba(103,232,249,0.08)]` | Metric/blog/success cards in dark mode |
| Dark CTA glow | `shadow-[0_0_34px_rgba(45,212,191,0.26)]` or `shadow-[0_0_24px_rgba(0,188,187,0.18)]` | Primary filled buttons in dark mode |
| Node glow | `shadow-[0_0_18px_rgba(103,232,249,0.18)]` | Process step circles (dark) |
| Progress glow | `shadow-[0_0_18px_rgba(34,211,238,0.55)]` | Horizontal progress bar |
| Deep panel shadow | `shadow-2xl shadow-slate-900/10` (light) / `shadow-cyan-950/30` (dark) | Legacy contact form panel |
| Process card | `shadow-[0_8px_24px_rgba(0,109,121,0.05)]` (coordinator `0.10`) | Process scenes |
| Case card | `shadow-[0_8px_24px_-18px_rgba(0,109,121,.25)]` | Map callout cards |
| App-icon tile | `0 2px 3px rgba(5,33,94,0.08), 0 12px 28px rgba(5,33,94,0.07)`; dark `0 2px 3px rgba(0,0,0,0.2), 0 12px 28px rgba(0,0,0,0.15)` — no inset highlight (static variant, unused at HEAD, adds `inset 0 1px 0 #fff` / `inset 0 1px 0 rgba(255,255,255,0.06)`) | Cover tile `::before` (border `rgba(5,33,94,0.08)` / `rgba(125,211,252,0.16)`) |
| Preview frame | `0 24px 80px rgb(0 34 98 / 9%), 0 4px 16px rgb(0 109 121 / 6%)`; dark `0 24px 80px rgb(0 0 0 / 28%)` | Product replica on `/plataforma` |
| Composer glow (dark) | `shadow-[0_0_32px_rgba(0,188,187,0.12)]` | Chat mock composer |

### Decorative gradient stops (motion/SVG layers)

The SignalField / ProductSignal blobs use this fixed story of stops:

- Cyan `rgb(8 145 178)` (light) / turquoise `rgb(0 188 187)` (dark)
- Teal `rgb(20 184 166)`
- Lime `rgb(246 255 83)` (light, low alpha) / sky `rgb(125 211 252)` (dark)

Grid-line color: `rgba(8,145,178,0.07–0.1)` light / `rgba(125,211,252,0.04–0.045)` dark;
on the contrast band `rgb(0 188 187 / 4.5%)`. All 44px grids share one phase
(`HomeGrid`, see `motion-system.md`).
Lime radial glow: `radial-gradient(ellipse at 82% 24%, rgba(246,255,83,0.13), transparent 38%)`
(dark mode drops alpha to `0.035`).

## Extended usage of Tailwind palettes

Beyond the custom tokens, the site deliberately leans on Tailwind's stock
`slate` (text/surfaces), `cyan` (borders, hovers: `cyan-800` light / `cyan-100`,
`cyan-300` dark), `teal` (status), and `rose` (errors). Do not introduce other
hues.

## Radius scale

| Radius | Use |
|--------|-----|
| `rounded-full` | Pills, CTAs, pagination, step nodes, theme toggle |
| `rounded-3xl` (24px) | Hero chat mock, contact form panel |
| `rounded-2xl` (16px) | Cards (metrics, blog, success cases), input pill of chat, article hero image |
| `rounded-xl` (12px) | Chat bubbles, blockquotes, footer band dropdown |
| `rounded-lg` (8px) | Form fields, dropdown items |
| `rounded-md` (6px) | Small list items, reference chips, small buttons |

## 60-30-10 feel

In practice the system reads as: ~60% pale ice-blue surfaces (`#f4f9fc`/`#fbfdff`
light, deep navy `#06111f` dark), ~30% navy/slate text mass, ~10% teal-turquoise
accent, with **yellow as the contrast color** on top of that story.

### Yellow

Scarce by rule: one element per composition, never links, fills, gradients or
decoration. See `../color.md` → Accent.

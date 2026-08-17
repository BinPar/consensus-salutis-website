# Colors & Design Tokens

> Sources: brand manual palette ("Aspectos técnicos") + production tokens in
> `consensus-salutis-website/src/styles/globals.css` and component usage.

## Brand palette (manual)

The brand manual defines six base tones:

| Name | HEX | RGB | Role |
|------|-----|-----|------|
| Deep Navy | `#002262` | 0, 34, 98 | Logo wordmark "CONSENSUS" (light), institutional anchor |
| Dark Teal | `#006D79` | 0, 109, 121 | Primary accent in **light** mode, isotipo fill |
| Turquoise | `#00BCBB` | 0, 188, 187 | Primary accent in **dark** mode, isotipo fill (dark) |
| White | `#FFFFFF` | 255, 255, 255 | Wordmark on dark, base surfaces |
| Lime Yellow | `#F6FF53` | 246, 255, 83 | Secondary/CTA accent in **dark** mode |
| Warm Yellow | `#FFD230` | 255, 210, 48 | Secondary/CTA accent in **light** mode |

## Website theme tokens (Tailwind v4 `@theme`)

This is the exact production token block. Reproduce it verbatim when generating
CSS for any Consensus Salutis web property:

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
| Primary hover / emphasis | `cyan-800` (Tailwind) / `#087a85` | `primary-dark-lighter` `#71fffe` |
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
| Deep band (`ThemeSection variant="deep"`, footer band) | `#deedf3` | `#030916` |
| Panel band (`variant="panel"`, vertical footer) | `#e8f2f7` | `#081827` |
| Card / glass surface | `bg-white/70`–`bg-white/90` | `bg-[#152230e6]/90` (also `bg-white/3`, `bg-[#081a2b]/82`) |
| Input fields | `bg-white/60` → focus `bg-white` | `bg-[#04111e]/68` → focus `bg-[#061a2a]` |
| Section gradients | `linear-gradient(135deg, rgba(222,237,243,.74–.82), rgba(237,246,249,.3–.42))` | `linear-gradient(135deg, rgba(3,9,22,.74–.82), rgba(8,24,39,.48))` |
| Route-transition overlay | `#deedf3` | `#030916` |

### Text

| Role | Light | Dark |
|------|-------|------|
| Headings (display) | `#05215e` (heading navy) | `slate-50` |
| Card/subsection headings | `#05215e` | `slate-100` |
| Primary body | `slate-700` | `slate-300` |
| Secondary body | `slate-600` | `slate-400` |
| Muted / meta | `slate-500` | `slate-500` |
| Errors (forms) | `rose-700` | `rose-300` |
| Success/status accent (chat "Entorno seguro") | `teal-700` | `teal-200` |

**Heading navy `#05215e`**: the implementation uses `#05215e` for headings (a
slightly cooler shade of the brand's `#002262`). Use `#05215e` in web UI to match
production; use `#002262` only in the logo and print/brand assets.

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
| Deep panel shadow | `shadow-2xl shadow-slate-900/10` (light) / `shadow-cyan-950/30` (dark) | Chat mock, contact form |

### Decorative gradient stops (motion/SVG layers)

The SignalField / ProductSignal blobs use this fixed story of stops:

- Cyan `rgb(8 145 178)` (light) / turquoise `rgb(0 188 187)` (dark)
- Teal `rgb(20 184 166)`
- Lime `rgb(246 255 83)` (light, low alpha) / sky `rgb(125 211 252)` (dark)

Grid-line color: `rgba(8,145,178,0.07–0.1)` light / `rgba(125,211,252,0.04–0.045)` dark.
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

### Yellow (contrast color)

Yellow (`secondary-light` `#ffd230` / `secondary-dark` `#f6ff53`) is the brand's
high-emphasis contrast accent. On the current website it only appears in the
header CTA (plus the subtle lime glow in decorative layers), but it is NOT
limited to that: use it wherever something must stand out against the
teal-turquoise story — key CTAs, highlighted values or keywords, active/attention
states, badges, chart emphasis.

Rules for yellow:

- It reads as contrast because it's scarce — use it for the few elements per
  screen that deserve maximum emphasis, not as a decorative fill.
- Text/icons on yellow fills are always near-black navy (`#06111f`).
- Pair by theme: `#ffd230` when light is active, `#f6ff53` when dark is active
  (`bg-secondary-light dark:bg-secondary-dark`) — never both in the same
  theme context.
- Don't use yellow for body text, borders, or large background areas.

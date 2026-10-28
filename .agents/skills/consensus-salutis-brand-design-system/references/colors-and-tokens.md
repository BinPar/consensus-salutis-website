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
| Lime Yellow | `#F6FF53` | 246, 255, 83 | Exceptional contrast in **dark** mode; website uses restricted below |
| Warm Yellow | `#FFD230` | 255, 210, 48 | Exceptional contrast in **light** mode; website uses restricted below |

## Website theme tokens (Tailwind v4 `@theme`)

This is the exact production token block. Reproduce it verbatim when generating
CSS for any Consensus Salutis web property:

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --breakpoint-3xl: 2000px;
  --color-primary-dark: #00BCBB;
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
| Primary hover / emphasis | `cyan-800` (Tailwind) / `#087a85` | `primary-dark` (hover `bg-primary-dark/85`) |
| Yellow (approved exceptions only) | `secondary-light` `#ffd230` | `secondary-dark` `#f6ff53` |
| Text on secondary CTA | `#06111f` | `#06111f` |
| Text on primary filled button | `#FFFFFF` | `#04111e` / `#03111d` (near-black navy) |

**Rule**: button text on turquoise or yellow fills is ALWAYS near-black navy
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
| Success/status accent (chat "Entorno seguro") | `teal-700` | `primary-dark` |

**Heading navy `#05215e`**: the implementation uses `#05215e` for headings (a
slightly cooler shade of the brand's `#002262`). Use `#05215e` in web UI to match
production; use `#002262` only in the logo and print/brand assets.

### Borders

Borders use translucent cyan in light mode and the primary dark token with opacity in dark mode:

| Weight | Light | Dark |
|--------|-------|------|
| Default | `border-cyan-800/10` | `border-primary-dark/10` |
| Card | `border-cyan-800/15`–`/20` | `border-primary-dark/15`–`/20` |
| Strong / active | `border-cyan-800/25`, `border-primary-light` | `border-primary-dark/25`, `border-primary-dark` |
| Hover | `border-primary-light/35`–`/45` | `border-primary-dark/45`–`/50` |

### Shadows & glows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-big-blocks` | see `@theme` above (soft teal-tinted double shadow) | Cards, CTAs, panels in light mode (also kept in dark) |
| Dark card glow | `shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-dark)_8%,transparent)]` | Metric/blog/success cards in dark mode |
| Dark CTA glow | `shadow-[0_0_34px_color-mix(in_srgb,var(--color-primary-dark)_26%,transparent)]` or `shadow-[0_0_24px_color-mix(in_srgb,var(--color-primary-dark)_18%,transparent)]` | Primary filled buttons in dark mode |
| Node glow | `shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-dark)_18%,transparent)]` | Process step circles (dark) |
| Progress glow | `shadow-[0_0_18px_color-mix(in_srgb,var(--color-primary-dark)_55%,transparent)]` | Horizontal progress bar |
| Deep panel shadow | `shadow-2xl shadow-slate-900/10` (light) / `shadow-cyan-950/30` (dark) | Chat mock, contact form |

### Decorative gradient stops (motion/SVG layers)

In light mode the SignalField / ProductSignal blobs use cyan, teal and
`var(--color-primary-light)` for their gradient stops. In dark mode every
primary decorative stop uses `var(--color-primary-dark)`; depth comes from
opacity. These layers contain no yellow. The generated blog cover exception
is separate from these page decorations.

Grid-line color: `rgba(8,145,178,0.07–0.1)` light; dark uses
`color-mix(in srgb, var(--color-primary-dark) 4.5%, transparent)`
(4% for the lower-opacity variant).
Radial glow: `radial-gradient(ellipse at 82% 24%,
color-mix(in srgb, var(--color-primary-light) 13%, transparent), transparent 38%)`;
dark mode uses `var(--color-primary-dark)` at `3.5%`.

## Extended usage of Tailwind palettes

Use Tailwind `slate` for neutral text and surfaces, `cyan` for light-mode
borders and hovers, and `rose` for errors. In dark mode primary accents,
borders, focus rings, status indicators and glows all derive from
`--color-primary-dark`; vary opacity, not hue. Pending states use
`--semaforo-mid`, mapped to `--color-primary-light` / `--color-primary-dark`.
Yellow tokens are reserved for the website exceptions below.

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
accent. Yellow is exceptional and follows the website restrictions below.

### Yellow (contrast color)

The BinPar identity manual (version 1.0, October 2026, pp. 17–18 and 21)
reserves yellow for exceptional priority attention and excludes it from routine
links, backgrounds, gradients and illustrations. The website owner confirmed
the following exact uses on 2026-10-28, including the blog and citation exceptions:

1. **Header/mobile meeting CTA:** “Solicitar reunión” in `site-header.tsx` and
   `mobile-navigation.tsx`. Use `bg-secondary-light dark:bg-secondary-dark`,
   with near-black navy text/icons (`#06111f`). Other meeting buttons within
   page content, report actions and platform access buttons use primary colors.
2. **Generated blog placeholders:** preserve the existing yellow/lime stop
   (`BLOG_COVER_LIME` in `src/lib/blog-cover.ts`) in `BlogCover` and shared
   cover renderings. This is a local exception for those generated illustrations;
   it does not authorize yellow in blog links, controls or page backgrounds.
3. **Quoted source text highlight:** preserve the yellow background in
   `clinical-evidence-scene.tsx` (light 55%, dark 25%, animated by `--highlight`)
   and `platform-preview/platform-preview.css` (`--pp-highlight`: light 55%,
   dark 32%). Keep the text color inherited. This exception applies to quoted
   evidence, not arbitrary keywords, headings or status highlights.

Use teal `#006d79` / turquoise `#00BCBB` for all other links, CTAs, badges,
status accents and decorative gradients, or the appropriate neutral/error
color. Do not introduce yellow through Tailwind yellow/amber/lime palettes
or equivalent literal colors outside the three approved uses. These website
exceptions do not broaden the manual's rules for other brand materials.

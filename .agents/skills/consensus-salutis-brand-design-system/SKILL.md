---
name: consensus-salutis-brand-design-system
description: >
  Consensus Salutis brand design system reference and enforcement guide. Provides color palettes,
  typography rules, logo usage, light/dark theming, UI component specs, the signature signal-field
  motion system, and landing/blog page patterns. Use when creating, reviewing, or modifying any
  visual design, UI, marketing material, presentation, email, social media asset, or web/app
  interface that must conform to the Consensus Salutis brand identity. Also use when generating
  CSS, design tokens, or component configurations for Consensus Salutis.
---

# Consensus Salutis Brand Design System

## Brand Identity Overview

**Consensus Salutis — institutional medical AI.** A platform that turns clinical
guidelines, protocols and medical corpus into traceable, auditable answers for
healthcare professionals (a BinPar initiative with Editorial Médica Panamericana
and AWS). The brand voice is serious, institutional and evidence-driven; the
visual language is **calm ice-blue light mode / deep-navy dark mode**, with a
teal→turquoise accent, geometric type, glass cards and slow organic "signal"
motion that evokes knowledge flowing from question to evidence.

The logo fuses the initials C and S into a continuous stroke inside two
hexagons — a node-to-node journey from clinical question to evidence-backed
answer (see `references/logo-usage.md` for the full philosophy).

> Sources of truth: the brand manual PDF (logo, philosophy, base palette,
> Plus Jakarta Sans) and the production implementation in
> **consensus-salutis-website** (`src/styles/globals.css`, `src/app/layout.tsx`,
> `src/app/_components/`). Code wins for implementation detail; the manual wins
> for logo/brand rules. **The definitive home layout is the VERTICAL one**
> (`VerticalHome`) — the horizontal rail is legacy.

---

## Quick Reference: Design Tokens

### Colors (core)

```json
{
  "deep-navy":            "#002262",
  "heading-navy":         "#05215e",
  "primary-light":        "#006d79",
  "primary-dark":         "#00BCBB",
  "primary-dark-lighter": "#71fffe",
  "secondary-light":      "#ffd230",
  "secondary-dark":       "#f6ff53",
  "bg-light":             "#f4f9fc",
  "bg-light-home":        "#fbfdff",
  "band-light-deep":      "#deedf3",
  "band-light-panel":     "#e8f2f7",
  "bg-dark":              "#06111f",
  "bg-dark-deep":         "#030916",
  "band-dark-panel":      "#081827",
  "card-dark":            "#152230e6"
}
```

`primary-light`/`secondary-light` = accent **when the light theme is active**
(teal `#006d79` / warm yellow `#ffd230`); `primary-dark`/`secondary-dark` = the
dark-theme counterparts (turquoise `#00BCBB` / lime `#f6ff53`). Text and borders
lean on Tailwind `slate` + translucent `cyan`.

### Typography Hierarchy

| Level | Font | Classes |
|-------|------|---------|
| Eyebrow | Sora | `font-display text-xs font-bold tracking-[0.22em] uppercase` in accent |
| H1 hero | Sora | `font-display text-4xl–6xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50` |
| H2 section | Sora | `font-display text-3xl–5xl font-extrabold tracking-tight` |
| Card title | Sora | `font-display text-base–lg font-semibold` |
| Lede | Plus Jakarta Sans | `font-body text-lg leading-8 text-slate-600 dark:text-slate-400` |
| Body / card | Plus Jakarta Sans | `font-body text-sm–base leading-6–7` |
| Micro-label | Plus Jakarta Sans | `text-[10px]–xs font-semibold tracking-[0.12–0.18em] uppercase` in accent |

Fonts load via `next/font/google` (`--font-sora`, `--font-plus-jakarta-sans`);
`font-sans` defaults to Plus Jakarta Sans. The brand manual's logotype face is
Plus Jakarta Sans ExtraBold.

### Surfaces, Radius & Motion

- Cards: `rounded-2xl` glass (`bg-white/80 backdrop-blur-xs shadow-big-blocks` /
  dark `bg-[#152230e6]/90` + cyan glow); deep panels `rounded-3xl`; pills/CTAs
  `rounded-full`; fields `rounded-lg`.
- Borders: translucent cyan (`border-cyan-800/10–25` light,
  `border-cyan-300/10–25` dark) — never opaque gray.
- Motion: background blobs morph 10–32s linear; content fades 0.18–0.42s
  ease-out; hovers lift (`-translate-y-0.5/-2`, 150ms). Everything honors
  `prefers-reduced-motion`.

---

## Workflow: Applying the Brand

### By task type:

**Web UI / App Interface**
1. Set up theme tokens + `dark` class switching → `references/colors-and-tokens.md`, `references/light-dark-mode.md`
2. Configure Sora + Plus Jakarta Sans via next/font → `references/typography.md`
3. Add background layers (grid + SignalField) → `references/motion-system.md`
4. Build with the button/card/form recipes → `references/ui-components.md`
5. Place theme-paired logos → `references/logo-usage.md`

**Landing / Marketing Page**
1. Follow the vertical home structure (hero + chat mock → casos → proceso →
   producto → métricas → blog → contacto) → `references/landing-patterns.md`
2. Alternate white/gradient band section backgrounds; reveal cadence
   0 / 0.1 / 0.2 / 0.3 → `references/motion-system.md`
3. CTAs: teal primary + ghost pair in-page; yellow pill as the contrast CTA
   (header on the website — elsewhere, the one element that must pop)

**Blog / Content**
1. Card, index and article layouts → `references/blog-patterns.md`
2. MDX body typography recipe → `references/typography.md`

**Marketing Asset (Social, Banner, Presentation)**
1. Pick a theme: ice-light (`#f4f9fc` bg, navy headings, teal accent) or
   deep-navy dark (`#06111f`, white headings, turquoise accent)
2. Logo variant must match the background → `references/logo-usage.md`
3. Headlines in Sora ExtraBold (or Plus Jakarta Sans ExtraBold for pure brand
   assets); one accent story: teal/turquoise, with yellow as the contrast
   highlight where emphasis is needed
4. Optional texture: the 44px grid + an organic blob shape at low alpha

**Design Token / CSS Generation**
1. Output the `@theme` block from `references/colors-and-tokens.md` verbatim
   (Tailwind v4 + `@custom-variant dark`)
2. Include `.font-body`/`.font-display` utilities and `--shadow-big-blocks`
3. Include the theme-boot script + `theme-changing` CSS from
   `references/light-dark-mode.md`

**Brand Compliance Review**
1. Run the checklist below
2. Cross-reference each area against its reference file

---

## Core Rules Summary

### Color
- One accent story: teal `#006d79` (light) / turquoise `#00BCBB` (dark) for
  links, eyebrows, numbers, fills, focus. Hover shifts: `cyan-800` / `#71fffe`.
- Yellow (`#ffd230` light / `#f6ff53` dark) is the **contrast color**: use it
  for the few elements that must stand out against the teal story (key CTAs,
  highlights, attention states, badges). On the website it currently appears
  only in the header CTA, but it is not limited to that — just keep it scarce
  so it keeps reading as contrast; never body text, borders, or large fills.
- Text on turquoise/yellow fills is near-black navy (`#03111d`–`#06111f`);
  white text only on light-mode teal `#006d79`.
- Headings `#05215e` (web) — the manual's `#002262` stays in the logo/print.
- Borders are translucent cyan; surfaces are translucent white/navy glass.
- Only rose (errors) and teal (status) beyond the brand hues; never new colors.

### Typography
- Sora extrabold for headings/eyebrows/numbers; Plus Jakarta Sans for
  everything else. Never Sora for paragraphs.
- Eyebrows/micro-labels: UPPERCASE, wide tracking, accent color. Buttons:
  sentence case, `font-semibold text-sm`.
- Copy is Spanish, institutional and sober ("trazable", "gobernado",
  "evidencia") — no hype.

### Logo
- `consensus-light.svg` (navy+teal) on light; `consensus-dark.svg`
  (white+turquoise) on dark; isotipo alone for small/square spaces.
- Render both variants with `dark:hidden`/`dark:block` — never a single fixed
  file in themed UI. Never distort, partially recolor, or restyle.
- Partner logos in dark mode: `dark:brightness-0 dark:invert` or a dedicated
  white variant.

### Theming
- Both themes always; light default; `dark` class on `<html>` +
  `consensus-theme` localStorage + no-flash boot script + 180ms
  `theme-changing` transition.
- Every component ships paired `x dark:y` classes from day one.

### Surfaces & Motion
- Glass cards over a 44px grid background with SignalField blobs behind
  (`[clip-path:inset(0)]` + fixed layer trick).
- Background morphs slow/linear; content reveals are opacity-only fades with
  0.1s stagger steps; hovers lift. `prefers-reduced-motion` renders final
  states — no exceptions.
- Decorative layers: `aria-hidden`, `pointer-events-none`, `z-0`; content `z-10`.

---

## Light/Dark Quick Reference

| Element | Light | Dark |
|---------|-------|------|
| Page bg | `#f4f9fc` / home `#fbfdff` | `#06111f` |
| Bands | `#deedf3` · `#e8f2f7` | `#030916` · `#081827` |
| Card | `bg-white/80` + `shadow-big-blocks` | `bg-[#152230e6]/90` + cyan glow |
| Heading | `#05215e` | `slate-50` |
| Body | `slate-600/700` | `slate-400/300` |
| Border | `cyan-800/10–25` | `cyan-300/10–25` |
| Accent | `#006d79` | `#00BCBB` (hover `#71fffe`) |
| Primary btn text | white | `#03111d` |
| Yellow contrast accent | `#ffd230` + `#06111f` text | `#f6ff53` + `#06111f` text |
| Logo | `consensus-light.svg` | `consensus-dark.svg` |

→ Full details in `references/light-dark-mode.md`

---

## Asset Inventory

### Logos (4 files)
```
assets/logos/
  consensus-light.svg           # full logo, light bg (#002262 + #006d79), 617.92×87.94
  consensus-dark.svg            # full logo, dark bg (#fff + #00bcbb)
  consensus-isotipo-light.svg   # symbol alone, teal #006d79, 92.8×92.8
  consensus-isotipo-dark.svg    # symbol alone, turquoise #00bcbb, 92.8×92.8
```
On the website: `public/logos/consensus-brand/`.

### Favicon (2 files)
```
assets/favicon/favicon.svg      # isotipo on teal rounded square — icon sizes="any"
assets/favicon/favicon.ico      # raster fallback
```
These are the canonical favicon assets. **Always use these exact files** for any
Consensus Salutis web property.

### Fonts
No binaries needed: **Sora** and **Plus Jakarta Sans** load via
`next/font/google` (both SIL OFL). See `references/typography.md`.

---

## Brand Compliance Checklist

When reviewing or producing any Consensus Salutis artifact, verify:

- [ ] **Themes**: both light and dark styled? `dark:` pairs on every colored class?
- [ ] **Accent discipline**: teal/turquoise as the primary accent? Yellow used sparingly as contrast (high-emphasis elements only)?
- [ ] **Text on fills**: near-black navy on turquoise/yellow — never white in dark mode?
- [ ] **Headings**: Sora `font-extrabold tracking-tight` in `#05215e`/`slate-50`?
- [ ] **Eyebrow present** above every H1/H2, uppercase, `tracking-[0.22em]`, accent color?
- [ ] **Body**: Plus Jakarta Sans, `slate-600/700` (light) / `slate-300/400` (dark)?
- [ ] **Borders**: translucent cyan (not gray)? Radius scale (full/3xl/2xl/xl/lg/md)?
- [ ] **Cards**: glass fill + `backdrop-blur` + `shadow-big-blocks` (light) / cyan glow (dark)?
- [ ] **Logo**: correct variant per theme? Both variants rendered with `dark:hidden`/`dark:block`? Proportions intact?
- [ ] **Partner logos**: inverted or white-variant in dark mode?
- [ ] **Motion**: background linear+slow, foreground fade-only, staggered in reading order?
- [ ] **Reduced motion**: final states rendered, durations zeroed?
- [ ] **Icons**: lucide, `strokeWidth 1.8`, `aria-hidden`?
- [ ] **Landing**: vertical home structure? (NOT the horizontal rail)
- [ ] **Copy**: Spanish, institutional, evidence-led? CTAs sentence case?
- [ ] **Favicon**: canonical `favicon.svg` referenced with `sizes="any"`?

---

## Reference Files Index

| File | Topic | Read when... |
|------|-------|-------------|
| `references/colors-and-tokens.md` | Full palette, `@theme` block, semantic maps, shadows, radius | Setting up colors, generating tokens |
| `references/typography.md` | Sora/PJS setup, hierarchy, rules, MDX article recipe | Configuring or reviewing text styling |
| `references/logo-usage.md` | Logo philosophy, variants, favicon, partner logos | Placing logos, choosing versions |
| `references/light-dark-mode.md` | Theme architecture, toggle, boot script, token mapping | Implementing theming |
| `references/ui-components.md` | Buttons, cards, header/footers, forms, pagination, chat mock | Building UI components |
| `references/motion-system.md` | Grid bg, SignalField, blobs, reveals, counters, micro-interactions | Adding motion, page shells |
| `references/landing-patterns.md` | Vertical home structure, panels, section rhythm, content blocks | Building landing/marketing pages |
| `references/blog-patterns.md` | Article model, cards, index, article page | Building blog/content surfaces |

---

## Examples

### Example 1: New section on the landing

**Request**: "Add a security section to the Consensus Salutis home"

**Expected behavior**: A `VerticalPanel`-style section in the vertical home
flow: alternating background (white or `deedf3→edf6f9` gradient band with dark
equivalents), `max-w-7xl` container, Eyebrow ("Seguridad") → Sora H2
`text-5xl font-extrabold text-[#05215e] dark:text-slate-50` → lede → glass
cards (`rounded-2xl border-cyan-800/15 bg-white/80 shadow-big-blocks` + dark
glow variants). Reveals: 0/0.1/0.2 fade cadence, cards staggered ~0.18s,
reduced-motion safe.

### Example 2: CSS tokens

**Request**: "Generate the CSS variables for Consensus Salutis"

**Expected behavior**: Output the Tailwind v4 `@theme` block from
`references/colors-and-tokens.md` verbatim (`--color-primary-*`,
`--color-secondary-*`, fonts, `--shadow-big-blocks`, `--breakpoint-3xl`) plus
`@custom-variant dark`, the `.font-body`/`.font-display` utilities, and the
theme-boot script + `theme-changing` transition CSS.

### Example 3: Social media banner

**Request**: "Design a LinkedIn banner for Consensus Salutis"

**Expected behavior**: Deep navy `#06111f` (or ice `#f4f9fc`) background with
the subtle 44px grid and one low-alpha organic blob (turquoise→teal gradient).
`consensus-dark.svg` (or `-light`) at native proportions. Headline in
Sora/PJS ExtraBold, white (or `#05215e`), with one key phrase in the accent —
or in yellow if it needs maximum contrast. Institutional Spanish copy.

### Example 4: Dashboard in the platform

**Request**: "Create a metrics dashboard screen"

**Expected behavior**: Body `bg-[#f4f9fc] dark:bg-[#06111f]` + grid background.
Metric cards per `ui-components.md` (glass, `rounded-2xl`, `font-display`
values in `text-cyan-800 dark:text-primary-dark-lighter`, count-up on load).
Eyebrow + H2 header block. Fixed header with theme toggle and yellow CTA.
Forms/fields with the teal focus ring recipe.

---

## Source Traceability

| Skill section | Source |
|---------------|--------|
| Brand palette, logo philosophy, logotype face | Brand manual PDF (Proceso creativo, Filosofía, Aspectos técnicos) |
| Theme tokens, fonts, shadows | `src/styles/globals.css`, `src/app/layout.tsx` |
| Theme switching | `layout.tsx` boot script, `theme-toggle.tsx`, `globals.css` |
| Buttons, cards, shells, hero | `site.tsx`, `site-header.tsx`, `site-footer.tsx` |
| Motion system | `motion-system.tsx`, `product-signal-left.tsx` |
| Landing patterns | `horizontal-home.tsx` (VerticalHome = canonical), `page.tsx` |
| Chat mock | `clinical-chat-mock.tsx` |
| Forms | `contact-form.tsx` |
| Blog | `blog/page.tsx`, `blog/[slug]/page.tsx`, `blog-article-card.tsx`, `blog-articles.ts` |
| Logos & favicon | `public/logos/consensus-brand/`, `public/favicon.svg` |

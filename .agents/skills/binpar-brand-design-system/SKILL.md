---
name: binpar-brand-design-system
description: >
  BinPar visual identity (manual v1.0, Oct 2026): logo and app tile, teal/navy palette with
  light and dark themes, Sora + Plus Jakarta Sans, the 44px technical grid, isometric planes,
  surfaces, animated flaps, pill components, motion and chart rules, with ready-to-use CSS
  tokens, fonts, logos, icons and an HTML starter. Use for anything BinPar that people will
  see: websites, artifacts, dashboards, prototypes, PDFs and documents, decks, social images,
  emails, product UI, and for reviewing brand compliance or generating CSS/Tailwind tokens.
  BinPar is a single-product company (institutional medical AI, formerly Consensus Salutis),
  so this covers both company and product. For wording use binpar-brand-voice; for branded
  PDFs use binpar-documents.
---

# BinPar brand design system

BinPar builds institutional medical AI: a platform that turns clinical guidelines,
protocols and medical corpus into traceable answers. Company and product share one brand.
The identity rests on one idea, **the binary pair**: two elements that work on their own
but reach their meaning as one system — *tecnología y salud*.

The look: calm ice-blue light theme and deep night-blue dark theme, teal → turquoise as
the one primary color, navy for weight, yellow only as an alarm. Geometric Sora headlines
in two tones, open Plus Jakarta Sans text, a faint 44 px engineering grid, thin isometric
planes, translucent cards with cyan hairlines, slow organic veils at the edges, brief
motion. Sober, precise, never flashy.

> Source of truth: *BinPar · Manual de identidad v1.0* (October 2026). Production code
> (website and platform) is the reference for implementation details only (`references/web/`);
> where it deviates from the manual, the manual wins.

## Non-negotiables

1. **Logo**: only the official files in `assets/logos/`, light version on light surfaces,
   dark version on dark ones. Clear space X (≈ 0.34 × logo height) on all sides, min 24 px
   high. Never recolor, distort, rotate, add effects or put it on a colored background.
2. **Surfaces are light (`#F4F9FC` / white) or night blue (`#06111F`)**. Navy and teal
   color elements, never backgrounds.
3. **Yellow is exceptional**: at most one yellow element per composition, only for the
   decisive action or an unmissable warning. Never links, fills, gradients or decoration.
4. **Two families only**: Sora for headlines/eyebrows/titles, Plus Jakarta Sans for all
   reading text and UI. Never Sora in paragraphs, never headlines in caps or in Jakarta.
5. **Text block order**: eyebrow → headline (one or two tones: navy + teal / Slate 50 +
   turquoise, never three) → lede.
6. **Neutrals are slate only**; borders are cyan at low opacity; shadows are soft teal
   (light) or a faint cyan halo (dark). No grey/black/hard shadows.
7. **Pills** for buttons and tags. **Lucide** icons, stroke 1.8, 16 px.
8. **Grid always fades** (mask). Flaps are translucent background veils, never in front.
9. **Motion** 90–300 ms, standard curve, no bounce; respect reduced motion.
10. **Never mix theme values**: each color has one value per theme (teal↔turquoise,
    `#FFD230`↔`#F6FF53`, navy↔Slate 50).

## Tokens at a glance

| Role | Light | Dark |
|---|---|---|
| Background | `#F4F9FC` | `#06111F` |
| Card | white @ 80 %, border `rgb(0 95 120 / 15%)`, teal shadow | `#152230` @ 90 %, border `rgb(83 234 253 / 20%)`, cyan halo |
| Headline / headline 2nd tone | Navy `#05215E` / Teal `#006D79` | Slate 50 `#F8FAFC` / Turquoise `#00BCBB` |
| Body / emphasis / secondary | `#45556C` / `#0F172B` / `#62748E` | `#90A1B9` / `#F1F5F9` / `#90A1B9` |
| Primary action (text on it) | `#006D79` (white) | `#00BCBB` (`#04111E`) |
| Accent, exceptional (text on it) | `#FFD230` (`#06111F`) | `#F6FF53` (`#06111F`) |
| Grid line (44 px) | `#0891B2` @ 10 % | turquoise @ 4.5 % |

Radii: field 8, card 16, panel 24, tile 28, buttons/tags pill. Max reading measure 576 px.
Type scale: cover 54/60, headline 48/52 (Sora 800, −0.025 em), component title 18/28 (Sora 600),
eyebrow 12/16 (Sora 700, 0.22 em, caps), lede 18/32, body 16/28, secondary 14/24, button 14/20.

## Assets

| Path | What |
|---|---|
| `assets/css/tokens.css` | All tokens as CSS variables, light default, `.dark` / `[data-theme=dark]` / `.bp-auto` |
| `assets/css/components.css` | `.bp-page`, `.bp-grid`, `.bp-eyebrow`, `.bp-display/h1/h2/h3`, `.bp-accent`, `.bp-lede`, `.bp-card`, `.bp-field`, `.bp-btn--*`, `.bp-tag--*`, `.bp-kpi`, `.bp-chart`, `.bp-tile`, logo pairing |
| `assets/css/fonts.css` + `assets/fonts/` | Local variable TTFs (Sora, Plus Jakarta Sans + italic), OFL |
| `assets/css/tailwind-theme.css` | Tailwind v4 `@theme`, compatible with the website's class names |
| `assets/logos/*.svg`, `assets/logos/png/` | Official horizontal, vertical and isotype, light/dark |
| `assets/icons/` | App tiles (SVG/PNG), favicon SVG/ICO, apple-touch-icon, maskable icon |
| `assets/shapes/` | Animated flaps, large/small, light/dark |
| `assets/templates/starter.html` | Reference page using everything above, both themes |

Fonts for the web: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap`.

## Workflow

1. Identify the medium and read the matching recipe in `references/media.md`.
2. Use the assets and tokens; don't re-derive colors, sizes or logos from memory.
3. Write copy with `binpar-brand-voice` (Spanish, es-ES, by default).
4. Render and look at the result (screenshot / page render) in every theme it supports.
5. Run the review checklist below before delivering.

## Review checklist

- [ ] Correct logo file for the surface; clear space respected; ≥ 24 px; untouched.
- [ ] Only light or night-blue surfaces; no navy/teal/yellow backgrounds.
- [ ] Yellow used at most once, on the decisive element (or not at all).
- [ ] Only Sora + Plus Jakarta Sans, in their roles; no caps headlines; ≤ 2 tones.
- [ ] Eyebrow → headline → lede order in every text block.
- [ ] Slate text, cyan hairline borders, soft teal shadow / cyan halo.
- [ ] Pills, Lucide 1.8, grid faded, flaps behind content.
- [ ] Theme values not mixed; dark theme (if any) uses turquoise/Slate 50/`#F6FF53`.
- [ ] Contrast: no small text in Slate 500 on light; tabular figures in data.
- [ ] Charts: one protagonist, dashed faint grid, no ticks, Spanish number format.

## References

| File | Read when |
|---|---|
| `references/logo.md` | Placing the logo, tile, favicon, co-branding, min sizes |
| `references/color.md` | Palette, themes, neutrals, accent rules, contrast, semantic tokens |
| `references/typography.md` | Families, scale, composition, print/slide sizes |
| `references/graphic-language.md` | Grid, isometric planes, icons, surfaces, flaps, components, motion |
| `references/charts.md` | Any chart, KPI or data visualization |
| `references/media.md` | Artifact, PDF, deck, docx, social, email, product UI, imagery |
| `references/web/` | Editing the BinPar website or platform code (Tailwind recipes, motion system, landing, blog) |

## Maintenance

Assets derived from the official SVGs (tiles, favicons, PNGs, flaps) are generated by
`tools/build-brand-assets.mjs` in the BinPar/skills repo, which also syncs fonts, logos and
tokens into `binpar-documents`. Edit the sources, rerun the script, never hand-edit outputs.

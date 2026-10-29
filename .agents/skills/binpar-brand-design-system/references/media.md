# Recipes by medium

The same system everywhere; only the format changes. Copy and wording: `binpar-brand-voice`.

## Artifacts, single-file HTML, prototypes, dashboards

1. Start from `assets/templates/starter.html`.
2. Inline `assets/css/tokens.css` then `assets/css/components.css` in one `<style>`; keep the
   Google Fonts `<link>`. Inline the logo SVG (or the isotype) rather than linking files.
3. Body: `class="bp-page bp-grid"`. Light theme by default; support dark with a `.dark`
   class on `<html>` (and/or `bp-auto` to follow the OS).
4. Build every block as eyebrow → headline (two tones optional) → lede; content in cards.
5. Icons: Lucide stroke 1.8. Charts: `charts.md`.
6. Flaps are optional atmosphere for landing-like pages, not for dashboards or dense tools.
7. Check both themes and a 375 px width before shipping.

If the host has its own design-system mechanism (e.g. an artifact "Design System"), feed it
these tokens instead of inventing values.

## PDF documents

Use the `binpar-documents` skill (Markdown → branded A4 PDF; free HTML pages too). Print
rules: light theme for body pages; dark allowed on covers and back covers; grid only on
covers/openers; no flaps in print.

## Presentations / decks (16:9)

Build as HTML (artifact or slides type) with 1920 × 1080 slides:
- Cover: dark (`#06111F`) with faded grid, vertical or horizontal dark logo, eyebrow,
  two-tone headline (Slate 50 + turquoise), date/version as eyebrow at the bottom.
- Content slides: light (`#F4F9FC`), eyebrow + two-tone headline top-left, content right or
  below, footer with isotype + "BinPar · <deck title>" left and section + page number right
  (Sora Bold eyebrow style), the pattern of the identity manual itself.
- One idea per slide; big figures in `.bp-kpi` style; charts per `charts.md`.
- Section dividers: dark, large number (`01`), headline.
- Headline 72–96 px, body 28–32 px, eyebrow 18–20 px. Margins ≥ 120 px.
For .pptx (only if explicitly requested): same structure; embed or require the TTFs in
`assets/fonts/`, logos from `assets/logos/png/`.

## Word (.docx), only if explicitly requested

Styles: Title/Heading = Sora ExtraBold navy (H2 can carry teal), body Plus Jakarta Sans
10.5 pt slate-600 `#45556C`, line spacing 1.5, tables with teal header text and cyan
hairlines (`#D3E6EC`), logo PNG in the header (≥ 8 mm high). Embed fonts.

## Social and Open Graph images

- OG 1200 × 630, LinkedIn post 1200 × 1200 or 1080 × 1350, banner 1584 × 396.
- Dark (`#06111F`) or light (`#F4F9FC`) surface, faded grid, one flap peeking from an edge.
- Logo at a corner with X clear space; vertical logo for square/vertical formats.
- Eyebrow + two-tone Sora ExtraBold headline. Max ~8 words. No yellow unless it is the
  single attention element. No stock photos of doctors with tablets.
- Avatars and profile pictures: the app tile (`assets/icons/app-tile-*.svg`).

## Email (HTML) and signatures

- Max width 600 px, white body on `#F4F9FC`, Plus Jakarta Sans with
  `Arial, Helvetica, sans-serif` fallback (web fonts don't load in many clients).
- Header: logo PNG (`assets/logos/png/binpar-logo-light.png`, displayed 24–28 px high).
- Buttons: pill (`border-radius: 999px`) teal with white text; one per email.
- Signature: name (Jakarta SemiBold, navy) · role (slate-500) · `binpar.com`; isotype PNG
  24 px optional. No banners, no quotes, no taglines.

## Product UI

The platform's own component library is the source; follow `graphic-language.md`
(components, surfaces, motion) and, inside the BinPar codebases, `web/`.

## Imagery

The brand is built with type, grid, geometry and data. Avoid stock photography, AI
"futuristic medicine" imagery, 3D brains, robots, glowing circuits, blue-holograms.
If a picture is necessary (case study, team), use real, sober photography with natural
light and give it a 16 px radius card frame.

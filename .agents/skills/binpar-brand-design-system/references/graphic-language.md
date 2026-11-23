# Graphic language

Source: identity manual v1.0, chapter 04 (pp. 29–36, 40). Charts: `charts.md`.

## Grid (the technical background)

Square grid of **44 × 44 px** cells, **1 px** lines, like engineering graph paper. It
orders the composition without being noticed.

| Spec | Light | Dark |
|---|---|---|
| Line color | `#0891B2` @ 10 % | Turquoise @ 4.5 % |
| Fade | Radial or linear mask | same |

Never at uniform intensity over the whole screen: it fades with a mask to accompany the
main content and disappear towards the edges. CSS: `.bp-grid` (radial) and
`.bp-grid--linear`. In print, keep it to covers and section openers, very faint.

## Geometry: planes in perspective

Born from the isotype (surfaces that change plane without breaking). On the web: square
plates stacked in perspective, representing the product's layers; each plate is a
capability and together they form one system.

| Spec | Value |
|---|---|
| Projection | 45° rotation, 20.8° elevation |
| Plates | Three layers with thickness and an inner grid |
| Stroke | Primary color @ 27 %; active plate @ 65 % |
| Faces | Primary @ 3.5 % and @ 14 % |
| Guides | Dashed, @ 23 %, connecting layers |
| Labels | Sora Bold eyebrow style (`BINPAR / SISTEMA INTEGRADO`), numbers `01 02 03` |

CSS: `transform: rotateX(69.2deg) rotateZ(45deg)` on a square (90° − 20.8° = 69.2°),
stacked with `translateZ`; or draw the isometric rhombus in SVG. Use for architecture,
"layers of the product", capability stacks. Thin lines, translucent fills, no shading.

## Iconography

**Lucide** (lucide.dev) only: linear, geometric, rounded ends, 24 px grid.

| Spec | Value |
|---|---|
| Grid | 24 × 24, safe area 20 |
| Stroke | **1.8** |
| Sizes | 16 px usual; 14 and 20 px |
| Color | The color of the text they accompany |

Mostly next to UI actions and states (search, expand, attach, confirm). No filled icons,
no other sets, no thick strokes. The isotype is never an icon. CDN for artifacts:
`https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js` (then `lucide.createIcons({attrs:{'stroke-width':1.8}})`), or copy the SVG.

## Surfaces and elevation

Interfaces are built in layers: background → cards group content → fields collect input.
Each layer is a bit lighter/more opaque than the previous; all share the thin cyan border.

| Layer | Light | Dark |
|---|---|---|
| Background | `#F4F9FC` | `#06111F` |
| Card | white @ 80 %, border cyan-800 @ 15 %, brand shadow | `#152230` @ 90 %, border cyan-300 @ 20 %, cyan halo |
| Field | white @ 60 %, border cyan-800 @ 15 % | `#04111E` @ 68 %, border cyan-300 @ 12 % |

Radii: card 16 px, field 8 px; on the web also 24 and 28 px. Light blur behind cards and
panels. CSS: `.bp-card`, `.bp-panel`, `.bp-field`.

## Flaps (formas animadas)

Organic shapes that peek in from the edges (home, blog, contact, platform tour): a large
one enters from the right; a smaller one, rotated 20°, peeks from the bottom-left corner.

| Spec | Value |
|---|---|
| Fill | Background color with a veil of `#0891B2` (dark: turquoise). Cyan/teal only |
| Depth | A second flap displaced behind, more transparent |
| Motion | Continuous linear morph, 15 s (large) and 10 s (small), no pause |
| Reduced motion | Static in their first shape |

Files: `assets/shapes/flap-{large,small}-{light,dark}.svg` (SMIL-animated, self-contained).
Place them `position: fixed; z-index: -1; pointer-events: none` partly off-canvas (see
`assets/templates/starter.html`). For reduced motion, inline the SVG and call
`svg.pauseAnimations()` when `matchMedia('(prefers-reduced-motion: reduce)')` matches.
They are a background veil: **never opaque, never in front of content.**

## Components

Platform components live in its own library; the web follows the same forms.

- **Buttons and tags are pills**, text in Jakarta SemiBold, optional 16 px icon (stroke 1.8).
- Variants: **Principal** (the expected action) · **Secundario** and **Contorno** (accompany) ·
  **Fantasma** and **Enlace** (minor actions) · **Contraste** (yellow: the one element that
  truly must stand out).
- Heights 32 / 40 / 44 px. Hover: primary darkens and lifts 2 px. Focus: 2 px outline,
  2 px offset, primary color. Disabled: 50 % opacity (fields 60 %).
- Tags: Marca (teal soft), Neutra (outline), Error (rose), Contraste (yellow).
- CSS: `.bp-btn--{primary,secondary,outline,ghost,link,contrast}`, `.bp-btn--{sm,lg}`,
  `.bp-tag--{brand,error,contrast}`.

## Motion

Brief and discreet: it accompanies interaction, confirms an action or presents content,
never steals attention from what the person is reading.

| Use | Duration | Curve |
|---|---|---|
| Base (buttons, switches, dropdowns) | 150 ms | standard `cubic-bezier(0.4, 0, 0.2, 1)` |
| UI range | 90–300 ms | standard / out `(0, 0, 0.2, 1)` |
| Larger size/position changes | 220–300 ms | emphasized out `(0.22, 1, 0.36, 1)` |
| Content entrance | fade 360 ms | out |
| Flaps loops | 10 s / 15 s | linear |
| Reduced motion | no transitions: everything already in place | — |

Never bounce, never elastic, never > 300 ms in UI. Identity motion (isotype trace reveal
and loader): `web/motion-system.md` → Brand mark motion.

## Never (p.40)

Grid without fade · other icon sets, filled or thick icons · hard/grey/dark shadows ·
square corners on buttons and tags · flaps opaque or in front of content · flashy motion
(long, elastic, bouncing).

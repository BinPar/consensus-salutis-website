# Motion System

> Source: `src/app/_components/motion-system.tsx`, `product-signal-left.tsx`,
> `horizontal-home.tsx` (ProductSignalAccent, counters), framer-motion based.

Motion is calm, slow and organic: long linear morphs in the background, short
opacity fades in the foreground. Nothing bounces; almost nothing translates.

## Global config

- `MotionProvider` wraps the app with
  `<MotionConfig reducedMotion="user" transition={{ ease: "easeOut" }}>`.
- **Every** decorative animation checks `useReducedMotion()` and renders the
  final state statically when reduced motion is on. This is non-negotiable.

## Route transitions

- On internal link click (same origin, different path, no modifier keys):
  a full-screen overlay `bg-[#deedf3] dark:bg-[#030916]` fades in
  (0.18s easeInOut), navigation fires after a 180ms timeout, overlay fades out
  on the new route.
- `RouteEntrance`: new page content fades in from opacity 0 over **0.22s**.

## Background layers (back to front)

1. **HomeMotionBackground** — fixed, `z-0`: solid `bg-white dark:bg-[#06111f]`
   + a static square grid of 1px lines, `44px` cell:
   `linear-gradient(rgba(8,145,178,0.1) 1px, transparent 1px)` both axes
   (dark: `rgba(125,211,252,0.045)`). Page heroes use a 40px variant at
   `0.07` alpha.
2. **SignalField** — the signature layer: three flowing gradient "signal" lines
   plus two nested organic blobs that morph continuously.
3. **ProductSignalLeft / ProductSignalAccent** — smaller morphing blob clusters
   anchored off-canvas (e.g. `fixed -bottom-80 -left-155 w-250 rotate-20`) to
   frame heroes, contact and blog pages.

## SignalField spec

- SVG `viewBox="0 0 1440 900"`, `preserveAspectRatio="xMidYMid slice"`,
  absolute inset-0; color root `text-cyan-700/42 dark:text-primary-dark`.
- **Signal lines**: 3 fixed cubic paths flowing left→right, stroked with a
  `currentColor` gradient that fades in-out (stops at 0/0.24/0.5/0.78/1,
  opacity 0→0.8→0.28→0.72→0), widths 3 / 2 / 1.8.
- **Blobs**: `motion.path` elements whose `d` cycles through 7 keyframe paths
  (closed loop) with `type: "tween"`, `ease: "linear"`, `repeat: Infinity`.
  Keyframe times are distance-weighted (`getMorphTimes`) so speed is uniform.
  A second blob copy runs shifted by one keyframe (`shiftMorphPaths`) at
  1.06× duration, offset `translate(-24 60)`; an inner stroke-only path runs at
  1.25× duration.
- The first blob is filled with the page background color (`fill-[#eff8fa]
  dark:fill-[#06111f]`) to "punch a hole" in the lines; gradient-filled and
  stroked copies layer on top (opacities 0.45/0.35/0.62/0.44).
- Fill gradient stops: `rgb(8 145 178)` 0.24 → `rgb(20 184 166)` 0.11 →
  `rgb(246 255 83)` 0.16 (dark overrides alphas to 0.16/0.10/0.04 via
  `dark:[stop-opacity:…]`).
- Lime radial glow overlay: `radial-gradient(ellipse at 82% 24%,
  rgba(246,255,83,0.13), transparent 38%)` (dark 0.035).
- **Intensities**: `ambient` (opacity 0.72, morph 32s, offset x60),
  `section` (0.78, 32s, x40), `hero` (0.94, **15s**, x20). Home/blog use
  `intensity="hero" opacity={0.72}` inside a fixed full-viewport layer.
- The fixed layer trick: parent section gets `[clip-path:inset(0)]` so a
  `fixed inset-0` SignalField scrolls with the viewport but clips to the
  section group.

## ProductSignal blobs

384×384 viewBox clusters of 2–3 morphing paths, 5–6 keyframes, ~10s linear
loops (offset copy at 1.09–1.37×). Light fills: cyan `rgb(8 145 178)` → teal →
lime, alphas 0.1–0.34; dark fills: turquoise `rgb(0 188 187)` → teal → sky
`rgb(125 211 252)`. Container opacity `opacity-80 dark:opacity-45`. Always
`aria-hidden="true" pointer-events-none`.

## Reveal system (foreground content)

- **Reveal** (controlled): pure opacity fade, duration **0.36s**, with a
  `delay` prop. Panels stagger their children manually: eyebrow 0 → heading
  0.1 → paragraph 0.2 → CTA/extra 0.3 → side panel 0.4.
- **ViewportReveal** (scroll-linked): fades in (0.4s) when the element passes
  the activation line at `window.innerHeight * 1.12` while scrolling down —
  and fades OUT again when scrolling up past it (reveals are reversible).
- **usePassedViewport(amount)**: same idea with a visibility threshold
  (0.25–0.35 of the element) used to trigger staggered containers.
- Staggered grids: framer `variants` with `staggerChildren` 0.12 (blog cards),
  0.18 (metrics, success cases), 0.24 (pillars); children fade 0.4–0.42s.
- Card items NEVER slide or scale on reveal — opacity only. (Translation is
  reserved for hovers: `hover:-translate-y-0.5/-2`.)

## Numbered process animation

Milestones fade in with big sequential delays: node delays `[0, 0.72, 1.44,
2.16, 2.88]s`; connector lines grow (`scaleX`/`scaleY` 0→1, origin left/top,
**0.58s easeInOut**) between them at delays `[0.16, 0.88, 1.6, 2.32]s`, drawing
a guided path from step 01 to 05.

## Metric counters

Values count from 0 to target over **1100ms** with cubic ease-out
(`1 - (1-t)^3`), starting at `0.3 + index * 0.18`s after the grid shows;
formatted with `toLocaleString("es-ES")` plus prefix/suffix (`+`, `<`, ` TB`,
`h`). Reduced motion: value rendered directly.

## Micro-interactions

| Element | Effect |
|---------|--------|
| Buttons with lift | `transition-all duration-150 hover:-translate-y-0.5` |
| Blog card | `hover:-translate-y-2` + image `group-hover:scale-105` (150ms) |
| Yellow CTA | `hover:scale-102` (`motion-reduce:transform-none`) |
| Links / borders | plain `transition` (default 150ms) color/border swaps |
| Pulsing dots / carets | `animate-pulse`, 160ms stagger between dots |
| Theme change | 180ms ease-out global color transition (see light-dark-mode.md) |
| Mobile nav | slide-in 0.18s easeInOut; burger lines 0.14s |
| Horizontal progress bar | spring `stiffness 180, damping 28` scaleX |

## Rules

- Decorative layers: `aria-hidden="true"` + `pointer-events-none`, `z-0`;
  content sits at `z-10`.
- Background morphs are LINEAR and long (10–32s); foreground fades are
  EASE-OUT and short (0.18–0.42s). Don't mix these registers.
- One-way stagger: reveals cascade top-to-bottom / left-to-right following
  reading order.
- Everything must honor `prefers-reduced-motion` (render final state, zero
  duration, `behavior: "auto"` for scrolls).

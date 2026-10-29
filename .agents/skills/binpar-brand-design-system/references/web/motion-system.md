# Motion System

> **Scope:** implementation recipes of the BinPar website and product apps
> (`consensus-salutis-website`, `consensus-salutis`), as observed in production.
> Use them only when editing those codebases. The identity manual rules in
> `SKILL.md` and `../*.md` win on any conflict; known website deviations are
> listed in `README.md` here and must not be copied into new work.

> Sources: `src/app/_components/motion-system.tsx` (unchanged except
> `HomeGrid`), `product-signal-left.tsx`, `brand-isotype-reveal.tsx`,
> `brand-isotype-particles.tsx`, `home-cover.tsx` + `home-cover.css`,
> `scroll-header-frame.tsx`, `home-paint-panel.tsx`,
> `section-navigation.tsx` + `.css`, `contact-assistant/*`,
> `clinical-chat-mock.tsx`, `clinical-process-{player,showcase,visuals,typing}.ts(x)`,
> `product-strata/*`, `success-cases/*`, `volume-section.tsx` + `.css`,
> `contrast-footer.tsx`, `contacto/_components/office-map.*`
> (website HEAD `70613ae`; framer-motion based, brand-mark recipes CSS-only).

Motion is calm, slow and organic: long linear morphs in the background, short
opacity fades in the foreground. Nothing bounces. Since the BinPar rebrand the
brand also has **identity motion**: the mark traces itself in, and a looping
variant of the same trace is the loader. The silhouette never changes shape.

**Current vs legacy.** Everything here is current unless marked **Legacy**.
Legacy = only the horizontal home (`VERTICAL_HOME=false`) still uses it.

## Registers

The baseline (unchanged since the Consensus era):

- **Background**: LINEAR, long morphs (`SignalField` 15s hero / 32s;
  `ProductSignal` ~10s).
- **Foreground**: short EASE-OUT opacity fades (0.18–0.42s), cascaded in
  reading order.

Four registers now sit on top. Pick one per element; never mix them on the
same element.

| Register | What | Curves / values |
|----------|------|-----------------|
| **Brand intro** (new) | One-shot, ~0.85–2s: mark trace 1.1–1.2s → fill crossfade (.3–.35s, starting at ≈70% of the trace) → copy ≈0.8s → primary action ≈1.3s → app chrome only after | trace `cubic-bezier(0.22,0.61,0.36,1)`; copy `cubic-bezier(0.4,0,0.2,1)` |
| **Narrative clock** (new) | Deterministic, scrubbable scenes: one rAF clock (dt clamped to 0.1s, speed multiplier) → `render(seconds)`; pure functions of time, not chained animations | smoothstep (reveals, crossfades .35s), easeOutCubic (connector draw .5s), cosine pulses (.9s reading, 1s thinking, tint 15%), exponential inertia (τ .24s) |
| **UI state** (mirrors the product chat) | Layout, docking, panels, hovers | brand "out" curve `cubic-bezier(0.22,1,0.36,1)`; 220ms layout/size, 280ms dock, .35s view reset, .55s selection, .6s map transforms; exits 100ms ease-out, enters 120–180ms ease-out after 20–60ms; hover/color 150ms; button bg 200ms; state fills 250ms; 80ms linear smoothing for rAF-driven inline styles |
| **Ambient loop** (extended) | Linear infinite loops, paused off-screen | strata flow 5s, map flow 8s / orbit 14s, ripple 2.8s, pulse 4.5s, camera orbit 96s, drift 7s / 9s; caret .9s `step-end` / 1s `steps(1,end)`; Tailwind `animate-pulse` 2s |

"Opacity only" still holds for decorative entrances. Semantic travel is
allowed only inside narrative scenes and UI state (cards ride their
connectors, the question morphs into a chip, the composer docks, plates lift
18px).

## Global config

- `MotionProvider` wraps the app with
  `<MotionConfig reducedMotion="user" transition={{ ease: "easeOut" }}>`.
- **Every** decorative animation checks `useReducedMotion()` (or
  `matchMedia("(prefers-reduced-motion: reduce)")` where there is no framer)
  and renders the final state statically. Non-negotiable.

## Route transitions

- On internal link click (same origin, different path, no modifier keys):
  a full-screen overlay `bg-[#deedf3] dark:bg-[#030916]` fades in
  (0.18s easeInOut), navigation fires after a 180ms timeout, overlay fades out
  on the new route.
- `RouteEntrance`: new page content fades in from opacity 0 over **0.22s**.

## Background layers (back to front)

1. **HomeMotionBackground** — fixed, `z-0`: solid `bg-white dark:bg-[#06111f]`
   + `<HomeGrid home />`, a static square grid of 1px lines, `44px` cell:
   `linear-gradient(rgba(8,145,178,0.1) 1px, transparent 1px)` both axes
   (dark: `rgba(125,211,252,0.045)`). Page heroes use a 40px variant at
   `0.07` alpha.
2. **SignalField** — the signature layer: three flowing gradient "signal" lines
   plus two nested organic blobs that morph continuously.
3. **ProductSignalLeft / ProductSignalAccent** — smaller morphing blob clusters
   anchored off-canvas (e.g. `fixed -bottom-80 -left-155 w-250 rotate-20`;
   subpages `-left-200 sm:-left-155`) to frame heroes, contact and blog pages.

### Grid sync (`HomeGrid`, `motion-system.tsx:267-300`)

- The home grid carries `data-home-grid` and
  `background-position: var(--home-grid-position, 0 0)`. The chat mock writes
  `--home-grid-position` so the page grid phase-aligns with its own grid, and
  snaps the hero copy to the nearest 44px intersection (`--home-copy-offset`).
- Every other `HomeGrid` mirrors the computed position through a
  `MutationObserver`, so the 44px lines stay continuous across bands.
- **Fixed-window trick** for colored bands: `position:absolute; inset:0;
  clip-path: inset(0)` container holding a `position:fixed` grid
  (`.ft-grid-window`, `.vol-grid-window`). Contrast-band grid lines:
  `rgb(0 188 187 / 4.5%)`.

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
  `section` (0.78, 32s, x40), `hero` (0.94, **15s**, x20). Home/blog/subpages
  use `intensity="hero" opacity={0.72}` inside a fixed full-viewport layer.
- The fixed layer trick: parent group gets `[clip-path:inset(0)]` so a
  `fixed inset-0` SignalField scrolls with the viewport but clips to the group.

## ProductSignal blobs

384×384 viewBox clusters of 2–3 morphing paths, 5–6 keyframes, ~10s linear
loops (offset copy at 1.09–1.37×). Light fills: cyan `rgb(8 145 178)` → teal →
lime, alphas 0.1–0.34; dark fills: turquoise `rgb(0 188 187)` → teal → sky
`rgb(125 211 252)`. Container opacity `opacity-80 dark:opacity-45`. Always
`aria-hidden="true" pointer-events-none`.

---

## Brand mark motion (canonical)

Two recipes, one geometry. They are the canonical spec for the website, the
clinical chat and the back office, and they replace the Consensus-era
`AnimatedBrandIsotype` (92.8 viewBox polyline + nodes) and
`BrandIsotypeLoader`. Both are CSS-only, framer-free and server-safe.

### Geometry

`BINPAR_ISOTYPE_OUTLINE` is the exact string exported as
`binparIsotypeOutline` from the website's `brand-isotype-reveal.tsx`; it is
geometrically identical to the official `assets/logos/binpar-isotipo-*.svg`
(manual v1.0 exports differ only in path syntax). Copy it,
never redraw or simplify it. `outline.match(/M[^M]+/g)` yields **3 contours**,
drawn in this order: outer rounded hexagon, upper-left channel, lower-right
channel (the two channels are 180°-symmetric). viewBox `0 0 121.76 131.79`
(portrait: size by height, or width + `height: auto`).

```ts
// Canonical BinPar silhouette; animation reveals it without changing its shape.
export const BINPAR_ISOTYPE_OUTLINE =
  "M119.3,45.22c0-8.06-4.33-15.56-11.31-19.59L72.19,4.96c-6.98-4.03-15.64-4.03-22.62,0L13.77,25.64c-6.98,4.03-11.31,11.53-11.31,19.59v41.34c0,8.06,4.33,15.56,11.31,19.59l35.8,20.67c3.49,2.01,7.4,3.02,11.31,3.02s7.82-1.01,11.31-3.02l35.8-20.67c6.98-4.03,11.31-11.53,11.31-19.59v-41.34ZM32.72,42.72c-3.7,2.14-6,6.12-6,10.39v32.5l9.38,5.42,34.43-19.88.06-10.21,14.54-8.81v21.12c0,3.89-2.09,7.52-5.47,9.47l-43.65,25.21-17.33-10c-4.08-2.35-6.61-6.74-6.61-11.45v-41.12c0-4.71,2.53-9.1,6.61-11.46L54.26,13.38c2.04-1.18,4.33-1.77,6.61-1.77s4.59.59,6.63,1.78l7.98,4.62-42.77,24.71ZM89.04,89.08c3.7-2.14,6-6.12,6-10.4v-32.56l-9.29-5.36-34.38,19.85v9.83s-14.63,8.46-14.63,8.46v-20.57c0-3.9,2.1-7.53,5.48-9.48l43.43-24.96,17.41,10.05c4.08,2.36,6.61,6.75,6.61,11.46l-.03,40.98c0,4.7-2.53,9.08-6.6,11.44l-35.55,20.58c-4.06,2.35-9.1,2.37-13.17.05l-8.14-4.64,42.84-24.74Z";
// Outer hexagon, upper-left channel, lower-right channel.
export const BINPAR_ISOTYPE_CONTOURS = BINPAR_ISOTYPE_OUTLINE.match(/M[^M]+/g)!;
```

Color: **`currentColor` only**, driven by tokens at the call site
(`text-primary-light dark:text-primary-dark`). Never hard-code the file hex
(`#006f7b` / `#00bebc`) or a token hex inside the component.

### (a) Reveal — one-shot (intros, empty states)

Website "cover trace" timing (`home-cover.css`, `data-entry-animation="trace"`).
A faint guide shows the outline; the three contours draw in sequence, each
drawing to 80% of its keyframe then fading, while the solid fill crossfades
in — the outline becomes the filled mark with no empty frame.

```tsx
export function BrandMarkReveal({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 121.76 131.79"
      aria-hidden="true"
      focusable="false"
      className={`brand-mark-reveal ${className}`}
    >
      <path className="brand-mark-guide" d={BINPAR_ISOTYPE_OUTLINE} fill="none" />
      {BINPAR_ISOTYPE_CONTOURS.map((contour, index) => (
        <path
          key={index}
          className={`brand-mark-trace brand-mark-trace-${index}`}
          d={contour}
          pathLength={1}
          fill="none"
        />
      ))}
      <path className="brand-mark-fill" d={BINPAR_ISOTYPE_OUTLINE} fill="currentColor" />
    </svg>
  );
}
// <BrandMarkReveal className="h-14 w-auto text-primary-light dark:text-primary-dark" />
```

```css
.brand-mark-reveal {
  overflow: visible; /* round caps would clip at the viewBox edge */
}
.brand-mark-guide {
  stroke: currentColor;
  stroke-width: 1;
  opacity: 0.1;
  animation: brand-mark-guide-out 300ms ease 850ms both;
}
.brand-mark-trace {
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: brand-mark-trace 1.2s cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.brand-mark-trace-1 { animation-delay: 80ms; }
.brand-mark-trace-2 { animation-delay: 160ms; }
.brand-mark-fill {
  opacity: 0;
  animation: brand-mark-fill 300ms ease 850ms both;
}
@keyframes brand-mark-trace {
  0% { stroke-dashoffset: 1; opacity: 1; }
  80% { stroke-dashoffset: 0; opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
}
@keyframes brand-mark-fill {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes brand-mark-guide-out {
  from { opacity: 0.1; }
  to { opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .brand-mark-trace,
  .brand-mark-guide { display: none; }
  .brand-mark-fill { animation: none; opacity: 1; }
}
```

- Timeline: draws finish at 0.96 / 1.04 / 1.12s; stroke fades end at
  1.2 / 1.28 / 1.36s; fill and guide-out run 0.85→1.15s. Settled by ≈1.4s.
- The guide fades out with the fill (the website leaves it at 0.1 under the
  fill; the canonical recipe removes that faint halo).
- Sizes: cover 56px wide (44px ≤767px); contact 56px tall; product intro per
  its slot. Stroke stays 2.4 viewBox units (contact uses 3 — the only allowed
  variant).
- Gating (when the mark can mount off-screen or in a hidden tab): drive
  `animation-play-state` from a variable that is `running` only when in view,
  tab visible and not reduced (website: `--entry-motion`,
  `data-motion-running`). Replay on re-entry by re-mounting (`key`).
- With CSS Modules, keyframe names are hashed — keep them inside the module.

### (b) Loader — looping (12–32px status indicators)

No website equivalent; derived from the reveal geometry and the product's
2s loader cadence. Base silhouette at low opacity; the three contours chase
around it (draw in → hold → erase from the start), staggered like the reveal.

```tsx
// Server-compatible: no hooks, no ids or clipPath (many instances per page).
export function BrandMarkLoader({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 121.76 131.79"
      aria-hidden="true"
      focusable="false"
      className={`brand-loader ${className}`}
    >
      <path className="brand-loader-base" d={BINPAR_ISOTYPE_OUTLINE} fill="currentColor" />
      {BINPAR_ISOTYPE_CONTOURS.map((contour, index) => (
        <path
          key={index}
          className={`brand-loader-trace brand-loader-trace-${index}`}
          d={contour}
          pathLength={1}
          fill="none"
        />
      ))}
    </svg>
  );
}
// <BrandMarkLoader className="size-5 text-primary-light dark:text-primary-dark" />
// Pair with a text status (`role="status"` + label) for assistive tech.
// Porting into the product: keep the root's existing attributes
// (chat: `data-consensus-isotype`, asserted by its tests; legacy name on purpose).
```

```css
.brand-loader {
  overflow: visible;
}
.brand-loader-base {
  opacity: 0.16;
}
.brand-loader-trace {
  stroke: currentColor;
  stroke-width: 9; /* viewBox units: ≈ old 6.5 × 131.79/92.8 */
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1 1;
  stroke-dashoffset: 1;
  animation: brand-loader-trace 2s cubic-bezier(0.45, 0, 0.25, 1) infinite;
}
.brand-loader-trace-1 { animation-delay: 80ms; }
.brand-loader-trace-2 { animation-delay: 160ms; }
@keyframes brand-loader-trace {
  0% { stroke-dashoffset: 1; }
  42%, 54% { stroke-dashoffset: 0; }
  96%, 100% { stroke-dashoffset: -1; }
}
@media (prefers-reduced-motion: reduce) {
  .brand-loader-base { opacity: 1; }
  .brand-loader-trace { display: none; }
}
```

- `currentColor` only: call sites override the color (accent, muted, white on
  a fill). No `clipPath`, no `id`, no `useId` — dozens can render at once and
  the back-office loader is a server component.
- Use it wherever something is pending: message lists, citation/source
  loading, job and ingestion screens. Not for one-shot intros (that's the
  reveal) and not as decoration.

### Website variants (observed)

| Variant | Where | Trace | Contour delays | Fill | Stroke |
|---------|-------|-------|----------------|------|--------|
| Cover "trace" (production) | `home-cover.css` `[data-entry-animation="trace"]` | 1.2s `(0.22,0.61,0.36,1)` | 0 / .08 / .16s | .3s ease @.85s | 2.4 |
| Contact | `contact-assistant.css` `.ca-brand` | 1.1s `(0.4,0,0.2,1)` | 0 / .07 / .14s | .35s ease @.75s | 3 |
| Base / lab study | `home-cover.css` `.brand-isotype-*` | 1.75s `(0.4,0,0.2,1)` | 0 / .12 / .24s | .45s ease @1.35s | 2.4 |

Website class/keyframe names: `brand-isotype-{reveal,guide,trace,fill}`,
`aura-isotype-trace`, `aura-isotype-fill`, `aura-entry-fade`, `ca-mark-*`.

### Brand-intro choreography: app-icon tile + chrome deferral

Production home cover (`home-cover.tsx`, `home-cover.css:317-348`,
`scroll-header-frame.tsx`):

1. Tile surface (`::before`, so it fades independently) `aura-entry-fade`
   (opacity + `visibility`) **0.85s**. Tile spec in `../logo.md`.
2. Mark: reveal (a), cover timing.
3. H1 "BinPar" + accent line and lede: **0.8s** `cubic-bezier(0.4,0,0.2,1)`
   at **0.8s**.
4. CTA "Descubrir la plataforma": **0.9s** at **1.3s**. Settled ≈2.2s.
5. The CTA's `animationstart` (`aura-entry-fade`) sets
   `data-entrance-complete="true"` and dispatches the `window` event
   **`binpar:home-cover-ready`**.
6. `ScrollHeaderFrame deferUntilCover` keeps the header `invisible opacity-0
   inert aria-hidden` until that event, the cover scrolling off, or reduced
   motion; then `transition-opacity duration-500 ease-in-out`.
   `SectionNavigation deferUntilContent` waits until the first section
   reaches 96.5px from the top.

All cover animations run under `animation-play-state: var(--entry-motion)`
(`running` = in view && `!document.hidden` && !reduced), so the intro waits
until it is seen. Reduced motion: final state, traces hidden, header shown.
Product rule: **brand mark first, copy at ≈0.8s, primary action at ≈1.3s,
app chrome only after** (the product chat intro already uses 840ms copy /
1350ms editor beats).

### Assistant intro + typed reply

`contact-assistant.tsx` (replays every time the section is re-entered):

1. `.ca-brand` opacity .4s, containing the reveal (contact variant).
2. Eyebrow .5s at .18s → heading .65s at .3s (`onAnimationComplete` arms the
   reply).
3. **`TypedReply`** at **8ms per character** (rAF,
   `floor((now − start) / 8)`), only while enabled, ≥25% in view, tab visible
   and not reduced; resumes from its cursor after a pause.
   - Pre-measures line breaks of the final text with `document.createRange()`
     and paints each line as an invisible full-text shell + an absolutely
     positioned "written" overlay: centered text never reflows while typing.
     Re-measures on `ResizeObserver` and `document.fonts` `loadingdone`.
   - Caret 2px × 1em in the accent, `0.9s step-end infinite`, paused when not
     typing. Screen readers get `<p class="sr-only" role="status">` with the
     full text.
4. Typing done → form `opacity 0→1` .45s easeInOut (with `visibility` and
   `inert`), input focused with `preventScroll`. Step changes retype;
   form ↔ completion swap .25s (`AnimatePresence mode="wait"`).

Reduced motion: full text, form visible, kill-switch `transition/animation:
none !important` on `.contact-assistant *`. Product port: framer-free
(IntersectionObserver + `matchMedia`) for the chat empty-state greeting.

**Typing cadences.** One canonical streaming speed for scripted answers:
**576 / 5.2 ≈ 110.77 chars/s** (`clinical-process-typing.ts`; process scenes
and the platform replica). Others:

| Component | Cadence | Caret |
|-----------|---------|-------|
| Chat mock question / answer | 19 / 26 ms/char | 1px × 12px `bg-primary`, `animate-pulse` |
| Chat mock follow-up question / answer | 22 / 24 ms/char | same |
| Contact `TypedReply` | 8 ms/char | 2px × 1em, .9s `step-end` |
| Platform replica | 110.77 chars/s, 0.2s lead, auto-send after 450ms | 1px × 16px, 900ms `step-end` |
| Volume heading | type 85 / delete 45 ms/char | 2px × .8em, 1s `steps(1,end)`, opacity .85/0 |

### Thinking indicator

- **Status line** (`clinical-chat-mock.tsx` `ProcessingLabel`): isotipo
  `size-4` (static) + status text + "…" with `animate-pulse`
  (`motion-reduce:animate-none`). Chat mock states "Consultando guías" →
  "Contrastando conocimiento validado" → "Preparando respuesta", 850ms each;
  follow-up "Contrastando seguimiento" 1100ms.
- **Breathing isotipo** (`clinical-process-showcase.tsx`): `size-5` mark at
  opacity `0.65 + 0.25·sin(π·t)` (2s period, .40–.90); status lines rotate
  every **2.2s** with a .18s crossfade. Reduced: opacity 1, last state.
- This replaces the old three pulsing dots (**Legacy**). For a looping
  indicator without text, use the loader (b).

### Beacon ripple

Live / location / awaiting indicator (`office-map.css`, `office-map.tsx`;
map variant in `territorial-case-definitive-two.tsx`):

- 46px circular badge (surface `#fbfdff` / `#081827`, border
  `rgb(0 109 121 / 18%)` / `rgb(0 188 187 / 25%)`, shadow
  `0 4px 16px rgb(0 34 98 / 12%)` / `rgb(0 0 0 / 20%)`) with the isotipo
  24×26 inside.
- Behind it a 160×160 SVG with 4 circles `r=40`, stroke .8,
  `vector-effect: non-scaling-stroke`, `currentColor` = accent.
- `2.8s linear infinite both`, `scale(0) → scale(1.5)`, opacity .8 → 0,
  `transform-origin: 80px 80px`, delays 0 / −.7 / −1.4 / −2.1s. Paused unless
  `data-motion-running="true"` (painted && intersecting && tab visible).
  Reduced: rings hidden. Map variant scales to 1.9.

### Particle assembly (optional hero variant)

`brand-isotype-particles.tsx` — **lab-only on the website** (`/casos-lab`);
production uses the trace. Allowed for a splash, sign-in or first-load hero
when explicitly wanted; never for repeated UI.

- Canvas 2D over the scene; 251 destinations rejection-sampled inside
  `new Path2D(outline)` (`isPointInPath`, deterministic hash seed, minimum
  spacing 3 units, ≤20,000 attempts) — both channels stay empty.
- Per particle: start `0.12 + seed·0.24`s, duration `0.95 + seed·0.25`s,
  smoothstep; origin from a Rayleigh cloud with a sine twist; radius
  0.7–1.15px; colors light/dark accent; fade-out 1.7→1.95s, then stops.
- Final SVG mark fades .25s at 1.7s; the canvas reads that CSS animation's
  `currentTime`, so pauses stay in lockstep. DPR capped at 1.5, ~33fps
  throttle. Tile 104px r30; copy at 2.35 / 2.5 / 2.65s.
- Reduced: canvas hidden, final mark shown. Porting: pass an explicit
  container ref (the website looks up `[data-home-proposal]`), and match the
  hashed keyframe name if CSS Modules rename it.

---

## Section motion (current)

### Paint panels (`HomePaintPanel`)

Replaces `VerticalPanel` (same logic, extracted): a render-prop wrapper that
"paints" its section when it crosses **85% of the viewport** while scrolling
down (or ≥5% of it is visible), and un-paints when scrolling back up past the
line. Sections receive `visible` and fade their own content.

| Section | Entrance |
|---------|----------|
| Hero section copy | `Reveal` cascade 0 / .1 / .2 / .3 (+ .4 chat mock) |
| Casos de éxito | .36s, needs 20% of the content (max 160px) past the line; intro cascade .36s each at 0 / .1 / .2 / .3; map stage .5s |
| Proceso (player) | section `duration-700` on paint (≥28% visible) |
| Arquitectura | .5s, same 20%/160px threshold |
| Volume band, footer | .35s (`whileInView` once, amount .15, or `visible`) |
| Contact assistant | see Assistant intro |

### Narrative scenes

- **Process player** (`clinical-process-player.tsx`): five stages on one
  clock, looping (≈82.3s); crossfade **.35s** smoothstep; copy column
  `duration-350`. Plays only when painted, frame ≥25% visible, tab visible,
  not paused, not reduced. Controls: steps with progress underline, speed
  ×1/×1.5/×2, pause, restart. Reduced: stage 04 final frame. Scene grammar
  (`processMotion`): draw .5, appearance .15, readingPulse .9, thinkingPulse
  1, tint .15, groupGap 1.05, dotGap .125, transit .55; connectors
  `strokeDasharray="1 1"` + `pathLength=1`, packets of 2×3 `FlowDot`s.
- **Product strata** (`product-strata/*`): auto-advance every **7s**;
  drift `sin(2πt/9)·3 + (layer−1)·(1−cos(2πt/7))·7` px; active layer lifts
  −18px (not the middle one) and scales 1.08 over .55s
  `cubic-bezier(0.22,1,0.36,1)`; orbit 360°/96s; edge flow 5s linear;
  detail crossfade .4s at .15s. ←/→ select, drag rotates. Reduced: no orbit,
  no flow, `animation/transition: none`.
- **Territorial map** (`success-cases/territorial-case-definitive-two.tsx`):
  region draw 1.9s `cubic-bezier(0.25,0.1,0.25,1)` (stagger .02s); markers .6s
  at `1.5 + .18i`; callout links .4s, cards .3s ease-out; wash 1.4s at 1.1s;
  flow 8s / orbit 14s linear; pin ripple 2.8s; card expand/collapse .38s /
  .28s. Paused via `--case-motion`. Reduced: final state.
- **Volume typewriter** (`volume-section.tsx`): "La base " +
  "se actualiza." / "evoluciona." / "crece."; first tick 2400ms, delete
  45ms/char, 220ms gap, type 85ms/char, hold 2400ms; runs while ≥50% in view.
  Full sentence in `aria-label`. Reduced: static "La base se actualiza.", no
  caret. The figures are **static** (no count-up).
- **Chat mock** (`clinical-chat-mock.tsx`, ≈27.4s loop, only while
  `active`): idle 1500 → question 19ms/char → 500 → dock 280ms
  `cubic-bezier(0.22,1,0.36,1)` (composer `top: 50%` → bottom) → 3 × 850ms
  states → answer 26ms/char → 2000 → follow-up 22ms/char → 500 → 1100
  thinking → answer 24ms/char → 500 → hold 5000 → reset fade .3s. Reduced:
  static condensed consultation.

### Section index (`section-navigation.tsx` / `.css`)

Fixed right rail from 1280px: fades 180ms ease-out; link color 150ms; marker
3×22px scroll-scrubbed between stops on `useSpring({ stiffness: 400,
damping: 38, mass: 0.5 })` (raw value under reduced motion); a clipped
contrast clone recolors the part over `[data-section-navigation-surface="dark"]`.
Click → `pushState` → smooth scroll (`instant` when reduced) → focus the
target. `SideLinkedInLink` mirrors it on the left. Layout spec in
`ui-components.md`.

## Reveal system (foreground content)

- **Reveal** (controlled): pure opacity fade, **0.36s**, with a `delay` prop.
  Panels stagger children manually: eyebrow 0 → heading 0.1 → paragraph 0.2 →
  CTA/extra 0.3 → side panel 0.4.
- **ViewportReveal** (scroll-linked): fades in (0.4s) when the element passes
  `window.innerHeight * 1.12` while scrolling down, and fades OUT again when
  scrolling up past it (reversible).
- **usePassedViewport(amount)**: same idea with a visibility threshold
  (0.25–0.35 of the element) for staggered containers.
- Staggered grids: framer `staggerChildren` **0.12** (blog cards); children
  fade 0.4–0.42s.
- Card items NEVER slide or scale on reveal — opacity only. Translation is
  reserved for hovers and narrative/UI-state motion.

## Legacy (horizontal home only)

- **Staggers 0.18** (metrics, logo-card success cases) and **0.24** (pillars).
- **Numbered process animation**: node delays `[0, 0.72, 1.44, 2.16, 2.88]s`;
  connectors grow (`scaleX`/`scaleY` 0→1, **0.58s easeInOut**) at
  `[0.16, 0.88, 1.6, 2.32]s`.
- **Metric counters**: 0 → target over **1100ms** cubic ease-out from
  `0.3 + index * 0.18`s, `toLocaleString("es-ES")` + prefix/suffix. The
  canonical volume band is static.
- **Three pulsing dots** (`size-1.5`, 160ms stagger) as the chat loader —
  replaced by the thinking indicator and the brand loader.

## Micro-interactions

| Element | Effect |
|---------|--------|
| Buttons with lift | `transition-all duration-150 hover:-translate-y-0.5` |
| Blog card | `hover:-translate-y-2` + image `group-hover:scale-105` (150ms) |
| Yellow CTA | `hover:scale-102` (`motion-reduce:transform-none`) |
| Cover CTA | `transition: background 0.2s` (hover `#155e75` / `#71fffe`) |
| Links / borders | plain `transition` (150ms) color/border swaps; footer and index links `150ms ease-out` |
| Header reveal | `transition-opacity duration-500 ease-in-out` after `binpar:home-cover-ready` |
| Section index / LinkedIn rail | fade 180ms ease-out |
| Carets / ellipsis | `animate-pulse` (2s) or step blinks (see cadences) |
| Theme change | 180ms ease-out global color transition (see `theming.md`) |
| Mobile nav | slide-in 0.18s easeInOut; burger lines 0.14s |
| Composer (product mirror) | height/radius 220ms `cubic-bezier(0.22,1,0.36,1)` |

## Duration scale

80 · 100 · 110 · 120–140 (+20–30 delay) · 150 · 180 · 200 · 220 · 250 · 280 ·
300 · 350 · 360/400 (Reveal) · 450 · 500 · 550 · 600–650 · 700 · 800–900ms ·
1.1–1.2s (mark trace) · 1.75s (lab trace) · 1.95s (particles) · 2s (loader) ·
2.2–2.8s (status, ripple) · 5–14s (ambient loops) · 15/32s (SignalField) ·
96s (orbit).

## Stagger values

| Context | Stagger |
|---------|---------|
| Reveal cascades, case intro | .1s |
| Blog cards | .12s |
| Bibliography rows | .06s |
| Mark contours | .08s (cover, loader) / .07s (contact) / .12s (lab) |
| Contact eyebrow → heading | .18s → .3s |
| Return packets | .16s per expert |
| Map markers / callouts / regions | .18s / .12s / .02s |
| Committee branches | .7s (= draw + .2) |
| Packet dots | .125s within a group, 1.05s between groups |
| Ripple rings | .7s (negative delays) |

## Rest states and gating

- Every animation ends static and fully legible: mark filled, connectors
  drawn, text complete.
- Reduced motion renders the **final, complete** state, never the empty
  start: filled logo, full greeting, full consultation, stage 04 final frame.
- Every loop or clock runs only when ALL hold: **painted** (scroll-direction
  aware, 85% line) + **in view** (`useInView` / IntersectionObserver ≥.25) +
  **`!document.hidden`** (+ not paused, not reduced).
- Expose the gate as a CSS variable driving `animation-play-state`
  (`--entry-motion`, `--case-motion`, `--product-motion`) or as
  `data-motion-running`.
- Replay on re-paint by re-mounting (React `key`).
- Canvas: DPR ≤1.5, ~33fps throttle. Geometry re-measures on
  `ResizeObserver` and `document.fonts` `loadingdone`. Hot paths update with
  `setAttribute`, not React re-renders.
- Every programmatic scroll: `behavior: reduced ? "instant" : "smooth"`.

## Rules

- Decorative layers: `aria-hidden="true"` + `pointer-events-none`, `z-0`;
  content sits at `z-10`.
- Background morphs are LINEAR and long (10–32s); foreground fades are
  EASE-OUT and short (0.18–0.9s). Don't mix these registers.
- One-way stagger: reveals cascade top-to-bottom / left-to-right following
  reading order.
- The brand mark animates ONLY through the reveal (a) or the loader (b); its
  silhouette is never morphed, scaled per-contour, rotated or recolored per
  contour.
- Looping and scene animations pause off-screen and in hidden tabs.
- Everything honors `prefers-reduced-motion` (final state, zero duration,
  instant scrolls).

# Light / Dark Mode

> Source: `src/app/layout.tsx`, `src/app/_components/theme-toggle.tsx`,
> `src/styles/globals.css`.

The system ships BOTH themes with a user toggle. Light is the default; dark is
opt-in and persisted. Every component must style both modes from day one — the
codebase pairs classes inline (`x dark:y`) everywhere.

## Architecture

- **Mechanism**: Tailwind v4 class strategy via
  `@custom-variant dark (&:where(.dark, .dark *));` — the `dark` class on
  `<html>` drives everything.
- **Persistence**: `localStorage` key **`consensus-theme`** (`"dark"` | `"light"`).
- **No-flash boot script** (inline in `<head>`, before paint):

```html
<script>
try{const t=localStorage.getItem("consensus-theme");const d=t==="dark";
document.documentElement.classList.toggle("dark",d);
document.documentElement.style.colorScheme=d?"dark":"light"}
catch(e){document.documentElement.classList.remove("dark");
document.documentElement.style.colorScheme="light"}
</script>
```

- **Body baseline**:
  `min-h-screen bg-[#f4f9fc] font-sans text-slate-900 antialiased dark:bg-[#06111f] dark:text-slate-50`.

## Theme toggle

`ThemeToggle` button spec: `size-9 rounded-full border` glass button showing a
**moon** icon in light mode and a **sun** in dark (icons are 24×24 stroke SVGs,
`strokeWidth 1.8`, rendered at `size-4`). On click it:

1. Adds `theme-changing` to `<html>` (enables the global 180ms transition).
2. Toggles the `dark` class and sets `style.colorScheme`.
3. Persists to `localStorage` (wrapped in try/catch).
4. Removes `theme-changing` after **220ms**.

The button itself carries `data-theme-toggle` and is excluded from the
transition so the icon swap is instant.

## Smooth theme transition (globals.css)

```css
.theme-changing *,
.theme-changing *::before,
.theme-changing *::after {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke, box-shadow;
  transition-duration: 180ms;
  transition-timing-function: ease-out;
}

.theme-changing [data-theme-toggle],
.theme-changing [data-theme-toggle] * { transition: none !important; }

@media (prefers-reduced-motion: reduce) {
  .theme-changing * { transition-duration: 0ms; }
}
```

## Header scroll backdrop (theme-aware)

The fixed header fades in a backdrop as you scroll (progress 0→1 over 96px,
set as `--header-bg-progress` by `ScrollHeaderFrame`):

```css
.header-scroll-backdrop {
  background-color: rgb(255 255 255 / calc(var(--header-bg-progress, 0) * 50%));
}
.dark .header-scroll-backdrop {
  background-color: rgb(6 17 31 / calc(var(--header-bg-progress, 0) * 70%));
}
```

## Autofill styling

Webkit autofill is forced to match the theme (white inset shadow + slate-900
text in light; `#04111e` inset + slate-100 in dark).

## Token mapping quick table

| Element | Light | Dark |
|---------|-------|------|
| Page bg | `#f4f9fc` (home `#fbfdff`) | `#06111f` |
| Deep band | `#deedf3` | `#030916` |
| Panel band | `#e8f2f7` | `#081827` |
| Card | `bg-white/70–90` + `shadow-big-blocks` | `bg-[#152230e6]/90` + cyan glow `0 0 18px rgba(103,232,249,.08)` |
| Heading | `#05215e` | `slate-50` |
| Body | `slate-600`/`slate-700` | `slate-400`/`slate-300` |
| Border | `cyan-800/10–25` | `cyan-300/10–25` |
| Primary accent | `#006d79` (hover `cyan-800`) | `#00BCBB` (hover `#71fffe`) |
| Primary button text | white | `#03111d`/`#04111e` |
| Yellow contrast accent | `#ffd230` + `#06111f` text | `#f6ff53` + `#06111f` text |
| Logo | `consensus-light.svg` | `consensus-dark.svg` |
| Grid lines | `rgba(8,145,178,0.1)` | `rgba(125,211,252,0.045)` |
| Decorative blob fills | cyan/teal/lime, alphas ~0.1–0.34 | turquoise/teal/sky, lower alphas |
| Backdrop blur | `backdrop-blur-xs` on cards | often `backdrop-blur-sm` (denser) |

## Depth model

- **Light mode** = paper + soft teal shadows: depth from `shadow-big-blocks`
  and translucent white fills over the grid background.
- **Dark mode** = glass + glow: shadows become cyan glows; surfaces are
  translucent navy (`#152230e6`) with slightly stronger blur.

## Mode decision

- Web/app: both modes, toggle in header, light default.
- Print, email, documents: light version only.
- The clinical chat mock, forms and marketing assets must be produced in the
  active theme's palette — no fixed-theme components.

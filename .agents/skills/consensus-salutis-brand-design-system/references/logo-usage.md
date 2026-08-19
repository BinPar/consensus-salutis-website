# Logo Usage

> Sources: brand manual (creation process, philosophy, light/dark versions) +
> production usage in `site-header.tsx`, `site-footer.tsx`, `clinical-chat-mock.tsx`.

## Concept (from the brand manual)

The logo is a progressive synthesis of the initials **C** and **S** into a single
mark contained in two hexagons. Three ideas drive the construction:

1. **Node-to-node journey** — the connected endpoints evoke the flow from
   clinical question to evidence-backed answer (consulta → análisis → contraste →
   validación → respuesta). The nodes add a contained technological dimension.
2. **Möbius strip / impossible geometry** — a surface that changes plane without
   breaking, representing the AI's ability to traverse large bodies of knowledge
   and return order where there was fragmentation.
3. **C+S fusion** — the C brings openness/consultation/context; the S brings
   continuity/system/Salutis. The result is an expanded structural S holding the
   formal memory of both letters.

The hexagonal geometry conveys structure, stability and institutionality; the
continuous stroke adds dynamism and processing capability.

## Logotype anatomy

Wordmark: **CONSENSUS** + **SALUTIS** in Plus Jakarta Sans ExtraBold, uppercase,
two-tone; isotipo: the CS symbol reversed (white/dark) inside a rounded square.

## Asset inventory (`assets/logos/`)

| File | Composition | Use on |
|------|-------------|--------|
| `consensus-light.svg` | Isotipo (teal `#006d79` square, white symbol) + "CONSENSUS" `#002262` + "SALUTIS" `#006d79` — 617.92×87.94 | Light backgrounds |
| `consensus-dark.svg` | Isotipo (turquoise `#00bcbb` square) + "CONSENSUS" `#fff` + "SALUTIS" `#00bcbb` | Dark backgrounds |
| `consensus-isotipo-light.svg` | Symbol alone, teal `#006d79` — 92.8×92.8 | Light bg, small spaces (avatars, chat) |
| `consensus-isotipo-dark.svg` | Symbol alone, turquoise `#00bcbb` — 92.8×92.8 | Dark bg, small spaces |

On the website these live at `public/logos/consensus-brand/`.

## Theme-paired rendering (canonical pattern)

Always render BOTH variants and let the `dark` class switch them:

```tsx
<Image src="/logos/consensus-brand/consensus-light.svg" alt="" width={618} height={88}
  className="h-6 w-auto dark:hidden sm:h-8" />
<Image src="/logos/consensus-brand/consensus-dark.svg" alt="" width={618} height={88}
  className="hidden h-6 w-auto dark:block sm:h-8" />
```

Sizes in production: header `h-6 sm:h-8`; footer `h-7 sm:h-8`; chat mock header
`h-6`; chat assistant avatar = isotipo at `size-6`.

## Favicon (`assets/favicon/`)

| File | Content |
|------|---------|
| `favicon.svg` | Isotipo: teal `#006d79` rounded square + white symbol, 92.8×92.8 — used with `sizes="any"` |
| `favicon.ico` | Raster fallback |

Next.js metadata (production):

```ts
icons: {
  icon: [{ url: "/favicon.svg", type: "image/svg+xml", sizes: "any" }],
  shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
},
```

Always use these exact files for any Consensus Salutis web property.

## Rules

- Light bg → `consensus-light` (navy + teal); dark bg → `consensus-dark`
  (white + turquoise). Never mix (e.g., navy wordmark on dark).
- Keep native proportions (617.92:87.94 ≈ 7:1); never stretch, recolor
  partially, add effects, or rebuild the wordmark in another font.
- Symbol alone (isotipo) is for small/square spaces: favicons, avatars, chat
  identity. The full logo is the default representation.
- Minimum contrast: on photos or gradients, place the logo over an area quiet
  enough to read the wordmark, or use the isotipo.
- The isotipo square is itself the accent color — don't put it on top of the
  same teal/turquoise fill.

## Partner / third-party logos

In dark mode, monochrome partner logos are inverted with utilities rather than
extra assets: `dark:brightness-0 dark:invert` (optionally `dark:opacity-80`).
Logos with a dedicated dark variant (e.g. Axia → `axia-white.svg`) switch files
with the same `dark:hidden` / `dark:block` pattern instead. The BinPar footer
credit uses `opacity-70 brightness-75 contrast-125 grayscale` in light mode so it
stays quiet next to the brand.

# Logo

Source: identity manual v1.0, chapter 01 (pp. 04–14). Files in `assets/logos/` are the
designer's official exports; never redraw, recolor, outline or "fix" them.

## Meaning (use only when a text needs it)

The isotype abstracts the centre of mass of a binary system: two masses orbiting a
shared point, projected on an isometric cube until the orbit becomes one continuous
surface that changes plane without breaking (impossible geometry, inherited from the
Consensus Salutis language). It stands for the pair *tecnología y salud*: two fields
that work as one system.

## Versions

| File | Use |
|---|---|
| `binpar-logo-light.svg` | **Primary.** Horizontal lockup on light surfaces (`#F4F9FC` or white). Isotype `#006D79`, word `#05215E` |
| `binpar-logo-dark.svg` | Horizontal on dark surfaces (`#06111F`, dark elevated surfaces). Isotype `#00BCBB`, word white |
| `binpar-logo-light-vertical.svg` / `-dark-vertical.svg` | Square or vertical formats where the horizontal one would be small: profiles, loading screens, posters, cover centre |
| `binpar-isotipo-light.svg` / `-dark.svg` | Isotype alone when space doesn't admit the lockup: favicon, app header, chat header, small marks |
| `png/*.png` | Same six at 256 px (horizontal) / 512 px (vertical, isotype) height, transparent. Only for media that can't take SVG (Word, PowerPoint, email) |
| `../icons/app-tile-*.svg` | Isotype inside the tile (see below) |

Only two colorways exist, light and dark. No mono, no navy-on-teal, no accent variants.

## Construction

- The word is 48.8 % of the isotype height and shares its horizontal axis.
- **Module X** = gap between isotype and word. It is the unit of everything around the logo.
- **Clear space:** X on all four sides. No text, image or composition edge enters it.
- Vertical lockup: same proportions, centred on one vertical axis, X between mark and word.
- Measured on the files: **X ≈ 0.34 × logo height** (horizontal). A 32 px logo needs ≈ 11 px free
  on every side; a 24 px one ≈ 8 px.

## Minimum size

| Element | Screen | Print |
|---|---|---|
| Full logo | 24 px high | 8 mm high |
| Isotype | 24 px | 8 mm |
| Favicon | 16/32 px (only element allowed below the minimum) | — |

References: website header 32 px desktop, 24 px mobile. Nothing smaller.

## App tile (the only approved container)

Isotype centred inside a rounded square ("baldosa").

| Spec | Value |
|---|---|
| Side / radius | 96 px / 28 px (scale proportionally: radius = 29 % of side) |
| Isotype | 58 % of tile width |
| Light | gradient 145° `#FFFFFF → #F6FAFC`, isotype teal, soft navy shadow |
| Dark | gradient 145° `#172C3D → #0C1C2B`, isotype turquoise |

Use it for app icons, shortcuts, external platform avatars, the home intro, PDF back covers.
Files: `assets/icons/app-tile-{light,dark}.svg` (+ 192/512 PNG), `apple-touch-icon.png`,
`icon-512-maskable.png` (full bleed for platforms that mask). CSS version: `.bp-tile`.

## Favicon

Isotype without tile (the tile hurts legibility at 16–32 px).
`assets/icons/favicon.svg` switches teal/turquoise with `prefers-color-scheme`;
`favicon.ico` (16/32/48) is the teal fallback.

```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

## Theme-paired rendering

On themable pages render both files and show one (`.bp-logo--light` / `.bp-logo--dark`
in `components.css`). Inline SVG with `currentColor` is acceptable only for the isotype
(animations, loaders), colored from tokens (`--bp-accent`), never the file hex.
`alt="BinPar"`; when it links home, `aria-label="BinPar · Inicio"`.

## Co-branding (p.13)

- Minimum distance between BinPar and another mark: **2X**. With a 1 px vertical divider,
  X on each side of the line.
- Equal optical weight, not equal measures: shared reference height and centre axis.
- In BinPar pieces, BinPar opens the reading (left or top). In a partner's piece, follow
  their order and keep spacing and weight.
- Partner logos keep their own colors; don't tint them to the palette.

## Never (p.14)

Distort or stretch · rotate · recolor (no accent, no navy fill, no gradient) · place on
color backgrounds (navy and teal color the logo, never the surface under it) · add
shadows, glows, outlines or gradients · glue text to it or invade the X zone · typeset
"BinPar" in a font as a substitute for the logo.

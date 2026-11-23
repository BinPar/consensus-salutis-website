# Color

Source: identity manual v1.0, chapter 02 (pp. 15–21). Tokens: `assets/css/tokens.css`.

## Idea

Teal sits between green (health, calm, the surgical environment) and blue (precision,
trust, digital): one hue that belongs to both fields. Navy is the counterpoint: deep,
low-saturation, institutional; it gives weight to the word and to headlines. Together
they form a cold, serene analogous harmony where nothing competes. Yellow is the only
warm note, and works like hospital signage: because it appears rarely.

Light theme = the clean light of clinical spaces (slightly cold white). Dark theme = the
screen: near-black blue where teal lights up into turquoise, like a monitor.

## Palette

| Role | Light theme | Dark theme |
|---|---|---|
| Brand ink (logo word, headline 1st line) | Navy `#05215E` | White / Slate 50 `#F8FAFC` |
| Primary (isotype, headline 2nd line, links, primary actions) | Teal `#006D79` | Turquoise `#00BCBB` |
| Surface (background, elevated surfaces) | `#F4F9FC` page, `#FFFFFF` surfaces | Night blue `#06111F`, cards `#152230` @ 90 % |
| Accent (exceptional) | Yellow `#FFD230` | Yellow `#F6FF53` |

Reference values:

| Color | HEX | RGB | CMYK |
|---|---|---|---|
| Navy | `#05215E` | 5 33 94 | 95 65 0 63 |
| Teal | `#006D79` | 0 109 121 | 100 10 0 53 |
| Turquoise | `#00BCBB` | 0 188 187 | 100 0 1 26 |
| Night blue | `#06111F` | 6 17 31 | 81 45 0 88 |
| Yellow (light) | `#FFD230` | 255 210 48 | 0 18 81 0 |
| Yellow (dark) | `#F6FF53` | 246 255 83 | 4 0 67 0 |
| Ice | `#F4F9FC` | 244 249 252 | — |

Each color has one value per theme. Turquoise on light or teal on dark loses contrast:
never mix themes.

## Neutrals (slate)

Text uses only the slate scale, a cold grey from the navy family. Each theme takes one end.

| Use | Light | Dark |
|---|---|---|
| Headline | Navy `#05215E` | Slate 50 `#F8FAFC` |
| Emphasis: bold, key data | Slate 900 `#0F172B` | Slate 100 `#F1F5F9` |
| Body: paragraphs, reading text | Slate 600 `#45556C` | Slate 400 `#90A1B9` |
| Secondary: captions, metadata | Slate 500 `#62748E` | Slate 400 `#90A1B9` |

No neutral or warm greys (`#666`, `#333`, stone, zinc…): they break the cold temperature.

## Borders, shadows, halo

- Borders are almost always brand cyan at low opacity, never opaque grey:
  cyan-800 @ 15 % on light, cyan-300 @ 20 % on dark (`--bp-border`).
- Light elevation: diffuse teal shadow `0 4px 30px rgb(0 109 121 / 10%), 0 2px 6px 2px rgb(0 109 121 / 2%)`.
- Dark elevation: the surface lightens and gets a faint cyan halo `0 0 18px rgb(83 234 253 / 8%)`.
- Never grey, black or hard shadows.

## Accent: yellow

Yellow is an **alert resource, not identity**. Most screens and pieces don't need it and
are solved with navy, teal and neutrals. It appears only when one element demands
priority attention: a decisive action or a warning that cannot go unnoticed.

- One yellow element per composition. If everything asks for attention, nothing gets it.
- Never on backgrounds, gradients, illustrations, decoration, links or body text.
- Text on yellow is night blue `#06111F` in both themes.

## Contrast (WCAG 2.1, on `#F4F9FC` / `#06111F`)

| Light | Ratio | Dark | Ratio |
|---|---|---|---|
| Navy | 14.2 : 1 AAA | Slate 50 | 18.1 : 1 AAA |
| Teal | 5.7 : 1 AA (AAA large) | Turquoise | 8.0 : 1 AAA |
| Slate 600 | 7.1 : 1 AAA | Slate 400 | 7.2 : 1 AAA |
| Slate 500 | 4.4 : 1 AA large only | Slate 400 | 7.2 : 1 AAA |

Slate 500 is for large captions/metadata, not small body text. White on teal fill passes;
on turquoise fill use `#04111E` text.

## Color in charts

See `charts.md`: protagonist series in the teal family, support tones, slate for context,
yellow still exceptional.

## Never (p.21)

Color backgrounds (surfaces are always light or night blue; navy and teal color elements,
not the background) · mixing themes · repeating the accent · decorative yellow ·
foreign greys · yellow links.

## Semantic tokens (CSS)

`--bp-bg`, `--bp-surface`, `--bp-surface-solid`, `--bp-field`, `--bp-heading`,
`--bp-heading-accent`, `--bp-text-strong`, `--bp-text`, `--bp-text-muted`,
`--bp-accent`, `--bp-accent-hover`, `--bp-on-accent`, `--bp-accent-soft`,
`--bp-attention`, `--bp-on-attention`, `--bp-danger`, `--bp-border*`, `--bp-shadow`,
`--bp-grid-line`, `--bp-chart-grid`, `--bp-chart-support`. Always style with these,
not raw palette values, so both themes work.

Errors (forms, error tags) use rose (`#C70036` light / `#FFA1AD` dark): the one hue
outside the palette, only for errors.

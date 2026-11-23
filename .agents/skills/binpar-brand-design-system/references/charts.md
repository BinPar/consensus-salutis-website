# Charts

Source: identity manual v1.0, pp. 37–39. Reference values come from the platform
dashboards: a recommended starting point, adjustable when the data asks for it.

## Principle: data with a common thread

Charts don't share a fixed palette: color and form change with the data and the story.
What stays is **how they are drawn**, the same as the rest of the interface: the brand
card, the technical grid, soft marks, tabular figures and the tooltip. With that thread,
very different charts read as part of one platform.

- **One protagonist** datum or series; the rest is support.
- Protagonist in the teal family (`--bp-accent`), support tones (`--bp-chart-support`,
  lighter teals), slate for context (averages, benchmarks, "Otros").
- Yellow stays exceptional (at most one mark that must not be missed).
- Many series → group the small ones into «Otros» or split the chart.
- An entity keeps its color across filters and views.
- One number? A highlighted figure (`.bp-kpi`) beats a chart.

## Choosing the form

| To show | Use |
|---|---|
| Comparison | Horizontal bars, sorted |
| Evolution | Lines or areas over time |
| Distribution | Vertical bars of one series |
| Part of a whole | Donut, few slices |
| A single figure | The figure, not a chart |

## Reference measures

| Element | Spec |
|---|---|
| Frame | Brand card: radius 16 px, border cyan-800 @ 15 % (`.bp-card .bp-chart`) |
| Eyebrow | Sora 10 px small caps, teal (`.bp-chart__eyebrow`) |
| Title | Sora SemiBold 16–18 px (`.bp-chart__title`) |
| Grid | cyan-700 @ 12 %, dashed 4/4 (`--bp-chart-grid`), no tick marks |
| Axes | No ticks, 11 px, slate-500 |
| Hover cursor | Teal @ 6 % over the zone |
| Bars | Thickness 16–18 px, radius 4–5 px at the ends; stacked segments separated by a thin line |
| Lines | Smooth curve 1.5 px, no points |
| Areas | Gradient 20 % → 2 % of the series color |
| Donut | 3° gap between slices |
| Reference lines | Dashed 4/4, 11 px label, slate or support tone |
| Tooltip | 16 px card, title in small caps, 8 px color dot per series |
| Figures | Navy, **tabular**, Spanish format (`2,4 s`, `1.250`, `38 %`) |

## Implementation notes

- Inline SVG is the most portable (artifacts, PDF, docs): use CSS variables for colors so
  both themes work; give `role="img"` + `aria-label`.
- Chart libraries (Recharts, Chart.js, ECharts…): map the specs above (no tick marks,
  dashed light grid, rounded bars, 1.5 px lines without dots, tabular numbers, Jakarta 11 px).
- Spanish number format: `Intl.NumberFormat('es-ES')` (note: es-ES omits the thousands
  separator for 4-digit numbers; pass `useGrouping: 'always'` when you need `1.250`).
- Example: the bar chart in `assets/templates/starter.html`.

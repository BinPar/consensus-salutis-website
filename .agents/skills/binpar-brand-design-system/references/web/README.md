# Web and product implementation

Production recipes of the BinPar website (`consensus-salutis-website`) and the
product apps (`consensus-salutis`: chat, back office). Read only when editing
those codebases or reproducing one of their components exactly.

| File | Use when |
|---|---|
| `tokens-tailwind.md` | Tailwind v4 `@theme` block, semantic class map, borders, shadows, radii |
| `theming.md` | Light/dark mechanism, `consensus-theme` storage key, theme toggle, contrast band |
| `typography-classes.md` | Heading/body class recipes, blog article body recipe |
| `ui-components.md` | Buttons, cards, header, footer, contact assistant, chat mock, section index |
| `motion-system.md` | SignalField, brand-mark reveal and loader, narrative scenes, durations |
| `landing-patterns.md` | Vertical home: section order, panels, cover, volume band |
| `blog-patterns.md` | MDX content engine, covers, OG image, cards, article page |

Ready-made CSS for new web work: `../../assets/css/tailwind-theme.css`.

## Known deviations from the manual (do not copy into new work)

| On the website | Manual rule |
|---|---|
| Lime `rgb(246 255 83)` stops in SignalField/ProductSignal blobs, the lime radial glow and blog cover gradients | Yellow never in backgrounds, gradients or illustrations. Flaps are cyan veils only (`../../assets/shapes/`) |
| Evidence highlight wash in yellow on cited passages | Acceptable only as the single attention element of that view; otherwise use `--bp-accent-soft` |
| Privacy link `dark:text-secondary-dark` (yellow) | Links are teal/turquoise, never yellow |
| `#002262` / `#002366` "deep navy" references in older code | The navy is `#05215E` |
| Cover CTA icon stroke 1.5, process-scene icons stroke 1.1 | Lucide stroke 1.8 |
| Contact assistant copy in *tú* / *nosotros* | Voice rules in `binpar-brand-voice` |

Internal identifiers keep the legacy prefix on purpose and are never renamed for
the brand: `consensus-theme` storage key, `@consensus/*` packages,
`data-consensus-isotype`, the `consensussalutis.com` domain and mailboxes.

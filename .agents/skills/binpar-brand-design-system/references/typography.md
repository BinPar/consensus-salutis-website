# Typography

Source: identity manual v1.0, chapter 03 (pp. 22–28).

## Families

| Family | Role | Weights in use |
|---|---|---|
| **Sora** | Headlines, eyebrows, component titles, big figures | ExtraBold 800 (headlines, 24–54 px), Bold 700 (eyebrows, 9–12 px), SemiBold 600 (component titles, 10–20 px) |
| **Plus Jakarta Sans** | Everything that is read: paragraphs, buttons, nav, forms, metadata | Regular 400 (paragraphs, 10–18 px), Medium 500 (nav, forms, metadata), SemiBold 600 (buttons, labels, emphasis), Bold 700 (occasional emphasis) |

Sora's closed geometry vs Jakarta's open forms keeps headlines and text from ever being
confused. Both are OFL (Google Fonts); both are screen-first and behave the same in both
themes, on the web, in the platform and in documents. **Only these two families exist.**

Loading:
- Web/artifacts: `https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap`
- Next.js: `next/font/google` (`Sora`, `Plus_Jakarta_Sans`, variables `--font-sora`, `--font-plus-jakarta-sans`).
- Offline/print/PDF: `assets/fonts/*.ttf` (variable) + `assets/css/fonts.css`.
- Word/PowerPoint: install the TTFs or embed them; without them the file falls back to system fonts.
- Fallback stack only when the fonts truly can't load: `ui-sans-serif, system-ui, sans-serif`.

Code (technical docs only) may use the system monospace stack; it is not a brand face.

## Scale (desktop web)

| Level | Family / weight | Size | Line height | Tracking |
|---|---|---|---|---|
| Cover | Sora ExtraBold | 54 px | 60 px | −0.025 em |
| Page headline | Sora ExtraBold | 48 px | 52 px | −0.025 em |
| Component title | Sora SemiBold | 18 px | 28 px | normal |
| Eyebrow (antetítulo) | Sora Bold, UPPERCASE | 12 px | 16 px | 0.22 em |
| Lede (entradilla) | Jakarta Regular | 18 px | 32 px | normal |
| Body | Jakarta Regular | 16 px | 28 px | normal |
| Secondary | Jakarta Regular | 14 px | 24 px | normal |
| Button | Jakarta SemiBold | 14 px | 20 px | normal |

Mobile: cover/headline drop to 32–36 px; everything else stays.
Print (A4) scale: see `binpar-documents` (body 10.5 pt / 1.6, headlines Sora 800).
Slides 16:9 (1920 × 1080): headline 72–96 px, body 28–32 px, eyebrow 18–20 px.

Hierarchy is built with size and weight; color accompanies, never replaces them.
Line height is generous for reading text. Figures in tables and data: tabular numbers.

## Composition (p.27)

Every text block follows the same order: **eyebrow → headline → lede**. No level is
skipped or reordered.

- The eyebrow places the topic (`IA MÉDICA INSTITUCIONAL`).
- The headline states it, optionally in **two tones**: navy for the first idea, teal for
  the second (dark: Slate 50 + turquoise). A resource, not an obligation; never a third color.
  The split falls on a sentence or clause boundary: "Evidencia clínica, / siempre ordenada."
- The lede explains it.
- Gaps (manual): eyebrow → headline 20 px; headline → lede 24 px.
- Left-aligned by default. Covers and presentation blocks may be centred. Long articles
  (blog) are justified with hyphenation and no rivers.
- Max measure for reading text: **576 px** (~65–75 characters).

Wording of headlines (periods, length) is a voice decision: `binpar-brand-voice`.

## Never (p.28)

Sora in paragraphs · headlines in ALL CAPS (caps only for Sora Bold eyebrows) · open
tracking on headlines (normal or slightly tight only) · any other family, even a
look-alike · three-tone headlines · headlines in Jakarta.

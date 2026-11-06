# Review Checklist and Review Mode

Two uses: the checklist you run before delivering your own draft, and **review mode**, the
audit you produce when handed existing copy.

---

## 1. Severity map

| Severity | Meaning | Action |
|---|---|---|
| **HIGH** | Invalidates the piece. Clinical, regulatory, disclosure or personification | Must be fixed before publication. No exceptions |
| **MEDIUM** | Damages the voice. Abstraction, filler, narrator drift, banned lexicon, budget overrun | Fix, or justify in writing why it stays |
| **LOW** | Mechanical. Headline periods and caps, punctuation, list count, heading depth | Fix in passing |

### HIGH findings

| Code | Rule |
|---|---|
| H1 | Reads as diagnosis or therapeutic indication for a patient |
| H2 | Efficacy claim or figure without a citable source and its context |
| H3 | Clinical outcome presented as technical signal, or the reverse |
| H4 | Implies CE marking, MDR, medical-device status, certification or AI Act conformity |
| H5 | Names a competitor, a model, or a model provider (except a comparison the client commissioned, `clinical-red-lines.md` §4) |
| H6 | Personifies the system: entiende, sabe, interpreta, juzga, decide, opina, razona, aprende de ti, or the system speaking as *yo* / *nosotros* ("hemos revisado tu pregunta") |
| H7 | Crosses the disclosure boundary: Convex, AI SDK, CRC, anchor, delta, VFS, table names, model slots, internal tags, *orquestador* / *agentes expertos* / *sub-agente* as names of the architecture |
| H8 | Commercial fear framing |
| H9 | An imperative telling the clinician what to do with a patient; attributes clinical responsibility to the system, or omits the professional's judgement where the sentence needs it; a *comité* that "validates" or "reviews" an answer (implies a human review that did not happen) |

### MEDIUM findings

| Code | Rule |
|---|---|
| M1 | Claim with no operational anchor (role, document, decision, failure mode) |
| M2 | Noun stacking / nominalisation chain |
| M3 | Paragraph that restates the previous one, or hedged non-claim |
| M4 | Address: *tú* and *usted* mixed on one surface, or *usted* outside legal text and an *usted* email thread; empathy or flattery aimed at the reader ("sabemos lo duro…"); a brochure question ("¿Y si tu equipo pudiera…?"); more than one rhetorical question per piece |
| M5 | *nosotros* stating beliefs, feelings or rank instead of a checkable action (creemos, nos apasiona, apostamos por, somos líderes), outside the team page's purpose line |
| M6 | Product in the opening, in the close, or more than twice in the body (except nota de producto) |
| M7 | Banned lexicon: copiloto, asistente virtual, agente, cerebro clínico, segunda opinión, orquestado / orquestación as an adjective or abstract noun (*orquestador* is H7). *comité clínico* and *comité de expertos* are allowed |
| M8 | Corporate buzzword |
| M9 | Uncalibrated absolute: garantiza, elimina el error, siempre, cualquier pregunta |
| M10 | Word budget overrun, per piece or per section, beyond 15 % |
| M11 | Coined term used inconsistently, or a new coined term invented ad hoc |
| M12 | Closing with a CTA in a reflective archetype |
| M13 | Filler connective: por otro lado, en este sentido, cabe destacar, en definitiva |
| M14 | Unmarked anglicism where Spanish exists |
| M15 | Product name: the legacy name (Consensus Salutis, Consensus, CS) in new copy outside a single "antes Consensus Salutis" note, or BinPar misspelt (Binpar, BINPAR typed, Bin Par) |

### LOW findings

| Code | Rule |
|---|---|
| L1 | Period on a running heading or antetítulo; missing period on a display headline; headline typed or set in caps; exclamation in a headline |
| L2 | Emoji |
| L3 | More than one em dash per paragraph, or em dash where parentheses fit |
| L4 | More than two lists per section, or a list replacing prose |
| L5 | More than one blockquote per piece |
| L6 | Heading depth beyond H3 outside marco/evidencia, or a section titled "Conclusión" |
| L7 | Number formatting not es-ES (thousands, decimals) |
| L8 | More than one image, or a keyword-list `alt` |
| L9 | `readTime` inconsistent with word count |
| L10 | Bold applied to a whole sentence, or more than once per paragraph |
| L11 | Typo, missing word or broken agreement |
| L12 | Headline block out of order (antetítulo → titular → entradilla), a level skipped, a two-tone split inside a noun phrase, or a third tone |

---

## 2. Review mode output format

Diagnosis alone is not the deliverable. For every finding, quote the fragment verbatim and propose
the rewrite.

```
## Auditoría de voz — <pieza>

Arquetipo o formato: <marco | mecanismo | sector | evidencia | nota de producto | propuesta | informe | email | …>
Destinatario: <público | cliente | interno>
Extensión: <N> palabras (presupuesto: <rango>)

| # | Fragmento | Código | Severidad | Reescritura propuesta |
|---|---|---|---|---|
| 1 | "..." | H7 | HIGH | "..." |
| 2 | "..." | M1 | MEDIUM | "..." |
| 3 | "..." | L1 | LOW | "..." |

**Veredicto:** <publicable | publicable con correcciones | reescritura>
```

Rules for the table:

- **Order by severity**, HIGH first. Within a severity, follow document order.
- **Quote verbatim**, trimmed to the offending clause. Do not paraphrase the "before".
- **Every row gets a rewrite.** "Eliminar" is a valid rewrite for filler. Say so explicitly.
- **One row per finding**, not per rule. A sentence with three defects gets three rows only if
  they need different rewrites; otherwise one row listing the codes.
- **Do not pad the table.** A clean piece with two LOW findings gets a two-row table and a
  *publicable* verdict.

### Verdict thresholds

| Verdict | Condition |
|---|---|
| **publicable** | No HIGH, at most two MEDIUM, any number of LOW |
| **publicable con correcciones** | No HIGH, three or more MEDIUM |
| **reescritura** | Any HIGH, or MEDIUM findings that touch the thesis of the piece |

A HIGH finding always forces *reescritura*, even if it is a single word. That is the point of the
severity.

### Reviewing the site's own copy: known debt

Some live website copy breaks this skill by drift: *agentes expertos* and *orquestador* in the
process walkthrough (H7), *orquestado* in the home hero (M7), an expert quoted in the first person
and a described patient taken to considerations (H6, H1), the hype headline "El futuro de la
salud. Ya está aquí." (M8, M9), *"Pensando…"* as a loading state on the site and in the product
(H6), noun stacks and anglicisms in the home (M1, M14) and "BINPAR" typed in the architecture
graphic's label (M15). *tú* and *nosotros* are no longer debt: the conversational voice is the
rule. Full list with rewrites: `examples-and-rewrites.md` §12.

- **Flag them anyway**, with their codes, and add *deuda conocida* to the rewrite cell. Known
  debt does not lower the severity or soften the verdict.
- **A new draft that copies one of them** is an ordinary finding. Being on the site is not
  precedent.

---

## 3. Pre-delivery checklist

Run in this order. Steps 1-4 are cheap and catch most of it.

### Mechanical pass

- [ ] Display headlines end with a period; running headings (H2-H4, TOC, cards, tables, labels,
      buttons, subjects) and antetítulos do not; no headline in caps
- [ ] No emojis
- [ ] Em dashes: at most one per paragraph; parentheses used for asides
- [ ] At most two lists per section; at most one blockquote per piece; at most one image
- [ ] Heading depth respects the archetype; no section titled "Conclusión" in reflective pieces
- [ ] Numbers in es-ES convention
- [ ] `excerpt` and, if overridden, `readTime` in the post frontmatter consistent with the piece

### Narrator pass

- [ ] Format identified (`formats.md`, or a blog archetype)
- [ ] Address: search for `usted` and formal imperatives (`compruebe`, `seleccione`,
      `introduzca`, `vuelva`). Zero hits outside legal text or an *usted* email thread; *tú*
      consistent throughout
- [ ] Search for `creemos`, `nos apasiona`, `apostamos`, `líder`, `somos los`. Zero hits; every
      *nosotros* carries an action someone can check
- [ ] The system never speaks as *yo* or *nosotros*
- [ ] Analytical pieces: product zero times in the opening and the close, at most twice in the
      body
- [ ] Search for `Consensus`, `Binpar`, `BINPAR`, `Bin Par`. Zero hits outside one "antes Consensus
      Salutis" note, an address (`consensussalutis.com`) or an ID (`equipo-consensus-salutis`)
- [ ] Deleting every product mention leaves the piece standing

### Personification pass

- [ ] Search for `entiende`, `comprende`, `sabe`, `interpreta`, `juzga`, `decide`, `determina`,
      `opina`, `razona`, `aprende` with the system as subject. Zero hits
- [ ] Every decision in the text has a human or an organisation as its subject

### Red-line pass

- [ ] No sentence that states what should be done to a patient
- [ ] Every figure has its source and its context; technical signal labelled as such
- [ ] No certification, marking or conformity claimed
- [ ] No competitor, model or provider named (except a comparison the client commissioned)
- [ ] Fear framing is clinical risk, never commercial pressure

### Disclosure pass

- [ ] Search for `Convex`, `AI SDK`, `CRC`, `checksum`, `anchor`, `delta`, `VFS`, `prompt`,
      `embedding`, `RAG`, `chunk`, `orquestador`, `agentes expertos`, `sub-agente`, `tool`. Zero
      hits (H7)
- [ ] No sentence that only makes sense to someone who has read the repository

### Voice pass

- [ ] Archetype (blog) or format (`formats.md`) declared; word budget per section written down
      and respected
- [ ] Search for `copiloto`, `asistente virtual`, `agente`, `cerebro clínico`, `segunda opinión`,
      `orquestad`. Zero hits (M7)
- [ ] Every claim has a role, document, decision or failure mode attached
- [ ] No paragraph restates the previous one; no hedged non-claims
- [ ] `de` count per sentence under three
- [ ] Limits stated where they exist; no absolutes
- [ ] One idea per sentence; paragraphs of 3-5 lines
- [ ] *el sistema ordena, el clínico decide* holds throughout
- [ ] Coined terms used consistently; no new ones invented
- [ ] Closing fits the format: reflective in blog archetypes (one CTA only in a nota de
      producto); dated next steps in proposals, reports and emails

### Video pass (`formats.md` §10)

- [ ] Script has numbered scenes with time ranges, plus *Fuentes de las cifras* and *Criterios
      aplicados*
- [ ] Limits stated whenever figures appear; one figure per sentence
- [ ] Voice-over within budget (seconds × 2,5 words); no parentheses or unexpanded acronyms
- [ ] Voice direction includes accent, style and «Bínpar» (BÍN-par)
- [ ] Subtitles: ≤ 2 lines, ≤ 42 characters per line, ≤ 17 characters per second, digits
- [ ] Recreated product screens declared as such; no voice provider credited

---

## 4. Worked review

Input fragment (a draft hero for a product page):

> "BinPar es el copiloto clínico que entiende tus dudas y te da la respuesta correcta, reduciendo
> errores diagnósticos. Certificado para entornos sanitarios europeos."

Output:

```
## Auditoría de voz — hero de producto (borrador)

Arquetipo o formato: nota de producto
Destinatario: público
Extensión: 23 palabras (presupuesto: 500-800 para la pieza completa)

| # | Fragmento | Código | Severidad | Reescritura propuesta |
|---|---|---|---|---|
| 1 | "reduciendo errores diagnósticos" | H2, H3 | HIGH | Eliminar. Sin estudio citable no procede. Si hay que hablar de rendimiento: "el benchmark documentado se presenta como señal técnica contextualizada" |
| 2 | "Certificado para entornos sanitarios europeos." | H4 | HIGH | "Diseñado para operar en entornos sanitarios europeos: despliegue en la Unión Europea, auditoría completa y trazabilidad de acciones" |
| 3 | "entiende tus dudas" | H6 | HIGH | "recupera el conocimiento relevante para tu duda" |
| 4 | "te da la respuesta correcta" | M9, H9 | HIGH | "te devuelve una síntesis con la referencia al fragmento que la sustenta; la conclusión es tuya" |
| 5 | "el copiloto clínico" | M7 | MEDIUM | "la capa de consulta clínica" |

**Veredicto:** reescritura

Propuesta completa:

"BinPar convierte guías, protocolos y documentación propia en una consulta clínica trazable.
Cada respuesta puede enlazar al fragmento original que la sustenta, y la decisión es tuya. La
plataforma está diseñada para operar en la Unión Europea, con auditoría completa e historial de
versiones."
```

Note what the review does: it names codes, it quotes verbatim, it rewrites every row, and it ends
with a full replacement because the verdict was *reescritura*. A verdict of *publicable con
correcciones* ends with the table only.

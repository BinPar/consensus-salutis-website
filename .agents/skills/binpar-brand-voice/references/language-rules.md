# Language Rules

> All customer-facing copy is Spanish (es-ES). Examples stay in Spanish.

## 1. Verbs: what the system may and may not do

The system performs **documentary operations**. It does not perform **cognitive or clinical acts**.
This is a tone rule and a liability rule at once: a verb that grants understanding grants agency,
and agency in a clinical setting means responsibility.

### Allowed

| Verb | Use for |
|---|---|
| **recupera** | bringing documents or fragments out of the corpus |
| **referencia** / **enlaza** | pointing at the source fragment or page |
| **sintetiza** | composing an answer from retrieved sources |
| **prioriza** | applying the organisation's documentary priorities |
| **contrasta** | putting retrieved sources against each other |
| **señala** | flagging something for human attention |
| **devuelve** | returning a result |
| **registra** / **versiona** | logging and versioning |
| **estructura** / **organiza** / **ordena** | arranging knowledge |
| **permite** / **facilita** | enabling a human action (the human keeps the verb of decision) |

### Banned

| Verb | Why |
|---|---|
| entiende, comprende | attributes understanding |
| sabe | attributes knowledge |
| interpreta | attributes clinical reading |
| juzga, valora | attributes judgement |
| decide, determina, resuelve | attributes the decision that belongs to the clinician |
| opina, cree, considera | attributes opinion |
| diagnostica, indica, prescribe, recomienda (a un paciente) | crosses the clinical red line |
| aprende de ti, se adapta a ti, te conoce | personification plus second person |
| razona, piensa, reflexiona | attributes cognition |

### The rewrite move

When a banned verb is the natural one, move the cognition to the human and leave the documentary
operation with the system.

| Off-brand | On-brand |
|---|---|
| "El sistema entiende la duda clínica." | "El profesional formula la duda; el sistema recupera el conocimiento relevante." |
| "La plataforma decide qué fuente es más fiable." | "La plataforma aplica las prioridades documentales definidas por la organización." |
| "La IA interpreta la guía." | "La respuesta enlaza el epígrafe de la guía que la sustenta; la interpretación es del clínico." |
| "El sistema sabe cuándo no tiene información." | "Entre las preguntas de control hay casos en los que la respuesta correcta es declarar información insuficiente." |

Same rule for nouns and adjectives: no *criterio del sistema*, no *opinión de la IA*, no
*respuesta inteligente*. "Inteligencia artificial" as the name of the technology is fine.
*inteligente* as a compliment to the product is not.

## 2. Coined lexicon

Six terms. Use the exact wording, always lowercase (they are concepts, not product names).

| Term | Definition | Use it when |
|---|---|---|
| **consenso verificable** | A conclusion anyone can trace back to its source. The flag term of the brand | Talking about the promise as a whole |
| **evidencia visible** | The source fragment is reachable from the answer, not merely asserted | Talking about citation and traceability |
| **gobierno del conocimiento clínico** | Roles, controlled publication, review and versioning over the corpus | Talking about who may change what |
| **preguntas de control** | The battery of questions that verifies the system has not degraded | Talking about evaluation and regression |
| **corpus vivo** | A knowledge base that changes, and therefore needs versioning | Talking about maintenance over time |
| **umbral de revisión** | The point at which an answer requires a human eye | Talking about supervision and escalation |

Rules of use:

- One flag term per piece is enough. Repeating *consenso verificable* five times reads as a slogan.
- Define a term the first time it appears in a piece, in one clause, then use it bare.
- Do not invent new coined terms without adding them here first.
- Current public product vocabulary (website and product) is reused as-is:
  *respuestas clínicas trazables*, *fuentes verificables*, *evidencia trazable*, *consulta
  clínica*, *conversación con contexto*, *aportaciones*, *Bibliografía* (the references
  heading), *epígrafes clínicos*, *preguntas de evaluación*, *volumen y actualización*.
- Former website vocabulary stays allowed: *ingesta multiformato*, *ciclo de publicación*, *roles
  institucionales*, *dashboard operativo*, *tests automáticos*, *gobierno del dato*.

### Public framing of the consultation: *comité*

*comité clínico* and *comité de expertos* are allowed public lexicon. Both are already public:
the home's chat mock ("Comité clínico", "Pregunta clínica al comité..."), process step 02
("Comité de expertos") and the product's own chat. They are the public face of what the
architecture calls orchestrator and experts, and the right target when rewriting *agentes
expertos* or *orquestador*.

| Rule | On-brand | Off-brand |
|---|---|---|
| Documentary verbs only | "el comité de expertos reúne las aportaciones de cada especialidad" | "el comité opina", "el comité decide la pauta" |
| Specialties and their corpus, not people | "consulta los corpus de Cardiología, Farmacología y Nefrología" | "un comité de especialistas revisa el caso" |
| Never a human sign-off | "la respuesta reúne las aportaciones con su procedencia; el clínico decide" | "validado por un comité de expertos" |

A committee that "validates" or "reviews" an answer claims a human review that did not happen.
That is HIGH (H9), not a lexicon slip.

### Banned lexicon

**Because they are vague or imply the professional is replaced (M7):**

- copiloto
- asistente virtual
- agente (in customer-facing copy)
- cerebro clínico
- segunda opinión (implies a clinical opinion)
- IA que piensa como un médico
- orquestado, orquestación (as an adjective or abstract noun: "orquestado por IA" names no
  component)

**Because they name the architecture (H7, a disclosure breach, `clinical-red-lines.md` §6):**

- orquestador
- agentes expertos (internally it is the architecture's term)
- sub-agente

Live copy that still uses them is known debt (`examples-and-rewrites.md` §12), never precedent.

**Corporate buzzwords (M8):**

- solución integral, solución end-to-end, solución escalable
- disruptivo, revolucionario, puntero, de vanguardia, next-generation
- sinergia, apalancar, cambio de paradigma
- ecosistema (unless it literally means a set of integrated systems)
- transformación digital as a standalone promise
- futurism: el futuro de la salud, ya está aquí, la sanidad del futuro

**Commercial fear (H8, see `clinical-red-lines.md` §5 for the legitimate alternative):**

- "no te quedes atrás"
- "el futuro no espera"
- "tus competidores ya están..."
- "no puedes permitirte..."

## 3. Rhythm and syntax

- **One idea per sentence.** Two clauses maximum; the second qualifies the first.
- **Paragraphs of 3-5 lines.** Under 2 lines reads as a soundbite; over 6 loses the clinician.
- **Sentence length target:** 15-28 words. A 40-word sentence is a paragraph that lost its period.
- **Verb-first thinking.** If the only verbs are *ser*, *haber*, *tener* or *permitir*, rewrite.

### Nominalisation chains

The single most common defect in institutional Spanish. Any string of two or more `de` phrases
carrying the meaning is a chain.

| Chain | Rewrite |
|---|---|
| "la implementación de la validación de la incorporación de contenidos" | "los contenidos se validan antes de incorporarse" |
| "la mejora de la trazabilidad de las respuestas del sistema" | "las respuestas quedan trazables" |
| "el establecimiento de criterios de aceptación de la revisión" | "el equipo fija qué respuestas acepta" |
| "una capa de consulta institucional con gobierno del dato" | "una consulta que la organización gobierna: quién publica, quién valida, qué versión responde" |

Mechanical test: count `de` in a sentence. Three or more, and the sentence needs verbs.

### Connectives to avoid

*Por otro lado*, *en este sentido*, *cabe destacar*, *es importante señalar*, *como hemos visto*,
*en definitiva*. They are filler that announces a transition instead of making one. Prefer a
concrete link: *La consecuencia operativa es...*, *El caso contrario...*, *Cuando el corpus
cambia...*.

## 4. The filler ban

The seed post is the reference for what **not** to do. Its padding pattern: a paragraph
makes a point, and the next paragraph restates it in different words with a hedge attached.

> "Estas señales no siempre indican un fallo grave, pero sí justifican una revisión."
> — `src/content/blog/como-medir-la-fiabilidad-de-una-respuesta-clinica.mdx`

That sentence adds no anchor, no example and no consequence. It exists to fill space.

**Detection heuristics:**

| Symptom | Example opener |
|---|---|
| Restates the previous paragraph | "En otras palabras...", "Es decir, ..." |
| Announces its own obviousness | "Como es lógico", "Evidentemente" |
| Hedged non-claim | "No siempre X, pero sí Y" with no criterion for telling them apart |
| Generic importance claim | "Esto es especialmente importante en organizaciones complejas" |
| Empty enumeration | "clínicos, responsables de sistemas, equipos legales y dirección" with nothing said about any of them |

**The fix is always the same:** delete, or add the missing anchor. "Estas señales justifican una
revisión" becomes useful the moment it says *who* reviews and *what they look at first*:

> "Una fuente citada que no sostiene la conclusión apunta a la recuperación; una omisión de
> advertencias, a la segmentación del corpus. El supervisor clínico decide cuál de las dos
> revisar primero."

## 5. Headlines, titles and headings

### The headline block

Every text block follows the identity manual's order: **antetítulo → titular → entradilla**. No
level is skipped or changes position.

| Level | Rules | Manual examples |
|---|---|---|
| **Antetítulo** | 1-4 words, noun phrase that places the topic. Typeset in caps by the layout (Sora Bold, wide tracking); the source string stays in sentence case | "IA médica institucional", "Prólogo · Filosofía", "Benchmark · Tiempo de respuesta" |
| **Titular** | States the idea. Sentence case, never typed or set in caps. One sentence, or two short ones: first idea, then second idea. 2-8 words per sentence | "Conocimiento aplicado.", "Evidencia clínica, siempre ordenada.", "Dos elementos. Un mismo sistema.", "Datos con un hilo común." |
| **Entradilla** | Explains it in one or two anchored sentences | "La plataforma reúne la evidencia clínica disponible y la devuelve ordenada, trazable y lista para decidir en consulta." |

**Two tones.** The titular may split into two tones: navy for the first idea and teal for the
second (Slate 50 and turquoise in dark). A resource, not an obligation, and never a third tone.
Write the two ideas so each stands alone: the split falls at a sentence or clause boundary,
never inside a noun phrase. "Superficies / y elevación." works because each half reads; "La
evidencia clínica / ordenada" does not.

Good two-idea headlines name a contrast or a consequence: *"El conocimiento avanza. La base se
actualiza."*, *"Tres capacidades. Una sola arquitectura."* Bad ones are a slogan cut in half:
*"El futuro de la salud. Ya está aquí."* (M8, M9).

### Full stops

| Type | Period | Where |
|---|---|---|
| **Display headline** | **Yes**, every sentence | Covers, heroes, section openers, chapter openers, slide titles, the blog post title, the two-idea titular |
| **Running heading** | **No** | H2-H4 inside articles and documents, TOC entries, card and component titles, table headers, metric labels, chart titles, buttons, navigation, `<title>`, email subjects, file names |
| **Antetítulo** | No | Always |
| **Entradilla, `excerpt`, captions** | Yes | Full sentences |

Questions and exclamations never take an extra period. No exclamation marks in headlines at all.

### Running headings

- Sentence case, not title case: *"Del documento fuente a la decisión: evidencia visible en cada
  consulta"*.
- A colon carries a subtitle. One colon per heading.
- No question marks in an H1 or display headline. A question is allowed as an H2 when the section
  answers it.
- Numbered H2 (`## 1. ...`) is fine in **marco** and **evidencia** articles and in documents with
  a table of contents. Avoid elsewhere.
- Headings carry the anchor: *"Señales de alerta"* is fine; *"Consideraciones adicionales"* is not.
- In decks and reports, a slide or section title states the claim, not the topic: *"Las
  respuestas citan el epígrafe exacto."* rather than *"Trazabilidad"*.

## 6. Punctuation and formatting

| Item | Rule |
|---|---|
| **Em dash (—)** | Sparingly. Parentheses for asides. Never two em dashes in one paragraph |
| **Emojis** | Never, anywhere |
| **Bold** | For the operative term of a paragraph, at most once per paragraph. Never a whole sentence |
| **Italics** | For a term being defined or quoted as language, not for emphasis |
| **Bullet lists** | Allowed for criteria, checks and enumerated failure modes. Not for prose that lost its paragraph. Maximum two lists per article section |
| **Numbered lists** | For sequences and criteria that will be referenced later |
| **Blockquotes** | At most one per article, for the piece's load-bearing sentence |
| **Quotation marks** | Spanish angle quotes «» for quoted speech; straight double quotes for terms in code or UI |
| **Percentages** | `30 %` with a (non-breaking) space, the RAE form the identity manual uses ("58 % del ancho"). Inside existing website UI strings that already write `30%`, follow the surrounding code |
| **Numbers** | Thousands with a period (`30.000`), decimals with a comma (`8,5`) |
| **Acronyms** | Expand on first use unless the buyer uses it daily (SSO, RPO, RTO, MIR, IA are safe) |

## 7. Word budgets per section

Budget the piece, then budget its sections. Overrun is a MEDIUM finding in review.

| Section | Share of the piece |
|---|---|
| Opening (problem statement, no product) | 10-15 % |
| Each body section | 20-25 % |
| Closing (reflective) | 10 % |

A 1.400-word **marco** piece is therefore roughly: 180-word opening, three 320-word sections,
140-word close. Write the numbers down before drafting.

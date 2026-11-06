# Formats

Structure and tone for every BinPar deliverable that is not a blog article (blog:
`post-archetypes.md`): proposals, reports, PDFs, decks, emails, product UI, job briefs,
internal documents, web pages, video, social posts, the team page and success cases. Visual layout belongs to `binpar-brand-design-system`; PDF generation to
`binpar-documents`. This file decides **what the words do**.

Common to all formats:

- Open with the **headline block**: antetítulo → titular → entradilla (`language-rules.md` §5).
- The reader must be able to act after the first screen or page: put the conclusion first.
- Dates written out, es-ES numbers, BinPar spelled exactly, no emojis.
- Figures carry their source and date. Outcomes on clinical practice stay calibrated (red line 2).

---

## 1. Commercial proposal (propuesta)

**Voice:** BinPar commits in the third person or as *nosotros*; the client is named ("el Hospital
Universitario X", "la Consejería"). Firm on commitments, calibrated on effects.

| Section | Budget | Content |
|---|---|---|
| Cover | — | Antetítulo "Propuesta" + client; titular in one or two ideas; entradilla stating what is proposed and for whom; date, version, recipient |
| Resumen ejecutivo | 150-250 words | The client's problem in operational terms, what BinPar proposes, what it requires from the client, the decision asked for |
| Contexto y necesidad | 200-400 | The client's situation with anchors: services, documents, roles, current failure modes. Their words where possible |
| Alcance | 300-600 | By capability: what is delivered, for which roles, on which documents. A table when items are many |
| Fuera de alcance | 50-150 | Explicit exclusions. Non-negotiable section |
| Plan | table | Phases with deliverable, owner (BinPar / client) and date or week |
| Gobierno y equipo | 100-250 | Roles on both sides: supervisor clínico, editor, responsable técnico. Who decides what |
| Condiciones económicas | table | Concept, unit, quantity, amount. State whether IVA is included. Validity of the offer |
| Próximos pasos | 3-5 items | Owner, action, date |

**Do:** *"BinPar entrega el entorno de preproducción en la semana 4. El Hospital designa un
supervisor clínico por servicio antes de esa fecha."*
**Don't:** *"Nuestra solución integral revolucionará la práctica clínica del hospital."* (M8, M9,
H2)

Never promise a clinical outcome as a deliverable. The measurable deliverable is the process:
*"un informe de preguntas de control al cierre de cada fase"*.

## 2. Report (informe: pilot results, benchmark, technical or status report)

**Reader:** public (analytical: product placement rules apply) or one client (BinPar commits,
the client is named).

| Section | Content |
|---|---|
| Conclusiones | 3-5 sentences first: what was found, how confident, what is decided next (BLUF) |
| Alcance y método | Period, centres, roles, corpus version, question set, who evaluated |
| Resultados | Tables and charts first, prose second. Every figure with n, period and context. Technical signal labelled as such |
| Limitaciones | What the method does not show. Required |
| Recomendaciones y decisiones pendientes | Each with owner and date |
| Anexos | Raw tables, question lists, glossary |

Chart and table titles are running headings (no period) that state the reading: *"La consulta
llega en 25 s de mediana, frente a 30"*, not *"Tiempo de respuesta"*. One protagonist figure per
chart; the rest is context.

## 3. PDF document (any printed or downloadable document)

Applies on top of the format's own structure.

- **Cover:** antetítulo, titular (display, with period), entradilla, then metadata: fecha,
  versión, destinatario, clasificación when relevant (*Confidencial*, *Uso interno*).
- **Index** when the document exceeds ~6 pages. TOC entries are the running headings verbatim.
- **Headings:** H1 per chapter may be a display headline; H2-H3 are running headings.
- **Captions:** one sentence with period, saying what the figure shows and its source.
- **Footer/running head:** "BinPar · <título corto>" and page number.
- **Closing page:** contact or next step, never a decorative "Gracias".
- Avoid orphan sections: no heading followed by fewer than two lines of text.

## 4. Deck, artifact, dashboard

Web pages: §9.


- **One idea per slide or screen.** The slide title is a display headline stating the claim (*"Las
  respuestas citan el epígrafe exacto."*), not the topic (*"Trazabilidad"*).
- **Body ≤ 40 words per slide**; prefer a figure, a diagram or three short items over prose.
- **Numbers** big and contextualised: *"+8.327 epígrafes clínicos"* plus the date of the count.
- **Section dividers** use the antetítulo + titular pattern.
- **Closing slide:** the next step or the contact, not *"¡Gracias!"* or *"¿Preguntas?"*.
- **Dashboards and artifacts:** labels are nouns in sentence case without period (*"Tiempo hasta
  el primer texto"*), values with units, empty states that say what to do (*"Sin consultas en el
  periodo seleccionado. Cambia el rango de fechas."*), dates written out.
- Speaker notes may use internal shorthand; the slides follow their audience (public, one client or internal).

## 5. Email

**Address:** first person of the sender, *tú* to the recipient. Switch to *usted* only when
the institution writes in *usted*, and keep it for the whole thread.

| Part | Rule |
|---|---|
| Subject | Specific, ≤ 60 characters, no period, no caps, no emoji: *"Propuesta piloto Atención Primaria · versión 2"* |
| First sentence | The purpose: *"Te escribo para confirmar la reunión de arranque del piloto."* |
| Body | ≤ 150 words for most emails; context only as needed; a short list for several items |
| Ask | One, explicit, with a date: *"¿Te encaja el miércoles 11 de noviembre a las 10:00?"* |
| Close | *"Un saludo,"* + first name, then the team signature from the website's generator (`/mail-generator`: role, name, contact, tile, legal notice). Don't retype what the signature carries. No *"Quedo a la espera de tus noticias"* filler |

Same red lines as public copy: an email to a client is a document they can forward.

## 6. Product UI text (chat, back office, website components)

- **Buttons and actions:** infinitive verb + object, sentence case, no period: *"Consultar la
  evidencia"*, *"Ver la evidencia"*, *"Solicitar reunión"*, *"Buscar en la evidencia"*.
- **Labels and titles:** nouns, no period: *"Idoneidad clínica"*, *"Fuentes"*.
- **Messages:** full sentences with period. Errors say what happened and what to do next: *"No se
  ha podido cargar el documento. Comprueba el formato (PDF o DOCX) y vuelve a intentarlo."*
- **Status and loading:** documentary verbs: *"Recuperando fuentes…"*, *"Sintetizando la
  respuesta…"*. Never *"Pensando…"*, *"Entendiendo tu pregunta…"* (H6). The chat and the
  editor still show *"Pensando"*: known debt (`examples-and-rewrites.md` §12).
- **Timestamps:** *"Actualizado el 12 de octubre de 2026"*.
- Address: the product uses *tú* throughout (chat and back office). Buttons stay in the
  infinitive; help text, onboarding and empty states use *tú*. Never *usted* in the product,
  never both on one surface. The system never speaks as *yo* or *nosotros* (H6).

## 7. Job brief, technical test, onboarding

**Address:** *tú* to the candidate or new hire.

| Section | Content |
|---|---|
| Contexto | What BinPar does, in two sentences, and what this role or test is for |
| Qué hay que hacer | The task in concrete deliverables |
| Entrega | Format, channel, deadline, expected time box (*"unas 6 horas"*) |
| Qué valoramos | Explicit criteria, ideally weighted. Candidates should know how they are judged |
| Qué no hace falta | Scope limits so effort goes where it counts |
| Condiciones | For job briefs: location, schedule, contract, salary band when it can be shared |

No *rockstar*, *ninja*, *familia*, *ambiente joven y dinámico*. Describe the work and the
criteria. Public technologies of the stack may be named; internal architecture and model
providers stay out.

## 8. Internal document (procedure, minutes, internal report)

**Voice:** team voice, imperatives allowed, internal vocabulary allowed. Label
*Uso interno*.

- **Procedure:** goal in one sentence, prerequisites, numbered steps (one action each), how to
  verify, who to escalate to.
- **Minutes (acta):** fecha, asistentes, decisiones (each a sentence with its owner), acciones
  (owner, action, date), temas abiertos. Decisions before discussion.
- **Internal report:** same as §2, shorter. Conclusions first.

Naming, no personification and no buzzwords still apply: internal documents end up forwarded.

## 9. Web pages, forms and calls to action

The website is the tone of record for the conversational voice (`voice-and-narrator.md` §3).

- **Every section** opens with the headline block. Display headlines take a period and may be
  two ideas: *"Todo empieza con las personas."*, *"De la pregunta a la evidencia."*
- **The entradilla carries the anchor.** The failure mode is the noun stack under a good
  headline: *"Una capa de IA seria, auditable y preparada…"* (M1). Name the role, the document,
  the decision or the failure mode.
- **Buttons:** infinitive + object, no period (*"Solicitar reunión"*, *"Comenzar la
  evaluación"*, *"Copiar firma"*). Imperatives in *tú* belong to text links and helper text.
- **Form labels:** nouns (*"Correo electrónico institucional"*, *"Cargo"*). **Helper text**
  in *tú* says why the field is asked: *"Usaremos esta dirección para enviarte el informe de la
  evaluación."* Placeholders in *tú* (*"Selecciona tu cargo"*).
- **Consent text:** what is stored, why, for how long and how to withdraw, in *tú*. The
  evaluator's consent is the model. Legal pages keep their own wording.
- **Confirmations:** what happened, when the reply arrives, what comes next: *"Mensaje
  recibido. Te respondemos en un día laborable."*
- **Metadata:** `<title>` follows `%s | BinPar`; the description is one or two sentences
  (≤ 160 characters) with an anchor, and may use *tú*. No banned lexicon there either:
  metadata is what search engines quote.

## 10. Video: scripts, voice-over, on-screen text and subtitles

Reference set: the October 2026 videos (platform presentation, CatSalut test, committee
improvements). They are rendered from HTML with a synthetic voice and ship with an `.srt`.

| Type | Length | Reader |
|---|---|---|
| Platform presentation or product demo | 2-6 min; short cut ≤ 3 min | Public |
| Explainer derived from a blog piece | 2-4 min | Public, analytical (product placement rules apply) |
| Social cut | 30-90 s | Public (§11) |
| Video report for one client | 3-6 min | One client, named (`clinical-red-lines.md` §4 for comparisons) |
| Internal video | free | *Uso interno* |

### The script (guion)

A Markdown file with numbered scenes, each with its time range and its voice-over text:
`## 03 · La plataforma (0:27–0:44)`. Two closing sections are required and never voiced:

- **Fuentes de las cifras**: every figure with its source, date and *n* ("514/539, producción,
  22 de septiembre de 2026, un intento, solo corpus").
- **Criterios aplicados**: voice decisions, the limits stated, and which screens are
  recreations of the product rather than production captures.

**Structure:**

1. **Opening (≤ 10 s; in a social cut, the thesis on screen within 3 s):** the name and the
   thesis in one sentence. *"BinPar para CatSalut. Así
   se ha puesto a prueba el chat clínico."*
2. **The problem**, in operational terms: role, document, failure mode.
3. **How it works**, at functional level. The disclosure boundary applies to every public
   video.
4. **Figures**, each with its context.
5. **Limits**, required whenever figures appear: *"Un examen no equivale a eficacia clínica, y
   conviene decirlo."*
6. **Close:** the next step (client and internal videos) or the sign-off. Standard sign-off:
   *"BinPar. El sistema ordena la evidencia. El clínico decide."*

### Writing for the ear

- One idea per sentence, 8-20 words. Voice-over runs at about 150 words per minute: the word
  budget of a scene is its seconds × 2,5.
- One figure per sentence. Fraction first, then percentage: *"219 de 246, un 89 %"*.
- In the voice-over text, write numbers, years and units the way they must be said when the
  synthetic voice misreads them (*"dos mil veinticinco"*, *"tres décimas de segundo"*). Screen
  and subtitles keep digits.
- No parentheses, slashes or unexpanded acronyms: the ear cannot see them. *"ERC"* becomes
  *"enfermedad renal crónica"*.
- Narrator per `voice-and-narrator.md` §3: *nosotros* for the team's work ("hemos estudiado,
  una a una, las 54 respuestas que fallaron"), *tú* sparingly. Personification stays banned in
  every video, internal ones included: *"la especialidad razona muy poco antes de
  responder"* → *"la especialidad lee su corpus entero y responde casi sin análisis previo"*.

### Voice direction

Every direction prompt, synthetic or human, carries:

- **Accent:** castellano peninsular de Madrid, distinction between *s* and *z/c*, no *seseo*,
  no neutral or Latin American intonation.
- **Style:** an institutional documentary narrator (RNE, La 2): sober, calm, confident, warm,
  without commercial enthusiasm. Paced, with natural pauses between sentences.
- **Pronunciation:** *«Bínpar» es una palabra llana con acento en la primera sílaba, BÍN-par,
  nunca bin-PAR.* Add local names that the voice may misread.

The voice provider or model is never credited in public material (red line 4); the internal
script may record it.

### On-screen text

- Title cards follow the headline block: antetítulo (*"Comité clínico · octubre de 2026"*),
  titular as a display headline with its period, optional entradilla.
- ≤ 8 words per sentence of the titular, ≤ 40 words on screen at once. The screen never contradicts or runs
  ahead of the voice.
- Figures with es-ES format and unit: *"89 %"*, *"35 s"*, *"< 1 céntimo"*.

### Subtitles (.srt)

- Every video ships with subtitles: social video autoplays muted.
- ≤ 2 lines, ≤ 42 characters per line, 1-7 s per cue, ≤ 17 characters per second. Cut at
  syntactic boundaries, never between article and noun or between number and unit.
- Digits, not words: *"219 de 246"*, *"89 %"*. A raw speech-to-text file writes numbers in
  words and runs past 42 characters and 20 characters per second: edit it before publishing.
- Subtitles transcribe; the only edit is condensing for reading speed. *BinPar* always spelt
  exactly.

## 11. LinkedIn and social posts

Two voices, the same red lines, disclosure boundary, naming and no-emoji rule.

| | BinPar page | Personal profiles of the team |
|---|---|---|
| Narrator | *nosotros*, *tú* to the reader | *yo*; "en BinPar hemos…" for team work |
| Topics | Blog pieces, notas de producto, public cases, events, hiring | Own work and learning; opinions marked as one's own |
| Commitments | Dates, launches, availability | Never on behalf of the company |

**Post anatomy (BinPar page):**

- The first two lines (≈ 200 characters, before *"ver más"*) carry the thesis with an anchor.
  No clickbait (*"No vas a creer…"*), no emoji, no exclamation.
- 80-200 words in paragraphs of one to three sentences. One idea; at most one figure per
  paragraph, each from the linked piece or with its source.
- One link, at the end. Zero to three hashtags, after it.
- Sharing a blog piece: give its single strongest finding, not its excerpt.
- Name an organisation only if it appears on the website's success-case map or has approved it
  in writing. Tag people only with their consent.
- Images and video formats: `binpar-brand-design-system` (`references/media.md`); video per §10.

**Model** (from the ingestion piece):

> "Un PDF clínico puede terminar la extracción sin errores y no contener el dato. En la batería
> que hemos medido hay un cartel de Código Infarto con el algoritmo entero dentro de una imagen:
> el texto extraíble son los 35 caracteres del título.
>
> Medimos la ingesta de 24 documentos reales de dos servicios de salud, desde guías y
> protocolos hasta calendarios y trípticos. En el artículo explicamos qué comprobar antes de
> construir respuestas sobre una guía, quién debería revisarlo y qué no detecta un recuento de
> caracteres.
>
> [enlace]"

## 12. Team page and people

The warmest surface of the brand, and the one place where *nosotros* may state a purpose
instead of a checkable action: *"Distintas miradas. Una misma curiosidad. Trabajamos para
acercar el conocimiento médico a quienes lo necesitan."* Superlatives, buzzwords and clinical
claims stay out.

- **Job titles:** standard industry titles are accepted as written (CEO, CTO, CFO, Full Stack,
  Front End, Analyst, Recruiter). No joke titles: *ninja*, *rockstar*, *gurú*, *wizard*.
- **Bios**, if any: role, what the person does at BinPar and their background, in one or two
  sentences in the third person.
- **Recruiting** copy on the page follows §7.

## 13. Success cases

- Name only organisations that appear on the website's success-case map or have approved it in
  writing.
- State the scope (level of care, service, documents, roles), never an outcome. Any effect on
  practice follows red line 2.
- Anchor the headline on the organisations, not on the future (*"El futuro de la salud. Ya
  está aquí."* is known debt).
- A comparison with the client's previous tool: `clinical-red-lines.md` §4.

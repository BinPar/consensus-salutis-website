# Formats

Structure and tone for every BinPar deliverable that is not a blog article (blog:
`post-archetypes.md`). Visual layout belongs to `binpar-brand-design-system`; PDF generation to
`binpar-documents`. This file decides **what the words do**.

Common to all formats:

- Open with the **headline block**: antetítulo → titular → entradilla (`language-rules.md` §5).
- The reader must be able to act after the first screen or page: put the conclusion first.
- Dates written out, es-ES numbers, BinPar spelled exactly, no emojis.
- Figures carry their source and date. Outcomes on clinical practice stay calibrated (red line 2).

---

## 1. Commercial proposal (propuesta)

**Register:** corporate. BinPar commits in the third person; the client is named ("el Hospital
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
**Don't:** *"Nuestra solución integral revolucionará la práctica clínica del hospital."* (M5, M8,
H2)

Never promise a clinical outcome as a deliverable. The measurable deliverable is the process:
*"un informe de preguntas de control al cierre de cada fase"*.

## 2. Report (informe: pilot results, benchmark, technical or status report)

**Register:** clinical when public, corporate when addressed to one client.

| Section | Content |
|---|---|
| Conclusiones | 3-5 sentences first: what was found, how confident, what is decided next (BLUF) |
| Alcance y método | Period, centres, roles, corpus version, question set, who evaluated |
| Resultados | Tables and charts first, prose second. Every figure with n, period and context. Technical signal labelled as such |
| Limitaciones | What the method does not show. Required |
| Recomendaciones y decisiones pendientes | Each with owner and date |
| Anexos | Raw tables, question lists, glossary |

Chart and table titles are running headings (no period) that state the reading: *"La consulta
responde antes que la media del sector"*, not *"Tiempo de respuesta"*. One protagonist figure per
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

## 4. Deck, artifact, dashboard, web page

- **One idea per slide or screen.** The slide title is a display headline stating the claim (*"Las
  respuestas citan el epígrafe exacto."*), not the topic (*"Trazabilidad"*).
- **Body ≤ 40 words per slide**; prefer a figure, a diagram or three short items over prose.
- **Numbers** big and contextualised: *"+8.327 epígrafes clínicos"* plus the date of the count.
- **Section dividers** use the antetítulo + titular pattern.
- **Closing slide:** the next step or the contact, not *"¡Gracias!"* or *"¿Preguntas?"*.
- **Dashboards and artifacts:** labels are nouns in sentence case without period (*"Tiempo hasta
  el primer texto"*), values with units, empty states that say what to do (*"Sin consultas en el
  periodo seleccionado. Cambie el rango de fechas."*), dates written out.
- Speaker notes may be in the corporate register; the slides follow the audience's register.

## 5. Email

**Register:** corporate. First person of the sender; *usted* on first contact with an
institution, *tú* once the recipient uses it, or between colleagues.

| Part | Rule |
|---|---|
| Subject | Specific, ≤ 60 characters, no period, no caps, no emoji: *"Propuesta piloto Atención Primaria · versión 2"* |
| First sentence | The purpose: *"Le escribo para confirmar la reunión de arranque del piloto."* |
| Body | ≤ 150 words for most emails; context only as needed; a short list for several items |
| Ask | One, explicit, with a date: *"¿Le encaja el martes 11 de noviembre a las 10:00?"* |
| Close | *"Un saludo,"* + name, role, BinPar. No *"Quedo a la espera de sus noticias"* filler |

Same red lines as public copy: an email to a client is a document they can forward.

## 6. Product UI text (chat, back office, website components)

- **Buttons and actions:** infinitive verb + object, sentence case, no period: *"Consultar la
  evidencia"*, *"Ver la evidencia"*, *"Solicitar reunión"*, *"Buscar en la evidencia"*.
- **Labels and titles:** nouns, no period: *"Idoneidad clínica"*, *"Fuentes"*.
- **Messages:** full sentences with period. Errors say what happened and what to do next: *"No se
  ha podido cargar el documento. Compruebe el formato (PDF o DOCX) y vuelva a intentarlo."*
- **Status and loading:** documentary verbs: *"Recuperando fuentes…"*, *"Sintetizando la
  respuesta…"*. Never *"Pensando…"*, *"Entendiendo tu pregunta…"* (H6).
- **Timestamps:** *"Actualizado el 12 de octubre de 2026"*.
- Second person: avoid it with infinitives and impersonal forms; where a sentence truly needs it
  (onboarding steps), use *usted* in institutional products unless the product already uses *tú*
  consistently. Never mix both in one surface.

## 7. Job brief, technical test, onboarding

**Register:** corporate, *tú* to the candidate or new hire.

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

**Register:** corporate team voice, imperatives allowed, internal vocabulary allowed. Label
*Uso interno*.

- **Procedure:** goal in one sentence, prerequisites, numbered steps (one action each), how to
  verify, who to escalate to.
- **Minutes (acta):** fecha, asistentes, decisiones (each a sentence with its owner), acciones
  (owner, action, date), temas abiertos. Decisions before discussion.
- **Internal report:** same as §2, shorter. Conclusions first.

Naming, no personification and no buzzwords still apply: internal documents end up forwarded.

---
name: binpar-brand-voice
description: >
  BinPar brand voice and writing style guide (Spanish, es-ES). BinPar is one brand for the company
  and its institutional clinical AI platform. Provides the tone identity (clinical sobriety in a
  conversational voice: nosotros for the team, tú to the reader), the four calibration dials,
  naming and pronunciation, the ban on personifying the AI, the coined lexicon, clinical and
  regulatory red lines, the public disclosure boundary, headline composition, format guidance
  (web pages and forms, blog archetypes, video scripts, voice-over and subtitles, LinkedIn posts,
  team and success-case pages, proposals, reports, PDFs, decks, emails, product UI text, job
  briefs) and a review mode with severities. Use when writing, editing, reviewing or auditing
  any BinPar copy or script: website, blog, videos, social posts, proposals, reports, PDFs,
  decks, artifacts, emails, product microcopy, internal or hiring documents. Sister skill to
  binpar-brand-design-system: that one says how the brand looks, this one says how it talks.
---

# BinPar Brand Voice

## Identity: clinical sobriety

**BinPar** turns clinical guidelines, protocols and medical corpus into traceable answers for
healthcare organisations. Three capabilities stand behind it: BinPar (product and engineering),
Editorial Médica Panamericana (clinical knowledge) and AWS (resilient infrastructure). BinPar is
now a single-product company: the company and the platform share one name and one voice.

The reference is **not a SaaS blog**. It is the editorial of a medical journal, or the preamble
of a clinical guideline, told by the people who build the platform. Since the November 2026
website the voice is **conversational**: *nosotros* for the team, *tú* to the reader. Authority
still comes from precision, never from enthusiasm.

BinPar sells **defensibility**: the reader should close the piece thinking *«esto lo puedo
sostener delante de un comité»*. Anything that does not serve that is cut.

**Language:** all customer-facing copy is **Spanish (es-ES)**. This skill is written in English;
every quoted string, example and rewrite stays in Spanish.

> Sources: the production copy of the BinPar website (November 2026) and product (tone of
> record), the October 2026 videos, and the
> **BinPar identity manual v1.0 (October 2026)**, whose own copy is on-brand reference material:
> *"Conocimiento aplicado."*, *"Evidencia clínica, siempre ordenada."*, *"La plataforma reúne la
> evidencia clínica y la devuelve ordenada, para que cada decisión se tome con criterio."* Where
> live copy breaks a rule here, the rule wins for new copy (`references/examples-and-rewrites.md`
> §12 lists the known debt).

## Naming

| Rule | Detail |
|---|---|
| **Spelling** | **BinPar**: one word, capital B and P, in prose, `alt`, `aria-label`, metadata, file titles and email subjects. Never "Binpar", "BINPAR" typed, "Bin Par", "binPar" |
| **All caps** | Only through CSS `uppercase` (or the layout engine) on eyebrows and micro-labels; the source string stays "BinPar" |
| **Separator** | " · " between the name and a qualifier: "BinPar · Lecturas clínicas", "BinPar · Manual de identidad". `<title>` follows each surface's template (website `%s \| BinPar`; apps "BinPar — Chat", "BinPar — Xat" (ca), "BinPar — Editor") |
| **Possessive** | "de BinPar": "el equipo de BinPar". No article: "BinPar convierte…", never "la BinPar" |
| **Product or company** | The name covers both. When a sentence needs the difference: *la plataforma* for the product, *el equipo de BinPar* for the people. Legal text only: **BinPar Team S.L.** |
| **Legacy name** | Never "Consensus Salutis", "Consensus" or "CS" in new copy. One exception: "BinPar (antes Consensus Salutis)" once, at first mention, for readers who know the old name |
| **Spoken** | «Bínpar»: *llana*, stress on the first syllable, BÍN-par, never bin-PAR. Write it into every voice-over direction |
| **Contact** | `info@binpar.com`, `nombre@binpar.com`, `binpar.com`. Email signatures come from the website's generator (`/mail-generator`) |
| **Addresses and IDs** | Domains, mailboxes and IDs keep their spelling (legacy `consensussalutis.com`, `consensussalutis@binpar.com`, author slug `equipo-consensus-salutis`). Quote them verbatim, never derive a name from them. Lowercase `binpar` exists only in identifiers (URLs, file names, domains) |

> Full detail: `references/voice-and-narrator.md` §4. The name as a graphic (logo files, never
> typeset as a logo) belongs to `binpar-brand-design-system` (`references/logo.md`).

## The four dials

| Dial | Position | Rule |
|---|---|---|
| **Certainty** | Calibrated, never maximal | Declaring limits is on-brand. Prefer "puede enlazar", "se diseña para", "conviene comprobar" over absolutes. Commitments BinPar makes (scope, dates, deliverables) are firm; effects on practice are calibrated |
| **Concreteness** | High | Every claim needs an operational anchor: a **role**, a **document**, a **decision** or a **failure mode**. Never a paragraph that only stacks nouns |
| **Rhythm** | Medium | One idea per sentence, 15-28 words, paragraphs of 3-5 lines. Subordination is fine; chained nominalisation is not |
| **Warmth** | Low but not cold | Respect for professional judgement: **el sistema ordena, el clínico decide**. No compliments, no "sabemos que". *tú* and *nosotros* do not raise this dial |

> Full detail: `references/voice-and-narrator.md` §2

## Narrator and address

**Conversational, everywhere.** BinPar speaks as **nosotros** and addresses the reader as
**tú**: website, blog, videos, social, emails, product UI. The product already uses *tú*
throughout. Conversational is not promotional:

| Allowed | Not allowed |
|---|---|
| *nosotros* with a checkable action: "hemos medido 24 documentos", "te respondemos en un día laborable" | *nosotros* with a belief, feeling or rank: "creemos que", "nos apasiona", "somos líderes" (M5) |
| *tú* with a decision or an action: "si tu servicio actualiza el protocolo…", "abre la cita" | Flattery, empathy claims, brochure questions: "sabemos lo duro…", "¿Y si tu equipo pudiera…?" (M4) |
| Impersonal analysis inside any piece: "una respuesta puede sonar correcta y omitir una contraindicación" | *tú* and *usted* on one surface; *usted* outside legal text or an *usted* email thread (M4) |

- **The system is never *nosotros* or *yo*.** "Hemos revisado tu pregunta" in the chat is
  personification (H6).
- **No imperative about clinical conduct** (H9). Imperatives are for navigation, forms and
  process.
- **Analytical pieces** (blog, explainer videos, public reports): the product never in the
  opening, never as a closing sale, at most twice in the body. The team narrating its own
  method is not placement. Exception: *nota de producto*.
- **Documents for a reader who must act** (proposals, client reports, emails, job briefs,
  internal documents): BinPar or *nosotros* commits ("BinPar propone", "entregamos el entorno
  el 15 de enero"); the client by name. Internal documents carry *Uso interno*.
- **Team page:** the one place where *nosotros* may state a purpose ("Trabajamos para acercar
  el conocimiento médico a quienes lo necesitan."). Standard job titles in English are fine; no
  joke titles (*ninja*, *rockstar*).

**Never relaxes, anywhere:** naming, no personified AI, the red lines, calibrated claims,
operational anchors, no buzzwords, no emojis, es-ES formatting. The disclosure boundary relaxes
only in internal documents (*Uso interno*).

> Full detail: `references/voice-and-narrator.md` §3, formats in `references/formats.md`

## Never personify the AI

*el sistema entiende / sabe / juzga / decide* attributes agency, and with agency comes clinical
responsibility. This is a tone rule and a liability rule.

| Allowed verbs | Banned verbs |
|---|---|
| recupera, referencia, sintetiza, prioriza, señala, devuelve, contrasta, enlaza, registra, versiona, ordena | entiende, sabe, interpreta, juzga, decide, opina, diagnostica, aprende de ti, comprende, razona, piensa |

Applies to UI too: a loading state says *"Recuperando fuentes…"*, never *"Pensando…"*.

> Full verb tables: `references/language-rules.md` §1

## Coined lexicon

| Term | Meaning |
|---|---|
| **consenso verificable** | Flag term: a conclusion anyone can trace back to its source |
| **evidencia visible** | The source fragment is reachable from the answer, not merely claimed |
| **gobierno del conocimiento clínico** | Roles, controlled publication and versioning over the corpus |
| **preguntas de control** | The battery that checks the system has not degraded |
| **corpus vivo** | A base that changes, and therefore needs versioning |
| **umbral de revisión** | When an answer requires a human eye |

**Allowed public framing:** *comité clínico*, *comité de expertos*, with documentary verbs only
(reúne, contrasta, sintetiza), never as a human panel that validated the answer.

**Banned:** copiloto, asistente virtual, agente, cerebro clínico, segunda opinión, *orquestado* /
*orquestación* (vague, M7); orquestador, agentes expertos, sub-agente (architecture, H7);
corporate buzzwords and futurism (M8).

> Full detail: `references/language-rules.md` §2

## Clinical and regulatory red lines

**High severity. Any one invalidates the piece, in every format.**

1. **No diagnosis or therapeutic indication.** The system does not diagnose, prescribe or
   recommend treatment for a specific patient. Write about documents and criteria.
2. **No efficacy claim without a source.** No "mejora los resultados" or "reduce errores un X %"
   without a citable study. Benchmarks are *señal técnica contextualizada*, labelled as such.
3. **No regulatory badge.** No CE, MDR, medical-device status, ISO, ENS or AI Act conformity
   unless accredited and named. Write design orientation, not conformity.
4. **No competitors, no model or provider names.** Position by contrast of approach. Only a
   report, deck or video for one client, about a comparison that client commissioned, may name its
   current tool.

Commercial fear is banned ("no te quedes atrás"); clinical risk analysis is the brand's home
ground ("una respuesta puede sonar correcta y omitir una contraindicación").

**Disclosure boundary.** Public copy stops at the functional level: the problem and the
guarantee, never the implementation (no Convex, AI SDK, CRC, anchors, RAG, prompts, table names,
model slots, *orquestador*).

> Full detail and translation table: `references/clinical-red-lines.md`

## Headline composition

From the identity manual: every text block follows **antetítulo → titular → entradilla**. No
level is skipped or reordered.

| Level | Role | Rules |
|---|---|---|
| **Antetítulo** | Places the topic | 1-4 words, noun phrase, typeset in caps by the layout ("IA médica institucional", "Gobierno del conocimiento"). Source string in sentence case |
| **Titular** | States it | Sentence case, never typed in caps. One or **two short sentences**: first idea, then second idea ("Evidencia clínica, siempre ordenada.", "Dos elementos. Un mismo sistema."). In two-tone layouts the first idea takes navy, the second teal; never a third tone. 2-8 words per sentence |
| **Entradilla** | Explains it | One or two sentences, anchored ("La plataforma reúne la evidencia clínica disponible y la devuelve ordenada, trazable y lista para decidir en consulta.") |

**Full stops.** Display headlines (covers, heroes, section openers, slide titles, chapter
openers, the blog post title) end with a period, as in the manual. **Running headings** (H2-H4
inside articles and documents, TOC entries, card titles, table headers, metric labels, buttons,
navigation, `<title>`, email subjects) take no period. Questions and exclamations never take one.

> Detail and examples: `references/language-rules.md` §5

## Formats

| Format | Read |
|---|---|
| Blog article (5 archetypes: marco, mecanismo, sector, evidencia, nota de producto) | `references/post-archetypes.md` |
| Proposal, report, PDF, deck or artifact, email, product UI, job brief, internal document | `references/formats.md` §1-§8 |
| Web pages, forms and calls to action | `references/formats.md` §9 |
| Video: script, voice-over, voice direction, on-screen text, subtitles | `references/formats.md` §10 |
| LinkedIn: BinPar page and personal profiles | `references/formats.md` §11 |
| Team page, success cases | `references/formats.md` §12-§13 |

Blog closings are reflective (no CTA except *nota de producto*). Proposals, reports and emails
end with concrete next steps: owner, action, date. Videos close with the next step or the
sign-off *"BinPar. El sistema ordena la evidencia. El clínico decide."*

## Writing rules (short form)

- No chained nominalisation: turn nouns back into verbs; three `de` in a sentence means rewrite.
- No paragraph that restates the previous one; no hedged non-claims.
- No emojis, anywhere. Em dash sparingly; parentheses for asides.
- es-ES numbers: `30.000`, `8,5`; dates written out ("12 de octubre de 2026").
- No anglicisms where Spanish exists (*hallazgo*, *cumplimiento*, *despliegue*, *capacidad*).
- Budget words per section, not only per piece.

> Full detail: `references/language-rules.md`

## Workflow: writing

1. **Identify the format** (`references/formats.md` or a blog archetype) and who reads it
   (public, one client, internal). Write the word budget per section (for video: seconds × 2,5)
   before drafting.
2. **Name the operational anchor**: the role, document, decision or failure mode the piece is
   about. If there is none, there is no thesis yet.
3. **Compose the headline block**: antetítulo, titular (one or two ideas), entradilla.
4. **Draft against the four dials.** Every claim gets its anchor; limits are stated.
5. **Place the product** per the format (analytical pieces: at most twice in the body).
6. **Close** per the format: reflective (blog) or next steps (proposal, report, email).
7. **Run the checklist** in `references/review-checklist.md`. Fix every HIGH before delivering.

## Workflow: review mode

Do not just diagnose. Produce a table of violations with severity and a rewrite for each:

| # | Fragment (verbatim) | Code | Severity | Proposed rewrite |
|---|---|---|---|---|

**HIGH** (clinical, regulatory, disclosure, personification) · **MEDIUM** (abstraction, filler,
narrator drift, banned lexicon) · **LOW** (mechanical). Order by severity; end with a verdict:
*publicable*, *publicable con correcciones* or *reescritura*. Judge the address against the
format (`formats.md`): *tú* everywhere except legal text and *usted* email threads.

> Codes, thresholds and a worked audit: `references/review-checklist.md`

## Compliance checklist (short form)

- [ ] Format and reader identified; *tú* consistent; every *nosotros* has a checkable action
- [ ] Name: BinPar, exactly; no legacy name beyond one "antes Consensus Salutis" note
- [ ] Certainty calibrated on effects, firm on commitments; no absolutes
- [ ] Every claim has a role, document, decision or failure mode
- [ ] No personification (entiende/sabe/juzga/decide/interpreta/piensa, "Pensando…", the system
      as *nosotros*), UI included
- [ ] Lexicon: coined terms consistent; no copiloto/asistente/agente/orquestador
- [ ] Red lines 1-4 clear; fear is clinical risk, never commercial
- [ ] Disclosure: functional level only (unless *Uso interno*)
- [ ] Headline block: antetítulo → titular → entradilla; titles never in caps; periods only on
      display headlines
- [ ] No restating, no nominalisation chains, no emojis, es-ES numbers
- [ ] Closing fits the format
- [ ] Video: figures sourced in the script, limits stated, subtitles within limits, «Bínpar» in
      the voice direction

## Reference index

| File | Topic | Read when... |
|---|---|---|
| `references/voice-and-narrator.md` | Emotional core, four dials in depth, conversational narrator, documents that commit, naming and pronunciation | Setting or checking the voice of a piece |
| `references/language-rules.md` | Verbs, coined lexicon, banned words, rhythm, headlines and titles, punctuation | Writing sentences, choosing words |
| `references/clinical-red-lines.md` | Diagnosis, efficacy, regulatory, competitors, fear, disclosure | Any claim about what the system does or achieves |
| `references/formats.md` | Proposals, reports, PDFs, decks, emails, UI, job briefs, internal docs, web pages, video, LinkedIn, team page, success cases | Any non-blog deliverable |
| `references/post-archetypes.md` | Five blog archetypes: structure, budgets, openings, closings | Planning a blog piece |
| `references/examples-and-rewrites.md` | Before/after rewrites; known debt in live site and product copy | Learning by contrast; reviewing site copy |
| `references/review-checklist.md` | Severity codes, review format, pre-delivery checklist, worked audit | Auditing copy |

## Examples

### 1. Blog article

*"Escribe el post sobre trazabilidad documental para el blog"* → archetype **mecanismo**
(1.200-1.600 words). Opens with the sector problem, no product. *nosotros* for what the team
measured, analysis in impersonal sentences. Uses *evidencia visible* and *corpus vivo*
consistently. Describes the guarantee, never the anchor mechanism. BinPar at most twice in the
body. Reflective close. Post title is a display headline with a period; H2s without.

### 2. Commercial proposal

*"Prepara la propuesta para el Hospital X"* → `references/formats.md` §1. Cover block, executive
summary first, scope by capability with roles on both sides, explicit exclusions, dated plan,
economic table, dated next steps. "BinPar propone…" as subject; no outcome promise.

### 3. Email

*"Escribe a la Consejería para cerrar la reunión del piloto"* → `references/formats.md` §5.
Specific subject without a period, purpose in the first sentence, *tú* (or *usted* if the
Consejería writes in *usted*), one ask with a date, the generated team signature.

### 4. Video

*"Haz un vídeo de 60 segundos para LinkedIn con el post de ingesta"* → `references/formats.md`
§10-§11. Script with numbered scenes (≈ 150 words), the thesis on screen in the first three
seconds, one figure per sentence with its source in *Fuentes de las cifras*, a limits beat, the
sign-off, the voice direction with «Bínpar», and an `.srt` within 42 characters per line.

### 5. A request that crosses a red line

*"Di que reducimos los errores diagnósticos un 30 %"* → decline the claim, name red line 2, and
offer the defensible alternative: the documented technical signal with its context, or the figure
only with a citable study attached.

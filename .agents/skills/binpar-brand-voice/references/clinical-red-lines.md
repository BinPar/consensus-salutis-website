# Clinical and Regulatory Red Lines

> Severity is HIGH throughout §1-§4. A single violation invalidates the piece. It does not get
> softened, it gets rewritten. §5 and §6 cover the two boundaries that are easiest to cross by
> accident: fear framing and technical disclosure.

## 1. No diagnosis, no therapeutic indication

BinPar is a decision-support and evidence-consultation layer. It does not diagnose, does not
prescribe and does not recommend a course of treatment for a specific patient.

### Banned constructions

- "el sistema sugiere el tratamiento adecuado"
- "indica la pauta recomendada para el paciente"
- "ante estos síntomas, la plataforma orienta el diagnóstico"
- "recomienda derivar" (about a concrete case)
- any worked example that walks a named or described patient to a clinical conclusion

### The safe pattern

Write about **documents and criteria**, never about a patient's management. The system returns
what the corpus says; the clinician applies it.

| Off-brand | On-brand |
|---|---|
| "El sistema recomienda ajustar la dosis en insuficiencia renal." | "La respuesta enlaza el epígrafe de la guía que trata el ajuste de dosis en insuficiencia renal." |
| "Ante una sospecha de infarto, la plataforma indica el protocolo a seguir." | "La consulta devuelve el protocolo de código infarto vigente en el centro, con la versión publicada y su fuente." |
| "Orienta el diagnóstico diferencial." | "Reúne, de las fuentes priorizadas por la organización, el material que el profesional necesita para su propio diagnóstico diferencial." |

### Clinical examples in articles

If an article needs a clinical example, keep it at the level of **the question and the document**,
not the patient and the outcome. Acceptable: *"una duda sobre criterios de derivación en un
paciente pluripatológico"*, where the example names the documentary problem. Not acceptable: any
example that states what should be done to that patient.

The website's process walkthrough crosses this line (a described patient taken to
considerations): known debt, never a model (`examples-and-rewrites.md` §12).

The brand's standing position, owned by this skill, can be quoted verbatim wherever the boundary
needs stating:

> "El producto se comunica como soporte a decisión y consulta de evidencia, no como sustituto del
> criterio profesional."

## 2. No efficacy claim without a source

Any statement about clinical outcomes, error rates, time saved or quality improvement needs a
citable study. Not an anecdote, not a pilot impression, not a plausible inference.

### Banned without a citation

- "mejora los resultados del paciente"
- "reduce los errores un X %"
- "ahorra X horas por profesional y semana"
- "aumenta la seguridad del paciente"
- "acorta el tiempo de diagnóstico"
- "los profesionales aciertan más con el sistema"

### What is allowed

**Documented technical signal, with its context.** The model wording (from an earlier website
page, kept by this skill):

> "600/600 — Señal técnica MIR documentada y contextualizada."
> "Los benchmarks se presentan como señal técnica contextualizada."

That is a benchmark result about the system, not a clinical outcome about patients, and it is
labelled as such. Keep the labelling. A bare "600/600" without "señal técnica contextualizada"
nearby drifts toward an efficacy claim.

**Operational facts about the platform** are fine and need no study: number of supported formats,
roles available, RPO of 24 hours, RTO under 8 hours, corpus size, years of editorial curation.
They describe the product, not its clinical effect. The home's volume band is the live model:
*"+3 TB Conocimiento médico estructurado"*, *"+8.327 Epígrafes clínicos"*, *"+30.000 Preguntas de
evaluación"*, *"<24 h Actualización urgente"*. In proposals and reports, give operational figures
their date ("a 30 de octubre de 2026") because they change.

### If a figure is requested and no study exists

Decline the figure, name this red line, and offer one of:

1. The documented technical signal with its context.
2. A qualitative statement about the mechanism: *"la revisión se concentra donde hay más riesgo de
   ambigüedad"*, which is a design claim, not an outcome claim.
3. A conditional framed as a hypothesis to be measured: *"es el tipo de efecto que las preguntas
   de control permiten medir en cada organización"*.

## 3. No medical-device or regulatory badge

Never state or imply a certification the product does not hold.

### Banned unless accredited, with the accreditation named

- marcado CE, CE marking
- producto sanitario, dispositivo médico, MDR / Reglamento (UE) 2017/745
- conformidad con el AI Act / sistema de alto riesgo certificado
- certificación sanitaria, homologación, ISO 13485, ISO 27001, ENS, HDS
- "cumple el RGPD" as a flat statement of conformity

### The safe pattern: design orientation, not conformity

The standing position (from an earlier website security page, kept by this skill):

> "La comunicación pública habla de diseño orientado a cumplimiento, controles técnicos y
> trazabilidad, evitando promesas absolutas si no van acompañadas de certificaciones o informes
> específicos."

| Off-brand | On-brand |
|---|---|
| "Plataforma certificada para entornos sanitarios." | "Plataforma diseñada para operar en entornos sanitarios: despliegue en la Unión Europea, auditoría completa y trazabilidad de acciones." |
| "Cumple el RGPD." | "El tratamiento se diseña para entornos autorizados y las consultas no se usan para entrenar modelos globales." |
| "Conforme al AI Act." | "El diseño anticipa los requisitos de trazabilidad y supervisión humana que exige la regulación europea de IA." |

Writing **about** regulation is the **sector** archetype's main subject.
The line is between analysing a framework and claiming conformity with it.

## 4. No competitors, no model names

- **Never name a competitor**, not even neutrally, not even to agree with them.
- **Never name a model or provider**: no GPT, Claude, Gemini, Llama, OpenAI, Anthropic, Google,
  OpenRouter, and no version numbers. Public copy says *el modelo*, *los modelos de lenguaje*,
  *inteligencia artificial generativa*.
- **No feature comparison tables** against other products.

Positioning is done by **contrast of approach**, described in the abstract:

| Off-brand | On-brand |
|---|---|
| "A diferencia de los chatbots genéricos como [X]..." | "Un chat de propósito general responde con lo que ha visto; una capa institucional responde con lo que la organización ha publicado y puede señalar de dónde viene." |
| "Usamos el mejor modelo del mercado." | "La calidad reside en el contenido curado y en el proceso de validación, no en la elección de modelo." |
| "Mejor que buscar en PubMed." | "La búsqueda documental devuelve documentos; la consulta institucional devuelve una síntesis con su fuente localizable." |

The second row is also the brand's genuine thesis, taken from the functional documents: value
lives in the curated corpus. It is safe to say publicly because it names no one.

## 5. Fear: commercial vs clinical

**Banned, commercial fear.** Pressure about the organisation's competitive position.

- "no te quedes atrás"
- "las organizaciones que no adopten IA perderán competitividad"
- "el futuro de la sanidad no espera"
- "tus competidores ya lo están usando"

**Legitimate and necessary, clinical risk analysis.** Describing how a system fails is the
brand's home ground. It is what makes the copy defensible.

- "Una respuesta puede sonar correcta y omitir una contraindicación."
- "Una fuente citada puede no sostener la conclusión que la acompaña."
- "Sin preguntas de control, cada actualización del corpus es un acto de confianza difícil de
  auditar."
- "Un corpus sin versionado no permite saber qué respondía el sistema hace seis meses."

**The distinction:** commercial fear is about what the organisation *loses by not buying*;
clinical risk is about how a *system fails in operation*. The first is banned. The second is
material.

## 6. The disclosure boundary

Public copy stops at the **functional level**: what the organisation gets, and what guarantee it
has. Never the implementation.

### Banned terms in public material

Convex, AI SDK, Vercel AI SDK, CRC, CRC-8, checksum, anchor, anchors, delta, PR, VFS, orquestador,
agentes expertos, sub-agente, tool, prompt, embedding, chunking, RAG, table or collection names,
model slots, provider names, version numbers, `<remember>` / `<update>` / `<bookmark>` and any
other internal markdown tag, token counts of the corpus internals.

Some of these are respectable engineering vocabulary. They are still out: they describe how it is
built, and public copy answers what it guarantees.

*comité clínico* and *comité de expertos* are **not** on this list. They are the allowed public
face of the orchestrator and its experts (rules in `language-rules.md` §2).

*orquestado* and *orquestación* are not on it either. As an adjective or an abstract noun
("orquestado por IA") they name no component: banned lexicon (M7, `language-rules.md` §2), not a
disclosure breach (H7).

### The translation table

| Internal mechanism | Public phrasing |
|---|---|
| Anchors with CRC-8 over a global counter | "una cita que sigue apuntando al párrafo correcto después de que el documento se actualice, y que puede verificarse" |
| Delta per expert reviewed as a PR | "los cambios se proponen sobre el contenido existente y un editor humano los revisa antes de publicarlos" |
| Full-context injection per expert | "cada especialidad se consulta sobre su propia base curada" |
| Orchestrator + expert loop | "la consulta se resuelve contra las fuentes relevantes y se sintetiza una respuesta con su procedencia"; where the multi-specialty framing helps, "el comité de expertos reúne las aportaciones de cada especialidad, cada una consultada sobre su propio corpus" |
| `<bookmark>` tags in the enriched markdown | "cada fragmento conserva el enlace a su sección de origen" |
| Test/preproduction/production environments in Convex | "pruebas, preproducción y producción separadas para cargar, validar y publicar conocimiento sin perder control" |
| Regression suite over control questions | "preguntas clave para comprobar que nuevos contenidos no degradan respuestas críticas" |
| Multi-tenant inheritance | "cada organización mantiene su propio conocimiento sobre una base común" |

All rows are standing phrasing. When in doubt, check whether the concept already has a public
phrasing on the current site and reuse it, except the fragments listed as known debt in
`examples-and-rewrites.md` §12.

### The rule of thumb

Describe **the problem and the guarantee**. If a sentence would only make sense to someone who has
read the repository, it is over the line.

Named third-party infrastructure that is part of the commercial story is the exception and stays
allowed, because it is already public: AWS and Editorial Médica Panamericana (the two pillars
beside BinPar in the home's architecture section), and the observability integrations the former
security page listed (CloudWatch, Datadog, Splunk, Grafana Loki, Sentry). Those are integration
targets the buyer asks about, not internals. BinPar is the product's own name, not a third party.

### Where the boundary applies

| Document | Boundary |
|---|---|
| Website, blog, decks for an audience, public reports, proposals, emails to clients | Applies in full |
| Technical annex requested by a client's IT or security team (architecture, integration, hosting) | Infrastructure and integration facts are allowed (cloud region, SSO, logging targets, RPO/RTO). Model providers, internal component names and prompts stay out unless a contract requires them, and then only in that annex |
| Job brief or technical test | Public technologies of the role's stack may be named (languages, frameworks). Internal architecture and model providers stay out |
| Internal document marked *Uso interno* | Does not apply |


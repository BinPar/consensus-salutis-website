# Examples and Rewrites

Every "before" not marked as a draft is real copy from the BinPar website (or an earlier version
of it, marked *former*). The point is not that the existing copy is bad. Most of it is on-brand, and several fragments are
quoted elsewhere in this skill as models. The point is to show the four or five failure modes
that recur, on material the team recognises. §12 lists the current site copy that breaks a rule
of this skill: known debt, never a model.

---

## 1. Noun stacking with no operational anchor

**Before**, the home's volume band intro:

> "Una base médica estructurada que incorpora las guías y protocolos de cada organización, con
> evaluación continua y validación clínica."

**Diagnosis:** MEDIUM. Nothing false, nothing checkable. Two nominalisations (*evaluación
continua*, *validación clínica*) hide who evaluates, against what, and who validates. No role, no
decision, no failure mode.

**After:**

> "Una base médica estructurada que incorpora las guías y protocolos de cada organización: un
> editor revisa cada cambio antes de publicarlo, y las preguntas de control comprueban en cada
> actualización que las respuestas críticas no se degradan."

**What changed:** the two nominalisations became two operations with their subjects. One role
(*editor*), one decision (*publicarlo*), one failure mode (*se degradan*) and a coined term
(*preguntas de control*). Same register.

---

## 2. Headlines: display vs running, and the two-idea split

**Before**, display headings on the site and a draft:

> "Tres capacidades. Una sola arquitectura."
> "El conocimiento avanza. La base se actualiza."
> "El futuro de la salud. Ya está aquí."
> "TRAZABILIDAD CLÍNICA" (draft slide title)
> "Consideraciones adicionales." (draft H2 inside a report)

**Diagnosis:** the first two are on-brand: two ideas, each a sentence with its period, the
identity manual's two-tone titular. The third has the same shape and no content (M8, M9). The
fourth is set in caps and names a topic instead of a claim (L1). The fifth is a running heading
with a period and no anchor (L1, M1).

**After:**

> "Tres capacidades. Una sola arquitectura." (unchanged)
> "El conocimiento avanza. La base se actualiza." (unchanged)
> "IA médica en el sistema sanitario. Con evidencia visible."
> "Las respuestas citan el epígrafe exacto."
> "Límites del piloto"

Rule: `language-rules.md` §5.

---

## 3. Second person

**Before**, the website's contact assistant and platform walkthrough:

> "Hablemos de tu organización."
> "¿Qué te gustaría explorar con BinPar?"
> "Hemos recibido tu consulta. Nuestro equipo te responderá en …"
> "Explora la interfaz, los paneles y tu área de usuario con una consulta de ejemplo."
> "Exploremos cómo integrar tus guías, protocolos y corpus médico en un entorno de consulta
> gobernado."

**Diagnosis:** MEDIUM (M4, M5). *tu*, *te*, *explora* plus *hablemos*, *nuestro equipo*,
*exploremos*. The site uses *tú* throughout its conversational contact assistant and the
platform page: an observed exception there, not a new rule. New public copy stays impersonal.
The email that answers the lead afterwards is corporate register and may address the person
(`formats.md` §5).

**After:**

> "Una conversación sobre la organización sanitaria"
> "Caso de uso o necesidad de la organización"
> "Consulta recibida. La respuesta llegará a …"
> "Una consulta de ejemplo recorre la interfaz, los paneles y el área de usuario."
> "La primera reunión revisa cómo integrar las guías, los protocolos y el corpus médico de la
> organización en un entorno de consulta gobernado."

**Former model**, an earlier contact panel: *"Revisamos caso de uso,
restricciones de seguridad, requisitos de integración y el nivel de evidencia necesario."* Four
concrete anchors, no filler, one *revisamos* too many. Its rewrite is still the model: *"La
primera reunión revisa el caso de uso, las restricciones de seguridad, los requisitos de
integración y el nivel de evidencia necesario."*

**Note:** contact and form sections are the hardest place to hold the impersonal narrator. The
move is to make the *meeting* or the *message* the subject, not the reader.

---

## 4. Filler that restates the previous paragraph

**Before**, `src/content/blog/como-medir-la-fiabilidad-de-una-respuesta-clinica.mdx`:

> "Estas señales no siempre indican un fallo grave, pero sí justifican una revisión. A veces el
> problema está en la recuperación de documentos, otras en la síntesis, y otras en la propia
> estructura del corpus. La evaluación debe permitir distinguir esas causas para evitar
> correcciones superficiales."

**Diagnosis:** MEDIUM. The first sentence is a hedged non-claim. The second names three causes but
attaches no diagnostic to any of them. The third states an abstract requirement.

**After:**

> "Cada señal apunta a una capa distinta. Una fuente citada que no sostiene la conclusión apunta a
> la recuperación; una omisión de advertencias, a la segmentación del corpus; una variabilidad
> injustificada entre preguntas equivalentes, a la síntesis. El supervisor clínico decide cuál
> revisar primero, y ese orden es lo que evita correcciones superficiales."

**What changed:** each cause got its own observable symptom, and a role got the decision. Fewer
words, three anchors.

---

## 5. The same article's padding, section by section

The seed post is the structural template for MDX articles and should keep that role. As a
quality standard it is inflated: at ~1.500 words it carries roughly 300 words of restatement.

Recurring patterns to delete on sight:

| Fragment | Why it goes |
|---|---|
| "Esta mirada es especialmente importante cuando el sistema se integra en organizaciones sanitarias con múltiples equipos." | Generic importance claim, no anchor |
| "La precisión clínica responde a la pregunta de si el contenido es correcto. La trazabilidad responde a la pregunta de si puede revisarse. La utilidad responde a si ayuda a avanzar." | Restates the bullet list directly above it |
| "En organizaciones complejas, esa memoria evita repetir discusiones y convierte la revisión en un proceso acumulativo." | Nominalisation chain plus generic claim |
| "El resultado no es solo una puntuación: es una capacidad institucional para aprender, corregir y operar con seguridad." | Closing soundbite; belongs to the other brand |

The article's genuinely good sentences, to keep as models:

> "Una respuesta puede sonar correcta y, aun así, omitir una contraindicación, mezclar niveles de
> evidencia o perder el contexto operativo de una organización sanitaria."

Three named failure modes in one sentence. This is the target density.

> "Estos criterios no sustituyen el juicio clínico. Lo ordenan."

The warmth dial in five words.

> "Sin esa medición, cada actualización del conocimiento clínico se convierte en un acto de
> confianza difícil de auditar."

Clinical risk framing, not commercial fear. Exactly the distinction in `clinical-red-lines.md` §5.

---

## 6. Personification (a hazard, and one current defect)

Most of the production copy is clean here. Process steps 01 and 04 of the
website's clinical process showcase keep the human and the document as subjects: *"El profesional
formula una duda clínica en lenguaje natural"*, *"La respuesta reúne la orientación clínica y
permite consultar las fuentes que respaldan sus conclusiones"*. The former step copy (*"El
sistema recupera"*, *"contrasta las fuentes recuperadas"*, *"sintetiza una respuesta operativa y
enlaza el fragmento"*) survives only in the legacy horizontal home and is still a model.

The current defect is the same showcase's committee scene: an *orquestador* that "construye una
orientación conjunta" and experts quoted in the first person. It is listed in §12 and is never a
model. The same drift shows up in new drafts:

| Draft | Fixed |
|---|---|
| "El sistema entiende la duda clínica y busca la respuesta." | "El profesional formula la duda en lenguaje natural; el sistema recupera el conocimiento relevante del corpus, las guías y los protocolos." |
| "La plataforma sabe qué fuente pesa más." | "La plataforma aplica las prioridades documentales que define la organización." |
| "La IA decide cuándo derivar a revisión humana." | "La organización fija el umbral de revisión; por encima de él la respuesta se señala para revisión humana." |

The third row is also the correct way to introduce the coined term *umbral de revisión*: define it
by who sets it.

---

## 7. Efficacy claims

**Before** (a draft sentence of the kind that gets requested):

> "BinPar reduce los errores de consulta y mejora la seguridad del paciente."

**Diagnosis:** HIGH. Red line 2, twice. No study, and *seguridad del paciente* is a clinical
outcome.

**After**, the defensible version:

> "El benchmark documentado no reporta fallos sobre el conjunto de preguntas citado, y se presenta
> como señal técnica contextualizada. El efecto sobre la práctica asistencial es lo que las
> preguntas de control permiten medir en cada organización."

**What changed:** the verifiable fact keeps its label; the clinical effect becomes something to be
measured rather than something claimed.

---

## 8. Regulatory badge

**Before** (a draft sentence):

> "Plataforma certificada y conforme al RGPD y al AI Act, lista para entornos sanitarios."

**Diagnosis:** HIGH. Red line 3. Two claimed conformities and an unqualified "certificada".

**After**, adapted from the former website security page:

> "Plataforma diseñada desde el inicio para privacidad, auditoría y despliegue en la Unión
> Europea. Las consultas no se usan para entrenar modelos globales, cada acción queda registrada y
> el historial de versiones permite reconstruir qué respondía el sistema en cada momento."

**What changed:** design orientation and verifiable controls replace conformity claims.

---

## 9. Disclosure boundary

**Before** (a draft paragraph for a **mecanismo** piece):

> "Cada unidad de conocimiento lleva un identificador con CRC-8 sobre un contador global, de modo
> que el sistema valida la referencia sin consultar la base de datos."

**Diagnosis:** HIGH. Four banned terms and an implementation description.

**After:**

> "Cada fragmento del corpus conserva una identidad estable: si el documento se reordena o se
> reescribe, la referencia sigue apuntando al mismo contenido, y cualquier parte del sistema puede
> comprobar que la cita es válida."

**What changed:** the guarantee survives; the mechanism disappears. Note that the guarantee is
*more* interesting to the buyer than the mechanism was.

---

## 10. Competitor positioning

**Before** (a draft opening):

> "A diferencia de los chatbots genéricos, BinPar no inventa respuestas."

**Diagnosis:** MEDIUM (implicit competitor category, product in the opening) and it hands the
reader the word *inventa* applied to a category the brand belongs to.

**After:**

> "Un sistema de propósito general responde con lo que ha visto. Una consulta institucional
> responde con lo que la organización ha publicado, y puede señalar de dónde viene cada
> conclusión."

**What changed:** contrast of approach, no category insult, product absent from the opening, and
the coined term *evidencia visible* is one sentence away.

---

## 11. A full opening, on-brand

For a **mecanismo** piece on documentary traceability, ~180 words, no product, no mechanism:

> "Una cita clínica envejece peor que el texto que la sostiene. El documento se actualiza, un
> epígrafe se reordena, un párrafo se reescribe, y la referencia sigue existiendo: apunta a un
> lugar que ya no dice lo que decía cuando se citó.
>
> En una consulta puntual el problema pasa desapercibido. En una organización sanitaria, no.
> Cuando una respuesta se incorpora a un informe, se discute en un comité o se revisa en una
> auditoría interna, lo que se examina no es la respuesta: es su procedencia. Una referencia que
> no se puede reconstruir convierte una conclusión revisable en una conclusión que solo puede
> creerse.
>
> El corpus clínico es, por definición, un corpus vivo. Las guías se actualizan, los protocolos de
> centro cambian, los criterios de derivación se ajustan. Un sistema que responda sobre esa base
> tiene dos obligaciones que suelen confundirse: mantener el contenido al día, y mantener
> localizable lo que respondió antes de estarlo."

**Why it works:** no product, no mechanism, three anchors (informe, comité, auditoría), the coined
term *corpus vivo* defined in passing, clinical risk framing without commercial fear, and the last
sentence sets up the piece's distinction.

---

## 12. Known debt in the current site copy

The website copy is the tone of record for the name, the claims and the product vocabulary.
Where it breaks a rule of this skill, the rule wins for new copy and the fragment is listed here.
Never quote these fragments as models. In review mode, flag them with their codes (add *deuda
conocida* to the rewrite cell; the severity does not soften) and take the rewrite from this
table. Remove a row once the site is fixed.

| # | Fragment (verbatim) | Where | Codes | Suggested rewrite |
|---|---|---|---|---|
| 1 | "El sistema selecciona los agentes expertos adecuados y consulta sus corpus médicos, adaptados a la organización y la especialidad." | Process showcase, step 02 | H7 | "El comité de expertos reúne las especialidades que la consulta necesita, y cada una se consulta sobre su propio corpus médico, adaptado a la organización." |
| 2 | "El orquestador reúne las aportaciones de los expertos, contrasta sus matices y límites y construye una orientación conjunta para la consulta." Node label "Orquestador" | Process showcase, step 03 and its diagram | H7 | "La síntesis del comité reúne las aportaciones de cada especialidad, contrasta sus matices y límites y conserva la procedencia de cada una." Label: "Síntesis del comité" |
| 3 | "Conocimiento clínico orquestado por IA." | Home hero headline | M7 | "Conocimiento clínico consultable. Trazable hasta su fuente." |
| 4 | "no asumiría que el edema es exclusivamente renal" | Committee scene, expert quote | H6, H9 | Attribute to the specialty and its source, never an expert's first person: "Nefrología señala, con su fuente, el límite de atribuir el edema solo a la causa renal" |
| 5 | A described patient ("Paciente de 68 años con diabetes tipo 2…") taken to "Revisar AINE, IECA/ARA-II y diuréticos por riesgo renal e hiperpotasemia." | Committee scene cards | H1 | Keep the demo at question-and-document level: the cards name the cited epígrafe, not the action. "Epígrafe citado: AINE en insuficiencia renal" |
| 6 | "El futuro de la salud. Ya está aquí." | Success cases headline | M8, M9, M1 | "IA médica que ya forma parte del sistema sanitario." (the organisations on the map are its anchor) |
| 7 | "BinPar la IA médica institucional que conecta guías, protocolos y corpus médico con la práctica clínica." | Home cover lede | L11 | "BinPar es la IA médica institucional que conecta guías, protocolos y corpus médico con la práctica clínica." |
| 8 | "Hablemos de tu organización.", "¿Cómo te llamas?", "Explora la interfaz…", "Exploremos cómo integrar tus guías…" | Contact assistant, platform walkthrough | M4, M5 | §3 |
| 9 | "Estamos en Madrid." / "Escríbenos o consulta cómo llegar a nuestras oficinas." | Contact page details | M5, M4 | "Oficinas en Madrid." / "Dirección, correo de contacto y cómo llegar" |
| 10 | "BINPAR / SISTEMA INTEGRADO" typed in caps | Architecture graphic label (also reproduced in the identity manual's geometry page) | M15 | Source string "BinPar / Sistema integrado" with CSS `uppercase` |

Rows 4 and 5: the scenes replay a real captured consultation, so the answer text is product
output and outside this skill. The debt is the framing: an expert quoted in the first person, and
cards that state what to do for a described patient.

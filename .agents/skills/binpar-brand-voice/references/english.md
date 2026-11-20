# English (en-GB)

The website has an English version under `/en`. Castilian Spanish stays the **source
language**: every text is written and approved in Spanish first, and English is its translation
in `messages/en/*.json` (and `src/content/blog/en/` for posts). This file is the glossary and the
voice rules for that translation. Everything else in this skill applies unchanged: the four
dials, no personified AI, the red lines, the disclosure boundary, calibrated claims.

## Variety and mechanics

| Topic            | Rule                                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Variety**      | British English (en-GB): _organisation_, _synthesise_, _prioritise_, _programme_ (but _program_ for software), _centre_, _licence_ (noun)   |
| **Address**      | _you_ for the reader, _we_ for the team, exactly where Spanish uses _tú_ and _nosotros_. Never "the user" in copy that speaks to the reader |
| **Case**         | Sentence case for every headline, heading, button and label ("Request a meeting", never "Request A Meeting"). Caps only through CSS         |
| **Full stops**   | Same as Spanish: display headlines end with a period; running headings, buttons, labels and navigation do not                               |
| **Numbers**      | `30,000`, `8.5`, `90 mmHg`, `< 30 ml/min`. A `+8.327` in Spanish is `+8,327`                                                                |
| **Dates**        | Written out, day first: "12 October 2026"; short form "12 Oct 2026" (Intl handles it)                                                       |
| **Quotes**       | Single typographic quotes for terms and UI strings in prose: ‘Save to sources’. Spanish «» becomes ‘ ’                                      |
| **Dashes**       | Spaced en dash ( – ) for asides where Spanish uses a raya (—). Ranges with an unspaced en dash: 30–59                                       |
| **Length**       | English runs ~10–20 % shorter. Never pad; if a layout looks empty, that is fine                                                             |
| **Contractions** | Allowed in conversational UI and chat ("we'll", "you're"); avoided in legal text and clinical content                                       |

## Glossary

Use these terms every time; consistency matters more than elegance.

### Brand and product

| Spanish                             | English                               | Note                                                                         |
| ----------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------- |
| BinPar                              | BinPar                                | Never translated, never "Binpar"                                             |
| la plataforma                       | the platform                          |                                                                              |
| comité de expertos / comité clínico | expert committee / clinical committee | Documentary verbs only: _brings together_, _contrasts_, _synthesises_        |
| síntesis del comité                 | committee synthesis                   |                                                                              |
| especialidad                        | specialty                             | British _speciality_ is avoided: _specialty_ is the clinical usage           |
| consenso verificable                | verifiable consensus                  | Coined term                                                                  |
| evidencia visible                   | visible evidence                      | Coined term                                                                  |
| gobierno del conocimiento clínico   | clinical knowledge governance         | Coined term                                                                  |
| preguntas de control                | control questions                     | Coined term                                                                  |
| corpus vivo                         | living corpus                         | Coined term                                                                  |
| umbral de revisión                  | review threshold                      | Coined term                                                                  |
| corpus (médico)                     | (medical) corpus                      | Plural _corpora_ only if unavoidable                                         |
| fuente                              | source                                |                                                                              |
| cita / citar                        | citation / cite                       | The numbered marker is a _citation_, the quoted text a _passage_             |
| pasaje / fragmento                  | passage / excerpt                     |                                                                              |
| bibliografía                        | references                            | The list under an answer                                                     |
| trazable / trazabilidad             | traceable / traceability              |                                                                              |
| respuesta                           | answer                                | Not _response_ for the system's output                                       |
| consulta (la pregunta clínica)      | query / consultation                  | _query_ in UI ("New query"); _consultation_ for the clinical act             |
| seguimiento                         | follow-up                             |                                                                              |
| espacio personal                    | personal workspace                    |                                                                              |
| proyecto                            | project                               |                                                                              |
| fuentes del proyecto                | project sources                       |                                                                              |
| editor                              | editor                                | The publishing tool                                                          |
| publicación controlada              | controlled publication                |                                                                              |
| versión                             | version                               |                                                                              |
| organización sanitaria              | healthcare organisation               |                                                                              |
| institución                         | institution                           |                                                                              |
| servicio de salud                   | health service                        | Regional health services keep their names: SERMAS, Servicio Canario de Salud |
| profesional sanitario               | healthcare professional               |                                                                              |
| Solicitar reunión                   | Request a meeting                     | CTA                                                                          |
| Probar plataforma                   | Try the platform                      | CTA                                                                          |
| Hablar con el equipo                | Talk to the team                      | CTA                                                                          |

### Clinical terms (demo scenes and answers)

| Spanish                            | English                          |
| ---------------------------------- | -------------------------------- |
| ERC (enfermedad renal crónica)     | CKD (chronic kidney disease)     |
| FRA (fracaso renal agudo)          | AKI (acute kidney injury)        |
| ICA (insuficiencia cardíaca aguda) | AHF (acute heart failure)        |
| insuficiencia cardíaca / cardiaca  | heart failure                    |
| AINE                               | NSAIDs                           |
| IECA / ARA-II                      | ACE inhibitors / ARBs            |
| ahorradores de potasio             | potassium-sparing diuretics      |
| filtrado glomerular                | glomerular filtration rate (GFR) |
| aclaramiento de creatinina         | creatinine clearance             |
| hiperpotasemia                     | hyperkalaemia                    |
| disnea                             | dyspnoea                         |
| edema                              | oedema                           |
| anemia                             | anaemia                          |
| ortopnea                           | orthopnoea                       |
| tratamiento renal sustitutivo      | renal replacement therapy        |
| valoración presencial              | in-person assessment             |
| conciliación de la medicación      | medication reconciliation        |

British medical spelling throughout (_oedema_, _dyspnoea_, _haemoglobin_, _hyperkalaemia_).
Drug names in INN form (_ibuprofen_, _digoxin_). KDIGO, ECG, BNP, PCR (→ _CRP_) keep standard
English abbreviations.

## What is not translated

- **Names:** BinPar, Editorial Médica Panamericana, AWS, people, organisations (SERMAS, Axia),
  documents and their titles as proper names (_Manual ProMIR_), file names (`promir-cardiologia.md`),
  domains and emails.
- **Fake data in the product demos** that is a proper name: user names (Laura Gómez), the
  organisation _Área Sanitaria Norte_, its domain.
- **Markers:** citation anchors `⟦c73b77⟧`, `**bold**` markers in clinical content, `[n]`
  references, ICU placeholders `{name}` and rich-text tags `<strong>…</strong>`.
- **Spanish-only sections:** links to the evaluator (`/evaluador`), the report and the client
  space point to Spanish pages. Say so where it helps: "the suitability assessment (in Spanish)".

## Clinical demo content

The scenes replay a real consultation captured from the product, with quotes from real
Spanish sources. In English the whole demo is translated, quotes included, so the visitor can
follow it; the translation must stay faithful (no added facts, no smoothing of limits or hedges)
and keep every anchor in place. These texts are product output, not marketing copy: the voice
rules apply only to the interface around them.

## Legal pages

Translated for information. Each English legal page shows a notice that the Spanish version
prevails (`legal.translationNotice`). Translate precisely, keep the legal entity as
**BinPar Team S.L.** and Spanish law references as they are (Ley 34/2002, LSSI-CE, Agencia
Española de Protección de Datos, with an English gloss where useful).

## Mechanics for translators

- Translate the JSON values only; never rename or remove keys.
- Keep the same ICU arguments and rich-text tags; `pnpm test` (`i18n-messages.test.ts`) fails
  otherwise.
- Arrays keep their length and order.
- A text identical in both languages (a brand, a code) must be added to `SAME_IN_ENGLISH` in that
  test, so nothing is left untranslated by accident.

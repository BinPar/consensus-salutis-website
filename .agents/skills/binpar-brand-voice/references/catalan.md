# Catalan (ca-ES)

The website has a Catalan version under `/ca`. Castilian Spanish stays the **source language**:
Catalan is a translation of `messages/es/*.json` into `messages/ca/*.json` (and
`src/content/blog/ca/` for posts). Everything in this skill applies unchanged: the four dials,
no personified AI, the red lines, the disclosure boundary, calibrated claims. This file holds the
Catalan conventions and glossary; `english.md` has the same for English and its sections on
clinical demo content and legal pages apply here too.

## Variety and mechanics

| Topic            | Rule                                                                                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Variety**      | Standard Catalan (IEC norm, central variety), the register of the Generalitat and the Catalan health system. No dialectal forms                                                       |
| **Address**      | _tu_ for the reader and _nosaltres_ for the team, exactly where Spanish uses _tú_ and _nosotros_. Never _vostè_ outside legal text                                                    |
| **Apostrophe**   | Always the typographic apostrophe **’** (U+2019): _l’equip_, _d’evidència_. Never the straight `'`: in the message files it is an ICU escape character and breaks texts next to `{…}` |
| **Ela geminada** | _l·l_ with the middle dot (U+00B7): _col·laboració_, _sol·licitud_, _intel·ligència_. Never _l.l_ or _l•l_                                                                            |
| **Case**         | Sentence case for headlines, headings, buttons and labels                                                                                                                             |
| **Full stops**   | As in Spanish: display headlines end with a period; labels, buttons and navigation do not                                                                                             |
| **Numbers**      | Same as Spanish: `30.000`, `8,5`, `< 30 ml/min`                                                                                                                                       |
| **Dates**        | Written out: "12 de febrer de 2026"; short form "12 febr. 2026" (Intl handles it)                                                                                                     |
| **Quotes**       | « » as in Spanish                                                                                                                                                                     |
| **Length**       | Catalan runs about the same as Spanish; keep UI labels as short as the source                                                                                                         |

## Glossary

### Brand and product

| Spanish                             | Catalan                                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------------------------- |
| BinPar                              | BinPar (never translated)                                                                   |
| la plataforma                       | la plataforma                                                                               |
| comité de expertos / comité clínico | comitè d’experts / comitè clínic                                                            |
| síntesis del comité                 | síntesi del comitè                                                                          |
| especialidad                        | especialitat                                                                                |
| consenso verificable                | consens verificable                                                                         |
| evidencia visible                   | evidència visible                                                                           |
| gobierno del conocimiento clínico   | govern del coneixement clínic                                                               |
| preguntas de control                | preguntes de control                                                                        |
| corpus vivo                         | corpus viu                                                                                  |
| umbral de revisión                  | llindar de revisió                                                                          |
| fuente                              | font                                                                                        |
| cita / citar                        | cita / citar                                                                                |
| pasaje / fragmento                  | passatge / fragment                                                                         |
| bibliografía                        | bibliografia                                                                                |
| trazable / trazabilidad             | traçable / traçabilitat                                                                     |
| respuesta                           | resposta                                                                                    |
| consulta                            | consulta                                                                                    |
| seguimiento                         | seguiment                                                                                   |
| espacio personal                    | espai personal                                                                              |
| proyecto                            | projecte                                                                                    |
| publicación controlada              | publicació controlada                                                                       |
| cookies                             | cookies (not _galetes_: the word people recognise on a company website)                     |
| organización sanitaria              | organització sanitària                                                                      |
| institución                         | institució                                                                                  |
| servicio de salud                   | servei de salut; regional services keep their own names (SERMAS, Servei Català de la Salut) |
| profesional sanitario               | professional sanitari                                                                       |
| Solicitar reunión                   | Sol·licitar una reunió                                                                      |
| Probar plataforma                   | Provar la plataforma                                                                        |
| Hablar con el equipo                | Parlar amb l’equip                                                                          |

### Clinical terms

| Spanish                            | Catalan                                |
| ---------------------------------- | -------------------------------------- |
| ERC (enfermedad renal crónica)     | MRC (malaltia renal crònica)           |
| FRA (fracaso renal agudo)          | IRA (insuficiència renal aguda)        |
| ICA (insuficiencia cardíaca aguda) | ICA (insuficiència cardíaca aguda)     |
| insuficiencia cardíaca             | insuficiència cardíaca                 |
| insuficiencia renal                | insuficiència renal                    |
| AINE                               | AINE (antiinflamatoris no esteroidals) |
| IECA / ARA-II                      | IECA / ARA-II                          |
| ahorradores de potasio             | estalviadors de potassi                |
| filtrado glomerular                | filtrat glomerular                     |
| aclaramiento de creatinina         | aclariment de creatinina               |
| hiperpotasemia                     | hiperpotassèmia                        |
| disnea                             | dispnea                                |
| edema                              | edema                                  |
| anemia                             | anèmia                                 |
| ortopnea                           | ortopnea                               |
| tratamiento renal sustitutivo      | tractament renal substitutiu           |
| valoración presencial              | valoració presencial                   |
| conciliación de la medicación      | conciliació de la medicació            |

Drug names in their Catalan form (_ibuprofèn_, _digoxina_, _paracetamol_). Abbreviations that are
the same in Catalan (KDIGO, ECG, PCR) stay.

## What is not translated

Same as `english.md`: names, organisations, document titles as proper names (_Manual ProMIR_),
file names, domains and emails, fake proper data in the demos, citation anchors `⟦…⟧`, `**`
markers, `[n]` references, ICU placeholders and rich-text tags. Links to the Spanish-only
sections say so where it helps: "l’avaluador d’idoneïtat (en castellà)".

## Legal pages

Translated for information, with the notice that the Spanish version prevails
(`legal.translationNotice`). Keep **BinPar Team S.L.**, the NIF, the address and the Spanish law
and authority names (Ley 34/2002, LSSI-CE, Agencia Española de Protección de Datos), with a
Catalan gloss where useful. Standard Catalan GDPR terminology: _responsable del tractament_,
_base jurídica_, _supressió_, _limitació del tractament_, _portabilitat_, _presentar una
reclamació_.

## Mechanics for translators

As in `english.md`: values only, same keys, same ICU arguments and tags, arrays with the same
length and order; texts identical to the Spanish must be added to `SAME_IN_CATALAN` in
`src/lib/__tests__/i18n-messages.test.ts`, or the test fails as untranslated.

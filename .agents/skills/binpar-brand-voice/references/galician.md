# Galician (gl-ES)

The website has a Galician version under `/gl`. Castilian Spanish stays the **source language**:
Galician is a translation of `messages/es/*.json` into `messages/gl/*.json` (and
`src/content/blog/gl/` for posts). Everything in this skill applies unchanged: the four dials,
no personified AI, the red lines, the disclosure boundary, calibrated claims. This file holds the
Galician conventions and glossary; the sections on clinical demo content and legal pages in
`english.md` apply here too.

## Variety and mechanics

| Topic          | Rule                                                                                                                                                                                                                                                                               |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Norm**       | Official standard Galician (RAG norm, _Normas ortográficas e morfolóxicas do idioma galego_), the register of the Xunta and SERGAS. No reintegrationist spelling, no castelanismos (_desde_ → _dende_/_desde_ both valid; _hasta_ → _ata_; _entonces_ → _entón_; _luego_ → _logo_) |
| **Address**    | _ti_ for the reader and _nós_ for the team, exactly where Spanish uses _tú_ and _nosotros_                                                                                                                                                                                         |
| **Apostrophe** | Galician rarely needs one. If one ever appears, use the typographic **’** (U+2019), never `'`: in the message files the straight one is an ICU escape character                                                                                                                    |
| **Buttons**    | **Infinitive** everywhere, as Galician software does (Proxecto Trasno): "Gardar", "Cancelar", "Eliminar", also in the product mockups                                                                                                                                              |
| **Case**       | Sentence case for headlines, headings, buttons and labels                                                                                                                                                                                                                          |
| **Full stops** | As in Spanish: display headlines end with a period; labels, buttons and navigation do not                                                                                                                                                                                          |
| **Numbers**    | Same as Spanish: `30.000`, `8,5`, `< 30 ml/min`                                                                                                                                                                                                                                    |
| **Dates**      | Written out: "12 de febreiro de 2026"; short form via Intl                                                                                                                                                                                                                         |
| **Quotes**     | « » as in Spanish                                                                                                                                                                                                                                                                  |
| **Length**     | About the same as Spanish; keep UI labels as short as the source                                                                                                                                                                                                                   |

## Glossary

### Brand and product

| Spanish                             | Galician                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------ |
| BinPar                              | BinPar (never translated)                                                                  |
| la plataforma                       | a plataforma                                                                               |
| comité de expertos / comité clínico | comité de expertos / comité clínico                                                        |
| síntesis del comité                 | síntese do comité                                                                          |
| especialidad                        | especialidade                                                                              |
| consenso verificable                | consenso verificable                                                                       |
| evidencia visible                   | evidencia visible                                                                          |
| gobierno del conocimiento clínico   | goberno do coñecemento clínico                                                             |
| preguntas de control                | preguntas de control                                                                       |
| corpus vivo                         | corpus vivo                                                                                |
| umbral de revisión                  | limiar de revisión                                                                         |
| fuente                              | fonte                                                                                      |
| cita / citar                        | cita / citar                                                                               |
| pasaje / fragmento                  | pasaxe / fragmento                                                                         |
| bibliografía                        | bibliografía                                                                               |
| trazable / trazabilidad             | trazable / trazabilidade                                                                   |
| respuesta                           | resposta                                                                                   |
| consulta                            | consulta                                                                                   |
| seguimiento                         | seguimento                                                                                 |
| espacio personal                    | espazo persoal                                                                             |
| proyecto                            | proxecto                                                                                   |
| publicación controlada              | publicación controlada                                                                     |
| cookies                             | cookies (not _rastros_: the word people recognise on a company website)                    |
| organización sanitaria              | organización sanitaria                                                                     |
| institución                         | institución                                                                                |
| servicio de salud                   | servizo de saúde; regional services keep their own names (SERMAS, Servizo Galego de Saúde) |
| profesional sanitario               | profesional sanitario                                                                      |
| Solicitar reunión                   | Solicitar reunión (button; «unha reunión» in running text)                                 |
| Probar plataforma                   | Probar a plataforma                                                                        |
| Hablar con el equipo                | Falar co equipo                                                                            |
| Pensando…                           | Recuperando fontes… (never _Pensando…_)                                                    |

### Clinical terms

| Spanish                            | Galician                           |
| ---------------------------------- | ---------------------------------- |
| ERC (enfermedad renal crónica)     | ERC (enfermidade renal crónica)    |
| FRA (fracaso renal agudo)          | FRA (fracaso renal agudo)          |
| ICA (insuficiencia cardíaca aguda) | ICA (insuficiencia cardíaca aguda) |
| AINE                               | AINE                               |
| IECA / ARA-II                      | IECA / ARA-II                      |
| ahorradores de potasio             | aforradores de potasio             |
| filtrado glomerular                | filtrado glomerular                |
| aclaramiento de creatinina         | aclaramento de creatinina          |
| hiperpotasemia                     | hiperpotasemia                     |
| disnea / edema / anemia            | dispnea / edema / anemia           |
| tratamiento renal sustitutivo      | tratamento renal substitutivo      |
| valoración presencial              | valoración presencial              |
| conciliación de la medicación      | conciliación da medicación         |
| enfermedad                         | enfermidade                        |
| riñón / renal                      | ril / renal                        |

Drug names in their Galician form (_ibuprofeno_, _dixoxina_, _paracetamol_). Abbreviations that are
the same in Galician (KDIGO, ECG, PCR) stay.

## What is not translated

Same as `english.md`: names, organisations, document titles as proper names (_Manual ProMIR_),
file names, domains and emails, fake proper data in the demos, citation anchors `⟦…⟧`, `**`
markers, `[n]` references, ICU placeholders and rich-text tags. Links to the Spanish-only
sections say so where it helps: "o avaliador de idoneidade (en castelán)".

## Legal pages

Translated for information, with the notice that the Spanish version prevails
(`legal.translationNotice`). Keep **BinPar Team S.L.**, the NIF, the address and the Spanish law
and authority names (Ley 34/2002, LSSI-CE, Agencia Española de Protección de Datos), with a
Galician gloss where useful. Standard Galician GDPR terminology: _responsable do tratamento_,
_base xurídica_, _supresión_, _limitación do tratamento_, _portabilidade_, _presentar unha
reclamación_.

## Mechanics for translators

As in `english.md`: values only, same keys, same ICU arguments and tags, arrays with the same
length and order; texts identical to the Spanish must be added to `SAME_IN_GALICIAN` in
`src/lib/__tests__/i18n-same-as-source.ts`, or the test fails as untranslated.

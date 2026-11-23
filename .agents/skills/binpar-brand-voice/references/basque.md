# Basque (eu-ES)

The website has a Basque version under `/eu`. Castilian Spanish stays the **source language**:
Basque is a translation of `messages/es/*.json` into `messages/eu/*.json` (and
`src/content/blog/eu/` for posts). Everything in this skill applies unchanged: the four dials,
no personified AI, the red lines, the disclosure boundary, calibrated claims. This file holds the
Basque conventions and glossary; the sections on clinical demo content and legal pages in
`english.md` apply here too.

The terms below were checked against Euskalterm, the Euskaltzaindia norms (Hiztegi Batua,
EBO arauak 32, 184, 196, 197, 200, 203), Osakidetza's INFAC bulletins and patient guides, the
official Basque text of the LOPDGDD, and the Librezale / Mozilla software usage. Terms marked
_(probable)_ are regular compounds not found literally in those sources.

## Basque is not Romance

Translate the meaning, not the Spanish structure: natural euskara batua word order (verb at the
end of the clause, the finality before the instruction: "Jarraitzeko, sakatu Bidali"), no calques,
no "itzulpen-kutsua". Two consequences for the message files:

- **Never glue a case ending to an ICU variable or a tag** (`{name}ren`, `{tag}ri`). Keep the
  variable in the absolutive with no ending: give the case to a carrier noun
  (`{tag} gaiari buruzko artikuluak`, `{email} helbidera`, `«{title}» txata`) or use a colon
  (`Aukerak: {title}`, `Eguneratze-data: {date}`).
- **Sentences the code builds from pieces** (`before` / `strong` / `after`, `heading` +
  `headingAccent`, `typing` + `phrases`, `highlight` + `rest`, `noun.one` / `noun.other` shown as
  `${count} ${noun}`) must read as correct Basque once concatenated. Words may move between the
  pieces, and a piece may be an empty string, as long as the bold or accent falls on the
  equivalent words. After a numeral the noun goes without article: `3 artikulu`.

## Variety and mechanics

| Topic          | Rule                                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Norm**       | Euskara batua (Euskaltzaindia), the register of Osakidetza and Eusko Jaurlaritza                                                                                                              |
| **Address**    | _zu_ for the reader (never _hi_) and _gu_ for the team, exactly where Spanish uses _tú_ and _nosotros_                                                                                        |
| **Buttons**    | Bare participle, verb first, no auxiliary: "Gorde", "Ezabatu", "Utzi" (Cancel), "Itxi", "Bidali", "Aldatu izena", "Probatu plataforma". Never "gorde ezazu"                                   |
| **Progress**   | `-tzen` / `-ten` form plus ellipsis, no subject: "Kargatzen…", "Bidaltzen…"                                                                                                                   |
| **Errors**     | Short and impersonal: "Ezin izan da bidali.", "Saiatu berriro". No systematic _mesedez_                                                                                                       |
| **Questions**  | Closing mark only: "Nola duzu izena?"                                                                                                                                                         |
| **Case**       | Sentence case for headlines, headings, buttons and labels; months and weekdays in lower case                                                                                                  |
| **Full stops** | As in Spanish: display headlines end with a period; labels, buttons and navigation do not                                                                                                     |
| **Numbers**    | Decimal comma `8,5`; thousands with a point as in the rest of the site `30.000` (Euskaltzaindia also allows it); a case ending joins a figure directly: `68 urteko`, `2026an`, `48 ordutan`   |
| **Units**      | A case ending joins a symbol with a hyphen (`30 ml/min-tik behera`), but prefer the INFAC wording `30 ml/min baino txikiagoa`                                                                 |
| **Percent**    | Sign first with a space: `% 50`, `% 50eko`                                                                                                                                                    |
| **Ordinals**   | Figure plus point: `2.`, `2. motako diabetesa`                                                                                                                                                |
| **Dates**      | Year, month, day: "2026ko otsailaren 12a"; short form "2026-02-12"; times `13:36`                                                                                                             |
| **Quotes**     | « » as in Spanish, no inner spaces                                                                                                                                                            |
| **Apostrophe** | Not used in Basque. Never a straight `'` in the message files: it is an ICU escape character                                                                                                  |
| **BinPar**     | Declined with a hyphen, which keeps the brand intact: BinPar-ek, BinPar-en, BinPar-i, BinPar-ekin, BinPar-eko, BinPar-era. Never mix with _BinParren_                                         |
| **Acronyms**   | Common-noun acronyms take the article with no hyphen (GGKa, GGKan, AIEEak, IFZa); better still, avoid declining them ("GGK duten pazienteetan"). SERMAS as a proper noun: SERMASek, SERMASeko |
| **Length**     | Basque words are long: keep UI labels as short as the source; pick the shorter correct option                                                                                                 |

## Glossary

### Brand and product

| Spanish                             | Basque                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------- |
| BinPar                              | BinPar (never translated; declined with a hyphen)                             |
| la plataforma                       | plataforma                                                                    |
| comité de expertos / comité clínico | adituen batzordea _(probable)_ / batzorde klinikoa                            |
| síntesis del comité                 | batzordearen sintesia                                                         |
| especialidad                        | espezialitatea                                                                |
| consenso verificable                | adostasun egiaztagarria                                                       |
| evidencia visible                   | ebidentzia ikusgai (not _ikusgarria_, read as «spectacular»)                  |
| gobierno del conocimiento clínico   | ezagutza klinikoaren gobernantza _(probable)_                                 |
| preguntas de control                | kontrol-galderak                                                              |
| corpus vivo                         | corpus bizia                                                                  |
| umbral de revisión                  | berrikuspen-atalasea                                                          |
| fuente                              | iturria (not _iturburua_, which is source code)                               |
| cita / citar                        | aipua / aipatu                                                                |
| pasaje / fragmento                  | pasartea / zatia                                                              |
| bibliografía / referencia           | bibliografia / erreferentzia                                                  |
| trazable / trazabilidad             | trazabilitatea duen / trazabilitatea                                          |
| respuesta / consulta                | erantzuna / kontsulta                                                         |
| seguimiento                         | jarraipena                                                                    |
| espacio personal                    | eremu pertsonala _(probable)_                                                 |
| proyecto / chat / historial         | proiektua / txata / historia                                                  |
| fijar / desfijar (un chat)          | ainguratu / desainguratu; fijados: ainguratutakoak                            |
| barra lateral; desplegar / contraer | alboko barra; zabaldu / tolestu                                               |
| perfil y configuración              | profila eta ezarpenak                                                         |
| preferencias                        | hobespenak                                                                    |
| lector de pantalla                  | pantaila-irakurgailua                                                         |
| enlace / sitio web                  | esteka / webgunea                                                             |
| correo electrónico                  | helbide elektronikoa                                                          |
| tema claro / oscuro                 | itxura argia / itxura iluna                                                   |
| inteligencia artificial             | adimen artifiziala (AA)                                                       |
| orquestador                         | orkestratzailea _(not in the dictionaries; regular derivation)_               |
| caso de éxito                       | arrakasta-kasua                                                               |
| publicación controlada              | argitalpen kontrolatua                                                        |
| organización sanitaria              | osasun-erakundea                                                              |
| profesional sanitario               | osasun-profesionala                                                           |
| cookies                             | cookieak (singular _cookie_; "Cookie-politika"), the form Basque websites use |
| funcionalidades                     | funtzionalitateak                                                             |
| contacto / aviso legal              | Kontaktua / Lege-oharra                                                       |
| política de privacidad              | Pribatutasun-politika                                                         |
| Solicitar reunión                   | Eskatu bilera (no _bat_: the header button must fit at 1024 px)               |
| Probar plataforma                   | Probatu plataforma                                                            |
| Hablar con el equipo                | Hitz egin taldearekin                                                         |
| Pensando…                           | Iturriak berreskuratzen… (never _Pentsatzen…_)                                |
| Reintentar                          | Saiatu berriro                                                                |

### Clinical terms

Osakidetza localises clinical acronyms built on the Basque name and keeps the international ones.
Spell an acronym out the first time it appears in a view: "giltzurruneko gaixotasun kronikoa
(GGK)".

| Spanish                                  | Basque                                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| ERC (enfermedad renal crónica)           | GGK (giltzurruneko gaixotasun kronikoa)                                    |
| IRC (insuficiencia renal crónica)        | giltzurrun-gutxiegitasun kronikoa, **no acronym** (GGK is taken by ERC)    |
| FRA (fracaso renal agudo) / IRA          | giltzurrun-gutxiegitasun akutua, **no acronym**                            |
| insuficiencia renal                      | giltzurrun-gutxiegitasuna                                                  |
| IC (insuficiencia cardíaca)              | BG (bihotz-gutxiegitasuna); aguda: bihotz-gutxiegitasun akutua, no acronym |
| AINE                                     | AIEE (antiinflamatorio ez-esteroideak)                                     |
| IECA                                     | AEBI (angiotentsinaren entzima bihurtzailearen inhibitzaileak)             |
| ARA-II                                   | AHA-II (angiotentsinaren hartzaileen antagonistak); avoid declining it     |
| FG (filtrado glomerular)                 | IG (iragazketa glomerularra); estimado: IGz                                |
| ECG                                      | EKG (elektrokardiograma)                                                   |
| HTA, BNP, NT-proBNP, HbA1c, KDIGO        | unchanged                                                                  |
| DM2                                      | 2DM (2. motako diabetes mellitusa)                                         |
| diuréticos ahorradores de potasio        | diuretiko potasio-aurreztaileak                                            |
| betabloqueantes                          | beta-blokeatzaileak                                                        |
| aclaramiento de creatinina               | kreatinina-argitzea                                                        |
| hiperpotasemia / hipotensión             | hiperpotasemia / hipotentsioa                                              |
| disnea / ortopnea / edema / anemia       | disnea / ortopnea / edema / anemia                                         |
| tratamiento renal sustitutivo            | giltzurruneko tratamendu ordeztailea                                       |
| valoración presencial                    | aurrez aurreko balorazioa _(probable)_                                     |
| conciliación de la medicación            | medikazioaren kontziliazioa (Osakidetza usage)                             |
| ajuste de dosis                          | dosia doitzea; in headings: doikuntza posologikoa                          |
| arteriola aferente / eferente; glomérulo | arteriola aferentea / eferentea; glomerulua                                |
| nefrotoxicidad                           | nefrotoxikotasuna                                                          |
| orina / diuresis                         | gernua / diuresia                                                          |
| riesgo cardiovascular                    | arrisku kardiobaskularra; factor: arrisku-faktore kardiobaskularra         |
| antituberculostáticos                    | tuberkulosiaren aurkako farmakoak _(descriptive; no term found)_           |
| signos de alarma                         | alarma-zeinuak _(probable)_                                                |
| fármaco / medicamento / dosis            | farmakoa / medikamentua / dosia                                            |
| efecto adverso; contraindicado           | kontrako efektua; kontraindikatuta                                         |
| atención primaria                        | lehen mailako arreta                                                       |
| Cardiología / Nefrología                 | Kardiologia / Nefrologia                                                   |

Drug names in their Basque form (_digoxina_, _ibuprofenoa_, _metformina_, _espironolaktona_).

## What is not translated

Same as `english.md`: names, document titles as proper names (_ProMIR eskuliburua_ keeps
"ProMIR"), file names, domains and emails, fake proper data in the demos, citation anchors `⟦…⟧`,
`**` markers, `[n]` references, ICU placeholders and rich-text tags. Links to the Spanish-only
sections say so where it helps: "egokitasun-ebaluatzailea (gaztelaniaz)".

Places and institutions: Katalunia, Madrilgo Erkidegoa, Kanariak, Kataluniako Generalitatea,
Osakidetza, Madrilgo Osasun Zerbitzua (SERMAS) _(probable)_.

## Legal pages

Translated for information, with the notice that the Spanish version prevails
(`legal.translationNotice`). Keep **BinPar Team S.L.**, the NIF figure and the address. Terms from
the official Basque LOPDGDD: _tratamenduaren arduraduna_, _tratamendu-eragilea_, _interesduna_,
_oinarri juridikoa_ / _legitimazioa_, _adostasuna_, _hartzaileak_, _datuak hirugarrenei lagatzea_;
rights: _datuetara irispidea izateko_, _datuak zuzentzeko_, _datuak ezerezteko_, _tratamendua
mugatzeko_, _eramangarritasun-eskubidea_, _tratamenduari aurka egiteko_; _erreklamazioa
aurkeztu_; **Datuak Babesteko Espainiako Agentzia** (AEPD); NIF → IFZ; _egoitza soziala_. For
Ley 34/2002 keep the Spanish acronym LSSI-CE next to the Basque title ("34/2002 Legea, uztailaren
11koa, informazioaren gizarteko zerbitzuei eta merkataritza elektronikoari buruzkoa").

## Mechanics for translators

As in `english.md`: values only, same keys, same ICU arguments and tags, arrays with the same
length and order; texts identical to the Spanish must be added to `SAME_IN_BASQUE` in
`src/lib/__tests__/i18n-same-as-source.ts`, or the test fails as untranslated.

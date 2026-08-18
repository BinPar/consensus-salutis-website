/**
 * El catálogo de la ficha del panel contra el del servidor.
 *
 * La verdad de los 28 campos vive en `convex/marketplace/validators.ts` del
 * monorepo y aquí se repite —ver la cabecera de `~/lib/ficha` para el porqué—.
 * Estos tests son la mitad de la red que detecta la divergencia: la otra mitad
 * es el servidor, que rechaza un `campo` desconocido con `campo-desconocido`.
 *
 * Lo que NO comprueban: que las etiquetas sean buenas. Eso no es automatizable y
 * no se finge que lo sea.
 */

import { describe, expect, it } from "vitest";

import {
  ALL_FICHA_FIELDS,
  countFilledFields,
  EMPTY_FICHA,
  FICHA_BLOCKS,
  FICHA_BLOCK_LABELS,
  fichaFieldByPath,
  formatFichaValue,
  parseFichaInput,
  toInputValue,
  type Ficha,
} from "~/lib/ficha";

/** Los 28 `bloque.campo` del schema de Convex, copiados a mano a propósito. */
const SERVER_FIELDS = [
  "perfil.familia",
  "perfil.pais",
  "perfil.centros",
  "perfil.profesionales",
  "perfil.especialidades",
  "perfil.ambitoPublico",
  "perfil.comunidad",
  "corpus.corpusPropio",
  "corpus.volumenDocs",
  "corpus.volumenPaginas",
  "corpus.formato",
  "corpus.vigencia",
  "corpus.aprobador",
  "corpus.derechos",
  "corpus.interesCorpusGeneral",
  "uso.usoPrincipal",
  "uso.perfilesUsuarios",
  "uso.usuariosIdentificados",
  "uso.finalidadPromocional",
  "datos.phiPrevisto",
  "datos.residenciaDato",
  "datos.dpo",
  "datos.comiteEtica",
  "datos.requisitosAuditoria",
  "operativa.sponsorEjecutivo",
  "operativa.horizonte",
  "operativa.idpCorporativo",
  "operativa.capacidadTI",
];

/** Las formas del schema, para que un control no se pinte del tipo que no es. */
const SERVER_KINDS: Record<string, string> = {
  "perfil.centros": "numero",
  "perfil.profesionales": "numero",
  "perfil.especialidades": "lista",
  "perfil.ambitoPublico": "booleano",
  "corpus.corpusPropio": "booleano",
  "corpus.volumenDocs": "numero",
  "corpus.volumenPaginas": "numero",
  "corpus.interesCorpusGeneral": "booleano",
  "uso.perfilesUsuarios": "lista",
  "uso.usuariosIdentificados": "booleano",
  "uso.finalidadPromocional": "booleano",
  "datos.dpo": "booleano",
  "datos.comiteEtica": "booleano",
  "operativa.sponsorEjecutivo": "booleano",
};

describe("el catálogo cubre exactamente el del servidor", () => {
  it("son los mismos 28 campos y en el mismo orden", () => {
    expect(ALL_FICHA_FIELDS.map((spec) => spec.path)).toEqual(SERVER_FIELDS);
  });

  it("ningún path se repite", () => {
    const paths = ALL_FICHA_FIELDS.map((spec) => spec.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("los cinco bloques tienen etiqueta", () => {
    for (const block of FICHA_BLOCKS) {
      expect(FICHA_BLOCK_LABELS[block].length).toBeGreaterThan(3);
    }
  });

  it("cada campo tiene una etiqueta legible, y no su clave", () => {
    for (const spec of ALL_FICHA_FIELDS) {
      expect(spec.label.length).toBeGreaterThan(2);
      expect(spec.label).not.toBe(spec.field);
      expect(spec.label).not.toContain(".");
    }
  });

  it("los tipos no textuales coinciden con los del schema", () => {
    for (const spec of ALL_FICHA_FIELDS) {
      expect(spec.kind).toBe(SERVER_KINDS[spec.path] ?? "texto");
    }
  });

  it("se puede recuperar un campo por su path", () => {
    expect(fichaFieldByPath("corpus.volumenPaginas")?.kind).toBe("numero");
    expect(fichaFieldByPath("perfil.inventado")).toBeUndefined();
  });
});

/*
  Las etiquetas se leen en el panel del cliente, así que no pueden llevar el
  vocabulario del motor. Es la misma regla que impide pintar banderas o nivel:
  un campo llamado «bandera de corpus» delataría el mecanismo aunque no mostrara
  su valor.
*/
describe("las etiquetas no delatan el motor", () => {
  const FORBIDDEN = [
    "bandera",
    "nivel",
    "semáforo",
    "semaforo",
    "regla",
    "verde",
    "ámbar",
    "ambar",
    "rojo",
    "puntuación",
    "vía pública",
  ];

  it("ninguna etiqueta usa el vocabulario interno", () => {
    const offenders = ALL_FICHA_FIELDS.filter((spec) =>
      FORBIDDEN.some((term) => spec.label.toLowerCase().includes(term)),
    ).map((spec) => spec.path);

    expect(offenders).toEqual([]);
  });
});

describe("el progreso cuenta campos con valor", () => {
  it("una ficha vacía tiene cero", () => {
    expect(countFilledFields(EMPTY_FICHA)).toBe(0);
  });

  it("solo cuenta los campos del catálogo", () => {
    const ficha: Ficha = {
      ...EMPTY_FICHA,
      perfil: {
        pais: { valor: "España", confianza: "alta", origen: "agente" },
        // Un campo que no está en el catálogo no suma: si sumara, el contador
        // podría pasar de 28 con una respuesta inesperada del servidor.
        inventado: { valor: "x", confianza: "alta", origen: "agente" },
      },
    };

    expect(countFilledFields(ficha)).toBe(1);
  });
});

describe("los valores se leen y se escriben como los lee una persona", () => {
  it("un booleano se muestra en palabras", () => {
    expect(formatFichaValue(true)).toBe("Sí");
    expect(formatFichaValue(false)).toBe("No");
  });

  it("una lista se muestra separada por comas", () => {
    expect(formatFichaValue(["medicina interna", "cardiología"])).toBe(
      "medicina interna, cardiología",
    );
  });

  it("acepta el separador de miles y la coma decimal españoles", () => {
    expect(parseFichaInput("numero", "6.000")).toBe(6000);
    expect(parseFichaInput("numero", "1,5")).toBe(1.5);
  });

  it("rechaza un número que no lo es, en vez de mandar NaN al servidor", () => {
    expect(parseFichaInput("numero", "muchos")).toBeNull();
    expect(parseFichaInput("numero", "  ")).toBeNull();
  });

  it("una lista se parte por comas y descarta los huecos", () => {
    expect(parseFichaInput("lista", " cardiología , , pediatría ")).toEqual([
      "cardiología",
      "pediatría",
    ]);
    expect(parseFichaInput("lista", " , ")).toBeNull();
  });

  it("un texto vacío no es una corrección", () => {
    expect(parseFichaInput("texto", "   ")).toBeNull();
  });

  it("el booleano viaja como booleano y no como la cadena del control", () => {
    expect(parseFichaInput("booleano", "true")).toBe(true);
    expect(parseFichaInput("booleano", "false")).toBe(false);
    expect(parseFichaInput("booleano", "quizá")).toBeNull();
  });

  it("el valor actual vuelve al control en el formato que éste espera", () => {
    expect(toInputValue("booleano", true)).toBe("true");
    expect(toInputValue("lista", ["a", "b"])).toBe("a, b");
    expect(toInputValue("numero", 400)).toBe("400");
    expect(toInputValue("texto", undefined)).toBe("");
  });
});

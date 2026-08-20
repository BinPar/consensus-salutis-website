/**
 * La normalización de lo que escribe el modelo, y del nombre que escribió el
 * cliente.
 *
 * Los casos vienen de la tabla de §03 de la especificación: son los que se han
 * visto de verdad en respuestas del agente, no invenciones para llenar el test.
 */

import { describe, expect, it } from "vitest";

import {
  capitalizarInstitucion,
  esEscapatoria,
  etiquetaOpcion,
  partirOpciones,
} from "~/lib/opciones";

describe("una opción se pinta con mayúscula y sin punto", () => {
  it("pone la mayúscula inicial de lo que el modelo escribe en minúscula", () => {
    expect(etiquetaOpcion("sí, ya lo tenemos")).toBe("Sí, ya lo tenemos");
    expect(etiquetaOpcion("no lo sé")).toBe("No lo sé");
  });

  it("quita el punto final: una fila no es una oración", () => {
    expect(etiquetaOpcion("no.")).toBe("No");
    expect(etiquetaOpcion("todavía no…")).toBe("Todavía no");
  });

  it("no toca lo que ya empieza en mayúscula", () => {
    expect(etiquetaOpcion("HL7 FHIR")).toBe("HL7 FHIR");
    expect(etiquetaOpcion("España")).toBe("España");
  });

  it("respeta la tilde al poner la mayúscula", () => {
    expect(etiquetaOpcion("ámbito privado")).toBe("Ámbito privado");
  });

  it("recorta antes de decidir", () => {
    expect(etiquetaOpcion("  no   ")).toBe("No");
  });

  it("una opción vacía sigue vacía y no revienta", () => {
    expect(etiquetaOpcion("   ")).toBe("");
  });
});

describe("el nombre de la institución se capitaliza por palabra", () => {
  it("arregla el caso que se veía en la cabecera", () => {
    expect(capitalizarInstitucion("Hospital de móstoles")).toBe(
      "Hospital de Móstoles",
    );
  });

  it("las partículas se quedan en minúscula, menos al principio", () => {
    expect(capitalizarInstitucion("hospital de la princesa")).toBe(
      "Hospital de la Princesa",
    );
    expect(capitalizarInstitucion("de la fuente clínica")).toBe(
      "De la Fuente Clínica",
    );
  });

  it("una palabra con mayúsculas no se toca: siglas y nombres compuestos", () => {
    expect(capitalizarInstitucion("SERMAS")).toBe("SERMAS");
    expect(capitalizarInstitucion("H.U. La Paz")).toBe("H.U. La Paz");
    expect(capitalizarInstitucion("clínica McKinley")).toBe("Clínica McKinley");
  });

  it("normaliza los espacios de sobra", () => {
    expect(capitalizarInstitucion("  hospital   de  móstoles ")).toBe(
      "Hospital de Móstoles",
    );
  });
});

describe("la escapatoria no es una respuesta", () => {
  it("reconoce «no lo sé» con y sin tilde", () => {
    expect(esEscapatoria("no lo sé")).toBe(true);
    expect(esEscapatoria("No lo se")).toBe(true);
  });

  it("no confunde un «no» con la escapatoria", () => {
    expect(esEscapatoria("no")).toBe(false);
    expect(esEscapatoria("no, todavía no")).toBe(false);
  });

  /*
    El modelo escribe la variante que le sale ese día: la detección va por
    prefijo de fórmula de no-saber, no por lista cerrada. Cazado ejecutando:
    «No lo sé todavía» caía como fila normal y además rompía el segmentado
    binario del sí/no.
  */
  it("reconoce las variantes que el modelo improvisa", () => {
    expect(esEscapatoria("No lo sé todavía")).toBe(true);
    expect(esEscapatoria("no sabría decirle")).toBe(true);
    expect(esEscapatoria("No lo sabemos aún")).toBe(true);
    expect(esEscapatoria("no estoy segura")).toBe(true);
    expect(esEscapatoria("No aplica")).toBe(true);
    expect(esEscapatoria("sin datos")).toBe(true);
  });

  it("una respuesta legítima que empieza por «no» sigue siendo respuesta", () => {
    expect(esEscapatoria("No hay proceso definido")).toBe(false);
    expect(esEscapatoria("No hay patrocinador")).toBe(false);
  });
});

describe("las opciones se parten en respuestas y escapatoria", () => {
  it("saca la escapatoria de la columna", () => {
    const partidas = partirOpciones([
      "sí, ya lo tenemos",
      "sí, en preparación",
      "no",
      "no lo sé",
    ]);

    expect(partidas.respuestas).toEqual([
      "Sí, ya lo tenemos",
      "Sí, en preparación",
      "No",
    ]);
    expect(partidas.escapatoria).toBe("No lo sé");
    expect(partidas.binaria).toBe(false);
  });

  it("un sí/no con escapatoria es binario: segmentado, no tres filas", () => {
    const partidas = partirOpciones(["sí", "no", "no lo sé"]);

    expect(partidas.respuestas).toEqual(["Sí", "No"]);
    expect(partidas.escapatoria).toBe("No lo sé");
    expect(partidas.binaria).toBe(true);
  });

  it("tres respuestas de verdad no son binarias aunque una empiece por «sí»", () => {
    expect(partirOpciones(["sí", "no", "en parte"]).binaria).toBe(false);
  });

  it("el orden importa: «no» y «sí» no es el segmentado que se especifica", () => {
    expect(partirOpciones(["no", "sí"]).binaria).toBe(false);
  });

  it("sin opciones no hay nada que partir", () => {
    expect(partirOpciones([])).toEqual({
      respuestas: [],
      escapatoria: null,
      binaria: false,
    });
  });

  it("descarta las opciones vacías en vez de pintar una fila sin texto", () => {
    expect(partirOpciones(["sí", "   ", "no"]).respuestas).toEqual([
      "Sí",
      "No",
    ]);
  });
});

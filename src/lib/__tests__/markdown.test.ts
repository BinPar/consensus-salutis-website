/**
 * El parser del markdown del informe.
 *
 * Los casos vienen de la salida real del redactor: encabezados, la frase de
 * diagnóstico como cita, listas de dimensiones y negrita. Los bordes —una cita
 * pegada a un párrafo, una lista numerada detrás de una con guiones— son los que
 * salieron mal la primera vez que se pintó un informe de verdad.
 */

import { describe, expect, it } from "vitest";

import { parseInline, parseMarkdownBlocks } from "~/lib/markdown";

describe("los bloques", () => {
  it("reconoce los tres niveles de encabezado", () => {
    expect(parseMarkdownBlocks("# Uno\n\n## Dos\n\n### Tres")).toEqual([
      { type: "heading", level: 1, text: "Uno" },
      { type: "heading", level: 2, text: "Dos" },
      { type: "heading", level: 3, text: "Tres" },
    ]);
  });

  it("junta las líneas de un párrafo y lo cierra con la línea en blanco", () => {
    expect(
      parseMarkdownBlocks("Primera línea\nsegunda línea\n\nOtro párrafo"),
    ).toEqual([
      { type: "paragraph", text: "Primera línea segunda línea" },
      { type: "paragraph", text: "Otro párrafo" },
    ]);
  });

  // La frase de diagnóstico. Sin este caso salía con el `>` delante.
  it("reconoce la cita del diagnóstico", () => {
    expect(
      parseMarkdownBlocks("> El perfil encaja con lo que hacemos hoy."),
    ).toEqual([
      { type: "quote", text: "El perfil encaja con lo que hacemos hoy." },
    ]);
  });

  it("junta una cita de varias líneas en una sola", () => {
    expect(parseMarkdownBlocks("> Una línea\n> y su continuación")).toEqual([
      { type: "quote", text: "Una línea y su continuación" },
    ]);
  });

  it("una cita seguida de un encabezado no se lo traga", () => {
    expect(parseMarkdownBlocks("> Diagnóstico\n## Situación")).toEqual([
      { type: "quote", text: "Diagnóstico" },
      { type: "heading", level: 2, text: "Situación" },
    ]);
  });

  it("agrupa las viñetas en una lista", () => {
    expect(parseMarkdownBlocks("- uno\n- dos\n* tres")).toEqual([
      { type: "list", ordered: false, items: ["uno", "dos", "tres"] },
    ]);
  });

  it("una lista numerada detrás de una con guiones son dos listas", () => {
    expect(parseMarkdownBlocks("- uno\n1. dos")).toEqual([
      { type: "list", ordered: false, items: ["uno"] },
      { type: "list", ordered: true, items: ["dos"] },
    ]);
  });

  it("un párrafo detrás de una lista la cierra", () => {
    expect(parseMarkdownBlocks("- uno\nTexto suelto")).toEqual([
      { type: "list", ordered: false, items: ["uno"] },
      { type: "paragraph", text: "Texto suelto" },
    ]);
  });

  // El prompt prohíbe el bloque de código envolvente, pero si el modelo lo pone
  // igual, lo correcto es ignorarlo y no pintar tres acentos graves sueltos.
  it("ignora una valla de bloque de código", () => {
    expect(parseMarkdownBlocks("```markdown\n# Informe\n```")).toEqual([
      { type: "heading", level: 1, text: "Informe" },
    ]);
  });

  it("un informe vacío no produce bloques", () => {
    expect(parseMarkdownBlocks("")).toEqual([]);
    expect(parseMarkdownBlocks("   \n\n  ")).toEqual([]);
  });

  it("aguanta los saltos de línea de Windows", () => {
    expect(parseMarkdownBlocks("# Uno\r\n\r\nTexto")).toEqual([
      { type: "heading", level: 1, text: "Uno" },
      { type: "paragraph", text: "Texto" },
    ]);
  });
});

describe("el texto en línea", () => {
  it("separa negrita, cursiva y código del texto llano", () => {
    expect(parseInline("Un **fuerte**, un *suave* y un `dato`.")).toEqual([
      { kind: "text", text: "Un " },
      { kind: "strong", text: "fuerte" },
      { kind: "text", text: ", un " },
      { kind: "em", text: "suave" },
      { kind: "text", text: " y un " },
      { kind: "code", text: "dato" },
      { kind: "text", text: "." },
    ]);
  });

  it("un asterisco suelto es texto y no abre nada", () => {
    expect(parseInline("2 * 3 = 6")).toEqual([
      { kind: "text", text: "2 * 3 = 6" },
    ]);
  });

  /*
    El HTML no se interpreta: sale como texto y quien lo pinta lo mete en un nodo
    de React. Es la mitad de la garantía de que un informe no puede inyectar
    marcado; la otra mitad es que el componente no usa `dangerouslySetInnerHTML`.
  */
  it("el HTML del texto no se interpreta", () => {
    expect(parseInline("<script>alert(1)</script>")).toEqual([
      { kind: "text", text: "<script>alert(1)</script>" },
    ]);
  });
});

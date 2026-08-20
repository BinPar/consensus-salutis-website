/**
 * Criterios de aceptación §6 de la issue #6, los que son reglas sobre el código:
 *
 *   Ni nombres de regla, ni banderas, ni puntuación numérica en el HTML.
 *   Copiar el enlace es la acción principal, y NO hay botón de imprimir.
 *
 * Mismo método que `interview-ui-leaks`: recorrer los archivos, porque son
 * reglas que se rompen moviendo código de sitio.
 *
 * A diferencia de la entrevista, aquí el LITERAL del nivel y los colores del
 * semáforo SÍ están permitidos: la página del informe es el semáforo por diseño
 * (§2 de la issue), y el literal se resuelve a clase en el servidor. Lo que no
 * puede aparecer es el mecanismo: ids de regla, tipos de bandera, versión de
 * criterios o coste.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const INFORME_UI = join(process.cwd(), "src", "app", "_components", "informe");
const INFORME_PAGE = join(process.cwd(), "src", "app", "informe");
const READ_MODULE = join(
  process.cwd(),
  "src",
  "server",
  "marketplace",
  "report-read.ts",
);

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) return walk(fullPath);
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

/** Quita comentarios: la regla es sobre lo que se pinta, no sobre lo documentado. */
function codeOnly(contents: string) {
  return contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = [...walk(INFORME_UI), ...walk(INFORME_PAGE), READ_MODULE];

describe("la página del informe no puede pintar el mecanismo", () => {
  it("encuentra los archivos del informe", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  /*
    Ids de regla (`corpus.no-digital`), tipos de bandera y los campos internos
    del motor. Si alguno aparece en esta superficie es que alguien lo ha traído
    del contrato de Convex, y el contrato (#90) dice que no viajan.
  */
  const forbidden: Array<{ name: string; pattern: RegExp }> = [
    {
      name: "id de regla del motor",
      pattern:
        /["'`](?:perfil|corpus|uso|datos|operativa)\.[a-z][a-z-]{2,}["'`]/,
    },
    {
      name: "tipo de bandera",
      pattern:
        /phi_previsto|derechos_dudosos|corpus_no_digital|sin_sponsor|fuera_de_ambito|ccaa-cubierta|independencia-editorial|email-generico/,
    },
    {
      name: "campo interno del veredicto",
      pattern: /reglasDisparadas|criteriaVersion|costUsd/,
    },
  ];

  for (const rule of forbidden) {
    it(`sin ${rule.name} en ninguna superficie del informe`, () => {
      for (const file of files) {
        const contents = codeOnly(readFileSync(file, "utf8"));
        expect(
          rule.pattern.test(contents),
          `${rule.name} en ${relative(process.cwd(), file)}`,
        ).toBe(false);
      }
    });
  }

  it("no hay botón de imprimir ni hoja de impresión: el informe es de navegador", () => {
    for (const file of files) {
      const contents = codeOnly(readFileSync(file, "utf8"));
      expect(
        /window\.print|@media print/.test(contents),
        relative(process.cwd(), file),
      ).toBe(false);
    }
    // Tampoco en la hoja global: la decisión de §1 de la issue es del sitio entero.
    const globals = readFileSync(
      join(process.cwd(), "src", "styles", "globals.css"),
      "utf8",
    );
    expect(globals.includes("@media print")).toBe(false);
  });

  it("los dígitos del badge no pueden venir de la URL: ni searchParams ni query", () => {
    // La regla de AWS (issue #2 §3): la cuenta viaja SOLO en cookie firmada. La
    // página no lee searchParams en absoluto — el día que los necesite para otra
    // cosa, este test obliga a mirar que no sea para esto.
    for (const file of walk(INFORME_PAGE)) {
      const contents = codeOnly(readFileSync(file, "utf8"));
      expect(
        contents.includes("searchParams"),
        relative(process.cwd(), file),
      ).toBe(false);
    }
  });
});

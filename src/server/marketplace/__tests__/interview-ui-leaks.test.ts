/**
 * Criterios de aceptación §7 de la issue #5, los dos que son reglas sobre el
 * código y no sobre una función:
 *
 *   Ni banderas, ni nivel, ni reglas visibles en ningún momento — revisado
 *   también en el HTML, no solo a ojo.
 *
 *   Datos de paciente pegados: la UI no debe persistirlos ni en el borrador
 *   local.
 *
 * Se prueban recorriendo los archivos, igual que `no-aws-account-id-leak`: son
 * reglas que se rompen moviendo código de sitio, y un test sobre una función
 * concreta no las vería. Esto es lo que hace que un `localStorage.setItem` con
 * la transcripción, añadido dentro de seis meses, rompa el build en vez de pasar
 * la revisión.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const INTERVIEW_UI = join(process.cwd(), "src", "app", "_components", "interview");
const INTERVIEW_PAGE = join(process.cwd(), "src", "app", "evaluador", "entrevista");
const TRANSPORT = join(process.cwd(), "src", "lib", "interview.ts");

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) return walk(fullPath);
    return /\.(ts|tsx)$/.test(entry) ? [fullPath] : [];
  });
}

/**
 * Quita comentarios antes de buscar.
 *
 * La regla es sobre lo que se pinta, no sobre lo que se documenta. Explicar en un
 * comentario por qué el nivel NO se muestra —como hace `interview-screen`— no es
 * mostrarlo; sería absurdo que documentar la regla la infringiera.
 */
function codeOnly(contents: string) {
  return contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const files = [...walk(INTERVIEW_UI), ...walk(INTERVIEW_PAGE)];

describe("la UI de la entrevista no puede pintar el mecanismo", () => {
  it("encuentra los archivos de la entrevista", () => {
    expect(files.length).toBeGreaterThanOrEqual(4);
  });

  /*
    Los campos internos del payload. `nivelNombre` NO está en la lista: es el
    nombre del nivel en la lengua del informe, va dentro del markdown que escribe
    el redactor y es parte del documento que la institución se lleva. Lo que no
    puede aparecer es el LITERAL del nivel, que es lo que permitiría un `switch`
    a tres colores.
  */
  const FORBIDDEN_IDENTIFIERS = [
    "banderas",
    "bandera",
    "semaforo",
    "reglasDisparadas",
    "criteriaVersion",
    "costUsd",
    "findings",
    "nivel:",
    "\\.nivel\\b",
  ];

  it("no lee ningún campo interno del veredicto", () => {
    const offenders = files.flatMap((file) => {
      const contents = codeOnly(readFileSync(file, "utf8"));
      return FORBIDDEN_IDENTIFIERS.filter((identifier) =>
        new RegExp(identifier).test(contents),
      ).map((identifier) => `${relative(process.cwd(), file)} :: ${identifier}`);
    });

    expect(offenders).toEqual([]);
  });

  /*
    Y no basta con que la UI no los lea: si el transporte los dejara pasar,
    estarían en el estado de React y de ahí a la pantalla hay un descuido. El
    filtro tiene que estar en la frontera, y el comentario de `parseReport` lo
    explica; esto comprueba que sigue ahí.
  */
  it("el transporte descarta lo interno del informe", () => {
    const transport = readFileSync(TRANSPORT, "utf8");
    const parseReport = /function parseReport[\s\S]*?\n}/.exec(transport)?.[0];

    expect(parseReport).toBeDefined();
    for (const field of ["criteriaVersion", "costUsd", "raw.nivel,", "banderas"]) {
      expect(parseReport).not.toContain(field);
    }
  });

  it("los tres literales del nivel no aparecen en la UI", () => {
    const offenders = files
      .filter((file) => {
        const contents = codeOnly(readFileSync(file, "utf8"));
        return /"(listos|casi|explorar)"|'(listos|casi|explorar)'/.test(contents);
      })
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it("no hay un mapa de colores de semáforo", () => {
    const offenders = files
      .filter((file) => {
        const contents = codeOnly(readFileSync(file, "utf8")).toLowerCase();
        // Verde y ámbar juntos en un archivo de la entrevista solo pueden ser un
        // semáforo: la paleta de la marca no los usa para nada más.
        return contents.includes("verde") && contents.includes("ambar");
      })
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });
});

describe("nada de la entrevista se persiste en el navegador", () => {
  it("no usa localStorage ni sessionStorage", () => {
    const offenders = files
      .filter((file) => {
        const contents = codeOnly(readFileSync(file, "utf8"));
        return (
          contents.includes("localStorage") ||
          contents.includes("sessionStorage") ||
          contents.includes("indexedDB")
        );
      })
      .map((file) => relative(process.cwd(), file));

    // Si alguien añadiera un borrador local «para no perder lo escrito», los
    // identificadores de paciente que el agente retira del servidor se quedarían
    // guardados en el único sitio del que no podemos borrarlos.
    expect(offenders).toEqual([]);
  });

  it("tampoco el transporte", () => {
    const transport = readFileSync(TRANSPORT, "utf8");
    expect(codeOnly(transport)).not.toContain("localStorage");
    expect(codeOnly(transport)).not.toContain("sessionStorage");
  });
});

describe("la sesión no sale del sitio donde tiene que estar", () => {
  it("no se escribe en la URL ni en un campo de formulario", () => {
    const forbidden = [
      /[?&]token=/,
      /searchParams[\s\S]{0,40}token/,
      /name=["']token["']/,
      /localStorage[\s\S]{0,60}token/,
    ];

    const offenders = files.flatMap((file) => {
      const contents = codeOnly(readFileSync(file, "utf8"));
      return forbidden
        .filter((pattern) => pattern.test(contents))
        .map((pattern) => `${relative(process.cwd(), file)} :: ${pattern.source}`);
    });

    expect(offenders).toEqual([]);
  });

  it("viaja en la cabecera Authorization", () => {
    const transport = readFileSync(TRANSPORT, "utf8");
    expect(transport).toContain("Authorization: `Bearer ${options.token}`");
  });
});

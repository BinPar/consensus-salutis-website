/**
 * Criterio de aceptación §6 de la issue #2:
 *
 *   Ningún camino escribe `awsAccountId` en URL, campo de formulario ni
 *   almacenamiento del cliente.
 *
 * Es una regla sobre el código, no sobre una función concreta, así que se prueba
 * como tal: recorriendo `src/` y comprobando que `awsAccountId` solo aparece
 * donde tiene permitido aparecer — dentro del módulo de servidor que lo firma.
 *
 * La alternativa sería confiar en que nadie lo mueva de sitio. Este test es lo
 * que hace que un `?awsAccountId=` añadido dentro de seis meses rompa el build
 * en lugar de pasar desapercibido.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SRC = join(process.cwd(), "src");

/**
 * Dónde puede vivir `awsAccountId`.
 *
 * El módulo de servidor que lo firma, y la ruta de registro (#3), que es donde
 * entra: `ResolveCustomer` lo devuelve ahí y de ahí pasa directo a la cookie
 * firmada. Un `route.ts` no se sirve nunca al navegador, así que la regla —que
 * es sobre el cliente— se sigue cumpliendo.
 *
 * El permiso es para ESE archivo y no para `src/app/aws/` entero: una página
 * bajo esa ruta sí llegaría al navegador, y tiene que seguir rompiendo el build.
 * Que la cuenta no viaje en la URL del `303` ni en claro en la cookie lo
 * comprueban, sobre la respuesta real, los tests de `aws-registration.test.ts`.
 */
const ALLOWED_PATHS = [
  join("src", "server", "marketplace"),
  join("src", "app", "aws", "registration", "route.ts"),
];

/**
 * Recorre `src/` saltándose los tests.
 *
 * Los tests no se sirven al cliente, y este archivo cita a propósito los
 * patrones que persigue — sin excluirlos, la comprobación se detectaría a sí
 * misma como infracción.
 */
function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const fullPath = join(directory, entry);
    if (statSync(fullPath).isDirectory()) {
      return entry === "__tests__" ? [] : walk(fullPath);
    }
    if (/\.test\.tsx?$/.test(entry)) return [];
    return /\.(ts|tsx|js|jsx|mdx)$/.test(entry) ? [fullPath] : [];
  });
}

function isAllowed(file: string) {
  const relativePath = relative(process.cwd(), file);
  return ALLOWED_PATHS.some((allowed) => relativePath.startsWith(allowed));
}

/**
 * Quita comentarios antes de buscar.
 *
 * La regla es sobre lo que el código hace, no sobre lo que documenta. Explicar
 * en un comentario por qué `awsAccountId` va firmado — como hace `src/env.js` —
 * no es filtrarlo; sería absurdo que documentar la regla la infringiera.
 */
function codeOnly(contents: string) {
  return contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

function readCode(file: string) {
  return codeOnly(readFileSync(file, "utf8"));
}

describe("awsAccountId no se filtra al cliente", () => {
  const files = walk(SRC);

  it("encuentra archivos que revisar", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("solo aparece dentro de src/server/marketplace", () => {
    const offenders = files
      .filter((file) => !isAllowed(file))
      .filter((file) => readCode(file).includes("awsAccountId"))
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it("no aparece en ningún componente de cliente", () => {
    const offenders = files
      .filter((file) => {
        const contents = readCode(file);
        return (
          contents.includes('"use client"') && contents.includes("awsAccountId")
        );
      })
      .map((file) => relative(process.cwd(), file));

    expect(offenders).toEqual([]);
  });

  it("no se escribe en localStorage, sessionStorage ni en un parámetro de URL", () => {
    const forbidden = [
      /localStorage[\s\S]{0,80}awsAccountId/,
      /sessionStorage[\s\S]{0,80}awsAccountId/,
      /awsAccountId[\s\S]{0,80}localStorage/,
      /awsAccountId[\s\S]{0,80}sessionStorage/,
      /[?&]awsAccountId=/,
      /searchParams[\s\S]{0,40}awsAccountId/,
      /name=["']awsAccountId["']/,
    ];

    const offenders = files.flatMap((file) => {
      const contents = readCode(file);
      return forbidden
        .filter((pattern) => pattern.test(contents))
        .map(
          (pattern) => `${relative(process.cwd(), file)} :: ${pattern.source}`,
        );
    });

    expect(offenders).toEqual([]);
  });
});

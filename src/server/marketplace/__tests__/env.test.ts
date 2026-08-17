/**
 * Criterio de aceptación §6 de la issue #2: «Los secretos declarados en
 * `src/env.js` y el build fallando si faltan.»
 *
 * Se prueba sobre el archivo real y no sobre `env` importado, porque lo que hay
 * que garantizar es la **declaración**: que los dos secretos estén en el esquema
 * de servidor y que no lleven `.optional()`, que es lo que haría que el build
 * pasara sin ellos.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const envSource = readFileSync(join(process.cwd(), "src", "env.js"), "utf8");
const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");

const SECRETS = [
  "MARKETPLACE_SESSION_SECRET",
  "MARKETPLACE_TOKEN_PEPPER",
] as const;

describe("declaración de los secretos del marketplace", () => {
  for (const secret of SECRETS) {
    it(`${secret} está en el esquema de servidor con longitud mínima`, () => {
      const declaration = new RegExp(`${secret}:\\s*z\\.string\\(\\)\\.min\\((\\d+)\\)`);
      const match = declaration.exec(envSource);

      expect(match).not.toBeNull();
      expect(Number(match?.[1])).toBeGreaterThanOrEqual(32);
    });

    it(`${secret} es obligatorio, así que el build falla si falta`, () => {
      // Un `.optional()` en la misma declaración es justo lo que rompería el
      // criterio: el build pasaría y la firma se quedaría sin secreto.
      const optional = new RegExp(`${secret}:[^,]*optional\\(\\)`);

      expect(optional.test(envSource)).toBe(false);
    });

    it(`${secret} se pasa por runtimeEnv`, () => {
      expect(envSource).toContain(`${secret}: process.env.${secret}`);
    });

    it(`${secret} está documentado en .env.example`, () => {
      expect(envExample).toContain(secret);
    });
  }

  it("no filtra los secretos al cliente", () => {
    const clientBlock = /client:\s*\{([\s\S]*?)\n {2}\}/.exec(envSource)?.[1] ?? "";

    for (const secret of SECRETS) {
      expect(clientBlock).not.toContain(secret);
      expect(secret.startsWith("NEXT_PUBLIC_")).toBe(false);
    }
  });

  it(".env.example no trae valores reales", () => {
    for (const secret of SECRETS) {
      expect(envExample).toMatch(new RegExp(`${secret}=""`));
    }
  });
});

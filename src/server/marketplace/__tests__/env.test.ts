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

/**
 * La lista COMPLETA de variables que rompen el build si faltan.
 *
 * Existe porque los dos secretos no son las únicas: `NEXT_PUBLIC_CONVEX_SITE_URL`
 * también se declara sin `.optional()` ni `.default()`, así que un despliegue con
 * los secretos puestos y esa sin poner falla igual — y con la lista viviendo en la
 * descripción de un PR, eso se descubre en el build.
 *
 * La lista se DERIVA del esquema en vez de escribirse a mano: una variable
 * obligatoria nueva aparece aquí sola, y el test obliga a documentarla en
 * `.env.example`, que es lo que alguien lee para configurar el proyecto.
 */
describe("variables obligatorias para desplegar", () => {
  /** Quita comentarios: un `.optional()` citado en una explicación no cuenta. */
  function codeOnly(contents: string) {
    return contents
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/(^|[^:])\/\/.*$/gm, "$1");
  }

  /**
   * Las declaraciones de `server:` y `client:`, cada una con su cuerpo.
   *
   * `runtimeEnv` se corta antes de mirar: lleva los mismos nombres con la misma
   * indentación y no declara nada, solo reexpide `process.env`.
   */
  function declarations(): Map<string, string> {
    const schema = codeOnly(envSource).split("runtimeEnv:")[0] ?? "";
    const found = new Map<string, string>();
    const pattern = /\n {4}([A-Z][A-Z0-9_]*):/g;

    const starts: Array<{ name: string; from: number }> = [];
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(schema)) !== null) {
      starts.push({ name: match[1]!, from: match.index });
    }

    starts.forEach((start, index) => {
      const end = starts[index + 1]?.from ?? schema.length;
      found.set(start.name, schema.slice(start.from, end));
    });

    return found;
  }

  const required = [...declarations()]
    .filter(([, body]) => !/\.optional\(\)|\.default\(/.test(body))
    .map(([name]) => name);

  it("son exactamente las tres que hay que dar de alta antes de mergear", () => {
    expect([...required].sort()).toEqual([
      "MARKETPLACE_SESSION_SECRET",
      "MARKETPLACE_TOKEN_PEPPER",
      "NEXT_PUBLIC_CONVEX_SITE_URL",
    ]);
  });

  it("todas están documentadas en .env.example", () => {
    const undocumented = required.filter((name) => !envExample.includes(name));

    expect(undocumented).toEqual([]);
  });
});

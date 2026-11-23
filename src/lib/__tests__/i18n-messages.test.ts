/**
 * Los textos de cada idioma frente al castellano, que es el idioma fuente.
 *
 * `satisfies Messages` ya obliga a que existan las mismas claves. Esto comprueba
 * lo que el compilador no ve:
 *
 * - Las mismas claves, ni una de más (una clave sobrante es texto muerto).
 * - Los mismos argumentos ICU (`{count}`, plurales, selects) y las mismas
 *   etiquetas de `t.rich` (`<strong>`, `<link>`). Si una traducción pierde un
 *   argumento, el texto sale sin el dato; si pierde una etiqueta, sin el enlace.
 * - Las mismas marcas de los textos que no pasan por ICU (las citas `⟦…⟧` y
 *   las negritas `**` del contenido clínico).
 * - Las listas (leídas con `t.raw`) con el mismo número de elementos.
 * - Nada sin traducir: un texto idéntico al castellano tiene que estar en la
 *   lista de los que se escriben igual en los dos idiomas.
 */
import { describe, expect, it } from "vitest";

import { PURPOSE_STATEMENT, RETENTION_STATEMENT } from "~/lib/eligibility";

import { SAME_AS_SOURCE } from "./i18n-same-as-source";

import ca from "../../../messages/ca";
import en from "../../../messages/en";
import es from "../../../messages/es";
import eu from "../../../messages/eu";
import gl from "../../../messages/gl";

type Leaf = string | string[];

function flatten(value: unknown, prefix = "", out = new Map<string, Leaf>()) {
  if (typeof value === "string") {
    out.set(prefix, value);
  } else if (Array.isArray(value)) {
    if (value.every((item) => typeof item === "string")) {
      out.set(prefix, value);
    } else {
      value.forEach((item, index) => flatten(item, `${prefix}[${index}]`, out));
    }
  } else if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, child]) =>
      flatten(child, prefix ? `${prefix}.${key}` : key, out),
    );
  }

  return out;
}

/**
 * Argumentos y etiquetas de un mensaje ICU, ordenados. Un analizador mínimo:
 * argumentos `{nombre}` / `{nombre, plural, …}` en cualquier nivel, opciones de
 * plural y select, etiquetas `<tag>` y el escape con apóstrofo de `{`, `}` y `<`.
 */
function icuSignature(message: string) {
  const parts = new Set<string>();
  let index = 0;

  function text(stopAtBrace: boolean) {
    while (index < message.length) {
      const char = message[index]!;

      if (char === "'" && /[{}<']/.test(message[index + 1] ?? "")) {
        const end = message.indexOf("'", index + 1);
        index = end === -1 ? message.length : end + 1;
      } else if (char === "{") {
        argument();
      } else if (char === "}" && stopAtBrace) {
        return;
      } else if (char === "<") {
        const tag = /^<\/?([a-zA-Z][\w-]*)\s*\/?>/.exec(message.slice(index));

        if (tag) parts.add(`<${tag[1]}>`);
        index += tag ? tag[0].length : 1;
      } else {
        index += 1;
      }
    }
  }

  function argument() {
    index += 1;
    const header = /^\s*([\w]+)\s*(?:,\s*(\w+)\s*)?/.exec(message.slice(index));
    const name = header?.[1] ?? "?";
    const kind = header?.[2];

    parts.add(kind ? `{${name}, ${kind}}` : `{${name}}`);
    index += header?.[0].length ?? 0;

    if (kind === "plural" || kind === "select" || kind === "selectordinal") {
      index += 1; /* la coma tras el tipo */
      while (index < message.length && message[index] !== "}") {
        const option = /^\s*(=?[\w]+)\s*\{/.exec(message.slice(index));

        if (!option) break;

        parts.add(`${name}:${option[1]}`);
        index += option[0].length;
        text(true);
        index += 1;
        while (/\s/.test(message[index] ?? "")) index += 1;
      }
    } else {
      while (index < message.length && message[index] !== "}") index += 1;
    }

    index += 1;
  }

  text(false);

  return [...parts].sort();
}

/* Marcas del contenido que se lee con `t.raw` y no pasa por ICU. */
function rawMarks(message: string) {
  return {
    anchors: message.match(/⟦[^⟧]+⟧/g) ?? [],
    bold: (message.match(/\*\*/g) ?? []).length,
  };
}

function looksLanguageNeutral(value: string) {
  /* Sin palabras: cifras, símbolos, iniciales, un dominio, un correo o solo argumentos. */
  const withoutArguments = value.replace(/\{[^{}]*\}/g, "");

  return (
    !/[a-záéíóúñü]{3,}/i.test(withoutArguments) ||
    /^[\w.+-]+@[\w.-]+$/.test(value) ||
    /^[\w-]+(\.[\w-]+)+$/.test(value)
  );
}

describe("analizador de mensajes ICU", () => {
  it.each([
    ["Hola {name}", ["{name}"]],
    ["Página {page} de {total}", ["{page}", "{total}"]],
    [
      "{count, plural, one {# artículo} other {# artículos de {tag}}}",
      ["count:one", "count:other", "{count, plural}", "{tag}"],
    ],
    ["Lee <link>la política</link>.", ["<link>"]],
    ["Título<br></br><accent>acento</accent>", ["<accent>", "<br>"]],
    ["Llaves '{'literales'}'", []],
  ])("«%s»", (message, expected) => {
    expect(icuSignature(message)).toEqual([...expected].sort());
  });
});

const source = flatten(es);

describe.each([
  ["en", en],
  ["ca", ca],
  ["gl", gl],
  ["eu", eu],
] as const)("textos en %s", (locale, messages) => {
  const target = flatten(messages);

  it("tienen exactamente las claves del castellano", () => {
    expect([...target.keys()].sort()).toEqual([...source.keys()].sort());
  });

  it("conservan los argumentos ICU y las etiquetas de cada mensaje", () => {
    const mismatches: string[] = [];

    source.forEach((value, key) => {
      const translated = target.get(key);

      if (typeof value !== "string" || typeof translated !== "string") return;

      const expected = icuSignature(value).join(" ");
      const actual = icuSignature(translated).join(" ");

      if (expected !== actual) {
        mismatches.push(`${key}: «${expected}» → «${actual}»`);
      }
    });

    expect(mismatches).toEqual([]);
  });

  it("conservan las citas y las negritas del contenido clínico", () => {
    const mismatches: string[] = [];

    source.forEach((value, key) => {
      const translated = target.get(key);
      const pairs = Array.isArray(value)
        ? value.map((item, index) => [item, (translated as string[])[index]])
        : [[value, translated as string]];

      pairs.forEach(([original, version], position) => {
        if (original === undefined || version === undefined) return;

        const expected = rawMarks(original);
        const actual = rawMarks(version);

        if (
          expected.anchors.join() !== actual.anchors.join() ||
          expected.bold !== actual.bold
        ) {
          mismatches.push(`${key}[${position}]`);
        }
      });
    });

    expect(mismatches).toEqual([]);
  });

  it("mantienen la longitud de cada lista", () => {
    source.forEach((value, key) => {
      if (!Array.isArray(value)) return;

      expect((target.get(key) as string[] | undefined)?.length, key).toBe(
        value.length,
      );
    });
  });

  it("no dejan textos sin traducir", () => {
    const untranslated: string[] = [];

    source.forEach((value, key) => {
      const translated = target.get(key);
      const pairs = Array.isArray(value)
        ? value.map((item, index) => [item, (translated as string[])[index]])
        : [[value, translated]];

      pairs.forEach(([original, version]) => {
        if (
          original === version &&
          typeof original === "string" &&
          !looksLanguageNeutral(original) &&
          !SAME_AS_SOURCE[locale].has(original)
        ) {
          untranslated.push(`${key}: ${original.slice(0, 60)}`);
        }
      });
    });

    expect(untranslated).toEqual([]);
  });
});

describe("textos del evaluador en la política de privacidad", () => {
  /*
    El evaluador solo existe en castellano y su consentimiento cita estas
    constantes. La política las usa tal cual en castellano; sus traducciones
    parten de la copia que hay en los mensajes, que no puede divergir.
  */
  it("la copia en castellano es idéntica a las constantes del consentimiento", () => {
    expect(es.legal.privacy.evaluatorStatements.purpose).toBe(
      PURPOSE_STATEMENT,
    );
    expect(es.legal.privacy.evaluatorStatements.retention).toBe(
      RETENTION_STATEMENT,
    );
  });
});

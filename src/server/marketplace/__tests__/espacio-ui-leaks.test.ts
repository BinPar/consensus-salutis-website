/**
 * Criterios de aceptación §7 de la issue #7, los que son reglas sobre el código
 * y no sobre una función:
 *
 *   Los cuatro estados dichos como los diría una persona: ¿lo entendería una
 *   dirección de compras? Ni `resolved`, ni `licensed`, ni `provisioned`, ni
 *   `ended` en nada que se pinte.
 *
 *   El enlace a la plataforma aparece SOLO en `provisioned`.
 *
 *   La pantalla del enlace no canjea nada.
 *
 * Mismo método que `informe-ui-leaks` e `interview-ui-leaks`: se recorren los
 * archivos, porque son reglas que se rompen moviendo código de sitio y un test
 * sobre una función concreta no las vería. `vitest.config.ts` solo incluye
 * `*.test.ts`, así que esto es inspección de fuente y no renderizado — que para
 * estas garantías es lo correcto de todas formas: lo que se quiere fijar es que
 * el código no PUEDA pintarlas, no que en un caso concreto no las pinte.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  ACCESO_ENVIADO,
  ENLACE_NO_VALIDO,
  ESTADO_COPY,
  ESTADOS,
  muestraAccesoPlataforma,
} from "~/lib/espacio";

const ESPACIO_PAGE = join(process.cwd(), "src", "app", "espacio", "page.tsx");
const ACCESO_PAGE = join(
  process.cwd(),
  "src",
  "app",
  "espacio",
  "acceso",
  "[token]",
  "page.tsx",
);
const VIEW = join(
  process.cwd(),
  "src",
  "app",
  "_components",
  "espacio",
  "espacio-view.tsx",
);
const FORM = join(
  process.cwd(),
  "src",
  "app",
  "_components",
  "espacio",
  "acceso-form.tsx",
);
const COPY = join(process.cwd(), "src", "lib", "espacio.ts");

const UI = [ESPACIO_PAGE, ACCESO_PAGE, VIEW, FORM];

/**
 * Quita comentarios antes de buscar.
 *
 * La regla es sobre lo que se pinta, no sobre lo que se documenta. Explicar en un
 * comentario que el enlace solo sale en `provisioned` —como hace `espacio-view`—
 * no es pintar `provisioned`; sería absurdo que documentar la regla la
 * infringiera.
 */
function codeOnly(contents: string) {
  return contents
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");
}

const source = (file: string) => readFileSync(file, "utf8");
const code = (file: string) => codeOnly(source(file));

/**
 * El texto que un navegador pintaría: los nodos de texto del JSX.
 *
 * Se extrae en vez de mirar el archivo entero porque los cuatro nombres internos
 * SÍ tienen sitios legítimos donde aparecer —como CLAVES de `ESTADO_COPY`, en
 * posición de tipo y en el `Set` que valida la cookie—, igual que en
 * `interview-ui-leaks` los literales del nivel están prohibidos en la UI pero no
 * en el motor. Lo que no puede pasar es que uno de ellos sea copy.
 */
function textoJsx(file: string): string[] {
  return [...code(file).matchAll(/>([^<>{}]+)</g)]
    .map((match) => (match[1] ?? "").trim())
    .filter((texto) => texto.length > 0);
}

/** Las cuatro cadenas de cada estado que llegan a la pantalla. */
const copyDeEstado = (estado: (typeof ESTADOS)[number]) => {
  const copy = ESTADO_COPY[estado];
  return [copy.rotulo, copy.titular, copy.cuerpo, copy.fechaRotulo];
};

describe("los cuatro estados están dichos en castellano, no en el idioma de la máquina", () => {
  it("son exactamente cuatro", () => {
    expect(ESTADOS).toEqual(["resolved", "licensed", "provisioned", "ended"]);
  });

  it("los cuatro tienen rótulo, titular, cuerpo y rótulo de fecha, y ninguno vacío", () => {
    for (const estado of ESTADOS) {
      const copy = ESTADO_COPY[estado];
      for (const [campo, valor] of Object.entries({
        rotulo: copy.rotulo,
        titular: copy.titular,
        cuerpo: copy.cuerpo,
        fechaRotulo: copy.fechaRotulo,
      })) {
        expect(valor.trim().length, `${estado}.${campo}`).toBeGreaterThan(0);
      }
      // Tres tokens, no cuatro: ninguno de los cuatro estados es un error del
      // cliente, así que el rojo no está ni declarado.
      expect(["ok", "mid", "neutro"]).toContain(copy.color);
    }
  });

  /*
    Ni el nombre interno ni una traducción literal del nombre interno: lo que se
    dice es qué ha pasado y qué va a pasar. La lista incluye el vocabulario
    inglés de la máquina de estados entero, no solo los cuatro nombres, porque
    «status» o «subscription» colados en una frase delatan igual de dónde sale.
  */
  const VOCABULARIO_DE_LA_MAQUINA =
    /\b(resolved|licensed|provisioned|ended|status|subscription|license|pending|active|expired|redeem|token)\b/i;

  it("ninguna cadena de los cuatro estados usa el vocabulario de la máquina", () => {
    const infractores = ESTADOS.flatMap((estado) =>
      copyDeEstado(estado)
        .filter((texto) => VOCABULARIO_DE_LA_MAQUINA.test(texto))
        .map((texto) => `${estado} :: ${texto}`),
    );

    expect(infractores).toEqual([]);
  });

  it("tampoco la copy del formulario ni la del enlace caducado", () => {
    for (const texto of [
      ACCESO_ENVIADO.titulo,
      ACCESO_ENVIADO.cuerpo,
      ENLACE_NO_VALIDO.titulo,
      ENLACE_NO_VALIDO.cuerpo,
    ]) {
      expect(VOCABULARIO_DE_LA_MAQUINA.test(texto), texto).toBe(false);
    }
  });

  it("el extractor de texto ve de verdad la copy de la pantalla", () => {
    // Sin esto, los dos tests de abajo pasarían por no encontrar nada que mirar.
    expect(textoJsx(VIEW)).toContain("Tu suscripción de AWS Marketplace");
    expect(textoJsx(ACCESO_PAGE)).toContain("Ya casi estás dentro");
  });

  it("ningún nodo de texto del JSX pinta uno de los cuatro nombres internos", () => {
    const infractores = UI.flatMap((file) =>
      textoJsx(file)
        .filter((texto) =>
          /\b(resolved|licensed|provisioned|ended)\b/i.test(texto),
        )
        .map((texto) => `${file} :: ${texto}`),
    );

    expect(infractores).toEqual([]);
  });
});

// Criterio de aceptación §7: el enlace a la plataforma aparece SOLO en `provisioned`.
describe("el enlace a la plataforma solo existe en un estado", () => {
  it("la función dice sí a provisioned y no a los otros tres", () => {
    for (const estado of ESTADOS) {
      expect(muestraAccesoPlataforma(estado), estado).toBe(
        estado === "provisioned",
      );
    }
  });

  it("el JSX del enlace está dentro de esa guarda y de ninguna otra", () => {
    const view = source(VIEW);
    const guarda = view.indexOf("muestraAccesoPlataforma(estado)");
    const href = view.indexOf("href={plataformaUrl}");
    const cierre = view.indexOf(") : null}", guarda);

    expect(guarda).toBeGreaterThan(-1);
    expect(cierre).toBeGreaterThan(guarda);
    // Antes de la transición no hay cuenta que loguear, y ofrecer un `/sign-in`
    // que va a rechazar al cliente es peor que no ofrecerlo.
    expect(href).toBeGreaterThan(guarda);
    expect(href).toBeLessThan(cierre);
  });

  it("hay una sola guarda y un solo enlace: nada de una segunda copia sin proteger", () => {
    const view = code(VIEW);

    expect(view.match(/muestraAccesoPlataforma\(/g)).toHaveLength(1);
    expect(view.match(/href=\{plataformaUrl\}/g)).toHaveLength(1);
    // Tipo de la prop, desestructuración y el `href`. Nada más: cualquier cuarto
    // uso sería una vía para pintar el enlace fuera de la guarda.
    expect(view.match(/plataformaUrl/g)).toHaveLength(3);
  });
});

describe("la copy corregida se queda corregida", () => {
  it("el badge no dice «cuenta» dos veces", () => {
    const view = code(VIEW);

    expect(view).toContain("Cuenta de AWS Marketplace verificada · ····");
    expect(view).not.toMatch(/verificada · cuenta/);
  });

  it("el estado terminado no promete un informe que puede no existir", () => {
    // Una suscripción puede terminar sin que nadie hiciera la entrevista, y el
    // bloque de abajo ya dice si hay informe. Prometerlo aquí y desmentirlo tres
    // centímetros más abajo es peor que callarse.
    expect(ESTADO_COPY.ended.cuerpo).not.toMatch(/informe/i);
    // Y sí dice qué hacer, que es lo único que queda por decir.
    expect(ESTADO_COPY.ended.cuerpo).toMatch(/soporte/i);
  });
});

describe("las cuatro causas de rechazo del enlace son una sola pantalla", () => {
  // Contarle a quien canjea cuál de las cuatro fue le diría a quien prueba
  // enlaces al azar cuál de ellos existió.
  it("el cuerpo no distingue caducado, ya usado, inexistente ni email que no casa", () => {
    expect(ENLACE_NO_VALIDO.cuerpo).not.toMatch(
      /ya (se ha )?usado|inexistente|no existe|otro correo|no coincide/i,
    );
  });

  it("y dice qué hacer, que es lo único útil", () => {
    expect(ENLACE_NO_VALIDO.cuerpo).toMatch(/pide uno nuevo/i);
  });
});

/**
 * La respuesta del formulario es la misma para email conocido y desconocido, y
 * la copy es la mitad de esa garantía: la otra mitad la sostiene la ruta.
 */
describe("la copy del acuse de recibo no es un oráculo", () => {
  it("está congelada, así que no se le puede añadir un campo delator", () => {
    expect(Object.isFrozen(ACCESO_ENVIADO)).toBe(true);
  });

  it("tiene exactamente título y cuerpo, sin hueco para interpolar un email", () => {
    expect(Object.keys(ACCESO_ENVIADO)).toEqual(["titulo", "cuerpo"]);
  });

  it("habla en condicional: «si ese correo…», no «te hemos enviado»", () => {
    expect(ACCESO_ENVIADO.cuerpo).toMatch(/^si ese correo/i);
    expect(ACCESO_ENVIADO.cuerpo).not.toMatch(
      /no existe|no encontrad|desconocid|te hemos enviado/i,
    );
  });

  it("la pantalla de éxito pinta la copy entera y no menciona el email", () => {
    const exito =
      /if \(status === "success"\)[\s\S]*?\n {2}\}/.exec(code(FORM))?.[0] ?? "";

    expect(exito).toContain("ACCESO_ENVIADO.titulo");
    expect(exito).toContain("ACCESO_ENVIADO.cuerpo");
    // Si la compusiera a trozos, alguien acabaría metiendo el email dentro y el
    // formulario diría, de una en una, qué instituciones son clientes nuestras.
    expect(exito).not.toContain("email");
  });
});

describe("la cuenta de AWS no se pinta entera", () => {
  it("la vista solo conoce los cuatro dígitos", () => {
    const view = code(VIEW);

    expect(view).toContain("awsLast4");
    expect(view).not.toContain("awsAccountId");
    expect(view).not.toContain("licenseArn");
    // Y no hay ningún número de doce dígitos escrito a mano por el camino.
    expect(view).not.toMatch(/\b\d{12}\b/);
  });
});

describe("ninguna de las dos páginas se indexa ni se prerrenderiza", () => {
  for (const file of [ESPACIO_PAGE, ACCESO_PAGE]) {
    it(`${file.replace(process.cwd(), "")} declara noindex y force-dynamic`, () => {
      const contents = source(file);

      expect(contents).toMatch(
        /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/,
      );
      expect(contents).toMatch(/export const dynamic = "force-dynamic"/);
    });
  }
});

/**
 * El aviso del enlace que no valía, para quien YA tenía sesión.
 *
 * Sin él, quien pulsa un enlace caducado teniendo la sesión abierta ve su espacio
 * de siempre y no entiende nada —y peor si el enlace era de OTRA suscripción,
 * porque parecería que le ha llevado a la suya—. Lo que no se dice, aquí tampoco,
 * es cuál de las cuatro causas fue.
 */
describe("el aviso del enlace que no valía", () => {
  const page = code(ESPACIO_PAGE);
  /** El cuerpo del componente, para no juzgar el aviso por el resto de la página. */
  const cuerpoDelAviso =
    /function AvisoEnlace\(\)[\s\S]*?\n\}/.exec(page)?.[0] ?? "";

  it("existe como componente propio y no suelto en la página", () => {
    expect(cuerpoDelAviso.length).toBeGreaterThan(0);
  });

  it("solo se pinta con enlace=no-valido, y con nada más", () => {
    // Una sola condición, y la misma que decide el hueco de arriba: si el aviso y
    // el `pt` se guiaran por condiciones distintas, un día se pintaría el aviso
    // con el hueco doble o el hueco sin aviso.
    expect(page).toContain('enlace === "no-valido" ? <AvisoEnlace /> : null');
    expect(page).toContain('pegadoAlAviso={enlace === "no-valido"}');
    expect(page.match(/<AvisoEnlace \/>/g)).toHaveLength(1);
  });

  it("reutiliza la copy congelada en vez de escribir otra frase", () => {
    expect(cuerpoDelAviso).toContain("ENLACE_NO_VALIDO.titulo");
    expect(cuerpoDelAviso).toContain("ENLACE_NO_VALIDO.cuerpo");
  });

  it("su copy tampoco distingue las cuatro causas de rechazo", () => {
    // La regla es la misma que en la pantalla sin sesión: quien prueba enlaces al
    // azar no puede aprender cuál de ellos existió.
    for (const texto of textoJsx(ESPACIO_PAGE)) {
      expect(texto, texto).not.toMatch(
        /ya (se ha )?usado|inexistente|no existe|otro correo|no coincide/i,
      );
    }
    expect(cuerpoDelAviso).not.toMatch(/caducad|expirad|usado|inexistente/i);
  });

  it("y no acusa a la sesión, que sigue siendo buena", () => {
    // Va como `status` y no como `alert`, y en el tono neutro del sistema: no es
    // un error de la página, es una explicación.
    expect(cuerpoDelAviso).toContain('role="status"');
    expect(cuerpoDelAviso).not.toContain('role="alert"');
    expect(cuerpoDelAviso).not.toMatch(/text-rose|bg-rose|text-red|bg-red/);
  });

  it("dice que sigue dentro, que es la parte que faltaba", () => {
    expect(cuerpoDelAviso).toMatch(/sigues\s+dentro/i);
  });
});

/**
 * La garantía anti-prefetch, y es la razón de ser de la pantalla intermedia.
 *
 * El enlace es de un solo uso y hay software que lo abre sin que nadie lo pulse:
 * antivirus de correo corporativos, previsualizadores de enlaces y el prefetch
 * del navegador. Si este `GET` canjeara, el escáner del propio hospital quemaría
 * el enlace antes de que la dirección de compras llegara a verlo. Así que la
 * pantalla no puede tener ni la posibilidad de canjear: ni cliente de Convex, ni
 * cookies, ni sesión.
 */
describe("la pantalla del enlace no canjea nada", () => {
  for (const prohibido of [
    "redeemSpaceToken",
    "convex-space",
    "cookies()",
    "spaceCookieOptions",
    "signSpaceSession",
  ]) {
    it(`no contiene ${prohibido}`, () => {
      expect(code(ACCESO_PAGE)).not.toContain(prohibido);
    });
  }

  it("lo irreversible pasa por un POST a la ruta de canje", () => {
    const contents = code(ACCESO_PAGE);

    expect(contents).toContain('method="post"');
    expect(contents).toContain('action="/api/espacio/canje"');
  });
});

/**
 * Tailwind lee el código fuente y **no lo ejecuta**: una clase interpolada no
 * existe, así que el filete del semáforo saldría transparente en producción y en
 * ningún test de lógica. Misma disciplina que `informe-view.tsx`.
 */
describe("las clases del semáforo son cadenas completas", () => {
  it("ninguna clase del semáforo lleva una interpolación dentro", () => {
    const clases = [
      ...code(VIEW).matchAll(/(?:bg|text)-\(--semaforo[^)]*\)/g),
    ].map((match) => match[0]);

    expect(clases.length).toBeGreaterThanOrEqual(8);
    for (const clase of clases) {
      expect(clase, clase).not.toContain("${");
    }
    expect(code(VIEW)).not.toMatch(/--semaforo-\$\{/);
  });

  it("los cuatro tokens están escritos, uno por uno", () => {
    const view = code(VIEW);

    for (const color of ["ok", "mid", "neutro"]) {
      expect(view, color).toContain(`bg-(--semaforo-${color})`);
      expect(view, color).toContain(`text-(--semaforo-${color})`);
    }
  });

  it("el rojo NO está declarado, y su ausencia es la decisión", () => {
    // Declararlo sería dejar la puerta abierta a que alguien se lo ponga a
    // `ended` sin discutirlo, y `ended` es un hecho administrativo: el rojo ahí
    // leería como «algo va mal por tu culpa» delante de quien decidió cancelar.
    expect(code(VIEW)).not.toContain("--semaforo-no)");
    expect(code(COPY)).not.toMatch(/color:\s*"no"/);
  });

  it("el color nunca viaja solo: su palabra va escrita al lado", () => {
    // Accesibilidad y sentido común: un filete de color sin rótulo no dice nada
    // a quien no distingue los cuatro tonos.
    const view = code(VIEW);

    expect(view).toContain("copy.rotulo");
  });
});

describe("la copy vive en un solo sitio", () => {
  it("la vista no reescribe ninguno de los cuatro estados por su cuenta", () => {
    const view = code(VIEW);

    expect(view).toContain("ESTADO_COPY[estado]");
    // Ni un `switch` ni un mapa paralelo: dos sitios donde leer lo mismo y uno
    // donde corregirlo.
    expect(view).not.toMatch(/switch\s*\(\s*estado\s*\)/);
  });

  it("el módulo de copy no habla con Convex ni con el navegador", () => {
    const copy = code(COPY);

    expect(copy).not.toContain("fetch(");
    expect(copy).not.toContain("localStorage");
    expect(copy).not.toContain("~/server");
  });
});

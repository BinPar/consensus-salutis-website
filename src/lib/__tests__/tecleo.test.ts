import { describe, expect, it } from "vitest";

import { avanceDelTecleo, TECLEO_MS } from "~/lib/tecleo";

/**
 * El ritmo del tecleo de la burbuja en curso.
 *
 * Se prueba aquí y no en el navegador porque no hay forma de probarlo en un
 * navegador automatizado: el tecleo va con `requestAnimationFrame`, que no corre
 * mientras la pestaña está oculta — que es justo como corre una pestaña
 * pilotada. Lo que sí se puede comprobar, y es lo que importa, es que la
 * aritmética converge: que no se descuelga y que siempre termina.
 */

/** Un frame de 60 Hz. Es el paso real con el que corre el bucle. */
const FRAME_MS = 16;

/**
 * Simula el tecleo contra un servidor que manda el mensaje entero cada
 * `bloqueMs`, sumando `charsPorBloque` cada vez.
 */
function simular({
  bloques,
  charsPorBloque,
  bloqueMs,
}: {
  bloques: number;
  charsPorBloque: number;
  bloqueMs: number;
}) {
  let llegados = 0;
  let visibles = 0;
  let retrasoMaximo = 0;

  /*
    Unos frames de más al final: el bucle no se para con el último bloque, sigue
    vivo hasta que llega el turno definitivo. Sin ellos la simulación cortaría al
    penúltimo carácter y estaría midiendo su propio borde, no el tecleo.
  */
  const frames = Math.ceil((bloques * bloqueMs) / FRAME_MS) + 30;
  for (let frame = 0; frame < frames; frame += 1) {
    const t = frame * FRAME_MS;
    llegados = Math.min(bloques, Math.floor(t / bloqueMs) + 1) * charsPorBloque;
    visibles += avanceDelTecleo(llegados - visibles, FRAME_MS);
    retrasoMaximo = Math.max(retrasoMaximo, llegados - visibles);
  }

  return { llegados, visibles, retrasoMaximo };
}

describe("el ritmo del tecleo", () => {
  /*
    La propiedad que lo justifica todo: con una velocidad fija habría que acertar
    el número, y errar por lo bajo hace que el retraso crezca sin techo hasta que
    la burbuja va media respuesta por detrás. En proporción no hay número que
    acertar.
  */
  it("no se descuelga aunque el texto siga llegando", () => {
    const { retrasoMaximo } = simular({
      bloques: 30,
      charsPorBloque: 50,
      bloqueMs: 120,
    });

    // Un bloque de retraso es lo esperable; dos ya sería ir por detrás.
    expect(retrasoMaximo).toBeLessThanOrEqual(100);
  });

  it("un párrafo de golpe se teclea igual de bien que una palabra", () => {
    const parrafo = simular({ bloques: 1, charsPorBloque: 600, bloqueMs: 600 });
    const palabra = simular({ bloques: 1, charsPorBloque: 6, bloqueMs: 600 });

    expect(parrafo.visibles).toBe(parrafo.llegados);
    expect(palabra.visibles).toBe(palabra.llegados);
  });

  /*
    Con lo pendiente muy bajo el redondeo da cero, y sin el mínimo de un carácter
    el final de un mensaje corto no llegaría a salir NUNCA: la burbuja se quedaría
    con la última palabra a medias hasta que el turno la reemplazara.
  */
  it("siempre avanza al menos un carácter", () => {
    expect(avanceDelTecleo(1, 1)).toBe(1);
    expect(avanceDelTecleo(3, 4)).toBeGreaterThanOrEqual(1);
  });

  it("nunca se pasa de lo que ha llegado", () => {
    expect(avanceDelTecleo(5, 10_000)).toBe(5);
    expect(avanceDelTecleo(0, 100)).toBe(0);
    expect(avanceDelTecleo(-3, 100)).toBe(0);
  });

  /*
    La constante de tiempo es lo que la hace comparable con el transporte: en un
    `TECLEO_MS` sale la mayor parte de lo pendiente. Si alguien la sube por encima
    del ritmo con el que llegan los bloques, el tecleo pasa a ser el cuello de
    botella y la burbuja empieza a ir por detrás.
  */
  it("vacía la mayor parte de lo pendiente en una constante de tiempo", () => {
    let pendientes = 100;
    for (let t = 0; t < TECLEO_MS; t += FRAME_MS) {
      pendientes -= avanceDelTecleo(pendientes, FRAME_MS);
    }
    expect(pendientes).toBeLessThan(40);
  });
});

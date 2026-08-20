/**
 * El ritmo con el que se suelta un texto que llega a bloques.
 *
 * ## Qué problema resuelve
 *
 * El servidor de la entrevista no manda letras: manda el mensaje entero cada
 * ~120 ms (ver `withTurnStream` en Convex). Pintado tal cual, el texto aparece a
 * bloques de cuarenta o cincuenta caracteres por muy fino que se afine el
 * transporte, y eso no se lee como alguien escribiendo sino como una pantalla
 * que parpadea.
 *
 * Esto no inventa texto ni lo adorna: RETIENE lo que ya ha llegado y lo deja
 * salir a un ritmo parejo. Las letras son las del servidor, en su orden; lo
 * único que se elige es cuándo se ve cada una.
 *
 * ## Por qué el avance es proporcional y no una velocidad fija
 *
 * Con una velocidad fija hay que acertar el número: si va lenta se descuelga
 * —cada bloque llega antes de terminar el anterior y el retraso crece sin
 * techo— y si va rápida no suaviza nada. Vaciar en proporción a lo que queda no
 * necesita acertar: un bloque grande se teclea deprisa y uno pequeño despacio, y
 * el retraso se queda siempre en el orden de la constante de tiempo, llegue una
 * palabra o un párrafo.
 *
 * Vive aquí, fuera del componente, porque es la parte que se puede comprobar sin
 * navegador — y hace falta, porque `requestAnimationFrame` no corre en una
 * pestaña oculta y esto no se deja probar en un navegador automatizado.
 */

/**
 * Constante de tiempo del tecleo, en milisegundos: en cada `TECLEO_MS` se vacía
 * la mayor parte de lo pendiente.
 *
 * Ajustada al ritmo del transporte (~120 ms por bloque), que es lo que deja el
 * tecleo pegado al bloque siguiente: cuando llega el turno definitivo queda por
 * enseñar un puñado de caracteres, y el cambio de la burbuja en curso al mensaje
 * de verdad no se ve.
 */
export const TECLEO_MS = 120;

/**
 * Cuántos caracteres más se enseñan en este frame.
 *
 * Nunca menos de uno: con lo pendiente muy bajo el redondeo daría cero y el
 * final de un mensaje corto no llegaría a salir nunca.
 *
 * `dt` viene con tope del llamante: volver a una pestaña que estaba en segundo
 * plano trae un salto de varios segundos, y sin recortarlo el tecleo se saltaría
 * el texto entero de golpe.
 */
export function avanceDelTecleo(pendientes: number, dt: number): number {
  if (pendientes <= 0) return 0;
  return Math.min(
    pendientes,
    Math.max(1, Math.round((pendientes * dt) / TECLEO_MS)),
  );
}

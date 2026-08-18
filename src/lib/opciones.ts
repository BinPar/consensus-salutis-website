/**
 * Normalización del texto que escribe el modelo y del que escribió el cliente.
 *
 * ## Por qué se normaliza aquí y no solo en el prompt
 *
 * El modelo devuelve las opciones en minúscula —«sí, ya lo tenemos», «no lo
 * sé»— y a veces con un punto final. Se pide en el prompt que no lo haga, y
 * además se corrige aquí: es el mismo criterio de defensa en profundidad por el
 * que `ficha.ts` duplica la tabla de campos en vez de confiar en el otro lado.
 * Un prompt no es un contrato.
 *
 * ## Lo que NO hace
 *
 * No decide qué control se pinta —eso es de la pantalla— ni traduce nada: solo
 * arregla la forma. Si el modelo ya escribió bien, devuelve lo que llegó.
 */

/**
 * Mayúscula inicial, respetando la tilde y sin tocar lo que ya la lleva.
 *
 * Lo usan las opciones y las plantillas de `ficha.ts`: los dos pintan texto que
 * escribió el modelo en minúscula y que se lee como el principio de una línea.
 */
export function mayusculaInicial(raw: string): string {
  const t = raw.trim();
  if (t.length === 0) return t;

  const first = [...t][0]!;
  // Un valor que ya empieza en mayúscula no se toca: el modelo puede tener
  // razón («HL7 FHIR», «SERMAS», «España»).
  if (first === first.toUpperCase() && first !== first.toLowerCase()) return t;

  return first.toLocaleUpperCase("es-ES") + t.slice(first.length);
}

/** Una opción, lista para pintarse en una fila: con mayúscula y sin punto. */
export function etiquetaOpcion(raw: string): string {
  return mayusculaInicial(raw.trim().replace(/[.…]+$/, ""));
}

/**
 * Partículas que se quedan en minúscula dentro del nombre de una institución.
 *
 * La lista es corta a propósito: cada añadido es una forma nueva de escribir mal
 * un nombre propio que el cliente ya escribió bien.
 */
const PARTICULAS = new Set(["de", "del", "la", "las", "los", "y", "e"]);

/**
 * El nombre de la institución tal y como se lee en una cabecera.
 *
 * Llega tal cual lo escribió el cliente en la etapa 0 —«Hospital de móstoles»—
 * y se pinta en la barra de la entrevista, así que la capitalización es por
 * palabra y no de la primera letra: «Hospital de Móstoles».
 *
 * Una palabra que ya lleva alguna mayúscula NO se toca. Es lo que salva las
 * siglas y los nombres compuestos que el cliente escribió a conciencia:
 * «SERMAS», «H.U. La Paz», «McKinsey».
 */
export function capitalizarInstitucion(raw: string): string {
  const limpio = raw.trim().replace(/\s+/g, " ");
  if (limpio.length === 0) return limpio;

  return limpio
    .split(" ")
    .map((palabra, index) => {
      if (/\p{Lu}/u.test(palabra)) return palabra;
      if (index > 0 && PARTICULAS.has(palabra)) return palabra;

      const first = [...palabra][0];
      if (first === undefined) return palabra;
      return first.toLocaleUpperCase("es-ES") + palabra.slice(first.length);
    })
    .join(" ");
}

/** Sin tildes y en minúscula, para comparar lo que el modelo escribió a mano. */
function plano(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

/**
 * «No lo sé» y sus variantes.
 *
 * No es una respuesta: es la salida de quien no tiene el dato. Por eso se pinta
 * como un enlace de texto debajo de las filas y no como una fila más — pesar lo
 * mismo que «Sí, ya lo tenemos» la convertiría en una opción legítima.
 */
export function esEscapatoria(opcion: string): boolean {
  return ["no lo se", "no lo se / no aplica", "no sabria decir", "no estoy seguro"].includes(
    plano(opcion),
  );
}

/** Las opciones partidas en respuestas y escapatoria, ya con su etiqueta. */
export type OpcionesPartidas = {
  /** Las respuestas de verdad, en el orden en que llegaron. */
  respuestas: string[];
  /** La escapatoria, si venía. Como mucho una. */
  escapatoria: string | null;
  /**
   * Las respuestas son exactamente «Sí» y «No», ignorando la escapatoria: la
   * pregunta es binaria y se pinta como un segmentado en vez de tres filas.
   */
  binaria: boolean;
};

export function partirOpciones(opciones: readonly string[]): OpcionesPartidas {
  const respuestas: string[] = [];
  let escapatoria: string | null = null;

  for (const raw of opciones) {
    const etiqueta = etiquetaOpcion(raw);
    if (etiqueta.length === 0) continue;
    if (esEscapatoria(raw)) {
      // Una segunda escapatoria no añade nada: la primera ya da la salida.
      escapatoria ??= etiqueta;
      continue;
    }
    respuestas.push(etiqueta);
  }

  const binaria =
    respuestas.length === 2 &&
    plano(respuestas[0]!) === "si" &&
    plano(respuestas[1]!) === "no";

  return { respuestas, escapatoria, binaria };
}

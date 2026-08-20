/**
 * Las tres cifras y los cinco rasgos: el panel dicho en ocho unidades de
 * lectura en vez de veintiocho filas.
 *
 * ## Por qué un rasgo y no una lista de pares
 *
 * Veintitrés etiquetas del mismo tamaño y color no son un resumen: no hay nada
 * oculto y por eso mismo no destaca nada. Un rasgo por bloque, telegráfico y con
 * la palabra decisiva en el acento, dice lo que caracteriza el caso; los
 * veintitrés datos van completos en el informe, que es el registro.
 *
 * ## Las tres reglas de composición
 *
 * 1. **Devuelve `null` si falta el campo pivote** — el que da sujeto a la frase.
 *    Sin él el bloque no se pinta, y así el panel CRECE con la conversación en
 *    vez de esperar vacío.
 * 2. **Nunca nombra lo que falta.** No hay «(centros: sin recoger)». El hueco se
 *    manifiesta como brevedad.
 * 3. **Sin verbo principal.** «Hospital público en Madrid», no «El hospital es
 *    público y está en Madrid». Son rótulos, no oraciones.
 *
 * Un campo puede no salir en ningún rasgo, y no pasa nada: «Interés en corpus
 * general» o «Azure AD» son datos del informe. Su plantilla existe igual porque
 * el informe la usa.
 *
 * ## Lo que este módulo NO sabe
 *
 * No sabe de confianza ni de origen: los fragmentos llevan el `path` del campo
 * del que salen y quien pinta busca la celda para decidir si va con subrayado
 * punteado —deducido— o en negrita de acento —corregido por el cliente—. Así el
 * texto se puede probar sin montar una ficha con tres niveles de confianza.
 */

import {
  FICHA_BLOCKS,
  enumerar,
  esCierto,
  fichaCell,
  fichaFieldByPath,
  fmt,
  type Ficha,
  type FichaBlock,
  type FichaValue,
} from "~/lib/ficha";

/** Un trozo de rasgo. Sin `path` es texto de unión y no se marca nunca. */
export type RasgoFragment = {
  text: string;
  /** `bloque.campo` del dato que dice este trozo. */
  path?: string;
  /** El trozo decisivo del rasgo: va en negrita de acento. */
  decisive?: boolean;
};

export type Rasgo = {
  block: FichaBlock;
  fragments: RasgoFragment[];
  /** El rasgo entero en texto plano. Para los tests y para el nombre accesible. */
  text: string;
};

function cell(ficha: Ficha, path: string) {
  const spec = fichaFieldByPath(path);
  if (spec === undefined) return undefined;
  return fichaCell(ficha, spec);
}

/** El valor de un campo, o `undefined` si no se ha anotado. */
function value(ficha: Ficha, path: string): FichaValue | undefined {
  return cell(ficha, path)?.valor;
}

/** El campo dicho por su plantilla, o `undefined` si no hay valor. */
function chip(ficha: Ficha, path: string): string | undefined {
  const spec = fichaFieldByPath(path);
  if (spec === undefined) return undefined;
  const found = fichaCell(ficha, spec);
  return found === undefined ? undefined : spec.chip(found.valor);
}

function cierto(ficha: Ficha, path: string): boolean {
  const found = value(ficha, path);
  return found !== undefined && esCierto(found);
}

function texto(ficha: Ficha, path: string): string | undefined {
  const found = value(ficha, path);
  if (found === undefined) return undefined;
  const raw = Array.isArray(found) ? enumerar(found) : String(found);
  return raw.trim().length > 0 ? raw.trim() : undefined;
}

/** Un constructor de rasgo que sabe callar: un fragmento sin texto no entra. */
class Builder {
  private readonly out: RasgoFragment[] = [];

  add(text: string | undefined, path?: string, decisive?: boolean): this {
    if (text === undefined || text.length === 0) return this;
    this.out.push({
      text,
      ...(path !== undefined && { path }),
      ...(decisive === true && { decisive: true }),
    });
    return this;
  }

  /** Texto de unión: la coma, el « en », el « · ». Nunca se marca. */
  join(text: string): this {
    if (this.out.length > 0) this.out.push({ text });
    return this;
  }

  build(block: FichaBlock): Rasgo {
    return {
      block,
      fragments: this.out,
      text: this.out.map((fragment) => fragment.text).join(""),
    };
  }
}

/**
 * Terminaciones femeninas del castellano, para concordar un adjetivo con el tipo
 * de institución.
 *
 * Hace falta porque el rasgo de perfil escribe «Hospital público» pero también
 * «Clínica privada» y «Fundación pública»: el tipo lo escribe el modelo y no hay
 * una lista cerrada de tipos. La regla es por sufijo y no por diccionario —`-a`,
 * `-ción`, `-dad`, `-tad`— que es lo que cubre las familias que se ven de verdad;
 * un masculino en `-a` como «problema» no es un tipo de institución.
 */
const SUFIJOS_FEMENINOS = /(a|ción|sión|dad|tad|tud|umbre|ez|nza|cia)$/i;

function esFemenino(familia: string): boolean {
  return SUFIJOS_FEMENINOS.test(familia.trim());
}

/**
 * Perfil. Pivote: `familia`.
 *
 * La titularidad y la comunidad van en el acento porque son los dos datos por
 * los que alguien de dirección médica reconoce su propia casa de un vistazo.
 */
function rasgoPerfil(ficha: Ficha): Rasgo | null {
  const familia = texto(ficha, "perfil.familia");
  if (familia === undefined) return null;

  const builder = new Builder().add(
    chip(ficha, "perfil.familia"),
    "perfil.familia",
  );

  if (value(ficha, "perfil.ambitoPublico") !== undefined) {
    const femenino = esFemenino(familia);
    builder
      .join(" ")
      .add(
        cierto(ficha, "perfil.ambitoPublico")
          ? femenino
            ? "pública"
            : "público"
          : femenino
            ? "privada"
            : "privado",
        "perfil.ambitoPublico",
        true,
      );
  }

  const comunidad = texto(ficha, "perfil.comunidad");
  if (comunidad !== undefined) {
    builder.join(" en ").add(comunidad, "perfil.comunidad", true);
  }

  return builder.build("perfil");
}

/**
 * Corpus. Pivote: `corpusPropio`.
 *
 * El volumen NO entra aquí aunque sea el dato decisivo del bloque: es la primera
 * de las tres cifras y ya se ve en grande justo encima. Repetirlo gastaría la
 * segunda línea del rasgo en algo que el ojo acaba de leer.
 */
function rasgoCorpus(ficha: Ficha): Rasgo | null {
  const pivote = chip(ficha, "corpus.corpusPropio");
  if (pivote === undefined) return null;

  const builder = new Builder().add(pivote, "corpus.corpusPropio", true);

  const formato = texto(ficha, "corpus.formato");
  if (formato !== undefined)
    builder.join(" en ").add(formato, "corpus.formato");

  const vigencia = texto(ficha, "corpus.vigencia");
  if (vigencia !== undefined)
    builder.join(", ").add(vigencia, "corpus.vigencia");

  const aprobador = texto(ficha, "corpus.aprobador");
  if (aprobador !== undefined) {
    builder.join(", ").add(`aprueba ${aprobador}`, "corpus.aprobador");
  }

  return builder.build("corpus");
}

/** Uso. Pivote: `usoPrincipal`. */
function rasgoUso(ficha: Ficha): Rasgo | null {
  const pivote = chip(ficha, "uso.usoPrincipal");
  if (pivote === undefined) return null;

  const builder = new Builder().add(pivote, "uso.usoPrincipal");

  const perfiles = value(ficha, "uso.perfilesUsuarios");
  if (perfiles !== undefined) {
    const items = Array.isArray(perfiles) ? perfiles : [String(perfiles)];
    builder.join(", ").add(enumerar(items), "uso.perfilesUsuarios");
  }

  return builder.build("uso");
}

/**
 * Datos. Pivote: `phiPrevisto`.
 *
 * «Sin datos de paciente» va en el acento: es el hallazgo que más pesa en la
 * lectura de cumplimiento, y escribirlo como hallazgo —y no como la ausencia de
 * un valor— es la mitad de la razón de que las plantillas existan.
 *
 * El sufijo de garantías dice también el negativo. Un DPO que no está es un dato
 * y no un hueco: callarlo lo convertiría en «no lo hemos preguntado».
 */
function rasgoDatos(ficha: Ficha): Rasgo | null {
  const pivote = chip(ficha, "datos.phiPrevisto");
  if (pivote === undefined) return null;

  const builder = new Builder().add(pivote, "datos.phiPrevisto", true);

  const dpo = value(ficha, "datos.dpo");
  const comite = value(ficha, "datos.comiteEtica");
  const con: string[] = [];
  const sin: string[] = [];

  if (dpo !== undefined) (cierto(ficha, "datos.dpo") ? con : sin).push("DPO");
  if (comite !== undefined) {
    (cierto(ficha, "datos.comiteEtica") ? con : sin).push("comité");
  }

  const garantias = [
    ...(con.length > 0 ? [enumerar(con)] : []),
    ...(sin.length > 0 ? [`sin ${enumerar(sin)}`] : []),
  ];

  if (garantias.length > 0) {
    /*
      El `path` solo se pone cuando el fragmento habla de UN campo. Si dice los
      dos, no hay un campo al que atribuirle la marca de deducido o corregido, y
      marcar el fragmento entero por uno de los dos mentiría sobre el otro. Es el
      límite conocido del diseño: la línea de incertidumbre del panel lo recoge.
      */
    const soloUno =
      con.length + sin.length === 1
        ? dpo !== undefined
          ? "datos.dpo"
          : "datos.comiteEtica"
        : undefined;
    builder.join(" · ").add(garantias.join(", "), soloUno);
  }

  return builder.build("datos");
}

/** Operativa. Pivote: `sponsorEjecutivo`. */
function rasgoOperativa(ficha: Ficha): Rasgo | null {
  const pivote = chip(ficha, "operativa.sponsorEjecutivo");
  if (pivote === undefined) return null;

  const builder = new Builder().add(pivote, "operativa.sponsorEjecutivo");

  const ti = texto(ficha, "operativa.capacidadTI");
  if (ti !== undefined) builder.join(" · ").add(ti, "operativa.capacidadTI");

  return builder.build("operativa");
}

const COMPOSERS: Record<FichaBlock, (ficha: Ficha) => Rasgo | null> = {
  perfil: rasgoPerfil,
  corpus: rasgoCorpus,
  uso: rasgoUso,
  datos: rasgoDatos,
  operativa: rasgoOperativa,
};

/** El rasgo de un bloque, o `null` si su pivote todavía no tiene valor. */
export function rasgoDe(ficha: Ficha, block: FichaBlock): Rasgo | null {
  return COMPOSERS[block](ficha);
}

/** Los rasgos que hay, en el orden de los bloques. Como mucho cinco. */
export function rasgos(ficha: Ficha): Rasgo[] {
  return FICHA_BLOCKS.map((block) => rasgoDe(ficha, block)).filter(
    (rasgo): rasgo is Rasgo => rasgo !== null,
  );
}

/**
 * Si el bloque tiene ya su campo pivote.
 *
 * Es la misma condición que enciende su rasgo, y por eso se pregunta a través del
 * rasgo en vez de repetir la lista de pivotes: dos listas que tienen que coincidir
 * son una divergencia esperando a que alguien añada un campo.
 */
export function tienePivote(ficha: Ficha, block: FichaBlock): boolean {
  return rasgoDe(ficha, block) !== null;
}

/**
 * Las tres cifras: la única parte del panel que se ve desde lejos.
 *
 * La lista es una constante y está pensada para un hospital. Para una sociedad
 * científica o una aseguradora probablemente sean otras tres, así que se cambia
 * aquí y no en el componente — es lo que se deja a revisión de quien venda esto.
 */
export const CIFRAS_PRIORIDAD: ReadonlyArray<
  readonly [path: string, etiqueta: string]
> = [
  ["corpus.volumenDocs", "documentos"],
  ["perfil.centros", "centros"],
  ["perfil.profesionales", "profesionales"],
  ["perfil.especialidades", "especialidades"],
  ["corpus.volumenPaginas", "páginas"],
];

export type Cifra = { path: string; valor: string; etiqueta: string };

/**
 * La cifra de un campo, si es una cifra que se puede pintar en grande.
 *
 * Nunca con decimales, nunca un porcentaje y nunca un cero: un campo con valor 0
 * cuenta como sin valor para esto. Una lista da su longitud —doce especialidades
 * son doce— y cualquier otra forma no da cifra.
 */
function cifraDe(ficha: Ficha, path: string, etiqueta: string): Cifra | null {
  const found = value(ficha, path);
  if (found === undefined) return null;

  const n = Array.isArray(found)
    ? found.length
    : typeof found === "number"
      ? found
      : NaN;
  if (!Number.isInteger(n) || n <= 0) return null;

  return { path, valor: fmt(n), etiqueta };
}

/** Las tres primeras de la lista que tengan valor. Si solo hay una, es una. */
export function cifras(ficha: Ficha, limite = 3): Cifra[] {
  const out: Cifra[] = [];
  for (const [path, etiqueta] of CIFRAS_PRIORIDAD) {
    if (out.length >= limite) break;
    const cifra = cifraDe(ficha, path, etiqueta);
    if (cifra !== null) out.push(cifra);
  }
  return out;
}

/**
 * Suelo del presupuesto de turnos deducido. Sin él, un estado a medio cargar
 * —`turno: 1`, `turnosRestantes: 0`— daría un total de 1 y la primera pregunta
 * de la entrevista se anunciaría como el final.
 */
const PRESUPUESTO_MINIMO = 6;

/**
 * La frase suave del avance.
 *
 * El número llega en cada turno y **nunca se escribe**: una cuenta atrás en una
 * entrevista de idoneidad se lee como cuántas preguntas quedan para suspender.
 * Tampoco «Pregunta 4 de 12» ni «33 % completado», que son la misma idea con otra
 * ropa.
 *
 * ## Por qué es una fracción y no un umbral de `turnosRestantes`
 *
 * La versión anterior comparaba `turnosRestantes` contra 9 / 5 / 2, umbrales
 * calibrados para un presupuesto de doce turnos. El servidor da treinta: una
 * entrevista real empieza en 29 restantes y termina cerca de 6, así que la frase
 * se quedaba clavada en «Acabamos de empezar» durante dos tercios de la
 * conversación —con el arco ya en «4 de 5» al lado— y decía lo contrario de lo
 * que el cliente estaba viendo.
 *
 * El presupuesto no se supone: se deduce de `turno + turnosRestantes`, que es
 * constante venga de un servidor de doce turnos o de treinta.
 *
 * ## Las cuatro frases
 *
 * «Acabamos de empezar», «Vamos por la mitad», «Recta final» y «Última pregunta».
 * La tercera dice el TRAMO y no lo que falta: con «Ya queda poco» las dos últimas
 * decían lo mismo con otras palabras, y un cliente que las ve seguidas no percibe
 * ningún avance entre ellas.
 *
 * ## Y con suelo en los bloques
 *
 * La frase vive pegada al arco, así que no puede contradecirlo: se toma el mayor
 * de los dos avances. `avanceDeBloques` solo crece, de modo que el suelo tampoco
 * hace retroceder la frase. Si el servidor no manda los turnos —campo ausente,
 * ambos a cero—, los bloques la sostienen solos.
 */
export function fraseTurnos(
  turno: number,
  turnosRestantes: number,
  bloquesVisitados = 0,
): string {
  /*
    El tramo final se dice en absoluto y no en fracción: «Última pregunta» es el
    único sitio donde el número es literalmente verdad.

    Exactamente uno, y no «uno o menos»: `turnosRestantes` cae a 0 cuando el
    servidor no manda el campo —`asNumber` devuelve 0—, y con «o menos» un estado
    a medio cargar anunciaba el final en la primera pregunta. Cero turnos de
    verdad no llega aquí: esa entrevista ya está cerrada y el panel dice otra cosa.
  */
  if (turno > 0 && turnosRestantes === 1) return "Última pregunta";

  const total = Math.max(turno + turnosRestantes, PRESUPUESTO_MINIMO);
  const recorrido = Math.max(
    turno / total,
    bloquesVisitados / FICHA_BLOCKS.length,
  );

  if (recorrido < 0.25) return "Acabamos de empezar";
  if (recorrido < 0.7) return "Vamos por la mitad";
  return "Recta final";
}

/**
 * Por dónde va la conversación, en bloques VISITADOS.
 *
 * Un bloque cuenta cuando tiene algún dato, no cuando sus campos están llenos: un
 * cierre real deja cinco o seis campos sin valor, así que contar campos daría un
 * indicador que nunca llega al final.
 *
 * Se cuentan los bloques con dato y NO la posición del último: el prompt dice
 * explícitamente que el agente no recorre los bloques en orden fijo, y con la
 * posición una sola inferencia temprana en el bloque E («encaje operativo») ponía
 * el arco casi al final en el segundo turno — y lo hacía RETROCEDER al volver la
 * conversación al bloque B. Contar visitados solo avanza.
 */
export function avanceDeBloques(ficha: Ficha): {
  cerrados: number;
  actual: FichaBlock | null;
} {
  const visitados = FICHA_BLOCKS.filter((block) =>
    Object.values(ficha[block]).some((found) => found !== undefined),
  );

  if (visitados.length === 0) return { cerrados: 0, actual: null };

  return {
    cerrados: visitados.length - 1,
    actual: visitados[visitados.length - 1]!,
  };
}

/**
 * Cuántos datos no tenemos claros, sobre los veintiocho campos y no sobre los
 * que se pintan.
 *
 * Es a nivel de panel por un límite conocido del diseño: un campo con confianza
 * baja que no aparezca en ningún rasgo no tiene sitio donde marcarse. La línea lo
 * dice una vez, enunciativa y sin botón — el panel señala, y quien quiera
 * arreglarlo lo dice en el chat.
 */
export function contarDudas(ficha: Ficha): number {
  return FICHA_BLOCKS.reduce(
    (total, block) =>
      total +
      Object.values(ficha[block]).filter((found) => found?.confianza === "baja")
        .length,
    0,
  );
}

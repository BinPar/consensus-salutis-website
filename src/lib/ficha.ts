/**
 * Vocabulario de la ficha de idoneidad, del lado de la interfaz.
 *
 * ## Por qué está duplicado y no importado
 *
 * La verdad de la ficha vive en `convex/marketplace/validators.ts` del monorepo
 * (`FICHA_FIELDS`, `FICHA_FIELD_KINDS`). Este repo no depende de aquél —ni
 * puede, por el conflicto de versiones de zod documentado en `eligibility.ts`—,
 * así que la lista se repite aquí con lo que la UI necesita: el orden de los
 * bloques, la forma de cada valor y **una etiqueta en español para la persona
 * que la lee**, que allí no existe porque allí nadie la lee.
 *
 * La divergencia se detecta en dos sitios y ninguno es «alguien se acordará»:
 *
 * - `__tests__/ficha.test.ts` comprueba que son 28 campos, que cada uno tiene
 *   etiqueta y que ningún `path` se repite.
 * - El servidor rechaza un `campo` desconocido con `motivo: "campo-desconocido"`,
 *   así que un campo que sobre aquí falla en el primer clic y no en silencio.
 *
 * ## Lo que NO está aquí, y es deliberado
 *
 * Las pistas del prompt (`FICHA_FIELD_HINTS`) no se copian. Están escritas para
 * el modelo y llevan vocabulario interno —«vía pública», «inferido»— que en un
 * panel del cliente se lee como jerga o, peor, deja ver por dónde puntúa el
 * motor. La etiqueta de esta tabla es lo que ve el cliente; la pista se queda en
 * el prompt.
 *
 * ## Etiqueta y plantilla, que no son lo mismo
 *
 * Cada campo tiene **dos** formas de leerse y las dos están en la misma tabla:
 *
 * - `label` es el nombre del campo. Va en el informe y en los `title`, donde hay
 *   sitio para un par etiqueta→valor.
 * - `chip` es el campo dicho **sin su etiqueta**: `dpo: true` no es «Sí», es
 *   «Con DPO». Es lo que hace que el panel pueda enseñar cinco rasgos en vez de
 *   veintiocho filas de dos columnas.
 *
 * Tres reglas para escribir una plantilla, y la tercera es la que se incumple
 * sola:
 *
 * 1. Se lee sin su etiqueta. Nunca «Sí» ni «No» a secas.
 * 2. Un negativo se escribe como negativo, no como ausencia. «Sin datos de
 *    paciente» es un hallazgo y buena noticia; omitirlo lo convertiría en un
 *    hueco.
 * 3. Máximo 28 caracteres con un valor realista. Lo comprueba `ficha.test.ts`.
 */

import { mayusculaInicial } from "~/lib/opciones";

/** Forma del valor de un campo. Decide qué control se pinta para corregirlo. */
export type FichaKind = "texto" | "numero" | "booleano" | "lista";

/** Cuánto se fía el entrevistador del valor que anotó. */
export type FichaConfianza = "alta" | "media" | "baja";

/**
 * Procedencia del valor. `"usuario"` es una corrección manual en el panel y el
 * agente **no puede sobreescribirla**: es lo que convierte la conversación en un
 * formulario auditable, y la UI lo dice con una marca visible en el campo.
 */
export type FichaOrigen = "agente" | "usuario";

export type FichaValue = string | number | boolean | string[];

export type FichaCell = {
  valor: FichaValue;
  confianza: FichaConfianza;
  origen: FichaOrigen;
};

/** Las cinco claves de bloque, en el orden en el que se pintan. */
export const FICHA_BLOCKS = [
  "perfil",
  "corpus",
  "uso",
  "datos",
  "operativa",
] as const;

export type FichaBlock = (typeof FICHA_BLOCKS)[number];

/** La ficha tal y como llega del servidor: cinco bloques, campos opcionales. */
export type Ficha = Record<FichaBlock, Record<string, FichaCell | undefined>>;

export const EMPTY_FICHA: Ficha = {
  perfil: {},
  corpus: {},
  uso: {},
  datos: {},
  operativa: {},
};

export type FichaFieldSpec = {
  /** `bloque.campo`, que es como lo nombra el endpoint de corrección. */
  path: string;
  block: FichaBlock;
  field: string;
  kind: FichaKind;
  /** El nombre del campo. Va en el informe y en los `title`. */
  label: string;
  /** El campo dicho sin su etiqueta. Ver la cabecera del módulo. */
  chip: (valor: FichaValue) => string;
};

export const FICHA_BLOCK_LABELS: Record<FichaBlock, string> = {
  perfil: "Perfil institucional",
  corpus: "Corpus documental",
  uso: "Caso de uso",
  datos: "Datos y cumplimiento",
  operativa: "Encaje operativo",
};

/**
 * Un número como lo escribe el español: «1.200», «18.000».
 *
 * `useGrouping: true` no es decorativo: `es-ES` agrupa por defecto a partir de
 * cinco dígitos, así que sin él mil doscientos documentos se pintan «1200» y
 * dieciocho mil páginas «18.000» — dos formatos distintos en la misma tarjeta.
 */
export function fmt(value: number): string {
  return new Intl.NumberFormat("es-ES", { useGrouping: true }).format(value);
}

/**
 * «3 centros», «1 centro», «12 especialidades».
 *
 * El plural se forma con la regla del castellano —vocal final añade `s`,
 * consonante añade `es`— y no con una tabla: los cuatro sustantivos que se
 * pluralizan aquí la cumplen, y una excepción futura se ve en el test antes que
 * en la pantalla.
 */
export function plural(count: number, singular: string): string {
  if (count === 1) return `1 ${singular}`;
  const sufijo = /[aeiouáéíóú]$/i.test(singular) ? "s" : "es";
  return `${fmt(count)} ${singular}${sufijo}`;
}

/** «a», «a y b», «a, b y c». Lo que separa una enumeración de una lista CSV. */
export function enumerar(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0]!;
  return `${items.slice(0, -1).join(", ")} y ${items.at(-1)!}`;
}

/** El valor de un campo de texto en cabeza de plantilla. */
function texto(valor: FichaValue): string {
  if (Array.isArray(valor)) return mayusculaInicial(enumerar(valor));
  return mayusculaInicial(String(valor));
}

function numero(valor: FichaValue): number {
  if (typeof valor === "number") return valor;
  if (Array.isArray(valor)) return valor.length;
  const parsed = Number(valor);
  return Number.isFinite(parsed) ? parsed : 0;
}

function lista(valor: FichaValue): string[] {
  return Array.isArray(valor) ? valor : [String(valor)];
}

/**
 * Si un campo booleano vale sí.
 *
 * No es `=== true` porque el valor llega del servidor sin coerción y un booleano
 * que viniera como `"sí"` daría un negativo: y aquí un negativo no es un hueco,
 * es una afirmación — «Sin DPO» sobre un hospital que tiene DPO es peor que no
 * decir nada.
 */
export function esCierto(valor: FichaValue): boolean {
  if (typeof valor === "boolean") return valor;
  if (typeof valor === "string") {
    return ["true", "sí", "si", "1"].includes(valor.trim().toLowerCase());
  }
  return valor === 1;
}

/**
 * Los 28 campos anotables, por bloque y en el orden de lectura del panel.
 *
 * `ambitoPublico` y `comunidad` los infiere el agente sin preguntarlos, así que
 * pueden aparecer rellenos sin que nadie recuerde haberlos dicho: por eso su
 * etiqueta es la más literal de la tabla, y por eso el hilo dice en voz alta que
 * los ha deducido.
 */
const FIELD_TABLE: Record<
  FichaBlock,
  ReadonlyArray<
    readonly [
      field: string,
      kind: FichaKind,
      label: string,
      chip: (valor: FichaValue) => string,
    ]
  >
> = {
  perfil: [
    ["familia", "texto", "Tipo de institución", texto],
    ["pais", "texto", "País", texto],
    ["centros", "numero", "Centros", (v) => plural(numero(v), "centro")],
    [
      "profesionales",
      "numero",
      "Profesionales",
      (v) => `~${fmt(numero(v))} profesionales`,
    ],
    [
      "especialidades",
      "lista",
      "Especialidades",
      (v) => plural(lista(v).length, "especialidad"),
    ],
    [
      "ambitoPublico",
      "booleano",
      "Titularidad pública",
      (v) => (esCierto(v) ? "Titularidad pública" : "Titularidad privada"),
    ],
    ["comunidad", "texto", "Comunidad autónoma", texto],
  ],
  corpus: [
    [
      "corpusPropio",
      "booleano",
      "Documentación propia",
      (v) => (esCierto(v) ? "Documentación propia" : "Sin documentación propia"),
    ],
    ["volumenDocs", "numero", "Documentos", (v) => plural(numero(v), "documento")],
    ["volumenPaginas", "numero", "Páginas", (v) => `~${fmt(numero(v))} páginas`],
    ["formato", "texto", "Formato de los documentos", texto],
    ["vigencia", "texto", "Proceso de revisión", texto],
    ["aprobador", "texto", "Quién aprueba el contenido", (v) => `Aprueba ${String(v)}`],
    ["derechos", "texto", "Derechos sobre el contenido", (v) => `Derechos ${String(v)}`],
    [
      "interesCorpusGeneral",
      "booleano",
      "Interés en corpus general",
      (v) => (esCierto(v) ? "Interés en corpus general" : "Solo corpus propio"),
    ],
  ],
  uso: [
    ["usoPrincipal", "texto", "Uso principal", texto],
    [
      "perfilesUsuarios",
      "lista",
      "Perfiles de usuario",
      (v) => mayusculaInicial(enumerar(lista(v))),
    ],
    [
      "usuariosIdentificados",
      "booleano",
      "Usuarios identificados",
      (v) => (esCierto(v) ? "Usuarios identificados" : "Usuarios anónimos"),
    ],
    [
      "finalidadPromocional",
      "booleano",
      "Finalidad promocional",
      (v) => (esCierto(v) ? "Con finalidad promocional" : "Sin finalidad promocional"),
    ],
  ],
  datos: [
    [
      "phiPrevisto",
      "texto",
      "Datos de paciente previstos",
      // El «no» es el caso bueno y el que más se lee: se escribe como hallazgo
      // —«Sin datos de paciente»— y no como la ausencia de un valor.
      (v) =>
        String(v).trim().toLowerCase() === "no"
          ? "Sin datos de paciente"
          : `Datos de paciente: ${String(v)}`,
    ],
    ["residenciaDato", "texto", "Residencia del dato", (v) => `Dato en ${String(v)}`],
    [
      "dpo",
      "booleano",
      "Delegado de protección de datos",
      (v) => (esCierto(v) ? "Con DPO" : "Sin DPO"),
    ],
    [
      "comiteEtica",
      "booleano",
      "Comité de ética",
      (v) => (esCierto(v) ? "Con comité de ética" : "Sin comité de ética"),
    ],
    ["requisitosAuditoria", "texto", "Requisitos de auditoría", texto],
  ],
  operativa: [
    [
      "sponsorEjecutivo",
      "booleano",
      "Patrocinio ejecutivo",
      (v) => (esCierto(v) ? "Patrocinio de dirección" : "Sin patrocinio de dirección"),
    ],
    ["horizonte", "texto", "Horizonte temporal", (v) => `Horizonte de ${String(v)}`],
    ["idpCorporativo", "texto", "Identidad corporativa", texto],
    ["capacidadTI", "texto", "Capacidad del equipo de TI", texto],
  ],
};

function specsFor(block: FichaBlock): readonly FichaFieldSpec[] {
  return FIELD_TABLE[block].map(([field, kind, label, chip]) => ({
    path: `${block}.${field}`,
    block,
    field,
    kind,
    label,
    chip,
  }));
}

// Las cinco claves se escriben a mano en vez de derivarlas con
// `Object.fromEntries`: el resultado de `fromEntries` es un índice abierto, y
// perder el tipo exacto aquí significa perderlo en todos los consumidores.
export const FICHA_FIELDS: Record<FichaBlock, readonly FichaFieldSpec[]> = {
  perfil: specsFor("perfil"),
  corpus: specsFor("corpus"),
  uso: specsFor("uso"),
  datos: specsFor("datos"),
  operativa: specsFor("operativa"),
};

/**
 * Los campos que el agente **infiere** sin preguntarlos.
 *
 * Es lo más impresionante que hace el sistema y en pantalla pasaba en silencio:
 * el hilo lo dice en voz alta cuando llegan («Anotado también: …»), que es lo que
 * hace que alguien de dirección médica piense «esto entiende de lo mío».
 *
 * La lista es corta porque es la que el prompt infiere de verdad. Ensancharla
 * a «cualquier campo que no era el objeto de la pregunta» necesita que el turno
 * diga a qué campo apuntaba, y eso no viaja hoy en el payload.
 */
export const CAMPOS_INFERIDOS: readonly string[] = [
  "perfil.ambitoPublico",
  "perfil.comunidad",
];

/** Los 28 campos aplanados, para recorrerlos sin anidar dos bucles. */
export const ALL_FICHA_FIELDS: readonly FichaFieldSpec[] = FICHA_BLOCKS.flatMap(
  (block) => FICHA_FIELDS[block],
);

const FIELD_BY_PATH = new Map(
  ALL_FICHA_FIELDS.map((spec) => [spec.path, spec] as const),
);

export function fichaFieldByPath(path: string): FichaFieldSpec | undefined {
  return FIELD_BY_PATH.get(path);
}

/** La celda de un campo, o `undefined` si no se ha valorado todavía. */
export function fichaCell(ficha: Ficha, spec: FichaFieldSpec) {
  return ficha[spec.block]?.[spec.field];
}

/** Cuántos de los 28 campos tienen valor. Alimenta el progreso del panel. */
export function countFilledFields(ficha: Ficha): number {
  return ALL_FICHA_FIELDS.reduce(
    (total, spec) => total + (fichaCell(ficha, spec) === undefined ? 0 : 1),
    0,
  );
}

/**
 * El valor de un campo en texto legible.
 *
 * Un booleano se escribe «Sí»/«No» y no `true`/`false`: el panel es un formulario
 * que alguien de dirección médica lee, no un volcado del documento.
 */
export function formatFichaValue(value: FichaValue): string {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "Sí" : "No";
  if (typeof value === "number") return fmt(value);
  return value;
}

/**
 * Convierte lo que el cliente escribió en el control al tipo que el campo espera.
 *
 * Devuelve `null` cuando el texto no da un valor válido —un número vacío, una
 * lista sin elementos—, para poder no mandar la corrección en vez de mandar un
 * `NaN` que el servidor rechazaría con un mensaje de tipo.
 */
export function parseFichaInput(
  kind: FichaKind,
  raw: string | boolean,
): FichaValue | null {
  if (kind === "booleano") {
    if (typeof raw === "boolean") return raw;
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  }

  const text = typeof raw === "string" ? raw.trim() : String(raw);

  if (kind === "numero") {
    // Se admite el separador de miles español y la coma decimal: quien escribe
    // «1.200» en un campo de documentos está diciendo mil doscientos.
    const normalized = text.replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    return normalized.length > 0 && Number.isFinite(parsed) ? parsed : null;
  }

  if (kind === "lista") {
    const items = text
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    return items.length > 0 ? items : null;
  }

  return text.length > 0 ? text : null;
}

/** El valor de una celda en el formato que espera su control de edición. */
export function toInputValue(kind: FichaKind, value: FichaValue | undefined) {
  if (value === undefined) return kind === "booleano" ? "" : "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}

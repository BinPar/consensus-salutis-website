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
 */

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
  /** Lo que lee el cliente en el panel. */
  label: string;
};

export const FICHA_BLOCK_LABELS: Record<FichaBlock, string> = {
  perfil: "Perfil institucional",
  corpus: "Corpus documental",
  uso: "Caso de uso",
  datos: "Datos y cumplimiento",
  operativa: "Encaje operativo",
};

/**
 * Los 28 campos anotables, por bloque y en el orden de lectura del panel.
 *
 * `ambitoPublico` y `comunidad` los infiere el agente sin preguntarlos, así que
 * pueden aparecer rellenos sin que nadie recuerde haberlos dicho: por eso su
 * etiqueta es la más literal de la tabla, para que corregirlos sea evidente.
 */
const FIELD_TABLE: Record<
  FichaBlock,
  ReadonlyArray<readonly [field: string, kind: FichaKind, label: string]>
> = {
  perfil: [
    ["familia", "texto", "Tipo de institución"],
    ["pais", "texto", "País"],
    ["centros", "numero", "Centros"],
    ["profesionales", "numero", "Profesionales"],
    ["especialidades", "lista", "Especialidades"],
    ["ambitoPublico", "booleano", "Titularidad pública"],
    ["comunidad", "texto", "Comunidad autónoma"],
  ],
  corpus: [
    ["corpusPropio", "booleano", "Documentación propia"],
    ["volumenDocs", "numero", "Documentos"],
    ["volumenPaginas", "numero", "Páginas"],
    ["formato", "texto", "Formato de los documentos"],
    ["vigencia", "texto", "Proceso de revisión"],
    ["aprobador", "texto", "Quién aprueba el contenido"],
    ["derechos", "texto", "Derechos sobre el contenido"],
    ["interesCorpusGeneral", "booleano", "Interés en corpus general"],
  ],
  uso: [
    ["usoPrincipal", "texto", "Uso principal"],
    ["perfilesUsuarios", "lista", "Perfiles de usuario"],
    ["usuariosIdentificados", "booleano", "Usuarios identificados"],
    ["finalidadPromocional", "booleano", "Finalidad promocional"],
  ],
  datos: [
    ["phiPrevisto", "texto", "Datos de paciente previstos"],
    ["residenciaDato", "texto", "Residencia del dato"],
    ["dpo", "booleano", "Delegado de protección de datos"],
    ["comiteEtica", "booleano", "Comité de ética"],
    ["requisitosAuditoria", "texto", "Requisitos de auditoría"],
  ],
  operativa: [
    ["sponsorEjecutivo", "booleano", "Patrocinio ejecutivo"],
    ["horizonte", "texto", "Horizonte temporal"],
    ["idpCorporativo", "texto", "Identidad corporativa"],
    ["capacidadTI", "texto", "Capacidad del equipo de TI"],
  ],
};

function specsFor(block: FichaBlock): readonly FichaFieldSpec[] {
  return FIELD_TABLE[block].map(([field, kind, label]) => ({
    path: `${block}.${field}`,
    block,
    field,
    kind,
    label,
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
  if (typeof value === "number") return new Intl.NumberFormat("es-ES").format(value);
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

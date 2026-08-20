/**
 * Cliente de `POST /eligibility-stream` del deployment de Convex (issue #5).
 *
 * ## Qué hace este módulo y qué no
 *
 * Habla con el endpoint y traduce sus líneas JSON a eventos tipados. **No tiene
 * lógica de entrevista**: ni prompt, ni reglas de elegibilidad, ni claves de
 * ningún modelo. Todo eso vive en Convex (`BinPar/consensus-salutis#85`), y esa
 * separación es el motivo de que esta landing pueda desplegarse sin secretos de
 * LLM.
 *
 * ## El filtro del informe no es cosmético
 *
 * `informe` llega con `nivel` (el literal `"listos" | "casi" | "explorar"`),
 * `criteriaVersion` y `costUsd`. Los tres son internos: la versión de criterios y
 * el coste no son asunto del cliente, y el literal del nivel es la puerta por la
 * que se colaría una insignia de color en la UI. Se **descartan aquí**, en la
 * frontera, y no en el componente: así ningún componente puede pintarlos aunque
 * quiera, y el criterio de aceptación «ni banderas, ni nivel, ni reglas visibles
 * — revisado también en el HTML» se sostiene por construcción y no por revisión.
 *
 * Lo que sí pasa es el informe redactado, que es lo que la institución se lleva.
 */

import { EMPTY_FICHA, type Ficha, type FichaValue } from "~/lib/ficha";

/** Un turno del hilo, tal y como lo pinta la UI. */
export type InterviewMessage = {
  role: "user" | "assistant";
  content: string;
  /** Opciones sugeridas del agente. Vacío = solo campo libre. */
  opciones: string[];
  /**
   * La pregunta admite varias respuestas a la vez.
   *
   * Lo decide el agente por pregunta —«¿en qué formato están?» admite varias,
   * «¿tenéis DPO?» no— y cambia el control: con `multiple` las opciones son
   * casillas que se marcan y se envían con un botón, en vez de filas que envían
   * al pulsarlas.
   */
  multiple?: boolean;
};

/** Lo que devuelve un turno del agente. */
export type InterviewTurn = {
  mensaje: string;
  opciones: string[];
  /** Ver `InterviewMessage.multiple`. Ausente en el payload es `false`. */
  multiple: boolean;
  ficha: Ficha;
  /** El turno cerró la entrevista: viene el informe detrás, en el mismo stream. */
  cerrada: boolean;
  /** Se retiraron identificadores de paciente del mensaje del cliente. */
  datosRetirados: boolean;
  turno: number;
  turnosRestantes: number;
};

/** El informe, ya filtrado de todo lo interno. Ver la cabecera del módulo. */
export type InterviewReport = {
  /** Nombre del nivel en la lengua del informe («Casi listos»). */
  nivelNombre: string;
  /** La frase de diagnóstico, escrita por el motor. */
  diagnostico: string;
  reportMarkdown: string;
  /** Slug largo y reenviable. La página permanente la monta la issue #6. */
  reportSlug: string;
};

/** Estado para retomar la entrevista tras una recarga o un abandono. */
export type InterviewState = {
  status: "draft" | "completed";
  institucion: string;
  ficha: Ficha;
  turno: number;
  turnosRestantes: number;
  mensajes: InterviewMessage[];
  /**
   * La entrevista ya cerró. Con `status: "draft"` significa que el informe se
   * está preparando AHORA MISMO en el servidor.
   *
   * Es lo que hace recuperable una recarga durante el cálculo: sin este dato, el
   * cliente solo veía una entrevista sin terminar, pintaba el compositor y
   * dejaba al cliente escribiéndole a un agente que ya se había despedido —
   * mientras su informe se terminaba de escribir sin nadie mirando.
   */
  cerrada: boolean;
  /** Fase del cierre en curso, para retomar la pantalla de espera donde iba. */
  reportFase?: CalculandoFase;
  /** Caracteres del borrador ya escritos. Ver `CalculandoProgreso`. */
  reportChars?: number;
  reportMarkdown?: string;
  reportSlug?: string;
};

/**
 * Por qué falló una llamada. La UI reacciona distinto a cada uno y por eso son
 * cuatro y no un `Error` genérico:
 *
 * - `sesion`: la cookie caducó o no vale. Hay que volver a identificarse, y el
 *   mensaje tiene que decirlo — no un fallo silencioso (§5 de la issue).
 * - `red`: se cortó a mitad. Lo guardado sigue guardado; se reintenta.
 * - `completada`: la evaluación ya estaba cerrada. No es un error del cliente.
 * - `servidor`: el resto.
 */
export type InterviewErrorKind = "sesion" | "red" | "completada" | "servidor";

export class InterviewError extends Error {
  readonly kind: InterviewErrorKind;

  constructor(kind: InterviewErrorKind, message: string) {
    super(message);
    this.name = "InterviewError";
    this.kind = kind;
  }
}

const MENSAJE_RED =
  "Se ha perdido la conexión. Lo que ya habías respondido sigue guardado: puedes reintentar sin empezar de cero.";

const MENSAJE_SESION =
  "Tu sesión ha caducado. Vuelve a identificarte para retomar la evaluación donde estaba.";

/** Tope del turno, el mismo que impone el endpoint. Se avisa antes de enviar. */
export const MAX_MENSAJE_CHARS = 8_000;

type Fetcher = typeof fetch;

export type InterviewClientOptions = {
  /** Origen del deployment de Convex (`https://….convex.site`). */
  baseUrl: string;
  /** La sesión firmada, que la Etapa 0 dejó en la cookie `HttpOnly`. */
  token: string;
  fetcher?: Fetcher;
};

/**
 * Fase de la preparación del informe, tal y como la emite el servidor en cada
 * evento `calculando`. Son las fronteras reales del cierre: el veredicto del
 * motor, la redacción (la parte larga) y la revisión, que solo aparece si la
 * puerta de contrato obligó a reintentar. Un servidor viejo que no mande `fase`
 * cae a `veredicto`, que pinta lo mismo que el aviso único de antes.
 */
export type CalculandoFase = "veredicto" | "redaccion" | "revision";

/**
 * El avance del cierre: la fase y cuánto lleva escrito el borrador.
 *
 * Los caracteres son avance REAL —los cuenta el redactor mientras genera—, no un
 * temporizador disfrazado. Importan porque la redacción es la fase larga: con
 * solo la fase, la pantalla se queda quieta cuarenta segundos y se lee como
 * colgada.
 */
export type CalculandoProgreso = {
  fase: CalculandoFase;
  caracteres: number;
};

type StreamHandlers = {
  onTurn?: (turn: InterviewTurn) => void;
  /**
   * El mensaje del agente TAL Y COMO SE ESCRIBE.
   *
   * Llega entero en cada evento, nunca por incrementos, y puede llegar más corto
   * que la vez anterior: cuando un paso del agente acaba anotando la ficha, lo
   * que hubiera escrito era narración y se retira. Quien lo pinta reemplaza, no
   * concatena.
   */
  onParcial?: (texto: string) => void;
  /** El cierre está en marcha: la UI muestra la fase y el avance. */
  onCalculando?: (progreso: CalculandoProgreso) => void;
  onReport?: (report: InterviewReport) => void;
  signal?: AbortSignal;
};

function url(options: InterviewClientOptions) {
  return `${options.baseUrl.replace(/\/$/, "")}/eligibility-stream`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

/**
 * La ficha del servidor, saneada.
 *
 * Se copian solo los cinco bloques conocidos y solo las celdas con la forma
 * esperada. Un bloque de más en la respuesta no debe llegar al panel: el panel
 * recorre el catálogo de `ficha.ts` y una clave desconocida no se pintaría, pero
 * sí se guardaría en el estado y volvería a salir en el siguiente `PATCH`.
 */
export function parseFicha(raw: unknown): Ficha {
  if (!isRecord(raw)) return EMPTY_FICHA;

  const ficha: Ficha = {
    perfil: {},
    corpus: {},
    uso: {},
    datos: {},
    operativa: {},
  };

  for (const block of Object.keys(ficha) as Array<keyof Ficha>) {
    const cells = raw[block];
    if (!isRecord(cells)) continue;

    for (const [field, cell] of Object.entries(cells)) {
      if (!isRecord(cell)) continue;
      const { valor, confianza, origen } = cell;
      const validValue =
        typeof valor === "string" ||
        typeof valor === "number" ||
        typeof valor === "boolean" ||
        (Array.isArray(valor) &&
          valor.every((item) => typeof item === "string"));
      if (!validValue) continue;

      ficha[block][field] = {
        valor,
        confianza:
          confianza === "alta" || confianza === "media" || confianza === "baja"
            ? confianza
            : "media",
        origen: origen === "usuario" ? "usuario" : "agente",
      };
    }
  }

  return ficha;
}

function parseTurn(raw: Record<string, unknown>): InterviewTurn {
  return {
    mensaje: asString(raw.mensaje),
    opciones: asStringArray(raw.opciones),
    // Comparación estricta: un servidor que no conozca el campo no puede
    // convertir la pregunta en múltiple por accidente, y el control de una sola
    // respuesta es el que no se equivoca nunca.
    multiple: raw.multiple === true,
    ficha: parseFicha(raw.ficha),
    cerrada: raw.cerrada === true,
    datosRetirados: raw.datosRetirados === true,
    turno: asNumber(raw.turno),
    turnosRestantes: asNumber(raw.turnosRestantes),
  };
}

/** La fase del `calculando`, con `veredicto` como suelo para servidores viejos. */
export function parseFase(raw: unknown): CalculandoFase {
  return raw === "redaccion" || raw === "revision" ? raw : "veredicto";
}

/** El informe SIN `nivel`, `criteriaVersion` ni `costUsd`. Ver la cabecera. */
function parseReport(raw: Record<string, unknown>): InterviewReport {
  return {
    nivelNombre: asString(raw.nivelNombre),
    diagnostico: asString(raw.diagnostico),
    reportMarkdown: asString(raw.reportMarkdown),
    reportSlug: asString(raw.reportSlug),
  };
}

/**
 * Traduce el error de una respuesta a su categoría.
 *
 * El 401 es el que más importa: el endpoint lo devuelve —y no un 403— justo para
 * que el cliente pueda distinguir «vuelve a identificarte» de «no tienes acceso».
 */
async function failureFor(response: Response): Promise<InterviewError> {
  if (response.status === 401) {
    return new InterviewError("sesion", MENSAJE_SESION);
  }

  let message = "No hemos podido continuar la entrevista. Inténtalo de nuevo.";
  try {
    const body = (await response.json()) as unknown;
    if (
      isRecord(body) &&
      typeof body.error === "string" &&
      body.error.length > 0
    ) {
      message = body.error;
    }
  } catch {
    // Un cuerpo que no es JSON no cambia el diagnóstico: sigue siendo un fallo
    // del servidor y el mensaje por defecto ya lo dice.
  }

  if (/completad/i.test(message)) {
    return new InterviewError("completada", message);
  }

  return new InterviewError("servidor", message);
}

async function post(
  options: InterviewClientOptions,
  body: unknown,
  signal?: AbortSignal,
): Promise<Response> {
  const doFetch = options.fetcher ?? fetch;

  let response: Response;
  try {
    response = await doFetch(url(options), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.token}`,
      },
      body: JSON.stringify(body),
      ...(signal !== undefined && { signal }),
    });
  } catch (error) {
    // Un `abort` no es un fallo de red: lo provoca la propia UI al desmontar o
    // al cancelar, y avisar de «se ha perdido la conexión» sería mentir.
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    throw new InterviewError("red", MENSAJE_RED);
  }

  if (!response.ok) throw await failureFor(response);

  return response;
}

/**
 * Recorre un cuerpo `application/x-ndjson` y entrega cada línea ya parseada.
 *
 * Se separa del consumo para poder probarla sin red: es la pieza con más formas
 * de fallar del módulo —líneas partidas entre dos `chunk`, la última línea sin
 * `\n`, basura entre líneas válidas— y todas se prueban en `interview.test.ts`.
 */
export async function* readNdjson(
  body: ReadableStream<Uint8Array>,
): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newline = buffer.indexOf("\n");
      while (newline !== -1) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (line.length > 0) {
          const parsed = safeParseLine(line);
          if (parsed !== null) yield parsed;
        }
        newline = buffer.indexOf("\n");
      }
    }

    // La última línea puede llegar sin salto: el stream la cierra el servidor.
    const tail = (buffer + decoder.decode()).trim();
    if (tail.length > 0) {
      const parsed = safeParseLine(tail);
      if (parsed !== null) yield parsed;
    }
  } finally {
    reader.releaseLock();
  }
}

function safeParseLine(line: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(line) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Consume un stream de la entrevista y despacha sus eventos.
 *
 * Un `error` DENTRO del stream no es lo mismo que un 500: cuando el turno ya ha
 * empezado a escribir, la respuesta ya es un 200 y el fallo viaja como una línea
 * más. Se convierte aquí en la excepción que el llamante espera.
 */
async function consume(
  response: Response,
  handlers: StreamHandlers,
): Promise<void> {
  if (response.body === null) {
    throw new InterviewError("red", MENSAJE_RED);
  }

  let streamError: InterviewError | null = null;

  try {
    for await (const line of readNdjson(response.body)) {
      switch (line.event) {
        case "turno":
          handlers.onTurn?.(parseTurn(line));
          break;
        case "parcial":
          handlers.onParcial?.(asString(line.texto));
          break;
        case "calculando":
          handlers.onCalculando?.({
            fase: parseFase(line.fase),
            caracteres: asNumber(line.caracteres),
          });
          break;
        case "informe":
          handlers.onReport?.(parseReport(line));
          break;
        case "error":
          streamError = new InterviewError(
            "servidor",
            asString(
              line.error,
              "No hemos podido completar la evaluación. Inténtalo de nuevo.",
            ),
          );
          break;
        default:
          // `fin` y cualquier evento que se añada más adelante: ignorarlos es lo
          // correcto, un cliente viejo no debe romperse con un servidor nuevo.
          break;
      }
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError")
      throw error;
    if (error instanceof InterviewError) throw error;
    // El cuerpo se cortó a mitad. Lo emitido antes ya lo procesó el llamante.
    throw new InterviewError("red", MENSAJE_RED);
  }

  if (streamError !== null) throw streamError;
}

/** El estado actual, para retomar la entrevista. No consume ningún turno. */
export async function fetchInterviewState(
  options: InterviewClientOptions,
  signal?: AbortSignal,
): Promise<InterviewState> {
  const response = await post(options, { estado: true }, signal);
  const raw = (await response.json()) as unknown;
  if (!isRecord(raw)) {
    throw new InterviewError("servidor", "Respuesta inesperada del servidor.");
  }

  const stage0 = isRecord(raw.stage0) ? raw.stage0 : {};
  const mensajes = Array.isArray(raw.mensajes) ? raw.mensajes : [];

  return {
    status: raw.status === "completed" ? "completed" : "draft",
    institucion: asString(stage0.institucion),
    ficha: parseFicha(raw.ficha),
    turno: asNumber(raw.turno),
    turnosRestantes: asNumber(raw.turnosRestantes),
    // Comparación estricta: un servidor que no conozca el campo deja la
    // entrevista abierta, que es el estado del que siempre se puede salir.
    cerrada: raw.cerrada === true,
    ...(raw.reportFase !== undefined && {
      reportFase: parseFase(raw.reportFase),
    }),
    ...(typeof raw.reportChars === "number" && {
      reportChars: raw.reportChars,
    }),
    mensajes: mensajes
      .filter(isRecord)
      .filter((row) => row.role === "user" || row.role === "assistant")
      .map((row) => ({
        role: row.role === "user" ? ("user" as const) : ("assistant" as const),
        content: asString(row.content),
        opciones: asStringArray(row.opciones),
        // Retomar la entrevista tiene que devolver el mismo control que había:
        // sin esto, una pregunta de varias respuestas se reabría como de una.
        multiple: row.multiple === true,
      })),
    ...(typeof raw.reportMarkdown === "string" && {
      reportMarkdown: raw.reportMarkdown,
    }),
    ...(typeof raw.reportSlug === "string" && { reportSlug: raw.reportSlug }),
  };
}

/**
 * Apertura: el agente habla primero.
 *
 * Idempotente en el servidor — un reintento devuelve el mismo turno en vez de
 * generar otro—, así que la UI puede reintentarla sin comprobar nada antes.
 */
export async function openInterview(
  options: InterviewClientOptions,
  handlers: StreamHandlers = {},
): Promise<void> {
  const response = await post(options, { abrir: true }, handlers.signal);
  await consume(response, handlers);
}

/** Un turno del cliente. Si cierra la entrevista, el informe viene detrás. */
export async function sendInterviewMessage(
  options: InterviewClientOptions,
  mensaje: string,
  handlers: StreamHandlers = {},
): Promise<void> {
  const response = await post(options, { mensaje }, handlers.signal);
  await consume(response, handlers);
}

/**
 * Reintento del cierre: la entrevista ya cerró pero el informe falló.
 *
 * Sin esto no habría forma de recuperar esa evaluación desde el cliente — el
 * agente ya se ha despedido, así que mandar otro mensaje no vuelve a cerrarla.
 */
export async function retryInterviewClose(
  options: InterviewClientOptions,
  handlers: StreamHandlers = {},
): Promise<void> {
  const response = await post(options, { finalizar: true }, handlers.signal);
  await consume(response, handlers);
}

export type CorrectionResult =
  | { ok: true; ficha: Ficha }
  | { ok: false; message: string };

/**
 * Corrección manual de un campo desde el panel.
 *
 * El servidor la marca con `origen: "usuario"` y a partir de ahí el agente no
 * puede sobreescribirla. Esta función no lo decide ni lo comprueba: lo hace el
 * `updateField` de Convex, que es el único sitio donde importa que se cumpla.
 */
export async function correctFichaField(
  options: InterviewClientOptions,
  campo: string,
  valor: FichaValue,
  signal?: AbortSignal,
): Promise<CorrectionResult> {
  const response = await post(
    options,
    { correccion: { campo, valor } },
    signal,
  );
  const raw = (await response.json()) as unknown;

  if (!isRecord(raw)) {
    return { ok: false, message: "Respuesta inesperada del servidor." };
  }

  const result = isRecord(raw.result) ? raw.result : {};
  if (result.ok === false) {
    return {
      ok: false,
      message: asString(
        result.mensaje,
        "No se ha podido guardar la corrección.",
      ),
    };
  }

  return { ok: true, ficha: parseFicha(raw.ficha) };
}

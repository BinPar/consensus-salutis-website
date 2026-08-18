/**
 * El cliente de `/eligibility-stream`.
 *
 * Se prueba con un `fetch` de mentira y streams construidos a mano, no contra el
 * deployment: lo que aquí importa no es que Convex funcione —eso lo prueban sus
 * tests— sino que **esta** capa aguante las formas en las que un stream llega
 * mal. Un cuerpo NDJSON partido por la mitad de una línea no se puede provocar a
 * voluntad contra un servidor real, y es justo el caso que rompe un parser
 * ingenuo en producción y nunca en desarrollo.
 */

import { describe, expect, it, vi } from "vitest";

import {
  correctFichaField,
  fetchInterviewState,
  InterviewError,
  openInterview,
  parseFicha,
  readNdjson,
  sendInterviewMessage,
  type InterviewClientOptions,
  type InterviewReport,
  type InterviewTurn,
} from "~/lib/interview";

const BASE: Omit<InterviewClientOptions, "fetcher"> = {
  baseUrl: "https://ejemplo.convex.site",
  token: "token.firmado",
};

/** Un `ReadableStream` que emite los trozos dados, tal cual y en orden. */
function streamOf(...chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}

function ndjsonResponse(...chunks: string[]) {
  return new Response(streamOf(...chunks), {
    status: 200,
    headers: { "Content-Type": "application/x-ndjson" },
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clientWith(response: Response | (() => Response)) {
  // La firma va explícita para que `fetcher.mock.calls` conserve los dos
  // argumentos: con `vi.fn(async () => …)` el tipo de las llamadas es `[]` y
  // leer el cuerpo de la petición deja de comprobarse.
  const fetcher = vi.fn(async (_input: string, _init: RequestInit) =>
    typeof response === "function" ? response() : response,
  );
  return { options: { ...BASE, fetcher } as InterviewClientOptions, fetcher };
}

/** El cuerpo JSON de una petición que hizo el cliente. */
function bodyOf(init: RequestInit): Record<string, unknown> {
  return JSON.parse(init.body as string) as Record<string, unknown>;
}

async function collect(stream: ReadableStream<Uint8Array>) {
  const lines: Record<string, unknown>[] = [];
  for await (const line of readNdjson(stream)) lines.push(line);
  return lines;
}

describe("el lector de NDJSON", () => {
  it("lee una línea por objeto", async () => {
    const lines = await collect(streamOf('{"event":"a"}\n{"event":"b"}\n'));
    expect(lines.map((line) => line.event)).toEqual(["a", "b"]);
  });

  // El caso que no se puede provocar contra un servidor real y sí ocurre en red.
  it("recompone una línea partida entre dos trozos", async () => {
    const lines = await collect(streamOf('{"event":"tur', 'no","turno":3}\n'));
    expect(lines).toEqual([{ event: "turno", turno: 3 }]);
  });

  it("entrega la última línea aunque venga sin salto final", async () => {
    const lines = await collect(streamOf('{"event":"fin"}'));
    expect(lines).toEqual([{ event: "fin" }]);
  });

  it("se salta líneas vacías y basura sin abortar el resto", async () => {
    const lines = await collect(
      streamOf('\n{"event":"a"}\nesto no es json\n\n{"event":"b"}\n'),
    );
    expect(lines.map((line) => line.event)).toEqual(["a", "b"]);
  });

  it("descarta una línea que sea JSON pero no un objeto", async () => {
    const lines = await collect(streamOf('12\n"texto"\n{"event":"a"}\n'));
    expect(lines).toEqual([{ event: "a" }]);
  });

  it("no se atraganta con acentos partidos entre dos trozos", async () => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode('{"mensaje":"día"}\n');
    const lines = await collect(
      new ReadableStream({
        start(controller) {
          // Corta a mitad del carácter multibyte de la í.
          controller.enqueue(bytes.slice(0, 14));
          controller.enqueue(bytes.slice(14));
          controller.close();
        },
      }),
    );
    expect(lines).toEqual([{ mensaje: "día" }]);
  });
});

describe("un turno", () => {
  it("entrega mensaje, opciones y ficha", async () => {
    const { options } = clientWith(
      ndjsonResponse(
        JSON.stringify({
          event: "turno",
          mensaje: "¿Tenéis corpus propio?",
          opciones: ["sí", "no"],
          ficha: {
            perfil: {
              pais: { valor: "España", confianza: "alta", origen: "agente" },
            },
          },
          cerrada: false,
          datosRetirados: false,
          turno: 1,
          turnosRestantes: 29,
        }) + "\n{\"event\":\"fin\"}\n",
      ),
    );

    const turns: InterviewTurn[] = [];
    await sendInterviewMessage(options, "hola", {
      onTurn: (turn) => turns.push(turn),
    });

    expect(turns).toHaveLength(1);
    expect(turns[0]!.mensaje).toBe("¿Tenéis corpus propio?");
    expect(turns[0]!.opciones).toEqual(["sí", "no"]);
    expect(turns[0]!.ficha.perfil.pais?.valor).toBe("España");
    // Sin `multiple` en el payload, la pregunta es de una sola respuesta.
    expect(turns[0]!.multiple).toBe(false);
  });

  /*
    El control de varias respuestas necesita dos gestos —marcar y confirmar— y el
    de una solo uno. Convertir una pregunta simple en múltiple por una coerción
    laxa dejaría al cliente marcando casillas sin saber que hay que continuar, así
    que la comparación es estricta: solo el booleano `true` lo activa.
  */
  it("`multiple` solo se activa con el booleano, no con cualquier valor", async () => {
    async function multipleDe(valor: unknown) {
      const { options } = clientWith(
        ndjsonResponse(
          JSON.stringify({
            event: "turno",
            mensaje: "¿En qué formato están?",
            opciones: ["PDF nativo", "Word"],
            multiple: valor,
          }) + "\n",
        ),
      );

      const turns: InterviewTurn[] = [];
      await sendInterviewMessage(options, "hola", {
        onTurn: (turn) => turns.push(turn),
      });
      return turns[0]!.multiple;
    }

    expect(await multipleDe(true)).toBe(true);
    expect(await multipleDe(false)).toBe(false);
    expect(await multipleDe("true")).toBe(false);
    expect(await multipleDe(1)).toBe(false);
    expect(await multipleDe(undefined)).toBe(false);
  });

  it("la apertura no manda mensaje, manda `abrir`", async () => {
    const { options, fetcher } = clientWith(
      ndjsonResponse('{"event":"turno","mensaje":"Hola"}\n'),
    );

    await openInterview(options);

    expect(bodyOf(fetcher.mock.calls[0]![1])).toEqual({ abrir: true });
  });

  it("manda la sesión en Authorization y no como cookie ni parámetro", async () => {
    const { options, fetcher } = clientWith(
      ndjsonResponse('{"event":"fin"}\n'),
    );

    await openInterview(options);

    const [url, init] = fetcher.mock.calls[0]!;
    expect(url).toBe("https://ejemplo.convex.site/eligibility-stream");
    expect(url).not.toContain("token");
    expect((init.headers as Record<string, string>).Authorization).toBe(
      "Bearer token.firmado",
    );
  });
});

/*
  El filtro del informe es un criterio de aceptación, no una preferencia: «ni
  banderas, ni nivel, ni reglas visibles en ningún momento». Descartarlo aquí, en
  la frontera, es lo que hace que ningún componente pueda pintarlo.
*/
describe("el informe llega sin lo interno", () => {
  it("descarta nivel, versión de criterios y coste", async () => {
    const { options } = clientWith(
      ndjsonResponse(
        JSON.stringify({
          event: "informe",
          nivel: "listos",
          nivelNombre: "Listos para empezar",
          diagnostico: "El perfil encaja.",
          reportMarkdown: "# Informe",
          reportSlug: "abc123",
          criteriaVersion: 4,
          costUsd: 0.42,
        }) + "\n",
      ),
    );

    const reports: InterviewReport[] = [];
    await sendInterviewMessage(options, "listo", {
      onReport: (report) => reports.push(report),
    });

    expect(reports).toHaveLength(1);
    expect(Object.keys(reports[0]!).sort()).toEqual([
      "diagnostico",
      "nivelNombre",
      "reportMarkdown",
      "reportSlug",
    ]);
    expect(JSON.stringify(reports[0])).not.toContain("listos");
    expect(JSON.stringify(reports[0])).not.toContain("0.42");
  });
});

describe("los fallos se distinguen entre sí", () => {
  it("un 401 es «sesión caducada» y no un error genérico", async () => {
    const { options } = clientWith(() =>
      jsonResponse({ error: "La sesión ha caducado.", reason: "expirada" }, 401),
    );

    await expect(fetchInterviewState(options)).rejects.toMatchObject({
      kind: "sesion",
    });
  });

  it("una evaluación ya cerrada no se ofrece para reintentar", async () => {
    const { options } = clientWith(() =>
      jsonResponse({ error: "La evaluación ya está completada" }, 500),
    );

    await expect(fetchInterviewState(options)).rejects.toMatchObject({
      kind: "completada",
    });
  });

  it("un fetch que revienta es un fallo de red, no del servidor", async () => {
    const fetcher: typeof fetch = () => {
      throw new TypeError("Failed to fetch");
    };

    await expect(
      fetchInterviewState({ ...BASE, fetcher }),
    ).rejects.toMatchObject({ kind: "red" });
  });

  // Cuando el turno ya ha empezado a escribir, la respuesta ya es un 200: el
  // fallo viaja como una línea más y tiene que salir igualmente como excepción.
  it("un evento `error` dentro del stream sale como excepción", async () => {
    const { options } = clientWith(
      ndjsonResponse(
        '{"event":"turno","mensaje":"Anotado"}\n{"event":"error","error":"El cálculo falló."}\n',
      ),
    );

    const turns: InterviewTurn[] = [];
    const failure = await sendInterviewMessage(options, "x", {
      onTurn: (turn) => turns.push(turn),
    }).catch((error: unknown) => error);

    // El turno que sí llegó se procesó antes de fallar: no se pierde.
    expect(turns).toHaveLength(1);
    expect(failure).toBeInstanceOf(InterviewError);
    expect((failure as InterviewError).message).toBe("El cálculo falló.");
  });
});

describe("el estado para retomar", () => {
  it("se queda solo con los turnos de persona y agente", async () => {
    const { options } = clientWith(() =>
      jsonResponse({
        status: "draft",
        stage0: { institucion: "Hospital de Ejemplo" },
        ficha: {},
        turno: 2,
        turnosRestantes: 28,
        mensajes: [
          { role: "assistant", content: "Hola", opciones: ["sí"] },
          { role: "user", content: "sí" },
          { role: "system", content: "nota interna del runtime" },
        ],
      }),
    );

    const state = await fetchInterviewState(options);

    expect(state.institucion).toBe("Hospital de Ejemplo");
    expect(state.mensajes.map((message) => message.role)).toEqual([
      "assistant",
      "user",
    ]);
    expect(JSON.stringify(state)).not.toContain("nota interna");
  });

  /*
    Retomar tiene que devolver el mismo control que había. Sin esto, recargar en una
    pregunta de varias respuestas la reabría como de una: las casillas se convertían
    en filas que envían al primer clic, y lo que el cliente llevaba marcado se
    perdía sin aviso.
  */
  it("conserva si la pregunta admitía varias respuestas", async () => {
    const { options } = clientWith(() =>
      jsonResponse({
        status: "draft",
        stage0: { institucion: "Hospital de Ejemplo" },
        ficha: {},
        turno: 3,
        turnosRestantes: 9,
        mensajes: [
          {
            role: "assistant",
            content: "¿En qué formato están?",
            opciones: ["PDF nativo", "Word"],
            multiple: true,
          },
          { role: "assistant", content: "¿Tenéis DPO?", opciones: ["sí", "no"] },
        ],
      }),
    );

    const state = await fetchInterviewState(options);

    expect(state.mensajes.map((message) => message.multiple)).toEqual([true, false]);
  });
});

describe("una corrección de la ficha", () => {
  it("manda campo y valor, y devuelve la ficha actualizada", async () => {
    const { options, fetcher } = clientWith(() =>
      jsonResponse({
        result: { ok: true, campo: "corpus.volumenDocs", valorActual: 400 },
        ficha: {
          corpus: {
            volumenDocs: { valor: 400, confianza: "alta", origen: "usuario" },
          },
        },
      }),
    );

    const result = await correctFichaField(options, "corpus.volumenDocs", 400);

    expect(bodyOf(fetcher.mock.calls[0]![1])).toEqual({
      correccion: { campo: "corpus.volumenDocs", valor: 400 },
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.ficha.corpus.volumenDocs?.origen).toBe("usuario");
  });

  it("un rechazo del servidor vuelve con su motivo y no como excepción", async () => {
    const { options } = clientWith(() =>
      jsonResponse({
        result: {
          ok: false,
          campo: "corpus.volumenDocs",
          motivo: "tipo-invalido",
          mensaje: "`corpus.volumenDocs` es de tipo numero.",
        },
      }),
    );

    const result = await correctFichaField(options, "corpus.volumenDocs", "x");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("tipo numero");
  });
});

describe("la ficha que llega se sanea", () => {
  it("descarta bloques y celdas con forma inesperada", () => {
    const ficha = parseFicha({
      perfil: {
        pais: { valor: "España", confianza: "alta", origen: "agente" },
        roto: { valor: { anidado: true }, confianza: "alta", origen: "agente" },
      },
      inventado: { campo: { valor: "x", confianza: "alta", origen: "agente" } },
    });

    expect(Object.keys(ficha).sort()).toEqual([
      "corpus",
      "datos",
      "operativa",
      "perfil",
      "uso",
    ]);
    expect(ficha.perfil.pais?.valor).toBe("España");
    expect(ficha.perfil.roto).toBeUndefined();
  });

  it("una procedencia desconocida no se convierte en «usuario»", () => {
    const ficha = parseFicha({
      perfil: { pais: { valor: "España", confianza: "alta", origen: "otro" } },
    });

    // Si un valor inesperado cayera en «usuario», la ficha diría que el cliente
    // corrigió algo que no tocó, y el agente dejaría de poder escribirlo.
    expect(ficha.perfil.pais?.origen).toBe("agente");
  });
});

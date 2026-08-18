"use client";

/**
 * Etapa 1 del evaluador: la entrevista adaptativa.
 *
 * ## Respuestas híbridas
 *
 * Ni un formulario disfrazado de chat ni un chat sin estructura: el agente
 * propone opciones cuando la pregunta las tiene, y el campo libre está SIEMPRE
 * disponible al lado. Las opciones aceleran; no acotan.
 *
 * ## Lo que esta pantalla no enseña, y no por descuido
 *
 * No hay banderas acumulándose, no hay nivel ni aproximación al nivel, y no hay
 * reglas del motor. La entrevista no puede sentirse como un examen que vas
 * suspendiendo: es la razón por la que la consola de reglas del prototipo se
 * descartó. El filtro que lo garantiza está aguas arriba —en el `state` de
 * Convex, que no devuelve nada de eso, y en `~/lib/interview`, que descarta el
 * literal del nivel del informe—, así que aquí no hay nada que ocultar.
 *
 * ## El estado no vive en el navegador
 *
 * No hay `localStorage` ni borrador local, y es deliberado: si alguien pega
 * datos de un paciente, el agente los retira y el servidor no los guarda — pero
 * un borrador local los habría guardado igual, en el único sitio donde nadie
 * puede borrarlos después. Recargar la página retoma la entrevista pidiendo el
 * estado al servidor, que es la única copia que existe.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUp,
  ClipboardList,
  Loader2,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  FichaPanel,
  type FichaPanelProps,
} from "~/app/_components/interview/ficha-panel";
import { ReportView } from "~/app/_components/interview/report-view";
import { SessionNotice } from "~/app/_components/interview/session-notice";
import {
  correctFichaField,
  fetchInterviewState,
  InterviewError,
  MAX_MENSAJE_CHARS,
  openInterview,
  retryInterviewClose,
  sendInterviewMessage,
  type InterviewClientOptions,
  type InterviewMessage,
  type InterviewReport,
  type InterviewTurn,
} from "~/lib/interview";
import {
  ALL_FICHA_FIELDS,
  EMPTY_FICHA,
  countFilledFields,
  fichaCell,
  formatFichaValue,
  type Ficha,
  type FichaFieldSpec,
  type FichaValue,
} from "~/lib/ficha";

/** Cuánto dura el resaltado de un campo que acaba de cambiar. */
const HIGHLIGHT_MS = 2_600;

/** Cierre honesto para una evaluación completada cuyo informe no llegó. */
const INFORME_NO_DISPONIBLE = `## Evaluación completada

Hemos registrado tus respuestas y la evaluación está cerrada. El informe no se
ha podido mostrar aquí, pero lo tienes en el correo con el que te identificaste.`;

type Phase =
  | "cargando"
  | "entrevista"
  | "calculando"
  | "informe"
  | "caducada";

/**
 * Lo último que se intentó, para poder reintentarlo.
 *
 * `mensaje` guarda el texto del turno que no llegó a contestarse. Es memoria de
 * la pestaña y nada más: no se persiste en ningún sitio.
 */
type LastAttempt =
  | { type: "abrir" }
  | { type: "mensaje"; mensaje: string }
  | { type: "finalizar" };

type Failure = { message: string; retryable: boolean };

/** Los paths cuyo valor ha cambiado entre dos versiones de la ficha. */
function changedPaths(previous: Ficha, next: Ficha): string[] {
  return ALL_FICHA_FIELDS.filter((spec) => {
    const before = fichaCell(previous, spec);
    const after = fichaCell(next, spec);
    if (after === undefined) return false;
    if (before === undefined) return true;
    return (
      JSON.stringify(before.valor) !== JSON.stringify(after.valor) ||
      before.origen !== after.origen
    );
  }).map((spec) => spec.path);
}

export function InterviewScreen({
  token,
  convexSiteUrl,
}: {
  token: string;
  convexSiteUrl: string;
}) {
  const reducedMotion = useReducedMotion();

  const client = useMemo<InterviewClientOptions>(
    () => ({ baseUrl: convexSiteUrl, token }),
    [convexSiteUrl, token],
  );

  const [phase, setPhase] = useState<Phase>("cargando");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [ficha, setFicha] = useState<Ficha>(EMPTY_FICHA);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(new Set());
  const [redactedNotice, setRedactedNotice] = useState(false);
  const [draft, setDraft] = useState("");
  const [fichaOpen, setFichaOpen] = useState(false);
  /*
    El nombre de la institución no viaja en la cookie: la sesión firmada lleva
    solo `assessmentId` y añadirle datos de contacto sería ensanchar sin motivo
    lo que un token robado revela. Llega con el estado, que ya se pide igualmente.
  */
  const [institucion, setInstitucion] = useState("");

  const lastAttempt = useRef<LastAttempt | null>(null);
  const highlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const hasScrolled = useRef(false);

  /** Aplica una ficha nueva resaltando lo que ha cambiado respecto a la actual. */
  const applyFicha = useCallback((next: Ficha) => {
    setFicha((current) => {
      const changed = changedPaths(current, next);
      if (changed.length > 0) {
        setHighlighted(new Set(changed));
        if (highlightTimer.current !== null) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(
          () => setHighlighted(new Set()),
          HIGHLIGHT_MS,
        );
      }
      return next;
    });
  }, []);

  useEffect(
    () => () => {
      if (highlightTimer.current !== null) clearTimeout(highlightTimer.current);
    },
    [],
  );

  /** Traduce cualquier fallo a un estado de pantalla. */
  const handleFailure = useCallback((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") return;

    if (error instanceof InterviewError) {
      if (error.kind === "sesion") {
        setPhase("caducada");
        setFailure(null);
        return;
      }
      setFailure({
        message: error.message,
        // «Ya completada» no se reintenta: no es un fallo, es que la evaluación
        // ya estaba cerrada. La pantalla se resincroniza en vez de ofrecer un
        // botón que volvería a fallar igual.
        retryable: error.kind !== "completada",
      });
      return;
    }

    setFailure({
      message: "Ha ocurrido un error inesperado. Inténtalo de nuevo.",
      retryable: true,
    });
  }, []);

  const applyTurn = useCallback(
    (turn: InterviewTurn) => {
      applyFicha(turn.ficha);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: turn.mensaje,
          opciones: turn.opciones,
        },
      ]);
      if (turn.datosRetirados) setRedactedNotice(true);
      if (turn.cerrada) {
        /*
          A partir de aquí lo que puede fallar ya no es el turno sino el cálculo
          del informe, así que el reintento pasa a ser el cierre. Sin esto, el
          botón de reintentar volvía a mirar el último turno, lo encontraba
          contestado —el agente ya se había despedido— y limpiaba el error
          dejando la pantalla calculando sin nada que la sacara de ahí.
        */
        lastAttempt.current = { type: "finalizar" };
        setPhase("calculando");
      }
    },
    [applyFicha],
  );

  /**
   * Sincroniza con el servidor. Es también la forma de recuperarse de un corte:
   * la acción de Convex termina aunque el navegador se desconecte, así que un
   * turno que «falló» puede estar perfectamente guardado. Preguntar antes de
   * reenviar evita duplicar el turno del cliente en la transcripción.
   */
  const sync = useCallback(
    async (signal?: AbortSignal) => {
      const state = await fetchInterviewState(client, signal);
      applyFicha(state.ficha);
      setMessages(state.mensajes);
      setInstitucion(state.institucion);

      if (state.status === "completed") {
        /*
          Una evaluación completada tiene informe: el cierre escribe el estado y
          el markdown en la misma operación. Si aun así faltara, la pantalla NO
          se queda calculando para siempre —que era el final sin salida de la
          primera versión: nada volvería a intentar el cierre, porque el endpoint
          rechaza cerrar lo ya cerrado—. Se cierra con lo que sí es cierto y se
          sostiene por correo.
        */
        setReport({
          nivelNombre: "",
          diagnostico: "",
          reportMarkdown: state.reportMarkdown ?? INFORME_NO_DISPONIBLE,
          reportSlug: state.reportSlug ?? "",
        });
        setPhase("informe");
      }

      return state;
    },
    [applyFicha, client],
  );

  const runClose = useCallback(
    async (signal?: AbortSignal) => {
      lastAttempt.current = { type: "finalizar" };
      setPhase("calculando");
      await retryInterviewClose(client, {
        ...(signal !== undefined && { signal }),
        onReport: (value) => {
          setReport(value);
          setPhase("informe");
        },
      });
    },
    [client],
  );

  // Arranque: estado, y si no hay conversación todavía, que abra el agente.
  useEffect(() => {
    const controller = new AbortController();

    async function boot() {
      try {
        const state = await sync(controller.signal);

        if (state.status === "completed") return;

        if (state.mensajes.length === 0) {
          lastAttempt.current = { type: "abrir" };
          setPhase("entrevista");
          setPending(true);
          await openInterview(client, {
            signal: controller.signal,
            onTurn: applyTurn,
          });
        } else {
          setPhase("entrevista");
        }
      } catch (error) {
        handleFailure(error);
        setPhase((current) => (current === "cargando" ? "entrevista" : current));
      } finally {
        if (!controller.signal.aborted) setPending(false);
      }
    }

    void boot();

    return () => controller.abort();
  }, [applyTurn, client, handleFailure, sync]);

  /*
    El hilo se mantiene abajo.

    Dos detalles que se vieron ejecutando y no se adivinan:

    - El primer desplazamiento SALTA. Al retomar una entrevista larga el hilo
      pasa de vacío a tres mil píxeles, y un desplazamiento suave sobre ese salto
      se queda a medias —quedaba en `scrollTop: 7`— porque el contenido sigue
      creciendo mientras la animación corre. Suave solo a partir del segundo,
      que son los saltos de un turno.
    - Va dentro de un `requestAnimationFrame`: medir `scrollHeight` en el mismo
      ciclo en el que React acaba de insertar el informe da la altura de antes.

    Con `prefers-reduced-motion` nunca es suave: desplazarse también es moverse.
  */
  useEffect(() => {
    const thread = threadRef.current;
    if (thread === null) return;

    const behavior =
      reducedMotion || !hasScrolled.current ? ("auto" as const) : ("smooth" as const);

    const frame = requestAnimationFrame(() => {
      thread.scrollTo({ top: thread.scrollHeight, behavior });
      if (messages.length > 0) hasScrolled.current = true;
    });

    return () => cancelAnimationFrame(frame);
  }, [messages, pending, phase, report, reducedMotion]);

  const send = useCallback(
    async (text: string) => {
      const mensaje = text.trim();
      if (mensaje.length === 0 || pending) return;

      lastAttempt.current = { type: "mensaje", mensaje };
      setFailure(null);
      setRedactedNotice(false);
      setDraft("");
      // El turno del cliente se pinta ya: la espera del modelo es de segundos y
      // ver desaparecer lo que acabas de escribir es peor que la espera.
      setMessages((current) => [
        ...current,
        { role: "user", content: mensaje, opciones: [] },
      ]);
      setPending(true);

      let redacted = false;
      try {
        await sendInterviewMessage(client, mensaje, {
          onTurn: (turn) => {
            redacted = turn.datosRetirados;
            applyTurn(turn);
          },
          onCalculando: () => setPhase("calculando"),
          onReport: (value) => {
            setReport(value);
            setPhase("informe");
          },
        });

        /*
          Si se retiraron identificadores de paciente, lo que se pintó de forma
          optimista es el texto ORIGINAL — el que los llevaba. Se resincroniza
          para que el hilo muestre lo que de verdad se ha guardado, y para que
          ese texto no siga en la memoria de la pestaña.
        */
        if (redacted) await sync();
      } catch (error) {
        handleFailure(error);
      } finally {
        setPending(false);
        composerRef.current?.focus();
      }
    },
    [applyTurn, client, handleFailure, pending, sync],
  );

  /**
   * Reintento consciente: primero pregunta al servidor, y solo reenvía si hace
   * falta.
   *
   * La acción de Convex termina aunque el navegador se desconecte, así que un
   * turno que «falló» puede estar perfectamente contestado. Reenviar a ciegas
   * duplicaría el turno del cliente en la transcripción y le costaría uno de los
   * suyos.
   *
   * La comprobación es si el turno que se intentó mandar ESTÁ en la
   * transcripción, no si el último mensaje es del agente. Cazado ejecutando: con
   * lo segundo, un corte en la primera respuesta encontraba el turno de apertura
   * del agente como último mensaje, daba el envío por contestado y se tragaba lo
   * que el cliente había escrito, sin decir nada.
   */
  const retry = useCallback(async () => {
    const attempt = lastAttempt.current;
    setFailure(null);
    setPending(true);

    try {
      const state = await sync();

      if (state.status === "completed") return;

      if (attempt?.type === "finalizar") {
        await runClose();
        return;
      }

      if (state.mensajes.length === 0) {
        await openInterview(client, { onTurn: applyTurn });
        return;
      }

      // La apertura ya está hecha: `sync` acaba de traerla y no hay más.
      if (attempt?.type !== "mensaje") return;

      const guardado = state.mensajes.some(
        (message) =>
          message.role === "user" && message.content === attempt.mensaje,
      );
      const contestado = state.mensajes.at(-1)?.role === "assistant";

      // Llegó y se contestó: el corte fue solo del lado del navegador y `sync`
      // ya ha dejado el hilo al día.
      if (guardado && contestado) return;

      // `sync` acaba de reemplazar el hilo por el del servidor, que no tiene el
      // turno que no llegó a salir. Se vuelve a pintar antes de reenviarlo para
      // que no desaparezca de la pantalla mientras se espera.
      if (!guardado) {
        setMessages((current) => [
          ...current,
          { role: "user", content: attempt.mensaje, opciones: [] },
        ]);
      }

      await sendInterviewMessage(client, attempt.mensaje, {
        onTurn: applyTurn,
        onCalculando: () => setPhase("calculando"),
        onReport: (value) => {
          setReport(value);
          setPhase("informe");
        },
      });
    } catch (error) {
      handleFailure(error);
    } finally {
      setPending(false);
    }
  }, [applyTurn, client, handleFailure, runClose, sync]);

  const correct = useCallback(
    async (spec: FichaFieldSpec, valor: FichaValue): Promise<string | null> => {
      try {
        const result = await correctFichaField(client, spec.path, valor);
        if (!result.ok) return result.message;
        applyFicha(result.ficha);
        return null;
      } catch (error) {
        if (error instanceof InterviewError && error.kind === "sesion") {
          setPhase("caducada");
          return null;
        }
        return error instanceof InterviewError
          ? error.message
          : "No se ha podido guardar la corrección.";
      }
    },
    [applyFicha, client],
  );

  if (phase === "caducada") return <SessionNotice expired />;

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const opciones =
    !pending && phase === "entrevista" ? (lastAssistant?.opciones ?? []) : [];
  const readOnlyFicha = phase !== "entrevista";

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 pt-20 pb-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-6 lg:pt-24">
      {/*
        Región de estado para lectores de pantalla. Anuncia el turno del agente
        SIN robar el foco, que sigue en el campo de texto: un `focus()` a cada
        respuesta haría imposible escribir la siguiente mientras se lee.
      */}
      <p aria-live="polite" className="sr-only">
        {pending
          ? "El asistente está escribiendo."
          : (lastAssistant?.content ?? "")}
      </p>

      {/*
        Altura FIJA y no mínima: con `min-h` la tarjeta crece con el hilo, el
        compositor acaba a tres mil píxeles de scroll y para escribir hay que
        bajar hasta el final. Con altura fija, el que se desplaza es el hilo y el
        campo de texto no se mueve nunca — que es como se comporta cualquier
        chat, y aquí además es lo que mantiene las opciones sugeridas a la vista.

        En móvil se descuenta también la barra de la ficha, que va pegada abajo.
      */}
      <section
        aria-label="Entrevista de evaluación"
        className="shadow-big-blocks flex h-[calc(100dvh-11rem)] min-w-0 flex-col overflow-hidden rounded-3xl border border-cyan-800/20 bg-white/85 backdrop-blur-sm lg:h-[calc(100dvh-8rem)] dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30"
      >
        <InterviewHeader institucion={institucion} />

        <div
          ref={threadRef}
          role="log"
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-6 sm:px-7"
        >
          {phase === "cargando" ? <ThreadSkeleton /> : null}

          {messages.map((message, index) => (
            <MessageBubble
              key={`${index}-${message.role}`}
              message={message}
              reducedMotion={reducedMotion ?? false}
            />
          ))}

          {pending ? <TypingIndicator /> : null}

          {phase === "calculando" ? <CalculatingNotice /> : null}

          {phase === "informe" && report !== null ? (
            <ReportView report={report} />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-cyan-800/15 bg-white/50 px-4 py-4 sm:px-7 dark:border-cyan-300/15 dark:bg-white/2">
          {redactedNotice ? (
            <Notice
              tone="info"
              icon={<ShieldCheck aria-hidden="true" strokeWidth={1.8} className="size-4" />}
              onDismiss={() => setRedactedNotice(false)}
            >
              Hemos retirado los identificadores de paciente de tu mensaje antes
              de guardarlo. Esta evaluación no necesita ningún dato de paciente.
            </Notice>
          ) : null}

          {failure !== null ? (
            <Notice
              tone="error"
              icon={<AlertTriangle aria-hidden="true" strokeWidth={1.8} className="size-4" />}
              action={
                failure.retryable ? (
                  <button
                    type="button"
                    onClick={() => void retry()}
                    disabled={pending}
                    className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex shrink-0 items-center gap-1.5 rounded-full border border-rose-600/30 px-3 py-1 text-xs font-semibold text-rose-800 transition hover:bg-rose-600/10 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:border-rose-300/30 dark:text-rose-200 dark:hover:bg-rose-300/10"
                  >
                    <RotateCcw aria-hidden="true" strokeWidth={2} className="size-3" />
                    Reintentar
                  </button>
                ) : null
              }
            >
              {failure.message}
            </Notice>
          ) : null}

          {phase === "entrevista" ? (
            <Composer
              inputRef={composerRef}
              draft={draft}
              setDraft={setDraft}
              opciones={opciones}
              pending={pending}
              onSend={(text) => void send(text)}
            />
          ) : null}

          {phase === "informe" ? <ReportFooter /> : null}
        </div>
      </section>

      {/* Panel de la ficha: columna fija en escritorio, hoja a pantalla en móvil. */}
      <aside className="hidden min-w-0 lg:block">
        <div className="shadow-big-blocks sticky top-20 flex h-[calc(100dvh-8rem)] flex-col overflow-hidden rounded-3xl border border-cyan-800/20 bg-white/85 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30">
          <FichaPanel
            ficha={ficha}
            highlighted={highlighted}
            onCorrect={correct}
            readOnly={readOnlyFicha}
          />
        </div>
      </aside>

      <MobileFicha
        open={fichaOpen}
        setOpen={setFichaOpen}
        ficha={ficha}
        highlighted={highlighted}
        onCorrect={correct}
        readOnly={readOnlyFicha}
      />
    </div>
  );
}

function InterviewHeader({ institucion }: { institucion: string }) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-cyan-800/15 bg-white/45 px-4 sm:px-7 dark:border-cyan-300/15 dark:bg-white/3">
      <div className="flex min-w-0 items-center gap-3">
        <Image
          src="/logos/consensus-brand/consensus-light.svg"
          alt="Consensus Salutis"
          width={618}
          height={88}
          className="h-5 w-auto shrink-0 dark:hidden"
        />
        <Image
          src="/logos/consensus-brand/consensus-dark.svg"
          alt="Consensus Salutis"
          width={618}
          height={88}
          className="hidden h-5 w-auto shrink-0 dark:block"
        />
        {institucion.length > 0 ? (
          <span className="font-body hidden min-w-0 truncate border-l border-cyan-800/15 pl-3 text-xs text-slate-500 sm:block dark:border-cyan-300/15 dark:text-slate-400">
            {institucion}
          </span>
        ) : null}
      </div>
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-teal-700 dark:text-teal-200">
        <span className="size-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.7)]" />
        Sin datos de paciente
      </span>
    </div>
  );
}

function MessageBubble({
  message,
  reducedMotion,
}: {
  message: InterviewMessage;
  reducedMotion: boolean;
}) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.22 }}
        className="font-body ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-slate-300/80 bg-white/60 px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-slate-900 sm:text-base sm:leading-7 dark:border-slate-600/30 dark:bg-slate-700/35 dark:text-slate-100"
      >
        {message.content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
      className="flex max-w-[92%] items-start gap-2.5"
    >
      <span className="mt-0.5 block size-6 shrink-0">
        <Image
          src="/logos/consensus-brand/consensus-isotipo-light.svg"
          alt=""
          width={93}
          height={93}
          className="size-6 dark:hidden"
        />
        <Image
          src="/logos/consensus-brand/consensus-isotipo-dark.svg"
          alt=""
          width={93}
          height={93}
          className="hidden size-6 dark:block"
        />
      </span>
      <p className="font-body min-w-0 text-sm leading-6 whitespace-pre-wrap text-slate-700 sm:text-base sm:leading-7 dark:text-slate-300">
        {message.content}
      </p>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="text-primary-light dark:text-primary-dark flex items-center gap-2 pl-8.5 text-sm">
      <span className="flex gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="bg-primary-light dark:bg-primary-dark size-1.5 animate-pulse rounded-full motion-reduce:animate-none"
            style={{ animationDelay: `${dot * 160}ms` }}
          />
        ))}
      </span>
      <span className="font-body">Escribiendo…</span>
    </div>
  );
}

function CalculatingNotice() {
  return (
    <div className="border-primary-light/25 dark:border-primary-dark/25 mt-2 flex items-start gap-3 rounded-2xl border bg-white/60 px-4 py-4 dark:bg-white/3">
      <Loader2
        aria-hidden="true"
        strokeWidth={1.8}
        className="text-primary-light dark:text-primary-dark mt-0.5 size-5 shrink-0 animate-spin motion-reduce:animate-none"
      />
      <div>
        <p className="font-display text-sm font-semibold text-[#05215e] dark:text-slate-50">
          Estamos preparando tu informe
        </p>
        <p className="font-body mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Revisamos lo que has contado y redactamos el resultado. Tarda menos de
          un minuto; no cierres esta página.
        </p>
      </div>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="grid gap-4" aria-hidden="true">
      {[0, 1].map((row) => (
        <div key={row} className="flex items-start gap-2.5">
          <span className="size-6 shrink-0 rounded-full bg-cyan-800/10 dark:bg-cyan-300/10" />
          <div className="grid w-full max-w-lg gap-2">
            <span className="h-3 w-full rounded-full bg-cyan-800/10 dark:bg-cyan-300/10" />
            <span className="h-3 w-3/5 rounded-full bg-cyan-800/10 dark:bg-cyan-300/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function Notice({
  tone,
  icon,
  children,
  action,
  onDismiss,
}: {
  tone: "info" | "error";
  icon: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
  onDismiss?: () => void;
}) {
  const toneClass =
    tone === "error"
      ? "border-rose-600/25 bg-rose-50/80 text-rose-900 dark:border-rose-300/25 dark:bg-rose-400/10 dark:text-rose-100"
      : "border-cyan-800/20 bg-cyan-50/70 text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-50";

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`font-body mb-3 flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs leading-5 ${toneClass}`}
    >
      <span className="mt-px shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
      {action}
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar el aviso"
          className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark shrink-0 rounded-md p-0.5 opacity-60 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

function Composer({
  inputRef,
  draft,
  setDraft,
  opciones,
  pending,
  onSend,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  draft: string;
  setDraft: (value: string) => void;
  opciones: string[];
  pending: boolean;
  onSend: (text: string) => void;
}) {
  const tooLong = draft.length > MAX_MENSAJE_CHARS;
  const canSend = !pending && draft.trim().length > 0 && !tooLong;

  return (
    <div>
      {/*
        Las opciones no son el único camino: el campo libre está debajo y
        siempre activo. Son un atajo para la mitad de las preguntas que lo
        admiten, no un menú del que haya que elegir.
      */}
      {opciones.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Respuestas sugeridas">
          {opciones.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSend(option)}
              disabled={pending}
              className="border-primary-light/30 font-body hover:border-primary-light/60 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-full border bg-white/70 px-3.5 py-1.5 text-xs font-medium text-cyan-900 transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 dark:border-cyan-300/30 dark:bg-white/4 dark:text-cyan-50 dark:hover:border-cyan-200/60 dark:hover:bg-cyan-300/10"
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}

      <div className="focus-within:border-primary-light/50 flex items-end gap-2 rounded-2xl border border-cyan-800/20 bg-white px-3 py-2 transition dark:border-cyan-300/20 dark:bg-[#04111e]/80 dark:focus-within:border-cyan-300/50">
        <label htmlFor="interview-composer" className="sr-only">
          Tu respuesta
        </label>
        <textarea
          ref={inputRef}
          id="interview-composer"
          rows={1}
          value={draft}
          disabled={pending}
          placeholder="Escribe tu respuesta…"
          aria-describedby="interview-composer-hint"
          className="font-body max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
          onChange={(event) => {
            setDraft(event.target.value);
            const element = event.target;
            element.style.height = "auto";
            element.style.height = `${Math.min(element.scrollHeight, 160)}px`;
          }}
          onKeyDown={(event) => {
            // Enter envía; Mayús+Enter hace párrafo. Es lo que espera cualquiera
            // que haya usado un chat, y la alternativa obliga a ir al ratón.
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              if (canSend) onSend(draft);
            }
          }}
        />
        <button
          type="button"
          onClick={() => onSend(draft)}
          disabled={!canSend}
          aria-label="Enviar respuesta"
          className="bg-primary-light dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid size-9 shrink-0 place-items-center rounded-full text-white transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40 dark:text-[#04111e] dark:hover:bg-primary-dark-lighter"
        >
          {pending ? (
            <Loader2
              aria-hidden="true"
              strokeWidth={2}
              className="size-4 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <ArrowUp aria-hidden="true" strokeWidth={2.2} className="size-4" />
          )}
        </button>
      </div>

      <p
        id="interview-composer-hint"
        className={`font-body mt-2 text-[11px] ${
          tooLong
            ? "text-rose-700 dark:text-rose-300"
            : "text-slate-400 dark:text-slate-500"
        }`}
      >
        {tooLong
          ? `El mensaje supera los ${MAX_MENSAJE_CHARS.toLocaleString("es-ES")} caracteres. Acórtalo para poder enviarlo.`
          : "Pulsa Intro para enviar. No hace falta ningún dato de paciente en esta evaluación."}
      </p>
    </div>
  );
};

function ReportFooter() {
  return (
    <p className="font-body text-xs leading-5 text-slate-500 dark:text-slate-400">
      Te hemos enviado también el informe al correo con el que te identificaste.
      Si quieres comentarlo,{" "}
      <Link
        href="/contacto"
        className="text-primary-light dark:text-secondary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
      >
        solicita una reunión
      </Link>
      .
    </p>
  );
}

/**
 * La ficha en móvil.
 *
 * Va en una hoja a pantalla completa y no en una columna encogida: con 360px de
 * ancho, la ficha al lado del chat deja las dos cosas ilegibles. La barra de
 * abajo mantiene visible el dato que importa —cuántos campos llevamos— para que
 * la ficha no sea algo que exista solo si a alguien se le ocurre buscarla.
 */
function MobileFicha({
  open,
  setOpen,
  ficha,
  highlighted,
  onCorrect,
  readOnly,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  ficha: Ficha;
  highlighted: ReadonlySet<string>;
  onCorrect: FichaPanelProps["onCorrect"];
  readOnly: boolean;
}) {
  const filled = countFilledFields(ficha);
  const lastChanged = [...highlighted].at(-1);
  const changedSpec = lastChanged
    ? ALL_FICHA_FIELDS.find((spec) => spec.path === lastChanged)
    : undefined;
  const changedCell = changedSpec ? fichaCell(ficha, changedSpec) : undefined;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <>
      <div className="sticky bottom-0 z-30 -mx-4 mt-3 border-t border-cyan-800/15 bg-[#f4f9fc]/92 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden dark:border-cyan-300/15 dark:bg-[#06111f]/92">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark flex w-full items-center gap-3 rounded-xl border border-cyan-800/15 bg-white/70 px-3.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/15 dark:bg-white/4"
        >
          <ClipboardList
            aria-hidden="true"
            strokeWidth={1.8}
            className="text-primary-light dark:text-primary-dark size-4 shrink-0"
          />
          <span className="min-w-0 flex-1">
            <span className="font-body block text-xs font-semibold text-slate-900 dark:text-slate-100">
              Ficha de la evaluación · {filled} de {ALL_FICHA_FIELDS.length}
            </span>
            <span className="font-body block truncate text-[11px] text-slate-500 dark:text-slate-400">
              {changedSpec && changedCell
                ? `${changedSpec.label}: ${formatFichaValue(changedCell.valor)}`
                : "Toca para revisarla y corregir cualquier valor"}
            </span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Ficha de la evaluación"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#f4f9fc] lg:hidden dark:bg-[#06111f]"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-cyan-800/15 px-4 dark:border-cyan-300/15">
              <p className="font-display text-sm font-semibold text-[#05215e] dark:text-slate-50">
                Ficha de la evaluación
              </p>
              <button
                type="button"
                autoFocus
                onClick={() => setOpen(false)}
                className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid size-9 place-items-center rounded-full border border-cyan-800/15 text-slate-600 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/15 dark:text-slate-300"
                aria-label="Cerrar la ficha"
              >
                <X aria-hidden="true" strokeWidth={2} className="size-4" />
              </button>
            </div>
            <div className="min-h-0 flex-1">
              <FichaPanel
                ficha={ficha}
                highlighted={highlighted}
                onCorrect={onCorrect}
                readOnly={readOnly}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


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

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUp,
  Check,
  Clock3,
  FileText,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import { FichaArco } from "~/app/_components/interview/ficha-arco";
import { FichaPanel } from "~/app/_components/interview/ficha-panel";
import { MarkdownInline } from "~/app/_components/interview/markdown";
import { ReportView } from "~/app/_components/interview/report-view";
import { SessionNotice } from "~/app/_components/interview/session-notice";
import {
  fetchInterviewState,
  InterviewError,
  MAX_MENSAJE_CHARS,
  openInterview,
  retryInterviewClose,
  sendInterviewMessage,
  type CalculandoFase,
  type InterviewClientOptions,
  type InterviewMessage,
  type InterviewReport,
  type InterviewTurn,
} from "~/lib/interview";
import {
  ALL_FICHA_FIELDS,
  CAMPOS_INFERIDOS,
  EMPTY_FICHA,
  enumerar,
  fichaCell,
  fichaFieldByPath,
  type Ficha,
} from "~/lib/ficha";
import { avanceDeBloques } from "~/lib/ficha-rasgos";
import { capitalizarInstitucion, partirOpciones } from "~/lib/opciones";

/** Cuánto dura el resaltado de un campo que acaba de cambiar. */
const HIGHLIGHT_MS = 2_600;

/** Alto máximo del compositor en píxeles. El mismo valor que su `max-h-40`. */
const COMPOSER_MAX_HEIGHT = 160;

/**
 * El vacío estable de opciones.
 *
 * Un `[]` nuevo en cada render invalidaría el `useMemo` del reparto y con él el
 * atajo de teclado, que se recolocaría en cada pulsación.
 */
const SIN_OPCIONES: string[] = [];

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

/**
 * Un turno del hilo tal y como lo pinta esta pantalla.
 *
 * `inferidos` es lo que el agente dedujo de ESE mensaje sin que se lo
 * preguntaran. Es un añadido de la interfaz y no del transporte: el payload no
 * trae la idea de «lo que se anotó a raíz de este turno», se calcula aquí
 * comparando la ficha de antes con la de después.
 */
type ThreadItem = InterviewMessage & { inferidos?: string[] };

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
  const [messages, setMessages] = useState<ThreadItem[]>([]);
  const [ficha, setFicha] = useState<Ficha>(EMPTY_FICHA);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [pending, setPending] = useState(false);
  /*
    La fase del cierre, para la tarjeta de progreso. La resetea cada arranque de
    cierre (el servidor emite `veredicto` como primera fase) y solo avanza.
  */
  const [calcFase, setCalcFase] = useState<CalculandoFase>("veredicto");
  /*
    Las casillas marcadas de la pregunta de varias respuestas ACTIVA. Vive aquí y
    no dentro de `QuickAnswers` porque el compositor también la necesita: marcar
    tres opciones y escribir «y además cardiología» tiene que salir en UN turno con
    las dos cosas — antes lo marcado se descartaba en silencio (website#5 §2).
  */
  const [marcadas, setMarcadas] = useState<readonly string[]>([]);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [highlighted, setHighlighted] = useState<ReadonlySet<string>>(new Set());
  const [redactedNotice, setRedactedNotice] = useState(false);
  const [draft, setDraft] = useState("");
  const [fichaOpen, setFichaOpen] = useState(false);
  /*
    Los turnos que le quedan al agente. NO se escribe nunca —una cuenta atrás en
    una entrevista de idoneidad se lee como cuántas preguntas quedan para
    suspender—: alimenta la frase suave del panel («Vamos por la mitad»). Llega en
    cada turno y hasta ahora no se pintaba en ningún sitio.
  */
  const [turnosRestantes, setTurnosRestantes] = useState(12);
  /*
    Cuántos datos trajo el último turno. La barra móvil lo cuenta como novedad y
    no como deuda, así que no puede salir de `highlighted`: ese conjunto se vacía
    a los 2,6 s y el contador caería a cero solo.
  */
  const [nuevos, setNuevos] = useState(0);
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
  /*
    La ficha vigente, en una referencia además del estado.

    Hace falta porque quien aplica un turno necesita saber QUÉ cambió para poder
    decir «anotado también», y el diff se hace contra la ficha de antes. Leerla del
    estado dentro del propio `setFicha` obligaba a hacer el efecto —resaltar— dentro
    del actualizador, que es exactamente donde React no garantiza que se ejecute una
    sola vez.
  */
  const fichaRef = useRef<Ficha>(EMPTY_FICHA);

  /**
   * Aplica una ficha nueva resaltando lo que ha cambiado, y devuelve los paths
   * que cambiaron para quien necesite mirarlos.
   *
   * `highlight: false` para quien no está recibiendo un turno. El resaltado dice
   * «esto acaba de llegar», y al sincronizar el diff se hace contra la ficha de
   * recién montado —vacía—, así que TODO sale como cambiado: sin esto, reabrir la
   * pestaña a mitad de entrevista encendía los veintitrés datos viejos como si
   * acabaran de anotarse, que es el mismo malentendido que `setNuevos(0)` evita
   * en la barra móvil.
   */
  const applyFicha = useCallback(
    (next: Ficha, options?: { highlight?: boolean }): string[] => {
      const changed = changedPaths(fichaRef.current, next);
      fichaRef.current = next;
      setFicha(next);

      if (changed.length > 0 && options?.highlight !== false) {
        setHighlighted(new Set(changed));
        if (highlightTimer.current !== null) clearTimeout(highlightTimer.current);
        highlightTimer.current = setTimeout(
          () => setHighlighted(new Set()),
          HIGHLIGHT_MS,
        );
      }

      return changed;
    },
    [],
  );

  useEffect(
    () => () => {
      if (highlightTimer.current !== null) clearTimeout(highlightTimer.current);
    },
    [],
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
      applyFicha(state.ficha, { highlight: false });
      setMessages(state.mensajes);
      setInstitucion(state.institucion);
      setTurnosRestantes(state.turnosRestantes);
      setMarcadas([]);
      /*
        Retomar una entrevista no es recibir un turno: nada acaba de llegar, así que
        la barra móvil no puede anunciar novedades. Sin esto, reabrir la pestaña
        presentaba veintitrés datos viejos como recién anotados.
      */
      setNuevos(0);

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

  /** Traduce cualquier fallo a un estado de pantalla. */
  const handleFailure = useCallback(
    (error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;

      if (error instanceof InterviewError) {
        if (error.kind === "sesion") {
          setPhase("caducada");
          setFailure(null);
          return;
        }

        /*
          «Ya completada» no es un fallo: es que la evaluación ya estaba cerrada
          —otra pestaña la cerró, o el cierre llegó mientras esto se enviaba—, y
          lo que corresponde es resincronizar, que es lo que deja el informe en
          pantalla. Se HACE aquí; antes solo lo prometía este comentario, y sin
          reintento ni resincronización el cliente se quedaba con un aviso, sin
          informe y con el compositor puesto, repitiendo el mismo error en cada
          mensaje. Si la resincronización falla, entonces sí hay algo que
          reintentar.
        */
        if (error.kind === "completada") {
          setFailure(null);
          void sync().catch((syncError: unknown) => {
            if (
              syncError instanceof InterviewError &&
              syncError.kind === "sesion"
            ) {
              setPhase("caducada");
              return;
            }
            setFailure({ message: error.message, retryable: true });
          });
          return;
        }

        setFailure({ message: error.message, retryable: true });
        return;
      }

      /*
        Era el único aviso que no decía qué se conserva, y es justo cuando más
        importa: un fallo sin diagnóstico deja al cliente pensando que ha perdido
        diez minutos de entrevista.
      */
      setFailure({
        message:
          "Algo ha fallado por nuestra parte. Tus respuestas siguen guardadas: inténtalo otra vez.",
        retryable: true,
      });
    },
    [sync],
  );

  const applyTurn = useCallback(
    (turn: InterviewTurn) => {
      const changed = applyFicha(turn.ficha);
      setTurnosRestantes(turn.turnosRestantes);
      setNuevos(changed.length);
      // Pregunta nueva, casillas a cero: lo marcado era de la anterior.
      setMarcadas([]);

      /*
        Los campos que el agente ha DEDUCIDO en este turno: los que se anotaron sin
        que se preguntaran por ellos. Se cuelgan del mensaje del cliente que los
        provocó, porque la línea se lee justo debajo de lo que acaba de escribir.

        Un campo que el cliente corrigió no cuenta: lo suyo no es una deducción.
      */
      const inferidos = changed.filter((path) => {
        if (!CAMPOS_INFERIDOS.includes(path)) return false;
        const spec = fichaFieldByPath(path);
        return spec !== undefined && fichaCell(turn.ficha, spec)?.origen === "agente";
      });

      setMessages((current) => {
        const next = [...current];

        if (inferidos.length > 0) {
          // `findLastIndex` es ES2023 y la `lib` del proyecto es ES2022.
          let lastUser = -1;
          for (let i = next.length - 1; i >= 0; i -= 1) {
            if (next[i]!.role === "user") {
              lastUser = i;
              break;
            }
          }
          // En la apertura no hay mensaje del cliente al que colgarlo: el agente
          // habla primero y todavía no ha podido deducir nada de nadie.
          if (lastUser !== -1) next[lastUser] = { ...next[lastUser]!, inferidos };
        }

        next.push({
          role: "assistant",
          content: turn.mensaje,
          opciones: turn.opciones,
          multiple: turn.multiple,
        });

        return next;
      });

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


  const runClose = useCallback(
    async (signal?: AbortSignal) => {
      lastAttempt.current = { type: "finalizar" };
      setCalcFase("veredicto");
      setPhase("calculando");
      await retryInterviewClose(client, {
        ...(signal !== undefined && { signal }),
        onCalculando: setCalcFase,
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
      // Lo marcado ya viaja dentro de `mensaje` (o se descarta a conciencia al
      // elegir la escapatoria): no debe sobrevivir al envío.
      setMarcadas([]);
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
          onCalculando: (fase) => {
            setCalcFase(fase);
            setPhase("calculando");
          },
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
        onCalculando: (fase) => {
          setCalcFase(fase);
          setPhase("calculando");
        },
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

  /*
    Ya no hay `correct` aquí, y el hueco es la mitad del rediseño: la corrección va
    por el chat, que es donde ya está la conversación. `correctFichaField` sigue en
    `~/lib/interview` como vía de escape si eso no cuaja.
  */
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  /*
    Las opciones viven DENTRO del mensaje que las motiva, así que hace falta saber
    en qué índice está ese mensaje y no solo cuáles son sus opciones.
  */
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]!.role === "assistant") {
      lastAssistantIndex = i;
      break;
    }
  }

  /*
    `opcionesCrudas` sale del estado, así que su identidad solo cambia cuando llega
    un turno. Es lo que permite memorizar el reparto y, con él, que el atajo de
    teclado no se recoloque en cada render.
  */
  const opcionesCrudas =
    phase === "entrevista" ? (lastAssistant?.opciones ?? SIN_OPCIONES) : SIN_OPCIONES;
  const opciones = useMemo(() => partirOpciones(opcionesCrudas), [opcionesCrudas]);
  const respuestas = opciones.respuestas;
  const hayOpciones = respuestas.length > 0;
  const readOnlyFicha = phase !== "entrevista";
  const cerrada = phase === "calculando" || phase === "informe";

  /*
    Lo marcado, en el orden de las opciones y no en el de los clics: dos clientes
    que marcan lo mismo en distinto orden producen el mismo turno.
  */
  const marcadasEnOrden = respuestas.filter((respuesta) => marcadas.includes(respuesta));
  const activaMultiple = lastAssistant?.multiple === true;

  const alternarMarcada = useCallback((respuesta: string) => {
    setMarcadas((current) =>
      current.includes(respuesta)
        ? current.filter((item) => item !== respuesta)
        : [...current, respuesta],
    );
  }, []);

  /** El botón «Continuar» de las preguntas de varias respuestas. */
  const enviarMarcadas = () => {
    if (marcadasEnOrden.length === 0) return;
    void send(enumerar(marcadasEnOrden));
  };

  /**
   * El envío desde el campo libre. Si la pregunta activa es de varias respuestas
   * y hay casillas marcadas, lo marcado viaja en el MISMO turno que lo escrito:
   * marcar tres formatos y escribir «y además papel» era antes un turno que
   * descartaba las tres casillas sin avisar.
   */
  const enviarDesdeCompositor = (text: string) => {
    const escrito = text.trim();
    if (activaMultiple && marcadasEnOrden.length > 0) {
      const combinado =
        escrito.length > 0
          ? `He marcado: ${enumerar(marcadasEnOrden)}.\n\n${escrito}`
          : enumerar(marcadasEnOrden);
      void send(combinado);
      return;
    }
    void send(escrito);
  };

  if (phase === "caducada") return <SessionNotice expired />;

  return (
    <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-5 px-5 pt-20 pb-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-6 lg:pt-24">
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
          className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-7"
        >
          {phase === "cargando" ? <ThreadSkeleton /> : null}

          {/*
            Las tres líneas de apertura. El texto ya existía, disperso: la duración
            estaba dentro del saludo del agente y la garantía de datos en el hint del
            compositor, en gris de 11px, donde se repetía en cada turno y por eso
            mismo no se leía. Dicha una vez y grande, se sostiene.
          */}
          {phase !== "cargando" ? <OpeningBrief /> : null}

          {messages.map((message, index) => (
            <Fragment key={`${index}-${message.role}`}>
              <MessageBubble
                message={message}
                reducedMotion={reducedMotion ?? false}
                /*
                  Las opciones viven dentro del mensaje que las motiva, no flotando
                  sobre el compositor: la pregunta y sus respuestas se leen juntas.
                */
                opciones={index === lastAssistantIndex ? opciones : null}
                pending={pending}
                onSend={(text) => void send(text)}
                marcadas={marcadas}
                onToggle={alternarMarcada}
                onContinue={enviarMarcadas}
              />

              {message.inferidos !== undefined && message.inferidos.length > 0 ? (
                <InferenceLine
                  paths={message.inferidos}
                  ficha={ficha}
                  reducedMotion={reducedMotion ?? false}
                />
              ) : null}
            </Fragment>
          ))}

          {/*
            El indicador de escritura es de la ENTREVISTA: durante el cierre lo que
            informa es la tarjeta de fases, y los dos a la vez decían cosas
            contradictorias («escribiendo…» sobre «preparando tu informe»).
          */}
          {pending && phase === "entrevista" ? <TypingIndicator /> : null}

          {phase === "calculando" ? <CalculatingNotice fase={calcFase} /> : null}

          {phase === "informe" && report !== null ? (
            <ReportView report={report} />
          ) : null}
        </div>

        <div className="shrink-0 border-t border-cyan-800/15 bg-white/50 px-5 py-4 sm:px-7 dark:border-cyan-300/15 dark:bg-white/3">
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
              hayOpciones={hayOpciones}
              pending={pending}
              onSend={enviarDesdeCompositor}
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
            turnosRestantes={turnosRestantes}
            cerrada={cerrada}
            readOnly={readOnlyFicha}
          />
        </div>
      </aside>

      <MobileFicha
        open={fichaOpen}
        setOpen={setFichaOpen}
        ficha={ficha}
        highlighted={highlighted}
        turnosRestantes={turnosRestantes}
        cerrada={cerrada}
        nuevos={nuevos}
        readOnly={readOnlyFicha}
      />
    </div>
  );
}

function InterviewHeader({ institucion }: { institucion: string }) {
  return (
    <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-cyan-800/15 bg-white/40 px-5 sm:px-7 dark:border-cyan-300/15 dark:bg-white/3">
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
          /*
            El nombre llega tal cual lo escribió el cliente en la etapa 0, así que
            «Hospital de móstoles» se pintaba con la minúscula incluida. Se capitaliza
            por palabra, con las partículas en minúscula.
          */
          <span className="font-body hidden min-w-0 truncate border-l border-cyan-800/15 pl-3 text-xs text-slate-500 sm:block dark:border-cyan-300/15 dark:text-slate-400">
            {capitalizarInstitucion(institucion)}
          </span>
        ) : null}
      </div>
      {/*
        El punto baja de intensidad: con el resplandor de antes parecía un LED de
        estado —algo que se enciende y se apaga— y lo que dice es una promesa.
      */}
      <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-teal-700 dark:text-teal-200">
        <span className="size-1.5 rounded-full bg-teal-500/70 dark:bg-teal-300/60" />
        Sin datos de paciente
      </span>
    </div>
  );
}

/**
 * Las tres líneas que van antes de la primera pregunta.
 *
 * Sin ellas la primera pantalla era una pregunta arriba, setecientos píxeles de
 * nada y un panel anunciando veintiocho huecos. Lo que dicen no es nuevo: es lo
 * que estaba escondido en el saludo del agente y en el hint del compositor.
 */
function OpeningBrief() {
  const lineas = [
    {
      icon: <Clock3 aria-hidden="true" strokeWidth={1.8} className="size-3.5" />,
      body: <>Ocho a doce minutos, unas doce preguntas.</>,
    },
    {
      icon: <FileText aria-hidden="true" strokeWidth={1.8} className="size-3.5" />,
      body: (
        <>
          Al terminar recibes un{" "}
          <b className="font-semibold text-slate-800 dark:text-slate-100">
            informe sobre el encaje de tu caso
          </b>
          , y te lo mandamos por correo.
        </>
      ),
    },
    {
      icon: <ShieldCheck aria-hidden="true" strokeWidth={1.8} className="size-3.5" />,
      body: (
        <>
          <b className="font-semibold text-slate-800 dark:text-slate-100">
            No hace falta ningún dato de paciente.
          </b>{" "}
          Si aparece alguno, lo retiramos antes de guardar.
        </>
      ),
    },
  ];

  return (
    <div className="grid gap-2 border-b border-cyan-800/12 pb-4 dark:border-cyan-300/12">
      {lineas.map((linea, index) => (
        <p
          key={index}
          className="font-body flex items-baseline gap-2.5 text-[12.5px] leading-snug text-slate-600 dark:text-slate-400"
        >
          <span className="text-primary-light dark:text-primary-dark shrink-0 translate-y-0.5">
            {linea.icon}
          </span>
          <span className="min-w-0">{linea.body}</span>
        </p>
      ))}
    </div>
  );
}

function MessageBubble({
  message,
  reducedMotion,
  opciones,
  pending,
  onSend,
  marcadas,
  onToggle,
  onContinue,
}: {
  message: InterviewMessage;
  reducedMotion: boolean;
  /** El reparto de opciones, si este es el mensaje que las motiva. */
  opciones: ReturnType<typeof partirOpciones> | null;
  pending: boolean;
  onSend: (text: string) => void;
  /** Las casillas marcadas de la pregunta activa. Viven en la pantalla. */
  marcadas: readonly string[];
  onToggle: (respuesta: string) => void;
  onContinue: () => void;
}) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: reducedMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.22 }}
        className="font-body ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-slate-300/80 bg-white/50 px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-slate-900 sm:text-base sm:leading-7 dark:border-slate-600/30 dark:bg-slate-700/35 dark:text-slate-100"
      >
        {message.content}
      </motion.div>
    );
  }

  const hayRespuestas = opciones !== null && opciones.respuestas.length > 0;

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
      <div className="min-w-0 flex-1">
        <p className="font-body min-w-0 text-sm leading-6 whitespace-pre-wrap text-slate-700 sm:text-base sm:leading-7 dark:text-slate-300">
          {/*
            Énfasis en línea y nada más: el agente escribe `**comité de ética**`
            y los asteriscos no son para el cliente. Los bloques (listas,
            encabezados) no se parsean — un turno de chat no los lleva.
          */}
          <MarkdownInline>{message.content}</MarkdownInline>
        </p>
        {hayRespuestas ? (
          <QuickAnswers
            opciones={opciones}
            multiple={message.multiple === true}
            pending={pending}
            onSend={onSend}
            marcadas={marcadas}
            onToggle={onToggle}
            onContinue={onContinue}
          />
        ) : null}
      </div>
    </motion.div>
  );
}

/**
 * Las respuestas rápidas: una por fila, del ancho del mensaje.
 *
 * ## Por qué en columna y no en píldoras
 *
 * Tres filas ocupan unos 130px frente a los 34px de una fila de píldoras, y ese
 * alto sale del hilo: con el compositor de altura fija, se ve un turno menos de
 * historia mientras hay opciones en pantalla. Es un buen cambio — la pregunta
 * activa importa más que el turno anterior. A cambio la legibilidad es constante
 * (una opción, una línea), las opciones largas caben sin descolocar nada, y en
 * móvil se comporta igual que en escritorio, que es donde el diseño horizontal se
 * descontrola.
 *
 * ## El caso binario
 *
 * Tres filas para decir «sí» y «no» es desperdiciar alto, así que una pregunta
 * cuyas respuestas son exactamente esas dos se pinta como un segmentado. Da además
 * la variedad visual que evita que los cinco bloques se sientan iguales en el
 * minuto ocho.
 *
 * ## Y el caso de varias respuestas
 *
 * Lo decide el agente por pregunta: «¿en qué formato están los documentos?» admite
 * varias y «¿tenéis DPO?» no. Con `multiple`, las filas pasan a ser casillas y hace
 * falta un botón para enviar — porque si pulsar una fila enviara, marcar la segunda
 * sería imposible. Es la única forma de control de esta pantalla que necesita dos
 * gestos, y por eso solo aparece cuando el modelo lo pide.
 *
 * El binario se ignora si `multiple` viene puesto: un «sí/no» de varias respuestas
 * no significa nada, pero quien manda sobre el control es el agente.
 */
function QuickAnswers({
  opciones,
  multiple,
  pending,
  onSend,
  marcadas,
  onToggle,
  onContinue,
}: {
  opciones: ReturnType<typeof partirOpciones>;
  multiple: boolean;
  pending: boolean;
  onSend: (text: string) => void;
  /*
    El estado de las casillas vive en la pantalla, no aquí: el compositor lo
    necesita para mandar lo marcado y lo escrito en un solo turno. Este componente
    solo pinta y avisa.
  */
  marcadas: readonly string[];
  onToggle: (respuesta: string) => void;
  onContinue: () => void;
}) {
  const { respuestas, escapatoria, binaria } = opciones;

  /*
    Del 1 al 4: envía la fila, o la marca si la pregunta admite varias. Con `Intro`
    se confirma lo marcado.

    El atajo NO se escucha cuando el foco está en un campo de texto, y esa condición
    es la mitad del atajo: el compositor recupera el foco después de cada turno, así
    que sin ella escribir «1.200 documentos» habría enviado la primera opción en la
    primera tecla. Tampoco con modificadores, que son atajos del navegador.
  */
  useEffect(() => {
    if (pending) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const editable =
          target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
        if (editable) return;
      }

      if (multiple && event.key === "Enter") {
        event.preventDefault();
        onContinue();
        return;
      }

      const index = Number(event.key) - 1;
      const elegida = respuestas[index];
      if (!Number.isInteger(index) || elegida === undefined) return;

      event.preventDefault();
      if (multiple) onToggle(elegida);
      else onSend(elegida);
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onToggle, onContinue, multiple, onSend, pending, respuestas]);

  return (
    <div
      role="group"
      /* «Sugeridas» no dice que al pulsar se envíe; «rápidas» sí. */
      aria-label={
        multiple
          ? "Respuestas rápidas a esta pregunta, puedes marcar varias"
          : "Respuestas rápidas a esta pregunta"
      }
      className={`mt-3.5 grid gap-1.5 ${pending ? "pointer-events-none opacity-50" : ""}`}
    >
      {multiple ? (
        <MultiAnswers
          respuestas={respuestas}
          marcadas={marcadas}
          pending={pending}
          onToggle={onToggle}
          onContinue={onContinue}
        />
      ) : binaria ? (
        <div className="border-primary-light/28 dark:border-primary-dark/34 flex w-fit overflow-hidden rounded-full border-[1.5px] bg-white/70 dark:bg-white/4">
          {respuestas.map((respuesta, index) => (
            <button
              key={respuesta}
              type="button"
              disabled={pending}
              onClick={() => onSend(respuesta)}
              aria-keyshortcuts={`${index + 1}`}
              className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark hover:text-primary-light dark:hover:text-primary-dark border-primary-light/28 dark:border-primary-dark/34 px-6 py-2 text-[13px] font-semibold text-slate-800 transition not-first:border-l-[1.5px] hover:bg-cyan-800/6 focus-visible:outline-2 focus-visible:-outline-offset-2 disabled:opacity-100 dark:text-slate-100 dark:hover:bg-cyan-300/8"
            >
              {respuesta}
            </button>
          ))}
        </div>
      ) : (
        respuestas.map((respuesta, index) => (
          <button
            key={respuesta}
            type="button"
            disabled={pending}
            onClick={() => onSend(respuesta)}
            aria-keyshortcuts={`${index + 1}`}
            className="group font-body focus-visible:outline-primary-light hover:border-primary-light dark:hover:border-primary-dark dark:focus-visible:outline-primary-dark grid w-full grid-cols-[1fr_auto] items-center gap-2.5 rounded-[11px] border border-cyan-800/30 bg-white/70 px-3.5 py-2.5 text-left text-[13px] leading-snug font-medium text-slate-800 transition hover:translate-x-0.5 hover:bg-cyan-800/5 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-100 dark:border-cyan-300/28 dark:bg-white/4 dark:text-slate-100 dark:hover:bg-cyan-300/8"
          >
            <span className="min-w-0">{respuesta}</span>
            {/*
              Al pulsar se ENVÍA, así que el control tiene que decirlo: sin la
              flecha, una fila que se ilumina al pasar por encima se lee como algo
              que se selecciona y luego se confirma.
            */}
            <ArrowRight
              aria-hidden="true"
              strokeWidth={2.2}
              className="text-primary-light dark:text-primary-dark size-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </button>
        ))
      )}

      {escapatoria !== null ? (
        /*
          «No lo sé» no es una respuesta: es la salida de quien no tiene el dato.
          Va como fila SECUNDARIA —borde punteado, tono apagado, sin flecha— debajo
          de las respuestas: distinguible de «Sí, ya lo tenemos», pero visible. El
          enlace de 11px de la primera versión pasaba tan desapercibido que los
          clientes no lo encontraban (website#5 §3).
        */
        <button
          type="button"
          disabled={pending}
          onClick={() => onSend(escapatoria)}
          className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark w-fit rounded-[11px] border border-dashed border-slate-400/60 px-3.5 py-2 text-left text-[12.5px] leading-snug font-medium text-slate-500 transition hover:border-slate-500/70 hover:bg-slate-500/5 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-100 dark:border-slate-500/50 dark:text-slate-400 dark:hover:border-slate-400/60 dark:hover:bg-slate-400/10 dark:hover:text-slate-200"
        >
          {escapatoria}
        </button>
      ) : null}
    </div>
  );
}

/**
 * Las respuestas cuando se pueden marcar varias.
 *
 * Cada fila es una casilla —`role="checkbox"` sobre un botón, que es lo que hace
 * que un lector de pantalla diga «casilla, no marcada» y no «botón»— y el envío va
 * en un control aparte. La escapatoria sigue fuera del grupo y sigue enviando al
 * pulsarla: no es una de las respuestas que se acumulan.
 */
function MultiAnswers({
  respuestas,
  marcadas,
  pending,
  onToggle,
  onContinue,
}: {
  respuestas: readonly string[];
  marcadas: readonly string[];
  pending: boolean;
  onToggle: (respuesta: string) => void;
  onContinue: () => void;
}) {
  return (
    <>
      {/*
        Que se puede marcar más de una no se adivina de una casilla: los cuatro
        turnos anteriores enviaban al primer clic, y el gesto aprendido gana a la
        forma del control. Se dice una vez, encima del grupo.
      */}
      <p className="font-body mb-0.5 text-[11px] text-slate-500 dark:text-slate-400">
        Marca todas las que apliquen.
      </p>

      {respuestas.map((respuesta, index) => {
        const marcada = marcadas.includes(respuesta);

        return (
          <button
            key={respuesta}
            type="button"
            role="checkbox"
            aria-checked={marcada}
            disabled={pending}
            onClick={() => onToggle(respuesta)}
            aria-keyshortcuts={`${index + 1}`}
            className={`group font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid w-full grid-cols-[auto_1fr] items-center gap-2.5 rounded-[11px] border px-3.5 py-2.5 text-left text-[13px] leading-snug font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-100 ${
              marcada
                ? "border-primary-light dark:border-primary-dark bg-primary-light/8 dark:bg-primary-dark/12 text-slate-900 dark:text-slate-50"
                : "border-cyan-800/30 bg-white/70 text-slate-800 hover:border-cyan-800/55 hover:bg-cyan-800/5 dark:border-cyan-300/28 dark:bg-white/4 dark:text-slate-100 dark:hover:border-cyan-300/55 dark:hover:bg-cyan-300/8"
            }`}
          >
            <span
              aria-hidden="true"
              className={`grid size-4 shrink-0 place-items-center rounded-[5px] border transition ${
                marcada
                  ? "bg-primary-light dark:bg-primary-dark border-transparent text-white dark:text-[#04111e]"
                  : "border-cyan-800/40 dark:border-cyan-300/40"
              }`}
            >
              {marcada ? <Check strokeWidth={3} className="size-2.5" /> : null}
            </span>
            <span className="min-w-0">{respuesta}</span>
          </button>
        );
      })}

      {/*
        Deshabilitado con cero marcadas en vez de escondido: un botón que aparece al
        marcar la primera opción mueve la escapatoria de sitio justo cuando el ojo
        está ahí.
      */}
      <button
        type="button"
        disabled={pending || marcadas.length === 0}
        onClick={onContinue}
        className="bg-primary-light font-body dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:bg-primary-dark-lighter mt-1.5 inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#04111e]"
      >
        Continuar
        <ArrowRight aria-hidden="true" strokeWidth={2.4} className="size-3.5" />
      </button>
    </>
  );
}

/**
 * «Anotado también»: la inferencia, dicha en voz alta.
 *
 * `ambitoPublico` y `comunidad` se deducen sin preguntarlos, y hasta ahora
 * aparecían en el panel en silencio. Es lo más impresionante que hace el sistema y
 * era invisible: decirlo hace que alguien de dirección médica piense «esto entiende
 * de lo mío», que es lo que un contador de veintiocho campos no consigue nunca.
 */
function InferenceLine({
  paths,
  ficha,
  reducedMotion,
}: {
  paths: readonly string[];
  ficha: Ficha;
  reducedMotion: boolean;
}) {
  const dichos = paths
    .map((path) => {
      const spec = fichaFieldByPath(path);
      if (spec === undefined) return null;
      const cell = fichaCell(ficha, spec);
      return cell === undefined ? null : spec.chip(cell.valor);
    })
    .filter((dicho): dicho is string => dicho !== null);

  if (dichos.length === 0) return null;

  return (
    <motion.p
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.28, delay: reducedMotion ? 0 : 0.1 }}
      className="font-body -mt-2.5 flex items-baseline gap-2 text-[11px] leading-snug text-slate-500 dark:text-slate-400"
    >
      <Sparkles
        aria-hidden="true"
        strokeWidth={1.8}
        className="text-primary-light dark:text-primary-dark size-3 shrink-0 translate-y-0.5"
      />
      <span className="min-w-0">
        <b className="text-primary-light dark:text-primary-dark font-semibold">
          Anotado también:
        </b>{" "}
        {enumerar(dichos)} —{" "}
        {dichos.length === 1 ? "deducido" : "deducidos"} de lo que has contado.
      </span>
    </motion.p>
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

/**
 * Los pasos de la preparación del informe, en el orden en que ocurren.
 *
 * Son las fronteras REALES del cierre —el servidor las emite al cruzarlas, no un
 * temporizador—: el veredicto del motor, la redacción (la parte larga) y la
 * revisión final, que solo se ilumina si la puerta de contrato pidió un segundo
 * borrador. Con la fase en `redaccion`, la revisión queda como pendiente y el
 * informe puede llegar sin pasar por ella: lo normal es que el primer borrador
 * valga.
 */
const CALC_STEPS: Array<{ fase: CalculandoFase; label: string }> = [
  { fase: "veredicto", label: "Revisando tus respuestas" },
  { fase: "redaccion", label: "Redactando el informe" },
  { fase: "revision", label: "Revisión final" },
];

function CalculatingNotice({ fase }: { fase: CalculandoFase }) {
  const actual = CALC_STEPS.findIndex((step) => step.fase === fase);

  return (
    <div
      role="status"
      className="border-primary-light/25 dark:border-primary-dark/25 mt-2 rounded-2xl border bg-white/60 px-4 py-4 dark:bg-white/3"
    >
      <div className="flex items-start gap-3">
        <Loader2
          aria-hidden="true"
          strokeWidth={1.8}
          className="text-primary-light dark:text-primary-dark mt-0.5 size-5 shrink-0 animate-spin motion-reduce:animate-none"
        />
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold text-[#05215e] dark:text-slate-50">
            Estamos preparando tu informe
          </p>
          <p className="font-body mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Tarda menos de un minuto; no cierres esta página.
          </p>
        </div>
      </div>

      <ol className="mt-3.5 grid gap-2 pl-8">
        {CALC_STEPS.map((step, index) => {
          const done = index < actual;
          const current = index === actual;
          return (
            <li
              key={step.fase}
              className={`font-body flex items-center gap-2.5 text-[12.5px] leading-snug ${
                current
                  ? "font-semibold text-slate-800 dark:text-slate-100"
                  : done
                    ? "text-slate-600 dark:text-slate-300"
                    : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {done ? (
                <Check
                  aria-hidden="true"
                  strokeWidth={2.4}
                  className="text-primary-light dark:text-primary-dark size-3.5 shrink-0"
                />
              ) : current ? (
                <span
                  aria-hidden="true"
                  className="bg-primary-light dark:bg-primary-dark size-2 shrink-0 animate-pulse rounded-full motion-reduce:animate-none"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="size-2 shrink-0 rounded-full border border-slate-400/50 dark:border-slate-500/50"
                />
              )}
              <span className="min-w-0">
                {step.label}
                {done ? <span className="sr-only"> (hecho)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
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

/**
 * El compositor, ahora limpio.
 *
 * Las opciones se han ido a la burbuja del mensaje que las motiva, y lo que queda
 * aquí es el campo libre. Su marcador de posición cambia mientras hay opciones:
 * «…o escribe tu propia respuesta». Los puntos iniciales cosen el campo a las filas
 * de arriba y dicen en pantalla lo que hasta ahora solo estaba en un comentario del
 * código fuente — que las opciones aceleran, pero no acotan.
 */
function Composer({
  inputRef,
  draft,
  setDraft,
  hayOpciones,
  pending,
  onSend,
}: {
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  draft: string;
  setDraft: (value: string) => void;
  hayOpciones: boolean;
  pending: boolean;
  onSend: (text: string) => void;
}) {
  const tooLong = draft.length > MAX_MENSAJE_CHARS;
  const canSend = !pending && draft.trim().length > 0 && !tooLong;

  /*
    El alto sigue al contenido, y se mide en un efecto y no en el `onChange`: al
    enviar, `send` vacía el borrador desde fuera, así que el `onChange` no vuelve
    a correr y el alto en línea del último tecleo se quedaba puesto — el campo se
    quedaba de cinco líneas y vacío. Y ese alto sale del hilo, que es de altura
    fija, así que se pagaba en turnos de historia visible.
  */
  useEffect(() => {
    const element = inputRef.current;
    if (element === null) return;

    element.style.height = "auto";
    if (draft.length > 0) {
      element.style.height = `${Math.min(element.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
    }
  }, [draft, inputRef]);

  return (
    <div>
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
          placeholder={
            hayOpciones ? "…o escribe tu propia respuesta" : "Escribe tu respuesta…"
          }
          aria-describedby="interview-composer-hint"
          className="font-body max-h-40 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60 dark:text-slate-100 dark:placeholder:text-slate-500"
          onChange={(event) => setDraft(event.target.value)}
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
        {/*
          La garantía de datos ha subido a la cabecera de apertura. Aquí se repetía
          en cada turno, en gris de 11px, y repetirla la devaluaba: dicha una vez y
          grande, se sostiene.
        */}
        {tooLong
          ? `El mensaje supera los ${MAX_MENSAJE_CHARS.toLocaleString("es-ES")} caracteres. Acórtalo para poder enviarlo.`
          : "Pulsa Intro para enviar."}
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
 * ancho, la ficha al lado del chat deja las dos cosas ilegibles. La barra de abajo
 * mantiene visible el arco y **cuántos datos acaban de llegar** para que la ficha no
 * sea algo que exista solo si a alguien se le ocurre buscarla.
 *
 * El contador pasa de deuda a novedad: antes decía `0 de 28` —lo que falta— y ahora
 * cuenta lo que ha llegado.
 */
function MobileFicha({
  open,
  setOpen,
  ficha,
  highlighted,
  turnosRestantes,
  cerrada,
  nuevos,
  readOnly,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  ficha: Ficha;
  highlighted: ReadonlySet<string>;
  turnosRestantes: number;
  cerrada: boolean;
  nuevos: number;
  readOnly: boolean;
}) {
  const { cerrados, actual } = avanceDeBloques(ficha);
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
      <div className="sticky bottom-0 z-30 -mx-5 mt-3 border-t border-cyan-800/15 bg-[#fbfdff]/92 px-5 py-2.5 backdrop-blur-md sm:-mx-8 sm:px-8 lg:hidden dark:border-cyan-300/15 dark:bg-[#06111f]/92">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark flex w-full items-center gap-3 rounded-xl border border-cyan-800/15 bg-white/65 px-3.5 py-2.5 text-left backdrop-blur-sm transition hover:bg-cyan-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/15 dark:bg-white/4 dark:hover:bg-cyan-300/10"
        >
          {/* El arco sustituye al icono de portapapeles: dice algo, y el icono no. */}
          <FichaArco
            cerrados={cerrados}
            actual={actual}
            cerrada={cerrada}
            size={28}
            compact
          />
          <span className="min-w-0 flex-1">
            <span className="font-body block text-xs font-semibold text-slate-900 dark:text-slate-100">
              Lo que hemos entendido
              {nuevos > 0
                ? ` · ${nuevos === 1 ? "1 dato nuevo" : `${nuevos} datos nuevos`}`
                : ""}
            </span>
            <span className="font-body block truncate text-[11px] text-slate-500 dark:text-slate-400">
              {changedSpec && changedCell
                ? changedSpec.chip(changedCell.valor)
                : /* Ya no se corrige ahí, y en una línea truncada de 11px cada
                     palabra cuesta. */
                  "Toca para verlo"}
            </span>
          </span>
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Lo que hemos entendido"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex flex-col bg-[#fbfdff] lg:hidden dark:bg-[#06111f]"
          >
            <div className="flex h-14 shrink-0 items-center justify-between border-b border-cyan-800/15 px-5 dark:border-cyan-300/15">
              <p className="font-display text-sm font-extrabold text-[#05215e] dark:text-slate-50">
                Lo que hemos entendido
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
                turnosRestantes={turnosRestantes}
                cerrada={cerrada}
                readOnly={readOnly}
              />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}


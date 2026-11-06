"use client";

import {
  ArrowUp,
  Check,
  ChevronDown,
  FileText,
  HeartPulse,
  MessageCircleQuestionMark,
  MousePointer2,
  Paperclip,
  Pill,
  Waves,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  FlowDot,
  Mark,
  ProcessChatVeil,
  PulseLayer,
  drawProgress,
  processBorderClass,
  processCardClass,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  processConsultation,
  processFollowup,
} from "~/app/_components/clinical-process-data";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import type { ConsultationFeatureId } from "../features-data";
import {
  Answer,
  Caret,
  ChatHeader,
  Composer,
  Connector,
  DOT_GAP,
  DOT_TRANSIT,
  Dot,
  answerLength,
  bodyText,
  claimParagraph,
  curvePath,
  curvePoint,
  eyebrow,
  useBoxes,
  verticalCurve,
  type Box,
  type SceneDefinition,
  type SceneProps,
} from "./evidence-scenes";

/*
 * «Consulta clínica» scenes. Same consultation as the evidence group: the
 * 68-year-old patient with CKD who takes ibuprofen, the same committee
 * (Cardiología, Farmacología, Nefrología) and the same answer and citations.
 * UI strings come from the chat (messages/es/chatThread.json).
 */

const enter = (value: number, distance = 8): CSSProperties => ({
  opacity: value,
  transform: `translateY(${distance * (1 - value)}px)`,
});

function UserBubble({
  children,
  style,
  className = "max-w-[88%]",
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      style={style}
      className={`bg-primary-light dark:bg-primary-dark font-body ml-auto w-fit ${className} rounded-2xl rounded-br-md px-4 py-2.5 text-[13px] leading-[22px] text-white dark:text-[#04111e]`}
    >
      {children}
    </div>
  );
}

/** Pointer of the scenes, as in the citations scene. */
export function Pointer({ style }: { style?: CSSProperties }) {
  return (
    <MousePointer2
      aria-hidden="true"
      size={28}
      strokeWidth={1.1}
      className="text-primary-light dark:text-primary-dark pointer-events-none absolute top-0 left-0 z-40 fill-white dark:fill-[#152230]"
      style={style}
    />
  );
}

/** Pointer travelling through measured points, pressing at each arrival. */
export function pointerStyle(
  stops: { at: number; point: { x: number; y: number } }[],
  time: number,
  reduced: boolean,
  presses: number[],
  visible: number,
): CSSProperties {
  if (reduced || stops.length === 0) return { opacity: 0 };
  let point = stops[0]!.point;
  for (let index = 1; index < stops.length; index++) {
    const from = stops[index - 1]!;
    const to = stops[index]!;
    const t = sceneReveal(time, from.at, to.at - from.at, false);
    if (time >= from.at)
      point = {
        x: from.point.x + (to.point.x - from.point.x) * t,
        y: from.point.y + (to.point.y - from.point.y) * t,
      };
  }
  const press = presses.reduce((value, at) => {
    const t = (time - at) / 0.35;
    return t > 0 && t < 1 ? Math.max(value, Math.sin(t * Math.PI)) : value;
  }, 0);
  return {
    opacity: visible,
    transform: `translate(${point.x - 3}px, ${point.y - 3}px) scale(${1 - press * 0.08})`,
  };
}
export const centre = (box?: Box) =>
  box ? { x: box.x + box.w / 2, y: box.y + box.h / 2 } : { x: 0, y: 0 };

/**
 * Expanded composer of the chat (chat-composer): text on top, controls below.
 * Attachments open above the text; the mode picker sits beside the send key.
 */
function ExpandedComposer({
  text,
  placeholder = "Pregunta clínica al comité...",
  typing = false,
  ready = false,
  attachments,
  attachmentsOpen = 0,
  mode,
  modeRef,
  dropping = 0,
  sendPulse = 0,
  className = "",
}: {
  text: string;
  placeholder?: string;
  typing?: boolean;
  ready?: boolean;
  attachments?: ReactNode;
  attachmentsOpen?: number;
  mode?: string;
  modeRef?: (element: HTMLElement | null) => void;
  /** Drop target highlight, 0 to 1. */
  dropping?: number;
  sendPulse?: number;
  className?: string;
}) {
  return (
    <div
      className={`shadow-big-blocks relative overflow-hidden rounded-[22px] border bg-white/85 backdrop-blur-md transition-colors duration-200 dark:bg-[#152230e6]/90 ${dropping > 0.5 ? "border-primary-light/45 dark:border-primary-dark/45 border-dashed" : "dark:border-primary-dark/15 border-cyan-800/15"} ${className}`}
    >
      <PulseLayer value={dropping * 0.6} />
      {attachments && (
        <div
          className="relative grid"
          style={{ gridTemplateRows: `${attachmentsOpen}fr` }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="flex gap-2 px-3 pt-3">{attachments}</div>
          </div>
        </div>
      )}
      <div className="font-body relative min-h-6 px-4 pt-3 text-sm leading-6 break-words text-slate-700 dark:text-slate-200">
        {text || (
          <span className="text-slate-500 dark:text-slate-400">
            {placeholder}
          </span>
        )}
        {typing && <Caret />}
      </div>
      <div className="relative flex items-center gap-1.5 px-2.5 pt-1 pb-2.5">
        <span className="dark:border-primary-dark/15 grid size-9 place-items-center rounded-full border border-cyan-800/15 text-slate-500 dark:text-slate-400">
          <Paperclip size={20} strokeWidth={1.1} />
        </span>
        {mode && (
          <span
            ref={modeRef}
            className="font-body ml-auto inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {mode}
            <ChevronDown size={14} strokeWidth={1.4} />
          </span>
        )}
        <span
          className={`bg-primary-light dark:bg-primary-dark relative grid size-9 place-items-center rounded-full text-white transition-opacity duration-200 dark:text-[#04111e] ${mode ? "" : "ml-auto"} ${ready ? "opacity-100" : "opacity-45"}`}
          style={{ transform: `scale(${1 - sendPulse * 0.1})` }}
        >
          <ArrowUp size={20} strokeWidth={1.1} />
        </span>
      </div>
    </div>
  );
}

/* 08 · Lenguaje natural: the case is typed as it would be told to a colleague. */
const question = processConsultation.question;
const NATURAL_TYPING = 0.4;
const naturalTyped = NATURAL_TYPING + typingDuration(question.length);
const naturalSent = naturalTyped + 0.7;

function NaturalScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    NATURAL_TYPING,
    question.length,
    reduced,
  );
  const sent = reduced || time >= naturalSent;
  const press = (time - (naturalSent - 0.35)) / 0.35;
  const bubble = sceneReveal(time, naturalSent, 0.4, reduced);
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      {sent && (
        <div className="relative px-6">
          {/* The whole case fits between the header and the composer. */}
          <UserBubble style={enter(bubble, 12)} className="max-w-full">
            {question}
          </UserBubble>
        </div>
      )}
      <div className="absolute inset-x-6 bottom-5">
        {sent ? (
          <Composer placeholder="El comité está respondiendo..." />
        ) : (
          <ExpandedComposer
            text={question.slice(0, written)}
            typing={written > 0 && written < question.length}
            ready={written > 0}
            sendPulse={press > 0 && press < 1 ? Math.sin(press * Math.PI) : 0}
          />
        )}
      </div>
    </div>
  );
}

/* 09 · Preguntas de aclaración: the committee asks for the decisive value. */
const clarifyQuestion =
  "¿Cuál es el filtrado glomerular estimado más reciente (mL/min/1,73 m²)?";
const clarifyOptions = ["Menos de 30", "Entre 30 y 59", "60 o más"] as const;
const CLARIFY_CARD = 0.5;
const CLARIFY_TYPING = CLARIFY_CARD + 0.4;
const clarifyTyped = CLARIFY_TYPING + typingDuration(clarifyQuestion.length);
const clarifyOptionsAt = clarifyTyped + 0.2;
const clarifyPointer = clarifyOptionsAt + 0.7;
const clarifyClick = clarifyPointer + 1.1;
const clarifyAnswered = clarifyClick + 0.5;

function ClarifyScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const card = sceneReveal(time, CLARIFY_CARD, 0.4, reduced);
  const written = writtenCharacters(
    time,
    CLARIFY_TYPING,
    clarifyQuestion.length,
    reduced,
  );
  const chosen = reduced || time >= clarifyClick;
  const answered = sceneReveal(time, clarifyAnswered, 0.35, reduced);
  const choice = centre(boxes[1]);
  const pointer = pointerStyle(
    [
      { at: clarifyPointer, point: { x: choice.x - 70, y: choice.y + 46 } },
      { at: clarifyClick - 0.25, point: choice },
    ],
    time,
    reduced,
    [clarifyClick - 0.2],
    sceneReveal(time, clarifyPointer, 0.3, reduced) *
      (1 - sceneReveal(time, clarifyAnswered + 0.3, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className="relative space-y-4 px-6">
        <UserBubble>¿Puede mantener el ibuprofeno a dosis bajas?</UserBubble>
        <section
          ref={target(0)}
          className={`${processCardClass} ${processBorderClass(!chosen && card > 0.5)} relative px-4 py-3.5`}
          style={enter(card)}
        >
          <p className="font-display text-primary-light dark:text-primary-dark inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.16em] uppercase">
            <MessageCircleQuestionMark size={14} strokeWidth={1.4} />
            Pregunta del comité
          </p>
          <p className="font-display text-navy mt-2 min-h-11 text-[13px] leading-[22px] font-semibold dark:text-slate-100">
            {clarifyQuestion.slice(0, written)}
            {written > 0 && written < clarifyQuestion.length && <Caret />}
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {clarifyOptions.map((option, index) => {
              const selected = index === 0 && chosen;
              return (
                <li
                  key={option}
                  ref={index === 0 ? target(1) : undefined}
                  style={{
                    opacity:
                      sceneReveal(
                        time,
                        clarifyOptionsAt + index * 0.12,
                        0.3,
                        reduced,
                      ) * (chosen && !selected ? 0.55 : 1),
                  }}
                  className={`font-body inline-flex h-8 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors duration-200 ${selected ? "border-primary-light/45 bg-primary-light/10 text-primary-light dark:border-primary-dark/45 dark:bg-primary-dark/12 dark:text-primary-dark" : "dark:border-primary-dark/15 border-cyan-800/15 text-slate-700 dark:text-slate-200"}`}
                >
                  {selected && <Check size={14} strokeWidth={1.8} />}
                  {option}
                </li>
              );
            })}
          </ul>
          <div
            className="grid"
            style={{ gridTemplateRows: `${answered}fr`, opacity: answered }}
          >
            <p className="font-body min-h-0 overflow-hidden pt-2.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Respuesta: menos de 30 mL/min/1,73 m²
            </p>
          </div>
        </section>
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 10 · Seguimiento: a short question that relies on the case already told. */
const followupQuestion = "¿Cambia algo si además toma un IECA?";
const followupParagraph = processFollowup.finalOpinion.split("\n\n")[5]!;
const followupLength = answerLength(followupParagraph);
const FOLLOWUP_TYPING = 0.6;
const followupSent =
  FOLLOWUP_TYPING + typingDuration(followupQuestion.length) + 0.5;
const followupAnswer = followupSent + 0.9;
const followupEnd = followupAnswer + typingDuration(followupLength);

function FollowupScene({ time, reduced }: SceneProps) {
  const asked = writtenCharacters(
    time,
    FOLLOWUP_TYPING,
    followupQuestion.length,
    reduced,
  );
  const sent = reduced || time >= followupSent;
  const written = writtenCharacters(
    time,
    followupAnswer,
    followupLength,
    reduced,
  );
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      {/* The thread grows from the bottom; earlier turns scroll away. */}
      <div className="absolute inset-x-0 top-14 bottom-[84px] mask-[linear-gradient(to_bottom,transparent,black_28px)] px-6">
        <div
          className={`flex h-full flex-col justify-end gap-3 overflow-hidden ${bodyText}`}
        >
          <p className="shrink-0 opacity-70">
            <Answer text={claimParagraph} />
          </p>
          {sent && (
            <div
              className="shrink-0"
              style={enter(sceneReveal(time, followupSent, 0.35, reduced), 12)}
            >
              <UserBubble>{followupQuestion}</UserBubble>
            </div>
          )}
          {written > 0 && (
            <p className="shrink-0">
              <Answer text={followupParagraph} written={written} />
            </p>
          )}
        </div>
      </div>
      <div className="absolute inset-x-6 bottom-5">
        {sent ? (
          <Composer
            placeholder={
              written < followupLength
                ? "El comité está respondiendo..."
                : "Pregunta clínica al comité..."
            }
          />
        ) : (
          <ExpandedComposer
            text={followupQuestion.slice(0, asked)}
            typing={asked > 0 && asked < followupQuestion.length}
            ready={asked > 0}
          />
        )}
      </div>
    </div>
  );
}

/* 11 · Comité por especialidad: each expert reads its own corpus. */
const committee = [
  { name: "Cardiología", icon: HeartPulse, corpus: "Cardiología" },
  { name: "Farmacología", icon: Pill, corpus: "Farmacología" },
  { name: "Nefrología", icon: Waves, corpus: "Nefrología" },
] as const;
const COMMITTEE_EXPERTS = 1.1;
const COMMITTEE_CORPUS = 2.5;
const COMMITTEE_READING = 3.5;
const COMMITTEE_RETURN = 4.9;
const committeeDone = COMMITTEE_RETURN + 2 * DOT_GAP + DOT_TRANSIT + 0.15;

function CommitteeScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(7);
  const ready = boxes.length === 7;
  const node = sceneReveal(time, 0.2, 0.35, reduced);
  const reading =
    !reduced && time >= COMMITTEE_READING && time < COMMITTEE_READING + 1.2;
  const readPulse = reading
    ? pulseProgress(time, COMMITTEE_READING, 0.9) * 0.8
    : 0;
  const done = reduced || time >= committeeDone;
  const status = done
    ? "3 aportaciones recibidas"
    : time >= COMMITTEE_RETURN
      ? "Recibiendo aportaciones"
      : time >= COMMITTEE_CORPUS
        ? "Comité seleccionado"
        : time >= COMMITTEE_EXPERTS
          ? "Seleccionando expertos"
          : "Recibiendo la consulta";
  const dots = (curve: ReturnType<typeof verticalCurve>, start: number) =>
    !reduced &&
    [0, 1, 2].map((dot) => {
      const t = (time - start - dot * DOT_GAP) / DOT_TRANSIT;
      if (t <= 0 || t >= 1) return null;
      return <FlowDot key={dot} {...curvePoint(curve, t)} />;
    });
  const backwards = ([a, b, c, d]: ReturnType<
    typeof verticalCurve
  >): ReturnType<typeof verticalCurve> => [d, c, b, a];
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-between px-6 py-6"
    >
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {ready &&
          committee.map((_, index) => {
            const toExpert = verticalCurve(boxes[0]!, boxes[1 + index]!);
            const toCorpus = verticalCurve(
              boxes[1 + index]!,
              boxes[4 + index]!,
            );
            const expertAt = COMMITTEE_EXPERTS + index * 0.2;
            const corpusAt = COMMITTEE_CORPUS + index * 0.2;
            return (
              <g key={index}>
                <Connector
                  d={curvePath(toExpert)}
                  draw={drawProgress(time, expertAt, 0.5, reduced)}
                  active={!reduced && time >= COMMITTEE_RETURN && !done}
                />
                <Connector
                  d={curvePath(toCorpus)}
                  draw={drawProgress(time, corpusAt, 0.5, reduced)}
                  active={reading}
                />
                <g
                  style={{
                    opacity: drawProgress(time, corpusAt, 0.5, reduced),
                  }}
                >
                  <Dot {...curvePoint(toCorpus, 0.5)} />
                </g>
                {dots(toExpert, expertAt + 0.5)}
                {dots(toCorpus, corpusAt + 0.5)}
                {dots(backwards(toExpert), COMMITTEE_RETURN + index * 0.12)}
              </g>
            );
          })}
      </svg>
      <div className="flex justify-center" style={enter(node)}>
        <div
          ref={target(0)}
          className={`${processBorderClass(!done && time >= COMMITTEE_EXPERTS)} relative flex h-[58px] w-[236px] items-center gap-3 rounded-2xl border bg-white/95 px-4 shadow-[0_8px_24px_rgba(0,109,121,0.10)] dark:bg-[#152230]`}
        >
          <PulseLayer
            value={
              done && !reduced && time < committeeDone + 1.6
                ? pulseProgress(time, committeeDone, 1)
                : 0
            }
          />
          <Mark className="relative size-7" />
          <div className="relative min-w-0">
            <p className="font-display text-navy text-sm font-semibold whitespace-nowrap dark:text-slate-50">
              Comité clínico
            </p>
            <p className="font-body text-xs leading-5 whitespace-nowrap text-slate-500 dark:text-slate-400">
              {status}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {committee.map((expert, index) => {
          const appear = sceneReveal(
            time,
            COMMITTEE_EXPERTS + index * 0.2 + 0.4,
            0.25,
            reduced,
          );
          const answered =
            reduced || time >= COMMITTEE_RETURN + index * 0.12 + 0.2;
          return (
            <div
              key={expert.name}
              ref={target(1 + index)}
              className={`${processCardClass} ${processBorderClass(reading)} relative flex flex-col items-center gap-1 px-2 py-2.5`}
              style={enter(appear)}
            >
              <PulseLayer value={readPulse} />
              <span className="text-primary-light dark:text-primary-dark relative grid size-7 place-items-center">
                <expert.icon size={20} strokeWidth={1.1} aria-hidden="true" />
              </span>
              <p className="font-display text-navy relative text-[13px] font-semibold dark:text-slate-100">
                {expert.name}
              </p>
              <p className="font-body text-primary-light dark:text-primary-dark relative text-[10px] leading-4 whitespace-nowrap">
                {answered
                  ? "Aportación enviada"
                  : time >= COMMITTEE_READING + 1.2
                    ? "Corpus consultado"
                    : time >= COMMITTEE_CORPUS + index * 0.2
                      ? "Consultando corpus"
                      : "Consulta dirigida"}
              </p>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {committee.map((expert, index) => (
          <div key={expert.corpus} className="flex justify-center">
            <div
              ref={target(4 + index)}
              className={`${processCardClass} ${processBorderClass(reading)} relative flex w-[92px] flex-col items-center gap-1 py-2.5`}
              style={enter(
                sceneReveal(
                  time,
                  COMMITTEE_CORPUS + index * 0.2 + 0.4,
                  0.25,
                  reduced,
                ),
              )}
            >
              <PulseLayer value={readPulse} />
              <FileText
                size={20}
                strokeWidth={1.1}
                aria-hidden="true"
                className="text-primary-light dark:text-primary-dark relative"
              />
              <span className="font-body relative text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                Corpus
              </span>
              <span className="font-display text-navy relative text-[10px] leading-4 font-semibold dark:text-slate-100">
                {expert.corpus}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 12 · Modos de respuesta: the picker beside the send key (chat-mode-picker). */
const modesQuestion =
  "¿Qué ajustes de la medicación conviene revisar en este paciente?";
const modes = [
  { name: "Estándar", description: "Rápido" },
  { name: "Precisión", description: "Más exhaustivo" },
] as const;
const MODES_TYPING = 0.4;
const modesTyped = MODES_TYPING + typingDuration(modesQuestion.length);
const modesPointer = modesTyped + 0.3;
const modesOpen = modesPointer + 1;
const modesPick = modesOpen + 1.1;
const modesClosed = modesPick + 0.45;

function ModesScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const written = writtenCharacters(
    time,
    MODES_TYPING,
    modesQuestion.length,
    reduced,
  );
  const picked = reduced || time >= modesPick;
  const menu = reduced
    ? 0
    : sceneReveal(time, modesOpen, 0.2, false) *
      (1 - sceneReveal(time, modesClosed, 0.2, false));
  const trigger = centre(boxes[0]);
  const option = centre(boxes[1]);
  const pointer = pointerStyle(
    [
      { at: modesPointer, point: { x: trigger.x - 90, y: trigger.y - 70 } },
      { at: modesOpen - 0.2, point: trigger },
      { at: modesPick - 0.2, point: { x: option.x + 40, y: option.y } },
    ],
    time,
    reduced,
    [modesOpen - 0.2, modesPick - 0.15],
    sceneReveal(time, modesPointer, 0.3, reduced) *
      (1 - sceneReveal(time, modesClosed + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <p className={`relative px-6 opacity-70 ${bodyText}`}>
        <Answer text={claimParagraph} />
      </p>
      <div className="absolute inset-x-6 bottom-5">
        <ExpandedComposer
          text={modesQuestion.slice(0, written)}
          typing={written > 0 && written < modesQuestion.length}
          ready={written > 0}
          mode={picked ? "Precisión" : "Estándar"}
          modeRef={target(0)}
        />
        {/* Mode menu, opened above the trigger. */}
        <div
          role="presentation"
          className="shadow-big-blocks dark:border-primary-dark/15 absolute right-10 bottom-[52px] z-30 grid w-52 gap-0.5 rounded-2xl border border-cyan-800/15 bg-white/95 p-1.5 backdrop-blur-md dark:bg-[#152230]/95"
          style={{
            opacity: menu,
            transform: `translateY(${-8 * menu}px)`,
            visibility: menu > 0 ? "visible" : "hidden",
          }}
        >
          <p className="font-display px-3 pt-1.5 pb-1 text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            Modo de respuesta
          </p>
          {modes.map((mode, index) => {
            const selected = picked ? index === 1 : index === 0;
            const hovered = index === 1 && !reduced && time >= modesPick - 0.5;
            return (
              <div
                key={mode.name}
                ref={index === 1 ? target(1) : undefined}
                className={`grid grid-cols-[minmax(0,1fr)_16px] items-start gap-2 rounded-xl px-3 py-2 ${hovered ? "bg-primary-light/8 dark:bg-primary-dark/10" : ""}`}
              >
                <span className="grid min-w-0 gap-0.5">
                  <span className="font-body text-navy text-sm font-medium dark:text-slate-50">
                    {mode.name}
                  </span>
                  <span className="font-body text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {mode.description}
                  </span>
                </span>
                {selected && (
                  <Check
                    size={16}
                    strokeWidth={1.8}
                    className="text-primary-light dark:text-primary-dark mt-0.5"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 13 · Progreso visible: expert cards of the chat (expert-progress). */
const progressExperts = [
  {
    name: "Cardiología",
    source: "Manual ProMIR · Cardiología",
    pages: "96, 98",
  },
  {
    name: "Farmacología",
    source: "Manual ProMIR · Nefrología",
    pages: "412",
  },
  {
    name: "Nefrología",
    source: "Manual ProMIR · Nefrología",
    pages: "377, 381",
  },
] as const;
const PROGRESS_STEP = 0.45;
const progressSources = (index: number) => 1.5 + index * 0.55;
const progressDone = (index: number) => 3.4 + index * 0.5;

function ProgressScene({ time, reduced }: SceneProps) {
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ul className="relative grid gap-2 px-6 pt-6">
        {progressExperts.map((expert, index) => {
          const appear = sceneReveal(
            time,
            0.3 + index * PROGRESS_STEP,
            0.3,
            reduced,
          );
          const sources = sceneReveal(
            time,
            progressSources(index),
            0.4,
            reduced,
          );
          const done = reduced || time >= progressDone(index);
          return (
            <li
              key={expert.name}
              className="dark:border-primary-dark/15 relative rounded-[14px] border border-cyan-800/15 bg-white/75 px-3.5 py-2.5 backdrop-blur-sm dark:bg-[#152230]/72"
              style={enter(appear)}
            >
              <PulseLayer
                value={
                  done && !reduced && time < progressDone(index) + 1
                    ? pulseProgress(time, progressDone(index), 1) * 0.7
                    : 0
                }
              />
              <div className="relative flex items-start justify-between gap-3">
                <span className="font-display text-navy text-sm leading-5 font-semibold dark:text-slate-100">
                  {expert.name}
                </span>
                {done ? (
                  <span className="font-body text-primary-light dark:text-primary-dark inline-flex items-center gap-1 text-xs leading-5 font-semibold">
                    <Check size={14} strokeWidth={1.8} />
                    Respuesta recibida
                  </span>
                ) : (
                  <span className="font-body inline-flex items-center gap-1.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    <span
                      style={{
                        opacity: reduced
                          ? 1
                          : 0.45 + 0.55 * pulseProgress(time, 0, 1.1),
                      }}
                    >
                      <Mark className="size-3.5" />
                    </span>
                    Consultando…
                  </span>
                )}
              </div>
              <div
                className="relative grid"
                style={{ gridTemplateRows: `${sources}fr`, opacity: sources }}
              >
                <div className="min-h-0 overflow-hidden">
                  <p className={`${eyebrow} pt-2`}>Fuentes consultadas</p>
                  <p className="mt-1.5 flex min-w-0 items-center gap-2.5">
                    <span className="border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark grid size-5 shrink-0 place-items-center rounded-md border">
                      <FileText size={12} strokeWidth={1.4} />
                    </span>
                    <span className="font-body min-w-0 truncate text-xs leading-5 text-slate-600 dark:text-slate-400">
                      {expert.source} · pág. {expert.pages}
                    </span>
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* 14 · Imágenes adjuntas: an ECG is dragged onto the composer. */
const imageQuestion = "Adjunto el ECG de hoy. ¿Hay signos de hiperpotasemia?";
const imageName = "ecg-12-derivaciones.png";
const IMAGE_DRAG = 0.5;
const IMAGE_DROP = IMAGE_DRAG + 1.4;
const IMAGE_TYPING = IMAGE_DROP + 0.8;
const imageTyped = IMAGE_TYPING + typingDuration(imageQuestion.length);

/** ECG strip with peaked T waves, drawn for the scene. */
function EcgStrip({ className = "" }: { className?: string }) {
  const beat = (x: number) =>
    `L ${x + 6} 26 Q ${x + 9} 22 ${x + 12} 26 L ${x + 15} 26 L ${x + 17} 29 L ${x + 20} 6 L ${x + 23} 33 L ${x + 26} 26 L ${x + 30} 26 L ${x + 34} 9 L ${x + 38} 26`;
  return (
    <svg
      viewBox="0 0 120 40"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`bg-[linear-gradient(rgba(8,145,178,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.12)_1px,transparent_1px)] bg-size-[8px_8px] ${className}`}
    >
      <path
        d={`M 0 26 ${beat(0)} ${beat(40)} ${beat(80)} L 120 26`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function ImagesScene({ time, reduced }: SceneProps) {
  const lift = sceneReveal(time, 0.15, 0.35, reduced);
  const travel = reduced ? 1 : drawProgress(time, IMAGE_DRAG, 1.2, false);
  const dropped = reduced || time >= IMAGE_DROP;
  const over = !reduced && time >= IMAGE_DRAG + 0.8 && time < IMAGE_DROP;
  const attachments = sceneReveal(time, IMAGE_DROP, 0.35, reduced);
  const written = writtenCharacters(
    time,
    IMAGE_TYPING,
    imageQuestion.length,
    reduced,
  );
  // Artboard coordinates: from the upper right towards the composer.
  const start = { x: 236, y: 70 };
  const end = { x: 60, y: 196 };
  const x = start.x + (end.x - start.x) * travel;
  const y = start.y + (end.y - start.y) * travel;
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className="absolute inset-x-6 bottom-5">
        <ExpandedComposer
          text={imageQuestion.slice(0, written)}
          typing={written > 0 && written < imageQuestion.length}
          ready={dropped}
          dropping={over ? 1 : 0}
          attachmentsOpen={attachments}
          attachments={
            <div
              className="dark:border-primary-dark/15 relative flex items-center gap-2.5 rounded-xl border border-cyan-800/15 bg-white p-1.5 pr-2 dark:bg-[#152230]"
              style={{ opacity: attachments }}
            >
              <EcgStrip className="text-primary-light dark:text-primary-dark h-10 w-14 rounded-md bg-white dark:bg-[#06111f]" />
              <span className="font-body text-navy max-w-36 truncate text-xs font-medium dark:text-slate-100">
                {imageName}
              </span>
              <X
                size={16}
                strokeWidth={1.4}
                className="text-slate-400"
                aria-hidden="true"
              />
            </div>
          }
        />
      </div>
      {!dropped && (
        <div
          className="pointer-events-none absolute top-0 left-0 z-30"
          style={{
            opacity:
              lift * (1 - sceneReveal(time, IMAGE_DROP - 0.2, 0.2, reduced)),
            transform: `translate(${x}px, ${y}px) scale(${1 - 0.25 * travel}) rotate(${-3 * (1 - travel)}deg)`,
            transformOrigin: "0 0",
          }}
        >
          <div className="dark:border-primary-dark/15 w-[150px] rounded-xl border border-cyan-800/15 bg-white p-2 shadow-[0_16px_40px_rgba(0,109,121,0.16)] dark:bg-[#152230]">
            <EcgStrip className="text-primary-light dark:text-primary-dark h-16 w-full rounded-md bg-white dark:bg-[#06111f]" />
            <p className="font-body mt-1.5 truncate text-[10px] text-slate-500 dark:text-slate-400">
              {imageName}
            </p>
          </div>
          <MousePointer2
            aria-hidden="true"
            size={28}
            strokeWidth={1.1}
            className="text-primary-light dark:text-primary-dark absolute right-6 bottom-2 fill-white dark:fill-[#152230]"
          />
        </div>
      )}
    </div>
  );
}

export const consultationScenes: Record<
  ConsultationFeatureId,
  SceneDefinition
> = {
  natural: {
    render: (props) => <NaturalScene {...props} />,
    surface: "chat",
    duration: naturalSent + 1.6,
  },
  clarify: {
    render: (props) => <ClarifyScene {...props} />,
    surface: "chat",
    duration: clarifyAnswered + 1.4,
  },
  followup: {
    render: (props) => <FollowupScene {...props} />,
    surface: "chat",
    duration: followupEnd + 1.2,
  },
  committee: {
    render: (props) => <CommitteeScene {...props} />,
    surface: "process",
    duration: committeeDone + 1.8,
  },
  modes: {
    render: (props) => <ModesScene {...props} />,
    surface: "chat",
    duration: modesClosed + 1.2,
  },
  progress: {
    render: (props) => <ProgressScene {...props} />,
    surface: "chat",
    duration: progressDone(2) + 1.4,
  },
  images: {
    render: (props) => <ImagesScene {...props} />,
    surface: "chat",
    duration: imageTyped + 1.2,
  },
};

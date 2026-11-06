"use client";

import {
  ArrowUp,
  Archive,
  BookOpen,
  FileCheck2,
  FileText,
  FileX2,
  History,
  Layers,
  ListTree,
  Maximize2,
  MousePointer2,
  Paperclip,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  useId,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  FlowDot,
  Mark,
  ProcessChatVeil,
  ProcessIcon,
  PulseLayer,
  drawProgress,
  processBorderClass,
  processCardClass,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  processAnswerParagraphs,
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import {
  processSceneReferences,
  sceneReferenceForAnchor,
} from "~/app/_components/clinical-scene-references";
import { evidenceDocumentContext as sourceText } from "~/app/_components/evidence-document-context";
import type { EvidenceFeatureId } from "../features-data";
import "./evidence-scenes.css";

/*
 * Scenes in the visual language of /plataforma (clinical-process-*,
 * clinical-evidence-scene): the same consultation, the same answer, the same
 * references and the same source passage run through all seven cards.
 */

export const claimParagraph = processAnswerParagraphs[2]!;
const precipitantParagraph = processAnswerParagraphs[1]!;
export const claimReference = sceneReferenceForAnchor("c73b77")!;
export const sourceTitle = "Manual ProMIR · Nefrología";
const sourceChapter = "Riesgo cardiovascular y enfermedad renal";
const quoted = "Se debe evitar el uso de AINE en la insuficiencia renal.";
const passageRest = sourceText.nsaids.slice(quoted.length);

export const eyebrow =
  "font-display text-primary-light dark:text-primary-dark text-[9px] font-bold tracking-[0.16em] uppercase";
export const bodyText =
  "font-body text-[13px] leading-[22px] text-slate-600 dark:text-slate-300";

/** Selected-citation state: tint, click ring and approaching pointer. */
type CitationCue = {
  tint: number;
  click: number;
  pointer: { opacity: number; approach: number; press: number };
};

/** Answer text with ⟦anchor⟧ markers rendered as the scenes' superscripts. */
const answerParts = (text: string) =>
  text.split(/(⟦[^⟧]+⟧|\*\*[^*]+\*\*)/g).filter(Boolean);
const partText = (part: string) =>
  part.startsWith("⟦")
    ? `[${sceneReferenceForAnchor(part.slice(1, -1))!.order}]`
    : part.startsWith("**")
      ? part.slice(2, -2)
      : part;
/** Characters shown while typing, citations counted as «[n]». */
export const answerLength = (text: string) =>
  answerParts(text).reduce((sum, part) => sum + partText(part).length, 0);

export function Caret() {
  return (
    <span
      aria-hidden="true"
      className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-3.5 w-px align-middle"
    />
  );
}

export function Answer({
  text,
  selected,
  cue,
  written,
}: {
  text: string;
  selected?: number;
  cue?: CitationCue;
  /** Characters typed so far, as the chat streams the answer. */
  written?: number;
}) {
  const total = answerLength(text);
  let budget = written ?? total;
  return (
    <>
      {answerParts(text).map((part, index) => {
        const length = partText(part).length;
        const count = Math.min(budget, length);
        budget = Math.max(0, budget - length);
        // A citation appears once its whole marker has been reached.
        if (count < length && (part.startsWith("⟦") || count === 0))
          return null;
        if (count < length)
          return part.startsWith("**") ? (
            <strong
              key={index}
              className="text-navy font-semibold dark:text-slate-100"
            >
              {partText(part).slice(0, count)}
            </strong>
          ) : (
            <span key={index}>{part.slice(0, count)}</span>
          );
        if (part.startsWith("⟦")) {
          const order = sceneReferenceForAnchor(part.slice(1, -1))!.order;
          const active = order === selected;
          const tint = active ? (cue?.tint ?? 1) : 0;
          const ring =
            active && cue && cue.click > 0 && cue.click < 1
              ? Math.sin(cue.click * Math.PI)
              : 0;
          const pointer = active ? cue?.pointer : undefined;
          return (
            <span
              key={index}
              data-scene-citation={order}
              className="text-primary-light dark:text-primary-dark relative inline-flex rounded-sm px-0.5 align-super text-[10px] leading-none font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, currentColor ${tint * 15}%, transparent)`,
              }}
            >
              [{order}]
              {active && (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-1/2 size-11 rounded-full bg-current"
                  style={{
                    opacity: ring * 0.15,
                    transform: `translate(-50%, -50%) scale(${0.35 + (cue?.click ?? 1) * 0.65})`,
                  }}
                />
              )}
              {pointer && pointer.opacity > 0 && (
                <MousePointer2
                  aria-hidden="true"
                  size={28}
                  strokeWidth={1.1}
                  className="text-primary-light dark:text-primary-dark absolute top-1/2 left-1/2 fill-white dark:fill-[#152230]"
                  style={{
                    opacity: pointer.opacity,
                    // A short reading gesture, then a deliberate approach.
                    transform: `translate(${2 - 96 * (1 - pointer.approach)}px, ${2 + 54 * (1 - pointer.approach)}px) scale(${1 - pointer.press * 0.08})`,
                  }}
                />
              )}
            </span>
          );
        }
        if (part.startsWith("**"))
          return (
            <strong
              key={index}
              className="text-navy font-semibold dark:text-slate-100"
            >
              {part.slice(2, -2)}
            </strong>
          );
        return <span key={index}>{part}</span>;
      })}
      {written !== undefined && written > 0 && written < total && <Caret />}
    </>
  );
}

export function ChatHeader() {
  return (
    <div className="relative flex h-14 items-center gap-2.5 px-6">
      <Mark className="size-6" />
      <span className="font-display text-navy text-sm font-semibold dark:text-slate-100">
        BinPar
      </span>
    </div>
  );
}

export function Composer({
  placeholder = "Pregunta clínica al comité...",
}: {
  placeholder?: string;
}) {
  return (
    <div className="shadow-big-blocks dark:border-primary-dark/15 relative grid h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] items-center overflow-hidden rounded-[28px] border border-cyan-800/15 bg-white/85 backdrop-blur-md dark:bg-[#152230e6]/90">
      <span className="dark:border-primary-dark/15 grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:text-slate-400">
        <Paperclip size={20} strokeWidth={1.1} />
      </span>
      <span className="font-body min-w-0 truncate text-sm leading-6 text-slate-500 dark:text-slate-400">
        {placeholder}
      </span>
      <span className="bg-primary-light dark:bg-primary-dark grid size-9 place-items-center place-self-center rounded-full text-white opacity-45 dark:text-[#04111e]">
        <ArrowUp size={20} strokeWidth={1.1} />
      </span>
    </div>
  );
}

function Bibliography({
  time,
  reduced,
  start,
  focus,
}: {
  time: number;
  reduced: boolean;
  /** Reveal start of the list. */
  start: number;
  /** Progress of the focus on the claim's reference, 0 to 1. */
  focus: number;
}) {
  return (
    <section
      className="dark:border-primary-dark/15 border-t border-cyan-800/15 pt-3"
      style={{ opacity: sceneReveal(time, start, 0.35, reduced) }}
    >
      <p className="font-display text-primary-light dark:text-primary-dark text-[11px] font-bold tracking-[0.16em] uppercase">
        Bibliografía
      </p>
      <ol className="mt-3 space-y-2">
        {processSceneReferences.map((reference, index) => {
          const selected = reference.order === claimReference.order;
          return (
            <li
              key={reference.order}
              className="flex items-start gap-2.5"
              style={{
                opacity: sceneReveal(
                  time,
                  start + 0.3 + index * 0.12,
                  0.3,
                  reduced,
                ),
              }}
            >
              <span
                className={`font-display relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-md border text-[10px] font-semibold transition-colors duration-200 ${selected && focus > 0.5 ? "border-primary-light/40 text-primary-light dark:border-primary-dark/45 dark:text-primary-dark" : "border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark"}`}
              >
                {selected && <PulseLayer value={focus * 0.8} />}
                <span className="relative">{reference.order}</span>
              </span>
              <span className="font-body min-w-0 flex-1 truncate pt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400">
                {reference.title}.
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Source panel of the evidence scene: tab, header and document body. */
function SourcePanel({
  children,
  notice,
}: {
  children: ReactNode;
  notice?: ReactNode;
}) {
  return (
    <div className="dark:border-primary-dark/15 flex h-full min-w-0 flex-col overflow-hidden bg-white dark:bg-[#152230]">
      <div className="vpe-tabs dark:border-primary-dark/15 flex h-11 shrink-0 items-end border-b border-cyan-800/10 bg-[#e8f2f7]/30 px-2 pt-1 dark:bg-[#06111f]/45">
        <div className="vpe-tab text-navy relative -mb-px flex h-10 max-w-60 min-w-0 flex-1 items-center gap-1.5 rounded-t-md border border-b-0 bg-white px-2.5 dark:bg-[#152230] dark:text-slate-100">
          <FileText size={20} strokeWidth={1.1} className="-mt-1 shrink-0" />
          <span className="font-body -mt-1 min-w-0 flex-1 truncate text-[11px] font-semibold">
            {sourceTitle}
          </span>
          <X
            size={20}
            strokeWidth={1.1}
            className="-mt-1 shrink-0 text-slate-400"
          />
        </div>
        <span className="mb-1 ml-auto grid size-8 shrink-0 place-items-center text-slate-600 dark:text-slate-300">
          <X size={20} strokeWidth={1.1} />
        </span>
      </div>
      <header className="dark:border-primary-dark/15 flex min-w-0 shrink-0 items-center gap-2 border-b border-cyan-800/10 bg-white px-4 py-3 dark:bg-[#152230]">
        <div className="min-w-0 flex-1">
          <p className={eyebrow}>Fuente de consulta</p>
          <p className="font-display text-navy mt-0.5 truncate text-sm font-semibold dark:text-slate-100">
            {sourceTitle}
          </p>
        </div>
        <span className="font-body flex shrink-0 items-center gap-1.5 rounded-full px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <Maximize2 size={20} strokeWidth={1.1} />
          <span>Ver documento completo</span>
        </span>
      </header>
      {notice}
      <div className="font-body min-h-0 flex-1 overflow-hidden px-5 pt-5 text-[13px] leading-6 text-slate-700 dark:text-slate-300">
        {children}
      </div>
    </div>
  );
}

export function Passage({ highlight = 1 }: { highlight?: number }) {
  return (
    <>
      <h3
        data-passage-heading=""
        className="font-display text-navy mb-3 text-sm font-semibold dark:text-slate-100"
      >
        Antiinflamatorios no esteroideos
      </h3>
      <p>
        <mark
          className="vpe-highlight rounded-sm text-inherit"
          style={{ "--vpe-highlight": highlight } as CSSProperties}
        >
          {quoted}
        </mark>
        {passageRest}
      </p>
      <p className="mt-4">{sourceText.interactions}</p>
    </>
  );
}

export function SceneCard({
  icon,
  label,
  title,
  active = false,
  dashed = false,
  pulse = 0,
  className = "",
  style,
  children,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  active?: boolean;
  dashed?: boolean;
  pulse?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  return (
    <div
      style={style}
      className={`${processCardClass} ${processBorderClass(active)} relative p-3.5 ${dashed ? "border-dashed" : ""} ${active ? "shadow-[0_8px_24px_rgba(0,109,121,0.10)]" : ""} ${className}`}
    >
      <PulseLayer value={pulse} />
      <div className="relative flex items-center gap-2.5">
        <span className="text-primary-light dark:text-primary-dark grid size-7 shrink-0 place-items-center">
          <ProcessIcon icon={icon} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
            {label}
          </p>
          <p className="font-display text-navy mt-0.5 truncate text-[13px] font-semibold dark:text-slate-100">
            {title}
          </p>
        </div>
      </div>
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}

/** Dotted connector; `draw` reveals it along its length, as in the synthesis scene. */
export function Connector({
  d,
  active = false,
  draw = 1,
}: {
  d: string;
  active?: boolean;
  draw?: number;
}) {
  const mask = useId();
  return (
    <>
      <mask id={mask} maskUnits="userSpaceOnUse">
        <path
          d={d}
          fill="none"
          stroke="white"
          strokeWidth="6"
          pathLength="1"
          strokeDasharray="1 1"
          strokeDashoffset={1 - draw}
        />
      </mask>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={active ? 1.8 : 1.25}
        strokeDasharray="3 4"
        opacity={active ? 0.8 : 0.45}
        mask={`url(#${mask})`}
      />
    </>
  );
}
export function Dot({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />
      <circle cx={x} cy={y} r="2.2" fill="currentColor" />
    </g>
  );
}

const precipitantLength = answerLength(precipitantParagraph);
const claimLength = answerLength(claimParagraph);
const CITATIONS_TYPING_START = 0.5;
const citationsTyped =
  CITATIONS_TYPING_START + typingDuration(precipitantLength + claimLength);

function CitationsScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    CITATIONS_TYPING_START,
    precipitantLength + claimLength,
    reduced,
  );
  const typed = written >= precipitantLength + claimLength;
  const approach = sceneReveal(time, citationsTyped + 0.9, 0.9, reduced);
  const click = reduced
    ? 1
    : Math.max(0, Math.min(1, (time - (citationsTyped + 1.9)) / 0.7));
  const cue: CitationCue = {
    tint: sceneReveal(time, citationsTyped + 1.9, 0.25, reduced),
    click,
    pointer: {
      opacity: sceneReveal(time, citationsTyped + 0.6, 0.35, reduced),
      approach,
      press: click > 0 && click < 1 ? Math.sin(click * Math.PI) : 0,
    },
  };
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative space-y-3 px-6 ${bodyText}`}>
        <p>
          <Answer
            text={precipitantParagraph}
            written={Math.min(written, precipitantLength)}
          />
        </p>
        {written > precipitantLength && (
          <p>
            <Answer
              text={claimParagraph}
              selected={claimReference.order}
              cue={cue}
              written={written - precipitantLength}
            />
          </p>
        )}
      </div>
      <div className="absolute inset-x-6 bottom-5">
        <Composer
          placeholder={
            typed
              ? "Pregunta clínica al comité..."
              : "El comité está respondiendo..."
          }
        />
      </div>
    </div>
  );
}

const BIBLIOGRAPHY_TYPING_START = 0.3;
// The list follows the typed answer, as in the evidence scene.
const bibliographyStart =
  BIBLIOGRAPHY_TYPING_START + typingDuration(claimLength) + 0.25;
const bibliographyFocus = bibliographyStart + 1.2;

function BibliographyScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    BIBLIOGRAPHY_TYPING_START,
    claimLength,
    reduced,
  );
  const focus = sceneReveal(time, bibliographyFocus, 0.4, reduced);
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="mb-3">
          <Answer
            text={claimParagraph}
            selected={claimReference.order}
            written={written}
            cue={{
              tint: focus,
              click: 1,
              pointer: { opacity: 0, approach: 1, press: 0 },
            }}
          />
        </p>
        <Bibliography
          time={time}
          reduced={reduced}
          start={bibliographyStart}
          focus={focus}
        />
      </div>
    </div>
  );
}

function ViewerScene({ time, reduced }: SceneProps) {
  const content = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  useLayoutEffect(() => {
    const heading = content.current?.querySelector<HTMLElement>(
      "[data-passage-heading]",
    );
    if (heading) setOffset(heading.offsetTop);
  }, []);
  // As in the evidence scene: the document opens, scrolls to the cited
  // section and the passage highlight grows.
  const opened = sceneReveal(time, 0.2, 0.4, reduced);
  const located = sceneReveal(time, 1, 0.8, reduced);
  const highlight = sceneReveal(time, 2, 0.4, reduced);
  return (
    <SourcePanel>
      <div
        ref={content}
        className="relative"
        style={{
          opacity: opened,
          transform: `translateY(${-offset * located}px)`,
        }}
      >
        <h3 className="font-display text-navy mb-3 text-sm font-semibold dark:text-slate-100">
          Dosis de fármacos y riñón
        </h3>
        <p>{sourceText.dosing}</p>
        <ul className="my-4 list-disc space-y-2 pl-4">
          <li>Disminuyendo la dosis.</li>
          <li>Aumentando el intervalo entre las dosis.</li>
        </ul>
        <div className="h-3" />
        <Passage highlight={highlight} />
      </div>
    </SourcePanel>
  );
}

function UpdatesScene({ time, reduced }: SceneProps) {
  const notice = sceneReveal(time, 1, 0.45, reduced);
  const alerting = !reduced && time >= 1.5 && time < 3.5;
  return (
    <SourcePanel
      notice={
        <div
          className="grid shrink-0 overflow-hidden"
          style={{ gridTemplateRows: `${notice}fr` }}
        >
          <p
            className="font-body bg-primary-light/5 dark:bg-primary-dark/5 dark:border-primary-dark/15 relative flex min-h-0 items-start gap-2.5 border-b border-cyan-800/10 px-4 py-2.5 text-xs leading-5 text-slate-700 dark:text-slate-200"
            style={{ opacity: notice }}
          >
            <PulseLayer value={alerting ? pulseProgress(time, 1.5, 1) : 0} />
            <History
              size={20}
              strokeWidth={1.1}
              className="text-primary-light dark:text-primary-dark relative mt-px shrink-0"
              aria-hidden="true"
            />
            <span className="relative">
              <span className="text-navy font-semibold dark:text-slate-50">
                Anterior a la actualización:
              </span>{" "}
              una fuente posterior actualizó parte de este pasaje.
            </span>
          </p>
        </div>
      }
    >
      <div style={{ opacity: sceneReveal(time, 0.2, 0.4, reduced) }}>
        <Passage />
      </div>
    </SourcePanel>
  );
}

function PreservedScene({ time, reduced }: SceneProps) {
  const documentCard = sceneReveal(time, 0.2, 0.35, reduced);
  const draw = drawProgress(time, 0.8, 0.5, reduced);
  const passage = sceneReveal(time, 1.7, 0.4, reduced);
  const withdrawn = reduced || time >= 2.7;
  const keeping = !reduced && time >= 3.1 && time < 5.1;
  const { root, target, boxes } = useBoxes(2);
  const curve =
    boxes.length === 2 ? verticalCurve(boxes[0]!, boxes[1]!) : undefined;
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-center gap-[42px] px-6"
    >
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {curve && (
          <>
            <Connector d={curvePath(curve)} draw={draw} />
            <g style={{ opacity: draw }}>
              <Dot {...curvePoint(curve, 0.5)} />
            </g>
            {!reduced &&
              [0, 1, 2].map((dot) => {
                const t = (time - 1.2 - dot * DOT_GAP) / DOT_TRANSIT;
                if (t <= 0 || t >= 1) return null;
                const point = curvePoint(curve, t);
                return <FlowDot key={dot} x={point.x} y={point.y} />;
              })}
          </>
        )}
      </svg>
      <div ref={target(0)}>
        <SceneCard
          icon={withdrawn ? FileX2 : FileText}
          label={
            withdrawn ? "Documento retirado del corpus" : "Documento del corpus"
          }
          title={sourceTitle}
          dashed={withdrawn}
          style={{
            opacity: documentCard,
            transform: `translateY(${8 * (1 - documentCard)}px)`,
          }}
        />
      </div>
      <div ref={target(1)}>
        <SceneCard
          icon={Archive}
          label="Conservado con la respuesta"
          title="Pasaje citado"
          active
          pulse={keeping ? pulseProgress(time, 3.1, 1) : 0}
          style={{
            opacity: passage,
            transform: `translateY(${8 * (1 - passage)}px)`,
          }}
        >
          <blockquote className="border-primary-light/55 dark:border-primary-dark/55 font-body mt-3 border-l-2 pl-3 text-[13px] leading-[22px] text-slate-700 dark:text-slate-300">
            <mark className="vpe-highlight rounded-sm text-inherit">
              {quoted}
            </mark>{" "}
            {passageRest.split(". ")[0]}.
          </blockquote>
        </SceneCard>
      </div>
    </div>
  );
}

export type Point = { x: number; y: number };
export type Curve = [Point, Point, Point, Point];
export const curvePath = ([a, b, c, d]: Curve) =>
  `M ${a.x} ${a.y} C ${b.x} ${b.y}, ${c.x} ${c.y}, ${d.x} ${d.y}`;
export function curvePoint([a, b, c, d]: Curve, t: number): Point {
  const u = 1 - t;
  return {
    x:
      u ** 3 * a.x + 3 * u ** 2 * t * b.x + 3 * u * t ** 2 * c.x + t ** 3 * d.x,
    y:
      u ** 3 * a.y + 3 * u ** 2 * t * b.y + 3 * u * t ** 2 * c.y + t ** 3 * d.y,
  };
}
/** Layout box of `element` relative to `root`, ignoring transforms and scale. */
export function localBox(element: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y, w: element.offsetWidth, h: element.offsetHeight };
}
export type Box = ReturnType<typeof localBox>;

/** Measures the given elements inside `root` and keeps them up to date. */
export function useBoxes(count: number) {
  const root = useRef<HTMLDivElement>(null);
  const targets = useRef<(HTMLElement | null)[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const measure = () => {
      const next = targets.current
        .slice(0, count)
        .map((target) => (target ? localBox(target, element) : undefined));
      if (next.every(Boolean)) setBoxes(next as Box[]);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    targets.current.forEach((target) => target && observer.observe(target));
    return () => observer.disconnect();
  }, [count]);
  const target = (index: number) => (element: HTMLElement | null) => {
    targets.current[index] = element;
  };
  return { root, target, boxes };
}

/** Vertical bezier from the bottom centre of `from` to the top centre of `to`. */
export function verticalCurve(from: Box, to: Box): Curve {
  const a = { x: from.x + from.w / 2, y: from.y + from.h };
  const d = { x: to.x + to.w / 2, y: to.y };
  return [
    a,
    { x: a.x, y: a.y + (d.y - a.y) * 0.6 },
    { x: d.x, y: a.y + (d.y - a.y) * 0.4 },
    d,
  ];
}

// Same cadence as the synthesis scene: three dots, 125ms apart, 550ms transit.
export const DOT_GAP = 0.125;
export const DOT_TRANSIT = 0.55;
const VERIFIED_SEND = 2.6;
const VERIFIED_AT = VERIFIED_SEND + 2 * DOT_GAP + DOT_TRANSIT;

function VerifiedScene({ time, reduced }: SceneProps) {
  const left = sceneReveal(time, 0.2, 0.4, reduced);
  const right = sceneReveal(time, 0.45, 0.4, reduced);
  const highlight = sceneReveal(time, 1, 0.45, reduced);
  // Connectors draw, the check card appears, then the dots travel to it;
  // their arrival turns the card into «Texto verificado».
  const draw = drawProgress(time, 1.6, 0.5, reduced);
  const node = sceneReveal(time, 2.1, 0.35, reduced);
  const comparing = !reduced && time >= VERIFIED_SEND && time < VERIFIED_AT;
  const verified = reduced || time >= VERIFIED_AT;
  const pulse =
    !reduced && verified && time < VERIFIED_AT + 2
      ? pulseProgress(time, VERIFIED_AT, 1)
      : 0;
  const cardPulse = comparing ? pulseProgress(time, VERIFIED_SEND, 0.9) : 0;
  const { root, target, boxes } = useBoxes(3);
  const curves =
    boxes.length === 3
      ? [
          verticalCurve(boxes[0]!, boxes[2]!),
          verticalCurve(boxes[1]!, boxes[2]!),
        ]
      : [];
  const enter = (value: number) => ({
    opacity: value,
    transform: `translateY(${8 * (1 - value)}px)`,
  });
  return (
    <div ref={root} className="relative flex h-full flex-col px-6 pt-7 pb-7">
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {curves.map((curve, index) => (
          <g key={index}>
            <Connector d={curvePath(curve)} active draw={draw} />
            <g style={{ opacity: draw }}>
              <Dot {...curvePoint(curve, 0.5)} />
            </g>
            {!reduced &&
              [0, 1, 2].map((dot) => {
                const t = (time - VERIFIED_SEND - dot * DOT_GAP) / DOT_TRANSIT;
                if (t <= 0 || t >= 1) return null;
                const point = curvePoint(curve, t);
                return <FlowDot key={dot} x={point.x} y={point.y} />;
              })}
          </g>
        ))}
      </svg>
      <div className="grid grid-cols-2 gap-4">
        <div ref={target(0)}>
          <SceneCard
            icon={FileText}
            label="En la respuesta"
            title="Cita [4]"
            active={comparing}
            pulse={cardPulse}
            style={enter(left)}
          >
            <p className="font-body mt-2.5 line-clamp-3 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
              {quoted}
            </p>
          </SceneCard>
        </div>
        <div ref={target(1)}>
          <SceneCard
            icon={BookOpen}
            label="En el PDF original"
            title="Pág. 412"
            active={comparing}
            pulse={cardPulse}
            style={enter(right)}
          >
            <p className="font-body mt-2.5 line-clamp-3 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
              <mark
                className="vpe-highlight rounded-sm text-inherit"
                style={{ "--vpe-highlight": highlight } as CSSProperties}
              >
                {quoted}
              </mark>
            </p>
          </SceneCard>
        </div>
      </div>
      <div className="min-h-14 flex-1" />
      <div className="flex justify-center" style={enter(node)}>
        <div
          ref={target(2)}
          className={`${processBorderClass(verified)} relative flex h-[66px] w-[264px] items-center gap-3 rounded-2xl border bg-white/95 px-4 shadow-[0_8px_24px_rgba(0,109,121,0.10)] transition-colors duration-200 dark:bg-[#152230]`}
        >
          <PulseLayer value={pulse} />
          <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark relative grid size-9 shrink-0 place-items-center rounded-xl">
            <FileCheck2 size={20} strokeWidth={1.1} aria-hidden="true" />
          </span>
          <div className="relative min-w-0">
            <p className="font-display text-navy text-sm font-semibold whitespace-nowrap dark:text-slate-50">
              {verified ? "Texto verificado" : "Verificando el texto"}
            </p>
            <p className="font-body text-xs leading-5 whitespace-nowrap text-slate-500 dark:text-slate-400">
              {verified
                ? "Coincide con el PDF original"
                : "Contrastando con el PDF"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const provenanceSteps = [
  { icon: BookOpen, label: "Documento", title: sourceTitle },
  {
    icon: Layers,
    label: "Capítulo",
    title: sourceChapter,
  },
  {
    icon: ListTree,
    label: "Apartado",
    title: "Antiinflamatorios no esteroideos",
  },
  { icon: FileText, label: "Página", title: "412" },
] as const;

const PROVENANCE_STEP = 0.6;

function ProvenanceScene({ time, reduced }: SceneProps) {
  const last = provenanceSteps.length - 1;
  const { root, target, boxes } = useBoxes(provenanceSteps.length);
  const rows = boxes.map((box) => box.y + box.h / 2);
  const travel = reduced
    ? 1
    : Math.max(0, Math.min(1, (time - 0.5) / (last * PROVENANCE_STEP)));
  const travelY =
    rows.length > last ? rows[0]! + (rows[last]! - rows[0]!) * travel : 0;
  const settled = 0.5 + last * PROVENANCE_STEP;
  const located = !reduced && time >= settled && time < settled + 2;
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-center px-6"
    >
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {rows.length > last && (
          <>
            <Connector d={`M 30 ${rows[0]} L 30 ${rows[last]}`} draw={travel} />
            {rows.map((y, index) => (
              <g
                key={index}
                style={{
                  opacity: sceneReveal(
                    time,
                    0.3 + index * PROVENANCE_STEP,
                    0.3,
                    reduced,
                  ),
                }}
              >
                <Dot x={30} y={y} />
              </g>
            ))}
            {!reduced && travel > 0 && travel < 1 && (
              <FlowDot x={30} y={travelY} />
            )}
          </>
        )}
      </svg>
      <ol className="space-y-2.5 pl-8">
        {provenanceSteps.map((step, index) => {
          const reveal = sceneReveal(
            time,
            0.3 + index * PROVENANCE_STEP,
            0.35,
            reduced,
          );
          return (
            <li key={step.label} ref={target(index)}>
              <SceneCard
                icon={step.icon}
                label={step.label}
                title={step.title}
                active={index === last && (reduced || time >= settled)}
                pulse={
                  index === last && located
                    ? pulseProgress(time, settled, 1)
                    : 0
                }
                className="h-[62px]"
                style={{
                  opacity: reveal,
                  transform: `translateY(${8 * (1 - reveal)}px)`,
                }}
              />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export type SceneProps = { time: number; reduced: boolean };

/** `duration` marks the end of a scene that plays once. */
export type SceneDefinition = {
  render: (props: SceneProps) => ReactNode;
  surface: "chat" | "panel" | "process";
  duration: number;
};

export const evidenceScenes: Record<EvidenceFeatureId, SceneDefinition> = {
  citations: {
    render: (props) => <CitationsScene {...props} />,
    surface: "chat",
    duration: citationsTyped + 2.8,
  },
  bibliography: {
    render: (props) => <BibliographyScene {...props} />,
    surface: "chat",
    duration: bibliographyFocus + 0.8,
  },
  preserved: {
    render: (props) => <PreservedScene {...props} />,
    surface: "process",
    duration: 5.2,
  },
  viewer: {
    render: (props) => <ViewerScene {...props} />,
    surface: "panel",
    duration: 3,
  },
  verified: {
    render: (props) => <VerifiedScene {...props} />,
    surface: "process",
    duration: VERIFIED_AT + 2.4,
  },
  provenance: {
    render: (props) => <ProvenanceScene {...props} />,
    surface: "process",
    duration: 4.8,
  },
  updates: {
    render: (props) => <UpdatesScene {...props} />,
    surface: "panel",
    duration: 3.6,
  },
};

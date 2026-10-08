"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  Check,
  FileText,
  HeartPulse,
  MessageSquare,
  Pill,
  Waves,
} from "lucide-react";
import {
  processConsultation,
  processExpertInputs,
} from "./clinical-process-data";
import {
  drawProgress,
  FlowDot,
  ProcessCoordinator,
  ProcessIcon,
  processCardClass,
  processBorderClass,
  processMotion,
  PulseLayer,
  pulseProgress,
  sceneReveal,
  SceneLabel,
} from "./clinical-process-visuals";

const icons = [HeartPulse, Pill, Waves] as const;
const packetDuration =
  processMotion.groupGap + processMotion.transit + 2 * processMotion.dotGap;
// Reveal branches in quick succession; their requests and reading overlap.
const expertInterval = processMotion.draw + 0.2;
const corpusInterval = processMotion.draw + 0.2;
const corpusStart =
  4.7 + 2 * expertInterval + processMotion.draw + packetDuration;
const readingStart =
  corpusStart + 2 * corpusInterval + processMotion.draw + packetDuration + 0.2;
const gatherStart = readingStart + 3 * processMotion.readingPulse + 2;
const handoffStart = gatherStart + 1.4;
const handoffEnd = handoffStart + packetDuration + 0.32;
const preparedSummaries = [
  "Valorar congestión y signos de alarma.",
  "Revisar AINE e interacciones por riesgo renal.",
  "Comparar creatinina, potasio y diuresis.",
] as const;
const times = {
  selection: 4.7,
  corpus: corpusStart,
  gather: gatherStart,
  ready: gatherStart + 0.75,
  hold: handoffEnd + 0.2,
  fade: handoffEnd + 3.2,
  duration: handoffEnd + 3.6,
} as const;
const queryIntroDuration = 3.4;
export const COMMITTEE_DURATION = times.duration + queryIntroDuration;

type Point = { x: number; y: number };
type Connection = {
  kind: "query" | "expert" | "corpus";
  index: number;
  start: Point;
  end: Point;
  d: string;
  points: Point[];
  gather?: { x: number; y: number; contact: number };
};

export function CommitteeScene({
  seconds: sceneSeconds,
  reduced,
}: {
  seconds: number;
  reduced: boolean;
}) {
  const seconds = sceneSeconds - queryIntroDuration;
  const root = useRef<HTMLDivElement>(null);
  const question = useRef<HTMLDivElement>(null);
  const [queryBounds, setQueryBounds] = useState<{
    initial: { x: number; y: number; width: number; height: number };
    final: { x: number; y: number; width: number; height: number };
  } | null>(null);
  const map = useRef<HTMLDivElement>(null);
  const query = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLDivElement | null>>([]);
  const documents = useRef<Array<HTMLDivElement | null>>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const from = core.current?.getBoundingClientRect();
      const incoming = query.current?.getBoundingClientRect();
      if (!from || !incoming) return;
      const fullQuestion = question.current?.getBoundingClientRect();
      if (fullQuestion) {
        const bounds = (rect: DOMRect) => ({
          x: rect.left - base.left,
          y: rect.top - base.top,
          width: rect.width,
          height: rect.height,
        });
        setQueryBounds({
          initial: bounds(fullQuestion),
          final: bounds(incoming),
        });
      }
      const vertical = base.width < 760;
      const point = (
        rect: DOMRect,
        side: "left" | "right" | "top" | "bottom",
      ): Point => ({
        x:
          (side === "left"
            ? rect.left
            : side === "right"
              ? rect.right
              : rect.left + rect.width / 2) - base.left,
        y:
          (side === "top"
            ? rect.top
            : side === "bottom"
              ? rect.bottom
              : rect.top + rect.height / 2) - base.top,
      });
      const connect = (
        kind: Connection["kind"],
        index: number,
        start: Point,
        end: Point,
      ): Connection => {
        const mx = (start.x + end.x) / 2,
          my = (start.y + end.y) / 2;
        const d = vertical
          ? `M ${start.x} ${start.y} C ${start.x} ${my}, ${end.x} ${my}, ${end.x} ${end.y}`
          : `M ${start.x} ${start.y} C ${mx} ${start.y}, ${mx} ${end.y}, ${end.x} ${end.y}`;
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("d", d);
        const length = path.getTotalLength();
        return {
          kind,
          index,
          start,
          end,
          d,
          points: Array.from({ length: 101 }, (_, i) => {
            const p = path.getPointAtLength((length * i) / 100);
            return { x: p.x, y: p.y };
          }),
        };
      };
      const next = [
        connect(
          "query",
          0,
          point(incoming, vertical ? "bottom" : "right"),
          point(from, vertical ? "top" : "left"),
        ),
      ];
      cards.current.forEach((card, index) => {
        const doc = documents.current[index];
        if (!card || !doc) return;
        const cardRect = card.getBoundingClientRect();
        next.push(
          connect(
            "expert",
            index,
            point(from, vertical ? "bottom" : "right"),
            point(cardRect, vertical ? "top" : "left"),
          ),
        );
        const corpusConnection = connect(
          "corpus",
          index,
          point(cardRect, vertical ? "bottom" : "right"),
          point(doc.getBoundingClientRect(), vertical ? "top" : "left"),
        );
        const docRect = doc.getBoundingClientRect();
        const offset = {
          x:
            cardRect.left +
            cardRect.width / 2 -
            docRect.left -
            docRect.width / 2,
          y:
            cardRect.top +
            cardRect.height / 2 -
            docRect.top -
            docRect.height / 2,
        };
        const gap = vertical
          ? docRect.top - cardRect.bottom
          : docRect.left - cardRect.right;
        corpusConnection.gather = {
          ...offset,
          contact:
            Math.max(0, gap) /
            Math.max(1, Math.abs(vertical ? offset.y : offset.x)),
        };
        next.push(corpusConnection);
      });
      setConnections(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [
      el,
      map.current,
      query.current,
      question.current,
      core.current,
      ...cards.current,
      ...documents.current,
    ].forEach((node) => {
      if (node) observer.observe(node);
    });
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, []);

  const ready = reduced || seconds >= times.ready;
  const states = processConsultation.experts.map((_, i) => {
    const expertAt = times.selection + i * expertInterval;
    const corpusAt = times.corpus + i * corpusInterval;
    const readingAt = readingStart;
    const readEnd = readingAt + 3 * processMotion.readingPulse;
    const reading = !reduced && seconds >= readingAt && seconds < readEnd;
    return {
      expertAt,
      corpusAt,
      reading,
      status:
        reduced || seconds >= handoffStart + i * 0.16 + packetDuration
          ? "Aportación enviada"
          : seconds >= times.ready
            ? "Aportación preparada"
            : seconds >= readEnd
              ? "Corpus consultado"
              : seconds >= corpusAt
                ? "Consultando corpus"
                : "Consulta dirigida",
      pulse: reading
        ? pulseProgress(seconds, readingAt, processMotion.readingPulse)
        : 0,
      appear: sceneReveal(
        seconds,
        expertAt + processMotion.draw - processMotion.appearance,
        processMotion.appearance,
        reduced,
      ),
      documentAppear: sceneReveal(
        seconds,
        corpusAt + processMotion.draw - processMotion.appearance,
        processMotion.appearance,
        reduced,
      ),
    };
  });
  const reading = states.some((state) => state.reading);
  const thinking = !reduced && seconds >= 2.7 && seconds < times.selection;
  const selected = reduced || seconds >= times.corpus;
  const receiving = !reduced && seconds >= handoffStart && seconds < handoffEnd;
  const received = reduced || seconds >= handoffEnd;
  const gather = sceneReveal(seconds, times.gather, 0.75, reduced);
  const gatheredFade = sceneReveal(seconds, times.gather + 0.12, 0.63, reduced);
  const closing = reduced
    ? 1
    : 1 - sceneReveal(seconds, times.fade, 0.4, false);
  const phase =
    reduced || seconds >= times.hold
      ? "prepared"
      : seconds >= times.ready
        ? "preparing"
        : seconds >= times.gather
          ? "gathering"
          : reading
            ? "reading"
            : seconds >= times.corpus
              ? "corpus"
              : seconds >= times.selection
                ? "dispatching"
                : seconds >= 2.7
                  ? "selecting"
                  : "receiving";

  const morph = sceneReveal(sceneSeconds, 2.5, 0.9, reduced);
  const questionEntrance = sceneReveal(sceneSeconds, 0, 0.5, reduced);
  const questionSurface =
    "bg-primary-light dark:bg-primary-dark font-body rounded-2xl rounded-br-md px-4 py-3 text-[13px] leading-[22px] text-white shadow-lg dark:text-[#04111e]";
  const questionOpacity = 1 - sceneReveal(sceneSeconds, 2.5, 0.45, reduced);
  const compactOpacity = sceneReveal(sceneSeconds, 3.0, 0.4, reduced);
  const queryStyle = queryBounds
    ? Object.fromEntries(
        (["x", "y", "width", "height"] as const).map((key) => [
          key === "x" ? "left" : key === "y" ? "top" : key,
          queryBounds.initial[key] +
            (queryBounds.final[key] - queryBounds.initial[key]) * morph,
        ]),
      )
    : undefined;

  return (
    <div
      ref={root}
      data-scene-content=""
      data-committee-time={seconds.toFixed(2)}
      data-committee-phase={phase}
      className="relative h-[480px] px-3 pt-14 pb-5 @min-[480px]:px-6"
    >
      <SceneLabel text="Representación del proceso" />
      <div
        ref={question}
        aria-hidden="true"
        className={`${questionSurface} pointer-events-none invisible absolute top-1/2 right-3 left-3 -translate-y-1/2 @min-[480px]:right-6 @min-[480px]:left-6`}
      >
        {processConsultation.question}
      </div>
      <div
        data-committee-query-morph=""
        className={`${questionSurface} absolute z-30 overflow-hidden p-0`}
        style={{
          ...queryStyle,
          opacity: closing * questionEntrance,
          transform: `translateY(${18 * (1 - questionEntrance)}px)`,
          borderBottomRightRadius: 4 + 12 * morph,
        }}
      >
        <div
          className="absolute inset-0 px-4 py-3"
          style={{ opacity: questionOpacity }}
        >
          {processConsultation.question}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 px-3"
          style={{ opacity: compactOpacity }}
        >
          <ProcessIcon icon={MessageSquare} />
          <p className="font-display text-[10px] font-semibold whitespace-nowrap @min-[480px]:text-[13px]">
            Consulta clínica
          </p>
        </div>
      </div>
      <div className="flex h-full items-center" style={{ opacity: closing }}>
        <svg
          className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          {connections.map((connection) => {
            const state = states[connection.index]!;
            const start =
              connection.kind === "query"
                ? 0.35
                : connection.kind === "expert"
                  ? state.expertAt
                  : state.corpusAt;
            const departure =
              connection.kind === "query"
                ? 0.85
                : connection.kind === "expert"
                  ? state.expertAt + processMotion.draw
                  : state.corpusAt + processMotion.draw;
            const draw = drawProgress(
              seconds,
              start,
              processMotion.draw,
              reduced,
            );
            const active =
              (thinking && connection.kind === "query") ||
              (state.reading && connection.kind === "corpus");
            const returning =
              connection.kind === "corpus" &&
              (reduced || seconds >= times.gather);
            const offset = connection.gather;
            const end =
              returning && offset
                ? {
                    x: connection.end.x + offset.x * gather,
                    y: connection.end.y + offset.y * gather,
                  }
                : connection.end;
            const mx = (connection.start.x + end.x) / 2,
              my = (connection.start.y + end.y) / 2;
            const vertical =
              connection.kind === "corpus" &&
              connection.start.x === connection.end.x;
            const d = returning
              ? vertical
                ? `M ${connection.start.x} ${connection.start.y} C ${connection.start.x} ${my}, ${end.x} ${my}, ${end.x} ${end.y}`
                : `M ${connection.start.x} ${connection.start.y} C ${mx} ${connection.start.y}, ${mx} ${end.y}, ${end.x} ${end.y}`
              : connection.d;
            const connectorOpacity = returning
              ? gather >= (offset?.contact ?? 1)
                ? 0
                : 1 - gatheredFade
              : 1;
            return (
              <g
                key={`${connection.kind}-${connection.index}`}
                data-committee-connection={connection.kind}
              >
                <path
                  d={d}
                  pathLength="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 1.8 : 1.25}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - draw}
                  opacity={(active ? 1 : 0.45) * connectorOpacity}
                />
                {!reduced &&
                  Array.from({ length: 6 }, (_, i) => {
                    const group = Math.floor(i / 3);
                    const travel =
                      (seconds -
                        departure -
                        group * processMotion.groupGap -
                        (i % 3) * processMotion.dotGap) /
                      processMotion.transit;
                    if (travel <= 0 || travel >= 1) return null;
                    const position = travel * 100;
                    const lower = Math.floor(position),
                      fraction = position - lower;
                    const a = connection.points[lower]!,
                      b = connection.points[Math.min(100, lower + 1)]!;
                    return (
                      <g
                        key={i}
                        data-packet-group={group + 1}
                        data-direction="outbound"
                      >
                        <FlowDot
                          x={a.x + (b.x - a.x) * fraction}
                          y={a.y + (b.y - a.y) * fraction}
                        />
                      </g>
                    );
                  })}
                {!reduced &&
                  connection.kind === "expert" &&
                  Array.from({ length: 6 }, (_, i) => {
                    const group = Math.floor(i / 3);
                    const travel =
                      (seconds -
                        handoffStart -
                        connection.index * 0.16 -
                        group * processMotion.groupGap -
                        (i % 3) * processMotion.dotGap) /
                      processMotion.transit;
                    if (travel <= 0 || travel >= 1) return null;
                    const position = (1 - travel) * 100;
                    const lower = Math.floor(position);
                    const fraction = position - lower;
                    const a = connection.points[lower]!;
                    const b = connection.points[Math.min(100, lower + 1)]!;
                    return (
                      <g
                        key={`return-${i}`}
                        data-packet-group={group + 1}
                        data-direction="expert-to-orchestrator"
                      >
                        <FlowDot
                          x={a.x + (b.x - a.x) * fraction}
                          y={a.y + (b.y - a.y) * fraction}
                        />
                      </g>
                    );
                  })}
              </g>
            );
          })}
        </svg>
        <div
          ref={map}
          data-committee-map=""
          className="relative grid w-full gap-y-4 @min-[760px]:grid-cols-[minmax(140px,0.55fr)_236px_minmax(260px,1fr)] @min-[760px]:items-center @min-[760px]:gap-x-6 @min-[880px]:gap-x-11"
        >
          <div
            ref={query}
            data-committee-query=""
            aria-hidden="true"
            className="mx-auto h-14 w-[200px] max-w-full @min-[480px]:h-[66px] @min-[760px]:w-full"
          />
          <div style={{ opacity: sceneReveal(seconds, 0.7, 0.15, reduced) }}>
            <ProcessCoordinator
              nodeRef={core}
              kind="committee"
              active={thinking || receiving}
              status={
                received
                  ? "3 aportaciones recibidas"
                  : receiving
                    ? "Recibiendo aportaciones"
                    : selected
                      ? "Comité seleccionado"
                      : seconds >= 2.7
                        ? "Seleccionando expertos"
                        : "Recibiendo consulta"
              }
              pulse={
                thinking
                  ? pulseProgress(seconds, 2.7, processMotion.thinkingPulse)
                  : receiving
                    ? pulseProgress(
                        seconds,
                        handoffStart,
                        processMotion.thinkingPulse,
                      )
                    : 0
              }
            />
          </div>
          <div className="relative grid grid-cols-3 gap-2 @min-[480px]:gap-3 @min-[760px]:grid-cols-1 @min-[760px]:gap-4">
            {processConsultation.experts.map((expert, i) => {
              const state = states[i]!;
              const route = connections.find(
                (c) => c.kind === "expert" && c.index === i,
              );
              const remaining =
                1 -
                drawProgress(
                  seconds,
                  state.expertAt,
                  processMotion.draw,
                  reduced,
                );
              return (
                <div
                  key={expert.slug}
                  className="flex min-w-0 flex-col items-center gap-3 @min-[760px]:flex-row @min-[760px]:gap-5"
                >
                  <div
                    ref={(el) => {
                      cards.current[i] = el;
                    }}
                    data-committee-slot={expert.slug}
                    className="relative h-[92px] w-full min-w-0 min-[450px]:h-[144px] @min-[480px]:h-[124px] @min-[760px]:flex-1"
                  >
                    <div
                      data-committee-expert={expert.slug}
                      data-expert-state={
                        ready
                          ? "prepared"
                          : state.reading
                            ? "reading"
                            : seconds >= state.expertAt
                              ? "selected"
                              : "available"
                      }
                      className={`${processCardClass} ${processBorderClass(state.reading || ready)} absolute inset-0 z-20 flex flex-col p-2 @min-[480px]:p-3`}
                      style={{
                        opacity: state.appear,
                        transform:
                          reduced || !route
                            ? undefined
                            : `translate(${(route.start.x - route.end.x) * remaining}px, ${(route.start.y - route.end.y) * remaining}px)`,
                      }}
                    >
                      <PulseLayer value={state.pulse} />
                      <div className="relative flex flex-col items-center gap-1 @min-[480px]:flex-row @min-[480px]:gap-2">
                        <span className="text-primary-light dark:text-primary-dark grid size-7 shrink-0 place-items-center">
                          <ProcessIcon icon={icons[i]!} />
                        </span>
                        <p className="font-display text-center text-[10px] font-semibold text-[#05215e] @min-[480px]:text-left @min-[480px]:text-[13px] dark:text-slate-100">
                          {expert.name}
                        </p>
                      </div>
                      <p className="font-body @container/expert relative mt-1 hidden text-center text-[10px] leading-4 text-slate-600 min-[450px]:block @min-[480px]:text-left @min-[480px]:text-xs @min-[480px]:leading-[18px] dark:text-slate-300">
                        {ready ? (
                          preparedSummaries[i]
                        ) : (
                          <>
                            <span className="@min-[196px]/expert:hidden">
                              {processExpertInputs[i]!.compact}
                            </span>
                            <span className="hidden @min-[196px]/expert:inline">
                              {processExpertInputs[i]!.detail}
                            </span>
                          </>
                        )}
                      </p>
                      <p
                        data-committee-expert-status=""
                        className="font-body text-primary-light dark:text-primary-dark relative mt-2 flex items-center justify-center gap-1.5 text-center text-[9px] leading-3 @min-[480px]:justify-start @min-[480px]:text-left @min-[480px]:text-[10px] @min-[480px]:leading-4"
                      >
                        {ready && (
                          <Check
                            size={20}
                            strokeWidth={1.1}
                            className="shrink-0"
                          />
                        )}
                        {state.status}
                      </p>
                    </div>
                  </div>
                  <div
                    ref={(el) => {
                      documents.current[i] = el;
                    }}
                    data-committee-corpus-slot={expert.slug}
                    className="relative h-[76px] w-[57px] shrink-0 @min-[760px]:h-[124px] @min-[760px]:w-[93px]"
                  >
                    <div
                      data-committee-corpus={expert.slug}
                      className={`${processCardClass} ${processBorderClass(state.reading)} absolute inset-0 flex flex-col items-center justify-center gap-1`}
                      style={{
                        opacity: state.documentAppear * (1 - gatheredFade),
                        transform: (() => {
                          const corpusRoute = connections.find(
                            (c) => c.kind === "corpus" && c.index === i,
                          );
                          if (reduced || !corpusRoute) return undefined;
                          const travel =
                            seconds >= times.gather
                              ? gather
                              : 1 -
                                drawProgress(
                                  seconds,
                                  state.corpusAt,
                                  processMotion.draw,
                                  false,
                                );
                          return `translate(${(corpusRoute.gather?.x ?? 0) * travel}px, ${(corpusRoute.gather?.y ?? 0) * travel}px)`;
                        })(),
                      }}
                    >
                      <PulseLayer value={state.pulse} />
                      <ProcessIcon
                        icon={FileText}
                        className="text-primary-light dark:text-primary-dark relative"
                      />
                      <div
                        className="relative flex w-6 flex-col gap-1"
                        aria-hidden="true"
                      >
                        <span className="bg-primary-light/30 dark:bg-primary-dark/30 h-px w-full" />
                        <span className="bg-primary-light/20 dark:bg-primary-dark/20 h-px w-4" />
                      </div>
                      <span className="font-body relative text-[10px] text-slate-500 @min-[480px]:text-xs dark:text-slate-400">
                        Corpus
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUp,
  FileText,
  HeartPulse,
  Paperclip,
  Pill,
  Waves,
} from "lucide-react";
import { EvidenceScene } from "./clinical-evidence-scene";
import { FollowupScene, useFollowupTimeline } from "./clinical-followup-scene";
import { typingDuration, writtenCharacters } from "./clinical-process-typing";
import { CommitteeScene, COMMITTEE_DURATION } from "./clinical-committee-scene";
import {
  ClinicalProcessPlayer,
  type ProcessStage,
} from "./clinical-process-player";
import {
  Mark,
  ProcessChatVeil,
  SceneLabel,
  FlowDot,
  drawProgress as synthesisDraw,
  sceneReveal,
  ProcessCoordinator,
  ProcessIcon,
  PulseLayer,
  processCardClass,
  processBorderClass,
  processMotion,
  pulseProgress,
} from "./clinical-process-visuals";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useProcessExperts } from "./clinical-process-data";

const questionStateDuration = 2.2;
const stepIds = [
  { id: "question", number: "01" },
  { id: "committee", number: "02" },
  { id: "synthesis", number: "03" },
  { id: "evidence", number: "04" },
  { id: "followup", number: "05" },
] as const;

// El envío depende de lo que tarda en escribirse la pregunta de cada idioma.
function questionSendAt(questionLength: number) {
  return 1 + typingDuration(questionLength) + 0.5;
}

function useClinicalProcessStages(): readonly ProcessStage[] {
  const t = useTranslations("clinical");
  const followupDuration = useFollowupTimeline().duration;
  return useMemo(() => {
    const sendAt = questionSendAt(t("consultation.question").length);
    return stepIds.map(({ id, number }, index) => ({
      number,
      title: t(`steps.${id}.title`),
      body: t(`steps.${id}.body`),
      signal: t(`steps.${id}.signal`),
      start: index === 1 ? 2.5 : index === 3 ? 0.55 : index === 4 ? 1.2 : 0,
      end:
        index === 0
          ? sendAt + 2
          : index === 1
            ? COMMITTEE_DURATION - 1.6
            : index === 2
              ? 20.6
              : index === 3
                ? 18.35
                : followupDuration - 2.7,
      render: (seconds: number, reduced: boolean) =>
        index === 0 ? (
          <QuestionScene seconds={seconds} reduced={reduced} />
        ) : index === 1 ? (
          <CommitteeScene seconds={seconds} reduced={reduced} />
        ) : index === 2 ? (
          <SynthesisScene seconds={seconds} reduced={reduced} />
        ) : index === 3 ? (
          <EvidenceScene seconds={seconds} reduced={reduced} />
        ) : (
          <FollowupScene seconds={seconds} reduced={reduced} />
        ),
    }));
  }, [t, followupDuration]);
}

export function ClinicalProcessShowcase({
  homePresentation = false,
}: {
  homePresentation?: boolean;
}) {
  const stages = useClinicalProcessStages();
  return (
    <ClinicalProcessPlayer
      stages={stages}
      homePresentation={homePresentation}
    />
  );
}

function QuestionScene({
  seconds,
  reduced,
}: {
  seconds: number;
  reduced: boolean;
}) {
  const t = useTranslations("clinical");
  const question = t("consultation.question");
  const questionProcessingStates = t.raw("questionScene.states") as string[];
  const sendAt = questionSendAt(question.length);
  const sent = reduced || seconds >= sendAt;
  const stateIndex = reduced
    ? questionProcessingStates.length - 1
    : Math.min(
        questionProcessingStates.length - 1,
        Math.floor(Math.max(0, seconds - sendAt) / questionStateDuration),
      );
  const length = writtenCharacters(seconds, 1, question.length, reduced);
  const text = reduced ? question : question.slice(0, length);
  return (
    <>
      <ProcessChatVeil opacity={sceneReveal(seconds, sendAt, 0.35, reduced)} />
      <motion.div
        initial={false}
        animate={{ opacity: sent ? 0 : 1, y: sent ? -18 : 0 }}
        transition={{ duration: reduced ? 0 : 0.4 }}
        className="absolute inset-x-6 top-24 text-center"
      >
        <Mark className="size-12" />
        <p className="font-display text-primary-light dark:text-primary-dark mt-4 text-[10px] font-bold tracking-[0.22em] uppercase">
          BinPar
        </p>
        <p className="font-display text-navy mt-3 text-2xl font-extrabold tracking-tight dark:text-slate-50">
          {t("questionScene.title")}
        </p>
      </motion.div>
      <div
        className="absolute inset-x-0 top-0 flex h-14 items-center gap-2.5 px-5 @min-[600px]:px-6"
        style={{ opacity: sceneReveal(seconds, sendAt, 0.35, reduced) }}
      >
        <Mark className="size-6" />
        <span className="font-display text-navy text-sm font-semibold dark:text-slate-100">
          BinPar
        </span>
      </div>
      <AnimatePresence>
        {sent && (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.35 }}
            className="absolute inset-x-5 top-[68px] space-y-5 @min-[600px]:inset-x-6"
          >
            <div className="bg-primary-light dark:bg-primary-dark font-body ml-auto max-w-[90%] rounded-2xl rounded-br-md px-4 py-3 text-[13px] leading-[22px] text-white shadow-lg dark:text-[#04111e]">
              {question}
            </div>
            <div className="font-body flex min-h-[66px] items-start gap-2.5 text-[13px] leading-[22px] text-slate-600 @min-[600px]:min-h-11 dark:text-slate-300">
              <span
                className="mt-0.5 shrink-0"
                style={{
                  opacity: reduced
                    ? 1
                    : 0.65 + Math.sin((seconds - sendAt) * Math.PI) * 0.25,
                }}
              >
                <Mark className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <AnimatePresence initial={false} mode="wait">
                  <motion.p
                    key={stateIndex}
                    initial={{ opacity: reduced ? 1 : 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.18 }}
                  >
                    {questionProcessingStates[stateIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className="absolute inset-x-5 transition-[top] duration-300 motion-reduce:transition-none sm:inset-x-8"
        style={{ top: sent ? "calc(100% - 76px)" : "54%" }}
      >
        <ProcessComposer
          text={sent ? t("chat.placeholder") : text}
          typing={!sent && length > 0}
        />
      </div>
    </>
  );
}

function ProcessComposer({ text, typing }: { text: string; typing: boolean }) {
  const t = useTranslations("clinical.chat");
  const mirror = useRef<HTMLSpanElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  useLayoutEffect(() => {
    const el = mirror.current;
    if (!el) return;
    const measure = () =>
      setExpanded(typing && el.getBoundingClientRect().height > 25);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [typing]);
  useLayoutEffect(() => {
    if (content.current)
      content.current.scrollTop = content.current.scrollHeight;
  }, [text, expanded]);
  return (
    <div
      data-process-composer=""
      data-expanded={expanded}
      className={`font-body shadow-big-blocks dark:border-primary-dark/15 relative grid min-h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] border border-cyan-800/15 bg-white/90 text-[14px] leading-6 backdrop-blur-md dark:bg-[#152230]/90 ${expanded ? "rounded-3xl" : "rounded-[28px]"}`}
    >
      <span
        ref={mirror}
        className="invisible absolute right-14 left-14 wrap-break-word"
      >
        {text}
        {typing && <span className="inline-block h-3 w-px" />}
      </span>
      <span
        className={`dark:border-primary-dark/15 grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:text-slate-400 ${expanded ? "col-start-1 row-start-2 my-2.5" : "col-start-1 row-start-1"}`}
      >
        <Paperclip size={16} strokeWidth={1.8} />
      </span>
      <div
        ref={content}
        className={`row-start-1 min-w-0 overflow-hidden wrap-break-word text-slate-700 dark:text-slate-200 ${expanded ? "col-span-3 col-start-1 max-h-[140px] px-4 pt-4 pb-1" : "col-start-2 self-center truncate py-3"}`}
      >
        {text || (
          <span className="text-slate-500 dark:text-slate-400">
            {t("placeholder")}
          </span>
        )}
        {typing && (
          <span className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-4 w-px align-middle" />
        )}
      </div>
      <span
        className={`bg-primary-light dark:bg-primary-dark grid size-9 place-items-center place-self-center rounded-full text-white dark:text-[#04111e] ${expanded ? "col-start-3 row-start-2 my-2.5" : "col-start-3 row-start-1"} ${typing ? "opacity-100" : "opacity-45"}`}
      >
        <ArrowUp size={18} strokeWidth={1.8} />
      </span>
    </div>
  );
}

const expertDetails = [
  {
    icon: HeartPulse,
    fragment: "posible insuficiencia cardiaca y comorbilidades",
    quote: "disnea progresiva y edema periférico son signos concordantes",
  },
  {
    icon: Pill,
    fragment: "signos de toxicidad o interacciones",
    quote:
      "el consumo frecuente de ibuprofeno es un factor farmacológico prioritario",
  },
  {
    icon: Waves,
    fragment: "cómo influyen la ERC y el ibuprofeno en las decisiones",
    quote: "no asumiría que el edema es exclusivamente renal",
  },
] as const;

const synthesisRelations = [
  { id: "congestion", experts: [0, 2], start: 3 },
  { id: "medication", experts: [1, 2], start: 6.4 },
  { id: "limits", experts: [1, 2], start: 9.8 },
] as const;

type SynthesisPath = {
  d: string;
  points: Array<{ x: number; y: number }>;
  kind: "input" | "relation" | "emission";
  index: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
};

function SynthesisScene({
  seconds,
  reduced,
}: {
  seconds: number;
  reduced: boolean;
}) {
  const t = useTranslations("clinical.synthesis");
  const tLabels = useTranslations("clinical.visuals");
  const experts = useProcessExperts();
  const root = useRef<HTMLDivElement>(null);
  const map = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const output = useRef<HTMLDivElement>(null);
  const nodes = useRef<Array<HTMLDivElement | null>>([]);
  const relations = useRef<Array<HTMLDivElement | null>>([]);
  const [paths, setPaths] = useState<SynthesisPath[]>([]);
  const [gatherOffsets, setGatherOffsets] = useState<
    Array<{ x: number; y: number; contact: number }>
  >([]);
  const [stacked, setStacked] = useState(false);
  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const measure = () => {
      const bounds = el.getBoundingClientRect();
      const target = core.current?.getBoundingClientRect();
      const exit = output.current?.getBoundingClientRect();
      if (!target || !exit) return;
      const stacked = bounds.width < 760;
      const point = (
        b: DOMRect,
        side: "top" | "bottom" | "left" | "right",
      ) => ({
        x:
          (side === "left"
            ? b.left
            : side === "right"
              ? b.right
              : b.left + b.width / 2) - bounds.left,
        y:
          (side === "top"
            ? b.top
            : side === "bottom"
              ? b.bottom
              : b.top + b.height / 2) - bounds.top,
      });
      const connect = (
        from: DOMRect,
        to: DOMRect,
        kind: SynthesisPath["kind"],
        index: number,
      ): SynthesisPath => {
        const a = point(from, stacked ? "bottom" : "right");
        const b = point(to, stacked ? "top" : "left");
        const horizontal = !stacked;
        const c1 = {
          x: horizontal ? (a.x + b.x) / 2 : a.x,
          y: stacked ? (a.y + b.y) / 2 : a.y,
        };
        const c2 = {
          x: horizontal ? (a.x + b.x) / 2 : b.x,
          y: stacked ? (a.y + b.y) / 2 : b.y,
        };
        return {
          kind,
          index,
          start: a,
          end: b,
          d: `M ${a.x} ${a.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${b.x} ${b.y}`,
          points: Array.from({ length: 101 }, (_, i) => {
            const t = i / 100,
              u = 1 - t;
            return {
              x:
                u ** 3 * a.x +
                3 * u ** 2 * t * c1.x +
                3 * u * t ** 2 * c2.x +
                t ** 3 * b.x,
              y:
                u ** 3 * a.y +
                3 * u ** 2 * t * c1.y +
                3 * u * t ** 2 * c2.y +
                t ** 3 * b.y,
            };
          }),
        };
      };
      const next: SynthesisPath[] = [];
      nodes.current.forEach((node, i) => {
        if (node)
          next.push(connect(node.getBoundingClientRect(), target, "input", i));
      });
      // Measure the stationary slots, never their translated card children.
      // This keeps paths, return destinations and the frame height stable.
      const offsets: Array<{ x: number; y: number; contact: number }> = [];
      relations.current.forEach((node, i) => {
        if (!node) return;
        const b = node.getBoundingClientRect();
        next.push(connect(target, b, "relation", i));
        const x = target.left + target.width / 2 - b.left - b.width / 2;
        const y = target.top + target.height / 2 - b.top - b.height / 2;
        offsets[i] = {
          x,
          y,
          contact: Math.max(
            0,
            x === 0 ? 0 : 1 - (target.width + b.width) / (2 * Math.abs(x)),
            y === 0 ? 0 : 1 - (target.height + b.height) / (2 * Math.abs(y)),
          ),
        };
      });
      next.push(connect(target, exit, "emission", 0));
      setGatherOffsets(offsets);
      setStacked(stacked);
      setPaths(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [
      el,
      map.current,
      core.current,
      output.current,
      ...nodes.current,
      ...relations.current,
    ].forEach((node) => {
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);
  // Each relation draws for 500ms, settles for 200ms, then pulses three times.
  // All comparisons remain visible for another two seconds before gathering.
  const phase = synthesisRelations.findIndex(
    (relation) => seconds >= relation.start && seconds < relation.start + 3.4,
  );
  const activeRelation = phase >= 0 ? synthesisRelations[phase]! : null;
  const pulseTime = activeRelation
    ? Math.max(0, seconds - activeRelation.start - 0.7) /
      processMotion.readingPulse
    : seconds;
  const pulse = reduced ? 0 : pulseProgress(pulseTime, 0, 1);
  // Keep the final layout in place while the output pulses until the fade.
  const closing = reduced ? 1 : 1 - sceneReveal(seconds, 23.6, 0.4, false);
  const gather = sceneReveal(seconds, 15.2, 0.75, reduced);
  const gatheredFade = sceneReveal(seconds, 15.32, 0.63, reduced);
  const emission = sceneReveal(seconds, 18.3, 0.3, reduced);
  const outputPulseTime = seconds - 18.6;
  const outputPulse =
    !reduced && outputPulseTime >= 0
      ? (1 + Math.cos(outputPulseTime * Math.PI * 2)) / 2
      : 1;
  // Repeat the thinking tint twice, with the same one-second cadence.
  // The scene clock freezes the tint when paused or offscreen.
  const blinkTime = seconds - 15.95;
  const integratingPulse = !reduced && blinkTime >= 0 && blinkTime < 2;
  const corePulse = integratingPulse
    ? pulseProgress(blinkTime, 0, processMotion.thinkingPulse)
    : pulse;
  const status =
    reduced || seconds >= 18.6
      ? t("status.emitted")
      : seconds >= 15.2
        ? t("status.integrating")
        : seconds >= 3
          ? t("status.contrasting")
          : t("status.gathering");
  const pulseLayer = (active: boolean, value = pulse) => (
    <PulseLayer value={active ? value : 0} />
  );
  return (
    <div
      ref={root}
      data-scene-content=""
      data-synthesis-time={seconds.toFixed(2)}
      data-synthesis-phase={
        reduced
          ? "integrated"
          : seconds < 3
            ? "receiving"
            : seconds < 15.2
              ? "contrasting"
              : seconds < 15.95
                ? "returning"
                : seconds < 17.95
                  ? "integrating"
                  : seconds < 18.6
                    ? "emitting"
                    : "integrated"
      }
      className="relative h-[480px] px-3 pt-14 pb-5 @min-[480px]:px-6"
    >
      <SceneLabel text={tLabels("processLabel")} />
      <div className="flex h-full items-center" style={{ opacity: closing }}>
        <svg
          className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          {paths.map((path) => {
            const start =
              path.kind === "input"
                ? 0
                : path.kind === "relation"
                  ? synthesisRelations[path.index]!.start
                  : 17.95;
            const draw = synthesisDraw(
              seconds,
              start,
              path.kind === "emission" ? 0.25 : processMotion.draw,
              reduced,
            );
            const active =
              path.kind === "input"
                ? activeRelation?.experts.some((i) => i === path.index)
                : path.kind === "relation" && phase === path.index;
            const offset = gatherOffsets[path.index];
            const returning = path.kind === "relation" && seconds >= 15.2;
            const end =
              returning && offset
                ? {
                    x: path.end.x + offset.x * gather,
                    y: path.end.y + offset.y * gather,
                  }
                : path.end;
            // Draw the stationary curve on departure. Only follow the card
            // during its return, hiding the connector when it reaches the core.
            const midpointX = (path.start.x + end.x) / 2;
            const midpointY = (path.start.y + end.y) / 2;
            const d = returning
              ? stacked
                ? `M ${path.start.x} ${path.start.y} C ${path.start.x} ${midpointY}, ${end.x} ${midpointY}, ${end.x} ${end.y}`
                : `M ${path.start.x} ${path.start.y} C ${midpointX} ${path.start.y}, ${midpointX} ${end.y}, ${end.x} ${end.y}`
              : path.d;
            const connectorOpacity =
              path.kind === "relation"
                ? gather >= (offset?.contact ?? 1)
                  ? 0
                  : 1 - gatheredFade
                : 1;
            return (
              <g key={`${path.kind}-${path.index}`}>
                <path
                  data-synthesis-path={path.kind}
                  d={d}
                  pathLength="1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 1.8 : 1.25}
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - draw}
                  opacity={
                    (active ? 0.65 + pulse * 0.35 : 0.45) * connectorOpacity
                  }
                />
                {!reduced &&
                  path.kind === "input" &&
                  [0, 1].flatMap((group) =>
                    [0, 1, 2].map((dot) => {
                      const t =
                        (seconds -
                          0.8 -
                          group * processMotion.groupGap -
                          dot * processMotion.dotGap) /
                        processMotion.transit;
                      if (t <= 0 || t >= 1) return null;
                      const p = path.points[Math.round(t * 100)];
                      return p ? (
                        <FlowDot key={`${group}-${dot}`} x={p.x} y={p.y} />
                      ) : null;
                    }),
                  )}
                {!reduced &&
                  path.kind === "relation" &&
                  [0, 1].flatMap((group) =>
                    [0, 1, 2].map((dot) => {
                      const t =
                        (seconds -
                          synthesisRelations[path.index]!.start -
                          0.75 -
                          group * processMotion.groupGap -
                          dot * processMotion.dotGap) /
                        0.4;
                      if (t <= 0 || t >= 1) return null;
                      const p = path.points[Math.round(t * 100)];
                      return p ? (
                        <FlowDot key={`${group}-${dot}`} x={p.x} y={p.y} />
                      ) : null;
                    }),
                  )}
              </g>
            );
          })}
        </svg>
        <div
          ref={map}
          data-synthesis-map=""
          className="relative grid w-full gap-y-11 @min-[760px]:grid-cols-[minmax(0,1fr)_236px_minmax(0,1fr)] @min-[760px]:items-center @min-[760px]:gap-x-6 @min-[880px]:gap-x-11"
        >
          <div className="grid grid-cols-3 items-stretch gap-2 @min-[480px]:gap-3 @min-[760px]:grid-cols-1 @min-[760px]:gap-6">
            {experts.map((expert, i) => {
              const Icon = expertDetails[i]!.icon;
              const active =
                !reduced &&
                Boolean(activeRelation?.experts.some((index) => index === i));
              return (
                <div
                  key={expert.slug}
                  ref={(el) => {
                    nodes.current[i] = el;
                  }}
                  data-synthesis-expert={expert.slug}
                  data-active={active}
                  className={`${processCardClass} relative min-h-[88px] p-2 max-[450px]:min-h-0 @min-[480px]:p-3 @min-[760px]:min-h-[104px] ${processBorderClass(active)}`}
                  style={{ opacity: sceneReveal(seconds, 0, 0.3, reduced) }}
                >
                  {pulseLayer(active)}
                  <div className="relative flex flex-col items-center gap-1 @min-[480px]:flex-row @min-[480px]:items-center @min-[480px]:gap-2">
                    <span className="text-primary-light dark:text-primary-dark grid size-7 shrink-0 place-items-center">
                      <ProcessIcon icon={Icon} />
                    </span>
                    <p className="font-display text-navy text-center text-[10px] font-semibold @min-[480px]:text-left @min-[480px]:text-[13px] dark:text-slate-100">
                      {expert.name}
                    </p>
                  </div>
                  <p className="font-body relative mt-1 hidden text-center text-[10px] leading-4 text-slate-600 min-[450px]:block @min-[480px]:text-left @min-[480px]:text-xs @min-[480px]:leading-[18px] dark:text-slate-300">
                    <span className="@min-[760px]:hidden">
                      {expert.compact}
                    </span>
                    <span className="hidden @min-[760px]:inline">
                      {expert.detail}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
          <ProcessCoordinator
            nodeRef={core}
            kind="synthesis"
            active={!reduced && seconds >= 3 && seconds < 17.95}
            status={status}
            pulse={!reduced && seconds >= 3 && seconds < 17.95 ? corePulse : 0}
          />
          <div className="relative grid grid-cols-3 items-stretch gap-2 @min-[480px]:gap-3 @min-[760px]:grid-cols-1 @min-[760px]:gap-6">
            {synthesisRelations.map((relation, i) => {
              const title = t(`relations.${relation.id}.title`);
              const Icon = [HeartPulse, Pill, Waves][i]!;
              const active = !reduced && phase === i;
              const offset = gatherOffsets[i] ?? { x: 0, y: 0 };
              const departure = synthesisDraw(
                seconds,
                relation.start,
                processMotion.draw,
                reduced,
              );
              const appearance = sceneReveal(
                seconds,
                relation.start + processMotion.draw - processMotion.appearance,
                processMotion.appearance,
                reduced,
              );
              const travel = seconds >= 15.2 ? gather : 1 - departure;
              return (
                <div
                  key={relation.id}
                  ref={(el) => {
                    relations.current[i] = el;
                  }}
                  data-synthesis-slot={title}
                  className="relative min-h-[88px] @min-[760px]:min-h-[104px]"
                >
                  <div
                    data-synthesis-relation={title}
                    className={`${processCardClass} relative h-full min-h-[88px] p-2 @min-[480px]:p-3 @min-[760px]:min-h-0 ${processBorderClass(active)}`}
                    style={{
                      opacity: appearance * (1 - gatheredFade),
                      transform: reduced
                        ? undefined
                        : `translate(${offset.x * travel}px, ${offset.y * travel}px)`,
                    }}
                  >
                    {pulseLayer(active)}
                    <div className="relative flex flex-col items-center gap-1 @min-[480px]:flex-row @min-[480px]:items-center @min-[480px]:gap-2">
                      <span className="text-primary-light dark:text-primary-dark grid size-7 shrink-0 place-items-center">
                        <ProcessIcon icon={Icon} />
                      </span>
                      <p className="font-display text-navy text-center text-[10px] font-semibold @min-[480px]:text-left @min-[480px]:text-[13px] dark:text-slate-100">
                        {title}
                      </p>
                    </div>
                    <p className="font-body relative mt-1 text-center text-[10px] leading-4 text-slate-600 @min-[480px]:text-left @min-[480px]:text-xs @min-[480px]:leading-[18px] dark:text-slate-300">
                      <span className="@min-[760px]:hidden">
                        {t(`relations.${relation.id}.compact`)}
                      </span>
                      <span className="hidden @min-[760px]:inline">
                        {t(`relations.${relation.id}.detail`)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
            <div
              ref={output}
              data-synthesis-output=""
              className="absolute inset-x-0 top-0 flex h-14 items-center justify-center @min-[480px]:h-[66px] @min-[760px]:top-1/2 @min-[760px]:-translate-y-1/2 @min-[760px]:justify-start"
            >
              <p
                className={`${processBorderClass(!reduced && seconds >= 18.6)} font-display text-navy relative flex h-full w-[200px] max-w-full items-center gap-2 rounded-2xl border bg-white/95 px-4 py-3 text-[10px] font-semibold shadow-[0_8px_24px_rgba(0,109,121,0.10)] @min-[480px]:w-[236px] @min-[480px]:gap-3 @min-[480px]:text-sm @min-[760px]:w-full dark:bg-[#152230] dark:text-slate-50`}
                style={{
                  opacity: emission,
                  transform: reduced
                    ? undefined
                    : `translate(${stacked ? 0 : -12 * (1 - emission)}px, ${stacked ? -12 * (1 - emission) : 0}px)`,
                }}
              >
                {pulseLayer(true, outputPulse)}
                <FileText
                  size={20}
                  strokeWidth={1.1}
                  className="text-primary-light dark:text-primary-dark relative shrink-0"
                  aria-hidden="true"
                />
                <span className="relative">{t("output")}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

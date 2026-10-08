"use client";

import { motion } from "framer-motion";
import { ArrowUp, Paperclip } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

const question =
  "¿Qué criterios debo revisar para confirmar y realizar el seguimiento de una posible hipertensión arterial?";
const followUpQuestion =
  "¿Qué datos conviene registrar durante el seguimiento?";
const followUpAnswer =
  "Registra la evolución de las cifras, adherencia y tolerancia, cambios en el riesgo cardiovascular y cualquier hallazgo que requiera ajustar el plan o ampliar el estudio.";
const processingStates = [
  "Consultando guías",
  "Contrastando conocimiento validado",
  "Preparando respuesta",
];
const references = ["Protocolo clínico local", "Guía clínica de hipertensión"];

type TextPart = { text: string; strong?: boolean };
const answerBlocks: { parts: TextPart[]; citation?: number; list?: boolean }[] =
  [
    {
      parts: [
        { text: "Confirma las cifras con " },
        { text: "mediciones repetidas", strong: true },
        { text: " y, cuando proceda, monitorización fuera de consulta." },
      ],
      citation: 1,
    },
    {
      list: true,
      parts: [
        { text: "Valora el " },
        { text: "riesgo cardiovascular global", strong: true },
        { text: "." },
      ],
      citation: 2,
    },
    {
      list: true,
      parts: [
        { text: "Revisa posibles causas secundarias y " },
        { text: "daño orgánico", strong: true },
        { text: " antes de definir objetivos y seguimiento." },
      ],
    },
  ];
const answerLength = answerBlocks.reduce(
  (total, block) =>
    total + block.parts.reduce((length, part) => length + part.text.length, 0),
  0,
);

type Stage =
  | "idle"
  | "composing-first"
  | "docking-first"
  | "processing-first"
  | "answering-first"
  | "composing-follow-up"
  | "processing-follow-up"
  | "answering-follow-up"
  | "complete"
  | "resetting";

function useReducedMotion() {
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function ClinicalChatMock({ compact = false }: { compact?: boolean }) {
  const reducedMotion = useReducedMotion();
  const threadRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = useState(compact ? 40 : 44);
  const [stage, setStage] = useState<Stage>("idle");
  const [questionLength, setQuestionLength] = useState(0);
  const [followUpQuestionLength, setFollowUpQuestionLength] = useState(0);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [typedAnswerLength, setTypedAnswerLength] = useState(0);
  const [followUpAnswerLength, setFollowUpAnswerLength] = useState(0);

  useEffect(() => {
    if (reducedMotion === null || reducedMotion) return;
    const controller = new AbortController();
    const { signal } = controller;
    const pause = (duration: number) =>
      new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timeout);
          reject(new DOMException("Demo stopped", "AbortError"));
        };
        const timeout = setTimeout(() => {
          signal.removeEventListener("abort", abort);
          resolve();
        }, duration);
        signal.addEventListener("abort", abort, { once: true });
      });
    const typeText = async (
      length: number,
      update: (length: number) => void,
      speed: number,
    ) => {
      for (let index = 1; index <= length; index++) {
        update(index);
        await pause(speed);
      }
    };
    const run = async () => {
      try {
        while (!signal.aborted) {
          setStage("idle");
          setQuestionLength(0);
          setFollowUpQuestionLength(0);
          setTypedAnswerLength(0);
          setFollowUpAnswerLength(0);
          setProcessingIndex(0);
          await pause(1500);
          setStage("composing-first");
          await typeText(question.length, setQuestionLength, 19);
          await pause(500);
          setStage("docking-first");
          await pause(280);
          setStage("processing-first");
          for (let index = 0; index < processingStates.length; index++) {
            setProcessingIndex(index);
            await pause(850);
          }
          setStage("answering-first");
          await typeText(answerLength, setTypedAnswerLength, 26);
          await pause(2000);
          setStage("composing-follow-up");
          await typeText(
            followUpQuestion.length,
            setFollowUpQuestionLength,
            22,
          );
          await pause(500);
          setStage("processing-follow-up");
          await pause(1100);
          setStage("answering-follow-up");
          await typeText(followUpAnswer.length, setFollowUpAnswerLength, 24);
          await pause(500);
          setStage("complete");
          await pause(5000);
          setStage("resetting");
          await pause(300);
        }
      } catch (error) {
        if (!signal.aborted) throw error;
      }
    };
    void run();
    return () => controller.abort();
  }, [reducedMotion]);

  const staticDemo = reducedMotion === true;
  const centered =
    !staticDemo && (stage === "idle" || stage === "composing-first");
  const showQuestion = staticDemo || (!centered && stage !== "docking-first");
  const showAnswer =
    staticDemo || (showQuestion && stage !== "processing-first");
  const showFollowUp =
    !staticDemo &&
    [
      "processing-follow-up",
      "answering-follow-up",
      "complete",
      "resetting",
    ].includes(stage);
  const showFollowUpAnswer = showFollowUp && stage !== "processing-follow-up";
  const showReferences =
    staticDemo || stage === "complete" || stage === "resetting";
  const composing =
    !staticDemo &&
    ["composing-first", "docking-first", "composing-follow-up"].includes(stage);
  const processing =
    !staticDemo &&
    [
      "processing-first",
      "processing-follow-up",
      "answering-first",
      "answering-follow-up",
    ].includes(stage);
  const inputText = composing
    ? stage === "composing-follow-up"
      ? followUpQuestion.slice(0, followUpQuestionLength)
      : question.slice(0, questionLength)
    : processing
      ? "El comité está respondiendo..."
      : "Pregunta clínica al comité...";

  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const homeGrid = document.querySelector<HTMLElement>("[data-home-grid]");
    const copy = grid
      .closest("section")
      ?.querySelector<HTMLElement>("[data-home-copy]");
    let frame = 0;
    let ownedPosition = "";
    let copyOffsetX = 0;
    let copyOffsetY = 0;
    const alignGrid = () => {
      frame = 0;
      const bounds = grid.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const mock = grid.closest("[data-stage]")!.getBoundingClientRect();
      // Document coordinates keep the fixed page grid stationary on scroll.
      // Hidden variants must not overwrite the visible mock's grid origin.
      const originX = (mock.left + window.scrollX) % 44;
      const originY = (mock.top + window.scrollY) % 44;
      ownedPosition = `${originX}px ${originY}px`;
      homeGrid?.style.setProperty("--home-grid-position", ownedPosition);
      // CSS fixes the texture to the viewport, sharing the page's origin.
      // No scroll handler: JS updates can lag behind compositor scrolling.
      grid.style.backgroundAttachment = "fixed";
      grid.style.backgroundPosition = ownedPosition;
      if (copy) {
        const copyBounds = copy.getBoundingClientRect();
        const left = copyBounds.left - copyOffsetX;
        const top = copyBounds.top - copyOffsetY;
        // Snap the whole copy block to the nearest intersection without
        // changing its layout dimensions or the text's line breaks.
        copyOffsetX =
          mock.left + Math.round((left - mock.left) / 44) * 44 - left;
        copyOffsetY = mock.top + Math.round((top - mock.top) / 44) * 44 - top;
        copy.style.setProperty(
          "--home-copy-offset",
          `${copyOffsetX}px ${copyOffsetY}px`,
        );
      }
    };
    const scheduleAlignment = () => {
      if (!frame) frame = requestAnimationFrame(alignGrid);
    };
    alignGrid();
    const observer = new ResizeObserver(scheduleAlignment);
    observer.observe(grid);
    observer.observe(document.documentElement);
    if (copy) observer.observe(copy);
    window.addEventListener("resize", scheduleAlignment);
    document.fonts.addEventListener("loadingdone", scheduleAlignment);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      copy?.style.removeProperty("--home-copy-offset");
      if (
        ownedPosition &&
        homeGrid?.style.getPropertyValue("--home-grid-position") ===
          ownedPosition
      ) {
        homeGrid?.style.removeProperty("--home-grid-position");
      }
      window.removeEventListener("resize", scheduleAlignment);
      document.fonts.removeEventListener("loadingdone", scheduleAlignment);
    };
  }, []);

  useLayoutEffect(() => {
    const composer = composerRef.current;
    if (!composer) return;
    const measure = () =>
      setComposerHeight(composer.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(composer);
    return () => observer.disconnect();
  }, [compact]);

  useLayoutEffect(() => {
    const thread = threadRef.current;
    if (!thread) return;
    const update = () => {
      // The static consultation starts at its question, rather than its bibliography.
      thread.scrollTop = staticDemo || centered ? 0 : thread.scrollHeight;
    };
    update();
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(thread);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [
    stage,
    staticDemo,
    centered,
    typedAnswerLength,
    followUpAnswerLength,
    composerHeight,
    compact,
  ]);

  return (
    <div
      role="img"
      aria-label="Demostración de BinPar: una consulta clínica, una respuesta con evidencia y sus referencias."
      data-stage={staticDemo ? "static" : stage}
      data-compact={compact}
      className={`shadow-big-blocks @container pointer-events-none relative isolate overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80 backdrop-blur-sm select-none dark:border-cyan-300/15 dark:bg-[#06111f] ${compact ? "h-87.5" : "h-110"}`}
    >
      <div aria-hidden="true" className="flex h-full">
        <motion.div
          className={`relative min-w-0 flex-1 ${compact ? "[--mock-margin:12px]" : "[--mock-margin:24px]"}`}
          animate={{ opacity: !staticDemo && stage === "resetting" ? 0 : 1 }}
          transition={{ duration: staticDemo ? 0 : 0.3 }}
        >
          <div
            ref={gridRef}
            data-mock-grid=""
            className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]"
          />
          <div
            className={`absolute inset-0 bg-white mask-[linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] transition-opacity duration-300 motion-reduce:transition-none dark:bg-[#06111f] ${centered ? "opacity-0" : "opacity-100"}`}
          />
          <div
            ref={threadRef}
            data-mock-thread=""
            className={`font-body absolute inset-0 overflow-y-hidden px-(--mock-margin) text-slate-800 dark:text-slate-200 ${compact ? "text-xs leading-5" : "text-[13px] leading-5.5"}`}
            style={{
              // Clip the conversation above the docked composer rather than
              // allowing messages to scroll behind it.
              bottom: centered ? 0 : composerHeight + 32,
              maskImage: staticDemo
                ? undefined
                : "linear-gradient(to bottom, transparent, black 12px)",
            }}
          >
            <div
              className={`mx-auto flex min-h-full max-w-3xl flex-col ${staticDemo ? "gap-2 pt-3" : "gap-4 pt-6"}`}
            >
              {showQuestion && (
                <UserMessage compact={compact} fullWidth={staticDemo}>
                  {question}
                </UserMessage>
              )}
              {!staticDemo && stage === "processing-first" && (
                <ProcessingLabel label={processingStates[processingIndex]!} />
              )}
              {showAnswer && (
                <AssistantAnswer
                  length={staticDemo ? answerLength : typedAnswerLength}
                  condensed={staticDemo}
                />
              )}
              {showFollowUp && (
                <UserMessage compact={compact}>{followUpQuestion}</UserMessage>
              )}
              {showFollowUp && stage === "processing-follow-up" && (
                <ProcessingLabel label="Contrastando seguimiento" />
              )}
              {showFollowUpAnswer && (
                <p>
                  {followUpAnswer.slice(0, followUpAnswerLength)}
                  {followUpAnswerLength === followUpAnswer.length ? (
                    <Citation number={1} />
                  ) : (
                    <Caret />
                  )}
                </p>
              )}
              {showReferences && <MockReferences condensed={staticDemo} />}
            </div>
          </div>
          <div
            className={`absolute right-(--mock-margin) bottom-[calc(50%+20px)] left-(--mock-margin) text-center transition-opacity duration-110 motion-reduce:transition-none ${centered ? "opacity-100" : "opacity-0"}`}
          >
            <BrandIsotype className="mx-auto mb-3 size-10" />
            <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.22em] uppercase">
              BinPar
            </p>
            <p className="font-display mt-2 text-lg font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
              Comité clínico
            </p>
          </div>
          <div
            className="absolute right-(--mock-margin) left-(--mock-margin) z-10 transition-[top,translate] duration-280 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{
              top: centered ? "50%" : "calc(100% - 24px)",
              translate: centered ? "0 0" : "0 -100%",
            }}
          >
            <MockComposer
              compact={compact}
              composing={composing}
              text={inputText}
              composerRef={composerRef}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function BrandIsotype({ className }: { className: string }) {
  return (
    <span className={`block shrink-0 ${className}`}>
      <Image
        src="/logos/binpar-brand/binpar-isotipo-light.svg"
        alt=""
        width={121.76}
        height={131.79}
        className="size-full object-contain dark:hidden"
      />
      <Image
        src="/logos/binpar-brand/binpar-isotipo-dark.svg"
        alt=""
        width={121.76}
        height={131.79}
        className="hidden size-full object-contain dark:block"
      />
    </span>
  );
}

function UserMessage({
  children,
  compact,
  fullWidth = false,
}: {
  children: ReactNode;
  compact: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div
      className={`bg-primary-light shadow-big-blocks dark:bg-primary-dark ml-auto ${fullWidth ? "max-w-full" : "max-w-[82%]"} shrink-0 rounded-2xl rounded-br-md text-white dark:text-[#04111e] ${compact ? "px-3 py-2" : "px-3.5 py-2.5"}`}
    >
      {children}
    </div>
  );
}

function Caret() {
  return (
    <span className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-3 w-px animate-pulse align-middle motion-reduce:animate-none" />
  );
}

function Citation({ number }: { number: number }) {
  return (
    <sup className="font-display text-primary-light dark:text-primary-dark ml-0.5 text-[0.8em] leading-none font-semibold underline decoration-current/35 underline-offset-2">
      [{number}]
    </sup>
  );
}

function AssistantAnswer({
  length,
  condensed = false,
}: {
  length: number;
  condensed?: boolean;
}) {
  let offset = 0;
  const blocks = answerBlocks.map((block, index) => {
    const start = offset;
    const parts = block.parts.map((part, partIndex) => {
      const text = part.text.slice(0, Math.max(0, length - offset));
      offset += part.text.length;
      return part.strong ? (
        <strong key={partIndex} className="font-bold">
          {text}
        </strong>
      ) : (
        <span key={partIndex}>{text}</span>
      );
    });
    if (length <= start) return null;
    const content = (
      <>
        {parts}
        {length >= offset && block.citation && (
          <Citation number={block.citation} />
        )}
        {length > start && length < offset && <Caret />}
      </>
    );
    if (condensed)
      return (
        <span key={index}>
          {index > 0 && " "}
          {content}
        </span>
      );
    return block.list ? (
      <li key={index} className="pl-0.5">
        {content}
      </li>
    ) : (
      <p key={index}>{content}</p>
    );
  });
  if (condensed) return <p>{blocks}</p>;
  return (
    <div className="space-y-2">
      {blocks[0]}
      {length >
        answerBlocks[0]!.parts.reduce(
          (total, part) => total + part.text.length,
          0,
        ) && <ul className="ml-4 list-disc space-y-1">{blocks.slice(1)}</ul>}
    </div>
  );
}

function ProcessingLabel({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
      <BrandIsotype className="mt-0.5 size-4" />
      <span>
        {label}
        <span className="ml-0.5 animate-pulse motion-reduce:animate-none">
          …
        </span>
      </span>
    </div>
  );
}

function MockReferences({ condensed }: { condensed: boolean }) {
  return (
    <div
      className={`border-t border-cyan-800/15 dark:border-cyan-300/15 ${condensed ? "pt-2" : "pt-4"}`}
    >
      <p
        className={`font-display text-primary-light dark:text-primary-dark font-bold tracking-[0.16em] uppercase ${condensed ? "text-[9px]" : "text-[11px]"}`}
      >
        Bibliografía
      </p>
      <ol className={condensed ? "mt-2 space-y-1" : "mt-3 space-y-2.5"}>
        {references.map((reference, index) => (
          <li key={reference} className="flex items-start gap-2.5">
            <span
              className={`font-display border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark-lighter grid shrink-0 place-items-center rounded-md border text-[10px] font-semibold ${condensed ? "size-4.5" : "size-5"}`}
            >
              {index + 1}
            </span>
            <span className="min-w-0 flex-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              {reference}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function MockComposer({
  compact,
  composing,
  text,
  composerRef,
}: {
  compact: boolean;
  composing: boolean;
  text: string;
  composerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    const mirror = mirrorRef.current;
    if (!mirror) return;
    const measure = () => {
      const lineHeight = parseFloat(getComputedStyle(mirror).lineHeight);
      setExpanded(
        composing && mirror.getBoundingClientRect().height > lineHeight + 1,
      );
    };
    measure();
    // Measure at the single-line width even after expanding, so the wider
    // text area cannot cause the composer to alternate between layouts.
    const observer = new ResizeObserver(measure);
    observer.observe(mirror);
    return () => observer.disconnect();
  }, [composing, compact]);

  return (
    <div
      ref={composerRef}
      data-mock-composer=""
      data-expanded={expanded}
      className={`font-body shadow-big-blocks relative mx-auto grid max-w-3xl grid-cols-[44px_minmax(0,1fr)_44px] overflow-hidden border border-cyan-800/15 bg-white/85 backdrop-blur-md dark:border-cyan-300/15 dark:bg-[#152230]/90 dark:shadow-[0_0_32px_rgba(0,188,187,0.12)] ${expanded ? "rounded-[20px]" : "rounded-[28px]"} ${compact ? "min-h-10 text-xs leading-5" : "min-h-11 text-[13px] leading-5.5"}`}
    >
      <span
        ref={mirrorRef}
        aria-hidden="true"
        className="invisible absolute top-0 right-11 left-11 wrap-break-word"
      >
        {text}
        {composing && <Caret />}
      </span>
      <span
        className={`col-start-1 grid size-7 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:border-cyan-300/15 dark:text-slate-400 ${expanded ? "row-start-2 my-2" : "row-start-1"}`}
      >
        <Paperclip className="size-3.5" strokeWidth={1.8} />
      </span>
      <span
        className={`row-start-1 max-h-23.5 min-w-0 overflow-hidden ${expanded ? "col-span-3 col-start-1 px-3 pt-3 pb-1" : "col-start-2 self-center py-2"} ${composing ? "wrap-break-word text-slate-700 dark:text-slate-200" : "truncate text-slate-500 dark:text-slate-400"}`}
      >
        {text}
        {composing && <Caret />}
      </span>
      <span
        className={`bg-primary-light dark:bg-primary-dark col-start-3 grid size-7 place-items-center place-self-center rounded-full text-white dark:text-[#04111e] ${expanded ? "row-start-2 my-2" : "row-start-1"} ${composing ? "opacity-100" : "opacity-45"}`}
      >
        <ArrowUp className="size-4" strokeWidth={1.8} />
      </span>
    </div>
  );
}

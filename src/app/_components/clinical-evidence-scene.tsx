"use client";

import {
  ArrowUp,
  FileText,
  Maximize2,
  MousePointer2,
  Paperclip,
  X,
} from "lucide-react";
import Image from "next/image";
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { processResult as result } from "./clinical-process-data";
import { evidenceDocumentContext as sourceText } from "./evidence-document-context";
import { ProcessChatVeil } from "./clinical-process-visuals";
import {
  processAnswerParagraphs,
  writtenCharacters,
} from "./clinical-process-typing";

const evidence = result.evidence;
// Verbatim passages from the captured answer; its middle is outside this
// framing. Retain the original numbering of the references shown here.
const paragraphs = processAnswerParagraphs;
const tokens = paragraphs.map((paragraph) =>
  paragraph
    .split(/(⟦[^⟧]+⟧|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => {
      if (part.startsWith("⟦")) {
        const citation = result.citations.find(
          (citation) => citation.anchor === part.slice(1, -1),
        )!;
        return {
          text: `[${citation.order}]`,
          citation: citation.order,
          strong: false,
        };
      }
      return {
        text: part.replace(/\*\*/g, ""),
        citation: undefined,
        strong: part.startsWith("**"),
      };
    }),
);
const answerLength = tokens
  .flat()
  .reduce((sum, token) => sum + token.text.length, 0);
const shownReferences = result.citations.filter((citation) =>
  tokens.flat().some((token) => token.citation === citation.order),
);
const quotedText = evidence.quote.replace(/\*/g, "").replace(/\.$/, "");
function readingTop(element: HTMLElement, reply: HTMLElement) {
  const claim = reply.querySelector<HTMLElement>("[data-evidence-claim]");
  const preceding = reply.querySelector<HTMLElement>(
    "[data-evidence-precipitant]",
  );
  const bibliography = element.querySelector<HTMLElement>(
    "[data-evidence-bibliography] ol",
  );
  if (!claim || !preceding || !bibliography) return 0;
  const sceneWidth =
    element.closest<HTMLElement>(".evidence-scene")!.clientWidth;
  const finalChatWidth =
    sceneWidth >= 720
      ? sceneWidth * 0.43
      : sceneWidth >= 560
        ? sceneWidth * 0.38
        : sceneWidth;
  // Decide against the final column width, so opening the panel does not
  // switch reading anchors halfway through the resize.
  const fits =
    finalChatWidth >= 350 &&
    bibliography.getBoundingClientRect().bottom -
      preceding.getBoundingClientRect().top <=
      element.clientHeight - 4;
  return (
    (fits ? preceding : claim).getBoundingClientRect().top -
    element.getBoundingClientRect().top +
    element.scrollTop
  );
}

function progress(
  time: number,
  start: number,
  duration: number,
  reduced: boolean,
) {
  return reduced ? 1 : Math.max(0, Math.min(1, (time - start) / duration));
}
function reveal(
  time: number,
  start: number,
  duration: number,
  reduced: boolean,
) {
  const value = progress(time, start, duration, reduced);
  return value * value * (3 - 2 * value);
}
export function EvidenceScene({
  seconds,
  reduced,
  continuation,
}: {
  seconds: number;
  reduced: boolean;
  continuation?: {
    sourceVisibility: number;
    messages?: ReactNode;
    composer?: ReactNode;
    scroll: number;
  };
}) {
  const time = continuation || reduced ? 24 : seconds;
  const viewport = useRef<HTMLDivElement>(null);
  const response = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const documentContent = useRef<HTMLDivElement>(null);
  const documentTarget = useRef<HTMLHeadingElement>(null);
  const nextMessage = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLDivElement>(null);
  const [composerHeight, setComposerHeight] = useState(52);
  const [documentOffset, setDocumentOffset] = useState(0);
  const [citationPoint, setCitationPoint] = useState({ x: 0, y: 241 });
  const [viewportWidth, setViewportWidth] = useState(0);
  const [sceneWidth, setSceneWidth] = useState(0);
  const sourceWidth =
    sceneWidth >= 720
      ? sceneWidth * 0.57
      : sceneWidth >= 560
        ? sceneWidth * 0.62
        : sceneWidth;
  const written = writtenCharacters(time, 0.8, answerLength, reduced);
  const bibliography = reveal(time, 6, 0.35, reduced);
  const focus = reveal(time, 6.35, 0.8, reduced);
  const selected = reveal(time, 9.55, 0.25, reduced);
  const sourceVisibility = continuation?.sourceVisibility ?? 1;
  const panel = reveal(time, 10.25, 1.15, reduced) * sourceVisibility;
  const source = reveal(time, 10.25, 0.25, reduced) * sourceVisibility;
  const document = reveal(time, 11.55, 0.4, reduced);
  const located = reveal(time, 13.15, 0.7, reduced);
  const highlight = reveal(time, 13.95, 0.4, reduced);
  const fade =
    reduced || continuation
      ? 1
      : reveal(time, 0.2, 0.35, false) * (1 - reveal(time, 19.3, 0.7, false));
  const pointer = reduced
    ? 0
    : reveal(time, 7.35, 0.35, false) * (1 - reveal(time, 9.95, 0.25, false));
  // A short reading gesture, then a deliberate approach to the citation.
  const pointerSweep = reveal(time, 7.55, 0.85, reduced);
  const pointerApproach = reveal(time, 8.5, 0.9, reduced);
  const pointerX =
    citationPoint.x *
    (pointerSweep * 0.45 * (1 - pointerApproach) + pointerApproach);
  const pointerY =
    (241 - pointerSweep * 24) * (1 - pointerApproach) +
    citationPoint.y * pointerApproach;
  const click = progress(time, 9.55, 0.7, reduced);
  const pulse =
    reduced || click === 0 || click === 1 ? 0 : Math.sin(click * Math.PI);
  const focusRef = useRef(focus);
  useLayoutEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      // Anchor synchronously in the resize notification, before paint.
      // React state alone runs a frame behind the CSS width interpolation.
      if (focusRef.current === 1 && response.current && !nextMessage.current) {
        element.scrollTop = readingTop(element, response.current);
      }
      setViewportWidth(element.clientWidth);
      setSceneWidth(scene.current?.clientWidth ?? 0);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const element = viewport.current;
    const reply = response.current;
    if (!element || !reply) return;
    const claim = reply.querySelector<HTMLElement>("[data-evidence-claim]");
    const next = nextMessage.current;
    if (next && continuation) {
      const nextTop =
        next.getBoundingClientRect().top -
        element.getBoundingClientRect().top +
        element.scrollTop;
      const destination = Math.max(
        nextTop - 12,
        nextTop + next.scrollHeight - element.clientHeight + 12,
      );
      const initial = readingTop(element, reply);
      element.scrollTop =
        initial + (destination - initial) * continuation.scroll;
    } else if (focus > 0 && claim) {
      const top = readingTop(element, reply);
      element.scrollTop = Math.max(0, top * focus);
    } else if (written < answerLength) {
      element.scrollTop = Math.max(
        0,
        reply.scrollHeight - element.clientHeight + 12,
      );
    }
  }, [written, focus, viewportWidth, continuation, composerHeight]);
  useLayoutEffect(() => {
    const element = composer.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setComposerHeight(element.clientHeight),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const content = documentContent.current;
    const target = documentTarget.current;
    if (!content || !target) return;
    const observer = new ResizeObserver(() =>
      setDocumentOffset(target.offsetTop),
    );
    observer.observe(content);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    const root = scene.current;
    const citation = response.current?.querySelector<HTMLElement>(
      `[data-evidence-citation="${evidence.referenceIndex}"]`,
    );
    if (!root || !citation) return;
    const bounds = root.getBoundingClientRect();
    const target = citation.getBoundingClientRect();
    const x = target.left - bounds.left + 4;
    const y = target.top - bounds.top + 4;
    setCitationPoint((previous) =>
      previous.x === x && previous.y === y ? previous : { x, y },
    );
  }, [written, focus, panel, viewportWidth]);

  let remaining = written;
  return (
    <div
      ref={scene}
      data-scene-content=""
      data-evidence-time={time.toFixed(2)}
      data-evidence-phase={
        highlight === 1
          ? "context"
          : panel > 0
            ? "document"
            : selected > 0
              ? "citation"
              : "answer"
      }
      className="evidence-scene font-body relative h-[480px] overflow-hidden"
      style={{ "--panel": panel, "--highlight": highlight } as CSSProperties}
    >
      <div className="evidence-workspace h-full" style={{ opacity: fade }}>
        <div className="evidence-chat relative min-w-0 overflow-hidden">
          <ProcessChatVeil />
          <div className="relative flex h-14 items-center gap-2.5 px-5 @min-[600px]:px-6">
            <span className="inline-block size-6 shrink-0">
              <Image
                src="/logos/binpar-brand/binpar-isotipo-light.svg"
                alt=""
                width={24}
                height={24}
                className="size-full object-contain dark:hidden"
              />
              <Image
                src="/logos/binpar-brand/binpar-isotipo-dark.svg"
                alt=""
                width={24}
                height={24}
                className="hidden size-full object-contain dark:block"
              />
            </span>
            <span className="font-display text-sm font-semibold text-[#05215e] dark:text-slate-100">
              BinPar
            </span>
          </div>
          <div
            ref={viewport}
            data-evidence-chat-viewport=""
            className="evidence-messages absolute inset-x-0 top-14 bottom-[76px] overflow-hidden px-5 text-[13px] leading-[22px] text-slate-600 @min-[600px]:px-6 dark:text-slate-300"
            style={{ bottom: 24 + composerHeight }}
          >
            {written === 0 && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pensando…
              </p>
            )}
            <div ref={response} data-evidence-response="">
              {tokens.map((paragraph, index) => {
                const paragraphLength = paragraph.reduce(
                  (sum, token) => sum + token.text.length,
                  0,
                );
                const visible = Math.min(remaining, paragraphLength);
                remaining = Math.max(0, remaining - paragraphLength);
                let budget = visible;
                return visible > 0 ? (
                  <div key={index} className={index < 2 ? "mb-3" : undefined}>
                    <p
                      data-evidence-claim={index === 2 ? "" : undefined}
                      data-evidence-precipitant={index === 1 ? "" : undefined}
                      className="min-h-0 overflow-hidden wrap-break-word whitespace-pre-wrap"
                    >
                      {paragraph.map((token, tokenIndex) => {
                        const count = Math.min(budget, token.text.length);
                        budget = Math.max(0, budget - token.text.length);
                        if (!count) return null;
                        if (token.citation !== undefined)
                          return count === token.text.length ? (
                            <span
                              key={tokenIndex}
                              data-evidence-citation={token.citation}
                              className="text-primary-light dark:text-primary-dark relative inline-flex rounded-sm px-0.5 align-super text-[10px] leading-none font-semibold"
                              style={
                                token.citation === evidence.referenceIndex
                                  ? {
                                      backgroundColor: `color-mix(in srgb, currentColor ${selected * 15}%, transparent)`,
                                    }
                                  : undefined
                              }
                            >
                              {token.text}
                              {token.citation === evidence.referenceIndex && (
                                <span
                                  aria-hidden="true"
                                  className="evidence-click pointer-events-none absolute top-1/2 left-1/2 size-11 rounded-full bg-current"
                                  style={{
                                    opacity: pulse * 0.15,
                                    transform: `translate(-50%, -50%) scale(${0.35 + click * 0.65})`,
                                  }}
                                />
                              )}
                            </span>
                          ) : null;
                        return token.strong ? (
                          <strong
                            key={tokenIndex}
                            className="font-semibold text-[#05215e] dark:text-slate-100"
                          >
                            {token.text.slice(0, count)}
                          </strong>
                        ) : (
                          <span key={tokenIndex}>
                            {token.text.slice(0, count)}
                          </span>
                        );
                      })}
                      {visible < paragraphLength && (
                        <span
                          aria-hidden="true"
                          className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-3.5 w-px align-middle"
                        />
                      )}
                    </p>
                  </div>
                ) : null;
              })}
            </div>
            <section
              data-evidence-bibliography=""
              className="mt-3 border-t border-cyan-800/15 pt-3 pb-2 dark:border-cyan-300/15"
              style={{
                opacity: bibliography,
                visibility: bibliography > 0 ? "visible" : "hidden",
              }}
            >
              <p className="font-display text-primary-light dark:text-primary-dark text-[11px] font-bold tracking-[0.16em] uppercase">
                Bibliografía
              </p>
              <ol className="mt-3 space-y-2">
                {shownReferences.map((citation, index) => (
                  <li
                    key={citation.anchor}
                    className="flex items-start gap-2.5"
                    style={{
                      opacity: reveal(time, 6 + index * 0.06, 0.3, reduced),
                    }}
                  >
                    <span className="font-display border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark-lighter grid size-6 shrink-0 place-items-center rounded-md border text-[10px] font-semibold">
                      {citation.order}
                    </span>
                    <span
                      className="min-w-0 flex-1 truncate pt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400"
                      title={citation.source}
                    >
                      {citation.source}.
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            {continuation?.messages && (
              <div ref={nextMessage} className="mt-5">
                {continuation.messages}
              </div>
            )}
            {/* Space below the excerpt lets the fixed reading anchor remain
                at the top even when the bibliography is shorter than the viewport. */}
            <div aria-hidden="true" className="h-[338px]" />
          </div>
          <div
            ref={composer}
            className="absolute inset-x-4 bottom-4 @min-[600px]:inset-x-6"
          >
            {continuation?.composer ?? (
              <div
                data-process-composer=""
                className="shadow-big-blocks relative grid h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] items-center overflow-hidden rounded-[28px] border border-cyan-800/15 bg-white/85 backdrop-blur-md dark:border-cyan-300/15 dark:bg-[#152230e6]/90"
              >
                <span className="grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:border-cyan-300/15 dark:text-slate-400">
                  <Paperclip size={20} strokeWidth={1.1} />
                </span>
                <span className="min-w-0 truncate text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {written < answerLength
                    ? "El comité está respondiendo..."
                    : "Pregunta clínica al comité..."}
                </span>
                <span className="bg-primary-light dark:bg-primary-dark grid size-9 place-items-center place-self-center rounded-full text-white opacity-45 dark:text-[#04111e]">
                  <ArrowUp size={20} strokeWidth={1.1} />
                </span>
              </div>
            )}
          </div>
        </div>
        <div
          data-process-source-viewer=""
          className="evidence-source flex min-w-0 flex-col overflow-hidden border-cyan-800/15 bg-white dark:border-cyan-300/15 dark:bg-[#152230]"
          style={{
            width: sourceWidth || undefined,
            opacity: source,
            pointerEvents: source === 1 ? "auto" : "none",
          }}
        >
          <div className="evidence-tabs flex h-11 shrink-0 items-end border-b border-cyan-800/10 bg-[#e8f2f7]/30 px-2 pt-1 dark:border-cyan-300/15 dark:bg-[#06111f]/45">
            <div className="evidence-tab relative -mb-px flex h-10 max-w-56 min-w-0 flex-1 items-center gap-1.5 rounded-t-md border border-b-0 bg-white px-2.5 text-[#05215e] dark:bg-[#152230] dark:text-slate-100">
              <FileText
                size={20}
                strokeWidth={1.1}
                className="-mt-1 shrink-0"
              />
              <span className="-mt-1 min-w-0 flex-1 truncate text-[11px] font-semibold">
                {evidence.source}
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
          <header className="flex min-w-0 shrink-0 items-center gap-2 border-b border-cyan-800/10 bg-white px-4 py-3 dark:border-cyan-300/15 dark:bg-[#152230]">
            <div className="min-w-0 flex-1">
              <p className="font-display text-primary-light dark:text-primary-dark text-[9px] font-bold tracking-[0.16em] uppercase">
                Fuente de consulta
              </p>
              <p className="font-display mt-0.5 truncate text-sm font-semibold text-[#05215e] dark:text-slate-100">
                {evidence.source}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <Maximize2 size={20} strokeWidth={1.1} />
              <span>Ver documento completo</span>
            </span>
          </header>
          <div
            className="evidence-document min-h-0 flex-1 overflow-hidden px-5 pt-5 pb-8 text-[12px] leading-5 text-slate-700 @min-[600px]:px-6 @min-[600px]:text-[13px] @min-[600px]:leading-6 dark:text-slate-300"
            style={{ opacity: document }}
          >
            <div
              ref={documentContent}
              className="evidence-document-content relative"
              data-document-scroll={located.toFixed(3)}
              style={{
                transform: `translateY(${-documentOffset * located}px)`,
              }}
            >
              <p>Otras NTIC son:</p>
              <ul className="my-4 list-disc space-y-3 pl-4">
                {sourceText.nephropathies.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <h3 className="font-display mt-6 mb-3 text-sm font-semibold text-[#05215e] dark:text-slate-100">
                Dosis de fármacos y riñón
              </h3>
              <p>{sourceText.dosing}</p>
              <ul className="my-4 list-disc space-y-2 pl-4">
                <li>Disminuyendo la dosis.</li>
                <li>Aumentando el intervalo entre las dosis.</li>
              </ul>
              <h3 className="font-display mt-6 mb-3 text-sm font-semibold text-[#05215e] dark:text-slate-100">
                Antimicrobianos
              </h3>
              <ul className="my-4 list-disc space-y-3 pl-4">
                {sourceText.antimicrobials.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
              <figure className="my-5">
                <Image
                  src="/img/evidence-source-image.jpg"
                  alt="Imagen del documento de consulta con dos flechas señalando detalles."
                  width={750}
                  height={878}
                  sizes="(min-width: 1024px) 500px, (min-width: 640px) 450px, 100vw"
                  loading="eager"
                  className="h-auto w-full rounded-2xl"
                />
              </figure>
              <h3
                ref={documentTarget}
                className="font-display mt-6 mb-3 text-sm font-semibold text-[#05215e] dark:text-slate-100"
              >
                Antiinflamatorios no esteroideos
              </h3>
              <p data-evidence-passage="">
                <mark
                  data-source-highlight="literal"
                  className="evidence-highlight rounded-sm text-inherit"
                >
                  {quotedText}
                </mark>
                {sourceText.nsaids.slice(quotedText.length)}
              </p>
              <p className="mt-4">{sourceText.interactions}</p>
            </div>
          </div>
        </div>
      </div>
      <MousePointer2
        aria-hidden="true"
        size={28}
        strokeWidth={1.1}
        className="evidence-pointer text-primary-light dark:text-primary-dark pointer-events-none absolute top-0 left-0 z-20 fill-white dark:fill-[#152230]"
        style={{
          opacity: pointer * fade,
          transform: `translate(${pointerX}px, ${pointerY}px) scale(${1 - pulse * 0.08})`,
        }}
      />
      <style jsx>{`
        .evidence-workspace {
          display: grid;
          grid-template-columns: minmax(0, 1fr);
          transition:
            grid-template-columns 80ms linear,
            opacity 80ms linear;
        }
        .evidence-source {
          position: absolute;
          inset: 0;
          z-index: 10;
          transition: opacity 80ms linear;
        }
        .evidence-messages {
          overflow-anchor: none;
          scrollbar-width: none;
        }
        .evidence-messages::-webkit-scrollbar {
          display: none;
        }
        .evidence-highlight {
          transition: background-color 80ms linear;
          background-color: color-mix(
            in srgb,
            var(--color-secondary-light) calc(var(--highlight) * 55%),
            transparent
          );
        }
        .evidence-tabs {
          --tab-border: color-mix(in oklab, var(--color-cyan-800) 10%, #fff);
          --tab-surface: #fff;
        }
        .evidence-tab {
          border-color: var(--tab-border);
        }
        .evidence-tab::before,
        .evidence-tab::after {
          content: "";
          position: absolute;
          bottom: 0;
          width: 8px;
          height: 8px;
          pointer-events: none;
        }
        .evidence-tab::before {
          left: -8px;
          background: radial-gradient(
            circle at top left,
            transparent 7px,
            var(--tab-border) 7px,
            var(--tab-border) 8px,
            var(--tab-surface) 8px
          );
        }
        .evidence-tab::after {
          right: -8px;
          background: radial-gradient(
            circle at top right,
            transparent 7px,
            var(--tab-border) 7px,
            var(--tab-border) 8px,
            var(--tab-surface) 8px
          );
        }
        :global(.dark) .evidence-tabs {
          --tab-border: color-mix(in oklab, var(--color-cyan-300) 20%, #152230);
          --tab-surface: #152230;
        }
        :global(.dark) .evidence-highlight {
          background-color: color-mix(
            in srgb,
            var(--color-secondary-dark) calc(var(--highlight) * 25%),
            transparent
          );
        }
        [data-evidence-citation="5"] {
          transition: background-color 80ms linear;
        }
        .evidence-pointer,
        .evidence-click {
          transition:
            opacity 80ms linear,
            transform 80ms linear;
        }
        .evidence-document,
        [data-evidence-bibliography],
        ol > li {
          transition: opacity 80ms linear;
        }
        .evidence-document-content {
          transition: transform 80ms linear;
        }
        @media (prefers-reduced-motion: reduce) {
          .evidence-workspace,
          .evidence-source,
          .evidence-highlight,
          .evidence-pointer,
          .evidence-click,
          [data-evidence-citation="5"],
          .evidence-document,
          .evidence-document-content,
          [data-evidence-bibliography],
          ol > li {
            transition: none;
          }
        }
        @container (min-width: 560px) {
          .evidence-workspace {
            grid-template-columns:
              minmax(0, calc(100% - var(--panel) * 62%))
              minmax(0, 1fr);
          }
          .evidence-source {
            position: relative;
            inset: auto;
            z-index: auto;
            border-left-width: 1px;
          }
        }
        @container (min-width: 720px) {
          .evidence-workspace {
            grid-template-columns:
              minmax(0, calc(100% - var(--panel) * 57%))
              minmax(0, 1fr);
          }
        }
        @container (max-width: 350px) {
          .evidence-document {
            line-height: 19px;
          }
        }
      `}</style>
    </div>
  );
}

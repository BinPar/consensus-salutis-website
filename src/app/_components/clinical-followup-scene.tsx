"use client";

import { ArrowUp, Paperclip } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { EvidenceScene } from "./clinical-evidence-scene";
import { processFollowup as followup } from "./clinical-process-data";
import { typingDuration, writtenCharacters } from "./clinical-process-typing";

function reveal(time: number, start: number, duration: number) {
  const t = Math.max(0, Math.min(1, (time - start) / duration));
  return t * t * (3 - 2 * t);
}
const capturedParagraphs = followup.finalOpinion.split("\n\n");
// Three verbatim excerpts of the captured follow-up, keeping its citation numbers.
const replyParagraphs = [
  capturedParagraphs[0]!.split(". ")[0]! + ".",
  capturedParagraphs[3]!.split(" En un fracaso")[0]!,
  capturedParagraphs[4]!,
].map((paragraph) =>
  paragraph
    .split(/(⟦[^⟧]+⟧)/g)
    .filter(Boolean)
    .map((text) => {
      if (!text.startsWith("⟦")) return { text, citation: false };
      const number =
        followup.citations.findIndex(
          (citation) => citation.anchor === text.slice(1, -1),
        ) + 1;
      return { text: `[${number}]`, citation: true };
    }),
);
const replyLength = replyParagraphs
  .flat()
  .reduce((sum, token) => sum + token.text.length, 0);
const questionStarts = 3.2;
const sentAt = questionStarts + typingDuration(followup.question.length) + 0.4;
const respondingAt = sentAt + 1.2;
const responseEnds = respondingAt + typingDuration(replyLength);
export const FOLLOWUP_DURATION = responseEnds + 5.7;

export function FollowupScene({
  seconds,
  reduced,
}: {
  seconds: number;
  reduced: boolean;
}) {
  const time = reduced ? responseEnds + 1 : seconds;
  const questionLength = writtenCharacters(
    time,
    questionStarts,
    followup.question.length,
    reduced,
  );
  const sent = time >= sentAt;
  const responding = time >= respondingAt;
  const written = writtenCharacters(time, respondingAt, replyLength, reduced);
  const fade = reduced ? 1 : 1 - reveal(time, FOLLOWUP_DURATION - 0.7, 0.7);
  let budget = written;
  return (
    <div
      data-scene-content=""
      data-followup-time={time.toFixed(2)}
      data-followup-phase={
        sent
          ? responding
            ? "response"
            : "thinking"
          : time >= questionStarts
            ? "question"
            : "context"
      }
      className="relative h-[480px]"
      style={{ opacity: fade }}
    >
      <EvidenceScene
        seconds={0}
        reduced={reduced}
        continuation={{
          sourceVisibility: 0,
          scroll: reveal(time, sentAt, 0.6),
          composer:
            time >= questionStarts ? (
              <FollowupComposer
                text={sent ? "" : followup.question.slice(0, questionLength)}
                typing={!sent && questionLength > 0}
              />
            ) : undefined,
          messages: sent ? (
            <div data-followup-messages="">
              <div className="bg-primary-light dark:bg-primary-dark ml-auto max-w-[92%] rounded-2xl rounded-br-md px-4 py-3 text-white dark:text-[#04111e]">
                {followup.question}
              </div>
              <div className="mt-5" data-followup-response="">
                {!responding ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pensando…
                  </p>
                ) : (
                  replyParagraphs.map((paragraph, index) => {
                    const paragraphLength = paragraph.reduce(
                      (sum, token) => sum + token.text.length,
                      0,
                    );
                    const visible = Math.min(budget, paragraphLength);
                    const tokens = paragraph.map((token, tokenIndex) => {
                      const count = Math.min(budget, token.text.length);
                      budget = Math.max(0, budget - token.text.length);
                      if (
                        !count ||
                        (token.citation && count < token.text.length)
                      )
                        return null;
                      return (
                        <span
                          key={tokenIndex}
                          className={
                            token.citation
                              ? "text-primary-light dark:text-primary-dark relative -top-1 px-0.5 align-baseline text-[10px] leading-[0] font-semibold"
                              : undefined
                          }
                        >
                          {token.text.slice(0, count)}
                        </span>
                      );
                    });
                    return tokens.some(Boolean) ? (
                      <p key={index} className="mb-4 last:mb-0">
                        {tokens}
                        {visible < paragraphLength && (
                          <span
                            aria-hidden="true"
                            className="bg-primary-light dark:bg-primary-dark relative top-0.5 ml-0.5 inline-block h-3.5 w-px align-baseline"
                          />
                        )}
                      </p>
                    ) : null;
                  })
                )}
              </div>
            </div>
          ) : undefined,
        }}
      />
    </div>
  );
}

function FollowupComposer({ text, typing }: { text: string; typing: boolean }) {
  const mirror = useRef<HTMLSpanElement>(null);
  const [expanded, setExpanded] = useState(false);
  useLayoutEffect(() => {
    const element = mirror.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setExpanded(typing && element.getBoundingClientRect().height > 25),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [typing]);
  return (
    <div
      data-process-composer=""
      data-expanded={expanded}
      className={`font-body shadow-big-blocks relative grid min-h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] border border-cyan-800/15 bg-white/85 text-sm leading-6 backdrop-blur-md dark:border-cyan-300/15 dark:bg-[#152230e6]/90 ${expanded ? "rounded-3xl" : "rounded-[28px]"}`}
    >
      <span
        ref={mirror}
        className="invisible absolute inset-x-14 wrap-break-word"
      >
        {text}
        {typing && <span className="inline-block h-3 w-px" />}
      </span>
      <span
        className={`grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:border-cyan-300/15 dark:text-slate-400 ${expanded ? "col-start-1 row-start-2 my-2.5" : "col-start-1 row-start-1"}`}
      >
        <Paperclip size={20} strokeWidth={1.1} />
      </span>
      <div
        className={`row-start-1 min-w-0 overflow-hidden wrap-break-word text-slate-700 dark:text-slate-200 ${expanded ? "col-span-3 col-start-1 px-4 pt-4 pb-1" : "col-start-2 self-center truncate py-3"}`}
      >
        {text || (
          <span className="text-slate-500 dark:text-slate-400">
            Pregunta clínica al comité...
          </span>
        )}
        {typing && (
          <span className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-4 w-px align-middle" />
        )}
      </div>
      <span
        className={`bg-primary-light dark:bg-primary-dark grid size-9 place-items-center place-self-center rounded-full text-white dark:text-[#04111e] ${expanded ? "col-start-3 row-start-2 my-2.5" : "col-start-3 row-start-1"} ${typing ? "opacity-100" : "opacity-45"}`}
      >
        <ArrowUp size={20} strokeWidth={1.1} />
      </span>
    </div>
  );
}

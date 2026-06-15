"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const question =
  "¿Qué criterios debo revisar para confirmar y realizar el seguimiento de una posible hipertensión arterial?";

const answer =
  "Confirma las cifras con mediciones repetidas y, cuando proceda, monitorización fuera de consulta. Valora el riesgo cardiovascular global, posibles causas secundarias y daño orgánico antes de definir objetivos y seguimiento.";

const followUpQuestion =
  "¿Qué datos conviene registrar durante el seguimiento?";

const followUpAnswer =
  "Registra la evolución de las cifras, adherencia y tolerancia, cambios en el riesgo cardiovascular y cualquier hallazgo que requiera ajustar el plan o ampliar el estudio.";

const processingStates = [
  "Consultando guías",
  "Contrastando conocimiento validado",
  "Preparando respuesta",
];

const references = [
  {
    type: "Protocolo clínico local",
    detail: "Confirmación diagnóstica y seguimiento",
  },
  {
    type: "Guía clínica de hipertensión",
    detail: "Evaluación del riesgo cardiovascular",
  },
];

type Stage =
  | "idle"
  | "composing-first"
  | "processing-first"
  | "answering-first"
  | "composing-follow-up"
  | "processing-follow-up"
  | "answering-follow-up"
  | "complete"
  | "resetting";

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function ClinicalChatMock({ compact = false }: { compact?: boolean }) {
  const reducedMotion = useReducedMotion();
  const threadRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [questionLength, setQuestionLength] = useState(0);
  const [followUpQuestionLength, setFollowUpQuestionLength] = useState(0);
  const [processingIndex, setProcessingIndex] = useState(0);
  const [answerLength, setAnswerLength] = useState(0);
  const [followUpAnswerLength, setFollowUpAnswerLength] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setStage("complete");
      setQuestionLength(question.length);
      setFollowUpQuestionLength(followUpQuestion.length);
      setAnswerLength(answer.length);
      setFollowUpAnswerLength(followUpAnswer.length);
      return;
    }

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const pause = (duration: number) =>
      new Promise<void>((resolve) => {
        timeout = setTimeout(resolve, duration);
      });

    const typeText = async (
      text: string,
      updateLength: (length: number) => void,
      speed: number,
    ) => {
      for (let length = 1; length <= text.length && !cancelled; length += 1) {
        updateLength(length);
        await pause(speed);
      }
    };

    const runCycle = async () => {
      while (!cancelled) {
        setStage("idle");
        setQuestionLength(0);
        setFollowUpQuestionLength(0);
        setAnswerLength(0);
        setFollowUpAnswerLength(0);
        setProcessingIndex(0);
        await pause(700);

        setStage("composing-first");
        await typeText(question, setQuestionLength, 19);
        await pause(500);

        setStage("processing-first");
        setQuestionLength(question.length);

        for (
          let index = 0;
          index < processingStates.length && !cancelled;
          index += 1
        ) {
          setProcessingIndex(index);
          await pause(850);
        }

        setStage("answering-first");
        await typeText(answer, setAnswerLength, 26);
        await pause(850);

        setStage("composing-follow-up");
        await typeText(followUpQuestion, setFollowUpQuestionLength, 22);
        await pause(500);

        setStage("processing-follow-up");
        setProcessingIndex(1);
        await pause(1100);

        setStage("answering-follow-up");
        await typeText(followUpAnswer, setFollowUpAnswerLength, 24);
        await pause(500);

        setStage("complete");
        await pause(4000);

        setStage("resetting");
        await pause(500);
      }
    };

    void runCycle();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) return;

    thread.scrollTop = thread.scrollHeight;
  }, [answerLength, followUpAnswerLength]);

  useEffect(() => {
    const thread = threadRef.current;

    if (!thread) return;

    thread.scrollTo({
      top: thread.scrollHeight,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }, [stage, reducedMotion]);

  const showQuestion = !["idle", "composing-first"].includes(stage);
  const showResponse = ![
    "idle",
    "composing-first",
    "processing-first",
  ].includes(stage);
  const showFollowUp = [
    "processing-follow-up",
    "answering-follow-up",
    "complete",
    "resetting",
  ].includes(stage);
  const showFollowUpResponse = [
    "answering-follow-up",
    "complete",
    "resetting",
  ].includes(stage);
  const showReferences = stage === "complete" || stage === "resetting";
  const isResetting = stage === "resetting";
  const isComposing =
    stage === "composing-first" || stage === "composing-follow-up";
  const inputText =
    stage === "composing-first"
      ? question.slice(0, questionLength)
      : stage === "composing-follow-up"
        ? followUpQuestion.slice(0, followUpQuestionLength)
        : "Consulta información clínica...";

  return (
    <motion.div
      className={`pointer-events-none relative overflow-hidden rounded-3xl border border-cyan-800/20 bg-white/30 dark:shadow-2xl shadow-big-blocks backdrop-blur-xs dark:backdrop-blur-sm select-none dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-cyan-950/30 ${
        compact ? "h-87.5" : "h-136"
      }`}
      aria-label="Demostración animada de Consensus Salutis"
      data-stage={stage}
    >
      <motion.div
        className="relative flex h-full flex-col"
        animate={{ opacity: isResetting ? 0 : 1 }}
        transition={{ duration: 0.45 }}
      >
        <div className="flex h-14 shrink-0 items-center bg-white/40 dark:bg-transparent justify-between border-b border-cyan-800/20 px-4 dark:border-cyan-300/20">
          <div className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md border border-primary-light/50 bg-primary-light/70 text-[10px] font-semibold text-white dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-100">
              CS
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Consensus Salutis
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-500">
                Asistente clínico
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-teal-700 dark:text-teal-200">
            <span className="size-1.5 rounded-full bg-teal-300 shadow-[0_0_10px_rgba(94,234,212,0.7)]" />
            Entorno seguro
          </div>
        </div>

        <div
          ref={threadRef}
          className={`flex flex-1 flex-col overflow-y-hidden ${
            compact ? "gap-3 p-3" : "gap-6 p-6"
          }`}
        >
          <AnimatePresence initial={false}>
            {showQuestion && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={`font-body ml-auto max-w-[88%] shrink-0 rounded-xl rounded-br-sm border border-slate-300/80 bg-white/50 text-slate-900 dark:border-slate-600/30 dark:bg-slate-700/35 dark:text-slate-100 ${
                  compact
                    ? "px-3 py-2.5 text-sm leading-6"
                    : "px-4 py-3 text-base leading-7"
                }`}
              >
                {question}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {stage === "processing-first" && (
              <motion.div
                key={processingIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex shrink-0 items-center gap-2 text-sm text-primary-light dark:text-cyan-200"
              >
                <span className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="size-1.5 animate-pulse rounded-full bg-primary-light dark:bg-cyan-300"
                      style={{ animationDelay: `${dot * 160}ms` }}
                    />
                  ))}
                </span>
                <span key={processingIndex} className="animate-pulse">
                  {processingStates[processingIndex]}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {showResponse && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="shrink-0"
              >
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-primary-light/50 bg-primary-light/70 text-[10px] font-semibold text-white dark:border-cyan-300/25 dark:bg-cyan-300/10 dark:text-cyan-100">
                    CS
                  </span>
                  <div>
                    <p className="mb-1.5 text-xs font-semibold tracking-[0.12em] text-primary-light uppercase dark:text-cyan-200">
                      Orientación basada en evidencia
                    </p>
                    <p
                      className={`font-body text-slate-700 dark:text-slate-300 ${
                        compact ? "text-sm leading-6" : "text-base leading-7"
                      }`}
                    >
                      {answer.slice(0, answerLength)}
                      {answerLength < answer.length && (
                        <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary-light align-middle dark:bg-cyan-300" />
                      )}
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {showFollowUp && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="mt-6"
                    >
                      <div
                        className={`font-body ml-auto max-w-[88%] rounded-xl rounded-br-sm border border-slate-300/80 bg-white/50 text-slate-900 dark:border-slate-600/30 dark:bg-slate-700/35 dark:text-slate-100 ${
                          compact
                            ? "px-3 py-2.5 text-sm leading-6"
                            : "px-4 py-3 text-base leading-7"
                        }`}
                      >
                        {followUpQuestion}
                      </div>

                      {stage === "processing-follow-up" && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-primary-light dark:text-cyan-200">
                          <span className="flex gap-1">
                            {[0, 1, 2].map((dot) => (
                              <span
                                key={dot}
                                className="size-1.5 animate-pulse rounded-full bg-primary-light dark:bg-cyan-300"
                                style={{ animationDelay: `${dot * 160}ms` }}
                              />
                            ))}
                          </span>
                          <span className="animate-pulse">
                            Contrastando seguimiento
                          </span>
                        </div>
                      )}

                      {showFollowUpResponse && (
                        <div className="mt-6 flex items-start gap-2.5">
                          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-primary-light/50 bg-primary-light/70 text-[10px] font-semibold text-white dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-100">
                            CS
                          </span>
                          <p
                            className={`font-body text-slate-700 dark:text-slate-300 ${
                              compact
                                ? "text-sm leading-6"
                                : "text-base leading-7"
                            }`}
                          >
                            {followUpAnswer.slice(0, followUpAnswerLength)}
                            {followUpAnswerLength < followUpAnswer.length && (
                              <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary-light align-middle dark:bg-cyan-300" />
                            )}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {showReferences && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0 }}
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: { staggerChildren: 0.12 },
                        },
                      }}
                      className="mt-6 grid gap-2"
                    >
                      {references.map((reference, index) => (
                        <motion.div
                          key={reference.type}
                          variants={{
                            hidden: { opacity: 0 },
                            visible: { opacity: 1 },
                          }}
                          className="flex items-center gap-3 rounded-md border border-cyan-800/10 bg-primary-light/5 px-3 py-2.5 dark:border-cyan-300/10 dark:bg-cyan-300/5"
                        >
                          <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-primary-light/10 text-[10px] font-semibold text-primary-light dark:bg-cyan-300/10 dark:text-cyan-200">
                            {index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                              {reference.type}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-500">
                              {reference.detail}
                            </p>
                          </div>
                          <span className="ml-auto text-xs text-primary-light dark:text-cyan-300">
                            Ver
                          </span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="shrink-0 border-t border-cyan-800/20 p-3 bg-white/40 dark:bg-transparent dark:border-cyan-300/20">
          <div
            className={`font-body flex items-center rounded-2xl border px-3 text-sm transition ${
              compact
                ? "h-14 overflow-hidden whitespace-nowrap"
                : "min-h-14"
            } ${
              isComposing
                ? "border-cyan-800/25 bg-white text-slate-700 dark:border-cyan-300/25 dark:bg-[#061a2a] dark:text-slate-300"
                : "border-cyan-800/10 bg-slate-100/70 text-slate-700 dark:border-cyan-300/10 dark:bg-[#04111e]/70 dark:text-slate-600"
            }`}
          >
            <span className={compact ? "min-w-0 truncate" : undefined}>
              {inputText}
            </span>
            {isComposing && (
              <span className="ml-0.5 inline-block h-3 w-px animate-pulse bg-primary-light align-middle dark:bg-cyan-300" />
            )}
            <span
              className={`ml-auto transition ${
                isComposing
                  ? "text-primary-light dark:text-cyan-300"
                  : "text-primary-light dark:text-cyan-300/50"
              }`}
            >
              ↗
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

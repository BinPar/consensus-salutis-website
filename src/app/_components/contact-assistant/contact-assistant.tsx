"use client";

import Link from "next/link";
import { BrandIsotypeReveal } from "~/app/_components/brand-isotype-reveal";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { ArrowUp, Check, Mail, MessageSquare, UserRound } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { contactSchema, type ContactResponse } from "~/lib/contact";
import { ContactMessageComposer } from "./contact-message-composer";
import "./contact-assistant.css";

const steps = [
  {
    field: "name",
    label: "Tu nombre",
    question: "¿Cómo te llamas?",
    placeholder: "Escribe tu nombre completo…",
    icon: UserRound,
  },
  {
    field: "email",
    label: "Tu correo",
    question: "¿Dónde podemos responderte?",
    placeholder: "Tu correo electrónico…",
    icon: Mail,
  },
  {
    field: "message",
    label: "Tu consulta",
    question: "¿Qué te gustaría explorar con BinPar?",
    placeholder: "Cuéntanos tu caso de uso o lo que necesitas…",
    icon: MessageSquare,
  },
] as const;

type Answers = { name: string; email: string; message: string };
const emptyAnswers: Answers = { name: "", email: "", message: "" };

export function ContactAssistant({
  active,
  preview = false,
  layout = "section",
}: {
  active?: boolean;
  preview?: boolean;
  layout?: "section" | "page";
}) {
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.2 });
  const [entered, setEntered] = useState(false);
  const [paintCycle, setPaintCycle] = useState(0);
  const [introReady, setIntroReady] = useState(false);
  const [finishedReply, setFinishedReply] = useState<string | null>(null);
  const [revealedSteps, setRevealedSteps] = useState<number[]>([]);
  const [tabVisible, setTabVisible] = useState(true);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);
  const websiteRef = useRef<HTMLInputElement>(null);
  const id = useId();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const focusAfterStep = useRef(false);
  const reduced = useReducedMotion();
  const visible = active ?? inView;
  const Heading = layout === "page" ? motion.h1 : motion.h2;
  useEffect(() => {
    if (visible) {
      setEntered(true);
      setPaintCycle((previous) => previous + 1);
    } else {
      setEntered(false);
      setIntroReady(false);
      setFinishedReply(null);
    }
  }, [visible]);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const current = steps[step]!;
  const Icon = current.icon;
  const firstName = answers.name.trim().split(/\s+/)[0];
  const greetingName = firstName
    ? firstName.charAt(0).toLocaleUpperCase("es") + firstName.slice(1)
    : "";
  const reply =
    step === 0
      ? "¿Quieres explorar BinPar para tu organización? Déjanos tus datos y cuéntanos qué necesitas. Nuestro equipo se pondrá en contacto contigo."
      : step === 1
        ? `${greetingName}, déjanos tu correo electrónico para continuar la conversación. Nuestro equipo te escribirá para conocer mejor tu caso y valorar el siguiente paso.`
        : `${greetingName}, te responderemos en ${answers.email}.\nCuéntanos qué te gustaría explorar con BinPar y qué necesita tu organización para que podamos preparar una conversación centrada en tu caso.`;
  // Keep the initial server/client state identical when reduced motion is set.
  const immediateReply = revealedSteps.includes(step);
  const inputReady =
    entered && (Boolean(reduced) || immediateReply || finishedReply === reply);
  const replyComplete = useCallback(() => {
    setFinishedReply(reply);
    setRevealedSteps((previous) =>
      previous.includes(step) ? previous : [...previous, step],
    );
  }, [reply, step]);

  useEffect(() => {
    if (!inputReady || !focusAfterStep.current) return;
    inputRef.current?.focus({ preventScroll: true });
    focusAfterStep.current = false;
  }, [inputReady, step]);

  function focusInput(element: HTMLInputElement | HTMLTextAreaElement | null) {
    inputRef.current = element;
  }

  function changeStep(next: number) {
    if (next === step) return;
    setFinishedReply(null);
    focusAfterStep.current = true;
    setError("");
    setStep(next);
  }

  async function advance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const validation = contactSchema.shape[current.field].safeParse(
      answers[current.field],
    );
    if (!validation.success) {
      setError(validation.error.issues[0]!.message);
      inputRef.current?.focus();
      return;
    }
    setAnswers((previous) => ({
      ...previous,
      [current.field]: validation.data,
    }));
    if (step < 2) {
      changeStep(step + 1);
      return;
    }
    const final = contactSchema.safeParse({
      ...answers,
      privacyAccepted: privacy,
      website: websiteRef.current?.value ?? "",
    });
    if (!final.success) {
      const issue = final.error.issues[0]!;
      const next = steps.findIndex((item) => item.field === issue.path[0]);
      if (next >= 0 && next !== step) changeStep(next);
      setError(issue.message);
      return;
    }
    setError("");
    if (preview) {
      setComplete(true);
      return;
    }
    submitting.current = true;
    setBusy(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(final.data),
      });
      const result = (await response.json()) as ContactResponse;
      if (!response.ok || !result.ok) {
        if (!result.ok) {
          const field = Object.keys(result.fieldErrors ?? {})[0];
          const next = steps.findIndex((item) => item.field === field);
          if (next >= 0 && next !== step) changeStep(next);
          setError(result.message);
        } else
          setError("No hemos podido enviar tu consulta. Inténtalo de nuevo.");
        return;
      }
      setAnswers({
        name: final.data.name,
        email: final.data.email,
        message: final.data.message,
      });
      setComplete(true);
    } catch {
      setError("No hemos podido enviar tu consulta. Inténtalo de nuevo.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  }

  function reset() {
    setFinishedReply(null);
    setRevealedSteps([]);
    focusAfterStep.current = true;
    setAnswers(emptyAnswers);
    setPrivacy(false);
    setComplete(false);
    changeStep(0);
  }

  return (
    <section
      ref={root}
      className={
        layout === "page"
          ? "contact-assistant contact-assistant--page items-start! pt-[max(3rem,calc(50svh-14rem))]! md:pt-[max(4.5rem,calc(50svh-12rem))]!"
          : "contact-assistant"
      }
      aria-labelledby={`${id}-heading`}
      data-motion-running={visible && tabVisible && !reduced}
    >
      <div className="ca-container">
        <motion.div
          className="ca-brand"
          aria-hidden="true"
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: entered || reduced ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
        >
          <BrandIsotypeReveal key={paintCycle} />
        </motion.div>
        <motion.p
          className="ca-eyebrow font-display"
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: entered || reduced ? 1 : 0 }}
          transition={{
            duration: reduced ? 0 : 0.5,
            delay: reduced ? 0 : 0.18,
          }}
        >
          Contacto
        </motion.p>
        <Heading
          id={`${id}-heading`}
          className="ca-heading font-display"
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: entered || reduced ? 1 : 0 }}
          transition={{
            duration: reduced ? 0 : 0.65,
            delay: reduced ? 0 : 0.3,
          }}
          onAnimationComplete={() => {
            if (entered || reduced) setIntroReady(true);
          }}
        >
          Hablemos de tu organización.
        </Heading>
        <AnimatePresence mode="wait" initial={false}>
          {complete ? (
            <motion.div
              key="complete"
              className="ca-complete"
              role="status"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: entered || reduced ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <span className="ca-complete-mark">
                <Check size={25} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="font-display">Gracias, {answers.name}.</h3>
              <p>
                {preview
                  ? "Tu consulta está preparada con el correo "
                  : "Hemos recibido tu consulta. Nuestro equipo te responderá en "}
                <strong>{answers.email}</strong>.
              </p>
              <blockquote>{answers.message}</blockquote>
              {preview && (
                <p className="ca-preview-note">
                  Vista previa del laboratorio. No se han enviado datos.
                </p>
              )}
              <button type="button" onClick={reset} className="ca-restart">
                Volver a empezar
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: introReady || reduced ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <TypedReply
                key={`${paintCycle}-${step}-${reply}`}
                text={reply}
                emphasis={step === 2 ? answers.email : undefined}
                immediate={immediateReply}
                enabled={introReady || Boolean(reduced)}
                onComplete={replyComplete}
              />
              <motion.form
                className="ca-contact-form"
                ref={formRef}
                onSubmit={advance}
                noValidate
                initial={{ opacity: 0 }}
                animate={{ opacity: inputReady ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.45, ease: "easeInOut" }}
                style={{ visibility: inputReady ? "visible" : "hidden" }}
                inert={!inputReady}
                aria-hidden={!inputReady}
                aria-busy={busy}
              >
                <label
                  className="ca-question sr-only"
                  htmlFor={`${id}-${current.field}`}
                  aria-live="polite"
                >
                  {current.question}
                </label>
                {step === 2 ? (
                  <ContactMessageComposer
                    id={`${id}-message`}
                    inputRef={focusInput}
                    value={answers.message}
                    placeholder={current.placeholder}
                    errorId={`${id}-error`}
                    invalid={Boolean(error)}
                    disabled={busy}
                    submitLabel={
                      preview ? "Preparar consulta" : "Enviar consulta"
                    }
                    onChange={(message) => {
                      setAnswers((previous) => ({ ...previous, message }));
                      setError("");
                    }}
                    onSubmit={() => formRef.current?.requestSubmit()}
                  />
                ) : (
                  <div className="ca-composer">
                    <span className="ca-input-icon" aria-hidden="true">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                    <input
                      key={current.field}
                      ref={focusInput}
                      id={`${id}-${current.field}`}
                      type={step === 1 ? "email" : "text"}
                      autoComplete={step === 1 ? "email" : "name"}
                      disabled={busy}
                      maxLength={step === 1 ? 254 : 100}
                      aria-describedby={`${id}-error`}
                      aria-invalid={Boolean(error)}
                      placeholder={current.question}
                      value={answers[current.field]}
                      onChange={(event) => {
                        setAnswers((previous) => ({
                          ...previous,
                          [current.field]: event.target.value,
                        }));
                        setError("");
                      }}
                    />
                    <button
                      className="ca-send"
                      type="submit"
                      disabled={busy || !answers[current.field].trim()}
                      aria-label="Continuar"
                      title="Continuar"
                    >
                      <ArrowUp size={24} strokeWidth={1.8} aria-hidden="true" />
                    </button>
                  </div>
                )}
                <p id={`${id}-error`} className="ca-error" role="alert">
                  {error}
                </p>
                <div className="ca-footer">
                  <nav className="ca-progress" aria-label="Pasos del contacto">
                    {steps.map((item, index) => (
                      <button
                        key={item.field}
                        type="button"
                        aria-current={step === index ? "step" : undefined}
                        disabled={
                          busy ||
                          (index > step &&
                            !steps
                              .slice(0, index)
                              .every(
                                ({ field }) =>
                                  contactSchema.shape[field].safeParse(
                                    answers[field],
                                  ).success,
                              ))
                        }
                        onClick={() => changeStep(index)}
                      >
                        <span className="ca-progress-number">
                          {index < step ? (
                            <Check
                              size={12}
                              strokeWidth={1.8}
                              aria-hidden="true"
                            />
                          ) : (
                            `0${index + 1}`
                          )}
                        </span>
                        {item.label}
                      </button>
                    ))}
                  </nav>
                  {step === 2 && (
                    <label className="ca-privacy">
                      <input
                        type="checkbox"
                        disabled={busy}
                        checked={privacy}
                        onChange={(event) => {
                          setPrivacy(event.target.checked);
                          setError("");
                        }}
                      />
                      <span>
                        He leído y acepto la{" "}
                        <Link
                          href="/privacidad"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Política de Privacidad
                        </Link>
                        .
                      </span>
                    </label>
                  )}
                </div>
                <div
                  aria-hidden="true"
                  className="absolute -left-[10000px] size-px overflow-hidden"
                >
                  <label htmlFor={`${id}-website`}>Sitio web</label>
                  <input
                    ref={websiteRef}
                    id={`${id}-website`}
                    name="website"
                    type="text"
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>
              </motion.form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function TypedReply({
  text,
  emphasis,
  immediate = false,
  enabled = true,
  onComplete,
}: {
  text: string;
  emphasis?: string;
  immediate?: boolean;
  enabled?: boolean;
  onComplete: () => void;
}) {
  const root = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLParagraphElement>(null);
  const [lines, setLines] = useState<{ text: string; start: number }[]>([]);
  const cursor = useRef(0);
  const inView = useInView(root, { amount: 0.25 });
  const reduced = useReducedMotion();
  const [length, setLength] = useState(0);
  const [tabVisible, setTabVisible] = useState(true);

  useLayoutEffect(() => {
    const element = root.current;
    const paragraph = measureRef.current;
    if (!element || !paragraph) return;
    const measure = () => {
      if (!element.getBoundingClientRect().width) return;
      const walker = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      let offset = 0;
      const range = document.createRange();
      const next: { text: string; start: number }[] = [];
      let start = 0;
      let top: number | undefined;
      const addLine = (end: number) => {
        const raw = text.slice(start, end);
        const trimmed = raw.trim();
        if (trimmed)
          next.push({
            text: trimmed,
            start: start + raw.length - raw.trimStart().length,
          });
      };
      for (let index = 0; index < text.length; index++) {
        while (node && offset >= (node.textContent?.length ?? 0)) {
          node = walker.nextNode();
          offset = 0;
        }
        if (!node) break;
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);
        offset++;
        const rect = range.getBoundingClientRect();
        if (top !== undefined && Math.abs(rect.top - top) > 1) {
          addLine(index);
          start = index;
        }
        top = rect.top;
      }
      addLine(text.length);
      setLines((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      document.fonts.removeEventListener("loadingdone", measure);
    };
  }, [text, emphasis]);

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (
      !enabled ||
      !inView ||
      !tabVisible ||
      reduced ||
      immediate ||
      cursor.current >= text.length
    )
      return;
    let frame = 0;
    const start = performance.now();
    const from = cursor.current;
    const tick = (now: number) => {
      cursor.current = Math.min(
        text.length,
        from + Math.floor((now - start) / 8),
      );
      setLength(cursor.current);
      if (cursor.current < text.length) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [enabled, inView, tabVisible, reduced, immediate, text]);

  useEffect(() => {
    if (enabled && (reduced || immediate || length >= text.length))
      onComplete();
  }, [enabled, reduced, immediate, length, text.length, onComplete]);

  const shown = reduced || immediate ? text.length : length;
  const caretLine = lines.findIndex(
    (line) => shown <= line.start + line.text.length,
  );
  const emphasisStart = emphasis ? text.indexOf(emphasis) : -1;
  function renderText(value: string, start = 0) {
    if (!emphasis || emphasisStart < 0) return value;
    const from = Math.max(0, emphasisStart - start);
    const to = Math.min(value.length, emphasisStart + emphasis.length - start);
    if (from >= to) return value;
    return (
      <>
        {value.slice(0, from)}
        <strong className="font-bold">{value.slice(from, to)}</strong>
        {value.slice(to)}
      </>
    );
  }
  return (
    <div
      ref={root}
      className="ca-dialogue"
      data-typing={enabled && inView && tabVisible && shown < text.length}
    >
      <p
        ref={measureRef}
        className="ca-dialogue-measure font-body whitespace-pre-line"
        aria-hidden="true"
      >
        {renderText(text)}
      </p>
      <p className="ca-dialogue-text font-body" aria-hidden="true">
        {lines.map((line, index) => (
          <span key={line.start} className="ca-dialogue-line">
            <span className="ca-dialogue-line-shell">
              <span className="ca-dialogue-line-full">
                {renderText(line.text, line.start)}
              </span>
              <span className="ca-dialogue-line-written">
                {renderText(
                  line.text.slice(0, Math.max(0, shown - line.start)),
                  line.start,
                )}
                {shown < text.length && index === caretLine && (
                  <span className="ca-typing-caret" />
                )}
              </span>
            </span>
          </span>
        ))}
      </p>
      <p className="sr-only" role="status">
        {text}
      </p>
    </div>
  );
}

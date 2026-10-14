"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Check, Mail, MessageSquare, UserRound } from "lucide-react";
import { useId, useRef, useState } from "react";
import { contactSchema } from "~/lib/contact";
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

export function ContactAssistant() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [privacy, setPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const id = useId();
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const focusAfterStep = useRef(false);
  const reduced = useReducedMotion();
  const current = steps[step]!;
  const Icon = current.icon;

  function focusInput(element: HTMLInputElement | HTMLTextAreaElement | null) {
    inputRef.current = element;
    if (element && focusAfterStep.current) {
      focusAfterStep.current = false;
      requestAnimationFrame(() => {
        if (element.isConnected) element.focus({ preventScroll: true });
      });
    }
  }

  function changeStep(next: number) {
    focusAfterStep.current = true;
    setError("");
    setStep(next);
  }

  function advance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      website: "",
    });
    if (!final.success) {
      const issue = final.error.issues[0]!;
      const next = steps.findIndex((item) => item.field === issue.path[0]);
      if (next >= 0 && next !== step) changeStep(next);
      setError(issue.message);
      return;
    }
    setError("");
    setComplete(true);
  }

  function reset() {
    setAnswers(emptyAnswers);
    setPrivacy(false);
    setComplete(false);
    changeStep(0);
  }

  return (
    <section className="contact-assistant" aria-labelledby={`${id}-heading`}>
      <div className="ca-container">
        <div className="ca-brand" aria-hidden="true">
          <Image
            src="/logos/binpar-brand/binpar-isotipo-light.svg"
            width={42}
            height={46}
            alt=""
            className="dark:hidden"
          />
          <Image
            src="/logos/binpar-brand/binpar-isotipo-dark.svg"
            width={42}
            height={46}
            alt=""
            className="hidden dark:block"
          />
        </div>
        <p className="ca-eyebrow font-display">Contacto · BinPar</p>
        <h2 id={`${id}-heading`} className="ca-heading font-display">
          Hablemos de tu organización sanitaria.
        </h2>
        <p className="ca-intro font-body">
          Tu caso de uso, tus preguntas, el siguiente paso. Empecemos por
          conocerte.
        </p>
        <AnimatePresence mode="wait" initial={false}>
          {complete ? (
            <motion.div
              key="complete"
              className="ca-complete"
              role="status"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <span className="ca-complete-mark">
                <Check size={25} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <h3 className="font-display">Gracias, {answers.name}.</h3>
              <p>
                Tu consulta está preparada con el correo{" "}
                <strong>{answers.email}</strong>.
              </p>
              <blockquote>{answers.message}</blockquote>
              <p className="ca-preview-note">
                Vista previa del laboratorio. No se han enviado datos.
              </p>
              <button type="button" onClick={reset} className="ca-restart">
                Volver a empezar
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: reduced ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduced ? 0 : 0.25 }}
            >
              <div className="ca-answers" aria-label="Tus respuestas">
                {steps.slice(0, step).map((item, index) => (
                  <button
                    type="button"
                    key={item.field}
                    onClick={() => changeStep(index)}
                    title={`Editar ${item.label.toLowerCase()}`}
                  >
                    <Check size={13} strokeWidth={1.8} aria-hidden="true" />
                    <span>{answers[item.field]}</span>
                  </button>
                ))}
              </div>
              <form onSubmit={advance} noValidate>
                <label
                  className="ca-question font-display"
                  htmlFor={`${id}-${current.field}`}
                  aria-live="polite"
                >
                  {current.question}
                </label>
                <div
                  className={`ca-composer ${step === 2 ? "ca-composer-message" : ""}`}
                >
                  <span className="ca-input-icon" aria-hidden="true">
                    <Icon size={21} strokeWidth={1.8} />
                  </span>
                  {step === 2 ? (
                    <textarea
                      key="message"
                      ref={focusInput}
                      id={`${id}-message`}
                      aria-describedby={`${id}-error ${id}-preview`}
                      aria-invalid={Boolean(error)}
                      rows={2}
                      maxLength={3000}
                      placeholder={current.placeholder}
                      value={answers.message}
                      onChange={(event) => {
                        setAnswers((previous) => ({
                          ...previous,
                          message: event.target.value,
                        }));
                        setError("");
                      }}
                    />
                  ) : (
                    <input
                      key={current.field}
                      ref={focusInput}
                      id={`${id}-${current.field}`}
                      type={step === 1 ? "email" : "text"}
                      autoComplete={step === 1 ? "email" : "name"}
                      maxLength={step === 1 ? 254 : 100}
                      aria-describedby={`${id}-error ${id}-preview`}
                      aria-invalid={Boolean(error)}
                      placeholder={current.placeholder}
                      value={answers[current.field]}
                      onChange={(event) => {
                        setAnswers((previous) => ({
                          ...previous,
                          [current.field]: event.target.value,
                        }));
                        setError("");
                      }}
                    />
                  )}
                  <button
                    className="ca-send"
                    type="submit"
                    aria-label={step === 2 ? "Preparar consulta" : "Continuar"}
                    title={step === 2 ? "Preparar consulta" : "Continuar"}
                  >
                    <ArrowUp size={24} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>
                <p id={`${id}-error`} className="ca-error" role="alert">
                  {error}
                </p>
                {step === 2 && (
                  <label className="ca-privacy">
                    <input
                      type="checkbox"
                      checked={privacy}
                      onChange={(event) => {
                        setPrivacy(event.target.checked);
                        setError("");
                      }}
                    />
                    <span>
                      He leído y acepto la{" "}
                      <Link href="/privacidad" target="_blank" rel="noreferrer">
                        Política de Privacidad
                      </Link>
                      .
                    </span>
                  </label>
                )}
                <nav className="ca-progress" aria-label="Pasos del contacto">
                  {steps.map((item, index) => (
                    <button
                      key={item.field}
                      type="button"
                      aria-current={step === index ? "step" : undefined}
                      disabled={
                        index > step &&
                        !steps
                          .slice(0, index)
                          .every(
                            ({ field }) =>
                              contactSchema.shape[field].safeParse(
                                answers[field],
                              ).success,
                          )
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
                <p id={`${id}-preview`} className="ca-preview-note">
                  Tres pasos · Vista previa sin envío
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

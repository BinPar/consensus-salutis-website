"use client";

import Link from "next/link";
import Script from "next/script";
import { useId, useRef, useState } from "react";

import {
  contactSchema,
  type ContactField,
  type ContactResponse,
} from "~/lib/contact";

const DEVELOPMENT_SITE_KEY = "1x00000000000000000000AA";

type TurnstileOptions = {
  sitekey: string;
  size: "compact" | "flexible" | "normal";
  appearance: "interaction-only";
  execution: "execute";
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      execute: (widgetId: string) => void;
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
    };
  }
}

const fieldClassName =
  "font-body w-full rounded-lg border border-cyan-800/15 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-primary-light/55 focus:bg-white focus:ring-2 focus:ring-primary-light/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/15 dark:bg-[#04111e]/68 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-300/55 dark:focus:bg-[#061a2a] dark:focus:ring-cyan-300/10";

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function ContactForm({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const awaitingTokenRef = useRef(false);
  const submittingRef = useRef(false);
  const id = useId();
  const [status, setStatus] = useState<
    "idle" | "verifying" | "submitting" | "success"
  >("idle");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ContactField, string>>
  >({});

  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? DEVELOPMENT_SITE_KEY;
  const busy = status === "verifying" || status === "submitting";

  function clearFieldError(field: ContactField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      if (Object.keys(next).length === 0) setMessage("");
      return next;
    });
  }

  function renderTurnstile() {
    if (
      widgetIdRef.current ||
      !turnstileContainerRef.current ||
      !window.turnstile
    ) {
      return;
    }

    widgetIdRef.current = window.turnstile.render(
      turnstileContainerRef.current,
      {
        sitekey: siteKey,
        size: "flexible",
        appearance: "interaction-only",
        execution: "execute",
        callback: (token) => {
          if (!awaitingTokenRef.current || submittingRef.current) return;
          awaitingTokenRef.current = false;
          void submitContact(token);
        },
        "error-callback": () => {
          awaitingTokenRef.current = false;
          setStatus("idle");
          setMessage(
            "No se pudo completar la verificación. Inténtalo de nuevo.",
          );
        },
        "expired-callback": () => {
          awaitingTokenRef.current = false;
          setStatus("idle");
          setMessage("La verificación ha caducado. Inténtalo de nuevo.");
        },
      },
    );
  }

  async function submitContact(turnstileToken: string) {
    if (!formRef.current || submittingRef.current) return;

    const formData = new FormData(formRef.current);
    const payload = {
      name: formValue(formData, "name"),
      email: formValue(formData, "email"),
      message: formValue(formData, "message"),
      privacyAccepted: formData.get("privacyAccepted") === "on",
      website: formValue(formData, "website"),
      turnstileToken,
    };
    submittingRef.current = true;
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as ContactResponse;

      if (!result.ok) {
        setStatus("idle");
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setStatus("success");
      setMessage("");
      setFieldErrors({});
      formRef.current.reset();
    } catch {
      setStatus("idle");
      setMessage("No hemos podido enviar el mensaje. Inténtalo de nuevo.");
    } finally {
      submittingRef.current = false;
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validation = contactSchema.safeParse({
      name: formValue(formData, "name"),
      email: formValue(formData, "email"),
      message: formValue(formData, "message"),
      privacyAccepted: formData.get("privacyAccepted") === "on",
      website: formValue(formData, "website"),
      turnstileToken: "client-validation",
    });

    if (!validation.success) {
      const errors: Partial<Record<ContactField, string>> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (
          field === "name" ||
          field === "email" ||
          field === "message" ||
          field === "privacyAccepted"
        ) {
          errors[field] ??= issue.message;
        }
      }
      setStatus("idle");
      setMessage("Revisa los campos indicados.");
      setFieldErrors(errors);
      return;
    }

    setMessage("");
    setFieldErrors({});

    if (!widgetIdRef.current || !window.turnstile) {
      setMessage(
        "La verificación todavía no está disponible. Inténtalo de nuevo.",
      );
      return;
    }

    window.turnstile.reset(widgetIdRef.current);
    awaitingTokenRef.current = true;
    setStatus("verifying");
    window.turnstile.execute(widgetIdRef.current);
  }

  if (status === "success") {
    return (
      <div
        className={`min-w-0 rounded-3xl border border-cyan-800/20 bg-white/75 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-cyan-950/30 ${className}`}
        role="status"
      >
        <p className="text-xs font-semibold tracking-[0.18em] text-primary-light uppercase dark:text-cyan-300">
          Mensaje enviado
        </p>
        <h3 className="font-display mt-4 text-2xl font-semibold text-[#05215e] dark:text-slate-50">
          Gracias por contactar.
        </h3>
        <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Hemos recibido tu consulta y responderemos desde el equipo de BinPar.
        </p>
        <button
          type="button"
          className="mt-6 rounded-md border border-cyan-800/20 bg-primary-light/10 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-primary-light/18 dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-50 dark:hover:bg-cyan-300/18"
          onClick={() => setStatus("idle")}
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={renderTurnstile}
      />
      <form
        ref={formRef}
        className={`min-w-0 rounded-3xl border border-cyan-800/20 bg-white/80 dark:shadow-2xl shadow-big-blocks backdrop-blur-sm dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-cyan-950/30 ${
          compact ? "space-y-3 p-5" : "space-y-5 p-7"
        } ${className}`}
        onSubmit={handleSubmit}
        noValidate
      >
        <FormField
          id={`${id}-name`}
          label="Nombre completo"
          error={fieldErrors.name}
        >
          <input
            id={`${id}-name`}
            name="name"
            type="text"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            disabled={busy}
            className={fieldClassName}
            placeholder="Tu nombre completo"
            aria-invalid={Boolean(fieldErrors.name)}
            onInput={() => clearFieldError("name")}
          />
        </FormField>

        <FormField
          id={`${id}-email`}
          label="Correo electrónico"
          error={fieldErrors.email}
        >
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            disabled={busy}
            className={fieldClassName}
            placeholder="tu@email.com"
            aria-invalid={Boolean(fieldErrors.email)}
            onInput={() => clearFieldError("email")}
          />
        </FormField>

        <FormField
          id={`${id}-message`}
          label="Mensaje"
          error={fieldErrors.message}
        >
          <textarea
            id={`${id}-message`}
            name="message"
            minLength={20}
            maxLength={3000}
            rows={compact ? 3 : 5}
            required
            disabled={busy}
            className={`${fieldClassName} resize-none`}
            placeholder="Cuéntanos brevemente qué necesitas."
            aria-invalid={Boolean(fieldErrors.message)}
            onInput={() => clearFieldError("message")}
          />
        </FormField>

        <div className={` ${compact ? "p-3" : "p-4"}`}>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
            <input
              name="privacyAccepted"
              type="checkbox"
              required
              disabled={busy}
              className="mt-0.5 size-4 shrink-0 accent-primary-light dark:accent-cyan-300"
              aria-invalid={Boolean(fieldErrors.privacyAccepted)}
              onChange={() => clearFieldError("privacyAccepted")}
            />
            <span>
              He leído y acepto la{" "}
              <Link
                href="/privacidad"
                className="dark:text-secondary text-primary-light underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
              >
                Política de Privacidad
              </Link>
              .
            </span>
          </label>
          {fieldErrors.privacyAccepted ? (
            <p className="font-body mt-2 text-xs text-rose-700 dark:text-rose-300">
              {fieldErrors.privacyAccepted}
            </p>
          ) : null}
        </div>

        <div
          aria-hidden="true"
          className="absolute top-auto -left-2499.75 size-px overflow-hidden"
        >
          <label htmlFor={`${id}-website`}>Sitio web</label>
          <input
            id={`${id}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div ref={turnstileContainerRef} aria-hidden="true" />

        <div aria-live="polite">
          {message ? (
            <p className="font-body text-sm text-rose-700 dark:text-rose-300">
              {message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex min-h-11 w-full items-center font-body justify-center rounded-full bg-primary-light px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60 dark:bg-cyan-300 dark:text-[#04111e] dark:hover:bg-cyan-200"
        >
          {busy ? "Enviando..." : "Enviar mensaje"}
        </button>
      </form>
    </>
  );
}

function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 font-body block text-sm font-medium text-slate-900 dark:text-slate-100"
      >
        {label} <span aria-hidden="true">*</span>
      </label>
      {children}
      {error ? (
        <p className="font-body mt-1.5 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

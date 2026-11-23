"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId, useRef, useState } from "react";

import { Eyebrow } from "~/app/_components/eyebrow";
import { Link } from "~/i18n/navigation";
import {
  contactSchema,
  isContactErrorCode,
  type ContactField,
  type ContactResponse,
} from "~/lib/contact";

/*
  Aquí vivía Turnstile, el captcha de Cloudflare, y se ha retirado.

  No estaba aprovisionado en ningún entorno del proyecto, y sus dos mitades
  fallaban en direcciones contrarias: el cliente caía a la clave de prueba pública
  de Cloudflare —la que aprueba siempre— SIN mirar el entorno, así que en
  producción la comprobación no comprobaba nada; y el servidor, que sí miraba el
  entorno, se quedaba sin secreto y contestaba 400 a todo el mundo. Un antibot que
  no frena a nadie y un muro que no deja pasar a nadie, a la vez.

  Lo que queda de defensa es la trampa para bots de más abajo —el campo `website`
  escondido—, que es la misma que usa la Etapa 0 del evaluador. Si algún día hace
  falta más, la decisión es qué antibot poner, no reactivar este.
*/

const fieldClassName =
  "font-body w-full rounded-lg border border-cyan-800/15 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-primary-light/55 focus:bg-white focus:ring-2 focus:ring-primary-light/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-primary-dark/10 dark:bg-[#04111e]/68 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-primary-dark/55 dark:focus:bg-[#061a2a] dark:focus:ring-primary-dark/10";

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
  const t = useTranslations("contact");
  const locale = useLocale();
  // Los errores llegan como código; un mensaje sin código (zod) se pinta tal cual.
  const errorText = (value: string) =>
    isContactErrorCode(value) ? t(`errors.${value}`) : value;
  const formRef = useRef<HTMLFormElement>(null);
  const submittingRef = useRef(false);
  const id = useId();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ContactField, string>>
  >({});

  const busy = status === "submitting";

  function clearFieldError(field: ContactField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;

      const next = { ...current };
      delete next[field];
      if (Object.keys(next).length === 0) setMessage("");
      return next;
    });
  }

  async function submitContact() {
    if (!formRef.current || submittingRef.current) return;

    const formData = new FormData(formRef.current);
    const payload = {
      name: formValue(formData, "name"),
      email: formValue(formData, "email"),
      message: formValue(formData, "message"),
      privacyAccepted: formData.get("privacyAccepted") === "on",
      website: formValue(formData, "website"),
      locale,
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
        setMessage(errorText(result.error));
        setFieldErrors(translateFieldErrors(result.fieldErrors ?? {}));
        return;
      }

      setStatus("success");
      setMessage("");
      setFieldErrors({});
      formRef.current.reset();
    } catch {
      setStatus("idle");
      setMessage(t("form.networkError"));
    } finally {
      submittingRef.current = false;
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const formData = new FormData(event.currentTarget);
    const validation = contactSchema.safeParse({
      name: formValue(formData, "name"),
      email: formValue(formData, "email"),
      message: formValue(formData, "message"),
      privacyAccepted: formData.get("privacyAccepted") === "on",
      website: formValue(formData, "website"),
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
          errors[field] ??= errorText(issue.message);
        }
      }
      setStatus("idle");
      setMessage(t("errors.fieldErrors"));
      setFieldErrors(errors);
      return;
    }

    setMessage("");
    setFieldErrors({});
    void submitContact();
  }

  function translateFieldErrors(errors: Partial<Record<ContactField, string>>) {
    const translated: Partial<Record<ContactField, string>> = {};
    for (const [field, value] of Object.entries(errors) as [
      ContactField,
      string,
    ][]) {
      translated[field] = errorText(value);
    }
    return translated;
  }

  if (status === "success") {
    return (
      <div
        className={`dark:border-primary-dark/20 min-w-0 rounded-3xl border border-cyan-800/20 bg-white/75 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:bg-white/3 dark:shadow-cyan-950/30 ${className}`}
        role="status"
      >
        <Eyebrow>{t("form.success.eyebrow")}</Eyebrow>
        <h3 className="font-display text-navy mt-4 text-2xl font-semibold dark:text-slate-50">
          {t("form.success.title")}
        </h3>
        <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {t("form.success.body")}
        </p>
        <button
          type="button"
          className="bg-primary-light/10 hover:bg-primary-light/18 dark:bg-primary-dark/10 dark:border-primary-dark/20 dark:hover:bg-primary-dark/18 mt-6 rounded-md border border-cyan-800/20 px-4 py-2 text-sm font-semibold text-cyan-800 transition dark:text-slate-100"
          onClick={() => setStatus("idle")}
        >
          {t("form.success.again")}
        </button>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className={`shadow-big-blocks dark:border-primary-dark/20 min-w-0 rounded-3xl border border-cyan-800/20 bg-white/80 backdrop-blur-sm dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30 ${
        compact ? "space-y-3 p-5" : "space-y-5 p-7"
      } ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <FormField
        id={`${id}-name`}
        label={t("form.name.label")}
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
          placeholder={t("form.name.placeholder")}
          aria-invalid={Boolean(fieldErrors.name)}
          onInput={() => clearFieldError("name")}
        />
      </FormField>

      <FormField
        id={`${id}-email`}
        label={t("form.email.label")}
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
          placeholder={t("form.email.placeholder")}
          aria-invalid={Boolean(fieldErrors.email)}
          onInput={() => clearFieldError("email")}
        />
      </FormField>

      <FormField
        id={`${id}-message`}
        label={t("form.message.label")}
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
          placeholder={t("form.message.placeholder")}
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
            className="accent-primary-light mt-0.5 size-4 shrink-0 dark:accent-cyan-300"
            aria-invalid={Boolean(fieldErrors.privacyAccepted)}
            onChange={() => clearFieldError("privacyAccepted")}
          />
          <span>
            {t.rich("shared.privacyConsent", {
              link: (chunks) => (
                <Link
                  href="/privacidad"
                  className="dark:text-primary-dark text-primary-light dark:hover:text-primary-dark underline underline-offset-4 hover:text-cyan-800"
                >
                  {chunks}
                </Link>
              ),
            })}
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
        <label htmlFor={`${id}-website`}>{t("shared.honeypotLabel")}</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

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
        className="font-body bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark/85 flex min-h-10 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60 dark:text-[#04111e]"
      >
        {busy ? t("form.submitting") : t("form.submit")}
      </button>
    </form>
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
        className="font-body mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
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

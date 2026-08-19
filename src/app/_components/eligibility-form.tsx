"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

import { Eyebrow } from "~/app/_components/eyebrow";

import {
  AMBITO_PAIS_OPTIONS,
  CARGO_OPTIONS,
  eligibilitySchema,
  isGenericEmailDomain,
  PURPOSE_STATEMENT,
  RETENTION_STATEMENT,
  type EligibilityField,
  type EligibilityResponse,
} from "~/lib/eligibility";

const fieldClassName =
  "font-body w-full rounded-lg border border-cyan-800/15 bg-white/60 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-primary-light/55 focus:bg-white focus:ring-2 focus:ring-primary-light/10 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/10 dark:bg-[#04111e]/68 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-300/55 dark:focus:bg-[#061a2a] dark:focus:ring-cyan-300/10";

/**
 * Recipiente para `<select>`: sin la flecha nativa —que el navegador pinta
 * pegada al borde derecho, fuera del ritmo del `px-4` de los campos— y con
 * un chevron propio alineado con ese padding.
 */
function SelectChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown
        aria-hidden="true"
        strokeWidth={1.8}
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-slate-500 dark:text-slate-400"
      />
    </div>
  );
}

function formValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

function readForm(form: HTMLFormElement) {
  const formData = new FormData(form);
  return {
    emailInstitucional: formValue(formData, "emailInstitucional"),
    nombre: formValue(formData, "nombre"),
    cargo: formValue(formData, "cargo"),
    institucion: formValue(formData, "institucion"),
    ambitoPais: formValue(formData, "ambitoPais"),
    webInstitucion: formValue(formData, "webInstitucion"),
    consentimiento: formData.get("consentimiento") === "on",
    website: formValue(formData, "website"),
  };
}

export function EligibilityForm({ className = "" }: { className?: string }) {
  const id = useId();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<EligibilityField, string>>
  >({});
  /**
   * Señal de dominio genérico. Se muestra como aviso informativo y **no**
   * bloquea el envío: una dirección médica que escribe desde su correo personal
   * sigue siendo una dirección médica.
   */
  const [genericDomain, setGenericDomain] = useState(false);

  const busy = status === "submitting";

  function clearFieldError(field: EligibilityField) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      if (Object.keys(next).length === 0) setMessage("");
      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = event.currentTarget;
    const payload = readForm(form);
    const validation = eligibilitySchema.safeParse(payload);

    if (!validation.success) {
      const errors: Partial<Record<EligibilityField, string>> = {};
      for (const issue of validation.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string" && field !== "website") {
          errors[field as EligibilityField] ??= issue.message;
        }
      }
      setMessage("Revisa los campos indicados.");
      setFieldErrors(errors);
      return;
    }

    setMessage("");
    setFieldErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/evaluador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as EligibilityResponse;

      if (!result.ok) {
        setStatus("idle");
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }

      /*
        Se pasa directamente a la entrevista. La pantalla de «ficha registrada»
        que había aquí era el final del camino cuando la Etapa 1 no existía;
        ahora sería un paso intermedio que solo pide un clic más.

        El estado `success` se mantiene hasta que la navegación ocurre: el botón
        queda deshabilitado y no se puede enviar el formulario dos veces mientras
        el router trabaja.
      */
      setStatus("success");
      form.reset();
      setGenericDomain(false);
      router.push("/evaluador/entrevista");
    } catch {
      setStatus("idle");
      setMessage(
        "No hemos podido guardar tus datos. Inténtalo de nuevo más tarde.",
      );
    }
  }

  if (status === "success") {
    return (
      <div
        className={`min-w-0 rounded-3xl border border-cyan-800/20 bg-white/80 p-7 shadow-big-blocks backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30 ${className}`}
        role="status"
      >
        <Eyebrow>Ficha registrada</Eyebrow>
        <h2 className="font-display mt-4 text-2xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
          Empezamos la entrevista.
        </h2>
        <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          Hemos guardado tus datos de identificación. Te llevamos a la
          conversación; son entre ocho y doce minutos.
        </p>
        {/*
          Enlace real y no solo el `router.push`: si la navegación del cliente
          falla —una pestaña que pierde la red justo aquí—, sigue habiendo una
          forma de llegar que no depende de JavaScript.
        */}
        <Link
          href="/evaluador/entrevista"
          className="border-cyan-800/20 bg-primary-light/10 hover:bg-primary-light/18 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark mt-6 inline-flex rounded-md border px-4 py-2 text-sm font-semibold text-cyan-800 transition focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-cyan-300/20 dark:bg-primary-dark/10 dark:text-cyan-50 dark:hover:bg-cyan-300/18"
        >
          Continuar a la entrevista
        </Link>
      </div>
    );
  }

  return (
    <form
      className={`min-w-0 space-y-5 rounded-3xl border border-cyan-800/20 bg-white/80 p-6 shadow-big-blocks backdrop-blur-sm sm:p-7 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30 ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      {/*
        El email va primero y no por casualidad: AWS exige que el campo de correo
        sea visible en la página de registro, y el revisor no debería tener que
        hacer scroll para encontrarlo.
      */}
      <FormField
        id={`${id}-email`}
        label="Correo electrónico institucional"
        error={fieldErrors.emailInstitucional}
        hint="Usaremos esta dirección para enviarte el informe de la evaluación."
      >
        <input
          id={`${id}-email`}
          name="emailInstitucional"
          type="email"
          autoComplete="email"
          maxLength={254}
          required
          disabled={busy}
          className={fieldClassName}
          placeholder="nombre@hospital.es"
          aria-invalid={Boolean(fieldErrors.emailInstitucional)}
          onInput={(event) => {
            clearFieldError("emailInstitucional");
            setGenericDomain(isGenericEmailDomain(event.currentTarget.value));
          }}
        />
      </FormField>

      {genericDomain ? (
        <p
          className="font-body rounded-lg border border-cyan-800/20 bg-cyan-50/70 px-4 py-3 text-xs leading-5 text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-300/8 dark:text-cyan-50"
          role="note"
        >
          Parece una dirección de correo personal. Puedes continuar sin problema
          — solo nos ayuda a saber cómo contactarte.
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id={`${id}-nombre`} label="Nombre y apellidos" error={fieldErrors.nombre}>
          <input
            id={`${id}-nombre`}
            name="nombre"
            type="text"
            autoComplete="name"
            maxLength={120}
            required
            disabled={busy}
            className={fieldClassName}
            placeholder="Nombre y apellidos"
            aria-invalid={Boolean(fieldErrors.nombre)}
            onInput={() => clearFieldError("nombre")}
          />
        </FormField>

        <FormField id={`${id}-cargo`} label="Cargo" error={fieldErrors.cargo}>
          <SelectChrome>
            <select
              id={`${id}-cargo`}
              name="cargo"
              required
              disabled={busy}
              defaultValue=""
              className={`${fieldClassName} appearance-none pr-11`}
              aria-invalid={Boolean(fieldErrors.cargo)}
              onChange={() => clearFieldError("cargo")}
            >
              <option value="" disabled>
                Selecciona tu cargo
              </option>
              {CARGO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SelectChrome>
        </FormField>
      </div>

      <FormField
        id={`${id}-institucion`}
        label="Institución"
        error={fieldErrors.institucion}
        hint="Nombre oficial del hospital, red o institución."
      >
        <input
          id={`${id}-institucion`}
          name="institucion"
          type="text"
          autoComplete="organization"
          maxLength={200}
          required
          disabled={busy}
          className={fieldClassName}
          placeholder="Hospital Universitario…"
          aria-invalid={Boolean(fieldErrors.institucion)}
          onInput={() => clearFieldError("institucion")}
        />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Exactamente tres opciones. Ver AMBITO_PAIS_OPTIONS. */}
        <FormField
          id={`${id}-ambito`}
          label="Ámbito geográfico"
          error={fieldErrors.ambitoPais}
        >
          <SelectChrome>
            <select
              id={`${id}-ambito`}
              name="ambitoPais"
              required
              disabled={busy}
              defaultValue=""
              className={`${fieldClassName} appearance-none pr-11`}
              aria-invalid={Boolean(fieldErrors.ambitoPais)}
              onChange={() => clearFieldError("ambitoPais")}
            >
              <option value="" disabled>
                Selecciona el ámbito
              </option>
              {AMBITO_PAIS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </SelectChrome>
        </FormField>

        <FormField
          id={`${id}-web`}
          label="Web de la institución"
          error={fieldErrors.webInstitucion}
          optional
          hint="Opcional. Nos da contexto para no preguntar lo obvio."
        >
          <input
            id={`${id}-web`}
            name="webInstitucion"
            type="text"
            inputMode="url"
            maxLength={200}
            disabled={busy}
            className={fieldClassName}
            placeholder="hospital.es"
            aria-invalid={Boolean(fieldErrors.webInstitucion)}
            onInput={() => clearFieldError("webInstitucion")}
          />
        </FormField>
      </div>

      <div className="rounded-xl border border-cyan-800/15 bg-[#f4f9fc]/70 p-4 dark:border-cyan-300/15 dark:bg-white/3">
        <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700 dark:text-slate-200">
          <input
            name="consentimiento"
            type="checkbox"
            required
            disabled={busy}
            className="accent-primary-light mt-0.5 size-4 shrink-0 dark:accent-cyan-300"
            aria-invalid={Boolean(fieldErrors.consentimiento)}
            onChange={() => clearFieldError("consentimiento")}
          />
          <span className="font-body leading-6">
            Acepto el tratamiento de mis datos. {PURPOSE_STATEMENT}{" "}
            {RETENTION_STATEMENT} Puedes consultar el detalle en la{" "}
            <Link
              href="/privacidad"
              className="text-primary-light dark:text-secondary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
            >
              Política de Privacidad
            </Link>
            .
          </span>
        </label>
        {fieldErrors.consentimiento ? (
          <p className="font-body mt-2 text-xs text-rose-700 dark:text-rose-300">
            {fieldErrors.consentimiento}
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
        className="bg-primary-light font-body dark:bg-primary-dark dark:hover:bg-primary-dark-lighter focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark flex min-h-10 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 dark:text-[#04111e] dark:shadow-[0_0_34px_rgba(45,212,191,0.26)]"
      >
        {busy ? "Guardando..." : "Comenzar la evaluación"}
      </button>
    </form>
  );
}

function FormField({
  id,
  label,
  error,
  hint,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="font-body mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
      >
        {label}{" "}
        {optional ? (
          <span className="font-normal text-slate-500 dark:text-slate-400">
            (opcional)
          </span>
        ) : (
          <span aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {hint && !error ? (
        <p className="font-body mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="font-body mt-1.5 text-xs text-rose-700 dark:text-rose-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}

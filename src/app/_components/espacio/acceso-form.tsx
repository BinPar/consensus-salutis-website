"use client";

import { useId, useState } from "react";
import { Eyebrow } from "~/app/_components/eyebrow";
import {
  ACCESO_ENVIADO,
  accesoSchema,
  type AccesoResponse,
} from "~/lib/espacio";

/**
 * El formulario de acceso al espacio de cliente (issue #7 §3): una línea.
 *
 * ## Una línea, y no una contraseña
 *
 * Para el revisor de AWS esto es **menos fricción que crear una cuenta**: usa el
 * mismo correo que escribió en la Etapa 0. Y para nosotros resuelve una ventana
 * que ningún login con cuentas cubre — entre que termina la evaluación y que
 * damos el alta manual pasan hasta cinco días laborables en los que el comprador
 * **no existe como usuario**, así que no hay contraseña que pudiera haber creado.
 *
 * ## La respuesta es la misma, y por eso el éxito no dice nada
 *
 * «Si ese correo corresponde a una suscripción…». No «te hemos enviado», que
 * confirmaría que el correo es de un cliente. La copy vive congelada en
 * `ACCESO_ENVIADO` y este componente no la compone ni la interpola: si la pintara
 * a trozos, alguien acabaría añadiendo el email dentro y el formulario sería un
 * oráculo de quién es cliente nuestro.
 *
 * Por lo mismo el estado de éxito **no vuelve a `idle` con un botón**: no hay
 * «enviar otro» como en el formulario de contacto. Quien no reciba el correo
 * recarga y lo pide otra vez; un botón de reintento invitaría a gastar los cinco
 * envíos por hora en treinta segundos.
 */
export function AccesoForm({ className = "" }: { className?: string }) {
  const idPrefix = useId();
  const emailId = `${idPrefix}-email`;

  const [status, setStatus] = useState<"idle" | "submitting" | "success">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const busy = status === "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const form = new FormData(event.currentTarget);
    const parsed = accesoSchema.safeParse({ email: form.get("email") ?? "" });
    if (!parsed.success) {
      setFieldError(
        parsed.error.issues[0]?.message ?? "Revisa el campo indicado.",
      );
      setMessage(null);
      return;
    }

    setStatus("submitting");
    setMessage(null);
    setFieldError(null);

    try {
      const response = await fetch("/api/espacio/acceso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: parsed.data.email,
          website: form.get("website") ?? "",
        }),
      });
      const result = (await response.json()) as AccesoResponse;

      if (!result.ok) {
        setStatus("idle");
        setMessage(result.message);
        if (result.fieldErrors?.email !== undefined)
          setFieldError(result.fieldErrors.email);
        return;
      }
      setStatus("success");
    } catch {
      setStatus("idle");
      setMessage("No hemos podido enviar la solicitud. Inténtalo de nuevo.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={`min-w-0 rounded-3xl border border-cyan-800/20 bg-white/75 p-7 shadow-2xl shadow-slate-900/10 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-cyan-950/30 ${className}`}
        role="status"
      >
        <Eyebrow>Solicitud enviada</Eyebrow>
        <h2 className="font-display mt-4 text-2xl font-semibold text-[#05215e] dark:text-slate-50">
          {ACCESO_ENVIADO.titulo}
        </h2>
        <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {ACCESO_ENVIADO.cuerpo}
        </p>
      </div>
    );
  }

  return (
    <form
      className={`shadow-big-blocks min-w-0 space-y-5 rounded-3xl border border-cyan-800/20 bg-white/80 p-7 backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-2xl dark:shadow-cyan-950/30 ${className}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <div>
        <label
          htmlFor={emailId}
          className="font-body mb-2 block text-sm font-medium text-slate-900 dark:text-slate-100"
        >
          Correo institucional <span aria-hidden="true">*</span>
        </label>
        <input
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={busy}
          aria-invalid={fieldError !== null}
          placeholder="compras@hospital.example"
          onInput={() => {
            if (fieldError !== null) setFieldError(null);
            if (message !== null) setMessage(null);
          }}
          className="font-body focus:border-primary-light/55 focus:ring-primary-light/10 w-full rounded-lg border border-cyan-800/15 bg-white/60 px-4 py-3 text-sm text-slate-900 transition outline-none placeholder:text-slate-500 focus:bg-white focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 dark:border-cyan-300/10 dark:bg-[#04111e]/68 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-300/55 dark:focus:bg-[#061a2a] dark:focus:ring-cyan-300/10"
        />
        {fieldError !== null ? (
          <p className="font-body mt-1.5 text-xs text-rose-700 dark:text-rose-300">
            {fieldError}
          </p>
        ) : null}
        <p className="font-body mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
          Tiene que ser el mismo correo con el que se hizo la evaluación.
        </p>
      </div>

      {/* Trampa para bots. El servidor contesta como si hubiera funcionado. */}
      <div className="absolute top-auto -left-2499.75 size-px overflow-hidden">
        <label htmlFor={`${idPrefix}-website`}>Web</label>
        <input
          id={`${idPrefix}-website`}
          name="website"
          type="text"
          tabIndex={-1}
        />
      </div>

      <div aria-live="polite">
        {message !== null ? (
          <p className="font-body text-sm text-rose-700 dark:text-rose-300">
            {message}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={busy}
        className="font-body bg-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark-lighter flex min-h-10 w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-wait disabled:opacity-60 dark:text-[#04111e]"
      >
        {busy ? "Enviando..." : "Enviarme un enlace de acceso"}
      </button>
    </form>
  );
}

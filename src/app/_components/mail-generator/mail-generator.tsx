"use client";

import { Check, Code2, Copy, Info, Monitor, Smartphone } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Eyebrow } from "~/app/_components/eyebrow";
import { SelectMenu } from "~/app/_components/select-menu";
import { teamMembers } from "~/app/_components/team/team-data";
import styles from "./mail-generator.module.css";
import { recolor, type ClientScheme } from "./client-dark-mode";
import {
  renderSignature,
  renderSignatureText,
  type SignatureData,
  type SignatureVariant,
} from "./signature-templates";

// Personas de la sección de equipo, por orden alfabético: sus fotografías
// están publicadas en /images/team/{slug}.jpg.
const people = [...teamMembers].sort((a, b) =>
  a.name.localeCompare(b.name, "es"),
);

const photoOptions = [
  { value: "", label: "Elige tu fotografía" },
  ...people.map((person) => ({ value: person.slug, label: person.name })),
];

// Valores de muestra para la vista previa mientras el formulario está vacío.
const placeholders = {
  firstName: "Nombre",
  lastName: "Apellidos",
  role: "Cargo",
  email: "nombre@binpar.com",
  phone: "+34 600 000 000",
};

type Fields = {
  firstName: string;
  lastName: string;
  role: string;
  email: string;
  phone: string;
  withPhone: boolean;
  withPhoto: boolean;
  photo: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function problems(fields: Fields) {
  const found: Partial<Record<keyof Fields, string>> = {};
  if (!fields.firstName.trim()) found.firstName = "Escribe el nombre.";
  if (!fields.lastName.trim()) found.lastName = "Escribe los apellidos.";
  if (!fields.role.trim()) found.role = "Escribe el cargo.";
  if (!emailPattern.test(fields.email.trim()))
    found.email = "Escribe un correo válido.";
  if (fields.withPhone && fields.phone.replace(/\D/g, "").length < 6)
    found.phone = "Escribe un teléfono válido.";
  if (fields.withPhoto && !fields.photo) found.photo = "Elige la fotografía.";
  return found;
}

function signatureData(fields: Fields, preview: boolean): SignatureData {
  const value = (key: keyof typeof placeholders) =>
    fields[key].trim() || (preview ? placeholders[key] : "");
  return {
    firstName: value("firstName"),
    lastName: value("lastName"),
    role: value("role"),
    email: value("email"),
    phone: fields.withPhone ? value("phone") : undefined,
    photo: fields.withPhoto && fields.photo ? fields.photo : undefined,
  };
}

const pill = `${styles.button} font-body`;
const outline = `${pill} ${styles.buttonOutline}`;
const choice = (active: boolean) =>
  `${pill} ${styles.choice} ${active ? styles.choiceActive : ""}`;

async function copyRich(html: string, text: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([html], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
  } catch {
    const node = document.createElement("div");
    node.innerHTML = html;
    node.style.position = "fixed";
    node.style.left = "-9999px";
    document.body.append(node);
    const range = document.createRange();
    range.selectNodeContents(node);
    const selection = window.getSelection();
    const previousFocus = document.activeElement;
    try {
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (!document.execCommand("copy"))
        throw new Error("Clipboard unavailable");
    } finally {
      selection?.removeAllRanges();
      node.remove();
      if (previousFocus instanceof HTMLElement)
        previousFocus.focus({ preventScroll: true });
    }
  }
}

function Signature({
  html,
  scheme = "light",
}: {
  html: string;
  scheme?: ClientScheme;
}) {
  return <div dangerouslySetInnerHTML={{ __html: recolor(html, scheme) }} />;
}

const clients: Record<ClientScheme, { surface: string; text: string }> = {
  light: {
    surface: "bg-white",
    text: "text-[#202124]",
  },
  keep: {
    surface: "bg-[#1e1e1e]",
    text: "text-[#e3e3e3]",
  },
  partial: {
    surface: "bg-[#1e1e1e]",
    text: "text-[#e3e3e3]",
  },
  full: {
    surface: "bg-[#121212]",
    text: "text-[#e3e3e3]",
  },
};

// Muestra la firma sobre el fondo del cliente de correo del destinatario.
function MailFrame({
  note,
  children,
  compact = false,
  scheme = "light",
}: {
  note: string;
  children: ReactNode;
  compact?: boolean;
  scheme?: ClientScheme;
}) {
  const client = clients[scheme];
  return (
    <figure className={styles.mail}>
      <div
        className={styles.mailScroll}
        tabIndex={0}
        role="region"
        aria-label="Vista previa de la firma"
      >
        <div
          className={`${client.surface} ${client.text} ${compact ? "p-4" : "p-5 sm:p-6"} min-w-[280px] [font-family:Arial,Helvetica,sans-serif] text-[14px] leading-[22px]`}
        >
          {children}
        </div>
      </div>
      <figcaption className={`${styles.previewNote} font-body`}>
        <Info size={16} strokeWidth={1.8} aria-hidden="true" />
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}

function CopyButtons({
  data,
  variant,
  ready,
  onBlocked,
  assetOrigin,
}: {
  assetOrigin: string;
  data: SignatureData;
  variant: SignatureVariant;
  ready: boolean;
  onBlocked: () => void;
}) {
  const [copied, setCopied] = useState<"signature" | "html" | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const done = (kind: "signature" | "html") => {
    setCopied(kind);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  };
  const copy = async (kind: "signature" | "html") => {
    if (!ready) return onBlocked();
    setCopyError(null);
    try {
      const html = renderSignature(data, assetOrigin, variant);
      if (kind === "signature") await copyRich(html, renderSignatureText(data));
      else await navigator.clipboard.writeText(html);
      done(kind);
    } catch {
      setCopied(null);
      setCopyError(
        "No se ha podido copiar. Revisa los permisos del navegador e inténtalo de nuevo.",
      );
    }
  };
  return (
    <div className={styles.copyButtons} aria-live="polite">
      <button
        type="button"
        className={`${pill} ${styles.buttonPrimary}`}
        onClick={() => copy("signature")}
      >
        {copied === "signature" ? (
          <Check size={16} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <Copy size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
        {copied === "signature" ? "Firma copiada" : "Copiar firma"}
      </button>
      <button type="button" className={outline} onClick={() => copy("html")}>
        {copied === "html" ? (
          <Check size={16} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <Code2 size={16} strokeWidth={1.8} aria-hidden="true" />
        )}
        {copied === "html" ? "HTML copiado" : "Copiar HTML"}
      </button>
      {copyError && (
        <p
          role="status"
          className="w-full text-xs leading-5 text-rose-700 dark:text-rose-300"
        >
          {copyError}
        </p>
      )}
    </div>
  );
}

const field = `${styles.field} font-body`;

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`${styles.label} font-body`}>
        {label}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="font-body mt-1.5 text-xs text-rose-700 dark:text-rose-300"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// Interruptor de sí o no del formulario.
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = useId();
  return (
    <div className={styles.toggleRow}>
      <label htmlFor={id} className={`${styles.toggleLabel} font-body`}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={styles.switch}
      >
        <span className={styles.switchTrack} aria-hidden="true">
          <span className={styles.switchThumb}>
            {checked && <Check size={12} strokeWidth={1.8} />}
          </span>
        </span>
      </button>
    </div>
  );
}

const views = {
  desktop: { label: "Escritorio", icon: Monitor },
  mobile: { label: "Móvil", icon: Smartphone },
} as const;

const schemes = {
  light: {
    label: "Claro",
    note: "Vista de ejemplo en un cliente de correo en modo claro.",
  },
  partial: {
    label: "Oscuro",
    note: "Simulación de un cliente que adapta los fondos claros y el texto al modo oscuro. El resultado puede variar según la aplicación.",
  },
  full: {
    label: "Invertido",
    note: "Simulación de la inversión de colores que pueden aplicar algunos clientes de correo. El resultado puede variar según la aplicación.",
  },
} satisfies Partial<Record<ClientScheme, { label: string; note: string }>>;

export function MailGenerator({
  assetOrigin,
  variant: direction = "open",
  previewId = "mail-generator",
}: {
  assetOrigin: string;
  variant?: SignatureVariant;
  previewId?: string;
}) {
  const id = useId();
  const form = useRef<HTMLFormElement>(null);
  const [fields, setFields] = useState<Fields>({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    phone: "",
    withPhone: false,
    withPhoto: false,
    photo: "",
  });
  const [touched, setTouched] = useState<Set<keyof Fields>>(() => new Set());
  const [view, setView] = useState<keyof typeof views>("desktop");
  const [scheme, setScheme] = useState<keyof typeof schemes>("light");
  const errors = problems(fields);
  const ready = Object.keys(errors).length === 0;
  const visible = (key: keyof Fields) =>
    touched.has(key) ? errors[key] : undefined;
  const set = <K extends keyof Fields>(key: K, value: Fields[K]) =>
    setFields((previous) => ({ ...previous, [key]: value }));
  const touch = (key: keyof Fields) =>
    setTouched((previous) => new Set(previous).add(key));
  const html = renderSignature(signatureData(fields, true), "", direction);
  const onBlocked = () => {
    setTouched(new Set(Object.keys(fields) as (keyof Fields)[]));
    window.requestAnimationFrame(() =>
      form.current
        ?.querySelector<HTMLElement>(
          '[aria-invalid="true"], [data-invalid="true"]',
        )
        ?.focus(),
    );
  };

  const text = (
    key: "firstName" | "lastName" | "role" | "email" | "phone",
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <Field id={`${id}-${key}`} label={label} error={visible(key)}>
      <input
        id={`${id}-${key}`}
        value={fields[key]}
        onChange={(event) => set(key, event.target.value)}
        onBlur={() => touch(key)}
        aria-invalid={Boolean(visible(key))}
        aria-describedby={visible(key) ? `${id}-${key}-error` : undefined}
        className={field}
        required
        {...props}
      />
    </Field>
  );

  return (
    <main
      id={previewId}
      data-mail-generator=""
      aria-label="Generador de firmas de correo"
      className={styles.root}
    >
      <div className={styles.content}>
        <header className={styles.intro}>
          <Eyebrow>Herramientas del equipo</Eyebrow>
          <h1 className={`${styles.title} font-display`}>
            Tu firma <span>de correo.</span>
          </h1>
          <p className={`${styles.lede} font-body`}>
            Completa tus datos, revisa el resultado y copia la firma para
            incorporarla a tu correo.
          </p>
        </header>

        <div className={styles.layout}>
          <form
            ref={form}
            aria-labelledby={`${id}-data-title`}
            noValidate
            onSubmit={(event) => event.preventDefault()}
            className={styles.panel}
          >
            <div className={styles.sectionHeading}>
              <h2
                id={`${id}-data-title`}
                className={`${styles.sectionTitle} font-display`}
              >
                Datos de la firma
              </h2>
              <p className={`${styles.sectionDescription} font-body`}>
                Los cambios se muestran al instante.
              </p>
            </div>
            <div className={styles.fields}>
              <div className={styles.nameFields}>
                {text("firstName", "Nombre", {
                  autoComplete: "given-name",
                  placeholder: "Nombre",
                })}
                {text("lastName", "Apellidos", {
                  autoComplete: "family-name",
                  placeholder: "Apellidos",
                })}
              </div>
              {text("role", "Cargo", {
                autoComplete: "organization-title",
                placeholder: "Cargo",
              })}
              {text("email", "Correo electrónico", {
                type: "email",
                autoComplete: "email",
                inputMode: "email",
                placeholder: "nombre@binpar.com",
              })}
            </div>

            <div className={styles.optional}>
              <Toggle
                label="Incluir teléfono"
                checked={fields.withPhone}
                onChange={(value) => set("withPhone", value)}
              />
              {fields.withPhone &&
                text("phone", "Número de teléfono", {
                  type: "tel",
                  autoComplete: "tel",
                  inputMode: "tel",
                  placeholder: "+34 600 000 000",
                })}
            </div>

            <div className={styles.optional}>
              <Toggle
                label="Incluir fotografía"
                checked={fields.withPhoto}
                onChange={(value) => set("withPhoto", value)}
              />
              {fields.withPhoto ? (
                <Field
                  id={`${id}-photo`}
                  label="Persona del equipo"
                  error={visible("photo")}
                >
                  <SelectMenu
                    id={`${id}-photo`}
                    value={fields.photo}
                    onChange={(value) => set("photo", value)}
                    onBlur={() => touch("photo")}
                    label="Persona del equipo"
                    invalid={Boolean(visible("photo"))}
                    describedBy={
                      visible("photo") ? `${id}-photo-error` : undefined
                    }
                    className="w-full min-w-0"
                    triggerClassName={`${field} ${styles.select}`}
                    menuClassName="max-h-64 w-full overflow-y-auto overscroll-contain"
                    options={photoOptions}
                  />
                </Field>
              ) : (
                <p className={`${styles.hint} font-body`}>
                  La firma mostrará la tesela de BinPar.
                </p>
              )}
            </div>
            {!ready && touched.size > 0 && (
              <p
                role="status"
                className="font-body mt-4 text-sm text-rose-700 dark:text-rose-300"
              >
                Completa los campos marcados para copiar la firma.
              </p>
            )}
          </form>

          <section
            aria-labelledby={`${id}-preview-title`}
            className={styles.panel}
            data-mail-preview=""
          >
            <div className={styles.previewHeading}>
              <div className={styles.sectionHeading}>
                <h2
                  id={`${id}-preview-title`}
                  className={`${styles.sectionTitle} font-display`}
                >
                  Revisa el resultado
                </h2>
              </div>
              <div className={styles.actions}>
                <CopyButtons
                  assetOrigin={assetOrigin}
                  data={signatureData(fields, false)}
                  variant={direction}
                  ready={ready}
                  onBlocked={onBlocked}
                />
              </div>
            </div>
            <div className={styles.toolbar}>
              <div className={styles.controlGroup}>
                <span
                  className={`${styles.controlLabel} font-body`}
                  id={`${id}-device-label`}
                >
                  Dispositivo
                </span>
                <div
                  className={styles.choices}
                  role="group"
                  aria-labelledby={`${id}-device-label`}
                >
                  {(Object.keys(views) as (keyof typeof views)[]).map((key) => {
                    const Icon = views[key].icon;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={view === key}
                        onClick={() => setView(key)}
                        className={choice(view === key)}
                      >
                        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                        {views[key].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.controlGroup}>
                <span
                  className={`${styles.controlLabel} font-body`}
                  id={`${id}-scheme-label`}
                >
                  Apariencia del correo
                </span>
                <div
                  className={styles.choices}
                  role="group"
                  aria-labelledby={`${id}-scheme-label`}
                >
                  {(Object.keys(schemes) as (keyof typeof schemes)[]).map(
                    (key) => (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={scheme === key}
                        onClick={() => setScheme(key)}
                        className={choice(scheme === key)}
                      >
                        {schemes[key].label}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div
              className={`${styles.previewStage} ${view === "mobile" ? styles.previewStageMobile : ""}`}
            >
              <MailFrame
                note={schemes[scheme].note}
                compact={view === "mobile"}
                scheme={scheme}
              >
                <Signature html={html} scheme={scheme} />
              </MailFrame>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

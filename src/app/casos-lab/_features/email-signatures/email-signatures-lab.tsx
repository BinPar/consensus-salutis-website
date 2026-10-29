"use client";

import { Check, Code2, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { recolor, type ClientScheme } from "./client-dark-mode";
import {
  emailSignaturesDirections,
  type EmailSignaturesDirection,
} from "./email-signatures-directions";
import {
  renderSignature,
  renderSignatureText,
  type SignatureData,
} from "./signature-templates";

// Datos de muestra: el teléfono es ficticio.
const samples = {
  standard: {
    label: "Muestra",
    data: {
      firstName: "Adrián",
      lastName: "Rodríguez Amago",
      role: "Front End",
      email: "adrian@binpar.com",
      phone: "+34 600 000 000",
    },
  },
  long: {
    label: "Textos largos",
    data: {
      firstName: "María de los Ángeles",
      lastName: "Fernández-Villaverde",
      role: "Responsable de Regulación e Inteligencia Clínica",
      email: "mariaangeles.fernandez@binpar.com",
      phone: "+34 600 000 000",
    },
  },
  "no-phone": {
    label: "Sin teléfono",
    data: {
      firstName: "Adrián",
      lastName: "Rodríguez Amago",
      role: "Front End",
      email: "adrian@binpar.com",
    },
  },
} satisfies Record<string, { label: string; data: SignatureData }>;

type Sample = keyof typeof samples;

// Fotografía de la sección de equipo usada en la muestra.
const teamPhoto = "adrian-rodriguez";

// Sora y Plus Jakarta Sans para ver la firma como en un equipo que las tenga.
const fontFaces = `@font-face{font-family:Sora;src:url(/lab/email-signatures/fonts/Sora-Variable.ttf) format("truetype");font-weight:100 900;font-display:swap}@font-face{font-family:'Plus Jakarta Sans';src:url(/lab/email-signatures/fonts/PlusJakartaSans-Variable.ttf) format("truetype");font-weight:200 800;font-display:swap}`;

const pill =
  "font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex min-h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2";
const outline = `${pill} border border-cyan-800/15 text-slate-600 hover:border-primary-light/35 hover:bg-primary-light/5 dark:border-cyan-300/15 dark:text-slate-300 dark:hover:border-primary-dark/35 dark:hover:bg-primary-dark/5`;
const choice = (active: boolean) =>
  `${pill} ${active ? "bg-[#05215e] text-white dark:bg-slate-100 dark:text-[#06111f]" : "bg-slate-100 text-slate-600 hover:bg-slate-200/75 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"}`;

// La firma copiada enlaza sus imágenes al despliegue público de develop, nunca
// a localhost: las cargan el cliente de correo y cada destinatario.
const publicOrigin =
  "https://consensus-salutis-website-git-develop-bin-par.vercel.app";

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
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.execCommand("copy");
    selection?.removeAllRanges();
    node.remove();
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

const clients: Record<
  ClientScheme,
  { surface: string; text: string; meta: string; line: string }
> = {
  light: {
    surface: "bg-white",
    text: "text-[#202124]",
    meta: "text-[#5f6368]",
    line: "border-[#e8eaed]",
  },
  keep: {
    surface: "bg-[#1e1e1e]",
    text: "text-[#e3e3e3]",
    meta: "text-[#9aa0a6]",
    line: "border-[#3c4043]",
  },
  partial: {
    surface: "bg-[#1e1e1e]",
    text: "text-[#e3e3e3]",
    meta: "text-[#9aa0a6]",
    line: "border-[#3c4043]",
  },
  full: {
    surface: "bg-[#121212]",
    text: "text-[#e3e3e3]",
    meta: "text-[#9aa0a6]",
    line: "border-[#3c4043]",
  },
};

// Simula el cuerpo de un mensaje en el cliente de correo del destinatario.
function MailFrame({
  label,
  note,
  children,
  compact = false,
  scheme = "light",
}: {
  label: string;
  note?: string;
  children: ReactNode;
  compact?: boolean;
  scheme?: ClientScheme;
}) {
  const client = clients[scheme];
  return (
    <figure className="min-w-0">
      <figcaption className="font-body mb-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </span>
        {note && <span className="block">{note}</span>}
      </figcaption>
      <div className="overflow-x-auto rounded-2xl border border-cyan-800/15 shadow-[0_18px_40px_-28px_rgb(0_109_121/0.45)] dark:border-cyan-300/20">
        <div
          className={`${client.surface} ${client.text} ${compact ? "p-4" : "p-6 sm:p-8"} [font-family:Arial,Helvetica,sans-serif] text-[14px] leading-[22px]`}
        >
          <div
            className={`mb-5 space-y-1 border-b pb-4 text-[12px] ${client.line} ${client.meta}`}
          >
            <p>Para: elena.marin@hospital.example</p>
            <p>Asunto: Documentación del piloto</p>
          </div>
          <p>Hola, Elena:</p>
          <p className="mt-3">
            Te adjunto la documentación técnica del piloto y el calendario
            propuesto para la primera fase.
          </p>
          <p className="mt-3 mb-6">Un saludo,</p>
          {children}
        </div>
      </div>
    </figure>
  );
}

function CopyButtons({
  data,
  variant,
}: {
  data: SignatureData;
  variant: EmailSignaturesDirection;
}) {
  const [copied, setCopied] = useState<"signature" | "html" | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const done = (kind: "signature" | "html") => {
    setCopied(kind);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(null), 1800);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className={`${pill} bg-primary-light dark:bg-primary-dark text-white hover:opacity-90 dark:text-[#04111e]`}
        onClick={async () => {
          await copyRich(
            renderSignature(data, publicOrigin, variant),
            renderSignatureText(data),
          );
          done("signature");
        }}
      >
        {copied === "signature" ? (
          <Check size={16} strokeWidth={1.8} />
        ) : (
          <Copy size={16} strokeWidth={1.8} />
        )}
        {copied === "signature" ? "Firma copiada" : "Copiar firma"}
      </button>
      <button
        type="button"
        className={outline}
        onClick={async () => {
          await navigator.clipboard.writeText(
            renderSignature(data, publicOrigin, variant),
          );
          done("html");
        }}
      >
        {copied === "html" ? (
          <Check size={16} strokeWidth={1.8} />
        ) : (
          <Code2 size={16} strokeWidth={1.8} />
        )}
        {copied === "html" ? "HTML copiado" : "Copiar HTML"}
      </button>
    </div>
  );
}

export function EmailSignaturesLab({
  direction,
}: {
  direction: EmailSignaturesDirection;
}) {
  const [sample, setSample] = useState<Sample>("standard");
  const [photo, setPhoto] = useState(true);
  const current = emailSignaturesDirections.find(
    (item) => item.id === direction,
  )!;
  const data: SignatureData = {
    ...samples[sample].data,
    photo: photo ? teamPhoto : undefined,
  };
  const html = renderSignature(data, "", direction);

  return (
    <main
      id="email-signatures-preview"
      aria-label="Laboratorio de firmas de correo"
      className="relative z-10 mx-auto w-full max-w-7xl [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)] px-5 pt-10 pb-20 sm:px-10 sm:pt-14"
    >
      <style>{fontFaces}</style>
      <div className="max-w-2xl">
        <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
          Firmas de correo · {current.number} {current.label}
        </p>
        <p className="font-body mt-4 text-base leading-7 text-slate-600 dark:text-slate-400">
          {current.description}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body mr-1 text-xs text-slate-500 dark:text-slate-400">
            Fotografía
          </span>
          <button
            type="button"
            aria-pressed={photo}
            onClick={() => setPhoto(true)}
            className={choice(photo)}
          >
            Con foto
          </button>
          <button
            type="button"
            aria-pressed={!photo}
            onClick={() => setPhoto(false)}
            className={choice(!photo)}
          >
            Sin foto
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-body mr-1 text-xs text-slate-500 dark:text-slate-400">
            Datos
          </span>
          {(Object.keys(samples) as Sample[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={sample === key}
              onClick={() => setSample(key)}
              className={choice(sample === key)}
            >
              {samples[key].label}
            </button>
          ))}
        </div>
        <CopyButtons data={data} variant={direction} />
      </div>

      <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <MailFrame label="Escritorio · cliente claro">
          <Signature html={html} />
        </MailFrame>
        <MailFrame label="Móvil · 360 px" compact>
          <Signature html={html} />
        </MailFrame>
      </div>

      <h2 className="font-display mt-14 text-lg font-semibold text-[#05215e] dark:text-slate-50">
        Destinatarios en modo oscuro
      </h2>
      <p className="font-body mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
        {current.darkMode}
      </p>
      <div className="mt-6 grid items-start gap-8 md:grid-cols-2">
        <MailFrame
          label="Recolorea fondos claros y texto oscuro"
          note="Outlook, Apple Mail, Gmail Android · simulación"
          compact
          scheme="partial"
        >
          <Signature html={html} scheme="partial" />
        </MailFrame>
        <MailFrame
          label="Invierte todos los colores"
          note="Gmail iOS · simulación"
          compact
          scheme="full"
        >
          <Signature html={html} scheme="full" />
        </MailFrame>
      </div>
    </main>
  );
}

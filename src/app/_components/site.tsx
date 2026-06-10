import Link from "next/link";
import type { ReactNode } from "react";

import { FooterBandMenu } from "~/app/_components/footer-band-menu";

const navItems = [
  { href: "/plataforma", label: "Plataforma" },
  { href: "/evidencia", label: "Evidencia" },
  { href: "/seguridad", label: "Seguridad" },
  { href: "/casos", label: "Casos" },
];

const contactItems = [
  { href: "/contacto", label: "Solicitar reunión" },
  {
    href: "mailto:info@binpar.com?subject=Consensus%20Salutis",
    label: "info@binpar.com",
  },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-cyan-300/10 bg-[#06111f]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Inicio">
          <span className="grid size-8 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-xs font-semibold text-cyan-100 shadow-[0_0_24px_rgba(45,212,191,0.2)]">
            CS
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] text-slate-50 uppercase">
            Consensus Salutis
          </span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-400 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-cyan-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/contacto"
          className="rounded-md border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/18"
        >
          Solicitar reunión
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-cyan-300/10 bg-[#030916] text-slate-400">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-slate-50 uppercase">
            Consensus Salutis
          </p>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-400">
            IA médica institucional para convertir conocimiento clínico en
            decisión trazable, gobernada y segura.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div className="space-y-3">
            <p className="font-semibold text-slate-100">Producto</p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block text-slate-400 transition hover:text-cyan-100"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-slate-100">Contacto</p>
            <Link
              href="/contacto"
              className="block text-slate-400 transition hover:text-cyan-100"
            >
              Reunión institucional
            </Link>
            <a
              href="mailto:info@binpar.com?subject=Consensus%20Salutis"
              className="block text-slate-400 transition hover:text-cyan-100"
            >
              info@binpar.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function HomeFooterBand() {
  return (
    <footer className="relative z-40 shrink-0 border-t border-cyan-300/15 bg-[#030b17]/92 text-slate-400 backdrop-blur-md">
      <div className="mx-auto flex min-h-12 w-full max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:h-12">
        <Link
          href="/"
          className="text-[9px] font-semibold tracking-[0.16em] text-slate-100 uppercase transition hover:text-cyan-100"
        >
          © Consensus Salutis all rights reserved
        </Link>
        <nav
          aria-label="Enlaces del pie"
          className="flex items-center gap-1 sm:gap-3"
        >
          <FooterBandMenu label="Producto" items={navItems} />
          <FooterBandMenu label="Contacto" items={contactItems} />
        </nav>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

export function HomeShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate bg-[#06111f] lg:flex lg:h-screen lg:flex-col lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[#06111f] bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.1)_72%,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)] bg-size-[44px_44px]"
      />
      <SiteHeader />
      {children}
      <HomeFooterBand />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold tracking-[0.22em] text-cyan-300 uppercase">
      {children}
    </p>
  );
}

export function CTAGroup() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/contacto"
        className="rounded-md bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#04111e] shadow-[0_0_34px_rgba(45,212,191,0.26)] transition hover:bg-cyan-200"
      >
        Solicitar reunión
      </Link>
      <Link
        href="/plataforma"
        className="rounded-md border border-cyan-300/20 bg-white/3 px-5 py-3 text-center text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
      >
        Explorar plataforma
      </Link>
    </div>
  );
}

export function MetricGrid({
  metrics,
}: {
  metrics: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid overflow-hidden rounded-md border border-cyan-300/10 bg-cyan-300/10 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="border-r border-b border-cyan-300/10 bg-[#071727]/88 p-6 last:border-r-0 sm:nth-[2n]:border-r-0 lg:nth-[2n]:border-r lg:nth-[4n]:border-r-0 lg:nth-[n+3]:border-b-0"
        >
          <p className="text-3xl font-semibold text-cyan-100">{metric.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {metric.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SignalPanel() {
  return (
    <div className="relative overflow-hidden rounded-md border border-cyan-300/15 bg-[#071727] p-5 shadow-2xl shadow-cyan-950/30">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.12),transparent_34%,rgba(20,184,166,0.12)_68%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.05)_1px,transparent_1px)] bg-size-[32px_32px]" />
      <div className="relative">
        <div className="flex items-center justify-between border-b border-cyan-300/10 pb-4">
          <p className="text-xs font-semibold tracking-[0.2em] text-cyan-200 uppercase">
            Núcleo de conocimiento
          </p>
          <p className="text-xs text-slate-400">Trazabilidad activa</p>
        </div>

        <div className="relative mt-8 aspect-square min-h-80">
          <div className="absolute inset-8 rounded-md border border-cyan-300/10" />
          <div className="absolute inset-16 rounded-md border border-teal-300/10" />
          <div className="absolute top-1/2 left-1/2 grid size-28 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md border border-cyan-200/30 bg-cyan-300/12 text-center shadow-[0_0_42px_rgba(45,212,191,0.22)]">
            <span className="text-xs font-semibold tracking-[0.18em] text-cyan-50 uppercase">
              Consensus
            </span>
          </div>
          {[
            ["Guías", "top-4 left-8"],
            ["Protocolos", "top-12 right-4"],
            ["Corpus", "right-8 bottom-12"],
            ["Comité", "bottom-4 left-10"],
            ["Auditoría", "top-1/2 left-0 -translate-y-1/2"],
          ].map(([label, position]) => (
            <div
              key={label}
              className={`absolute ${position} rounded-md border border-white/10 bg-[#0b2136]/90 px-3 py-2 text-xs font-medium text-slate-200`}
            >
              {label}
            </div>
          ))}
          <div className="absolute top-[22%] left-[24%] h-px w-32 rotate-25 bg-cyan-300/25" />
          <div className="absolute top-[34%] right-[20%] h-px w-28 rotate-[-20deg] bg-teal-300/25" />
          <div className="absolute right-[26%] bottom-[28%] h-px w-32 rotate-28 bg-cyan-300/25" />
          <div className="absolute bottom-[26%] left-[22%] h-px w-28 rotate-[-28deg] bg-teal-300/25" />
        </div>
      </div>
    </div>
  );
}

export function EvidenceFlow() {
  return (
    <div className="grid gap-4">
      {[
        ["01", "Documentos gobernados", "Guías, protocolos y corpus médico."],
        [
          "02",
          "Orquestación especializada",
          "Recuperación, contraste y validación.",
        ],
        [
          "03",
          "Respuesta referenciada",
          "Fuentes visibles y fragmentos auditables.",
        ],
        ["04", "Mejora continua", "Feedback, tests y publicación controlada."],
      ].map(([step, title, detail]) => (
        <div
          key={step}
          className="grid grid-cols-[3rem_1fr] gap-4 rounded-md border border-cyan-300/10 bg-white/[0.035] p-4"
        >
          <span className="text-sm font-semibold text-cyan-300">{step}</span>
          <div>
            <p className="font-semibold text-slate-100">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CapabilityGrid({
  items,
}: {
  items: Array<{ title: string; body: string }>;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="rounded-md border border-cyan-300/10 bg-[#081a2b]/82 p-6 shadow-lg shadow-[#020817]/20"
        >
          <h3 className="text-lg font-semibold text-slate-50">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
        </article>
      ))}
    </div>
  );
}

export function DarkSection({
  children,
  variant = "plain",
}: {
  children: ReactNode;
  variant?: "plain" | "panel" | "deep";
}) {
  const className =
    variant === "panel"
      ? "border-y border-cyan-300/10 bg-[#081827]"
      : variant === "deep"
        ? "border-y border-cyan-300/10 bg-[#030916]"
        : "bg-[#06111f]";

  return <section className={`${className} py-20`}>{children}</section>;
}

export function PageHero({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-cyan-300/10 bg-[#06111f]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.1),transparent_35%,rgba(20,184,166,0.08)_72%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.04)_1px,transparent_1px)] bg-size-[40px_40px]" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-400">
          {body}
        </p>
      </div>
    </section>
  );
}

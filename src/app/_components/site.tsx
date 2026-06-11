import Link from "next/link";
import type { ReactNode } from "react";

import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import { FooterBandMenu } from "~/app/_components/footer-band-menu";
import {
  HomeMotionBackground,
  HomeTransitionShell,
  MotionLink,
  MotionSurface,
} from "~/app/_components/motion-system";

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
    <header className="sticky top-0 z-40 bg-[#06111f]/88 px-5 backdrop-blur-xl sm:px-8">
      <div className="mx-auto flex h-16 w-full max-w-425 items-center justify-between">
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
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,var(--color-primary),transparent)] opacity-45"
      />
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
      <div className="mx-auto flex min-h-12 w-full max-w-425 items-center justify-between gap-3 px-5 sm:px-8 lg:h-12">
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

export function HomeShell({
  children,
  vertical = false,
}: {
  children: ReactNode;
  vertical?: boolean;
}) {
  return (
    <HomeTransitionShell>
      <div
        className={`relative isolate bg-[#06111f] ${
          vertical
            ? "min-h-screen"
            : "lg:flex lg:h-screen lg:flex-col lg:overflow-hidden"
        }`}
      >
        <HomeMotionBackground />
        <SiteHeader />
        {children}
        <HomeFooterBand />
      </div>
    </HomeTransitionShell>
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
      <MotionLink
        href="/contacto"
        className="rounded-md bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#04111e] shadow-[0_0_34px_rgba(45,212,191,0.26)] transition hover:bg-cyan-200"
      >
        Solicitar reunión
      </MotionLink>
      <MotionLink
        href="/plataforma"
        className="rounded-md border border-cyan-300/20 bg-white/3 px-5 py-3 text-center text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
      >
        Explorar plataforma
      </MotionLink>
    </div>
  );
}

export function MetricGrid({
  metrics,
}: {
  metrics: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="grid gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MotionSurface
          key={metric.label}
          className="rounded-2xl border border-cyan-300/20 bg-white/3 p-6 backdrop-blur-sm"
        >
          <p className="text-3xl font-semibold text-cyan-100">{metric.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {metric.label}
          </p>
        </MotionSurface>
      ))}
    </div>
  );
}

export function SignalPanel() {
  return <ClinicalChatMock />;
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
        <MotionSurface
          key={step}
          className="grid grid-cols-[3rem_1fr] gap-4 rounded-md border border-cyan-300/10 bg-white/[0.035] p-4"
        >
          <span className="text-sm font-semibold text-cyan-300">{step}</span>
          <div>
            <p className="font-semibold text-slate-100">{title}</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">{detail}</p>
          </div>
        </MotionSurface>
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
        <MotionSurface
          key={item.title}
          className="rounded-md border border-cyan-300/10 bg-[#081a2b]/82 p-6 shadow-lg shadow-[#020817]/20"
        >
          <h3 className="text-lg font-semibold text-slate-50">{item.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-400">{item.body}</p>
        </MotionSurface>
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

import Link from "next/link";
import { forwardRef } from "react";
import type { ReactNode } from "react";

import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import { FooterBandMenu } from "~/app/_components/footer-band-menu";
import { contactItems, VerticalFooter } from "~/app/_components/site-footer";
import { navItems, SiteHeader } from "~/app/_components/site-header";
import {
  HomeMotionBackground,
  MotionSurface,
  SignalField,
} from "~/app/_components/motion-system";

export function HomeFooterBand() {
  return (
    <footer className="relative z-40 shrink-0 border-t border-cyan-800/10 bg-[#edf6f9]/92 text-slate-600 backdrop-blur-md dark:border-cyan-300/15 dark:bg-[#030b17]/92 dark:text-slate-400">
      <div className="mx-auto flex min-h-12 w-full max-w-425 items-center justify-between gap-3 px-5 sm:px-8 lg:h-12">
        <Link
          href="/"
          className="text-[9px] font-semibold tracking-[0.16em] text-slate-700 uppercase transition hover:text-cyan-800 dark:text-slate-100 dark:hover:text-cyan-100"
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
      <VerticalFooter />
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
    <div
      className={`relative isolate bg-[#fbfdff] dark:bg-[#06111f] ${
        vertical
          ? "min-h-screen"
          : "lg:flex lg:h-screen lg:flex-col lg:overflow-hidden"
      }`}
    >
      <HomeMotionBackground />
      <SiteHeader />
      {children}
      {vertical ? <VerticalFooter /> : <HomeFooterBand />}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-primary-light font-display text-xs font-bold tracking-[0.22em] uppercase dark:text-primary-dark">
      {children}
    </p>
  );
}

export function CTAGroup() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/contacto"
        className="bg-primary-light font-body rounded-full px-5 py-2 min-h-10 text-center text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 dark:bg-primary-dark dark:text-[#04111e] dark:shadow-[0_0_34px_rgba(45,212,191,0.26)] dark:hover:bg-primary-dark-lighter"
      >
        Solicitar reunión
      </Link>
      <Link
        href="/plataforma"
        className="border-primary-light/25 font-body hover:border-primary-light/45 rounded-full border bg-white/65 px-5 py-2 min-h-10 text-center text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:border-cyan-300/30 dark:bg-white/3 dark:text-cyan-50 dark:hover:border-cyan-200/50 dark:hover:bg-cyan-300/10"
      >
        Probar plataforma
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
    <div className="grid gap-4 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MotionSurface
          key={metric.label}
          className="rounded-2xl border border-cyan-800/10 bg-white/75 p-6 shadow-sm backdrop-blur-sm dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-none"
        >
          <p className="text-3xl font-semibold text-cyan-800 dark:text-primary-dark-lighter">
            {metric.value}
          </p>
          <p className="font-body mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
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
          className="grid grid-cols-[3rem_1fr] gap-4 rounded-md border border-cyan-800/10 bg-white/70 p-4 dark:border-cyan-300/10 dark:bg-white/[0.035]"
        >
          <span className="text-primary-light text-sm font-semibold dark:text-primary-dark">
            {step}
          </span>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
            </p>
            <p className="font-body mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
              {detail}
            </p>
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
          className="rounded-md border border-cyan-800/10 bg-white/80 p-6 shadow-lg shadow-slate-900/5 dark:border-cyan-300/10 dark:bg-[#081a2b]/82 dark:shadow-[#020817]/20"
        >
          <h3 className="font-display text-lg font-semibold text-[#05215e] dark:text-slate-50">
            {item.title}
          </h3>
          <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {item.body}
          </p>
        </MotionSurface>
      ))}
    </div>
  );
}

export const ThemeSection = forwardRef<
  HTMLElement,
  {
    children: ReactNode;
    className?: string;
    variant?: "plain" | "panel" | "deep" | "transparent";
  }
>(function ThemeSection({ children, className = "", variant = "plain" }, ref) {
  const variantClassName =
    variant === "panel"
      ? "relative overflow-hidden border-y border-cyan-800/10 bg-[linear-gradient(135deg,rgba(222,237,243,0.74),rgba(237,246,249,0.34))] dark:border-cyan-300/10 dark:bg-[linear-gradient(135deg,rgba(3,9,22,0.74),rgba(8,24,39,0.48))] lg:bg-[#e8f2f7] lg:dark:bg-[#081827]"
      : variant === "deep"
        ? "relative overflow-hidden border-y border-cyan-800/10 bg-[linear-gradient(135deg,rgba(222,237,243,0.82),rgba(237,246,249,0.42))] dark:border-cyan-300/10 dark:bg-[linear-gradient(135deg,rgba(3,9,22,0.82),rgba(3,9,22,0.54))] lg:bg-[#deedf3] lg:dark:bg-[#030916]"
        : variant === "transparent"
          ? "relative overflow-hidden bg-transparent"
          : "relative overflow-hidden bg-linear-to-br from-[#deedf3]/80 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30 lg:bg-[#f4f9fc] lg:dark:bg-[#06111f]";

  return (
    <section ref={ref} className={`${variantClassName} ${className} py-20`}>
      <div className="relative z-10">{children}</div>
    </section>
  );
});

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
    <section className="relative overflow-hidden border-b border-cyan-800/10 bg-[#fbfdff] dark:border-cyan-300/10 dark:bg-[#06111f]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_35%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.1),transparent_35%,rgba(20,184,166,0.08)_72%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.07)_1px,transparent_1px)] bg-size-[40px_40px] dark:bg-[linear-gradient(rgba(125,211,252,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.04)_1px,transparent_1px)]" />
      <SignalField intensity="hero" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display mt-5 max-w-4xl text-4xl font-semibold tracking-tight text-[#05215e] sm:text-5xl dark:text-slate-50">
          {title}
        </h1>
        <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          {body}
        </p>
      </div>
    </section>
  );
}

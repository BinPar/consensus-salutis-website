import { useTranslations } from "next-intl";
import { forwardRef } from "react";
import type { ReactNode } from "react";

import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import { Eyebrow } from "~/app/_components/eyebrow";
import { FooterBandMenu } from "~/app/_components/footer-band-menu";
import { VerticalFooter } from "~/app/_components/site-footer";
import {
  useContactItems,
  useNavItems,
} from "~/app/_components/site-footer-links";
import { SiteHeader } from "~/app/_components/site-header";
import {
  HomeGrid,
  HomeMotionBackground,
  MotionSurface,
  SignalField,
} from "~/app/_components/motion-system";
import { Link } from "~/i18n/navigation";

export function HomeFooterBand() {
  const t = useTranslations("layout.footerBand");
  const navItems = useNavItems();
  const contactItems = useContactItems();

  return (
    <footer className="dark:border-primary-dark/15 relative z-40 shrink-0 border-t border-cyan-800/10 bg-[#edf6f9]/92 text-slate-600 backdrop-blur-md dark:bg-[#030b17]/92 dark:text-slate-400">
      <div className="mx-auto flex min-h-12 w-full max-w-425 items-center justify-between gap-3 px-5 sm:px-8 lg:h-12">
        <Link
          href="/"
          className="dark:hover:text-primary-dark text-[9px] font-semibold tracking-[0.16em] text-slate-700 uppercase transition hover:text-cyan-800 dark:text-slate-100"
        >
          {t("rights")}
        </Link>
        <nav
          aria-label={t("links")}
          className="flex items-center gap-1 sm:gap-3"
        >
          <FooterBandMenu label={t("product")} items={navItems} />
          <FooterBandMenu label={t("contact")} items={contactItems} />
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
      <SiteHeader deferUntilCover={vertical} />
      {children}
      {vertical ? <VerticalFooter /> : <HomeFooterBand />}
    </div>
  );
}

export { Eyebrow };

export function CTAGroup() {
  const t = useTranslations("common.cta");

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Link
        href="/contacto"
        className="bg-primary-light font-body dark:bg-primary-dark dark:hover:bg-primary-dark/85 min-h-10 rounded-full px-5 py-2 text-center text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 dark:text-[#04111e] dark:shadow-[0_0_34px_color-mix(in_srgb,var(--color-primary-dark)_26%,transparent)]"
      >
        {t("meeting")}
      </Link>
      <Link
        href="/plataforma"
        className="border-primary-light/25 font-body hover:border-primary-light/45 dark:border-primary-dark/30 dark:hover:border-primary-dark/50 dark:hover:bg-primary-dark/10 min-h-10 rounded-full border bg-white/65 px-5 py-2 text-center text-sm font-semibold text-cyan-800 backdrop-blur-sm transition hover:bg-cyan-50 dark:bg-white/3 dark:text-slate-100"
      >
        {t("tryPlatform")}
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
          className="dark:border-primary-dark/20 rounded-2xl border border-cyan-800/10 bg-white/75 p-6 shadow-sm backdrop-blur-sm dark:bg-white/3 dark:shadow-none"
        >
          <p className="dark:text-primary-dark text-3xl font-semibold text-cyan-800">
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

export function SignalPanel({ active = true }: { active?: boolean }) {
  return <ClinicalChatMock active={active} />;
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
          className="dark:border-primary-dark/10 rounded-md border border-cyan-800/10 bg-white/80 p-6 shadow-lg shadow-slate-900/5 dark:bg-[#081a2b]/82 dark:shadow-[#020817]/20"
        >
          <h3 className="font-display text-navy text-lg font-semibold dark:text-slate-50">
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
    compact?: boolean;
  }
>(function ThemeSection(
  { children, className = "", variant = "plain", compact = false },
  ref,
) {
  const variantClassName =
    variant === "panel"
      ? "relative overflow-hidden border-y border-cyan-800/10 bg-[linear-gradient(135deg,rgba(222,237,243,0.74),rgba(237,246,249,0.34))] dark:border-primary-dark/10 dark:bg-[linear-gradient(135deg,rgba(3,9,22,0.74),rgba(8,24,39,0.48))] lg:bg-[#e8f2f7] lg:dark:bg-[#081827]"
      : variant === "deep"
        ? "relative overflow-hidden border-y border-cyan-800/10 bg-[linear-gradient(135deg,rgba(222,237,243,0.82),rgba(237,246,249,0.42))] dark:border-primary-dark/10 dark:bg-[linear-gradient(135deg,rgba(3,9,22,0.82),rgba(3,9,22,0.54))] lg:bg-[#deedf3] lg:dark:bg-[#030916]"
        : variant === "transparent"
          ? "relative overflow-hidden bg-transparent"
          : "relative overflow-hidden bg-linear-to-br from-[#deedf3]/80 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30 lg:bg-[#f4f9fc] lg:dark:bg-[#06111f]";

  return (
    <section
      ref={ref}
      className={`${variantClassName} ${className} ${compact ? "py-14 sm:py-18" : "py-20"}`}
    >
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
    <section className="dark:border-primary-dark/10 relative overflow-hidden border-b border-cyan-800/10 bg-[#fbfdff] dark:bg-[#06111f]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_35%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,color-mix(in_srgb,var(--color-primary-dark)_10%,transparent),transparent_35%,color-mix(in_srgb,var(--color-primary-dark)_8%,transparent)_72%,transparent)]" />
      <HomeGrid />
      <SignalField intensity="hero" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 lg:py-24">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="font-display text-navy mt-5 max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-slate-50">
          {title}
        </h1>
        <p className="font-body mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
          {body}
        </p>
      </div>
    </section>
  );
}

"use client";

import {
  Bookmark,
  Moon,
  Sun,
  Check,
  FileText,
  Image as ImageIcon,
  Minus,
  Plus,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  Workflow,
  X,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

/*
 * Pieces of the real platform UI, copied from the chat and the UI package
 * (response-rating, save-project-answer, dialog, button, citation-viewer tabs,
 * media-zoom-controls) for the scenes that show the platform itself. Sizes
 * follow the scene scale; colours, borders, states and texts follow the code.
 */

/** Button of the UI package: «default» (filled) or «ghost». */
export function PlatformButton({
  children,
  variant = "default",
  pressed = 0,
  disabled = false,
  className = "",
  buttonRef,
}: {
  children: ReactNode;
  variant?: "default" | "ghost" | "outline";
  pressed?: number;
  disabled?: boolean;
  className?: string;
  buttonRef?: (element: HTMLElement | null) => void;
}) {
  return (
    <span
      ref={buttonRef}
      className={`font-body inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap ${variant === "default" ? "bg-primary-light dark:bg-primary-dark shadow-big-blocks text-white dark:text-[#06111f]" : variant === "outline" ? "border-primary-light/25 text-primary-light border bg-white/65 dark:border-cyan-300/30 dark:bg-white/[0.03] dark:text-cyan-50" : "text-slate-600 dark:text-slate-300"} ${disabled ? "opacity-50" : ""} ${className}`}
      style={{ transform: `scale(${1 - pressed * 0.06})` }}
    >
      {children}
    </span>
  );
}

/** Field of the UI package (input/textarea): rounded-sm, pale border. */
export function PlatformField({
  children,
  focused = false,
  multiline = false,
}: {
  children: ReactNode;
  focused?: boolean;
  multiline?: boolean;
}) {
  return (
    <div
      className={`font-body rounded-sm border px-3 text-xs leading-[18px] text-slate-900 dark:text-slate-100 ${multiline ? "min-h-[64px] py-2" : "flex h-8 items-center"} ${focused ? "border-primary-light/55 ring-primary-light/20 dark:border-primary-dark/55 bg-white ring-2 dark:bg-[#152230]" : "dark:border-primary-dark/15 border-cyan-800/15 bg-white/60 dark:bg-[#06111f]/70"}`}
    >
      {children}
    </div>
  );
}

/**
 * Dialog of the UI package, inside the scene: dimmed, blurred overlay and a
 * centred card with a close button, title, description, body and footer.
 */
export function PlatformDialog({
  open,
  title,
  description,
  children,
  footer,
}: {
  /** 0 to 1. */
  open: number;
  title: string;
  description?: string;
  children?: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div
      className="absolute inset-0 z-30"
      style={{ opacity: open, visibility: open > 0 ? "visible" : "hidden" }}
    >
      <div className="absolute inset-0 bg-[#06111f]/45 backdrop-blur-sm" />
      <div
        className="dark:border-primary-dark/20 shadow-big-blocks absolute top-1/2 left-1/2 grid w-[calc(100%-40px)] gap-3 rounded-3xl border border-cyan-800/20 bg-white/90 p-4 backdrop-blur-xs dark:bg-[#152230]/90"
        style={{
          transform: `translate(-50%, calc(-50% + ${8 * (1 - open)}px))`,
        }}
      >
        <span className="absolute top-3 right-3 rounded-full p-1 text-slate-600 dark:text-slate-300">
          <X size={14} strokeWidth={1.8} />
        </span>
        <div className="grid gap-1 pr-6">
          <p className="font-display text-navy text-[15px] leading-tight font-semibold dark:text-slate-50">
            {title}
          </p>
          {description && (
            <p className="font-body text-xs leading-[18px] text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        {children}
        <div className="flex justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

/**
 * Actions under a final answer (message-list): the saved notice, «útil / no
 * útil» and, inside a project, «Guardar en fuentes». Right-aligned.
 */
export function ResponseActions({
  rating,
  notice,
  negativeRef,
  save,
}: {
  rating?: "positive" | "negative";
  notice?: string;
  negativeRef?: (element: HTMLElement | null) => void;
  save?: {
    saved: boolean;
    pressed?: number;
    buttonRef?: (element: HTMLElement | null) => void;
  };
}) {
  const thumb =
    "grid size-8 place-items-center rounded-full text-slate-500 dark:text-slate-400";
  return (
    <div className="flex items-center justify-end gap-1">
      {notice && (
        <span className="font-body mr-2 text-[11px] text-slate-500 dark:text-slate-400">
          {notice}
        </span>
      )}
      <span
        className={`${thumb} ${rating === "positive" ? "bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark" : ""}`}
      >
        <ThumbsUp size={14} strokeWidth={1.8} />
      </span>
      <span
        ref={negativeRef}
        className={`${thumb} ${rating === "negative" ? "bg-rose-700/10 text-rose-700 dark:bg-rose-300/14 dark:text-rose-300" : ""}`}
      >
        <ThumbsDown size={14} strokeWidth={1.8} />
      </span>
      {save && (
        <span
          ref={save.buttonRef}
          className={`font-body ml-1 inline-flex h-8 items-center gap-1.5 rounded-full px-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 ${save.saved ? "opacity-50" : ""}`}
          style={{ transform: `scale(${1 - (save.pressed ?? 0) * 0.06})` }}
        >
          {save.saved ? (
            <Check size={14} strokeWidth={1.8} />
          ) : (
            <Bookmark size={14} strokeWidth={1.8} />
          )}
          {save.saved ? "Guardada en fuentes" : "Guardar en fuentes"}
        </span>
      )}
    </div>
  );
}

/**
 * Colours of the tab strip and the curved feet of the active tab
 * (citation-source-tabs), as utilities: the strip sets the border and surface
 * colours; the active tab draws its feet with radial gradients.
 */
const tabColors =
  "[--tab-border:color-mix(in_oklab,var(--color-cyan-800)_10%,#fff)] [--tab-surface:#fff] dark:[--tab-border:color-mix(in_oklab,var(--color-cyan-300)_20%,#152230)] dark:[--tab-surface:#152230]";
const tabCorners =
  "border-(--tab-border) before:pointer-events-none before:absolute before:bottom-0 before:-left-2 before:size-2 before:bg-[radial-gradient(circle_at_top_left,transparent_7px,var(--tab-border)_7px,var(--tab-border)_8px,var(--tab-surface)_8px)] before:content-[''] after:pointer-events-none after:absolute after:-right-2 after:bottom-0 after:size-2 after:bg-[radial-gradient(circle_at_top_right,transparent_7px,var(--tab-border)_7px,var(--tab-border)_8px,var(--tab-surface)_8px)] after:content-['']";

/** Tab of the side panel (citation-viewer), with its kind icon and close. */
export type PlatformTab = {
  kind: "document" | "diagram" | "image";
  title: string;
};
const tabIcons = { document: FileText, diagram: Workflow, image: ImageIcon };

export function PlatformTabs({
  tabs,
  active,
  tabRef,
  tabStyle,
}: {
  tabs: PlatformTab[];
  active: number;
  tabRef?: (index: number) => (element: HTMLElement | null) => void;
  tabStyle?: (index: number) => CSSProperties;
}) {
  return (
    <div
      className={`${tabColors} dark:border-primary-dark/15 flex h-11 shrink-0 items-end border-b border-cyan-800/10 bg-[#e8f2f7]/30 dark:bg-[#06111f]/45`}
    >
      <div className="flex h-10 min-w-0 flex-1 items-start gap-1 pt-0 pr-1 pl-2">
        {tabs.map((tab, index) => {
          const current = index === active;
          const Icon = tabIcons[tab.kind];
          return (
            <div
              key={tab.title}
              ref={tabRef?.(index)}
              style={tabStyle?.(index)}
              className={`relative flex max-w-56 min-w-0 flex-[1_1_14rem] items-center border ${current ? `${tabCorners} text-navy z-10 -mb-px h-10 rounded-t-md border-b-0 bg-white shadow-[0_-4px_14px_rgb(0_109_121/4%)] dark:bg-[#152230] dark:text-slate-50` : "mt-0.5 h-9 rounded-md border-transparent text-slate-600 dark:text-slate-400"}`}
            >
              <span
                className={`flex min-w-0 flex-1 items-center gap-1.5 pr-7 pl-2.5 ${current ? "-mt-1" : ""}`}
              >
                <Icon size={14} strokeWidth={1.8} className="shrink-0" />
                <span className="font-body min-w-0 flex-1 truncate text-[11px] font-semibold">
                  {tab.title}
                </span>
              </span>
              <span
                className={`absolute right-1 grid size-6 place-items-center rounded-full text-slate-500 ${current ? "-mt-1" : ""}`}
              >
                <X size={14} strokeWidth={1.8} />
              </span>
            </div>
          );
        })}
      </div>
      <span className="mr-2 mb-1.5 grid size-8 shrink-0 place-items-center rounded-full text-slate-600 dark:text-slate-300">
        <X size={16} strokeWidth={1.8} />
      </span>
    </div>
  );
}

/** Zoom header of the image and scheme panels (media-zoom-controls). */
export function ZoomControls({ children }: { children?: ReactNode }) {
  return (
    <header className="dark:border-primary-dark/15 flex shrink-0 items-center justify-between gap-2 border-b border-cyan-800/15 p-2.5">
      <div className="flex items-center gap-1.5">
        <span className={zoomControl}>
          <Minus size={14} strokeWidth={1.8} />
        </span>
        <span className="font-body min-w-9 text-center text-[11px] text-slate-700 tabular-nums dark:text-slate-200">
          100%
        </span>
        <span className={zoomControl}>
          <Plus size={14} strokeWidth={1.8} />
        </span>
        <span className={`${zoomControl} px-2.5`}>
          <RotateCcw size={14} strokeWidth={1.8} />
          Restablecer
        </span>
      </div>
      {children}
    </header>
  );
}
export const zoomControl =
  "font-body dark:border-primary-dark/20 text-primary-light dark:text-primary-dark inline-flex h-8 min-w-8 items-center justify-center gap-1.5 rounded-full border border-cyan-800/20 text-[11px]";

/** Section of the profile panel (profile-menu): bordered box, teal title. */
export function ProfileSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <section className="dark:border-primary-dark/10 space-y-2 rounded-md border border-cyan-800/10 bg-white/45 p-2.5 dark:bg-white/[0.03]">
      {title && (
        <p className="font-display text-primary-light dark:text-primary-dark text-[9px] font-bold tracking-[0.18em] uppercase">
          {title}
        </p>
      )}
      {children}
    </section>
  );
}

/** «Perfil y configuración» panel, as the popover over the chat. */
export function ProfilePanel({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`dark:border-primary-dark/15 rounded-md border border-cyan-800/15 bg-[#f7fbfd] p-2 dark:bg-[#0b1a29] ${className}`}
      style={style}
    >
      <div className="dark:border-primary-dark/10 mb-2 flex h-8 items-center justify-between border-b border-cyan-800/10 pr-1 pl-1">
        <p className="font-display text-primary-light dark:text-primary-dark text-[9px] font-bold tracking-[0.18em] uppercase">
          Perfil y configuración
        </p>
        <X
          size={14}
          strokeWidth={1.8}
          className="text-slate-600 dark:text-slate-300"
        />
      </div>
      <div className="grid gap-2">{children}</div>
    </div>
  );
}

/** User row of the profile panel, with the theme toggle (theme-toggle). */
export function ProfileUser({
  dark = false,
  toggleRef,
  pressed = 0,
}: {
  dark?: boolean;
  toggleRef?: (element: HTMLElement | null) => void;
  pressed?: number;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-display bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark dark:border-primary-dark/15 grid size-8 shrink-0 place-items-center rounded-full border border-cyan-800/15 text-[11px] font-semibold">
        LG
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-body text-navy truncate text-xs font-semibold dark:text-slate-50">
          Laura Gómez
        </p>
        <p className="font-body truncate text-[10px] text-slate-500 dark:text-slate-400">
          Nefrología
        </p>
      </div>
      <span
        ref={toggleRef}
        className="border-primary-light/20 dark:bg-primary-dark/[0.08] grid size-8 shrink-0 place-items-center rounded-full border bg-white/40 text-slate-700 dark:border-cyan-300/20 dark:text-[#7fd3dc]"
        style={{ transform: `scale(${1 - pressed * 0.08})` }}
      >
        {dark ? (
          <Sun size={14} strokeWidth={1.8} />
        ) : (
          <Moon size={14} strokeWidth={1.8} />
        )}
      </span>
    </div>
  );
}

/** Language switch of the UI package (locale-switcher). */
export function LocaleSwitcher({
  active,
  localeRef,
}: {
  active: number;
  localeRef?: (index: number) => (element: HTMLElement | null) => void;
}) {
  return (
    <span className="border-primary-light/20 dark:bg-primary-dark/[0.08] inline-flex items-center gap-0.5 rounded-full border bg-white/40 p-0.5 dark:border-cyan-300/20">
      {["es", "ca", "en"].map((locale, index) => (
        <span
          key={locale}
          ref={localeRef?.(index)}
          className={`font-body min-w-7 rounded-full px-1.5 py-0.5 text-center text-[10px] font-semibold tracking-wide uppercase ${index === active ? "bg-primary-light dark:bg-primary-dark text-white shadow-[0_1px_3px_rgb(0_109_121/18%)] dark:text-[#06111f]" : "text-slate-600 dark:text-slate-300"}`}
        >
          {locale}
        </span>
      ))}
    </span>
  );
}

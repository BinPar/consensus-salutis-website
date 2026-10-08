import Image from "next/image";
import type { Ref } from "react";
import type { LucideIcon } from "lucide-react";

export const processMotion = {
  draw: 0.5,
  appearance: 0.15,
  readingPulse: 0.9,
  thinkingPulse: 1,
  tint: 0.15,
  groupGap: 1.05,
  dotGap: 0.125,
  transit: 0.55,
} as const;

export const processCardClass =
  "rounded-2xl border bg-white/95 shadow-[0_8px_24px_rgba(0,109,121,0.05)] dark:bg-[#152230]/95";

export function ProcessChatVeil({ opacity = 1 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-white mask-[linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] dark:bg-[#06111f]"
      style={{ opacity }}
    />
  );
}

export function processBorderClass(active = false) {
  return active
    ? "border-primary-light/35 dark:border-primary-dark/40"
    : "border-cyan-800/15 dark:border-cyan-300/15";
}

export function Mark({ className = "size-10" }: { className?: string }) {
  return (
    <span className={`inline-block shrink-0 ${className}`}>
      <Image
        src="/logos/binpar-brand/binpar-isotipo-light.svg"
        alt=""
        width={64}
        height={64}
        className="size-full object-contain dark:hidden"
      />
      <Image
        src="/logos/binpar-brand/binpar-isotipo-dark.svg"
        alt=""
        width={64}
        height={64}
        className="hidden size-full object-contain dark:block"
      />
    </span>
  );
}

export function ProcessIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <Icon
      size={20}
      strokeWidth={1.1}
      className={`shrink-0 ${className ?? ""}`}
      aria-hidden="true"
    />
  );
}

export function PulseLayer({ value }: { value: number }) {
  return (
    <span
      className="bg-primary-light dark:bg-primary-dark pointer-events-none absolute inset-0 rounded-[inherit]"
      style={{ opacity: value * processMotion.tint }}
    />
  );
}

export function ProcessCoordinator({
  nodeRef,
  status,
  pulse = 0,
  active = false,
  kind,
}: {
  nodeRef?: Ref<HTMLDivElement>;
  status: string;
  pulse?: number;
  active?: boolean;
  kind: "committee" | "synthesis";
}) {
  return (
    <div
      ref={nodeRef}
      data-synthesis-core={kind === "synthesis" ? "" : undefined}
      data-committee-core={kind === "committee" ? "" : undefined}
      className={`${processBorderClass(active)} relative z-20 mx-auto flex h-14 w-[200px] max-w-full items-center gap-2 rounded-2xl border bg-white/95 px-4 py-3 shadow-[0_8px_24px_rgba(0,109,121,0.10)] @min-[480px]:h-[66px] @min-[480px]:w-[236px] @min-[480px]:gap-3 dark:bg-[#152230]`}
    >
      <PulseLayer value={pulse} />
      <Mark className="relative size-5 shrink-0 @min-[480px]:size-8" />
      <div className="relative min-w-0">
        <p className="font-display text-[10px] font-semibold whitespace-nowrap text-[#05215e] @min-[480px]:text-sm dark:text-slate-50">
          Orquestador
        </p>
        <p className="font-body text-[10px] leading-4 whitespace-nowrap text-slate-500 @min-[480px]:text-xs @min-[480px]:leading-5 dark:text-slate-400">
          {status}
        </p>
      </div>
    </div>
  );
}

export function SceneLabel({
  text,
  secondary = "Consulta real",
}: {
  text: string;
  secondary?: string;
}) {
  return (
    <div className="font-display absolute inset-x-6 top-6 flex items-center justify-between gap-3 text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400">
      <span>{text}</span>
      <span className="text-primary-light dark:text-primary-dark">
        {secondary}
      </span>
    </div>
  );
}

export function FlowDot({ x, y }: { x: number; y: number }) {
  return (
    <g data-flow-dot="">
      <circle
        cx={x}
        cy={y}
        r="4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />
      <circle cx={x} cy={y} r="2.2" fill="currentColor" />
    </g>
  );
}

export function drawProgress(
  seconds: number,
  start: number,
  duration: number,
  reduced: boolean,
) {
  if (reduced) return 1;
  const t = Math.max(0, Math.min(1, (seconds - start) / duration));
  return 1 - (1 - t) ** 3;
}

export function sceneReveal(
  seconds: number,
  start: number,
  duration: number,
  reduced: boolean,
) {
  if (reduced) return 1;
  const t = Math.max(0, Math.min(1, (seconds - start) / duration));
  return t * t * (3 - 2 * t);
}

export function pulseProgress(
  seconds: number,
  start: number,
  duration: number,
) {
  return (1 - Math.cos(((seconds - start) / duration) * Math.PI * 2)) / 2;
}

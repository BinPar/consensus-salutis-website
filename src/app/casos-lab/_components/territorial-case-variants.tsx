"use client";
import type { CaseDirection } from "./case-directions";

import { MapPin, Plus, Minus } from "lucide-react";
import {
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { InstitutionalLogo } from "~/app/_components/success-cases/success-cases-brand";
import { caseRegions } from "~/app/_components/success-cases/success-cases-geography";
import {
  groupMappedCases,
  regionViewBox,
} from "~/app/_components/success-cases/success-cases-layout";
import {
  casesIntro,
  type InstitutionalCase,
} from "~/app/_components/success-cases/success-cases-data";

const eyebrow =
  "font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase";
const heading =
  "font-display text-4xl font-extrabold tracking-tight text-[#05215e] sm:text-5xl lg:text-6xl dark:text-slate-50";
const prose = "font-body text-lg leading-8 text-slate-600 dark:text-slate-400";
const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark";
const count = (value: number) => String(value).padStart(2, "0");
type VariantProps = { cases: readonly InstitutionalCase[] };
type Selection = ReturnType<typeof useTerritorialSelection>;
type MapKind = "trace" | "contrast" | "identity" | "cards";
const definitiveDrawDuration = 1.9;
const definitiveMapHeight = 440;
const definitiveCanariasTransform =
  "translate(12 350) scale(0.75) translate(-18 -414)";
const definitiveRegionStagger = 0.02;
const definitiveMapEnd =
  definitiveDrawDuration + (caseRegions.length - 1) * definitiveRegionStagger;
const calloutDuration = 0.4;
const calloutStart = (index: number) => definitiveMapEnd + index * 0.12;

type CalloutAnchor = { x: number; y: number };
type CalloutBounds = CalloutAnchor & { width: number; height: number };
type CalloutPush = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  held: boolean;
  velocityX: number;
  velocityY: number;
};
type FloatingCallouts = {
  elapsed: MotionValue<number>;
  scale: number;
  reduced: boolean;
  anchors: Record<string, CalloutBounds>;
  pushes: Record<string, CalloutPush>;
  enabled: boolean;
  repel: (dt: number) => void;
};

function calloutDrift(time: number, index: number, reduced: boolean) {
  const start = calloutStart(index) + calloutDuration + 0.3;
  if (reduced || time <= start) return { x: 0, y: 0 };
  const t = time - start;
  // Independent frequencies trace a changing two-dimensional drift rather
  // than repeatedly travelling up and down along the same line.
  const envelope = (1 - Math.cos(Math.PI * Math.min(t / 2, 1))) / 2;
  const horizontal = (t * Math.PI * 2) / (14 + index * 3);
  const vertical = (t * Math.PI * 2) / (10 + index * 3);
  const direction = index % 2 === 0 ? 1 : -1;
  return {
    x:
      (envelope *
        direction *
        9 *
        (Math.sin(horizontal + index * 0.7) +
          0.18 * Math.sin(horizontal * 1.7))) /
      1.18,
    y:
      (envelope *
        7 *
        (Math.sin(vertical + Math.PI / 3 + index * 0.5) +
          0.12 * Math.sin(vertical * 1.4))) /
      1.12,
  };
}

type CalloutTether = {
  origin: CalloutAnchor;
  maximum: number;
  softLimit: number;
  frame: { minX: number; maxX: number; minY: number; maxY: number };
};

function calloutTether(
  point: CalloutAnchor,
  anchor: CalloutAnchor & Partial<Pick<CalloutBounds, "width" | "height">>,
  scale: number,
): CalloutTether {
  const origin = {
    x: (anchor.x - point.x) * scale,
    y: (anchor.y - point.y) * scale,
  };
  const restLength = Math.hypot(origin.x, origin.y);
  return {
    origin,
    maximum: restLength + 68 * scale,
    softLimit: restLength + 44 * scale,
    // A little overflow keeps the composition loose without losing the cards.
    frame: {
      minX: ((anchor.width ?? 144) - 24 - anchor.x) * scale,
      maxX: (600 + 24 - anchor.x) * scale,
      minY: ((anchor.height ?? 56) / 2 - 18 - anchor.y) * scale,
      maxY:
        (definitiveMapHeight + 18 - (anchor.height ?? 56) / 2 - anchor.y) *
        scale,
    },
  };
}

// Limit the tether from the region marker, allowing free movement around it.
function limitCalloutOffset(
  offset: CalloutAnchor,
  tether: CalloutTether,
  elastic = false,
) {
  const vector = {
    x: tether.origin.x + offset.x,
    y: tether.origin.y + offset.y,
  };
  const distance = Math.hypot(vector.x, vector.y);
  const { maximum, softLimit } = tether;
  const reach =
    elastic && distance > softLimit
      ? softLimit +
        (maximum - softLimit) *
          (1 - Math.exp(-(distance - softLimit) / (maximum - softLimit)))
      : Math.min(distance, maximum);
  const ratio = distance > 0 ? reach / distance : 1;
  return {
    x: Math.max(
      tether.frame.minX,
      Math.min(tether.frame.maxX, vector.x * ratio - tether.origin.x),
    ),
    y: Math.max(
      tether.frame.minY,
      Math.min(tether.frame.maxY, vector.y * ratio - tether.origin.y),
    ),
  };
}

function repelCallouts(
  groups: readonly { region: string; point: CalloutAnchor }[],
  floating: Omit<FloatingCallouts, "repel">,
  dt: number,
) {
  const bodies = groups.flatMap((group, index) => {
    const anchor = floating.anchors[group.region];
    if (!anchor) return [];
    const push = floating.pushes[group.region]!;
    const travel = {
      x: push.x.getVelocity() / floating.scale,
      y: push.y.getVelocity() / floating.scale,
    };
    const tether = calloutTether(group.point, anchor, floating.scale);
    const drift = calloutDrift(floating.elapsed.get(), index, floating.reduced);
    const offset = () =>
      limitCalloutOffset(
        { x: push.x.get() + drift.x, y: push.y.get() + drift.y },
        tether,
      );
    const move = (dx: number, dy: number) => {
      const current = offset();
      const next = limitCalloutOffset(
        {
          x: current.x + dx * floating.scale,
          y: current.y + dy * floating.scale,
        },
        tether,
      );
      push.x.set(next.x - drift.x);
      push.y.set(next.y - drift.y);
    };
    if (!push.held && dt > 0) {
      const damping = Math.exp(-4.5 * dt);
      push.velocityX *= damping;
      push.velocityY *= damping;
      if (Math.hypot(push.velocityX, push.velocityY) > 0.05) {
        const current = offset();
        const attemptedX = current.x + push.velocityX * dt * floating.scale;
        const attemptedY = current.y + push.velocityY * dt * floating.scale;
        move(push.velocityX * dt, push.velocityY * dt);
        // Reflect only the impact axis, preserving the sideways momentum.
        if (attemptedX < tether.frame.minX || attemptedX > tether.frame.maxX)
          push.velocityX *= -0.45;
        if (attemptedY < tether.frame.minY || attemptedY > tether.frame.maxY)
          push.velocityY *= -0.45;
      }
    }
    return [{ anchor, push, offset, move, travel, tether }];
  });
  // Cached dimensions and MotionValues avoid layout reads or React renders per frame.
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i]!;
        const b = bodies[j]!;
        const ao = a.offset(),
          bo = b.offset();
        const dx =
          b.anchor.x -
          b.anchor.width / 2 +
          bo.x / floating.scale -
          (a.anchor.x - a.anchor.width / 2 + ao.x / floating.scale);
        const dy =
          b.anchor.y +
          bo.y / floating.scale -
          (a.anchor.y + ao.y / floating.scale);
        const halfWidth = (a.anchor.width + b.anchor.width) / 2;
        const halfHeight = (a.anchor.height + b.anchor.height) / 2;
        const overlapX = halfWidth + 8 - Math.abs(dx);
        const overlapY = halfHeight + 8 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0 || (a.push.held && b.push.held))
          continue;
        let horizontal = overlapX < overlapY;
        const room = (alongX: boolean) => {
          const amount = alongX ? overlapX : overlapY;
          const direction = (alongX ? dx : dy) >= 0 ? 1 : -1;
          const capacity = (body: typeof a, sign: number, share: number) => {
            if (body.push.held) return 0;
            const current = body.offset();
            const next = limitCalloutOffset(
              {
                x:
                  current.x +
                  (alongX ? amount * sign * share * floating.scale : 0),
                y:
                  current.y +
                  (alongX ? 0 : amount * sign * share * floating.scale),
              },
              body.tether,
            );
            return (
              ((alongX ? next.x - current.x : next.y - current.y) * sign) /
              floating.scale
            );
          };
          return (
            (capacity(a, -direction, b.push.held ? 1 : 0.5) +
              capacity(b, direction, a.push.held ? 1 : 0.5)) /
            amount
          );
        };
        // Near the frame, separate along the axis that still has room.
        const available = room(horizontal);
        if (available < 0.99 && room(!horizontal) > available + 0.01)
          horizontal = !horizontal;
        const overlap = horizontal ? overlapX : overlapY;
        const contact = Math.abs(dx) < halfWidth && Math.abs(dy) < halfHeight;
        const distance = overlap * (contact ? 1 : Math.min(1, dt * 12));
        if (distance <= 0) continue;
        const sign = (horizontal ? dx : dy) >= 0 ? 1 : -1;
        const moveBody = (
          body: typeof a,
          source: typeof a,
          direction: number,
          share: number,
        ) => {
          if (body.push.held) return;
          const displacement = distance * direction * share;
          body.move(
            horizontal ? displacement : 0,
            horizontal ? 0 : displacement,
          );
          if (!floating.reduced) {
            // Accumulate the repulsion impulse and carry some sideways motion
            // from the moving card, then let friction slow both axes together.
            const transfer = Math.min(0.1, Math.max(dt, 1 / 60) * 2) * share;
            const clamp = (velocity: number) =>
              Math.max(-90, Math.min(90, velocity));
            body.push.velocityX = clamp(
              body.push.velocityX +
                (horizontal ? displacement * 3 : source.travel.x * transfer),
            );
            body.push.velocityY = clamp(
              body.push.velocityY +
                (horizontal ? source.travel.y * transfer : displacement * 3),
            );
          }
        };
        moveBody(a, b, -sign, b.push.held ? 1 : 0.5);
        moveBody(b, a, sign, a.push.held ? 1 : 0.5);
      }
    }
  }
}

function useCalloutOffset(
  elapsed: MotionValue<number>,
  index: number,
  reduced: boolean,
  push: CalloutPush,
  tether: CalloutTether,
) {
  return useTransform(() => {
    const drift = calloutDrift(elapsed.get(), index, reduced);
    return limitCalloutOffset(
      { x: drift.x + push.x.get(), y: drift.y + push.y.get() },
      tether,
    );
  });
}

function FloatingConnection({
  point,
  region,
  index,
  floating,
}: {
  point: { x: number; y: number };
  region: string;
  index: number;
  floating: FloatingCallouts;
}) {
  const right = point.x > 340;
  const anchor =
    floating.anchors[region] ??
    (right ? { x: 372, y: 38 } : { x: 132, y: 240 });
  const tether = calloutTether(point, anchor, floating.scale);
  const offset = useCalloutOffset(
    floating.elapsed,
    index,
    floating.reduced,
    floating.pushes[region]!,
    tether,
  );
  const d = useTransform(offset, (pixels) => {
    const endX = anchor.x + pixels.x / floating.scale;
    const endY = anchor.y + pixels.y / floating.scale;
    const catalunyaElbowX =
      endX + Math.min(42, Math.max(0, (point.x - endX) * 0.45));
    return right
      ? `M${point.x} ${point.y} L${catalunyaElbowX} ${endY} H${endX}`
      : `M${point.x} ${point.y} L${174 + pixels.x / (2 * floating.scale)} ${endY} H${endX}`;
  });
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeOpacity=".55"
      strokeWidth=".9"
      className="territory-draw territory-card-link"
      pathLength={1}
      style={{ animationDelay: `${calloutStart(index)}s` }}
    />
  );
}

function FloatingCaseCard({
  index,
  region,
  point,
  floating,
  onMeasure,
  children,
  ...props
}: {
  index: number;
  region: string;
  point: CalloutAnchor;
  floating: FloatingCallouts;
  onMeasure: (region: string, anchor: CalloutBounds) => void;
  children: ReactNode;
  className: string;
  style: CSSProperties;
  onClick: () => void;
  "aria-pressed": boolean;
  "aria-label": string;
  "data-map-case-card": string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const right = props.style.right !== undefined;
  const anchor =
    floating.anchors[region] ??
    (right ? { x: 372, y: 38 } : { x: 132, y: 240 });
  const tether = calloutTether(point, anchor, floating.scale);
  const offset = useCalloutOffset(
    floating.elapsed,
    index,
    floating.reduced,
    floating.pushes[region]!,
    tether,
  );
  const x = useTransform(offset, (value) => value.x);
  const y = useTransform(offset, (value) => value.y);
  const push = floating.pushes[region]!;
  const didDrag = useRef(false);
  const stopMomentum = useCallback(() => {
    push.velocityX = 0;
    push.velocityY = 0;
  }, [push]);
  useEffect(() => {
    return () => {
      push.held = false;
      stopMomentum();
    };
  }, [push, stopMomentum]);
  useEffect(() => {
    if (!floating.enabled || floating.reduced) stopMomentum();
    return stopMomentum;
  }, [floating.enabled, floating.reduced, stopMomentum]);
  const drag = useRef<{
    pointerId: number;
    clientX: number;
    clientY: number;
    elasticOriginX: number;
    elasticOriginY: number;
    lastTime: number;
    lastClientX: number;
    lastClientY: number;
    velocityX: number;
    velocityY: number;
  } | null>(null);
  const finishDrag = (continueMotion = false) => {
    const start = drag.current;
    drag.current = null;
    push.held = false;
    if (!start) return;
    if (ref.current?.hasPointerCapture(start.pointerId))
      ref.current.releasePointerCapture(start.pointerId);
    if (
      !continueMotion ||
      !didDrag.current ||
      floating.reduced ||
      !floating.enabled
    )
      return;
    const age = performance.now() - start.lastTime;
    const decay = Math.exp(-age / 80);
    const clampVelocity = (value: number) =>
      Math.max(-600, Math.min(600, value * decay));
    const velocityX = clampVelocity(start.velocityX);
    const velocityY = clampVelocity(start.velocityY);
    if (Math.hypot(velocityX, velocityY) < 20) return;
    // Drag releases and card collisions share the same inertial simulation.
    push.velocityX = velocityX / floating.scale;
    push.velocityY = velocityY / floating.scale;
  };
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const measure = () =>
      onMeasure(region, {
        x: right ? 228 + card.offsetWidth / floating.scale : 132,
        y:
          (right ? 505 * 0.028 : 505 * 0.426) +
          card.offsetHeight / (2 * floating.scale),
        width: card.offsetWidth / floating.scale,
        height: card.offsetHeight / floating.scale,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(card);
    return () => observer.disconnect();
  }, [region, right, floating.scale, onMeasure]);
  return (
    <motion.button
      {...props}
      ref={ref}
      type="button"
      className={`${props.className} cursor-grab touch-none select-none active:cursor-grabbing`}
      onDragStartCapture={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        stopMomentum();
        push.held = true;
        push.velocityX = 0;
        push.velocityY = 0;
        const card = event.currentTarget;
        const current = offset.get();
        const vector = {
          x: tether.origin.x + current.x,
          y: tether.origin.y + current.y,
        };
        const distance = Math.hypot(vector.x, vector.y);
        const { softLimit } = tether;
        const elasticRange = tether.maximum - softLimit;
        // Invert resistance when regrabbing so the card never jumps inward.
        const rawDistance =
          distance > softLimit
            ? softLimit -
              elasticRange *
                Math.log(
                  Math.max(0.001, 1 - (distance - softLimit) / elasticRange),
                )
            : distance;
        const rawRatio = distance > 0 ? rawDistance / distance : 1;
        didDrag.current = false;
        drag.current = {
          pointerId: event.pointerId,
          clientX: event.clientX,
          clientY: event.clientY,
          elasticOriginX: vector.x * rawRatio - tether.origin.x,
          elasticOriginY: vector.y * rawRatio - tether.origin.y,
          lastTime: performance.now(),
          lastClientX: event.clientX,
          lastClientY: event.clientY,
          velocityX: 0,
          velocityY: 0,
        };
        if (event.nativeEvent.isTrusted)
          card.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (start?.pointerId !== event.pointerId) return;
        const dx = event.clientX - start.clientX;
        const dy = event.clientY - start.clientY;
        if (!didDrag.current && Math.hypot(dx, dy) < 4) return;
        didDrag.current = true;
        const now = performance.now();
        const next = limitCalloutOffset(
          {
            x: start.elasticOriginX + dx,
            y: start.elasticOriginY + dy,
          },
          tether,
          true,
        );
        const previous = offset.get();
        const dt = Math.max(now - start.lastTime, 1);
        const weight = 1 - Math.exp(-dt / 40);
        const pointerDX = event.clientX - start.lastClientX;
        const pointerDY = event.clientY - start.lastClientY;
        const atHorizontalEdge =
          (next.x <= tether.frame.minX + 0.5 && pointerDX < 0) ||
          (next.x >= tether.frame.maxX - 0.5 && pointerDX > 0);
        const atVerticalEdge =
          (next.y <= tether.frame.minY + 0.5 && pointerDY < 0) ||
          (next.y >= tether.frame.maxY - 0.5 && pointerDY > 0);
        start.velocityX +=
          (((atHorizontalEdge ? pointerDX : next.x - previous.x) * 1000) / dt -
            start.velocityX) *
          weight;
        start.velocityY +=
          (((atVerticalEdge ? pointerDY : next.y - previous.y) * 1000) / dt -
            start.velocityY) *
          weight;
        start.lastTime = now;
        start.lastClientX = event.clientX;
        start.lastClientY = event.clientY;
        const drift = calloutDrift(
          floating.elapsed.get(),
          index,
          floating.reduced,
        );
        // The tether resists near its limit; drift and inertia share that limit.
        push.x.set(next.x - drift.x);
        push.y.set(next.y - drift.y);
        floating.repel(0);
      }}
      onPointerUp={() => finishDrag(true)}
      onPointerCancel={() => finishDrag()}
      onLostPointerCapture={() => finishDrag()}
      onClick={(event) => {
        if (didDrag.current && event.detail !== 0) {
          didDrag.current = false;
          event.preventDefault();
          return;
        }
        props.onClick();
      }}
      style={{ ...props.style, x, y }}
    >
      {children}
    </motion.button>
  );
}

function useTerritorialSelection(cases: readonly InstitutionalCase[]) {
  const [selectedId, setSelectedId] = useState(cases[0]?.id);
  const [expanded, setExpanded] = useState(false);
  const active = cases.find((item) => item.id === selectedId) ?? cases[0];
  return {
    active,
    select: setSelectedId,
    expanded,
    setExpanded,
    visible: expanded ? cases : cases.slice(0, 4),
    remaining: Math.max(0, cases.length - 4),
  };
}

function ExpandCases({ selection }: { selection: Selection }) {
  if (!selection.remaining) return null;
  return (
    <button
      type="button"
      onClick={() => selection.setExpanded(!selection.expanded)}
      aria-expanded={selection.expanded}
      className={`${focus} font-display text-primary-light dark:text-primary-dark mt-5 inline-flex items-center gap-2 rounded-full border border-current/20 px-5 py-3 text-xs font-semibold`}
    >
      {selection.expanded ? (
        <Minus size={14} aria-hidden="true" />
      ) : (
        <Plus size={14} aria-hidden="true" />
      )}
      {selection.expanded
        ? "Mostrar menos"
        : `Ver todas las instituciones (+${selection.remaining})`}
    </button>
  );
}

function CaseSelectors({
  selection,
  mode = "rows",
}: {
  selection: Selection;
  mode?: "rows" | "cards";
}) {
  return (
    <div
      className={mode === "cards" ? "grid gap-4" : "space-y-3"}
      aria-label="Seleccionar institución"
    >
      {selection.visible.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selection.select(item.id)}
          aria-pressed={selection.active?.id === item.id}
          className={`${focus} group relative flex w-full min-w-0 items-center gap-4 rounded-2xl border p-5 text-left transition-colors ${selection.active?.id === item.id ? "border-primary-light/30 dark:border-primary-dark/35 bg-white shadow-[0_12px_40px_-18px_rgba(0,109,121,.25)] dark:bg-[#11303c]" : "hover:border-primary-light/25 dark:hover:border-primary-dark/25 border-cyan-800/10 bg-white/60 dark:border-cyan-300/10 dark:bg-[#0a1928]/70"}`}
        >
          <span className="font-display text-primary-light dark:text-primary-dark self-start text-[10px] font-semibold opacity-65">
            {count(index + 1)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-3">
            <InstitutionalLogo item={item} className="h-10 max-w-[230px]" />
            <span className="font-body text-xs leading-5 text-slate-500 dark:text-slate-400">
              {item.organization}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`h-2 w-2 shrink-0 rounded-full transition-colors ${selection.active?.id === item.id ? "bg-primary-light dark:bg-primary-dark" : "bg-slate-300 dark:bg-slate-600"}`}
          />
        </button>
      ))}
    </div>
  );
}

function Registration({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      {[
        "top-0 left-0 border-t border-l",
        "top-0 right-0 border-t border-r",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((position) => (
        <span
          key={position}
          className={`border-primary-light/25 dark:border-primary-dark/30 absolute h-5 w-5 ${position}`}
        />
      ))}
    </div>
  );
}

function RegionPortrait({
  item,
  className = "",
}: {
  item?: InstitutionalCase;
  className?: string;
}) {
  const region = caseRegions.find((entry) => entry.name === item?.region);
  return (
    <svg
      aria-hidden="true"
      viewBox={region ? regionViewBox(region.d, 0.25) : "0 0 300 300"}
      className={`text-primary-light dark:text-primary-dark ${className}`}
    >
      {region ? (
        <>
          {[9, 5].map((offset) => (
            <path
              key={offset}
              d={region.d}
              transform={`translate(${offset * 0.5} ${offset})`}
              fill="none"
              stroke="currentColor"
              strokeOpacity=".15"
              strokeWidth=".7"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path d={region.d} fill="currentColor" fillOpacity=".13" />
          <path
            key={item?.id}
            d={region.d}
            pathLength="1"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
            className="territory-draw"
          />
        </>
      ) : (
        <g fill="none" stroke="currentColor" strokeOpacity=".25">
          {[60, 90, 120].map((radius) => (
            <circle key={radius} cx="150" cy="150" r={radius} />
          ))}
          <path d="M20 150H280M150 20V280" />
        </g>
      )}
    </svg>
  );
}

function TerritorialMap({
  cases,
  active,
  kind = "trace",
  labels = true,
  floating,
}: {
  cases: readonly InstitutionalCase[];
  active?: InstitutionalCase;
  kind?: MapKind;
  labels?: boolean;
  floating?: FloatingCallouts;
}) {
  const id = useId();
  const groups = groupMappedCases(cases);
  const crisp = kind === "contrast";
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 600 ${kind === "cards" ? definitiveMapHeight : 505}`}
      className="text-primary-light dark:text-primary-dark h-full w-full overflow-visible"
      data-territorial-map={kind}
    >
      <defs>
        <linearGradient id={`${id}-land`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity={crisp ? 0.07 : 0.09} />
          <stop offset="1" stopColor="currentColor" stopOpacity=".015" />
        </linearGradient>
        <linearGradient id={`${id}-raised`} x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="currentColor" stopOpacity=".9" />
          <stop offset=".45" stopColor="currentColor" stopOpacity=".55" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".25" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop stopColor="currentColor" stopOpacity={crisp ? 0.04 : 0.12} />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        <pattern
          id={`${id}-grid`}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M30 0H0V30"
            fill="none"
            stroke="currentColor"
            strokeOpacity=".045"
            strokeWidth=".5"
          />
        </pattern>
      </defs>
      <rect
        x="-10"
        y="-15"
        width="620"
        height={kind === "cards" ? definitiveMapHeight + 25 : 530}
        fill={`url(#${id}-grid)`}
      />
      <ellipse cx="290" cy="255" rx="270" ry="215" fill={`url(#${id}-glow)`} />
      <g fill={`url(#${id}-land)`} strokeLinejoin="round">
        {caseRegions.map((region, index) => {
          const occupied = groups.some((group) => group.region === region.name);
          const selected = region.name === active?.region;
          return (
            <g
              key={region.name}
              className="territory-region"
              transform={
                kind === "cards" && region.name === "Canarias"
                  ? definitiveCanariasTransform
                  : undefined
              }
            >
              <path
                d={region.d}
                fill={occupied ? `url(#${id}-raised)` : undefined}
                fillOpacity={
                  occupied
                    ? selected
                      ? crisp
                        ? 0.8
                        : 1
                      : crisp
                        ? 0.48
                        : 0.38
                    : undefined
                }
                className={occupied ? "territory-wash" : undefined}
              />
              <path
                d={region.d}
                pathLength="1"
                fill="none"
                stroke="currentColor"
                strokeOpacity={
                  kind === "cards"
                    ? selected
                      ? 0.95
                      : occupied
                        ? 0.65
                        : 0.43
                    : selected
                      ? 0.9
                      : occupied
                        ? 0.55
                        : crisp
                          ? 0.38
                          : 0.23
                }
                strokeWidth={selected ? 1.3 : crisp ? 0.85 : 0.65}
                vectorEffect="non-scaling-stroke"
                className="territory-draw"
                style={{
                  animationDelay: `${index * (kind === "cards" ? definitiveRegionStagger : 0.055)}s`,
                }}
              />
            </g>
          );
        })}
      </g>
      {groups.map((group, index) => {
        const selected = group.region === active?.region;
        const point = {
          x: group.point.x,
          y: group.point.y,
        };
        const right = point.x > 340;
        const labelX = right
          ? Math.min(555, point.x + 60)
          : Math.max(65, point.x - 70);
        const labelY = point.y + (right ? -52 : 70);
        return (
          <g
            key={group.region}
            className="territory-marker"
            style={{ animationDelay: `${1.5 + index * 0.18}s` }}
            opacity={kind === "cards" || selected ? 1 : 0.55}
          >
            <circle cx={point.x} cy={point.y} r="4" fill="currentColor" />
            {Array.from({ length: kind === "cards" ? 4 : 1 }, (_, wave) => (
              <circle
                key={wave}
                cx={point.x}
                cy={point.y}
                r="12"
                fill="none"
                stroke="currentColor"
                strokeWidth=".8"
                vectorEffect="non-scaling-stroke"
                className="territory-pulse"
                style={{
                  transformOrigin: `${point.x}px ${point.y}px`,
                  animationDelay:
                    kind === "cards" ? `${-wave * 0.7}s` : undefined,
                }}
              />
            ))}
            {kind === "cards" && labels && floating && (
              <FloatingConnection
                point={point}
                region={group.region}
                index={index}
                floating={floating}
              />
            )}
            {labels && kind !== "cards" && (
              <>
                {kind === "identity" && group.cases[0] && (
                  <foreignObject
                    x={right ? labelX - 115 : labelX}
                    y={labelY - 44}
                    width="115"
                    height="30"
                  >
                    <InstitutionalLogo
                      item={group.cases[0]}
                      className="h-7 max-w-full"
                    />
                  </foreignObject>
                )}
                <path
                  d={`M${point.x} ${point.y} L${point.x + (right ? 22 : -22)} ${labelY} H${labelX}`}
                  pathLength="1"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity=".55"
                  strokeWidth=".8"
                  className="territory-draw"
                  style={{ animationDelay: `${1.5 + index * 0.18}s` }}
                />
                <text
                  x={labelX}
                  y={labelY - 10}
                  textAnchor={right ? "end" : "start"}
                  fill="currentColor"
                  fontSize="16"
                  fontWeight="700"
                  className="font-display"
                >
                  {kind === "identity" ? "" : group.cases[0]?.name}
                  {group.cases.length > 1 ? ` +${group.cases.length - 1}` : ""}
                </text>
                <text
                  x={labelX}
                  y={labelY + 15}
                  textAnchor={right ? "end" : "start"}
                  fill="currentColor"
                  fontSize="9"
                  opacity=".7"
                  className="font-body"
                >
                  {group.territory}
                </text>
              </>
            )}
            {group.cases.length > 1 && (
              <g>
                <circle
                  cx={point.x + 14}
                  cy={point.y - 14}
                  r="9"
                  fill="currentColor"
                />
                <text
                  x={point.x + 14}
                  y={point.y - 11}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="700"
                  className="fill-white dark:fill-[#03111d]"
                >
                  {group.cases.length}
                </text>
              </g>
            )}
          </g>
        );
      })}
      <g transform={kind === "cards" ? definitiveCanariasTransform : undefined}>
        <path
          d="M18 414H176V490H18Z"
          fill="none"
          stroke="currentColor"
          strokeOpacity=".16"
          strokeDasharray="3 5"
          strokeWidth=".6"
        />
        <text
          x="22"
          y="406"
          fill="currentColor"
          fontSize={kind === "cards" ? 8 / 0.75 : 8}
          opacity=".55"
          letterSpacing="2"
          className="font-display"
        >
          CANARIAS
        </text>
      </g>
    </svg>
  );
}

function TraceVariant({ cases }: VariantProps) {
  const selection = useTerritorialSelection(cases);
  return (
    <div className="relative grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-12">
      <div className="relative z-10">
        <p className={eyebrow}>Casos de éxito</p>
        <h2 className={`${heading} mt-5`}>
          El futuro de la salud.
          <br />
          <span className="text-primary-light dark:text-primary-dark">
            Ya está aquí.
          </span>
        </h2>
        <p className={`${prose} mt-6 max-w-lg`}>{casesIntro.body}</p>
        <div className="mt-10">
          <CaseSelectors selection={selection} />
          <ExpandCases selection={selection} />
        </div>
      </div>
      <div data-case-stage="" className="relative min-w-0 py-5 lg:-mr-10">
        <div className="relative h-[370px] sm:h-[540px] lg:h-[650px]">
          <Registration className="inset-3" />
          <TerritorialMap cases={cases} active={selection.active} />
          <span
            aria-hidden="true"
            className="via-primary-light/40 dark:via-primary-dark/40 absolute top-1/2 -right-2 h-24 w-px bg-linear-to-b from-transparent to-transparent"
          />
        </div>
        <div className="font-display text-primary-light dark:text-primary-dark mt-3 flex items-center justify-between border-t border-cyan-800/15 pt-4 text-[9px] font-semibold tracking-[.18em] uppercase dark:border-cyan-300/15">
          <span>España · Presencia institucional</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {count(cases.length)} instituciones
          </span>
        </div>
      </div>
    </div>
  );
}

type Refinement = Exclude<CaseDirection, "territorial-trace">;

function CaseHeading({
  compact = false,
  singleLine = false,
}: {
  compact?: boolean;
  singleLine?: boolean;
}) {
  return (
    <>
      <p className={eyebrow}>Casos de éxito</p>
      <h2
        className={`${heading} mt-5 ${compact ? "lg:text-[52px]" : ""}`}
        style={
          singleLine ? { fontSize: "clamp(1.5rem, 10cqw, 3.25rem)" } : undefined
        }
      >
        <span className={singleLine ? "whitespace-nowrap" : undefined}>
          El futuro de la salud.
        </span>
        <br />
        <span className="text-primary-light dark:text-primary-dark">
          Ya está aquí.
        </span>
      </h2>
      <p className={`${prose} mt-6 max-w-lg text-base sm:text-lg`}>
        {casesIntro.body}
      </p>
    </>
  );
}

function InstitutionIndex({
  cases,
  selection,
  names = false,
}: VariantProps & { selection: Selection; names?: boolean }) {
  return (
    <div
      aria-label="Seleccionar institución"
      className="border-t border-cyan-800/15 dark:border-cyan-300/15"
    >
      {cases.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => selection.select(item.id)}
          aria-pressed={selection.active?.id === item.id}
          className={`${focus} group flex w-full items-center gap-5 border-b border-cyan-800/15 px-3 py-5 text-left transition-colors dark:border-cyan-300/15 ${selection.active?.id === item.id ? "bg-primary-light/5 dark:bg-primary-dark/5" : "hover:bg-primary-light/[.03] dark:hover:bg-primary-dark/[.03]"}`}
        >
          <span className="font-display text-primary-light dark:text-primary-dark text-xs font-semibold">
            {count(index + 1)}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            {names ? (
              <span className="font-display text-xl font-semibold text-[#05215e] dark:text-slate-50">
                {item.name}
              </span>
            ) : (
              <InstitutionalLogo item={item} className="h-8 max-w-[220px]" />
            )}
            <span className="font-body text-xs leading-5 text-slate-500 dark:text-slate-400">
              {item.organization}
            </span>
          </span>
          <span
            aria-hidden="true"
            className={`text-primary-light dark:text-primary-dark size-2 shrink-0 rounded-full ${selection.active?.id === item.id ? "bg-current" : "border border-current opacity-35"}`}
          />
        </button>
      ))}
    </div>
  );
}

function ActiveInstitution({
  selection,
  portrait = false,
}: {
  selection: Selection;
  portrait?: boolean;
}) {
  const item = selection.active;
  if (!item) return null;
  return (
    <div
      aria-live="polite"
      className="relative overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/90 p-6 shadow-[0_16px_50px_-30px_rgba(0,109,121,.3)] backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#102330]/90"
    >
      {portrait && (
        <RegionPortrait
          item={item}
          className="absolute top-2 -right-5 h-40 w-40 opacity-30"
        />
      )}
      <div className="relative">
        <p className={`${eyebrow} flex items-center gap-2 text-[9px]`}>
          <MapPin size={12} strokeWidth={1.8} aria-hidden="true" />
          {item.territory}
        </p>
        <InstitutionalLogo item={item} className="mt-5 h-11 max-w-[250px]" />
        <p className="font-body mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">
          {item.organization}
        </p>
        {portrait && (
          <p className="font-body mt-5 border-t border-cyan-800/10 pt-4 text-xs leading-6 text-slate-500 dark:border-cyan-300/10 dark:text-slate-400">
            Conocimiento clínico fiable al servicio de la atención asistencial.
          </p>
        )}
      </div>
    </div>
  );
}

function MapStage({
  cases,
  selection,
  kind = "trace",
  inset = false,
}: VariantProps & { selection: Selection; kind?: MapKind; inset?: boolean }) {
  return (
    <div data-case-stage="" className="relative min-w-0">
      <div
        className={`relative h-[320px] sm:h-[470px] ${inset ? "lg:h-[450px]" : "lg:h-[590px]"}`}
      >
        <Registration className="inset-2" />
        <TerritorialMap cases={cases} active={selection.active} kind={kind} />
        {inset && (
          <div className="absolute right-4 bottom-5 hidden w-[235px] sm:block">
            <ActiveInstitution selection={selection} />
          </div>
        )}
      </div>
      <div className="font-display text-primary-light dark:text-primary-dark mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-cyan-800/15 pt-4 text-[9px] font-semibold tracking-[.15em] uppercase dark:border-cyan-300/15">
        <span>España · Presencia institucional</span>
        <span className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-current" />
          {count(cases.length)} instituciones
        </span>
      </div>
    </div>
  );
}

function DefinitiveMap({
  cases,
  selection,
  motionEnabled,
}: VariantProps & { selection: Selection; motionEnabled: boolean }) {
  const groups = useMemo(() => groupMappedCases(cases), [cases]);
  const canvas = useRef<HTMLDivElement>(null);
  const elapsed = useMotionValue(0);
  const reduced = !!useReducedMotion();
  const pushes = useMemo(
    () =>
      Object.fromEntries(
        groupMappedCases(cases).map((group) => [
          group.region,
          {
            x: motionValue(0),
            y: motionValue(0),
            held: false,
            velocityX: 0,
            velocityY: 0,
          } satisfies CalloutPush,
        ]),
      ),
    [cases],
  );
  const [scale, setScale] = useState(1);
  const [anchors, setAnchors] = useState<Record<string, CalloutBounds>>({});
  const onMeasure = useCallback((region: string, anchor: CalloutBounds) => {
    setAnchors((previous) =>
      previous[region]?.x === anchor.x &&
      previous[region]?.y === anchor.y &&
      previous[region]?.width === anchor.width &&
      previous[region]?.height === anchor.height
        ? previous
        : { ...previous, [region]: anchor },
    );
  }, []);
  const repel = useCallback(
    (dt: number) => {
      if (!motionEnabled || window.innerWidth < 640) return;
      repelCallouts(
        groups,
        { elapsed, scale, reduced, anchors, pushes, enabled: motionEnabled },
        dt,
      );
    },
    [groups, elapsed, scale, reduced, anchors, pushes, motionEnabled],
  );
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const measure = () =>
      setScale(Math.max(element.getBoundingClientRect().width / 600, 0.01));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!motionEnabled || reduced) return;
    let frame = 0;
    let last: number | undefined;
    const tick = (now: number) => {
      if (last !== undefined) {
        const dt = Math.min((now - last) / 1000, 0.032);
        elapsed.set(elapsed.get() + dt);
        repel(dt);
      }
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [motionEnabled, reduced, elapsed, repel]);
  const floating = {
    elapsed,
    scale,
    reduced,
    anchors,
    pushes,
    enabled: motionEnabled,
    repel,
  };
  return (
    <div data-case-stage="" className="relative min-w-0 py-5 lg:-mr-10">
      <div className="relative sm:h-[470px] lg:h-[566px]">
        <Registration className="inset-3" />
        <div
          ref={canvas}
          data-definitive-map-canvas=""
          className="relative sm:absolute sm:top-1/2 sm:left-1/2 sm:aspect-[600/440] sm:w-full sm:max-w-[641.584px] sm:-translate-x-1/2 sm:-translate-y-1/2 lg:max-w-[772.277px]"
        >
          <div className="hidden h-full sm:block">
            <TerritorialMap
              cases={cases}
              active={selection.active}
              kind="cards"
              floating={floating}
            />
          </div>
          <div className="pt-24 sm:hidden">
            <TerritorialMap
              cases={cases}
              active={selection.active}
              kind="cards"
              labels={false}
            />
          </div>
          <div
            aria-label="Instituciones en el mapa"
            className="absolute inset-x-0 top-0 grid grid-cols-2 gap-2 sm:static sm:block"
          >
            {groups.map((group, index) => {
              const item =
                group.cases.find(
                  (entry) => entry.id === selection.active?.id,
                ) ?? group.cases[0];
              if (!item) return null;
              const selected = item.id === selection.active?.id;
              const right = group.point.x > 340;
              return (
                <FloatingCaseCard
                  key={group.region}
                  index={index}
                  region={group.region}
                  point={group.point}
                  floating={floating}
                  onMeasure={onMeasure}
                  onClick={() => selection.select(item.id)}
                  aria-pressed={selected}
                  aria-label={`${item.name}, ${item.territory}, ${item.organization}`}
                  data-map-case-card={item.id}
                  className={`${focus} territory-case-card absolute w-[24%] rounded-xl border bg-white/95 p-2.5 text-left shadow-[0_8px_24px_-18px_rgba(0,109,121,.25)] backdrop-blur-sm transition-colors max-sm:relative max-sm:inset-auto! max-sm:w-auto! sm:p-3 dark:bg-[#102330]/95 ${selected ? "border-primary-light/35 dark:border-primary-dark/40" : "hover:border-primary-light/35 dark:hover:border-primary-dark/40 border-cyan-800/15 dark:border-cyan-300/20"}`}
                  style={{
                    ...(right
                      ? {
                          top: `${((505 * 0.028) / definitiveMapHeight) * 100}%`,
                          right: "38%",
                        }
                      : {
                          top: `${((505 * 0.426) / definitiveMapHeight) * 100}%`,
                          left: "-2%",
                        }),
                    animationDelay: `${calloutStart(index) + calloutDuration}s`,
                  }}
                >
                  <InstitutionalLogo
                    item={item}
                    className="h-5 max-w-full sm:h-6"
                  />
                  <span className="font-body block text-[10px] leading-4 text-slate-600 dark:text-slate-300">
                    {item.organization}
                  </span>
                </FloatingCaseCard>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function TraceRefinement({
  cases,
  direction,
  motionEnabled,
}: VariantProps & { direction: Refinement; motionEnabled: boolean }) {
  const selection = useTerritorialSelection(cases);
  if (direction === "trace-guide") {
    return (
      <div className="relative">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end lg:gap-16">
          <div>
            <p className={eyebrow}>Casos de éxito</p>
            <h2 className={`${heading} mt-5 max-w-3xl`}>
              El futuro de la salud.
              <br />
              <span className="text-primary-light dark:text-primary-dark">
                Ya está aquí.
              </span>
            </h2>
          </div>
          <p className={`${prose} max-w-lg text-base sm:text-lg`}>
            {casesIntro.body}
          </p>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[.65fr_1.35fr] lg:gap-14">
          <div className="pt-5">
            <p className={`${eyebrow} mb-5 text-[10px]`}>
              Instituciones · {count(cases.length)}
            </p>
            <InstitutionIndex cases={cases} selection={selection} />
            <div className="mt-6 sm:hidden">
              <ActiveInstitution selection={selection} />
            </div>
          </div>
          <MapStage cases={cases} selection={selection} kind="contrast" inset />
        </div>
      </div>
    );
  }
  if (direction === "trace-panel" || direction === "trace-definitive") {
    return (
      <div
        className={`grid items-center gap-10 ${direction === "trace-definitive" ? "lg:grid-cols-[.82fr_1.18fr] lg:gap-12" : "lg:grid-cols-[.85fr_1.15fr] lg:gap-16"}`}
      >
        <div
          style={
            direction === "trace-definitive"
              ? { containerType: "inline-size" }
              : undefined
          }
        >
          <CaseHeading compact singleLine={direction === "trace-definitive"} />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Seleccionar institución"
          >
            {cases.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => selection.select(item.id)}
                aria-pressed={selection.active?.id === item.id}
                className={`${focus} font-body min-h-10 rounded-full border px-4 text-xs font-semibold transition-colors ${selection.active?.id === item.id ? "border-primary-light bg-primary-light dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#06111f]" : "border-cyan-800/15 text-slate-600 hover:bg-cyan-800/5 dark:border-cyan-300/15 dark:text-slate-300 dark:hover:bg-cyan-300/5"}`}
              >
                <span className="mr-2 opacity-60">{count(index + 1)}</span>
                {item.name}
              </button>
            ))}
          </div>
          {direction === "trace-panel" && (
            <div className="mt-4">
              <ActiveInstitution selection={selection} portrait />
            </div>
          )}
        </div>
        {direction === "trace-definitive" ? (
          <DefinitiveMap
            cases={cases}
            selection={selection}
            motionEnabled={motionEnabled}
          />
        ) : (
          <MapStage cases={cases} selection={selection} />
        )}
      </div>
    );
  }
  const identity = direction === "trace-identity";
  const contrast = direction === "trace-contrast";
  return (
    <div
      className={`grid items-center gap-10 lg:gap-14 ${identity ? "lg:grid-cols-[.75fr_1.25fr]" : "lg:grid-cols-[.85fr_1.15fr]"}`}
    >
      <div className="relative z-10">
        <CaseHeading compact />
        <div className="mt-9">
          {identity || contrast ? (
            <InstitutionIndex
              cases={cases}
              selection={selection}
              names={identity}
            />
          ) : (
            <>
              <CaseSelectors selection={selection} />
              <ExpandCases selection={selection} />
            </>
          )}
        </div>
      </div>
      <div
        className={
          contrast
            ? "rounded-3xl border border-cyan-800/10 bg-[#f4f9fc]/70 p-4 sm:p-6 dark:border-cyan-300/10 dark:bg-[#081827]/70"
            : ""
        }
      >
        <MapStage
          cases={cases}
          selection={selection}
          kind={identity ? "identity" : contrast ? "contrast" : "trace"}
        />
      </div>
    </div>
  );
}

export function TerritorialCaseVariant({
  direction,
  cases,
  motionEnabled,
}: {
  motionEnabled: boolean;
  direction: CaseDirection;
  cases: readonly InstitutionalCase[];
}) {
  return (
    <div className="territorial-variant" data-territorial-variant={direction}>
      {direction === "territorial-trace" ? (
        <TraceVariant cases={cases} />
      ) : (
        <TraceRefinement
          direction={direction}
          cases={cases}
          motionEnabled={motionEnabled}
        />
      )}
      <style jsx global>{`
        .territorial-variant .territory-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: territory-draw 2.8s cubic-bezier(0.25, 0.1, 0.25, 1) both;
          animation-play-state: var(--case-motion, paused);
        }
        [data-territorial-variant="trace-definitive"] .territory-draw {
          animation-duration: ${definitiveDrawDuration}s;
        }
        [data-territorial-variant="trace-definitive"] .territory-card-link {
          animation-duration: ${calloutDuration}s;
        }
        .territorial-variant .territory-case-card {
          animation: territory-card-reveal 0.3s ease-out both;
          animation-play-state: var(--case-motion, paused);
        }
        @keyframes territory-card-reveal {
          from {
            opacity: 0;
            visibility: hidden;
          }
          to {
            opacity: 1;
            visibility: visible;
          }
        }
        .territorial-variant .territory-wash {
          animation: territory-wash 1.4s ease-out 1.1s both;
          animation-play-state: var(--case-motion, paused);
        }
        .territorial-variant .territory-marker {
          animation: territory-wash 0.6s ease-out both;
          animation-play-state: var(--case-motion, paused);
        }
        .territorial-variant .territory-region {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .territorial-variant .territory-flow {
          animation: territory-flow 8s linear infinite;
          animation-play-state: var(--case-motion, paused);
        }
        .territorial-variant .territory-orbit {
          animation: territory-orbit 14s linear infinite;
          animation-play-state: var(--case-motion, paused);
        }
        .territorial-variant .territory-pulse {
          animation: territory-pulse 4.5s ease-out infinite both;
          animation-play-state: var(--case-motion, paused);
        }
        [data-territorial-variant="trace-definitive"] .territory-pulse {
          animation-name: territory-water-ripple;
          animation-duration: 2.8s;
          animation-timing-function: linear;
        }
        @keyframes territory-draw {
          0% {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
          }
          99.99% {
            stroke-dasharray: 1;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }
        @keyframes territory-wash {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes territory-flow {
          from {
            stroke-dashoffset: 1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes territory-orbit {
          from {
            stroke-dashoffset: 1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes territory-water-ripple {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @keyframes territory-pulse {
          0%,
          10% {
            transform: scale(0.7);
            opacity: 0;
          }
          22% {
            opacity: 0.4;
          }
          85%,
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .territorial-variant .territory-draw,
          [data-territorial-variant="trace-definitive"] .territory-draw {
            animation: none;
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
          .territorial-variant .territory-case-card,
          .territorial-variant .territory-marker,
          .territorial-variant .territory-wash {
            animation: none;
            opacity: 1;
            visibility: visible;
          }
          .territorial-variant .territory-flow,
          .territorial-variant .territory-pulse,
          .territorial-variant .territory-orbit {
            animation: none;
            display: none;
          }
          .territorial-variant .territory-region {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

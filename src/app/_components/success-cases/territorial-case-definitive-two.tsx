"use client";

// Approved territorial map, reused by the home and the creative laboratory.
import {
  animate,
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
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { InstitutionalLogo } from "./success-cases-brand";
import { caseRegions } from "./success-cases-geography";
import { groupMappedCases, regionViewBox } from "./success-cases-layout";
import { MapPin } from "lucide-react";
import { casesIntro, type InstitutionalCase } from "./success-cases-data";

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
const mobileMapFrameHeight = 540;

const compactCardPositions = {
  catalunya: { left: 278, top: 7 },
  madrid: { left: 54, top: 213 },
} as const;

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
  width: MotionValue<number>;
  height: MotionValue<number>;
  originX: MotionValue<number>;
  originY: MotionValue<number>;
  driftFactor: MotionValue<number>;
};

type FloatingCallouts = {
  elapsed: MotionValue<number>;
  scale: number;
  reduced: boolean;
  anchors: Record<string, CalloutBounds>;
  pushes: Record<string, CalloutPush>;
  enabled: boolean;
  mobile: boolean;
  groups: readonly { point: CalloutAnchor }[];
  repel: (dt: number) => void;
};

function calloutFrameHeight(floating: Omit<FloatingCallouts, "repel">) {
  if (!floating.mobile) return definitiveMapHeight;
  const lastNode = Math.max(...floating.groups.map(({ point }) => point.y));
  return Math.max(mobileMapFrameHeight, lastNode + 232 / floating.scale);
}

function calloutDrift(
  time: number,
  index: number,
  reduced: boolean,
  intensity = 1,
) {
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
        intensity *
        (Math.sin(horizontal + index * 0.7) +
          0.18 * Math.sin(horizontal * 1.7))) /
      1.18,
    y:
      (envelope *
        7 *
        intensity *
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
  restAnchor: CalloutAnchor = anchor,
  frameHeight = definitiveMapHeight,
): CalloutTether {
  const origin = {
    x: (anchor.x - point.x) * scale,
    y: (anchor.y - point.y) * scale,
  };
  const restLength =
    Math.hypot(restAnchor.x - point.x, restAnchor.y - point.y) * scale;
  return {
    origin,
    maximum: restLength + 68 * scale,
    softLimit: restLength + 44 * scale,
    // A little overflow keeps the composition loose without losing the cards.
    frame: {
      minX: ((anchor.width ?? 144) - 24 - anchor.x) * scale,
      maxX: (600 + 24 - anchor.x) * scale,
      minY: ((anchor.height ?? 56) / 2 - 18 - anchor.y) * scale,
      maxY: (frameHeight + 18 - (anchor.height ?? 56) / 2 - anchor.y) * scale,
    },
  };
}

function resolvedAnchor(
  floating: Omit<FloatingCallouts, "repel">,
  region: string,
): CalloutBounds {
  const base = floating.anchors[region] ?? {
    x: compactCardPositions.catalunya.left + 120,
    y: compactCardPositions.catalunya.top + 29,
    width: 120,
    height: 58,
  };
  const push = floating.pushes[region]!;
  const width = push.width.get() / floating.scale;
  const height = push.height.get() / floating.scale;
  return {
    x: base.x + push.originX.get() / floating.scale + width - base.width,
    y:
      base.y + push.originY.get() / floating.scale + (height - base.height) / 2,
    width,
    height,
  };
}

function currentTether(
  floating: Omit<FloatingCallouts, "repel">,
  region: string,
  point: CalloutAnchor,
) {
  const anchor = resolvedAnchor(floating, region);
  const frameHeight = calloutFrameHeight(floating);
  const tether = calloutTether(
    point,
    anchor,
    floating.scale,
    floating.mobile ? anchor : floating.anchors[region],
    frameHeight,
  );
  if (floating.mobile) {
    const { scale } = floating;
    tether.frame = {
      minX: (anchor.width - anchor.x) * scale + 8,
      maxX: (600 - anchor.x) * scale - 8,
      minY: (anchor.height / 2 - anchor.y) * scale + 8,
      maxY: (frameHeight - anchor.height / 2 - anchor.y) * scale - 8,
    };
  }
  return tether;
}

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
    if (!floating.anchors[group.region]) return [];
    const anchor = resolvedAnchor(floating, group.region);
    const push = floating.pushes[group.region]!;
    const travel = {
      x: push.x.getVelocity() / floating.scale,
      y: push.y.getVelocity() / floating.scale,
    };
    const tether = currentTether(floating, group.region, group.point);
    const drift = calloutDrift(
      floating.elapsed.get(),
      index,
      floating.reduced,
      push.driftFactor.get(),
    );
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
  tether: () => CalloutTether,
) {
  return useTransform(() => {
    const drift = calloutDrift(
      elapsed.get(),
      index,
      reduced,
      push.driftFactor.get(),
    );
    return limitCalloutOffset(
      { x: drift.x + push.x.get(), y: drift.y + push.y.get() },
      tether(),
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
  const offset = useCalloutOffset(
    floating.elapsed,
    index,
    floating.reduced,
    floating.pushes[region]!,
    () => currentTether(floating, region, point),
  );
  const d = useTransform(() => {
    const pixels = offset.get();
    const anchor = resolvedAnchor(floating, region);
    const endX = anchor.x + pixels.x / floating.scale;
    const endY = anchor.y + pixels.y / floating.scale;
    const catalunyaElbowX =
      endX + Math.min(42, Math.max(0, (point.x - endX) * 0.45));
    return right
      ? `M${point.x} ${point.y} L${catalunyaElbowX} ${endY} H${endX}`
      : `M${point.x} ${point.y} L${207 + pixels.x / (2 * floating.scale)} ${endY} H${endX}`;
  });
  return (
    <motion.path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeOpacity=".55"
      strokeWidth=".9"
      className="definitive-two-draw definitive-two-card-link"
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
  item,
  expanded,
  peerExpanded,
  ...props
}: {
  index: number;
  region: string;
  point: CalloutAnchor;
  floating: FloatingCallouts;
  onMeasure: (region: string, anchor: CalloutBounds) => void;
  item: InstitutionalCase;
  expanded: boolean;
  peerExpanded: boolean;
  className: string;
  style: CSSProperties;
  onClick: () => void;
  "aria-pressed": boolean;
  "aria-label": string;
  "data-map-case-card": string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const content = useRef<HTMLSpanElement>(null);
  const detailsId = useId();
  const right = point.x > 340;
  const offset = useCalloutOffset(
    floating.elapsed,
    index,
    floating.reduced,
    floating.pushes[region]!,
    () => currentTether(floating, region, point),
  );
  const push = floating.pushes[region]!;
  const x = useTransform(() => offset.get().x + push.originX.get());
  const y = useTransform(() => offset.get().y + push.originY.get());
  const compactWidth = floating.mobile
    ? Math.max(100, 120 * floating.scale)
    : 120 * floating.scale;
  const compactHeight = floating.mobile ? 40 : 58;
  const expandedWidth = floating.mobile
    ? Math.min(280, 600 * floating.scale - 16)
    : Math.min(300, 276 * floating.scale);
  const regionShape = caseRegions.find((entry) => entry.name === region);
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
  useLayoutEffect(() => {
    const position = right
      ? compactCardPositions.catalunya
      : compactCardPositions.madrid;
    onMeasure(region, {
      x: position.left + compactWidth / floating.scale,
      y: position.top + compactHeight / (2 * floating.scale),
      width: compactWidth / floating.scale,
      height: compactHeight / floating.scale,
    });
  }, [region, right, floating.scale, compactWidth, compactHeight, onMeasure]);
  useLayoutEffect(() => {
    if (!floating.anchors[region]) return;
    stopMomentum();
    const width = expanded ? expandedWidth : compactWidth;
    const height = expanded
      ? (content.current?.scrollHeight ?? 150) + 32
      : compactHeight;
    let originX = push.originX.get();
    let originY = push.originY.get();
    if (floating.mobile && !expanded) {
      const base = floating.anchors[region];
      originX = 0;
      originY = peerExpanded
        ? Math.min(
            0,
            point.y * floating.scale -
              compactHeight -
              20 -
              (base.y - base.height / 2) * floating.scale,
          )
        : 0;
    }
    if (expanded) {
      const base = floating.anchors[region];
      const current = offset.get();
      const baseLeft = (base.x - base.width) * floating.scale;
      const baseTop = (base.y - base.height / 2) * floating.scale;
      const left = baseLeft + current.x + originX;
      const top = baseTop + current.y + originY;
      const nodes = floating.groups.map(({ point }) => ({
        x: point.x * floating.scale,
        y: point.y * floating.scale,
      }));
      const nodeX = point.x * floating.scale;
      const topCandidates = [top, top + push.height.get() - height];
      const belowNodes = Math.max(...nodes.map((node) => node.y)) + 18;
      topCandidates.push(belowNodes);
      const frameHeight = calloutFrameHeight(floating);
      const peers = Object.keys(floating.anchors)
        .filter((key) => key !== region)
        .map((key) => {
          const a = resolvedAnchor(floating, key);
          const p = floating.pushes[key]!;
          return {
            left: (a.x - a.width) * floating.scale + p.x.get(),
            top: (a.y - a.height / 2) * floating.scale + p.y.get(),
            width: a.width * floating.scale,
            height: a.height * floating.scale,
          };
        });
      const candidates = [left, left + push.width.get() - width].flatMap(
        (candidateX) =>
          topCandidates.map((candidateY) => {
            const left = Math.max(
              floating.mobile ? 8 : -24 * floating.scale,
              Math.min(
                floating.mobile
                  ? 600 * floating.scale - width - 8
                  : 624 * floating.scale - width,
                candidateX,
              ),
            );
            const top = Math.max(
              floating.mobile ? 8 : -18 * floating.scale,
              Math.min(
                floating.mobile
                  ? frameHeight * floating.scale - height - 8
                  : (frameHeight + 18) * floating.scale - height,
                candidateY,
              ),
            );
            const coversNode = nodes.some(
              (node) =>
                node.x > left - 14 &&
                node.x < left + width + 14 &&
                node.y > top - 14 &&
                node.y < top + height + 14,
            );
            const overlapsPeer = peers.some(
              (peer) =>
                left < peer.left + peer.width + 10 &&
                left + width + 10 > peer.left &&
                top < peer.top + peer.height + 10 &&
                top + height + 10 > peer.top,
            );
            return {
              left,
              top,
              score:
                (coversNode ? 10000 : 0) +
                (overlapsPeer ? 2000 : 0) +
                (candidateY === belowNodes
                  ? Math.abs(candidateY - topCandidates[0]!)
                  : 0) +
                Math.hypot(left - candidateX, top - candidateY),
            };
          }),
      );
      // Prefer growth away from the node when both directions have room.
      if (left + push.width.get() / 2 < nodeX) candidates.reverse();
      const target = candidates.sort((a, b) => a.score - b.score)[0]!;
      originX = target.left - baseLeft - current.x;
      originY = target.top - baseTop - current.y;
    }
    const targets = [
      [push.width, width],
      [push.height, height],
      [push.originX, originX],
      [push.originY, originY],
      [push.driftFactor, expanded ? 0.35 : 1],
    ] as const;
    if (floating.reduced) {
      targets.forEach(([value, target]) => value.set(target));
      floating.repel(0);
      return;
    }
    const animations = targets.map(([value, target]) =>
      animate(value, target, {
        duration: expanded ? 0.38 : 0.28,
        delay: expanded ? 0 : 0.1,
        ease: [0.22, 1, 0.36, 1],
      }),
    );
    return () => animations.forEach((animation) => animation.stop());
    // Geometry is sampled once per change; MotionValues drive the transition.
  }, [
    expanded,
    peerExpanded,
    compactWidth,
    compactHeight,
    expandedWidth,
    floating,
    offset,
    point.x,
    point.y,
    region,
    push,
    stopMomentum,
  ]);
  return (
    <motion.button
      {...props}
      ref={ref}
      type="button"
      aria-expanded={expanded}
      aria-controls={detailsId}
      data-card-expanded={expanded}
      className={`${props.className} cursor-pointer touch-pan-y overflow-hidden select-none sm:cursor-grab sm:touch-none sm:active:cursor-grabbing ${expanded ? "z-20" : "z-10"}`}
      onDragStartCapture={(event) => event.preventDefault()}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0 || floating.mobile) return;
        const tether = currentTether(floating, region, point);
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
        const tether = currentTether(floating, region, point);
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
          push.driftFactor.get(),
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
      style={{ ...props.style, x, y, width: push.width, height: push.height }}
    >
      <motion.span
        aria-hidden={expanded}
        className="pointer-events-none absolute inset-0 flex items-center justify-center px-2 sm:px-3"
        animate={{ opacity: expanded ? 0 : 1 }}
        transition={{
          duration: floating.reduced ? 0 : 0.14,
          delay: floating.reduced || expanded ? 0 : 0.14,
        }}
      >
        <InstitutionalLogo item={item} className="h-6 max-w-full sm:h-8" />
      </motion.span>
      <motion.span
        id={detailsId}
        ref={content}
        aria-hidden={!expanded}
        className="pointer-events-none absolute top-4 left-4 block"
        style={{ width: expandedWidth - 32 }}
        animate={{ opacity: expanded ? 1 : 0 }}
        initial={{ opacity: 0 }}
        transition={{
          duration: floating.reduced ? 0 : 0.18,
          delay: expanded && !floating.reduced ? 0.09 : 0,
        }}
      >
        <span className="font-display text-primary-light dark:text-primary-dark flex items-center gap-1.5 text-[9px] leading-3 font-bold tracking-[.14em] uppercase">
          <MapPin size={11} aria-hidden="true" />
          {item.territory}
        </span>
        <span className="relative mt-3 block">
          <InstitutionalLogo item={item} className="h-8 max-w-[70%] sm:h-9" />
          {regionShape && (
            <svg
              aria-hidden="true"
              viewBox={regionViewBox(regionShape.d, 0.1)}
              className="text-primary-light dark:text-primary-dark absolute -top-5 right-0 h-[96px] w-[88px] sm:h-[104px] sm:w-[112px]"
            >
              <path
                d={regionShape.d}
                fill="currentColor"
                fillOpacity=".035"
                stroke="currentColor"
                strokeOpacity=".28"
                strokeWidth=".8"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          )}
        </span>
        <span className="font-body mt-3 block text-[11px] leading-[18px] text-slate-600 sm:text-xs dark:text-slate-300">
          {item.organization}
        </span>
        <span className="font-body mt-3 block border-t border-cyan-800/10 pt-3 text-[11px] leading-4 text-slate-500 dark:border-cyan-300/10 dark:text-slate-400">
          Conocimiento clínico fiable al servicio de la atención asistencial.
        </span>
      </motion.span>
    </motion.button>
  );
}

function useTerritorialSelection(cases: readonly InstitutionalCase[]) {
  const [openId, setOpenId] = useState<string | null>(null);
  const active = cases.find((item) => item.id === openId);
  const close = useCallback(() => setOpenId(null), []);
  const select = (id: string) => {
    setOpenId((current) => (current === id ? null : id));
  };
  return {
    active,
    select,
    openId,
    close,
  };
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
              className="definitive-two-region"
              transform={
                kind === "cards" && region.name === "Canarias"
                  ? definitiveCanariasTransform
                  : kind === "cards" && region.name === "Illes Balears"
                    ? "translate(-18 0)"
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
                className={occupied ? "definitive-two-wash" : undefined}
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
                className="definitive-two-draw"
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
            className="definitive-two-marker"
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
                className="definitive-two-pulse"
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
                  className="definitive-two-draw"
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
            width: motionValue(120),
            height: motionValue(58),
            originX: motionValue(0),
            originY: motionValue(0),
            driftFactor: motionValue(1),
          } satisfies CalloutPush,
        ]),
      ),
    [cases],
  );
  const [scale, setScale] = useState(1);
  const [mobile, setMobile] = useState(false);
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
      if (!motionEnabled || mobile) return;
      repelCallouts(
        groups,
        {
          elapsed,
          scale,
          reduced,
          anchors,
          pushes,
          enabled: motionEnabled,
          mobile,
          groups,
        },
        dt,
      );
    },
    [groups, elapsed, scale, reduced, anchors, pushes, motionEnabled, mobile],
  );
  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    const measure = () => {
      setScale(Math.max(element.getBoundingClientRect().width / 600, 0.01));
      setMobile(window.innerWidth < 640);
    };
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
  const floating = useMemo(
    () => ({
      elapsed,
      scale,
      reduced,
      anchors,
      pushes,
      enabled: motionEnabled,
      mobile,
      groups,
      repel,
    }),
    [
      elapsed,
      scale,
      reduced,
      anchors,
      pushes,
      motionEnabled,
      mobile,
      groups,
      repel,
    ],
  );
  return (
    <div
      data-case-stage=""
      className="relative min-w-0 py-5 lg:-mr-10 lg:translate-x-6"
    >
      <div className="relative sm:h-[470px] lg:h-[566px]">
        <Registration className="inset-3" />
        <div
          ref={canvas}
          data-definitive-map-canvas=""
          style={
            mobile
              ? { aspectRatio: `600 / ${calloutFrameHeight(floating)}` }
              : undefined
          }
          className="relative aspect-[600/540] sm:absolute sm:top-1/2 sm:left-[54.5%] sm:aspect-[600/440] sm:w-full sm:max-w-[641.584px] sm:-translate-x-1/2 sm:-translate-y-1/2 lg:max-w-[772.277px]"
        >
          <div className="absolute inset-x-0 top-0 aspect-[600/440]">
            <TerritorialMap
              cases={cases}
              active={selection.active}
              kind="cards"
              floating={floating}
            />
          </div>
          <div aria-label="Instituciones en el mapa" className="static">
            {groups.map((group, index) => {
              const item =
                group.cases.find(
                  (entry) => entry.id === selection.active?.id,
                ) ?? group.cases[0];
              if (!item) return null;
              const selected = item.id === selection.active?.id;
              const right = group.point.x > 340;
              const position = right
                ? compactCardPositions.catalunya
                : compactCardPositions.madrid;
              return (
                <FloatingCaseCard
                  key={group.region}
                  index={index}
                  region={group.region}
                  point={group.point}
                  floating={floating}
                  onMeasure={onMeasure}
                  item={item}
                  expanded={selection.openId === item.id}
                  peerExpanded={
                    mobile && !!selection.openId && selection.openId !== item.id
                  }
                  onClick={() => selection.select(item.id)}
                  aria-pressed={selected}
                  aria-label={`${item.name}, ${item.territory}, ${item.organization}`}
                  data-map-case-card={item.id}
                  className={`${focus} definitive-two-case-card absolute rounded-xl border bg-white/95 text-left shadow-[0_8px_24px_-18px_rgba(0,109,121,.25)] backdrop-blur-sm transition-colors dark:bg-[#102330]/95 ${selected ? "border-primary-light/35 dark:border-primary-dark/40" : "hover:border-primary-light/35 dark:hover:border-primary-dark/40 border-cyan-800/15 dark:border-cyan-300/20"}`}
                  style={{
                    top: position.top * scale,
                    left: `${(position.left / 600) * 100}%`,
                    animationDelay: `${calloutStart(index) + calloutDuration}s`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DefinitiveTwoVariant({
  cases,
  motionEnabled,
}: VariantProps & { motionEnabled: boolean }) {
  const selection = useTerritorialSelection(cases);
  const { openId, close } = selection;
  useEffect(() => {
    if (!openId) return;
    const dismiss = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-map-case-card], [data-case-tag]")
      )
        return;
      close();
    };
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", key);
    };
  }, [openId, close]);
  return (
    <div
      className="definitive-two-variant"
      data-definitive-two-variant="trace-definitive-2"
    >
      <div className="grid items-center gap-10 lg:grid-cols-[.82fr_1.18fr] lg:gap-12">
        <div data-case-intro="" style={{ containerType: "inline-size" }}>
          <CaseHeading compact singleLine />
          <div
            className="mt-8 flex flex-wrap gap-2"
            aria-label="Seleccionar institución"
          >
            {cases.map((item, index) => (
              <button
                key={item.id}
                data-case-tag={item.id}
                aria-expanded={selection.openId === item.id}
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
        </div>
        <DefinitiveMap
          cases={cases}
          selection={selection}
          motionEnabled={motionEnabled}
        />
      </div>
      <style jsx global>{`
        .definitive-two-variant .definitive-two-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: definitive-two-draw 2.8s cubic-bezier(0.25, 0.1, 0.25, 1)
            both;
          animation-play-state: var(--case-motion, paused);
        }
        [data-definitive-two-variant="trace-definitive-2"]
          .definitive-two-draw {
          animation-duration: ${definitiveDrawDuration}s;
        }
        [data-definitive-two-variant="trace-definitive-2"]
          .definitive-two-card-link {
          animation-duration: ${calloutDuration}s;
        }
        .definitive-two-variant .definitive-two-case-card {
          animation: definitive-two-card-reveal 0.3s ease-out both;
          animation-play-state: var(--case-motion, paused);
        }
        @keyframes definitive-two-card-reveal {
          from {
            opacity: 0;
            visibility: hidden;
          }
          to {
            opacity: 1;
            visibility: visible;
          }
        }
        .definitive-two-variant .definitive-two-wash {
          animation: definitive-two-wash 1.4s ease-out 1.1s both;
          animation-play-state: var(--case-motion, paused);
        }
        .definitive-two-variant .definitive-two-marker {
          animation: definitive-two-wash 0.6s ease-out both;
          animation-play-state: var(--case-motion, paused);
        }
        .definitive-two-variant .definitive-two-region {
          transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .definitive-two-variant .definitive-two-flow {
          animation: definitive-two-flow 8s linear infinite;
          animation-play-state: var(--case-motion, paused);
        }
        .definitive-two-variant .definitive-two-orbit {
          animation: definitive-two-orbit 14s linear infinite;
          animation-play-state: var(--case-motion, paused);
        }
        .definitive-two-variant .definitive-two-pulse {
          animation: definitive-two-pulse 4.5s ease-out infinite both;
          animation-play-state: var(--case-motion, paused);
        }
        [data-definitive-two-variant="trace-definitive-2"]
          .definitive-two-pulse {
          animation-name: definitive-two-water-ripple;
          animation-duration: 2.8s;
          animation-timing-function: linear;
        }
        @keyframes definitive-two-draw {
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
        @keyframes definitive-two-wash {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes definitive-two-flow {
          from {
            stroke-dashoffset: 1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes definitive-two-orbit {
          from {
            stroke-dashoffset: 1;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes definitive-two-water-ripple {
          0% {
            transform: scale(0);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.9);
            opacity: 0;
          }
        }
        @keyframes definitive-two-pulse {
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
          .definitive-two-variant .definitive-two-draw,
          [data-definitive-two-variant="trace-definitive-2"]
            .definitive-two-draw {
            animation: none;
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
          .definitive-two-variant .definitive-two-case-card,
          .definitive-two-variant .definitive-two-marker,
          .definitive-two-variant .definitive-two-wash {
            animation: none;
            opacity: 1;
            visibility: visible;
          }
          .definitive-two-variant .definitive-two-flow,
          .definitive-two-variant .definitive-two-pulse,
          .definitive-two-variant .definitive-two-orbit {
            animation: none;
            display: none;
          }
          .definitive-two-variant .definitive-two-region {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

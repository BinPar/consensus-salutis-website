"use client";

import Link from "next/link";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { teamMembers } from "./astra-team-data";
import "./team-guiada.css";

import {
  RealTeamPortrait,
  realTeamPortraits,
} from "../../_shared/team-portraits";

const disciplines = [
  "Ideas que conectan",
  "Diseño de producto",
  "Ingeniería de software",
  "Curiosidad compartida",
  "Estrategia digital",
  "Inteligencia artificial",
  "Aprender haciendo",
  "Cuidar los detalles",
  "Pensar en equipo",
  "Nuevas perspectivas",
  "Tecnología con sentido",
  "Crear y mejorar",
  "Escuchar primero",
  "Resolver juntos",
  "Conocimiento compartido",
  "Mirar más allá",
];
const sizes = [1, 0.92, 1.06, 0.96, 1, 1.04, 0.92, 1];
const innerPortraitSlots = [0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 13];
const outerPortraitSlots = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
const rings = [
  { id: "inner", slots: Array.from({ length: 14 }, (_, index) => index) },
  { id: "outer", slots: Array.from({ length: 16 }, (_, index) => index) },
];

function shuffledMemberIndices() {
  const order = teamMembers.map((_, index) => index);
  for (let index = order.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [order[index], order[other]] = [order[other]!, order[index]!];
  }
  return order;
}

// Original implementation inspired by the reference's two counter-rotating
// rings. Transforms move the cards; their contents always remain upright.
function useGuidedOrbit(paused: boolean) {
  const stage = useRef<HTMLElement>(null);
  const pausedRef = useRef(paused);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [memberIndices, setMemberIndices] = useState<Record<
    string,
    number
  > | null>(null);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const cards = Array.from(
      element.querySelectorAll<HTMLElement>("[data-guided-card]"),
    );
    const orbitCards = cards.map((card) => ({
      card,
      outer: card.dataset.guidedRing === "outer",
      slot: Number(card.dataset.guidedSlot),
      count: Number(card.dataset.guidedCount),
      memberKey: card.dataset.guidedMemberKey,
      turn: 0,
    }));
    // One shared pool keeps each person on at most one card. More positions
    // can host portraits than there are people: move a hidden portrait into
    // an entering position, leaving a decorative tile behind offscreen.
    const portraitCards = orbitCards.filter((item) => item.memberKey);
    const initialMembers = shuffledMemberIndices();
    const assignments: Record<string, number> = {};
    portraitCards.forEach(({ memberKey }, index) => {
      const member = initialMembers[index];
      if (member !== undefined) assignments[memberKey!] = member;
    });
    const pending = { inner: [] as number[], outer: [] as number[] };
    function refillPending(outer: boolean) {
      const ring = outer ? "outer" : "inner";
      if (pending[ring].length) return;
      pending[ring] = shuffledMemberIndices();
    }
    refillPending(false);
    refillPending(true);
    setMemberIndices({ ...assignments });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = preference.matches;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let phase = 0;
    // Keep offsets when switching the dragged ring to avoid position jumps.
    const manual = { angles: { inner: 0, outer: 0 }, velocity: 0 };
    let drivingRing: keyof typeof manual.angles = "inner";
    let drag: {
      pointerId: number;
      ring: keyof typeof manual.angles;
      angle: number;
      time: number;
    } | null = null;
    let speed = 1;
    let impulse = 0;
    let hovered = false;
    let visible = false;
    let width = element.clientWidth;
    let height = element.clientHeight;
    let ringClearance = 0;
    let footprintWidth = 0;
    let footprintHeight = 0;
    let previousScroll = window.scrollY;
    let exposedMembers = new Set<string>();
    const pendingRecycles = new Set<string>();
    setReducedMotion(reduced);

    function advanceManual(delta: number) {
      const followingRing = drivingRing === "inner" ? "outer" : "inner";
      manual.angles[drivingRing] += delta;
      manual.angles[followingRing] -= delta * 0.5;
    }

    function measureClearance() {
      // The entire upright card (including its caption) must fit between
      // tracks, even when the rings line up diagonally or a tile is hovered.
      footprintWidth = 0;
      footprintHeight = 0;
      cards.forEach((card) => {
        const caption = card.querySelector<HTMLElement>(".ta-guided-caption");
        footprintWidth = Math.max(
          footprintWidth,
          card.offsetWidth,
          caption?.offsetWidth ?? 0,
        );
        footprintHeight = Math.max(
          footprintHeight,
          card.offsetHeight + (caption?.offsetHeight ?? 0),
        );
      });
      ringClearance = Math.hypot(footprintWidth, footprintHeight) + 16;
    }

    function paint() {
      const mobile = width <= 600;
      const innerRadius = Math.max(width * 0.315, width < 1000 ? 385 : 470);
      const enter = reduced
        ? 1
        : 1 - Math.pow(1 - Math.min(elapsed / 1.6, 1), 3);
      const hidden = new Set<string>();
      const outside = new Set<string>();
      const recycling: typeof portraitCards = [];
      orbitCards.forEach((orbitCard) => {
        const { card, outer, slot, count, memberKey } = orbitCard;
        const radius = outer
          ? Math.max(innerRadius * 1.39, innerRadius + ringClearance)
          : innerRadius;
        const angle =
          (slot / count) * Math.PI * 2 +
          (outer ? 0.08 : Math.PI / count) +
          phase * (outer ? 1 / 10 : -1 / 12) +
          manual.angles[outer ? "outer" : "inner"];
        const rx = mobile ? width * 0.86 : radius;
        const ry = mobile ? height * 0.43 : radius;
        const spread = 0.8 + enter * 0.2;
        const x = Math.sin(angle) * rx * spread;
        const y = Math.cos(angle) * ry * spread;
        card.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
        if (memberKey) {
          // Recycle each portrait at the bottom of its orbit, under the fade.
          // Slot count, card dimensions, radii and angular spacing stay fixed.
          const turn = Math.floor(angle / (Math.PI * 2));
          if (turn !== orbitCard.turn) {
            orbitCard.turn = turn;
            pendingRecycles.add(memberKey);
          }
          if (pendingRecycles.has(memberKey)) recycling.push(orbitCard);
          const seamOpacity = Math.max(
            0,
            Math.min(1, (0.985 - Math.cos(angle)) / 0.065),
          );
          card.style.opacity = String(seamOpacity);
          // Include the caption and hover enlargement in the hidden bounds.
          // The outer ring is not displayed at tablet/mobile widths.
          const half = footprintWidth / 2;
          const left = width / 2 + x - half;
          const top = height / 2 + y - half;
          if (
            (outer && width <= 1000) ||
            left > width + 32 ||
            left + half * 2.3 < -32 ||
            top > height + 32 ||
            top + footprintHeight < -32
          )
            outside.add(memberKey);
          if (outside.has(memberKey) || seamOpacity === 0)
            hidden.add(memberKey);
          // Count a person as seen only once their portrait reaches the clear
          // part of the view, not when it is assigned to a hidden position.
          const member = assignments[memberKey];
          if (
            member !== undefined &&
            !(outer && width <= 1000) &&
            seamOpacity > 0.4 &&
            left >= 0 &&
            left + footprintWidth <= width &&
            top >= height * 0.18 &&
            top + footprintWidth <= height * 0.8
          ) {
            const ring = outer ? "outer" : "inner";
            pending[ring] = pending[ring].filter((index) => index !== member);
          }
        }
      });
      // Reserve portraits for incoming cards before recycling hidden ones.
      // If all people are already visible, keep the entering tile decorative
      // until it leaves again; never change its content while it is on screen.
      const entering = portraitCards.filter(
        ({ memberKey }) =>
          memberKey &&
          !outside.has(memberKey) &&
          (!exposedMembers.has(memberKey) || hidden.has(memberKey)) &&
          assignments[memberKey] === undefined,
      );
      const exchanged = new Set<string>();
      for (const orbitCard of [...entering, ...recycling]) {
        const { memberKey, outer } = orbitCard;
        const isEntering = entering.includes(orbitCard);
        if (
          !memberKey ||
          (!isEntering && !hidden.has(memberKey)) ||
          exchanged.has(memberKey)
        )
          continue;
        const ring = outer ? "outer" : "inner";
        refillPending(outer);
        const candidates = isEntering
          ? [...pending[ring], ...shuffledMemberIndices()]
          : pending[ring];
        const next = candidates.find((index) => {
          const owner = portraitCards.find(
            (item) => assignments[item.memberKey!] === index,
          );
          return (
            !owner ||
            (owner.memberKey !== memberKey &&
              (isEntering || owner.outer !== outer) &&
              (isEntering ? outside : hidden).has(owner.memberKey!) &&
              !exchanged.has(owner.memberKey!))
          );
        });
        // Wait for another hidden crossing if no safe exchange is available.
        if (next === undefined) continue;
        const partner = portraitCards.find(
          (item) => assignments[item.memberKey!] === next,
        );
        const outgoing = assignments[memberKey];
        assignments[memberKey] = next;
        exchanged.add(memberKey);
        if (partner) {
          if (outgoing === undefined) delete assignments[partner.memberKey!];
          else {
            assignments[partner.memberKey!] = outgoing;
          }
          exchanged.add(partner.memberKey!);
        }
      }
      exposedMembers = new Set(
        portraitCards
          .filter(({ memberKey }) => !outside.has(memberKey!))
          .map(({ memberKey }) => memberKey!),
      );
      if (exchanged.size) setMemberIndices({ ...assignments });
      exchanged.forEach((key) => pendingRecycles.delete(key));
      element?.style.setProperty(
        "--guided-reveal",
        String(reduced ? 1 : Math.min(elapsed / 0.7, 1)),
      );
    }
    function tick(now: number) {
      frame = 0;
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed += dt;
      const target = pausedRef.current || drag ? 0 : hovered ? 0.12 : 1;
      speed += (target - speed) * (1 - Math.exp(-dt * 5));
      if (pausedRef.current) speed = 0;
      impulse *= Math.exp(-dt * 5);
      phase += dt * speed * (1 + impulse);
      if (pausedRef.current || reduced) manual.velocity = 0;
      if (!drag) {
        const decay = Math.exp(-dt * 3.2);
        advanceManual((manual.velocity * (1 - decay)) / 3.2);
        manual.velocity *= decay;
        if (Math.abs(manual.velocity) < 0.008) manual.velocity = 0;
      }
      paint();
      if (visible && !document.hidden && !reduced)
        frame = requestAnimationFrame(tick);
    }
    function resume() {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
      if (visible && !document.hidden && !reduced)
        frame = requestAnimationFrame(tick);
      else paint();
    }
    function pointerAngle(event: PointerEvent) {
      const rect = element!.getBoundingClientRect();
      const x = event.clientX - rect.left - width / 2;
      const y = event.clientY - rect.top - height / 2;
      // Normalize the mobile ellipse so dragging follows the same orbit.
      return Math.atan2(
        width <= 600 ? x / (width * 0.86) : x,
        width <= 600 ? y / (height * 0.43) : y,
      );
    }
    function onPointerDown(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      const card = (event.target as Element).closest<HTMLElement>(
        "[data-guided-card]",
      );
      const ring = card?.dataset.guidedRing;
      if (ring !== "inner" && ring !== "outer") return;
      event.preventDefault();
      drivingRing = ring;
      manual.velocity = 0;
      speed = 0;
      impulse = 0;
      drag = {
        pointerId: event.pointerId,
        ring,
        angle: pointerAngle(event),
        time: event.timeStamp,
      };
      element!.dataset.dragging = ring;
      element!.setPointerCapture(event.pointerId);
    }
    function onPointerMove(event: PointerEvent) {
      if (event.pointerId !== drag?.pointerId) return;
      event.preventDefault();
      const angle = pointerAngle(event);
      const difference = Math.atan2(
        Math.sin(angle - drag.angle),
        Math.cos(angle - drag.angle),
      );
      // Bound angular jumps, including when the pointer crosses the centre.
      const delta = Math.max(-0.14, Math.min(0.14, difference));
      const dt = Math.max((event.timeStamp - drag.time) / 1000, 0.008);
      advanceManual(delta);
      const velocity = Math.max(-2.5, Math.min(2.5, delta / dt));
      manual.velocity += (velocity - manual.velocity) * 0.55;
      drag.angle = angle;
      drag.time = event.timeStamp;
      paint();
    }
    function endDrag(event?: PointerEvent) {
      if (!drag || (event && event.pointerId !== drag.pointerId)) return;
      const { pointerId, time } = drag;
      if (
        event?.type !== "pointerup" ||
        reduced ||
        pausedRef.current ||
        event.timeStamp - time > 100
      )
        manual.velocity = 0;
      drag = null;
      hovered = false;
      delete element!.dataset.dragging;
      if (element!.hasPointerCapture(pointerId))
        element!.releasePointerCapture(pointerId);
    }
    const preventImageDrag = (event: DragEvent) => {
      if ((event.target as Element).closest("[data-guided-card]"))
        event.preventDefault();
    };
    const onVisibility = () => {
      if (document.hidden) {
        endDrag();
        manual.velocity = 0;
      }
      resume();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting);
      resume();
    });
    const resize = new ResizeObserver(() => {
      endDrag();
      width = element.clientWidth;
      height = element.clientHeight;
      measureClearance();
      paint();
    });
    const onPreference = () => {
      endDrag();
      manual.velocity = 0;
      reduced = preference.matches;
      setReducedMotion(reduced);
      resume();
    };
    const onScroll = () => {
      const delta = window.scrollY - previousScroll;
      previousScroll = window.scrollY;
      if (visible && !reduced && !pausedRef.current && !drag)
        impulse = Math.max(-0.65, Math.min(3, delta / 35));
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && !drag) hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };
    cards.forEach((card) => {
      card.addEventListener("pointerenter", onEnter);
      card.addEventListener("pointerleave", onLeave);
    });
    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", endDrag);
    element.addEventListener("pointercancel", endDrag);
    element.addEventListener("lostpointercapture", endDrag);
    element.addEventListener("dragstart", preventImageDrag);
    measureClearance();
    paint();
    observer.observe(element);
    resize.observe(element);
    preference.addEventListener("change", onPreference);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      endDrag();
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", endDrag);
      element.removeEventListener("pointercancel", endDrag);
      element.removeEventListener("lostpointercapture", endDrag);
      element.removeEventListener("dragstart", preventImageDrag);
      cancelAnimationFrame(frame);
      observer.disconnect();
      resize.disconnect();
      preference.removeEventListener("change", onPreference);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("scroll", onScroll);
      cards.forEach((card) => {
        card.removeEventListener("pointerenter", onEnter);
        card.removeEventListener("pointerleave", onLeave);
      });
    };
  }, []);
  return { stage, reducedMotion, memberIndices };
}

function Pattern({ index }: { index: number }) {
  return (
    <div className={`ta-guided-pattern ta-guided-pattern-${index % 4}`}>
      <svg viewBox="0 0 160 160" fill="none" aria-hidden="true">
        {index % 4 === 0 ? (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <ellipse
                key={i}
                cx={80}
                cy={80}
                rx={26 + i * 14}
                ry={65}
                transform={`rotate(${i * 24 - 48} 80 80)`}
              />
            ))}
          </g>
        ) : index % 4 === 1 ? (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <path
                key={i}
                d={`M-20 ${25 + i * 21} C40 ${-40 + i * 21} 75 ${140 + i * 10} 180 ${30 + i * 18}`}
              />
            ))}
          </g>
        ) : index % 4 === 2 ? (
          <g>
            {[0, 1, 2, 3, 4].map((i) => (
              <rect
                key={i}
                x={24 + i * 8}
                y={24 + i * 8}
                width={112 - i * 16}
                height={112 - i * 16}
                rx={24 - i * 3}
                transform={`rotate(${i * 9 - 18} 80 80)`}
              />
            ))}
          </g>
        ) : (
          <g>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <circle key={i} cx={35 + i * 23} cy={80} r={55} />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}

export function TeamGuiadaHero({ portraits }: { portraits: ReactNode[] }) {
  const [paused, setPaused] = useState(false);
  const { stage, reducedMotion, memberIndices } = useGuidedOrbit(paused);
  return (
    <section
      ref={stage}
      className="ta-guided"
      aria-labelledby="ta-guided-title"
      data-motion={paused || reducedMotion ? "paused" : "playing"}
    >
      {rings.map(({ id: ring, slots }, ringIndex) => (
        <div
          key={ring}
          className={`ta-guided-ring ta-guided-ring-${ring}`}
          aria-hidden="true"
        >
          {slots.map((slot) => {
            // Roughly three portrait opportunities per decorative position.
            // A shared pool fills visible positions first, without duplicates.
            const portraitSlots =
              ringIndex === 0 ? innerPortraitSlots : outerPortraitSlots;
            const canShowPortrait = portraitSlots.includes(slot);
            const memberKey = `${ring}-${slot}`;
            const basePersonIndex =
              portraitSlots.indexOf(slot) +
              (ringIndex === 0 ? 0 : innerPortraitSlots.length);
            const personIndex =
              memberIndices === null
                ? canShowPortrait && basePersonIndex < teamMembers.length
                  ? basePersonIndex
                  : undefined
                : memberIndices[memberKey];
            const isPortrait = canShowPortrait && personIndex !== undefined;
            const person = teamMembers[personIndex ?? 0]!;
            const portrait = realTeamPortraits[person.slug];
            const patternIndex = Math.floor(slot / 2) + ringIndex * 8;
            return (
              <div
                key={slot}
                className="ta-guided-card"
                data-guided-card=""
                data-guided-ring={ring}
                data-guided-slot={slot}
                data-guided-count={slots.length}
                data-guided-member-key={canShowPortrait ? memberKey : undefined}
                data-guided-member={isPortrait ? person.slug : undefined}
                style={
                  {
                    "--guided-size":
                      sizes[slot % sizes.length]! *
                      (ringIndex === 0 ? 0.94 : 1),
                  } as CSSProperties
                }
              >
                <div className="ta-guided-tile">
                  {isPortrait ? (
                    portrait ? (
                      <RealTeamPortrait
                        slug={person.slug}
                        name={person.name}
                        sizes="180px"
                        className="ta-photo ta-guided-portrait"
                      />
                    ) : (
                      portraits[personIndex]
                    )
                  ) : (
                    <Pattern index={patternIndex} />
                  )}
                </div>
                <div className="ta-guided-caption">
                  <span>
                    {isPortrait ? person.name : disciplines[patternIndex]}
                  </span>
                  {isPortrait && <small>{person.role}</small>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div className="ta-guided-center">
        <p className="ta-eyebrow">Team Astra · Las personas de BinPar</p>
        <h1
          id="ta-guided-title"
          className="font-display"
          data-astra-heading
          tabIndex={-1}
        >
          Todo empieza
          <br />
          <span className="ta-guided-title-accent">con las personas.</span>
        </h1>
        <p className="ta-guided-description font-body">
          Distintas miradas. Una misma curiosidad. Trabajamos para acercar el
          conocimiento médico a quienes lo necesitan.
        </p>
        <div className="ta-guided-actions font-body">
          <Link href="/contacto" className="ta-guided-primary">
            Hablemos de tu idea{" "}
            <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </Link>
          <Link href="/" className="ta-guided-secondary">
            Conoce BinPar{" "}
            <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="ta-guided-bottom">
        <span>
          <i aria-hidden="true" />
          16 personas. Un mismo equipo.
        </span>
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          disabled={reducedMotion}
          aria-pressed={paused || reducedMotion}
          aria-label={
            reducedMotion
              ? "Movimiento reducido activado"
              : paused
                ? "Reanudar movimiento de las tarjetas"
                : "Pausar movimiento de las tarjetas"
          }
        >
          {paused || reducedMotion ? (
            <Play size={13} aria-hidden="true" />
          ) : (
            <Pause size={13} aria-hidden="true" />
          )}
          <span>
            {reducedMotion
              ? "Movimiento reducido"
              : paused
                ? "Reanudar"
                : "Pausar movimiento"}
          </span>
        </button>
      </div>
    </section>
  );
}

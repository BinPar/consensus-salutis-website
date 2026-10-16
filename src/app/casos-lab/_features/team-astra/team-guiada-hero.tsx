"use client";

import Link from "next/link";
import Image from "next/image";
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

const guidedPortraits: Readonly<Record<string, string>> = {
  "guillermo-hernandez": "/lab/team-astra/guiada/guillermo-hernandez.jpg",
  "jimmy-montano": "/lab/team-astra/guiada/jimmy-montano.jpg",
  "nicolas-arianoutsos": "/lab/team-astra/guiada/nicolas-arianoutsos.jpg",
  "yaiza-vallejo": "/lab/team-astra/guiada/yaiza-vallejo.jpg",
};

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
const innerPortraitSlots = [0, 2, 4, 5, 7, 9, 11, 12];
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
  const [memberIndices, setMemberIndices] = useState<Record<string, number>>(
    {},
  );
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
    // Each ring owns a shuffled bag. Exhaust it before reshuffling, and never
    // assign a person who is still present in another position on that ring.
    const bags = {
      inner: shuffledMemberIndices(),
      outer: shuffledMemberIndices(),
    };
    const assignments: Record<string, number> = {};
    const takeNextMember = (outer: boolean) => {
      const ring = outer ? "outer" : "inner";
      if (!bags[ring].length) bags[ring] = shuffledMemberIndices();
      const active = new Set(
        orbitCards
          .filter((item) => item.outer === outer && item.memberKey)
          .map((item) => assignments[item.memberKey!]),
      );
      const available = bags[ring].findIndex((index) => !active.has(index));
      return bags[ring].splice(available, 1)[0]!;
    };
    orbitCards.forEach(({ outer, memberKey }) => {
      if (memberKey) assignments[memberKey] = takeNextMember(outer);
    });
    setMemberIndices({ ...assignments });
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = preference.matches;
    let frame = 0;
    let previous = 0;
    let elapsed = 0;
    let phase = 0;
    const manual = {
      inner: { angle: 0, velocity: 0 },
      outer: { angle: 0, velocity: 0 },
    };
    let drag: {
      pointerId: number;
      ring: keyof typeof manual;
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
    let previousScroll = window.scrollY;
    setReducedMotion(reduced);

    function measureClearance() {
      // The entire upright card (including its caption) must fit between
      // tracks, even when the rings line up diagonally or a tile is hovered.
      let footprintWidth = 0;
      let footprintHeight = 0;
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
      const changedMembers: Record<string, number> = {};
      orbitCards.forEach((orbitCard) => {
        const { card, outer, slot, count, memberKey } = orbitCard;
        const radius = outer
          ? Math.max(innerRadius * 1.39, innerRadius + ringClearance)
          : innerRadius;
        const angle =
          (slot / count) * Math.PI * 2 +
          (outer ? 0.08 : Math.PI / count) +
          phase * (outer ? 1 / 10 : -1 / 12) +
          manual[outer ? "outer" : "inner"].angle;
        const rx = mobile ? width * 0.86 : radius;
        const ry = mobile ? height * 0.43 : radius;
        const spread = 0.9 + enter * 0.1;
        const x = Math.sin(angle) * rx * spread;
        const y = Math.cos(angle) * ry * spread;
        card.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
        if (memberKey) {
          // Recycle each portrait at the bottom of its orbit, under the fade.
          // Slot count, card dimensions, radii and angular spacing stay fixed.
          const turn = Math.floor(angle / (Math.PI * 2));
          if (turn !== orbitCard.turn) {
            orbitCard.turn = turn;
            assignments[memberKey] = takeNextMember(outer);
            changedMembers[memberKey] = assignments[memberKey]!;
          }
          const seamOpacity = Math.max(
            0,
            Math.min(1, (0.985 - Math.cos(angle)) / 0.065),
          );
          card.style.opacity = String(seamOpacity);
        }
      });
      if (Object.keys(changedMembers).length)
        setMemberIndices((previousMembers) => ({
          ...previousMembers,
          ...changedMembers,
        }));
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
      const target = pausedRef.current || hovered || drag ? 0 : 1;
      speed += (target - speed) * (1 - Math.exp(-dt * 8));
      if (pausedRef.current) speed = 0;
      impulse *= Math.exp(-dt * 5);
      phase += dt * speed * (1 + impulse);
      for (const [ring, motion] of Object.entries(manual)) {
        if (pausedRef.current || reduced) motion.velocity = 0;
        if (drag?.ring === ring) continue;
        const decay = Math.exp(-dt * 3.2);
        motion.angle += (motion.velocity * (1 - decay)) / 3.2;
        motion.velocity *= decay;
        if (Math.abs(motion.velocity) < 0.008) motion.velocity = 0;
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
      manual[ring].velocity = 0;
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
      const motion = manual[drag.ring];
      motion.angle += delta;
      const velocity = Math.max(-2.5, Math.min(2.5, delta / dt));
      motion.velocity += (velocity - motion.velocity) * 0.55;
      drag.angle = angle;
      drag.time = event.timeStamp;
      paint();
    }
    function endDrag(event?: PointerEvent) {
      if (!drag || (event && event.pointerId !== drag.pointerId)) return;
      const { pointerId, ring, time } = drag;
      if (
        event?.type !== "pointerup" ||
        reduced ||
        pausedRef.current ||
        event.timeStamp - time > 100
      )
        manual[ring].velocity = 0;
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
        manual.inner.velocity = manual.outer.velocity = 0;
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
      manual.inner.velocity = manual.outer.velocity = 0;
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
            // Eight portrait positions per ring cycle through the full team.
            const isPortrait =
              ringIndex === 0
                ? innerPortraitSlots.includes(slot)
                : slot % 2 === 1;
            const memberKey = `${ring}-${slot}`;
            const basePersonIndex =
              ringIndex === 0
                ? Math.max(0, innerPortraitSlots.indexOf(slot))
                : Math.floor(slot / 2) + 8;
            const personIndex = memberIndices[memberKey] ?? basePersonIndex;
            const person = teamMembers[personIndex]!;
            const portrait = guidedPortraits[person.slug];
            const patternIndex = Math.floor(slot / 2) + ringIndex * 8;
            return (
              <div
                key={slot}
                className="ta-guided-card"
                data-guided-card=""
                data-guided-ring={ring}
                data-guided-slot={slot}
                data-guided-count={slots.length}
                data-guided-member-key={isPortrait ? memberKey : undefined}
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
                      <Image
                        src={portrait}
                        alt={person.name}
                        width={1254}
                        height={1254}
                        sizes="180px"
                        className="ta-photo ta-guided-portrait"
                        style={{ objectFit: "cover" }}
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
        <h1 id="ta-guided-title" data-astra-heading tabIndex={-1}>
          Todo empieza
          <br />
          con las personas.
        </h1>
        <p className="ta-guided-description">
          Distintas miradas. Una misma curiosidad.
          <br className="ta-guided-desktop-break" /> Somos el equipo que
          convierte tus ideas
          <br className="ta-guided-desktop-break" /> en tecnología que importa.
        </p>
        <div className="ta-guided-actions">
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

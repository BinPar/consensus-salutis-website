"use client";

import { useEffect, useRef, useState } from "react";
import { teamMembers } from "./team-data";

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
export function useTeamOrbit(paused: boolean) {
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
      element.querySelectorAll<HTMLElement>("[data-team-orbit-card]"),
    );
    const orbitCards = cards.map((card) => ({
      card,
      outer: card.dataset.teamOrbitRing === "outer",
      slot: Number(card.dataset.teamOrbitSlot),
      count: Number(card.dataset.teamOrbitCount),
      memberKey: card.dataset.teamOrbitMemberKey,
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
    let hovered = false;
    let visible = false;
    let width = element.clientWidth;
    let height = element.clientHeight;
    let ringClearance = 0;
    let footprintWidth = 0;
    let footprintHeight = 0;
    let scrollDepth = 0;
    let targetScrollDepth = 0;
    const scrollFactor = 0.16;
    let exitProgress = 0;
    let targetExitProgress = 0;
    let orbitTail = 0;
    let exposedMembers = new Set<string>();
    const pendingRecycles = new Set<string>();
    setReducedMotion(reduced);

    function measureScrollDepth() {
      orbitTail =
        parseFloat(
          getComputedStyle(element!).getPropertyValue("--team-orbit-tail"),
        ) || 0;
      // Both sections stay in normal flow while the rings travel into the fade.
      const depth = Math.max(0, -element!.getBoundingClientRect().top);
      const maxOffset = width <= 600 ? 28 : 48;
      // Begin expanding before the hero is mostly out of view.
      const exit = Math.max(
        0,
        Math.min(1, (depth - height * 0.4) / (height * 0.6 + orbitTail)),
      );
      targetExitProgress = exit * exit * (3 - 2 * exit);
      // Ease into a small maximum displacement instead of pinning the orbit.
      targetScrollDepth =
        (maxOffset / scrollFactor) *
        (1 - Math.exp((-depth * scrollFactor) / maxOffset));
    }

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
        const caption = card.querySelector<HTMLElement>(
          "[data-team-orbit-caption]",
        );
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
        const rx = mobile ? width * 0.66 : radius;
        const ry = mobile ? height * 0.43 : radius;
        const spread = (0.8 + enter * 0.2) * (1 + exitProgress * 0.16);
        const x = Math.sin(angle) * rx * spread;
        // Both rings share a scroll offset so the spacing between them is kept.
        const y = Math.cos(angle) * ry * spread + scrollDepth * scrollFactor;
        // Scale the whole tile, including its portrait, as the orbit dissolves.
        card.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${(1 + exitProgress * 0.22).toFixed(4)})`;
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
            top > height + orbitTail + 32 ||
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
        "--team-orbit-reveal",
        String(reduced ? 1 : Math.min(elapsed / 0.7, 1) * (1 - exitProgress)),
      );
    }
    function tick(now: number) {
      frame = 0;
      const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 0;
      previous = now;
      elapsed += dt;
      if (reduced) {
        scrollDepth = 0;
        exitProgress = 0;
      } else if (!pausedRef.current && !drag) {
        scrollDepth +=
          (targetScrollDepth - scrollDepth) * (1 - Math.exp(-dt * 6));
        exitProgress +=
          (targetExitProgress - exitProgress) * (1 - Math.exp(-dt * 8));
      }
      const target = pausedRef.current || drag ? 0 : hovered ? 0.12 : 1;
      speed += (target - speed) * (1 - Math.exp(-dt * 5));
      if (pausedRef.current) speed = 0;
      phase += dt * speed;
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
      const y =
        event.clientY - rect.top - height / 2 - scrollDepth * scrollFactor;
      // Normalize the mobile ellipse so dragging follows the same orbit.
      return Math.atan2(
        width <= 600 ? x / (width * 0.66) : x,
        width <= 600 ? y / (height * 0.43) : y,
      );
    }
    function onPointerDown(event: PointerEvent) {
      if (!event.isPrimary || event.button !== 0 || drag) return;
      const card = (event.target as Element).closest<HTMLElement>(
        "[data-team-orbit-card]",
      );
      const ring = card?.dataset.teamOrbitRing;
      if (ring !== "inner" && ring !== "outer") return;
      event.preventDefault();
      drivingRing = ring;
      manual.velocity = 0;
      speed = 0;
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
      if ((event.target as Element).closest("[data-team-orbit-card]"))
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
      measureScrollDepth();
      measureClearance();
      paint();
    });
    const onPreference = () => {
      endDrag();
      manual.velocity = 0;
      reduced = preference.matches;
      if (reduced) {
        scrollDepth = 0;
        exitProgress = 0;
      }
      measureScrollDepth();
      setReducedMotion(reduced);
      resume();
    };
    const onScroll = () => {
      measureScrollDepth();
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
    measureScrollDepth();
    scrollDepth = reduced ? 0 : targetScrollDepth;
    exitProgress = reduced ? 0 : targetExitProgress;
    paint();
    // Continue animating while the extended rings are still on screen.
    observer.observe(element.parentElement!);
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

"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import "./team-prisma-scroll.css";

/** One real portrait, anchored in the roster and translated back to the CEO. */
export function PrismaScrollBridge({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const source = root.querySelector<HTMLElement>(".tn-prisma-profile-photo");
    const destination = root.querySelector<HTMLElement>(".p2-destination");
    const portrait = root.querySelector<HTMLElement>(".p2-travelling-portrait");
    const galleryIntro = root.querySelector<HTMLElement>(
      ".tn-prisma-gallery-aside",
    );
    if (!source || !destination || !portrait || !galleryIntro) return;

    const desktop = matchMedia("(min-width: 1101px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let disposed = false;
    let readingLine = 120;
    let geometryDirty = true;
    const duration = 440;
    let progress = 0;
    let target = 0;
    let previousTime: number | null = null;
    let holdUntil = 0;

    const paint = () => {
      frame = 0;
      if (disposed) return;
      const enabled = desktop.matches && !reduced.matches;
      root.classList.toggle("p2-motion", enabled);
      source.setAttribute("aria-hidden", String(enabled));
      if (!enabled) {
        progress = 0;
        target = 0;
        previousTime = null;
        holdUntil = 0;
        portrait.style.transform = "none";
        root.style.removeProperty("--p2-overlap");
        root.style.setProperty("--p2-progress", "1");
        root.dataset.arrived = "true";
        root.dataset.introVisible = "true";
        geometryDirty = true;
        return;
      }

      if (geometryDirty) {
        geometryDirty = false;
        const currentOverlap =
          Number.parseFloat(root.style.getPropertyValue("--p2-overlap")) || 0;
        const naturalDistance =
          destination.getBoundingClientRect().top -
          source.getBoundingClientRect().top +
          currentOverlap;
        root.style.setProperty(
          "--p2-overlap",
          `${Math.max(0, naturalDistance)}px`,
        );
        const toolbar =
          Number.parseFloat(
            getComputedStyle(root).getPropertyValue("--lab-toolbar-height"),
          ) || 80;
        readingLine = toolbar + Math.min(120, window.innerHeight * 0.15);
      }

      const from = source.getBoundingClientRect();
      const to = destination.getBoundingClientRect();
      // The same threshold selects the destination in both directions.
      // Time, not scroll distance, completes each journey. An interruption
      // reverses from the current position rather than restarting it.
      const now = performance.now();
      if (previousTime !== null) {
        const step =
          Math.max(0, now - Math.max(previousTime, holdUntil)) / duration;
        progress =
          target === 1
            ? Math.min(1, progress + step)
            : Math.max(0, progress - step);
      }
      const nextTarget = from.top <= readingLine ? 1 : 0;
      if (nextTarget !== target) {
        // Let the gallery fade out before the portrait crosses its heading.
        holdUntil =
          nextTarget === 0 &&
          (progress === 1 || root.dataset.introVisible === "true")
            ? now + 160
            : 0;
        target = nextTarget;
      }
      previousTime = now;
      const eased = progress * progress * (3 - 2 * progress);
      portrait.style.transform = `translateX(${(from.left - to.left) * (1 - eased)}px)`;
      const portraitLeft = from.left + (to.left - from.left) * eased;
      // Introduce the team copy as soon as its column is clear, before the
      // portrait arrives and triggers the photographs.
      root.dataset.introVisible =
        target === 1 &&
        portraitLeft >= galleryIntro.getBoundingClientRect().right + 8
          ? "true"
          : "false";
      root.style.setProperty("--p2-progress", progress.toFixed(4));
      root.dataset.arrived = target === 1 && progress >= 1 ? "true" : "false";
      root.dataset.phase =
        progress !== target
          ? target === 1
            ? "moving"
            : "returning"
          : target === 1
            ? "complete"
            : "ready";
      if (progress !== target) frame = requestAnimationFrame(paint);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const measure = () => {
      geometryDirty = true;
      schedule();
    };
    const focusGallery = (event: FocusEvent) => {
      const focusedElement = event.target;
      if (
        root.classList.contains("p2-motion") &&
        root.dataset.arrived !== "true" &&
        focusedElement instanceof HTMLElement &&
        focusedElement.matches(":focus-visible") &&
        focusedElement.closest(".tn-prisma-members")
      ) {
        window.scrollTo({
          top: Math.ceil(
            destination.getBoundingClientRect().top +
              window.scrollY -
              readingLine,
          ),
          behavior: "instant",
        });
        progress = 1;
        target = 1;
        previousTime = null;
        holdUntil = 0;
        schedule();
      }
    };
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    observer.observe(source);
    observer.observe(destination);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", measure);
    desktop.addEventListener("change", measure);
    reduced.addEventListener("change", measure);
    root.addEventListener("focusin", focusGallery);
    void document.fonts.ready.then(() => {
      if (!disposed) measure();
    });
    paint();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", measure);
      desktop.removeEventListener("change", measure);
      reduced.removeEventListener("change", measure);
      root.removeEventListener("focusin", focusGallery);
    };
  }, []);

  return (
    <div ref={ref} className="p2-bridge">
      {children}
    </div>
  );
}

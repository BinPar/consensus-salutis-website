"use client";

import { useLayoutEffect, useRef } from "react";
import { binparIsotypeOutline } from "./brand-isotype-reveal";

const seed = (n: number) => {
  const value = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
};

export function BrandIsotypeParticles({ running }: { running: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const logo = useRef<SVGSVGElement>(null);
  const elapsed = useRef(0);

  useLayoutEffect(() => {
    const element = canvas.current;
    const mark = logo.current;
    const scene = element?.closest<HTMLElement>("[data-home-proposal]");
    const holder = element?.parentElement;
    const ctx = element?.getContext("2d");
    if (!element || !mark || !scene || !holder || !ctx) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Share the SVG's animation clock, including pauses, so it cannot appear
    // before particles arrive when rendering slows down or the view resumes.
    const assembly = mark
      .getAnimations()
      .find(
        (animation) =>
          (animation as CSSAnimation).animationName === "aura-isotype-fill",
      );
    const silhouette = new Path2D(binparIsotypeOutline);
    // Keep silhouette sampling independent from the display canvas's DPR
    // transform, which survives effect restarts when visibility changes.
    const sample = document.createElement("canvas").getContext("2d");
    if (!sample) return;
    const particles: { u: number; v: number; index: number }[] = [];
    // Irregular destinations avoid a dotted lattice while preserving the
    // exact silhouette and both negative channels. Keep dots from piling up.
    for (
      let attempt = 0;
      attempt < 20000 && particles.length < 251;
      attempt++
    ) {
      const u = seed(attempt * 2 + 701) * 121.76;
      const v = seed(attempt * 2 + 702) * 131.79;
      if (!sample.isPointInPath(silhouette, u, v)) continue;
      if (particles.some((p) => Math.hypot(p.u - u, p.v - v) < 3)) continue;
      particles.push({ u, v, index: particles.length });
    }
    let width = 0,
      height = 0,
      ratio = 1,
      frame = 0,
      last = 0;
    let anchor = { x: 0, y: 0, width: 56, height: 60 };
    const draw = () => {
      if (typeof assembly?.currentTime === "number") {
        elapsed.current = assembly.currentTime / 1000;
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      if (preference.matches || elapsed.current >= 1.95) return;
      const t = elapsed.current;
      const dark = document.documentElement.classList.contains("dark");
      for (const { u, v, index } of particles) {
        const start = 0.12 + seed(index + 13) * 0.24;
        const duration = 0.95 + seed(index + 53) * 0.25;
        const progress = Math.max(0, Math.min(1, (t - start) / duration));
        const ease = progress * progress * (3 - 2 * progress);
        const centerX = anchor.x + anchor.width / 2;
        const centerY = anchor.y + anchor.height / 2;
        const angle = seed(index + 101) * Math.PI * 2;
        const radius =
          Math.sqrt(-2 * Math.log(Math.max(seed(index + 181), 0.002))) * 0.48;
        const twist =
          Math.sin(progress * Math.PI) * (seed(index + 233) - 0.5) * 1.25;
        const fromX =
          centerX +
          Math.cos(angle + twist) * radius * Math.min(width * 0.24, 200);
        const fromY =
          centerY +
          Math.sin(angle + twist) * radius * Math.min(height * 0.16, 135);
        const targetX = anchor.x + (u / 121.76) * anchor.width;
        const targetY = anchor.y + (v / 131.79) * anchor.height;
        const floatX = Math.sin(t * 0.85 + index) * 4;
        const floatY = Math.cos(t * 0.65 + index * 0.7) * 3;
        const x = fromX * (1 - ease) + targetX * ease + floatX * (1 - ease);
        const y = fromY * (1 - ease) + targetY * ease + floatY * (1 - ease);
        const fadeIn = Math.max(
          0,
          Math.min(1, (t - seed(index + 271) * 0.12) / 0.18),
        );
        const fadeOut = 1 - Math.max(0, Math.min(1, (t - 1.7) / 0.25));
        ctx.globalAlpha =
          fadeIn * fadeOut * (0.4 + seed(index + 17) * 0.3 + ease * 0.2);
        ctx.fillStyle = dark ? "#00bcbb" : "#006f7b";
        ctx.beginPath();
        ctx.arc(x, y, 0.7 + seed(index + 3) * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    const resize = () => {
      const bounds = scene.getBoundingClientRect();
      const parent = holder.getBoundingClientRect();
      const target = mark.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.style.left = `${bounds.left - parent.left - holder.clientLeft}px`;
      element.style.top = `${bounds.top - parent.top - holder.clientTop}px`;
      element.style.width = `${width}px`;
      element.style.height = `${height}px`;
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      anchor = {
        x: target.left - bounds.left,
        y: target.top - bounds.top,
        width: target.width,
        height: target.height,
      };
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(scene);
    observer.observe(holder);
    resize();
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    preference.addEventListener("change", draw);
    if (running && !preference.matches && elapsed.current < 1.95) {
      const tick = (now: number) => {
        if (!last || now - last >= 30) {
          elapsed.current += last ? Math.min((now - last) / 1000, 0.1) : 0;
          last = now;
          draw();
        }
        if (elapsed.current < 1.95) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
      preference.removeEventListener("change", draw);
    };
  }, [running]);

  return (
    <>
      <canvas
        ref={canvas}
        className="brand-particle-field"
        aria-hidden="true"
      />
      <svg
        ref={logo}
        className="brand-particle-final"
        viewBox="0 0 121.76 131.79"
        aria-hidden="true"
        focusable="false"
      >
        <path d={binparIsotypeOutline} fill="currentColor" />
      </svg>
    </>
  );
}

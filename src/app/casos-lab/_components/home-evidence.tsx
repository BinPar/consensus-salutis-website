"use client";

import { useEffect, useRef, type RefObject } from "react";

// Deterministic source fragments travelling through a spatial citation field.
const fragments = Array.from({ length: 1600 }, (_, i) => {
  const hash = (n: number) => {
    const v = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    u: hash(i + 1),
    v: hash(i + 4000),
    z: hash(i + 8000),
    size: 1 + hash(i + 12000) * 2.5,
    source: i % 3,
  };
});
export function HomeEvidence({
  running,
  pointer,
}: {
  running: boolean;
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const position = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const element = canvas.current,
      ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    let width = 0,
      height = 0,
      frame = 0,
      last = 0;
    const draw = () => {
      if (!width || !height) return;
      const dark = document.documentElement.classList.contains("dark");
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const t = time.current,
        p = position.current;
      const scale = Math.min(width / 1440, height / 820);
      const centerX = width / 2,
        centerY = height * 0.49;
      // Two continuous brackets of fragments surround a clear reading space.
      const horizontal = width < 768 ? width * 0.49 : width * 0.43;
      const vertical = height * 0.46;
      const glow = ctx.createRadialGradient(
        centerX,
        centerY,
        width * 0.19,
        centerX,
        centerY,
        width * 0.64,
      );
      glow.addColorStop(0, dark ? "rgba(0,188,187,0)" : "rgba(0,109,121,0)");
      glow.addColorStop(
        0.75,
        dark ? "rgba(0,188,187,.055)" : "rgba(0,109,121,.045)",
      );
      glow.addColorStop(1, "rgba(0,109,121,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
      fragments.forEach((fragment, i) => {
        const a = fragment.u * Math.PI * 2 + t * 0.026;
        const thickness = (fragment.v - 0.5) * 150 * scale;
        const radiusX = horizontal + thickness;
        const radiusY = vertical + thickness * 0.45;
        const warp = 1 + Math.sin(a * 3 + t * 0.08) * 0.09;
        const x =
          centerX +
          Math.cos(a) * radiusX * warp +
          Math.sin(a * 2 + t * 0.12) * 18 * scale +
          p.x * (fragment.z - 0.5) * 28;
        const y =
          centerY +
          Math.sin(a) * radiusY +
          Math.cos(a * 3 - t * 0.1) * 22 * scale +
          p.y * (fragment.z - 0.5) * 24;
        const depth = 0.35 + fragment.z * 0.65;
        const active = (i + Math.floor(t * 11)) % 91 < 5;
        const opacity = active ? 0.95 : 0.12 + depth * 0.48;
        ctx.fillStyle = dark
          ? `rgba(${active ? "155,255,242" : "0,188,187"},${opacity})`
          : `rgba(${fragment.source === 1 ? "5,33,94" : "0,109,121"},${opacity})`;
        const size = fragment.size * depth * Math.max(0.7, scale);
        ctx.fillRect(x, y, active ? size * 4 : size, size);
        if (i % 67 === 0) {
          ctx.font = `${Math.max(9, 11 * scale)}px monospace`;
          ctx.fillText(`[${fragment.source + 1}]`, x + 8, y + 3);
        }
      });
      // Four large crop marks anchor the cloud to the site's precision graphics.
      const ink = dark ? "rgba(0,188,187,.42)" : "rgba(0,109,121,.32)";
      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.2;
      const inset = width < 768 ? 18 : 72;
      [
        [inset, 110, 1, 1],
        [width - inset, 110, -1, 1],
        [inset, height - 100, 1, -1],
        [width - inset, height - 100, -1, -1],
      ].forEach(([x, y, dx, dy]) => {
        ctx.beginPath();
        ctx.moveTo(x! + dx! * 24, y!);
        ctx.lineTo(x!, y!);
        ctx.lineTo(x!, y! + dy! * 24);
        ctx.stroke();
      });
    };
    const resize = () => {
      const r = element.getBoundingClientRect();
      width = r.width;
      height = r.height;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      element.width = Math.round(width * ratio);
      element.height = Math.round(height * ratio);
      draw();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    if (running) {
      const tick = (now: number) => {
        if (!last || now - last >= 32) {
          time.current += last ? Math.min((now - last) / 1000, 0.1) : 0;
          last = now;
          position.current.x += (pointer.current.x - position.current.x) * 0.06;
          position.current.y += (pointer.current.y - position.current.y) * 0.06;
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      theme.disconnect();
    };
  }, [running, pointer]);
  return (
    <canvas ref={canvas} className="home-evidence-field" aria-hidden="true" />
  );
}

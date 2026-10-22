"use client";

import { useEffect, useRef, type RefObject } from "react";

import type { HomeDirection } from "./home-directions";
import { createIsotypePrism } from "./home-isotype-prism";

type Pointer = { x: number; y: number };
const tau = Math.PI * 2;

// Prisma and its isotype study share the same scene lifecycle.
export function HomeCoverField({
  direction,
  running,
  pointer,
}: {
  direction: HomeDirection;
  running: boolean;
  pointer: RefObject<Pointer>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const smoothPointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d", { alpha: true });
    if (!element || !ctx) return;
    const isotype =
      direction === "prism-isotype" ||
      direction === "prism-center" ||
      direction === "prism-field"
        ? createIsotypePrism(direction !== "prism-isotype")
        : null;
    let width = 0,
      height = 0,
      frame = 0,
      previous = 0;
    const draw = () => {
      if (!width || !height) return;
      const dark = document.documentElement.classList.contains("dark");
      const mobile = width < 768;
      const scale = mobile
        ? width / 600
        : Math.max(width / 1440, height / 1000);
      const w = width / scale,
        h = height / scale,
        t = time.current,
        p = smoothPointer.current;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.scale(scale, scale);
      const ink = dark ? "104,250,239" : "0,104,126";
      const line = (opacity: number) => `rgba(${ink},${opacity})`;
      ctx.lineWidth = 0.8;

      if (direction === "architecture") {
        const cx = mobile ? w * 0.54 : w * 0.76,
          cy = mobile ? h * 0.72 : h * 0.5;
        const radius = mobile ? 300 : Math.min(w * 0.35, h * 0.52);
        ctx.lineWidth = 0.85;
        for (let i = 0; i < 74; i++) {
          const r = radius * (0.15 + i / 82);
          ctx.beginPath();
          for (let n = 0; n <= 240; n++) {
            const a = (n / 240) * tau;
            const warp =
              1 +
              0.13 * Math.sin(a * 3 + t * 0.13 + i * 0.045) +
              0.07 * Math.cos(a * 5 - t * 0.1);
            const xx = Math.cos(a) * r * warp;
            const yy = Math.sin(a) * r * warp;
            const skew = Math.sin(t * 0.09) * 0.25 + p.x * 0.12;
            const x = cx + xx + yy * skew,
              y =
                cy +
                yy * 0.84 +
                Math.sin((xx / r) * 3 + t * 0.11) * 18 +
                p.y * 12;
            if (n === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = line(
            0.12 + (Math.sin(i * 0.15 - t * 0.16) + 1) * 0.13,
          );
          ctx.stroke();
        }
        for (let i = 0; i < 5; i++) {
          const a = t * 0.055 + (i * tau) / 5;
          const x = cx + Math.cos(a) * radius * 0.72,
            y = cy + Math.sin(a) * radius * 0.6;
          ctx.fillStyle = line(0.7);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, tau);
          ctx.fill();
        }
      } else if (isotype) {
        isotype(ctx, w, h, t, p, dark, mobile);
      } else {
        drawPrism(ctx, w, h, t, p, dark, mobile);
      }
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
    const themeObserver = new MutationObserver(draw);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    if (running) {
      const tick = (now: number) => {
        if (!previous || now - previous >= 32) {
          const dt = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
          previous = now;
          time.current += dt;
          const p = smoothPointer.current;
          p.x += (pointer.current.x - p.x) * 0.06;
          p.y += (pointer.current.y - p.y) * 0.06;
          draw();
        }
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      themeObserver.disconnect();
    };
  }, [direction, running, pointer]);
  return (
    <canvas ref={canvas} aria-hidden="true" className="home-cover-field" />
  );
}

type Point3 = [number, number, number];
function drawPrism(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  p: Pointer,
  dark: boolean,
  mobile: boolean,
) {
  const ink = dark ? "104,250,239" : "0,104,126";
  const line = (a: number) => `rgba(${ink},${a})`;
  const cx = mobile ? w * 0.52 : w * 0.75,
    cy = mobile ? h * 0.72 : h * 0.51;
  const radius = mobile ? 270 : Math.min(w * 0.32, h * 0.43);
  const rotate = ([x, y, z]: Point3, ay: number, ax: number): Point3 => {
    const xx = x * Math.cos(ay) - z * Math.sin(ay),
      zz = x * Math.sin(ay) + z * Math.cos(ay);
    return [
      xx,
      y * Math.cos(ax) - zz * Math.sin(ax),
      y * Math.sin(ax) + zz * Math.cos(ax),
    ];
  };
  {
    const angle = 0.48 + Math.sin(t * 0.09) * 0.45 + p.x * 0.15,
      tilt = 0.48 + Math.sin(t * 0.07) * 0.15 + p.y * 0.12;
    const ring = (r: number, z: number) =>
      Array.from(
        { length: 6 },
        (_, i): Point3 => [
          Math.cos((i * tau) / 6 - Math.PI / 6) * r,
          Math.sin((i * tau) / 6 - Math.PI / 6) * r,
          z,
        ],
      );
    const front = ring(radius * 0.88, 55),
      inside = ring(radius * 0.48, 55),
      back = ring(radius * 0.88, -55),
      innerBack = ring(radius * 0.48, -55);
    const faces: Point3[][] = [];
    for (let i = 0; i < 6; i++) {
      const j = (i + 1) % 6;
      faces.push(
        [front[i]!, front[j]!, inside[j]!, inside[i]!],
        [back[j]!, back[i]!, innerBack[i]!, innerBack[j]!],
        [front[j]!, front[i]!, back[i]!, back[j]!],
        [inside[i]!, inside[j]!, innerBack[j]!, innerBack[i]!],
      );
    }
    const projected = faces
      .map((face) => {
        const v = face.map((point) => rotate(point, angle, tilt));
        const a = v[0]!,
          b = v[1]!,
          c = v[2]!;
        const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]],
          q = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        const normal = [
          u[1]! * q[2]! - u[2]! * q[1]!,
          u[2]! * q[0]! - u[0]! * q[2]!,
          u[0]! * q[1]! - u[1]! * q[0]!,
        ];
        const length = Math.hypot(...normal) || 1;
        const light = Math.max(
          0.12,
          (normal[0]! * 0.3 - normal[1]! * 0.55 + Math.abs(normal[2]!) * 0.65) /
            length,
        );
        return { v, z: v.reduce((sum, p) => sum + p[2], 0) / 4, light };
      })
      .sort((a, b) => a.z - b.z);
    for (const face of projected) {
      const light = face.light;
      const base = dark ? [8, 52, 67] : [16, 80, 100],
        bright = dark ? [103, 228, 211] : [175, 225, 222];
      const color = base.map((c, i) =>
        Math.round(c + (bright[i]! - c) * light),
      );
      const grad = ctx.createLinearGradient(
        cx - radius,
        cy - radius,
        cx + radius,
        cy + radius,
      );
      grad.addColorStop(
        0,
        `rgb(${color.map((c) => Math.min(255, c + 15)).join(",")})`,
      );
      grad.addColorStop(1, `rgb(${color.join(",")})`);
      ctx.fillStyle = grad;
      ctx.strokeStyle = line(0.16);
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      face.v.forEach(([x, y], i) => {
        if (!i) ctx.moveTo(cx + x, cy + y);
        else ctx.lineTo(cx + x, cy + y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }
}

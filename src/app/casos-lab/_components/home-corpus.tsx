"use client";

import { useEffect, useRef, type RefObject } from "react";

type Point = [number, number, number];
type Block = { center: Point; size: number; family: number; id: number };
const blocks: Block[] = [];
// A deliberately carved volume, rather than a uniform lattice or layer stack.
for (let x = 0; x < 3; x++) {
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      if ((x === 0 && y === 0) || (x === 2 && y === 2 && z === 2)) continue;
      const center: Point = [(x - 1) * 104, (y - 1) * 104, (z - 1) * 104];
      const family = (x + z) % 3;
      if ((x + y + z) % 3 === 0) {
        for (let n = 0; n < 8; n++) {
          blocks.push({
            center: [
              center[0] + (n & 1 ? 25 : -25),
              center[1] + (n & 2 ? 25 : -25),
              center[2] + (n & 4 ? 25 : -25),
            ],
            size: 45,
            family,
            id: blocks.length,
          });
        }
      } else blocks.push({ center, size: 94, family, id: blocks.length });
    }
  }
}
const faces = [
  [0, 1, 3, 2],
  [4, 6, 7, 5],
  [0, 4, 5, 1],
  [2, 3, 7, 6],
  [0, 2, 6, 4],
  [1, 5, 7, 3],
];
faces.forEach((face) => face.reverse());
const vertices = Array.from(
  { length: 8 },
  (_, n): Point => [n & 1 ? 1 : -1, n & 2 ? 1 : -1, n & 4 ? 1 : -1],
);

export function HomeCorpus({
  running,
  pointer,
}: {
  running: boolean;
  pointer: RefObject<{ x: number; y: number }>;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const time = useRef(0);
  const camera = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
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
      const scale = Math.min(width / 570, height / 560);
      const cx = width * 0.5,
        cy = height * 0.49;
      const t = time.current;
      const phase = (t % 24) / 24;
      const opening = Math.pow(Math.sin(phase * Math.PI), 2) * 34;
      const ay =
        -0.64 + Math.sin((t * Math.PI) / 48) * 0.12 + camera.current.x * 0.16;
      const ax = -0.4 + camera.current.y * 0.1;
      const rotate = ([x, y, z]: Point): Point => {
        const xx = x * Math.cos(ay) + z * Math.sin(ay);
        const zz = -x * Math.sin(ay) + z * Math.cos(ay);
        return [
          xx,
          y * Math.cos(ax) - zz * Math.sin(ax),
          y * Math.sin(ax) + zz * Math.cos(ax),
        ];
      };
      const project = ([x, y]: Point) => [cx + x * scale, cy + y * scale];
      const active = Math.floor(phase * 3);
      const painted: {
        points: Point[];
        depth: number;
        family: number;
        shade: number;
        id: number;
      }[] = [];
      blocks.forEach((block) => {
        const spread = 1 + opening / 160;
        const points = vertices.map((v) =>
          rotate(
            v.map(
              (a, i) => (a * block.size) / 2 + block.center[i]! * spread,
            ) as Point,
          ),
        );
        faces.forEach((indices) => {
          const p = indices.map((i) => points[i]!);
          const a = p[0]!,
            b = p[1]!,
            c = p[2]!;
          const u = b.map((v, i) => v - a[i]!);
          const v = c.map((n, i) => n - a[i]!);
          const normal = [
            u[1]! * v[2]! - u[2]! * v[1]!,
            u[2]! * v[0]! - u[0]! * v[2]!,
            u[0]! * v[1]! - u[1]! * v[0]!,
          ];
          if (normal[2]! < 0) return;
          const length = Math.hypot(...normal);
          const shade =
            0.4 +
            0.6 *
              Math.max(
                0,
                (normal[0]! * -0.35 + normal[1]! * -0.65 + normal[2]! * 0.68) /
                  length,
              );
          painted.push({
            points: p,
            depth: p.reduce((s, v) => s + v[2], 0) / 4,
            family: block.family,
            shade,
            id: block.id,
          });
        });
      });
      const shadow = ctx.createRadialGradient(
        cx,
        height * 0.86,
        0,
        cx,
        height * 0.86,
        width * 0.34,
      );
      shadow.addColorStop(0, dark ? "rgba(0,188,187,.09)" : "rgba(5,33,94,.1)");
      shadow.addColorStop(1, "rgba(5,33,94,0)");
      ctx.save();
      ctx.translate(0, height * 0.86);
      ctx.scale(1, 0.24);
      ctx.translate(0, -height * 0.86);
      ctx.fillStyle = shadow;
      ctx.fillRect(0, 0, width, height * 4);
      ctx.restore();
      painted
        .sort((a, b) => a.depth - b.depth)
        .forEach((face) => {
          const selected = face.family === active;
          const palettes = dark
            ? [
                [29, 101, 119],
                [13, 46, 73],
                [40, 83, 99],
              ]
            : [
                [19, 126, 139],
                [21, 54, 106],
                [160, 204, 214],
              ];
          const base = palettes[face.family]!;
          const color = base.map((n) =>
            Math.round(n * face.shade + (selected ? 17 : 0)),
          );
          const gradient = ctx.createLinearGradient(
            cx - 200 * scale,
            cy - 200 * scale,
            cx + 200 * scale,
            cy + 200 * scale,
          );
          gradient.addColorStop(
            0,
            `rgb(${color.map((n) => Math.min(255, n + 22)).join(",")})`,
          );
          gradient.addColorStop(1, `rgb(${color.join(",")})`);
          ctx.beginPath();
          face.points.forEach((point, i) => {
            const [x, y] = project(point);
            if (i === 0) ctx.moveTo(x!, y!);
            else ctx.lineTo(x!, y!);
          });
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.strokeStyle = dark
            ? "rgba(144,255,244,.2)"
            : "rgba(235,251,255,.34)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
          // A source identifier and a travelling scan stay attached to their face.
          if (face.points.length === 4 && face.id % 5 === 0 && selected) {
            const a = face.points[0]!,
              b = face.points[1]!,
              d = face.points[3]!;
            const fraction = 0.2 + ((phase * 3) % 1) * 0.6;
            const lerp = (u: Point, v: Point, f: number): Point =>
              u.map((n, i) => n + (v[i]! - n) * f) as Point;
            const start = project(lerp(a, d, fraction));
            const end = project(lerp(b, face.points[2]!, fraction));
            ctx.beginPath();
            ctx.moveTo(start[0]!, start[1]!);
            ctx.lineTo(end[0]!, end[1]!);
            ctx.strokeStyle = dark
              ? "rgba(139,255,237,.85)"
              : "rgba(213,255,248,.85)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });
    };
    const resize = () => {
      const bounds = element.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
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
          camera.current.x += (pointer.current.x - camera.current.x) * 0.06;
          camera.current.y += (pointer.current.y - camera.current.y) * 0.06;
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
    <div className="home-corpus-scene" aria-hidden="true">
      <canvas ref={canvas} />
    </div>
  );
}

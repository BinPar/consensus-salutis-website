import { refinedCoverGeometry } from "./refined-geometry";

function organicPath(
  next: () => number,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rotation: number,
) {
  const count = 6 + Math.floor(next() * 3);
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    const jitter = 0.8 + next() * 0.4;
    const px = Math.cos(angle) * rx * jitter;
    const py = Math.sin(angle) * ry * jitter;
    return {
      x: x + px * Math.cos(rotation) - py * Math.sin(rotation),
      y: y + px * Math.sin(rotation) + py * Math.cos(rotation),
    };
  });
  const n = (value: number) => Math.round(value * 10) / 10;
  const curves = nodes.map((point, i) => {
    const before = nodes[(i - 1 + count) % count]!;
    const after = nodes[(i + 1) % count]!;
    const following = nodes[(i + 2) % count]!;
    return `C${n(point.x + (after.x - before.x) * 0.22)} ${n(point.y + (after.y - before.y) * 0.22)} ${n(after.x - (following.x - point.x) * 0.22)} ${n(after.y - (following.y - point.y) * 0.22)} ${n(after.x)} ${n(after.y)}`;
  });
  return `M${n(nodes[0]!.x)} ${n(nodes[0]!.y)} ${curves.join(" ")} Z`;
}

// Independent geometry; reuse only the original seed, light direction and
// refined signal curves. Never alter Afinada's geometry or renderer.
export function refinedTwoGeometry(slug: string) {
  const original = refinedCoverGeometry(slug);
  let state = original.seed ^ 0x7f4a7c15;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  const count = 1 + ((original.seed >>> 8) % 4);
  const phase = next() * Math.PI * 2;
  const shapes = Array.from({ length: count - 1 }, (_, i) => {
    const angle = phase + (i / Math.max(1, count - 1)) * Math.PI * 2;
    const x = 800 + Math.cos(angle) * (360 + next() * 130);
    const y = 350 + Math.sin(angle) * (160 + next() * 60);
    return {
      path: organicPath(
        next,
        x,
        y,
        210 + next() * 170,
        120 + next() * 130,
        (next() - 0.5) * 0.9,
      ),
      opacity: 0.4 + next() * 0.2,
      primary: false,
    };
  });
  shapes.push({
    path: organicPath(
      next,
      690 + next() * 220,
      300 + next() * 100,
      count === 1 ? 430 + next() * 140 : 290 + next() * 150,
      190 + next() * 90,
      (next() - 0.5) * 1.1,
    ),
    opacity: 0.85,
    primary: true,
  });
  return {
    seed: original.seed,
    tilt: original.tilt,
    signals: original.signals,
    shapes,
  };
}

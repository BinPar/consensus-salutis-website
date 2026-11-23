import { blogCoverGeometry } from "~/lib/blog-cover";

// Keep the original shapes and curve endpoints. Only align the two tangents at
// each curve's join, which currently creates a visible corner in production.
export function softenSignal(path: string) {
  const points = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number);
  if (points?.length !== 14) return path;
  const [sx, sy, ax, ay, bx, by, jx, jy, cx, cy, dx, dy, ex, ey] = points as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const directionX = cx - bx;
  const directionY = cy - by;
  const length = Math.hypot(directionX, directionY);
  if (length === 0) return path;
  const before = Math.hypot(jx - bx, jy - by);
  const after = Math.hypot(cx - jx, cy - jy);
  const x = directionX / length;
  const y = directionY / length;
  const n = (value: number) => Number(value.toFixed(3));
  return `M${sx} ${sy} C${ax} ${ay} ${n(jx - x * before)} ${n(jy - y * before)} ${jx} ${jy} C${n(jx + x * after)} ${n(jy + y * after)} ${dx} ${dy} ${ex} ${ey}`;
}

export function refinedCoverGeometry(slug: string) {
  const original = blogCoverGeometry(slug);
  return {
    ...original,
    signals: original.signals.map((signal) => ({
      ...signal,
      path: softenSignal(signal.path),
    })),
  };
}

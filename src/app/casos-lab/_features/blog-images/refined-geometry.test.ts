import { describe, expect, it } from "vitest";
import { blogCoverGeometry } from "~/lib/blog-cover";
import { refinedCoverGeometry, softenSignal } from "./refined-geometry";
import { parseBlogImagesDirection } from "./blog-images-directions";

const slugs = [
  ...Array.from({ length: 24 }, (_, i) => `articulo-${i}`),
  "",
  "áé漢字🩺",
  "a".repeat(200),
];
const coordinates = (path: string) =>
  path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);

describe("refinement of the production cover, isolated in the lab", () => {
  it("preserves the original shapes, seed, lighting direction and curve endpoints", () => {
    for (const slug of slugs) {
      const original = blogCoverGeometry(slug);
      const refined = refinedCoverGeometry(slug);
      expect(refined.mainBlob).toBe(original.mainBlob);
      expect(refined.offsetBlob).toBe(original.offsetBlob);
      expect(refined.seed).toBe(original.seed);
      expect(refined.tilt).toBe(original.tilt);
      refined.signals.forEach((signal, index) => {
        const before = coordinates(original.signals[index]!.path);
        const after = coordinates(signal.path);
        for (const coordinate of [0, 1, 2, 3, 6, 7, 10, 11, 12, 13])
          expect(after[coordinate]).toBe(before[coordinate]);
        expect(after.every(Number.isFinite)).toBe(true);
      });
    }
  });

  it("removes corners where the two original cubic curves meet", () => {
    for (const slug of slugs) {
      for (const signal of refinedCoverGeometry(slug).signals) {
        const p = coordinates(signal.path);
        const incoming = [p[6]! - p[4]!, p[7]! - p[5]!];
        const outgoing = [p[8]! - p[6]!, p[9]! - p[7]!];
        const dot = incoming[0]! * outgoing[0]! + incoming[1]! * outgoing[1]!;
        const length = Math.hypot(...incoming) * Math.hypot(...outgoing);
        expect(dot / length).toBeCloseTo(1, 8);
      }
    }
  });

  it("is deterministic, keeps input geometry unchanged, and retires only the rejected URLs", () => {
    const before = blogCoverGeometry("prueba");
    const first = refinedCoverGeometry("prueba");
    for (const slug of slugs) refinedCoverGeometry(slug);
    expect(refinedCoverGeometry("prueba")).toEqual(first);
    expect(blogCoverGeometry("prueba")).toEqual(before);
    expect(softenSignal("M0 0")).toBe("M0 0");
    for (const removed of ["raster", "modules", "scan"])
      expect(parseBlogImagesDirection(removed)).toBe("compare");
    for (const retained of [
      "light",
      "flow",
      "veil",
      "interference",
      "strata",
      "refraction",
    ] as const)
      expect(parseBlogImagesDirection(retained)).toBe(retained);
    expect(parseBlogImagesDirection("refined")).toBe("refined");
  });
});

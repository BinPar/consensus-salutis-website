import { describe, expect, it } from "vitest";
import { refinedCoverGeometry } from "./refined-geometry";
import { refinedTwoGeometry } from "./refined-two-geometry";
import { parseBlogImagesDirection } from "./blog-images-directions";

const slugs = [
  ...Array.from({ length: 32 }, (_, i) => `articulo-${i}`),
  "",
  "áé漢字🩺",
  "a".repeat(200),
];

describe("Afinada 2, independent from Afinada", () => {
  it("varies the number and geometry of shapes while remaining deterministic", () => {
    const first = slugs.map(refinedTwoGeometry);
    expect(new Set(first.map((item) => item.shapes.length))).toEqual(
      new Set([1, 2, 3, 4]),
    );
    expect(new Set(first.map((item) => JSON.stringify(item.shapes))).size).toBe(
      slugs.length,
    );
    for (const slug of [...slugs].reverse()) refinedTwoGeometry(slug);
    expect(slugs.map(refinedTwoGeometry)).toEqual(first);
  });

  it("keeps bounded organic paths and one central main shape", () => {
    for (const slug of slugs) {
      const geometry = refinedTwoGeometry(slug);
      expect(geometry.shapes.length).toBeGreaterThanOrEqual(1);
      expect(geometry.shapes.length).toBeLessThanOrEqual(4);
      expect(geometry.shapes.filter((shape) => shape.primary)).toHaveLength(1);
      expect(geometry.shapes.at(-1)?.primary).toBe(true);
      for (const shape of geometry.shapes) {
        expect(shape.path).toMatch(/^M.+ Z$/);
        const coordinates = shape.path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        expect(
          coordinates.every(
            (value) => Number.isFinite(value) && Math.abs(value) < 2500,
          ),
        ).toBe(true);
      }
    }
  });

  it("reuses refined signal curves and preserves the existing Afinada", () => {
    const before = refinedCoverGeometry("prueba");
    const second = refinedTwoGeometry("prueba");
    expect(second.signals).toEqual(before.signals);
    expect(second.tilt).toBe(before.tilt);
    expect(refinedCoverGeometry("prueba")).toEqual(before);
    expect(parseBlogImagesDirection("refined")).toBe("refined");
    expect(parseBlogImagesDirection("refined-2")).toBe("refined-2");
  });
});

import { describe, expect, it } from "vitest";
import { signatureGeometry } from "./signature-geometry";
import { parseBlogImagesDirection } from "./blog-images-directions";

const slugs = [
  ...Array.from({ length: 24 }, (_, i) => `articulo-${i}`),
  "",
  "áé漢字🩺",
  "a".repeat(200),
];

describe("additional signature covers", () => {
  it("keeps compositions stable independently of generation order", () => {
    const before = slugs.map(signatureGeometry);
    for (const slug of [...slugs].reverse()) signatureGeometry(slug);
    expect(slugs.map(signatureGeometry)).toEqual(before);
    for (const key of ["aurora", "upper", "nacre"] as const)
      expect(new Set(before.map((item) => item[key])).size).toBe(slugs.length);
  });

  it("keeps surfaces and lighting parameters finite and bounded", () => {
    for (const slug of slugs) {
      const geometry = signatureGeometry(slug);
      expect(JSON.stringify(geometry)).not.toMatch(/NaN|Infinity|undefined/);
      for (const path of [geometry.aurora, geometry.upper, geometry.nacre]) {
        const coordinates = path.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
        expect(
          coordinates.every(
            (value) => Number.isFinite(value) && Math.abs(value) < 3000,
          ),
        ).toBe(true);
        expect(path).toMatch(/^M .+ Z$/);
      }
      expect(
        geometry.fields.every((field) => field.rx > 0 && field.ry > 0),
      ).toBe(true);
    }
  });

  it("adds three routes without removing retained variants or reviving rejected ones", () => {
    for (const retained of [
      "light",
      "flow",
      "veil",
      "interference",
      "strata",
      "refraction",
      "refined",
      "aurora",
      "threshold",
      "nacre",
      "new",
    ] as const)
      expect(parseBlogImagesDirection(retained)).toBe(retained);
    for (const rejected of ["raster", "modules", "scan"])
      expect(parseBlogImagesDirection(rejected)).toBe("compare");
  });
});

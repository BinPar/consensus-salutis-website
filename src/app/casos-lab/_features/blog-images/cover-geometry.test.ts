import { describe, expect, it } from "vitest";
import { coverGeometry } from "./cover-geometry";
import { explorationGeometry } from "./exploration-geometry";

const slugs = Array.from({ length: 24 }, (_, i) => `articulo-de-prueba-${i}`);

describe("retained background generators", () => {
  it("keeps the first three backgrounds stable with independent variation", () => {
    const first = slugs.map(coverGeometry);
    for (const slug of [...slugs].reverse()) coverGeometry(slug);
    expect(slugs.map(coverGeometry)).toEqual(first);
    for (const key of ["fields", "lines", "bands"] as const)
      expect(new Set(first.map((item) => JSON.stringify(item[key]))).size).toBe(
        24,
      );
  });

  it("keeps Interferencia, Estratos and Refracción stable and varied", () => {
    const first = slugs.map(explorationGeometry);
    for (const slug of [...slugs].reverse()) explorationGeometry(slug);
    expect(slugs.map(explorationGeometry)).toEqual(first);
    for (const key of ["rings", "layers", "facets"] as const)
      expect(new Set(first.map((item) => JSON.stringify(item[key]))).size).toBe(
        24,
      );
  });

  it("bounds restored vector geometry for arbitrary article identifiers", () => {
    for (const slug of [...slugs, "", "áé漢字🩺", "a".repeat(200)]) {
      const first = coverGeometry(slug);
      const next = explorationGeometry(slug);
      expect(JSON.stringify([first, next])).not.toMatch(
        /NaN|Infinity|undefined/,
      );
      expect(JSON.stringify(next).length).toBeLessThan(200_000);
      const paths = [
        ...first.lines.map((item) => item.path),
        ...next.rings.map((item) => item.path),
        ...next.layers.flatMap((item) => [item.edge, item.body]),
        ...next.facets.flatMap((item) => [item.edge, item.body]),
      ];
      for (const path of paths)
        expect(
          path
            .match(/-?\d+(?:\.\d+)?/g)!
            .map(Number)
            .every((value) => Number.isFinite(value) && Math.abs(value) < 7000),
        ).toBe(true);
    }
  });
});

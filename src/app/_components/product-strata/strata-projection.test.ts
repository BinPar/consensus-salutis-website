import { describe, expect, it } from "vitest";
import {
  initialStrataElevation,
  initialStrataYaw,
  projectStrata,
} from "./strata-projection";

const initial = { yaw: initialStrataYaw, elevation: initialStrataElevation };

describe("Strata's orthographic model", () => {
  it("reproduces the original SVG vertices and label positions", () => {
    const frame = projectStrata({
      camera: initial,
      offsets: [0, 0, 0],
      scales: [1, 1, 1],
    });
    frame.layers.forEach((layer, index) => {
      [
        [55, 128],
        [325, 32],
        [595, 128],
        [325, 224],
      ].forEach(([x, y], corner) => {
        expect(layer.top[corner]!.x).toBeCloseTo(x!, 8);
        expect(layer.top[corner]!.y).toBeCloseTo(y! + index * 76, 8);
      });
      expect(layer.title.x).toBeCloseTo(325, 8);
      expect(layer.title.y).toBeCloseTo(128 + index * 76, 8);
      expect(layer.number.y).toBeCloseTo(192 + index * 76, 8);
    });
  });

  it.each(
    [20, 45, 70].flatMap((yaw) =>
      [12, initialStrataElevation, 40].map((elevation) => [yaw, elevation]),
    ),
  )(
    "keeps thickness fixed and guides attached at yaw %s and elevation %s",
    (yaw, elevation) => {
      const camera = { yaw, elevation };
      const normal = projectStrata({
        camera,
        offsets: [-32, 3, 17],
        scales: [1, 1, 1],
      });
      const active = projectStrata({
        camera,
        offsets: [-32, 3, 17],
        scales: [1, 1.08, 1],
      });
      active.layers.forEach((layer, index) => {
        const reference = normal.layers[index]!;
        layer.top.forEach((top, corner) => {
          expect(layer.bottom[corner]!.y - top.y).toBeCloseTo(
            reference.bottom[corner]!.y - reference.top[corner]!.y,
            8,
          );
          expect(layer.bottom[corner]!.x).toBeCloseTo(top.x, 8);
        });
        expect(layer.glassClip).not.toMatch(/NaN|Infinity/);
      });
      active.guides.forEach((guide, index) => {
        const coordinates = guide
          .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!
          .map(Number);
        const upper = active.layers[index]!,
          lower = active.layers[index + 1]!;
        expect(coordinates).toEqual([
          upper.bottom[0]!.x,
          upper.bottom[0]!.y,
          lower.top[0]!.x,
          lower.top[0]!.y,
          upper.bottom[2]!.x,
          upper.bottom[2]!.y,
          lower.top[2]!.x,
          lower.top[2]!.y,
        ]);
      });
      expect(active.fit).toBe(normal.fit);
    },
  );

  it("preserves parallelograms and finite glass geometry through full rotations and edge-on views", () => {
    for (let yaw = -360; yaw <= 360; yaw += 45) {
      for (let elevation = -180; elevation <= 180; elevation += 30) {
        const frame = projectStrata({
          camera: { yaw, elevation },
          offsets: [-32, 3, 17],
          scales: [1.08, 1, 1],
        });
        frame.layers.forEach((layer) => {
          const [a, b, c, d] = layer.top;
          expect(a!.x + c!.x).toBeCloseTo(b!.x + d!.x, 8);
          expect(a!.y + c!.y).toBeCloseTo(b!.y + d!.y, 8);
          expect(layer.glassClip).not.toMatch(/NaN|Infinity/);
          expect(Number.isFinite(layer.number.x)).toBe(true);
          expect(Number.isFinite(layer.number.y)).toBe(true);
        });
      }
    }
  });

  it("draws the lower layer nearest when viewed from underneath", () => {
    const frame = projectStrata({
      camera: { yaw: 225, elevation: -30 },
      offsets: [0, 0, 0],
      scales: [1, 1, 1],
    });
    expect(frame.paintOrder).toEqual([0, 1, 2]);
    frame.layers.forEach((layer) => {
      const vertices = layer.surface
        .match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!
        .map(Number);
      expect(vertices).toEqual(
        layer.bottom.flatMap((point) => [point.x, point.y]),
      );
    });
  });
});

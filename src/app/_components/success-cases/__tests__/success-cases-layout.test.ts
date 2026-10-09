import { describe, expect, it } from "vitest";
import {
  institutionalCases,
  type InstitutionalCase,
} from "../success-cases-data";
import { groupMappedCases, regionViewBox } from "../success-cases-layout";

import { caseRegions } from "../success-cases-geography";

const first = institutionalCases[0]!;
const second = institutionalCases[1]!;

describe("institutional cases with a growing catalogue", () => {
  it("uses one geographic marker per territory, preserving every institution", () => {
    const catalogue = Array.from({ length: 12 }, (_, i) => ({
      ...(i % 2 === 0 ? first : second),
      id: `fixture-${i}`,
    }));
    const groups = groupMappedCases(catalogue);
    expect(groups).toHaveLength(2);
    expect(groups.map((group) => group.cases.length)).toEqual([6, 6]);
    expect(
      groups
        .flatMap((group) => group.cases)
        .map((item) => item.id)
        .sort(),
    ).toEqual(catalogue.map((item) => item.id).sort());
    expect(catalogue).toHaveLength(12);
  });
  it("does not require geographic data for a new institution", () => {
    const unmapped: InstitutionalCase = {
      ...first,
      id: "unmapped",
      region: undefined,
      point: undefined,
    };
    const invalid = { ...second, id: "invalid", point: { x: NaN, y: 5 } };
    expect(groupMappedCases([first, unmapped, invalid])).toEqual([
      {
        region: first.region,
        territory: first.territory,
        point: first.point,
        cases: [first],
      },
    ]);
    expect(unmapped.organization).toBe(first.organization);
    expect(groupMappedCases([])).toEqual([]);
  });
});

describe("territorial lens framing", () => {
  it("keeps every island and boundary inside the regional portrait", () => {
    for (const region of caseRegions) {
      const [x, y, width, height] = regionViewBox(region.d)
        .split(" ")
        .map(Number) as [number, number, number, number];
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      const values = region.d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      for (let i = 0; i < values.length; i += 2) {
        expect(values[i]).toBeGreaterThanOrEqual(x);
        expect(values[i]).toBeLessThanOrEqual(x + width);
        expect(values[i + 1]).toBeGreaterThanOrEqual(y);
        expect(values[i + 1]).toBeLessThanOrEqual(y + height);
      }
    }
  });
  it("has a usable overview when geography is absent, and frames tiny regions", () => {
    expect(regionViewBox("")).toBe("0 0 600 505");
    const [, , width, height] = regionViewBox("M1,1L1,1Z")
      .split(" ")
      .map(Number);
    expect(width).toBeGreaterThan(0);
    expect(height).toBeGreaterThan(0);
  });
});

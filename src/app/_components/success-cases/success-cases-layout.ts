import type { InstitutionalCase } from "./success-cases-data";

export type CaseRegionGroup = {
  region: string;
  territory: string;
  point: { x: number; y: number };
  cases: InstitutionalCase[];
};

export function groupMappedCases(cases: readonly InstitutionalCase[]) {
  const groups = new Map<string, CaseRegionGroup>();
  for (const item of cases) {
    if (
      !item.region ||
      !item.point ||
      !Number.isFinite(item.point.x) ||
      !Number.isFinite(item.point.y)
    )
      continue;
    const existing = groups.get(item.region);
    if (existing) existing.cases.push(item);
    else
      groups.set(item.region, {
        region: item.region,
        territory: item.territory,
        point: item.point,
        cases: [item],
      });
  }
  return [...groups.values()];
}

// The local geography uses only M/L/Z commands, so coordinate pairs give its
// complete bounds. Keep the framing independent of a particular institution.
export function regionViewBox(path: string, padding = 0.18) {
  const values = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  if (values.length < 4 || values.some((value) => !Number.isFinite(value)))
    return "0 0 600 505";
  const xs = values.filter((_, index) => index % 2 === 0);
  const ys = values.filter((_, index) => index % 2 === 1);
  const x = Math.min(...xs),
    y = Math.min(...ys);
  const width = Math.max(...xs) - x,
    height = Math.max(...ys) - y;
  const margin = Math.max(width, height, 1) * padding;
  return `${x - margin} ${y - margin} ${width + margin * 2} ${height + margin * 2}`;
}

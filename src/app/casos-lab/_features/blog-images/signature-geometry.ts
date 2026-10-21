// New seed stream, independent of all preserved versions and article topics.
export function signatureGeometry(slug: string) {
  let seed = 2166136261;
  for (let i = 0; i < slug.length; i++)
    seed = Math.imul(seed ^ slug.charCodeAt(i), 16777619) >>> 0;
  let state = seed ^ 0xa1b2c3d4;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let n = Math.imul(state ^ (state >>> 15), state | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  const n = (value: number) => Math.round(value * 10) / 10;
  const bend = n(-180 + random() * 360);
  const lift = n(-160 + random() * 320);
  const rotation = n(-28 + random() * 56);
  const mirror = random() > 0.5;
  const focus = n(480 + random() * 640);
  const fields = Array.from({ length: 3 }, (_, i) => ({
    x: n((i % 2 ? 1250 : 180) + random() * 350),
    y: n(-100 + random() * 1200),
    rx: n(650 + random() * 300),
    ry: n(440 + random() * 260),
  }));
  // Large open surfaces extend well beyond every crop; no closed icon silhouette.
  const aurora = `M -700 -600 H 2300 V ${n(100 + lift)} C 1600 ${n(680 + bend)}, 1080 ${n(180 + lift)}, 720 530 S 200 ${n(1150 + bend)}, -700 1300 Z`;
  const upper = `M -700 -700 H 2300 V -250 C 1520 ${n(20 + lift)}, 1480 ${n(350 + bend)}, 1100 580 C 720 ${n(790 + lift)}, 770 ${n(1300 + bend)}, 100 1700 H -700 Z`;
  const nacre = `M -700 -700 H 2300 V ${n(500 + lift)} C 1500 ${n(1000 + bend)}, 1300 ${n(-80 + lift)}, 660 380 S 0 ${n(1500 + bend)}, -700 1300 Z`;
  return {
    seed,
    rotation,
    mirror,
    focus,
    bend,
    lift,
    fields,
    aurora,
    upper,
    nacre,
  };
}

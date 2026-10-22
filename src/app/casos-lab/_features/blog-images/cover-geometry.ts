// Lab only. Geometry never depends on theme, viewport, React IDs or article topic.
export function coverGeometry(slug: string) {
  let seed = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    seed = Math.imul(seed ^ slug.charCodeAt(i), 16777619) >>> 0;
  }
  let state = seed;
  const random = () => {
    state += 0x6d2b79f5;
    let n = Math.imul(state ^ (state >>> 15), 1 | state);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
  const round = (n: number) => Math.round(n * 100) / 100;
  const fields = Array.from({ length: 4 }, (_, i) => ({
    x: round(-250 + random() * 2100),
    y: round(-400 + random() * 1500),
    radius: round(500 + random() * 650),
    squash: round(0.55 + random() * 0.55),
    opacity: round(0.28 + random() * 0.3),
    tone: i % 3,
  }));
  const angle = random() * Math.PI * 2;
  const phase = random() * Math.PI * 2;
  const frequency = 0.001 + random() * 0.0018;
  const strength = 0.4 + random() * 0.8;
  const lines = Array.from({ length: 22 }, () => {
    let x = -500 + random() * 2200;
    let y = -450 + random() * 1500;
    const points = [`M ${round(x)} ${round(y)}`];
    const steps = 45 + Math.floor(random() * 50);
    for (let step = 0; step < steps; step++) {
      const direction =
        angle +
        Math.sin(x * frequency + phase) * strength +
        Math.cos(y * frequency - phase) * 0.65;
      x += Math.cos(direction) * 24;
      y += Math.sin(direction) * 24;
      points.push(`L ${round(x)} ${round(y)}`);
    }
    return {
      path: points.join(" "),
      opacity: round(0.12 + random() * 0.14),
      width: round(1.6 + random() * 2.4),
    };
  });
  const bands = Array.from({ length: 4 }, () => {
    const y = round(-450 + random() * 1400);
    const bend = round(-500 + random() * 1100);
    const width = round(130 + random() * 340);
    return `M -600 ${y} C 100 ${y + bend}, 650 ${y - bend}, 2200 ${y + bend} L 2200 ${y + bend + width} C 650 ${y - bend + width}, 100 ${y + bend + width}, -600 ${y + width} Z`;
  });
  const grain = Array.from({ length: 160 }, () => ({
    x: round(random() * 1600),
    y: round(random() * 1000),
    r: round(0.45 + random() * 0.65),
  }));
  return {
    seed,
    fields,
    lines,
    bands,
    grain,
    rotation: round(-55 + random() * 110),
  };
}

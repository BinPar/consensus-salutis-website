// Separate seed stream: keep the previous experiments unchanged.
export function explorationGeometry(slug: string) {
  let seed = 5381;
  for (let i = 0; i < slug.length; i++)
    seed = Math.imul(seed, 33) ^ slug.charCodeAt(i);
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const n = (value: number) => Math.round(value * 10) / 10;
  const mirror = random() > 0.5;
  const rotation = n(-75 + random() * 150);
  const phase = random() * Math.PI * 2;
  const centers = [
    { x: -120 + random() * 550, y: -150 + random() * 700 },
    { x: 1150 + random() * 450, y: 500 + random() * 600 },
  ];
  const rings = centers.flatMap((center, group) => {
    const squash = 0.6 + random() * 0.4;
    return Array.from({ length: 48 }, (_, index) => {
      const radius = 70 + index * (27 + group * 2);
      const points = Array.from({ length: 81 }, (_, step) => {
        const angle = (step / 80) * Math.PI * 2;
        const r = radius * (1 + Math.sin(angle * 3 + phase) * 0.06);
        return `${step === 0 ? "M" : "L"} ${n(center.x + Math.cos(angle) * r)} ${n(center.y + Math.sin(angle) * r * squash)}`;
      });
      return { path: `${points.join(" ")} Z`, group };
    });
  });
  const spacing = 95 + random() * 70;
  const amplitude = 150 + random() * 180;
  const frequency = 0.0015 + random() * 0.0015;
  const wave = (x: number, row: number) =>
    -550 +
    row * spacing +
    Math.sin(x * frequency + phase + row * 0.07) * (amplitude + row * 14) +
    Math.cos(x * 0.0035 - phase) * 95;
  const layers = Array.from({ length: 18 }, (_, row) => {
    const edge = Array.from({ length: 49 }, (_, step) => {
      const x = -600 + step * 60;
      return `${step === 0 ? "M" : "L"} ${x} ${n(wave(x, row))}`;
    }).join(" ");
    const lower = Array.from({ length: 49 }, (_, step) => {
      const x = 2280 - step * 60;
      return `L ${x} ${n(wave(x, row + 1))}`;
    }).join(" ");
    return { edge, body: `${edge} ${lower} Z` };
  });
  const facets = Array.from({ length: 9 }, (_, i) => {
    const x = -1100 + i * 350;
    const lean = -250 + random() * 450;
    const width = 210 + random() * 300;
    return {
      body: `M ${x} -900 L ${n(x + width)} -900 L ${n(x + width + 780 + lean)} 1900 L ${n(x + 780 + lean)} 1900 Z`,
      edge: `M ${x} -900 L ${n(x + 780 + lean)} 1900`,
      tone: i % 3,
    };
  });
  return {
    rings,
    layers,
    facets,
    rotation,
    mirror,
    glowX: n(350 + random() * 900),
    glowY: n(100 + random() * 800),
  };
}

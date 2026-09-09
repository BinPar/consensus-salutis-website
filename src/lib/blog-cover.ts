/**
 * Geometría de la portada de marca de un post.
 *
 * Vive aquí, separada del componente, porque es lógica pura con test: es lo que
 * fija que el mismo slug pinta siempre la misma portada y que dos slugs no
 * pintan la misma. Nada de `Math.random()` ni de `useId()` —el segundo también
 * rompería la estabilidad, porque su valor depende del árbol de React.
 */

/* Recetas de `consensus-salutis-brand-design-system`: colors-and-tokens.md. */
export const BLOG_COVER_TEAL = "rgb(8 145 178)";
export const BLOG_COVER_AQUA = "rgb(20 184 166)";
export const BLOG_COVER_LIME = "rgb(246 255 83)";

/* 16:7, el encuadre de la cabecera del artículo. La tarjeta recorta a 1.6. */
export const BLOG_COVER_WIDTH = 1600;
export const BLOG_COVER_HEIGHT = 700;

const WIDTH = BLOG_COVER_WIDTH;
const HEIGHT = BLOG_COVER_HEIGHT;

function hashSlug(slug: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < slug.length; index += 1) {
    hash ^= slug.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
}

/** mulberry32: PRNG de 32 bits, determinista y sin dependencias. */
function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

/**
 * Curva de señal: la línea que cruza el encuadre de izquierda a derecha con dos
 * cúbicas, como las tres del `SignalField`. `lift` la sube o baja, `swing` marca
 * cuánto ondula.
 */
function signalPath(next: () => number, lift: number, swing: number) {
  const start = HEIGHT * lift + (next() - 0.5) * 60;
  const firstPeak = start - HEIGHT * swing * (0.7 + next() * 0.6);
  const valley = start - HEIGHT * swing * (0.1 + next() * 0.3);
  const end = start - HEIGHT * swing * (1.1 + next() * 0.5);

  return [
    `M-120 ${round(start)}`,
    `C${round(WIDTH * 0.2)} ${round(firstPeak)}`,
    `${round(WIDTH * 0.34)} ${round(valley)}`,
    `${round(WIDTH * 0.52)} ${round(valley - HEIGHT * 0.06)}`,
    `C${round(WIDTH * 0.72)} ${round(end + HEIGHT * 0.12)}`,
    `${round(WIDTH * 0.86)} ${round(end)}`,
    `${WIDTH + 120} ${round(end - HEIGHT * 0.05)}`,
  ].join(" ");
}

/**
 * Mancha cerrada en coordenadas polares: `points` radios sorteados alrededor de
 * un centro y unidos con cúbicas tangentes, que es lo que le da el borde blando
 * de las formas del signal-field sin tener que interpolar sus paths.
 */
function blobPath(
  next: () => number,
  center: { x: number; y: number },
  radius: { x: number; y: number },
  points = 7,
) {
  const nodes = Array.from({ length: points }, (_, index) => {
    const angle = (index / points) * Math.PI * 2;
    const jitter = 0.72 + next() * 0.52;

    return {
      x: center.x + Math.cos(angle) * radius.x * jitter,
      y: center.y + Math.sin(angle) * radius.y * jitter,
    };
  });

  const segments = nodes.map((node, index) => {
    const previous = nodes[(index - 1 + points) % points]!;
    const following = nodes[(index + 1) % points]!;
    const afterFollowing = nodes[(index + 2) % points]!;
    const smoothing = 0.28;

    const control1 = {
      x: node.x + (following.x - previous.x) * smoothing,
      y: node.y + (following.y - previous.y) * smoothing,
    };
    const control2 = {
      x: following.x - (afterFollowing.x - node.x) * smoothing,
      y: following.y - (afterFollowing.y - node.y) * smoothing,
    };

    return `C${round(control1.x)} ${round(control1.y)} ${round(control2.x)} ${round(control2.y)} ${round(following.x)} ${round(following.y)}`;
  });

  const first = nodes[0]!;

  return `M${round(first.x)} ${round(first.y)} ${segments.join(" ")} Z`;
}

/**
 * Geometría de la portada de un slug.
 *
 * Función pura y exportada para que el test pueda fijar lo único que no se ve en
 * una captura: que el mismo slug da siempre los mismos paths y que dos slugs no
 * dan la misma portada.
 */
export function blogCoverGeometry(slug: string) {
  const seed = hashSlug(slug);
  const next = seededRandom(seed);

  const signals = [
    { path: signalPath(next, 0.86, 0.42), width: 5, opacity: 0.55 },
    { path: signalPath(next, 0.94, 0.5), width: 3.5, opacity: 0.4 },
    { path: signalPath(next, 0.74, 0.36), width: 2.5, opacity: 0.3 },
  ];

  const mainBlob = blobPath(
    next,
    { x: WIDTH * (0.52 + next() * 0.2), y: HEIGHT * (0.42 + next() * 0.18) },
    { x: WIDTH * 0.23, y: HEIGHT * 0.4 },
  );
  const offsetBlob = blobPath(
    next,
    { x: WIDTH * (0.3 + next() * 0.16), y: HEIGHT * (0.56 + next() * 0.16) },
    { x: WIDTH * 0.17, y: HEIGHT * 0.3 },
    6,
  );

  /* El ángulo del degradado también viene de la semilla: varía el aire por post. */
  const tilt = next();

  return { seed, signals, mainBlob, offsetBlob, tilt };
}

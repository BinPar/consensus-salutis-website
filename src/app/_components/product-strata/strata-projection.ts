export const initialStrataYaw = 45;
export const initialStrataElevation = (Math.asin(96 / 270) * 180) / Math.PI;

type Point = { x: number; y: number };
export type StrataCamera = { yaw: number; elevation: number };
export function ambientStrataCamera(
  camera: StrataCamera,
  seconds: number,
): StrataCamera {
  return {
    yaw: camera.yaw + (seconds * 360) / 96,
    elevation:
      camera.elevation + (1 - Math.cos((seconds * Math.PI * 2) / 96)) * 8,
  };
}
export type StrataGeometry = {
  camera: StrataCamera;
  offsets: readonly number[];
  scales: readonly number[];
};

const radians = (angle: number) => (angle * Math.PI) / 180;
const initialCosine = Math.cos(radians(initialStrataElevation));
const halfSide = (270 * Math.SQRT2) / 2;
const thickness = 10 / initialCosine;
const xy = (point: Point) => `${point.x} ${point.y}`;
const path = (points: Point[]) => `M${points.map(xy).join("L")}Z`;
const line = (a: Point, b: Point) => `M${xy(a)}L${xy(b)}`;

function projection(camera: StrataCamera) {
  const yaw = radians(camera.yaw);
  const elevation = radians(camera.elevation);
  return (x: number, y: number, z: number): Point => ({
    x: Math.cos(yaw) * x - Math.sin(yaw) * z,
    y:
      Math.sin(elevation) * (Math.sin(yaw) * x + Math.cos(yaw) * z) -
      Math.cos(elevation) * y,
  });
}

// Fit from the camera's worst-case envelope, never from an animation frame.
// Changing the selected layer or its float must not make the camera pump.
function envelope(camera: StrataCamera) {
  const project = projection(camera);
  const points = [0, 2].flatMap((layer) =>
    [-35, 17].flatMap((offset) =>
      [-1, 1].flatMap((x) =>
        [-1, 1].flatMap((z) =>
          [0, thickness].map((depth) =>
            project(
              x * halfSide * 1.08,
              ((1 - layer) * 76 - offset) / initialCosine - depth,
              z * halfSide * 1.08,
            ),
          ),
        ),
      ),
    ),
  );
  const ys = points.map((point) => point.y);
  return { min: Math.min(...ys), max: Math.max(...ys) };
}

const baseEnvelope = envelope({
  yaw: initialStrataYaw,
  elevation: initialStrataElevation,
});

export function projectStrata({ camera, offsets, scales }: StrataGeometry) {
  const project = projection(camera);
  const yaw = radians(camera.yaw);
  const elevation = radians(camera.elevation);
  const above = Math.sin(elevation) >= 0;
  const signX = Math.sin(yaw) * Math.cos(elevation) >= 0 ? 1 : -1;
  const signZ = Math.cos(yaw) * Math.cos(elevation) >= 0 ? 1 : -1;
  const frontIndex = signX > 0 ? (signZ > 0 ? 3 : 2) : signZ > 0 ? 0 : 1;
  const surfaceDepth = above ? 0 : thickness;
  const paintOrder = above ? [2, 1, 0] : [0, 1, 2];
  const bounds = envelope(camera);
  const fit = Math.min(
    1,
    (baseEnvelope.max - baseEnvelope.min) / (bounds.max - bounds.min),
  );
  const centerAdjustment =
    (baseEnvelope.min + baseEnvelope.max - fit * (bounds.min + bounds.max)) / 2;
  const layers = [0, 1, 2].map((layer) => {
    const scale = scales[layer] ?? 1;
    const worldY = ((1 - layer) * 76 - (offsets[layer] ?? 0)) / initialCosine;
    const at = (x: number, z: number, depth = 0) => {
      const p = project(
        x * halfSide * scale,
        worldY - depth,
        z * halfSide * scale,
      );
      return { x: 325 + p.x * fit, y: 204 + p.y * fit + centerAdjustment };
    };
    const top = [at(-1, 1), at(-1, -1), at(1, -1), at(1, 1)];
    const bottom = [
      at(-1, 1, thickness),
      at(-1, -1, thickness),
      at(1, -1, thickness),
      at(1, 1, thickness),
    ];
    const surface = above ? top : bottom;
    const other = above ? bottom : top;
    const neighbours = [(frontIndex + 1) % 4, (frontIndex + 3) % 4].sort(
      (a, b) => surface[a]!.x - surface[b]!.x,
    );
    const [leftIndex, rightIndex] = neighbours as [number, number];
    const a = surface[leftIndex]!,
      d = surface[frontIndex]!,
      c = surface[rightIndex]!;
    const ab = other[leftIndex]!,
      db = other[frontIndex]!,
      cb = other[rightIndex]!;
    const grid = Array.from({ length: 7 }, (_, i) => {
      const fraction = -1 + (i + 1) / 4;
      return `${line(at(fraction, -1, surfaceDepth), at(fraction, 1, surfaceDepth))} ${line(at(-1, fraction, surfaceDepth), at(1, fraction, surfaceDepth))}`;
    }).join(" ");
    return {
      top,
      bottom,
      surface: path(surface),
      front: d,
      farFront: db,
      guideCorners: neighbours,
      left: path([a, d, db, ab]),
      right: path([d, c, cb, db]),
      contour: `${line(a, ab)}L${xy(db)}L${xy(cb)}L${xy(c)} ${line(d, db)}`,
      grid,
      glassClip: `${path(surface)} ${path([a, d, db, ab])} ${path([d, c, cb, db])}`,
      title: at(0, 0, surfaceDepth),
      number: at((signX * 2) / 3, (signZ * 2) / 3, surfaceDepth),
      textScale: scale * fit,
    };
  });
  const guides = [0, 1].map((layer) => {
    const upper = layers[layer]!;
    const lower = layers[layer + 1]!;
    return upper.guideCorners
      .map((corner) => line(upper.bottom[corner]!, lower.top[corner]!))
      .join(" ");
  });
  // Labels stay on their surface's front diagonal, clear of upper glass at
  // steep viewing angles. The original 2/3 position is retained whenever visible.
  const nearToFar = [...paintOrder].reverse();
  nearToFar.forEach((index, position) => {
    if (!position) return;
    const layer = layers[index]!;
    const front = layer.front;
    const extent = front.y - layer.title.y;
    if (Math.abs(extent) < 0.001) return;
    const direction = Math.sign(extent);
    const coveredUntil = Math.max(
      ...nearToFar
        .slice(0, position)
        .flatMap((nearIndex) => [
          layers[nearIndex]!.front.y * direction,
          layers[nearIndex]!.farFront.y * direction,
        ]),
    );
    const fraction = Math.min(
      0.97,
      Math.max(
        2 / 3,
        (coveredUntil + 12 * fit - layer.title.y * direction) /
          Math.abs(extent),
      ),
    );
    layer.number = {
      x: layer.title.x + (front.x - layer.title.x) * fraction,
      y: layer.title.y + (front.y - layer.title.y) * fraction,
    };
  });
  return { layers, guides, fit, paintOrder };
}

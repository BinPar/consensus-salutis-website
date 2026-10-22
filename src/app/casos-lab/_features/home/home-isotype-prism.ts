// Exact outline from public/logos/binpar-brand/binpar-isotipo-light.svg.
// The lab study extrudes the original silhouette, including both open channels.
const outline =
  "M119.3,45.22c0-8.06-4.33-15.56-11.31-19.59L72.19,4.96c-6.98-4.03-15.64-4.03-22.62,0L13.77,25.64c-6.98,4.03-11.31,11.53-11.31,19.59v41.34c0,8.06,4.33,15.56,11.31,19.59l35.8,20.67c3.49,2.01,7.4,3.02,11.31,3.02s7.82-1.01,11.31-3.02l35.8-20.67c6.98-4.03,11.31-11.53,11.31-19.59v-41.34ZM32.72,42.72c-3.7,2.14-6,6.12-6,10.39v32.5l9.38,5.42,34.43-19.88.06-10.21,14.54-8.81v21.12c0,3.89-2.09,7.52-5.47,9.47l-43.65,25.21-17.33-10c-4.08-2.35-6.61-6.74-6.61-11.45v-41.12c0-4.71,2.53-9.1,6.61-11.46L54.26,13.38c2.04-1.18,4.33-1.77,6.61-1.77s4.59.59,6.63,1.78l7.98,4.62-42.77,24.71ZM89.04,89.08c3.7-2.14,6-6.12,6-10.4v-32.56l-9.29-5.36-34.38,19.85v9.83s-14.63,8.46-14.63,8.46v-20.57c0-3.9,2.1-7.53,5.48-9.48l43.43-24.96,17.41,10.05c4.08,2.36,6.61,6.75,6.61,11.46l-.03,40.98c0,4.7-2.53,9.08-6.6,11.44l-35.55,20.58c-4.06,2.35-9.1,2.37-13.17.05l-8.14-4.64,42.84-24.74Z";
type Point3 = [number, number, number];
type Pointer = { x: number; y: number };

export function createIsotypePrism(centered = false) {
  const face = new Path2D(outline);
  const contours = outline.match(/M[^M]+/g)!.map((d) => {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    const length = path.getTotalLength();
    const count = Math.ceil(length / 0.9);
    return Array.from({ length: count }, (_, i): Point3 => {
      const p = path.getPointAtLength((i / count) * length);
      return [p.x - 60.88, p.y - 65.895, 0];
    });
  });

  return function draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    pointer: Pointer,
    dark: boolean,
    mobile: boolean,
  ) {
    const cx = w * (centered ? 0.5 : mobile ? 0.52 : 0.76);
    const cy = centered
      ? h * (mobile ? 0.19 : 0.2)
      : h * (mobile ? 0.73 : 0.5) + Math.sin(t * 0.22) * 5;
    const size =
      (centered
        ? mobile
          ? 110
          : Math.min(w * 0.075, h * 0.1)
        : mobile
          ? 255
          : Math.min(w * 0.25, h * 0.35)) / 65.895;
    // Upright study: 365 degrees every 30 seconds about the central Y axis.
    const yaw = centered
      ? (t * ((365 * Math.PI) / 180)) / 30
      : -0.38 + Math.sin(t * 0.12) * 0.16 + pointer.x * 0.12;
    const pitch = centered
      ? 0
      : 0.22 + Math.sin(t * 0.1) * 0.08 + pointer.y * 0.1;
    const roll = centered ? 0 : -0.08 + Math.sin(t * 0.08) * 0.035;
    const rotate = ([x, y, z]: Point3): Point3 => {
      const xx = x * Math.cos(yaw) - z * Math.sin(yaw);
      const zz = x * Math.sin(yaw) + z * Math.cos(yaw);
      const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
      return [
        (xx * Math.cos(roll) - yy * Math.sin(roll)) * size,
        (xx * Math.sin(roll) + yy * Math.cos(roll)) * size,
        (y * Math.sin(pitch) + zz * Math.cos(pitch)) * size,
      ];
    };
    const depth = centered ? 5 : 11;
    const ex = rotate([1, 0, 0]);
    const ey = rotate([0, 1, 0]);
    const paintFace = (z: number, front: boolean) => {
      const offset = rotate([0, 0, z]);
      ctx.save();
      ctx.translate(cx + offset[0], cy + offset[1]);
      ctx.transform(ex[0], ex[1], ey[0], ey[1], 0, 0);
      ctx.translate(-60.88, -65.895);
      if (centered) {
        ctx.fillStyle = front
          ? dark
            ? "#102c3a"
            : "#f0f6f7"
          : dark
            ? "#0b2332"
            : "#deecef";
      } else {
        const gradient = ctx.createLinearGradient(14, 6, 110, 126);
        gradient.addColorStop(0, dark ? "#a0f5e5" : "#a6d9d7");
        gradient.addColorStop(0.38, dark ? "#39c5bd" : "#4babb0");
        gradient.addColorStop(1, dark ? "#087b89" : "#006d79");
        ctx.fillStyle = front ? gradient : dark ? "#073844" : "#064b5c";
      }
      ctx.fill(face, "evenodd");
      if (front) {
        ctx.strokeStyle = centered
          ? dark
            ? "rgba(0,188,187,.55)"
            : "rgba(0,109,121,.38)"
          : dark
            ? "rgba(185,255,244,.55)"
            : "rgba(221,255,249,.6)";
        ctx.lineWidth = centered ? 0.6 : 0.25;
        ctx.stroke(face);
      }
      ctx.restore();
    };

    // A soft contact shadow grounds the floating sculpture without a visible base.
    if (!centered) {
      ctx.save();
      ctx.translate(cx, cy + 76 * size);
      ctx.scale(1, 0.18);
      const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, 60 * size);
      shadow.addColorStop(0, dark ? "rgba(0,0,0,.28)" : "rgba(0,65,87,.14)");
      shadow.addColorStop(1, "rgba(0,65,87,0)");
      ctx.fillStyle = shadow;
      ctx.beginPath();
      ctx.arc(0, 0, 60 * size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    const facingDepth = Math.cos(yaw) >= 0 ? depth : -depth;
    paintFace(-facingDepth, false);
    const walls = contours
      .flatMap((points) =>
        points.map((a, i) => {
          const b = points[(i + 1) % points.length]!;
          const vertices = [
            rotate([a[0], a[1], -depth]),
            rotate([b[0], b[1], -depth]),
            rotate([b[0], b[1], depth]),
            rotate([a[0], a[1], depth]),
          ];
          const dx = b[0] - a[0],
            dy = b[1] - a[1];
          const normal = rotate([dy, -dx, 0]);
          const light = Math.max(
            0,
            Math.min(
              1,
              0.4 +
                ((normal[0] * -0.45 - normal[1] * 0.7 + normal[2] * 0.3) /
                  (Math.hypot(...normal) || 1)) *
                  0.55,
            ),
          );
          return {
            vertices,
            light,
            z: vertices.reduce((sum, p) => sum + p[2], 0) / 4,
          };
        }),
      )
      .sort((a, b) => a.z - b.z);
    for (const wall of walls) {
      const base = dark ? [3, 43, 57] : [3, 63, 81];
      const bright = dark ? [40, 176, 169] : [72, 156, 166];
      const color = base.map((c, i) =>
        Math.round(c + (bright[i]! - c) * (centered ? 0.3 : wall.light)),
      );
      ctx.fillStyle = centered
        ? dark
          ? "#173d49"
          : "#d4e5e8"
        : `rgb(${color.join(",")})`;
      // Matching strokes seal subpixel seams between sampled curved wall faces.
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      wall.vertices.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(cx + x, cy + y);
        else ctx.lineTo(cx + x, cy + y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    paintFace(facingDepth, true);
  };
}

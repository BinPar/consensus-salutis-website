/**
 * La tarjeta de marca de 1200×630 para compartir enlaces (LinkedIn, X,
 * WhatsApp…), con la receta de imágenes sociales del manual de identidad:
 * fondo azul noche, la retícula de 44 px desvanecida, el logo oficial arriba,
 * antetítulo y titular en dos tonos (Slate 50 + turquesa) y el dominio al pie.
 *
 * La usan las dos imágenes del sitio: la de cada post
 * (`[locale]/blog/[slug]/opengraph-image`) y la de las demás páginas
 * (`[locale]/share-image`). Solo se ejecuta en el servidor.
 *
 * Tipografía y logo van por bytes: `next/og` compone fuera del navegador y no
 * sabe nada de `next/font/google` ni de `public/`, así que Sora entra como
 * `.ttf` commiteado (`src/app/_fonts/`, subset latino) y el logo como el SVG
 * oficial de `public/logos/`. Los dos entran en el bundle de cada función por
 * `outputFileTracingIncludes` en `next.config.js`.
 */
import fs from "node:fs";
import path from "node:path";

import { ImageResponse } from "next/og";

import { OG_IMAGE } from "./og-image";

const { width: WIDTH, height: HEIGHT } = OG_IMAGE;

const NIGHT = "#06111F";
const SLATE_50 = "#F8FAFC";
const TURQUOISE = "#00BCBB";
const SLATE_400 = "#90A1B9";

/*
  `fs` y no `new URL(..., import.meta.url)`: ese patrón resuelve a una ruta de
  bundler (`/_next/static/media/...`) que `fetch` no sabe abrir en el servidor.
*/
function readFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments));
}

function svgDataUri(svg: string) {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

/*
  La retícula técnica: celdas de 44 px y líneas de 1 px en turquesa muy tenue,
  desvanecida con una máscara radial centrada en el titular. Nunca a la misma
  intensidad en toda la imagen.
*/
function gridImage() {
  const lines: string[] = [];

  for (let x = 0; x <= WIDTH; x += 44) lines.push(`M${x + 0.5} 0V${HEIGHT}`);
  for (let y = 0; y <= HEIGHT; y += 44) lines.push(`M0 ${y + 0.5}H${WIDTH}`);

  return svgDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">` +
      `<defs><radialGradient id="fade" cx="380" cy="330" r="640" gradientUnits="userSpaceOnUse">` +
      `<stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>` +
      `</radialGradient><mask id="m"><rect width="${WIDTH}" height="${HEIGHT}" fill="url(#fade)"/></mask></defs>` +
      `<path d="${lines.join("")}" stroke="${TURQUOISE}" stroke-opacity="0.1" mask="url(#m)"/></svg>`,
  );
}

/*
  El titular admite `<accent>…</accent>` para el segundo tono, como los demás
  titulares de la web. Va palabra a palabra para que el texto parta línea donde
  toque sin perder el color de cada tramo.
*/
function titleWords(title: string) {
  return title.split(/(<accent>.*?<\/accent>)/).flatMap((part) => {
    const accent = part.startsWith("<accent>");
    const text = part.replace(/<\/?accent>/g, "");

    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => ({ word, accent }));
  });
}

export function ogCard({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  /** Texto plano o con `<accent>…</accent>` para el segundo tono. */
  title: string;
  footer: string;
}) {
  const words = titleWords(title);
  const length = words.map(({ word }) => word).join(" ").length;
  /* Tres escalones: un titular largo baja de cuerpo en vez de desbordar. */
  const titleSize = length > 70 ? 46 : length > 40 ? 54 : 64;
  const logo = svgDataUri(
    readFile("public/logos/binpar-brand/binpar-logo-dark.svg").toString("utf8"),
  );

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        backgroundColor: NIGHT,
        fontFamily: "Sora",
        position: "relative",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og solo entiende <img> */}
      <img
        src={gridImage()}
        width={WIDTH}
        height={HEIGHT}
        alt=""
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Logo oficial, versión para fondo oscuro (430,04 × 131,79). */}
      {/* eslint-disable-next-line @next/next/no-img-element -- next/og solo entiende <img> */}
      <img src={logo} width={326} height={100} alt="" />

      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        <div
          style={{
            display: "flex",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: 4.4,
            textTransform: "uppercase",
            color: TURQUOISE,
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            maxWidth: 900,
            fontSize: titleSize,
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: -1.6,
          }}
        >
          {words.map(({ word, accent }, index) => (
            <span
              key={index}
              style={{
                color: accent ? TURQUOISE : SLATE_50,
                marginRight: "0.26em",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 24,
          fontWeight: 600,
          color: SLATE_400,
        }}
      >
        {footer}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        {
          name: "Sora",
          data: readFile("src/app/_fonts", "Sora-ExtraBold.ttf"),
          weight: 800,
          style: "normal",
        },
        {
          name: "Sora",
          data: readFile("src/app/_fonts", "Sora-SemiBold.ttf"),
          weight: 600,
          style: "normal",
        },
      ],
    },
  );
}

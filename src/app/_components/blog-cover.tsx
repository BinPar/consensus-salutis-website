/**
 * Portada de marca por código.
 *
 * Último eslabón de la cadena de portada: cuando un post no trae `image`, esto
 * dibuja el signal-field de la marca en vez de una imagen de relleno. Cero
 * trabajo de diseño por post y nunca fuera de marca. La geometría —determinista
 * por slug— viene de `~/lib/blog-cover`.
 *
 * Sin animación a propósito: la portada convive con el `SignalField` animado del
 * fondo y con cuatro tarjetas a la vez en la home. Dos capas de morph compitiendo
 * en el mismo encuadre no se leen.
 */
import {
  BLOG_COVER_AQUA as AQUA,
  BLOG_COVER_HEIGHT as HEIGHT,
  BLOG_COVER_LIME as LIME,
  BLOG_COVER_TEAL as TEAL,
  BLOG_COVER_WIDTH as WIDTH,
  blogCoverGeometry,
  round,
} from "~/lib/blog-cover";

export function BlogCover({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { seed, signals, mainBlob, offsetBlob, tilt } = blogCoverGeometry(slug);
  /* Ids derivados del slug: dos portadas en la misma página no se pisan los defs. */
  const idBase = `cover-${seed.toString(36)}`;
  const groundId = `${idBase}-ground`;
  const fillId = `${idBase}-fill`;
  const glowId = `${idBase}-glow`;

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
      className={`text-primary-light dark:text-primary-dark block h-full w-full ${className}`}
    >
      <defs>
        {/*
          `userSpaceOnUse` en los lineales: las coordenadas van en el sistema del
          `viewBox`. Sin esto se interpretan como fracción del bounding box del
          path y el degradado degenera —los trazos salen transparentes.
        */}
        <linearGradient
          id={groundId}
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="0"
          x2={WIDTH}
          y2={HEIGHT}
        >
          <stop className="dark:[stop-color:#06111f]" stopColor="#cfe6ee" />
          <stop
            offset="1"
            className="dark:[stop-color:#0a1a2b]"
            stopColor="#eef7fa"
          />
        </linearGradient>
        <linearGradient
          id={fillId}
          gradientUnits="userSpaceOnUse"
          x1={round(WIDTH * (0.1 + tilt * 0.2))}
          y1="0"
          x2={round(WIDTH * 0.82)}
          y2={HEIGHT}
        >
          <stop
            className="dark:[stop-opacity:0.4]"
            stopColor={TEAL}
            stopOpacity="0.55"
          />
          <stop
            className="dark:[stop-opacity:0.26]"
            offset="0.52"
            stopColor={AQUA}
            stopOpacity="0.34"
          />
          <stop
            className="dark:[stop-opacity:0.14]"
            offset="1"
            stopColor={LIME}
            stopOpacity="0.42"
          />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx={round(0.3 + tilt * 0.4)}
          cy="0.22"
          r="0.72"
        >
          <stop
            className="dark:[stop-opacity:0.3]"
            stopColor={AQUA}
            stopOpacity="0.4"
          />
          <stop offset="1" stopColor={AQUA} stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width={WIDTH} height={HEIGHT} fill={`url(#${groundId})`} />
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${glowId})`} />

      <path d={offsetBlob} fill={`url(#${fillId})`} opacity="0.55" />
      {/* La mancha principal tapa lo de detrás con el color del fondo y vuelve a
          pintarse translúcida: es el recorte en capas del signal-field. */}
      <path d={mainBlob} fill={`url(#${groundId})`} opacity="0.92" />
      <path d={mainBlob} fill={`url(#${fillId})`} opacity="0.85" />
      <path d={mainBlob} stroke="currentColor" strokeWidth="3" opacity="0.5" />

      {signals.map((signal) => (
        <path
          key={signal.path}
          d={signal.path}
          stroke="currentColor"
          strokeWidth={signal.width}
          opacity={signal.opacity}
        />
      ))}
    </svg>
  );
}

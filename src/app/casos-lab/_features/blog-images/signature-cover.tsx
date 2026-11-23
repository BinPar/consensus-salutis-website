"use client";

import { useId, useMemo } from "react";
import { CoverIsotype } from "./cover-isotype";
import { signatureGeometry } from "./signature-geometry";
import type { SignatureTreatment } from "./blog-images-directions";

export function SignatureCover({
  slug,
  treatment,
  className = "",
}: {
  slug: string;
  treatment: SignatureTreatment;
  className?: string;
}) {
  const id = `lab-signature-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const g = useMemo(() => signatureGeometry(slug), [slug]);
  const transform = `${g.mirror ? "translate(1600 0) scale(-1 1) " : ""}rotate(${g.rotation} 800 500)`;
  return (
    <div className={`pointer-events-none relative h-full w-full ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="block h-full w-full"
        data-cover-treatment={treatment}
      >
        <defs>
          <linearGradient id={`${id}-base`} x2="0.7" y2="1">
            <stop stopColor="#f3f9f7" className="dark:[stop-color:#102934]" />
            <stop
              offset="0.6"
              stopColor="#d5e9ed"
              className="dark:[stop-color:#102c3b]"
            />
            <stop
              offset="1"
              stopColor="#e5f3ef"
              className="dark:[stop-color:#0a1c29]"
            />
          </linearGradient>
          <radialGradient id={`${id}-aqua`}>
            <stop
              stopColor="#1d9eaa"
              stopOpacity="0.8"
              className="dark:[stop-color:#1b8492] dark:[stop-opacity:0.75]"
            />
            <stop offset="0.6" stopColor="#6dcbbd" stopOpacity="0.4" />
            <stop offset="1" stopColor="#76cbbb" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-lime`}>
            <stop
              stopColor="#dfefa8"
              stopOpacity="0.85"
              className="dark:[stop-color:#879960] dark:[stop-opacity:0.25]"
            />
            <stop
              offset="0.6"
              stopColor="#eaf5ca"
              stopOpacity="0.35"
              className="dark:[stop-opacity:0.08]"
            />
            <stop offset="1" stopColor="#eaf5ca" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`${id}-white`}>
            <stop
              stopColor="#ffffff"
              stopOpacity="0.95"
              className="dark:[stop-color:#5c9aa5] dark:[stop-opacity:0.3]"
            />
            <stop
              offset="1"
              stopColor="#ffffff"
              stopOpacity="0"
              className="dark:[stop-color:#5c9aa5]"
            />
          </radialGradient>
          <linearGradient
            id={`${id}-aurora`}
            gradientUnits="userSpaceOnUse"
            x1="200"
            y1="0"
            x2="1350"
            y2="1050"
          >
            <stop stopColor="#e9f8f2" className="dark:[stop-color:#14434b]" />
            <stop
              offset="0.24"
              stopColor="#9cd6ce"
              className="dark:[stop-color:#237d81]"
            />
            <stop
              offset="0.46"
              stopColor="#2d91a3"
              className="dark:[stop-color:#145360]"
            />
            <stop
              offset="0.59"
              stopColor="#c0e5dd"
              className="dark:[stop-color:#387d7e]"
            />
            <stop
              offset="0.75"
              stopColor="#f7fcf4"
              className="dark:[stop-color:#19434b]"
            />
            <stop
              offset="1"
              stopColor="#d7eba6"
              className="dark:[stop-color:#496149]"
            />
          </linearGradient>
          <linearGradient
            id={`${id}-upper`}
            gradientUnits="userSpaceOnUse"
            x1="200"
            y1="0"
            x2="1250"
            y2="900"
          >
            <stop stopColor="#1f859b" className="dark:[stop-color:#0f495e]" />
            <stop
              offset="0.33"
              stopColor="#96cfcf"
              className="dark:[stop-color:#28626b]"
            />
            <stop
              offset="0.62"
              stopColor="#dff1ec"
              className="dark:[stop-color:#2f6e73]"
            />
            <stop
              offset="0.88"
              stopColor="#f8fcf6"
              className="dark:[stop-color:#497b78]"
            />
            <stop
              offset="1"
              stopColor="#d8e9a8"
              className="dark:[stop-color:#596844]"
            />
          </linearGradient>

          <linearGradient
            id={`${id}-nacre`}
            gradientUnits="userSpaceOnUse"
            x1="250"
            y1="-100"
            x2="1250"
            y2="1150"
          >
            <stop stopColor="#e9f5f2" className="dark:[stop-color:#16414c]" />
            <stop
              offset="0.22"
              stopColor="#bfdedb"
              className="dark:[stop-color:#2b646b]"
            />
            <stop
              offset="0.42"
              stopColor="#f8fcfa"
              className="dark:[stop-color:#54898c]"
            />
            <stop
              offset="0.48"
              stopColor="#b7d7d5"
              className="dark:[stop-color:#2c676d]"
            />
            <stop
              offset="0.53"
              stopColor="#357e91"
              className="dark:[stop-color:#0a3447]"
            />
            <stop
              offset="0.66"
              stopColor="#8ac2c4"
              className="dark:[stop-color:#2c707a]"
            />
            <stop
              offset="0.82"
              stopColor="#dceac0"
              className="dark:[stop-color:#425e4e]"
            />
            <stop
              offset="1"
              stopColor="#f8fcfa"
              className="dark:[stop-color:#32626a]"
            />
          </linearGradient>

          <filter
            id={`${id}-diffuse`}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
          >
            <feGaussianBlur stdDeviation="55" />
          </filter>
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="2"
              seed={g.seed % 997}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <path d="M0 0H1600V1000H0Z" fill={`url(#${id}-base)`} />
        <g transform={transform}>
          {treatment === "aurora" && (
            <>
              {g.fields.map((field, i) => (
                <ellipse
                  key={i}
                  cx={field.x}
                  cy={field.y}
                  rx={field.rx}
                  ry={field.ry}
                  fill={`url(#${id}-${i === 1 ? "lime" : "aqua"})`}
                />
              ))}
              <path
                d={g.aurora}
                fill={`url(#${id}-aurora)`}
                filter={`url(#${id}-diffuse)`}
                opacity="0.85"
              />
              <ellipse
                cx={g.focus}
                cy="250"
                rx="740"
                ry="470"
                fill={`url(#${id}-white)`}
              />
            </>
          )}
          {treatment === "threshold" && (
            <>
              <path
                d={g.upper}
                fill="#246e7e"
                opacity="0.15"
                transform="translate(0 16)"
                filter={`url(#${id}-diffuse)`}
              />
              <path d={g.upper} fill={`url(#${id}-upper)`} />
              <path
                d={g.upper}
                stroke="#ffffff"
                strokeWidth="2.5"
                opacity="0.7"
                className="dark:opacity-15"
              />
              <ellipse
                cx={g.focus - 150}
                cy="150"
                rx="1000"
                ry="650"
                fill={`url(#${id}-white)`}
                opacity="0.5"
              />
            </>
          )}
          {treatment === "nacre" && (
            <>
              <ellipse
                cx="1450"
                cy="1100"
                rx="1100"
                ry="900"
                fill={`url(#${id}-aqua)`}
              />
              <path d={g.nacre} fill={`url(#${id}-nacre)`} />
              <path
                d={g.nacre}
                stroke="#ffffff"
                strokeWidth="3"
                opacity="0.5"
                className="dark:opacity-15"
              />
              <ellipse
                cx={g.focus}
                cy="200"
                rx="920"
                ry="380"
                fill={`url(#${id}-white)`}
                opacity="0.5"
              />
            </>
          )}
        </g>

        <path
          d="M0 0H1600V1000H0Z"
          filter={`url(#${id}-grain)`}
          opacity="0.055"
          className="dark:opacity-[0.025]"
        />
      </svg>
      <CoverIsotype />
    </div>
  );
}

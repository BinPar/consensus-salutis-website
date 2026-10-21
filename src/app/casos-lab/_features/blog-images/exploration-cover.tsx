"use client";

import { useId, useMemo } from "react";
import { CoverIsotype } from "./cover-isotype";
import { explorationGeometry } from "./exploration-geometry";
import type { ExplorationTreatment } from "./blog-images-directions";

export function ExplorationCover({
  slug,
  treatment,
  className = "",
}: {
  slug: string;
  treatment: ExplorationTreatment;
  className?: string;
}) {
  const id = `lab-exploration-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const geometry = useMemo(() => explorationGeometry(slug), [slug]);
  return (
    <div className={`pointer-events-none relative h-full w-full ${className}`}>
      <svg
        aria-hidden="true"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        data-cover-treatment={treatment}
        className="block h-full w-full text-[#006d79] dark:text-[#00bcbb]"
      >
        <defs>
          <linearGradient id={`${id}-ground`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#a4d3d5" className="dark:[stop-color:#123b48]" />
            <stop
              offset="0.48"
              stopColor="#ecf6f6"
              className="dark:[stop-color:#0b202f]"
            />
            <stop
              offset="1"
              stopColor="#c3e0e5"
              className="dark:[stop-color:#155462]"
            />
          </linearGradient>
          <radialGradient
            id={`${id}-light`}
            gradientUnits="userSpaceOnUse"
            cx={geometry.glowX}
            cy={geometry.glowY}
            r="1100"
          >
            <stop
              stopColor="#f8ffff"
              stopOpacity="0.85"
              className="dark:[stop-color:#71d6d0] dark:[stop-opacity:0.2]"
            />
            <stop offset="1" stopColor="#f8ffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-relief`} x1="0" y1="0" x2="0.6" y2="1">
            <stop stopColor="#f0faf8" className="dark:[stop-color:#1d6974]" />
            <stop
              offset="0.3"
              stopColor="#aedbd8"
              className="dark:[stop-color:#124854]"
            />
            <stop
              offset="1"
              stopColor="#237f8e"
              className="dark:[stop-color:#061421]"
            />
          </linearGradient>
          <linearGradient id={`${id}-plane-0`} x2="1" y2="0.1">
            <stop
              stopColor="#268997"
              stopOpacity="0.92"
              className="dark:[stop-color:#1e7680]"
            />
            <stop offset="0.48" stopColor="#bde4df" stopOpacity="0.2" />
            <stop
              offset="1"
              stopColor="#f2fdfb"
              stopOpacity="0.9"
              className="dark:[stop-color:#3b8b92] dark:[stop-opacity:0.3]"
            />
          </linearGradient>
          <linearGradient id={`${id}-plane-1`} x2="1" y2="0">
            <stop
              stopColor="#f8ffff"
              stopOpacity="0.95"
              className="dark:[stop-color:#5ba7ac] dark:[stop-opacity:0.25]"
            />
            <stop offset="0.14" stopColor="#c9e9e7" stopOpacity="0.1" />
            <stop offset="1" stopColor="#006d79" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id={`${id}-plane-2`} x2="0.3" y2="1">
            <stop
              stopColor="#abdcd3"
              stopOpacity="0.8"
              className="dark:[stop-color:#25878c] dark:[stop-opacity:0.4]"
            />
            <stop offset="0.65" stopColor="#eaf6f7" stopOpacity="0.2" />
            <stop offset="1" stopColor="#237f93" stopOpacity="0.7" />
          </linearGradient>
          <radialGradient id={`${id}-rest`}>
            <stop
              stopColor="#f4fbfc"
              stopOpacity="0.8"
              className="dark:[stop-color:#0b2432] dark:[stop-opacity:0.9]"
            />
            <stop offset="1" stopColor="#f4fbfc" stopOpacity="0" />
          </radialGradient>
          <pattern
            id={`${id}-hatch`}
            width="9"
            height="9"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(25)"
          >
            <path
              d="M 0 0 V 9"
              stroke="currentColor"
              strokeWidth="0.8"
              opacity="0.13"
            />
          </pattern>
        </defs>
        <path d="M 0 0 H 1600 V 1000 H 0 Z" fill={`url(#${id}-ground)`} />
        {treatment === "interference" && (
          <g
            transform={
              geometry.mirror ? "translate(1600 0) scale(-1 1)" : undefined
            }
          >
            {geometry.rings.map((ring, i) => (
              <path
                key={i}
                d={ring.path}
                stroke={ring.group === 0 ? "currentColor" : "#45a0a4"}
                strokeWidth={ring.group === 0 ? "2.6" : "2"}
                opacity={ring.group === 0 ? "0.4" : "0.48"}
              />
            ))}
          </g>
        )}
        {treatment === "strata" && (
          <g transform={`rotate(${geometry.rotation} 800 500)`}>
            {geometry.layers.map((layer, i) => (
              <g key={i}>
                <path d={layer.body} fill={`url(#${id}-relief)`} />
                <path
                  d={layer.edge}
                  stroke="#005865"
                  strokeWidth="12"
                  opacity="0.12"
                  transform="translate(0 -5)"
                />
                <path
                  d={layer.edge}
                  stroke="#f5ffff"
                  strokeWidth="3"
                  opacity="0.7"
                  className="dark:opacity-25"
                />
              </g>
            ))}
          </g>
        )}
        {treatment === "refraction" && (
          <g transform={`rotate(${geometry.rotation} 800 500)`}>
            {geometry.facets.map((facet, i) => (
              <g key={i}>
                <path d={facet.body} fill={`url(#${id}-plane-${facet.tone})`} />
                <path
                  d={facet.body}
                  fill={`url(#${id}-hatch)`}
                  opacity={facet.tone === 0 ? "0.65" : "0.15"}
                />
                <path
                  d={facet.edge}
                  stroke="#f2ffff"
                  strokeWidth="3"
                  opacity="0.6"
                  className="dark:opacity-20"
                />
              </g>
            ))}
          </g>
        )}
        <path
          d="M 0 0 H 1600 V 1000 H 0 Z"
          fill={`url(#${id}-light)`}
          opacity={treatment === "interference" ? "0.6" : "0.22"}
        />
        <ellipse
          cx="800"
          cy="500"
          rx="300"
          ry="260"
          fill={`url(#${id}-rest)`}
          opacity="0.65"
        />
      </svg>
      <CoverIsotype />
    </div>
  );
}

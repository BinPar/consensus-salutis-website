"use client";

import { useId, useMemo } from "react";
import { CoverIsotype } from "./cover-isotype";
import { refinedCoverGeometry } from "./refined-geometry";

export function RefinedCover({ slug }: { slug: string }) {
  const id = `lab-refined-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { seed, signals, mainBlob, offsetBlob, tilt } = useMemo(
    () => refinedCoverGeometry(slug),
    [slug],
  );
  return (
    <div className="pointer-events-none relative h-full w-full">
      <svg
        aria-hidden="true"
        viewBox="0 0 1600 700"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="text-primary-light dark:text-primary-dark block h-full w-full"
        data-cover-treatment="refined"
      >
        <defs>
          <linearGradient id={`${id}-ground`} x2="1" y2="1">
            <stop stopColor="#d2e9ed" className="dark:[stop-color:#0a2431]" />
            <stop
              offset="0.6"
              stopColor="#eaf6f7"
              className="dark:[stop-color:#0a1e2c]"
            />
            <stop
              offset="1"
              stopColor="#f3f9fb"
              className="dark:[stop-color:#0b1929]"
            />
          </linearGradient>
          <linearGradient
            id={`${id}-color`}
            gradientUnits="userSpaceOnUse"
            x1={160 + tilt * 320}
            y1="0"
            x2="1400"
            y2="700"
          >
            <stop
              stopColor="#168fa8"
              stopOpacity="0.76"
              className="dark:[stop-opacity:0.45]"
            />
            <stop
              offset="0.5"
              stopColor="#40bca8"
              stopOpacity="0.64"
              className="dark:[stop-opacity:0.3]"
            />
            <stop
              offset="1"
              stopColor="#d5ec99"
              stopOpacity="0.78"
              className="dark:[stop-opacity:0.17]"
            />
          </linearGradient>
          <radialGradient
            id={`${id}-ambient`}
            cx={0.15 + tilt * 0.45}
            cy="0.1"
            r="0.9"
          >
            <stop
              stopColor="#4cb5b6"
              stopOpacity="0.28"
              className="dark:[stop-opacity:0.12]"
            />
            <stop offset="1" stopColor="#4cb5b6" stopOpacity="0" />
          </radialGradient>
          <radialGradient
            id={`${id}-light`}
            cx={0.3 + tilt * 0.3}
            cy="0.08"
            r="0.85"
          >
            <stop
              stopColor="#ffffff"
              stopOpacity="0.25"
              className="dark:[stop-color:#a8f0e7] dark:[stop-opacity:0.12]"
            />
            <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.04" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-signal`} x2="1" y2="0.1">
            <stop stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="0.5" stopColor="currentColor" stopOpacity="0.45" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.26" />
          </linearGradient>
          <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.72"
              numOctaves="2"
              seed={seed % 997}
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <path d="M0 0H1600V700H0Z" fill={`url(#${id}-ground)`} />
        <path d="M0 0H1600V700H0Z" fill={`url(#${id}-ambient)`} />
        <path d={offsetBlob} fill={`url(#${id}-color)`} opacity="0.48" />
        <path d={mainBlob} fill={`url(#${id}-ground)`} opacity="0.94" />
        <path d={mainBlob} fill={`url(#${id}-color)`} opacity="0.85" />
        <path d={mainBlob} fill={`url(#${id}-light)`} />
        <path
          d={mainBlob}
          stroke="currentColor"
          strokeWidth="2.4"
          opacity="0.34"
        />
        {signals.map((signal, index) => (
          <path
            key={signal.path}
            d={signal.path}
            stroke={`url(#${id}-signal)`}
            strokeWidth={[3.2, 2.2, 1.6][index]}
          />
        ))}
        <path
          d="M0 0H1600V700H0Z"
          filter={`url(#${id}-grain)`}
          opacity="0.045"
          className="dark:opacity-[0.025]"
        />
      </svg>
      <CoverIsotype />
    </div>
  );
}

"use client";

import { useId } from "react";
import { SignatureCover } from "./signature-cover";
import { ExplorationCover } from "./exploration-cover";
import { RefinedCover } from "./refined-cover";
import { RefinedTwoCover } from "./refined-two-cover";
import { NeutralReferenceCover } from "./neutral-reference-cover";
import { FlowLines, FlowMotionSurface } from "./flow-motion";
import { CoverIsotype } from "./cover-isotype";
import { coverGeometry } from "./cover-geometry";
import type { CoverTreatment } from "./blog-images-directions";

export function AbstractCover({
  slug,
  treatment,
  className = "",
}: {
  slug: string;
  treatment: CoverTreatment;
  className?: string;
}) {
  const id = `lab-cover-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (treatment === "neutral-reference")
    return <NeutralReferenceCover slug={slug} className={className} />;
  if (
    treatment === "aurora" ||
    treatment === "threshold" ||
    treatment === "nacre"
  )
    return (
      <SignatureCover slug={slug} treatment={treatment} className={className} />
    );
  if (treatment === "refined") return <RefinedCover slug={slug} />;
  if (treatment === "refined-2") return <RefinedTwoCover slug={slug} />;
  if (
    treatment === "interference" ||
    treatment === "strata" ||
    treatment === "refraction"
  )
    return (
      <ExplorationCover
        slug={slug}
        treatment={treatment}
        className={className}
      />
    );
  const geometry = coverGeometry(slug);
  const artwork = (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        className="pointer-events-none block h-full w-full text-[#006d79] dark:text-[#00bcbb]"
        data-cover-treatment={treatment}
      >
        <defs>
          <linearGradient id={`${id}-base`} x2="1" y2="1">
            <stop stopColor="#f0f8fa" className="dark:[stop-color:#0a2330]" />
            <stop
              offset="1"
              stopColor="#e5f1f5"
              className="dark:[stop-color:#081827]"
            />
          </linearGradient>
          {geometry.fields.map((field, i) => (
            <radialGradient key={i} id={`${id}-field-${i}`}>
              <stop
                stopColor={["#39adaf", "#abdcd3", "#ffffff"][field.tone]}
                className={field.tone === 2 ? "dark:[stop-color:#4a8b9d]" : ""}
              />
              <stop
                offset="1"
                stopColor={["#39adaf", "#abdcd3", "#ffffff"][field.tone]}
                stopOpacity="0"
              />
            </radialGradient>
          ))}
          <linearGradient id={`${id}-band`} x1="0" x2="1" y2="0.6">
            <stop stopColor="#ffffff" stopOpacity="0" />
            <stop
              offset="0.45"
              stopColor="#ffffff"
              stopOpacity="0.65"
              className="dark:[stop-color:#85e0dd] dark:[stop-opacity:0.12]"
            />
            <stop offset="1" stopColor="#006d79" stopOpacity="0.14" />
          </linearGradient>
        </defs>
        <path d="M 0 0 H 1600 V 1000 H 0 Z" fill={`url(#${id}-base)`} />
        {geometry.fields.map((field, i) => (
          <ellipse
            key={i}
            cx={field.x}
            cy={field.y}
            rx={field.radius}
            ry={field.radius * field.squash}
            fill={`url(#${id}-field-${i})`}
            opacity={field.opacity * (treatment === "light" ? 1.4 : 1)}
          />
        ))}
        {treatment === "flow" && <FlowLines lines={geometry.lines} />}
        {treatment === "veil" && (
          <g transform={`rotate(${geometry.rotation} 800 500)`}>
            {geometry.bands.map((band, i) => (
              <path
                key={i}
                d={band}
                fill={`url(#${id}-band)`}
                stroke="currentColor"
                strokeOpacity="0.045"
              />
            ))}
          </g>
        )}
        <g
          fill="currentColor"
          opacity={treatment === "veil" ? "0.09" : "0.035"}
        >
          {geometry.grain.map((dot, i) => (
            <circle key={i} cx={dot.x} cy={dot.y} r={dot.r} />
          ))}
        </g>
      </svg>
      <CoverIsotype />
    </>
  );
  return treatment === "flow" ? (
    <FlowMotionSurface className={className}>{artwork}</FlowMotionSurface>
  ) : (
    <div className={`pointer-events-none relative h-full w-full ${className}`}>
      {artwork}
    </div>
  );
}

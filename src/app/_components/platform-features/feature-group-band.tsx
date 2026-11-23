"use client";

import {
  ProcessBackground,
  surfaceMask,
} from "../success-cases/success-cases-surfaces";
import { FeatureGroup } from "./feature-group";
import type { FeatureGroupSection } from "./feature-groups";

export const sectionBlendDepth = "clamp(160px, 22vw, 360px)";
export const sectionFadeIn = surfaceMask(sectionBlendDepth);
export const sectionFadeOut = sectionFadeIn.replace("to bottom", "to top");

/**
 * One feature group as a full-width band. Bands alternate between the white
 * surface and the process surface, blended into each other over a broad edge,
 * as the features zone of /plataforma does.
 */
export function FeatureGroupBand({
  section,
  index,
}: {
  section: FeatureGroupSection;
  index: number;
}) {
  const blend = {
    top: `calc(${sectionBlendDepth} / -2)`,
    bottom: `calc(${sectionBlendDepth} / -2)`,
  };
  return (
    <section
      id={section.id}
      tabIndex={-1}
      data-section-anchor
      aria-labelledby={`platform-group-${section.id}`}
      className="section-navigation-inset relative scroll-mt-32 px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
    >
      {index % 2 === 1 ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-white dark:bg-[#06111f]"
          style={{
            ...blend,
            maskImage: `${sectionFadeIn}, ${sectionFadeOut}`,
            maskComposite: "intersect",
          }}
        />
      ) : (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-1"
          style={blend}
        >
          <ProcessBackground
            fadeToProduct
            continuationSurface={index === 0 ? "transparent" : "base"}
            blendDepth={sectionBlendDepth}
            softFadeOut
          />
        </div>
      )}
      <div className="relative z-30 mx-auto w-full max-w-7xl">
        <FeatureGroup section={section} />
      </div>
    </section>
  );
}

// Carry the cases surface into the next section, easing it away over a broad band.
const lowerBlendDepth = "clamp(112px, 18vw, 280px)";
const lowerBlendStops = [
  0, 0.028, 0.104, 0.216, 0.352, 0.5, 0.648, 0.784, 0.896, 0.972, 1,
];
const casesSurfaceMask =
  "linear-gradient(to bottom, transparent, black clamp(64px, 10vw, 144px))";
export function surfaceMask(depth: string, inverse = false) {
  return `linear-gradient(to bottom, ${lowerBlendStops
    .map(
      (opacity, index) =>
        `rgba(0, 0, 0, ${inverse ? 1 - opacity : opacity}) calc((${depth} - 24px) * ${index / 10})`,
    )
    .join(", ")}, ${inverse ? "transparent" : "black"})`;
}

export function IntroductionBottomFade() {
  return (
    <div
      aria-hidden="true"
      data-introduction-bottom-fade=""
      className="pointer-events-none absolute inset-x-0 bottom-0 z-1 bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"
      style={{
        height: "clamp(320px, 48vw, 560px)",
        maskImage: `linear-gradient(to bottom, ${lowerBlendStops
          .map(
            (opacity, index) =>
              `rgba(0, 0, 0, ${opacity * opacity}) ${index * 10}%`,
          )
          .join(", ")})`,
      }}
    />
  );
}

export function CasesBackground({ fadeIn = true }: { fadeIn?: boolean }) {
  return (
    <div
      aria-hidden="true"
      data-case-background-blend=""
      className="pointer-events-none absolute inset-0 bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"
      style={{ maskImage: fadeIn ? casesSurfaceMask : undefined }}
    />
  );
}

export function ProcessBackground({
  fadeToProduct = false,
  continuationSurface = "cases",
  blendDepth = lowerBlendDepth,
  fadeInDepth = blendDepth,
  softFadeOut = false,
}: {
  fadeToProduct?: boolean;
  continuationSurface?: "cases" | "base" | "transparent";
  blendDepth?: string;
  fadeInDepth?: string;
  softFadeOut?: boolean;
}) {
  return (
    <>
      <div
        aria-hidden="true"
        data-process-background-blend=""
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"
        style={{
          maskImage: surfaceMask(fadeInDepth),
        }}
      />
      {continuationSurface !== "transparent" && (
        <div
          aria-hidden="true"
          data-cases-surface-continuation=""
          className={`pointer-events-none absolute inset-x-0 top-0 bg-white ${continuationSurface === "base" ? "dark:bg-[#06111f]" : "dark:bg-[#030916]/40"}`}
          style={{
            height: blendDepth,
            maskImage: surfaceMask(blendDepth, true),
          }}
        />
      )}
      {fadeToProduct && (
        <div
          aria-hidden="true"
          data-product-background-transition=""
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 ${softFadeOut ? "bg-white dark:bg-[#06111f]" : "bg-linear-to-b from-transparent to-white dark:to-[#06111f]"}`}
          style={{
            height:
              blendDepth === lowerBlendDepth
                ? "clamp(160px, 18vw, 280px)"
                : blendDepth,
            maskImage: softFadeOut ? surfaceMask(blendDepth) : undefined,
          }}
        />
      )}
    </>
  );
}

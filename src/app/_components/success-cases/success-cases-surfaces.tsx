// Carry the cases surface into the next section, easing it away over a broad band.
const lowerBlendDepth = "clamp(112px, 18vw, 280px)";
const lowerBlendStops = [
  0, 0.028, 0.104, 0.216, 0.352, 0.5, 0.648, 0.784, 0.896, 0.972, 1,
];
const casesSurfaceMask =
  "linear-gradient(to bottom, transparent, black clamp(64px, 10vw, 144px))";
const continuedCasesMask = `linear-gradient(to bottom, ${lowerBlendStops
  .map(
    (opacity, index) =>
      `rgba(0, 0, 0, ${1 - opacity}) calc((${lowerBlendDepth} - 24px) * ${index / 10})`,
  )
  .join(", ")}, transparent)`;
const processSurfaceMask = `linear-gradient(to bottom, ${lowerBlendStops
  .map(
    (opacity, index) =>
      `rgba(0, 0, 0, ${opacity}) calc((${lowerBlendDepth} - 24px) * ${index / 10})`,
  )
  .join(", ")}, black)`;

export function CasesBackground() {
  return (
    <div
      aria-hidden="true"
      data-case-background-blend=""
      className="pointer-events-none absolute inset-0 bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"
      style={{ maskImage: casesSurfaceMask }}
    />
  );
}

export function ProcessBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        data-process-background-blend=""
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"
        style={{
          maskImage: processSurfaceMask,
        }}
      />
      <div
        aria-hidden="true"
        data-cases-surface-continuation=""
        className="pointer-events-none absolute inset-x-0 top-0 bg-white dark:bg-[#030916]/40"
        style={{
          height: lowerBlendDepth,
          maskImage: continuedCasesMask,
        }}
      />
    </>
  );
}

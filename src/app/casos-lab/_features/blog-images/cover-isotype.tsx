// Lab-only foreground, shared by experimental and reference covers.
// Independent of the background crop; always capped at 48px.
export function CoverIsotype() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className="absolute top-1/2 left-1/2 aspect-square w-[14%] max-w-12 -translate-x-1/2 -translate-y-1/2"
      data-cover-foreground=""
    >
      <image
        href="/logos/binpar-brand/binpar-isotipo-light.svg"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        className="dark:hidden"
        data-cover-isotype="light"
      />
      <image
        href="/logos/binpar-brand/binpar-isotipo-dark.svg"
        width="100"
        height="100"
        preserveAspectRatio="xMidYMid meet"
        className="hidden dark:block"
        data-cover-isotype="dark"
      />
    </svg>
  );
}

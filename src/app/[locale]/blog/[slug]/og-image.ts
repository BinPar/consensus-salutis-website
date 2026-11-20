/**
 * La imagen para compartir de cada post: la genera `opengraph-image/route.tsx`.
 *
 * El `alt` depende del idioma: lo pone la página (`blog.og.alt`).
 */
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: "image/png",
} as const;

/**
 * Tamaño y tipo de las imágenes para compartir (las dibuja `og-card.tsx`).
 *
 * Van aparte de la tarjeta para que los metadatos (`~/i18n/metadata`) puedan
 * anunciarlas sin cargar `next/og` ni JSX.
 */
export const OG_IMAGE = {
  width: 1200,
  height: 630,
  type: "image/png",
} as const;

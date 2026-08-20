import type { ReactNode } from "react";

/**
 * El *eyebrow* del sistema: Sora extrabold, 12px, versalitas anchas, en acento.
 *
 * Vive en su propio módulo y no en `site.tsx` porque también lo usan pantallas
 * de cliente —el aviso de sesión del evaluador—, y `site.tsx` arrastra la
 * cabecera, el pie y el mock del chat: importarlo desde un componente cliente
 * metía todo eso en el bundle del navegador para reutilizar una línea de clases.
 * `site.tsx` lo re-exporta, así que los imports existentes siguen valiendo.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-primary-light font-display dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
      {children}
    </p>
  );
}

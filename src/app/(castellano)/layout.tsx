/*
  Secciones que solo existen en castellano: el evaluador, el informe y el
  espacio de cliente. El grupo `(castellano)` no cambia sus URL; les da un
  layout raíz propio fuera de `[locale]` (ver `root-document.tsx`) y deja que
  el `title.template` de la marca se aplique a sus páginas.
*/
import { rootMetadata } from "~/app/_components/root-document";
import { SpanishRootLayout } from "~/app/_components/spanish-root-layout";
import { routing } from "~/i18n/routing";

export function generateMetadata() {
  return rootMetadata(routing.defaultLocale);
}

export default SpanishRootLayout;

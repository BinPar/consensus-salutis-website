/* Sección solo en castellano, fuera de `[locale]`: ver `root-document.tsx`. */
import { rootMetadata } from "~/app/_components/root-document";
import { SpanishRootLayout } from "~/app/_components/spanish-root-layout";
import { routing } from "~/i18n/routing";

export function generateMetadata() {
  return rootMetadata(routing.defaultLocale);
}

export default SpanishRootLayout;

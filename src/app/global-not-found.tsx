import type { Metadata } from "next";

import { rootMetadata } from "~/app/_components/root-document";
import SpanishNotFound, {
  notFoundTitle,
} from "~/app/_components/spanish-not-found";
import { SpanishRootLayout } from "~/app/_components/spanish-root-layout";
import { routing } from "~/i18n/routing";

/*
  404 de las URL que no casan con ninguna ruta (un fichero que no existe, por
  ejemplo). Necesita `experimental.globalNotFound` porque el sitio no tiene un
  layout raíz único, y pone su propio documento. Al no colgar de ningún layout,
  el `title.template` de la marca no le llega: el título va completo.
*/
export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await rootMetadata(routing.defaultLocale)),
    title: { absolute: `${await notFoundTitle()} | BinPar` },
  };
}

export default function GlobalNotFound() {
  return (
    <SpanishRootLayout>
      <SpanishNotFound />
    </SpanishRootLayout>
  );
}

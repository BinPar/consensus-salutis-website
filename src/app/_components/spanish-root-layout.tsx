import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { RootDocument } from "~/app/_components/root-document";
import { clientMessages } from "~/i18n/client-messages";
import { routing } from "~/i18n/routing";

/**
 * Layout raíz de lo que solo existe en castellano: `(castellano)`,
 * `casos-lab` y `global-not-found.tsx`.
 *
 * No hay idioma en la URL, así que se fija el de por defecto. Los textos
 * bajan igual que en `[locale]` porque la cabecera, el pie y el 404 son los
 * mismos componentes y los necesitan.
 */
export async function SpanishRootLayout({ children }: { children: ReactNode }) {
  setRequestLocale(routing.defaultLocale);
  const messages = await getMessages();

  return (
    <RootDocument lang={routing.defaultLocale}>
      <NextIntlClientProvider messages={clientMessages(messages)}>
        {children}
      </NextIntlClientProvider>
    </RootDocument>
  );
}

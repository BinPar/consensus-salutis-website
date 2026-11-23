import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { rootMetadata, RootDocument } from "~/app/_components/root-document";
import { clientMessages } from "~/i18n/client-messages";
import { OG_LOCALES, routing } from "~/i18n/routing";
import { resolveLocale, type LocaleParams } from "~/i18n/server";

/* Un árbol estático por idioma. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/*
  Un primer segmento que no es un idioma (`/foo.png`, que el middleware no
  toca) es 404 directamente. Sin esto Next intentaría renderizar `[locale]` con
  `locale = "foo.png"` y el 404 de dentro fallaría al no tener idioma.
*/
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);

  return {
    ...(await rootMetadata(locale)),
    openGraph: { siteName: "BinPar", locale: OG_LOCALES[locale] },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: React.ReactNode }) {
  const locale = await resolveLocale(params);
  const messages = await getMessages();

  return (
    <RootDocument lang={locale}>
      {/* Qué textos bajan al navegador: ver `~/i18n/client-messages`. */}
      <NextIntlClientProvider messages={clientMessages(messages)}>
        {children}
      </NextIntlClientProvider>
    </RootDocument>
  );
}

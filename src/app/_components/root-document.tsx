/**
 * El documento HTML del sitio: `<html>`, tema, fuentes y movimiento.
 *
 * No hay un `src/app/layout.tsx` único porque `<html lang>` depende del
 * idioma: cada árbol tiene su layout raíz y todos usan este documento.
 *
 * - `src/app/[locale]/layout.tsx`: las páginas públicas, con su idioma.
 * - `(castellano)` (evaluador, informe, espacio) y `casos-lab`: solo en
 *   castellano.
 * - `src/app/global-not-found.tsx`: las URL que no casan con ninguna ruta.
 */
import "~/styles/globals.css";

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { MotionProvider } from "~/app/_components/motion-system";
import { WebAnalytics } from "~/app/_components/web-analytics";
import type { Locale } from "~/i18n/routing";
import { getSiteUrl } from "~/lib/site";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
});

/** Metadatos comunes a todos los layouts raíz, salvo los que dependen del idioma. */
const baseMetadata: Metadata = {
  /*
    `metadataBase`: sin ella Next resuelve las URLs de Open Graph contra
    `localhost` y avisa en cada build.
  */
  metadataBase: new URL(getSiteUrl()),
  alternates: {
    types: {
      "application/rss+xml": "/blog/rss.xml",
    },
  },
  title: {
    default: "BinPar",
    template: "%s | BinPar",
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg?v=9481f324eb6c",
        type: "image/svg+xml",
        sizes: "any",
      },
    ],
    shortcut: [
      {
        url: "/favicon.svg?v=9481f324eb6c",
        type: "image/svg+xml",
      },
    ],
  },
};

/** Metadatos de un layout raíz en un idioma: los comunes más la descripción. */
export async function rootMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common.meta" });

  return { ...baseMetadata, description: t("description") };
}

export function RootDocument({
  lang,
  children,
}: {
  lang: string;
  children: ReactNode;
}) {
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem("consensus-theme");const d=t==="dark";document.documentElement.classList.toggle("dark",d);document.documentElement.style.colorScheme=d?"dark":"light"}catch(e){document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light"}`,
          }}
        />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${sora.variable} min-h-screen bg-[#f4f9fc] font-sans text-slate-900 antialiased dark:bg-[#06111f] dark:text-slate-50`}
      >
        <MotionProvider>{children}</MotionProvider>
        <WebAnalytics />
      </body>
    </html>
  );
}

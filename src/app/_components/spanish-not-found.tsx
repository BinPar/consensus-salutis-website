import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { NotFoundContent } from "~/app/_components/not-found-content";
import { routing } from "~/i18n/routing";

/*
  404 de lo que queda fuera de `[locale]`: `(castellano)`, el laboratorio y
  `global-not-found.tsx`. Ahí no hay idioma en la URL,
  así que se fija el de por defecto. Sin `setRequestLocale`, next-intl lo
  buscaría en las cabeceras y Next daría un 500 en vez del 404.
*/
export async function notFoundTitle() {
  setRequestLocale(routing.defaultLocale);
  const t = await getTranslations("common.notFound");

  return t("metaTitle");
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: await notFoundTitle() };
}

export default function SpanishNotFound() {
  setRequestLocale(routing.defaultLocale);

  return <NotFoundContent />;
}

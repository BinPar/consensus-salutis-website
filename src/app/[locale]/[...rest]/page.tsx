import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { resolveLocale, type LocaleParams } from "~/i18n/server";

/*
  Cualquier ruta de un idioma que no existe cae aquí y lanza el 404 dentro de
  `[locale]`, con su layout y su idioma. Sin esta página Next saltaría al 404
  global, que no sabe en qué idioma está.

  El título va también aquí y no solo en `not-found.tsx`: en el navegador manda
  el de la ruta que se ha pintado, y sin él la pestaña volvía a «BinPar».
*/
export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "common.notFound" });

  return { title: t("metaTitle") };
}

export default function CatchAllPage() {
  notFound();
}

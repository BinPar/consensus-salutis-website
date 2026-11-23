import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { NotFoundContent } from "~/app/_components/not-found-content";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common.notFound");

  /* El `noindex` ya lo pone Next en toda respuesta 404. */
  return { title: t("metaTitle") };
}

export default function LocaleNotFound() {
  return <NotFoundContent />;
}

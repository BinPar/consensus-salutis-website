import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";

import { PlatformWalkthrough } from "~/app/_components/platform-walkthrough";
import { PageShell } from "~/app/_components/site";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "platform.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/plataforma"),
  };
}

export default async function PlataformaPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <PageShell>
      <PlatformWalkthrough />
    </PageShell>
  );
}

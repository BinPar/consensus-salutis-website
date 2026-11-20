import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";

import { FeaturesOverview } from "~/app/_components/platform-features/features-overview";
import { PageShell } from "~/app/_components/site";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "features.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/plataforma/funcionalidades"),
  };
}

export default async function FuncionalidadesPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <PageShell>
      <FeaturesOverview />
    </PageShell>
  );
}

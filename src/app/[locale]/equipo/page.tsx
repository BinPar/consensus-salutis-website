import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";
import { PageShell } from "~/app/_components/site";
import { TeamPage } from "~/app/_components/team/team-page";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "team.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/equipo"),
  };
}

export default async function EquipoPage({ params }: LocaleParams) {
  await resolveLocale(params);

  return (
    <PageShell>
      <TeamPage />
    </PageShell>
  );
}

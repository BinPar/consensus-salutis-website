import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  LEGAL_OWNER,
  LegalLink,
  LegalPage,
  LegalSection,
} from "~/app/_components/legal-page";
import { localizedMetadata } from "~/i18n/metadata";
import { resolveLocale, type LocaleParams } from "~/i18n/server";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legal.notice.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/aviso-legal"),
  };
}

export default async function LegalNoticePage({ params }: LocaleParams) {
  await resolveLocale(params);
  const t = await getTranslations("legal.notice");

  return (
    <LegalPage title={t("title")}>
      <LegalSection title={t("sections.owner.title")}>
        <p>{t("sections.owner.body", LEGAL_OWNER)}</p>
      </LegalSection>
      <LegalSection title={t("sections.use.title")}>
        <p>{t("sections.use.body")}</p>
        <p>{t("sections.use.medical")}</p>
      </LegalSection>
      <LegalSection title={t("sections.ip.title")}>
        <p>{t("sections.ip.body", { name: LEGAL_OWNER.name })}</p>
      </LegalSection>
      <LegalSection title={t("sections.liability.title")}>
        <p>{t("sections.liability.body")}</p>
      </LegalSection>
      <LegalSection title={t("sections.data.title")}>
        <p>
          {t.rich("sections.data.body", {
            privacy: (chunks) => (
              <LegalLink href="/privacidad">{chunks}</LegalLink>
            ),
            cookies: (chunks) => (
              <LegalLink href="/cookies">{chunks}</LegalLink>
            ),
          })}
        </p>
      </LegalSection>
      <LegalSection title={t("sections.law.title")}>
        <p>{t("sections.law.body")}</p>
      </LegalSection>
    </LegalPage>
  );
}

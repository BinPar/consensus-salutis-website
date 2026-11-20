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
import { REGISTRATION_COOKIE_NAME } from "~/server/marketplace/registration";
import { SESSION_COOKIE_NAME } from "~/server/marketplace/session";
import { SPACE_COOKIE_NAME } from "~/server/marketplace/space-session";

export async function generateMetadata({
  params,
}: LocaleParams): Promise<Metadata> {
  const locale = await resolveLocale(params);
  const t = await getTranslations({ locale, namespace: "legal.cookies.meta" });

  return {
    title: t("title"),
    description: t("description"),
    ...localizedMetadata(locale, "/cookies"),
  };
}

/*
  La lista sale del código, no de una plantilla: si se añade una cookie o un
  servicio de terceros (analítica, vídeo, etc.), esta página y, si deja de ser
  técnica, un aviso de consentimiento tienen que cambiar con ella. Los textos de
  cada fila están en `legal.cookies.items`, con la misma clave que aquí.
*/
const storageItems = [
  { id: "session", name: SESSION_COOKIE_NAME, kind: "ownCookie" },
  { id: "space", name: SPACE_COOKIE_NAME, kind: "ownCookie" },
  { id: "registration", name: REGISTRATION_COOKIE_NAME, kind: "ownCookie" },
  { id: "theme", name: "consensus-theme", kind: "ownStorage" },
] as const;

export default async function CookiesPage({ params }: LocaleParams) {
  await resolveLocale(params);
  const t = await getTranslations("legal.cookies");

  return (
    <LegalPage title={t("title")}>
      <LegalSection title={t("sections.what.title")}>
        <p>{t("sections.what.body")}</p>
        <p>{t("sections.what.session")}</p>
      </LegalSection>
      <LegalSection title={t("sections.detail.title")}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm leading-6">
            <thead className="font-display text-navy dark:text-slate-100">
              <tr className="dark:border-primary-dark/15 border-b border-cyan-800/15">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {t("sections.detail.columns.name")}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {t("sections.detail.columns.kind")}
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  {t("sections.detail.columns.purpose")}
                </th>
                <th scope="col" className="py-2 font-semibold">
                  {t("sections.detail.columns.duration")}
                </th>
              </tr>
            </thead>
            <tbody>
              {storageItems.map((item) => (
                <tr
                  key={item.name}
                  className="dark:border-primary-dark/10 border-b border-cyan-800/10 align-top"
                >
                  <td className="py-3 pr-4 font-mono text-xs leading-6">
                    {item.name}
                  </td>
                  <td className="py-3 pr-4">{t(`kinds.${item.kind}`)}</td>
                  <td className="py-3 pr-4">{t(`items.${item.id}.purpose`)}</td>
                  <td className="py-3">{t(`items.${item.id}.duration`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LegalSection>
      <LegalSection title={t("sections.thirdParty.title")}>
        <p>
          {t.rich("sections.thirdParty.body", {
            contact: (chunks) => (
              <LegalLink href="/contacto">{chunks}</LegalLink>
            ),
          })}
        </p>
      </LegalSection>
      <LegalSection title={t("sections.manage.title")}>
        <p>{t("sections.manage.body")}</p>
        <p>
          {t.rich("sections.manage.contact", {
            email: LEGAL_OWNER.email,
            privacy: (chunks) => (
              <LegalLink href="/privacidad">{chunks}</LegalLink>
            ),
          })}
        </p>
      </LegalSection>
    </LegalPage>
  );
}

/**
 * Enlaces del menú y del pie, con su texto en el idioma de la página.
 *
 * Son hooks y no constantes porque el texto sale de next-intl. Funcionan en
 * componentes de servidor síncronos y en componentes de cliente.
 */
import { useTranslations } from "next-intl";

import type { StaticPathname } from "~/i18n/routing";

import type { NavigationItem } from "./site-navigation";

export const CONTACT_EMAIL = "info@binpar.com";

export type ContactItem =
  | { kind: "page"; href: StaticPathname; label: string }
  | { kind: "mail"; href: string; label: string };

export function useNavItems(): NavigationItem[] {
  const t = useTranslations("layout.nav");

  return [
    { href: "/", label: t("home") },
    {
      href: "/plataforma",
      label: t("platform"),
      children: [
        { href: "/plataforma", label: t("platformOverview") },
        { href: "/plataforma/funcionalidades", label: t("features") },
      ],
    },
    { href: "/equipo", label: t("team") },
    { href: "/blog", label: t("blog") },
    { href: "/contacto", label: t("contact") },
  ];
}

export function useContactItems(): ContactItem[] {
  const t = useTranslations("common.cta");

  return [
    { kind: "page", href: "/contacto", label: t("meeting") },
    {
      kind: "mail",
      href: `mailto:${CONTACT_EMAIL}?subject=BinPar`,
      label: CONTACT_EMAIL,
    },
  ];
}

/** Páginas legales, en el orden en que se muestran en el pie. */
export function useLegalItems(): { href: StaticPathname; label: string }[] {
  const t = useTranslations("layout.legalLinks");

  return [
    { href: "/aviso-legal", label: t("notice") },
    { href: "/privacidad", label: t("privacy") },
    { href: "/cookies", label: t("cookies") },
  ];
}

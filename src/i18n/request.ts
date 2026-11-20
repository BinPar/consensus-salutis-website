import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import type { Messages } from "../../messages/es";
import { routing, type Locale } from "./routing";

/* Un import por idioma: cada petición carga solo los textos de su idioma. */
const loaders: Record<Locale, () => Promise<{ default: Messages }>> = {
  es: () => import("../../messages/es"),
  en: () => import("../../messages/en"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await loaders[locale]()).default,
    timeZone: "Europe/Madrid",
  };
});

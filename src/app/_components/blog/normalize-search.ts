import { useLocale } from "next-intl";
import { useCallback } from "react";

import { LOCALE_TAGS, routing } from "~/i18n/routing";

/**
 * Accent- and case-insensitive form of a search term or the text it searches.
 *
 * `localeTag` decide las minúsculas (`I` → `ı` en turco). Sin él se usa el del
 * idioma por defecto, que es lo que hacía antes de haber más de uno.
 */
export const normalizeSearch = (
  text: string,
  localeTag: string = LOCALE_TAGS[routing.defaultLocale],
) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase(localeTag).trim();

/** `normalizeSearch` con el idioma de la página; estable entre renders. */
export function useNormalizeSearch() {
  const localeTag = LOCALE_TAGS[useLocale()];

  return useCallback(
    (text: string) => normalizeSearch(text, localeTag),
    [localeTag],
  );
}

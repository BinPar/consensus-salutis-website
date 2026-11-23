import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { routing, type Locale } from "./routing";

/** Props de las páginas y layouts que cuelgan de `src/app/[locale]`. */
export type LocaleParams = { params: Promise<{ locale: string }> };

/**
 * Valida el idioma de la URL y lo fija para el resto del render.
 *
 * Se llama al principio de cada layout y página de `[locale]`: Next renderiza
 * layouts y páginas por separado, y sin `setRequestLocale` en los dos next-intl
 * leería el idioma de las cabeceras y la página dejaría de ser estática.
 */
export async function resolveLocale(
  params: LocaleParams["params"],
): Promise<Locale> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return locale;
}

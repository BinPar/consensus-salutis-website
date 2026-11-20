"use client";

/**
 * Las versiones de la página actual en otros idiomas, para el selector.
 *
 * Una página con las mismas rutas en todos los idiomas no lo necesita: el
 * selector cambia el idioma de la ruta que ya tiene. Lo ponen las páginas cuya
 * ruta cambia de un idioma a otro, como un post (otro slug) o una etiqueta del
 * blog (no existe en el otro idioma), y dicen adónde ir si no hay versión.
 */
import { createContext, useContext, type ReactNode } from "react";

import type { LocalizedVersions } from "~/i18n/metadata";
import type { StaticPathname } from "~/i18n/routing";

type Alternates = {
  versions: LocalizedVersions;
  /** Adónde va el selector en un idioma sin versión de esta página. */
  fallback: StaticPathname;
};

const LocaleAlternatesContext = createContext<Alternates | null>(null);

export function LocaleAlternates({
  versions,
  fallback,
  children,
}: Alternates & { children: ReactNode }) {
  return (
    <LocaleAlternatesContext.Provider value={{ versions, fallback }}>
      {children}
    </LocaleAlternatesContext.Provider>
  );
}

export function useLocaleAlternates() {
  return useContext(LocaleAlternatesContext);
}

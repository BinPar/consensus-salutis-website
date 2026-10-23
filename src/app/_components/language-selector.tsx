"use client";

import { Globe } from "lucide-react";
import { useState } from "react";
import { SelectMenu } from "./select-menu";

const languages = [
  { value: "es", label: "Castellano", lang: "es" },
  { value: "ca", label: "Catalán", lang: "ca" },
  { value: "gl", label: "Gallego", lang: "gl" },
  { value: "eu", label: "Euskera", lang: "eu" },
  { value: "en", label: "Inglés", lang: "en" },
] as const;

/** Control de presentación; la selección no modifica el contenido ni la ruta. */
export function LanguageSelector() {
  const [language, setLanguage] = useState("es");

  return (
    <SelectMenu
      value={language}
      onChange={setLanguage}
      options={languages}
      label="Seleccionar idioma"
      className="shrink-0"
      menuClassName="w-36"
      triggerClassName="font-body border-primary-light/20 hover:border-primary-light/40 dark:bg-primary-dark/8 dark:text-primary-dark-lighter inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border bg-white/30 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none dark:border-cyan-300/20 dark:hover:border-cyan-200/45 dark:hover:bg-cyan-300/15 dark:hover:text-white dark:focus-visible:outline-cyan-300"
      triggerContent={
        <>
          <Globe aria-hidden="true" size={16} strokeWidth={1.8} />
          <span>{language.toUpperCase()}</span>
        </>
      }
    />
  );
}

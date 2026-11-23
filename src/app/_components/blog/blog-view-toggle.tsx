"use client";

import { LayoutGrid, List } from "lucide-react";
import { useTranslations } from "next-intl";

export type BlogGalleryView = "grid" | "list";

/* Vistas de la galería; el texto de cada una sale de `blog.viewToggle.options`. */
const viewOptions = [
  { value: "grid", Icon: LayoutGrid },
  { value: "list", Icon: List },
] as const;

export function BlogViewToggle({
  value,
  onChange,
}: {
  value: BlogGalleryView;
  onChange: (view: BlogGalleryView) => void;
}) {
  const t = useTranslations("blog.viewToggle");

  return (
    <div
      role="group"
      aria-label={t("label")}
      className="border-primary-light/60 dark:border-primary-dark/20 inline-flex h-[32px] shrink-0 items-center gap-[2px] rounded-full border bg-white/80 p-[2px] dark:bg-[#152230]/90"
    >
      {viewOptions.map(({ value: option, Icon }) => {
        const label = t(`options.${option}`);

        return (
          <button
            key={option}
            type="button"
            aria-label={label}
            aria-pressed={value === option}
            title={label}
            onClick={() => onChange(option)}
            className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${value === option ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#04111e]" : "dark:hover:bg-primary-dark/10 dark:hover:text-primary-dark text-slate-500 hover:bg-cyan-800/5 hover:text-cyan-800 dark:text-slate-400"}`}
          >
            <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}

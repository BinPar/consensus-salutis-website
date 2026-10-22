"use client";

import { LayoutGrid, List } from "lucide-react";

export type BlogGalleryView = "grid" | "list";

export function BlogPageViewToggle({
  value,
  onChange,
}: {
  value: BlogGalleryView;
  onChange: (view: BlogGalleryView) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Vista de la galería"
      className="border-primary-light/60 inline-flex h-[32px] shrink-0 items-center gap-[2px] rounded-full border bg-white/80 p-[2px] dark:border-cyan-300/20 dark:bg-[#152230]/90"
    >
      {(
        [
          { value: "grid", label: "Vista de fichas", Icon: LayoutGrid },
          { value: "list", label: "Vista de lista", Icon: List },
        ] as const
      ).map(({ value: option, label, Icon }) => (
        <button
          key={option}
          type="button"
          aria-label={label}
          aria-pressed={value === option}
          title={label}
          onClick={() => onChange(option)}
          className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid size-[26px] shrink-0 cursor-pointer place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 ${value === option ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#04111e]" : "text-slate-500 hover:bg-cyan-800/5 hover:text-cyan-800 dark:text-slate-400 dark:hover:bg-cyan-300/10 dark:hover:text-cyan-100"}`}
        >
          <Icon aria-hidden="true" size={14} strokeWidth={1.8} />
        </button>
      ))}
    </div>
  );
}

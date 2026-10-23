"use client";

import { SelectMenu } from "../select-menu";

export type BlogSort = "newest" | "oldest" | "title";
const options: { value: BlogSort; label: string }[] = [
  { value: "newest", label: "Más recientes" },
  { value: "oldest", label: "Más antiguos" },
  { value: "title", label: "Título (A–Z)" },
];

export function BlogSort({
  value,
  onChange,
}: {
  value: BlogSort;
  onChange: (value: BlogSort) => void;
}) {
  return (
    <SelectMenu
      value={value}
      onChange={onChange}
      options={options}
      label="Ordenar artículos"
    />
  );
}

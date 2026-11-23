"use client";

import { useTranslations } from "next-intl";
import { SelectMenu } from "../select-menu";

export type BlogSort = "newest" | "oldest" | "title";
const sortOrders: BlogSort[] = ["newest", "oldest", "title"];

export function BlogSort({
  value,
  onChange,
}: {
  value: BlogSort;
  onChange: (value: BlogSort) => void;
}) {
  const t = useTranslations("blog.sort");
  const options = sortOrders.map((order) => ({
    value: order,
    label: t(`options.${order}`),
  }));

  return (
    <SelectMenu
      value={value}
      onChange={onChange}
      options={options}
      label={t("label")}
    />
  );
}

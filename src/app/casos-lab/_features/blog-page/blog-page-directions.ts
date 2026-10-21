export const blogPageDirections = [
  { id: "base", number: "01", label: "Referencia" },
  { id: "horizon", number: "02", label: "Horizonte" },
  { id: "windows", number: "05", label: "Ventanas" },
  { id: "kinetic", number: "06", label: "Manifiesto" },
  { id: "focus", number: "08", label: "Foco" },
  { id: "reading", number: "09", label: "Lectura" },
  { id: "impact", number: "10", label: "Impacto" },
] as const;

export type BlogPageDirection = (typeof blogPageDirections)[number]["id"];

export type NewBlogPageDirection = Extract<
  BlogPageDirection,
  "windows" | "kinetic"
>;

export function isNewBlogPageDirection(
  direction: BlogPageDirection,
): direction is NewBlogPageDirection {
  return direction === "windows" || direction === "kinetic";
}

export function parseBlogPageDirection(
  value?: string | null,
): BlogPageDirection {
  return blogPageDirections.find((item) => item.id === value)?.id ?? "base";
}

export const articleDirections = [
  { id: "reference", number: "01", label: "Referencia" },
  { id: "sidebar", number: "02", label: "Columna y media" },
] as const;

export type ArticleDirection = (typeof articleDirections)[number]["id"];

export function parseArticleDirection(value?: string | null): ArticleDirection {
  return (
    articleDirections.find((direction) => direction.id === value)?.id ??
    "reference"
  );
}

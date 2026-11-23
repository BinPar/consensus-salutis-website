export const blogImagesDirections = [
  { id: "compare", number: "00", label: "Comparativa" },
  { id: "new", number: "+", label: "Nuevas" },
  { id: "neutral-reference", number: "15", label: "Referencia neutra" },
  { id: "light", number: "01", label: "Luz" },
  { id: "flow", number: "02", label: "Flujo" },
  { id: "veil", number: "03", label: "Veladuras" },
  { id: "interference", number: "04", label: "Interferencia" },
  { id: "strata", number: "05", label: "Estratos" },
  { id: "refraction", number: "06", label: "Refracción" },
  { id: "refined", number: "10", label: "Afinada" },
  { id: "refined-2", number: "14", label: "Afinada 2" },
  { id: "aurora", number: "11", label: "Aurora" },
  { id: "threshold", number: "12", label: "Umbral" },
  { id: "nacre", number: "13", label: "Nácar" },
] as const;

export type BlogImagesDirection = (typeof blogImagesDirections)[number]["id"];
export type CoverTreatment = Exclude<BlogImagesDirection, "compare" | "new">;
export type ExplorationTreatment = Extract<
  CoverTreatment,
  "interference" | "strata" | "refraction"
>;
export type SignatureTreatment = Extract<
  CoverTreatment,
  "aurora" | "threshold" | "nacre"
>;

export function parseBlogImagesDirection(
  value?: string | null,
): BlogImagesDirection {
  return (
    blogImagesDirections.find((item) => item.id === value)?.id ?? "compare"
  );
}

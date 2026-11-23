export const homeDirections = [
  { id: "corpus", number: "01", label: "Corpus" },
  { id: "evidence", number: "02", label: "Evidencia" },
  { id: "aura", number: "03", label: "Aura" },
  { id: "architecture", number: "04", label: "Interferencia" },
  { id: "prism", number: "05", label: "Prisma" },
  { id: "prism-isotype", number: "06", label: "Prisma · Isotipo" },
  { id: "prism-center", number: "07", label: "Prisma · Centro" },
  { id: "prism-field", number: "08", label: "Prisma · Color" },
  { id: "aura-signal", number: "09", label: "Aura · Ondas" },
  { id: "aura-particles", number: "10", label: "Aura · Partículas" },
] as const;
export type HomeDirection = (typeof homeDirections)[number]["id"];

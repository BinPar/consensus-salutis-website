export const productDirections = [
  { id: "convergence", number: "01", label: "Convergencia" },
  { id: "strata", number: "02", label: "Estratos" },
  { id: "strata-2", number: "03", label: "Estratos 2" },
  { id: "strata-3", number: "04", label: "Estratos 03" },
  { id: "orbital", number: "05", label: "Campo orbital" },
  { id: "fragments", number: "06", label: "De fragmentos a sistema" },
  { id: "blueprint", number: "07", label: "Plano vivo" },
] as const;

export type ProductDirection = (typeof productDirections)[number]["id"];

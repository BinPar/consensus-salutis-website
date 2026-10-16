export const contactDirections = [
  { id: "reference", number: "00", label: "Referencia" },
  { id: "assistant", number: "01", label: "Asistente" },
] as const;

export type ContactDirection = (typeof contactDirections)[number]["id"];

export const footerDirections = [
  { id: "reference", number: "00", label: "Referencia" },
  { id: "contrast", number: "01", label: "Contraste" },
  { id: "editorial", number: "02", label: "Editorial" },
  { id: "horizon", number: "03", label: "Horizonte" },
  { id: "panels", number: "04", label: "Paneles" },
  { id: "essential", number: "05", label: "Esencial" },
  { id: "contrast-original", number: "06", label: "Contraste original" },
] as const;

export type FooterDirection = (typeof footerDirections)[number]["id"];

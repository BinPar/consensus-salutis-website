export const volumeDirections = [
  { id: "reference", number: "00", label: "Referencia" },
  { id: "editorial", number: "01", label: "Filete" },
  { id: "archive", number: "02", label: "Marco" },
  { id: "atlas", number: "03", label: "Banda" },
  { id: "cycle", number: "04", label: "Actualización" },
  { id: "pulse", number: "05", label: "Contraste original" },
  { id: "contrast-ice", number: "06", label: "Contraste hielo" },
  { id: "contrast-white", number: "07", label: "Contraste blanco" },
  { id: "contrast-panel", number: "08", label: "Contraste panel" },
  { id: "contrast-teal", number: "09", label: "Contraste turquesa" },
  {
    id: "contrast-teal-original",
    number: "10",
    label: "Turquesa · paleta original",
  },
] as const;

export type VolumeDirection = (typeof volumeDirections)[number]["id"];

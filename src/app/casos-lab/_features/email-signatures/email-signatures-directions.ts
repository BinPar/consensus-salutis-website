export const emailSignaturesDirections = [
  {
    id: "night",
    number: "01",
    label: "Noche",
    description:
      "Tarjeta azul noche en HTML a todo el ancho: fotografía de la sección de equipo (o la tesela oscura) junto al cargo y el nombre, datos con iconos turquesa y el logotipo de la versión oscura al pie.",
    darkMode:
      "Apple Mail, Gmail web, Outlook y Gmail Android la muestran con sus colores, porque ya es oscura. Gmail en iOS invierte los colores de cualquier firma HTML.",
  },
] as const;

export type EmailSignaturesDirection =
  (typeof emailSignaturesDirections)[number]["id"];

export function parseEmailSignaturesDirection(
  value?: string | null,
): EmailSignaturesDirection {
  return (
    emailSignaturesDirections.find((item) => item.id === value)?.id ?? "night"
  );
}

export const emailSignaturesDirections = [
  {
    id: "night",
    number: "01",
    label: "Noche",
    description:
      "Tarjeta azul noche en HTML a todo el ancho: fotografía de la sección de equipo (o la tesela oscura) junto al cargo y el nombre, datos con iconos turquesa y el logotipo de la versión oscura al pie.",
    darkMode:
      "Outlook, Apple Mail y Gmail Android la muestran con sus colores, porque ya es oscura. Gmail en iOS invierte los colores de cualquier firma HTML, y la tarjeta pasa a verse clara.",
  },
  {
    id: "open",
    number: "02",
    label: "Abierta",
    description:
      "La maquetación de Noche sin tarjeta y en el tema claro: fotografía o tesela oscura, cargo, nombre y datos con iconos. El logotipo va en una banda azul noche con dos franjas turquesa a 30°, el ángulo de los ejes del isotipo.",
    darkMode:
      "Sin superficie propia: los clientes que recolorean aclaran el nombre y los datos, y la firma sigue legible. La banda repite su color como degradado, así que se mantiene azul noche y el logotipo siempre se lee.",
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

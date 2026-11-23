export const caseDirections = [
  {
    id: "trace-balanced",
    number: "01",
    label: "Equilibrio",
    description:
      "Texto y tarjetas en una columna más compacta, con un mapa amplio y una lectura más equilibrada.",
  },
  {
    id: "trace-contrast",
    number: "02",
    label: "Nitidez",
    description:
      "Mapa sobre una superficie azul hielo, contornos más definidos y un índice de instituciones sin tarjetas.",
  },
  {
    id: "trace-identity",
    number: "03",
    label: "Identidad",
    description:
      "Las marcas aparecen en las llamadas del mapa; la columna izquierda presenta nombres y contexto institucional.",
  },
  {
    id: "trace-guide",
    number: "04",
    label: "Guía",
    description:
      "Cabecera horizontal, índice de instituciones a la izquierda y ficha territorial integrada en un mapa protagonista.",
  },
  {
    id: "trace-panel",
    number: "05",
    label: "Ficha",
    description:
      "Una institución protagonista en la columna izquierda, con navegación compacta y el mapa general siempre visible.",
  },
  {
    id: "trace-definitive",
    number: "06",
    label: "Definitiva",
    description:
      "El bloque de texto y los selectores de Ficha, con tarjetas de marca compactas conectadas a cada comunidad en el mapa.",
  },
  {
    id: "trace-definitive-2",
    number: "07",
    label: "Definitiva 2",
    description:
      "Copia independiente de Definitiva para explorar la siguiente iteración sin alterar la composición aprobada.",
  },
  {
    id: "territorial-trace",
    number: "—",
    label: "Referencia",
    description:
      "La propuesta Trazado elegida, con los contornos corregidos, como referencia para comparar los cinco refinamientos.",
  },
] as const;

export type CaseDirection = (typeof caseDirections)[number]["id"];

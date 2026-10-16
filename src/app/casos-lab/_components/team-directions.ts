export const teamDirections = [
  {
    id: "encuadre",
    number: "01",
    label: "Encuadre",
    description:
      "Una galería editorial. Distintas miradas, una misma forma de cuidar el trabajo.",
    reference: "Instrument",
    url: "https://www.instrument.com/about",
  },
  {
    id: "atlas",
    number: "02",
    label: "Atlas",
    description:
      "Un mapa de especialidades. Descubrir a las personas y entender cómo se complementan sus disciplinas.",
    reference: "Koto",
    url: "https://koto.com/about",
  },
  {
    id: "indice",
    number: "03",
    label: "Índice",
    description:
      "Un directorio vivo. Nombres claros, imágenes con carácter y acceso directo a cada historia.",
    reference: "Locomotive",
    url: "https://locomotive.ca/en/agency",
  },
  {
    id: "mesa",
    number: "04",
    label: "Mesa",
    description:
      "Un estudio abierto. Fotografía, notas y oficio sobre una mesa de trabajo compartida.",
    reference: "Pentagram",
    url: "https://www.pentagram.com/about",
  },
  {
    id: "secuencia",
    number: "05",
    label: "Secuencia",
    description:
      "Un relato en fotogramas. Una forma pausada y visual de conocer a quienes construyen.",
    reference: "Noomo",
    url: "https://noomoagency.com/our-story",
  },
] as const;

export type TeamDirection = (typeof teamDirections)[number]["id"];

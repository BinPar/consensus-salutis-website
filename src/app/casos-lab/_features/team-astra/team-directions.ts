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
  {
    id: "guiada",
    number: "06",
    label: "Guiada",
    description:
      "Todo empieza con las personas. Dos órbitas de retratos y disciplinas rodean una entrada serena y directa.",
    reference: "Claude · Product overview",
    url: "https://claude.com/es/product/overview",
  },
  {
    id: "guiada-02",
    number: "07",
    label: "Guiada 02",
    description:
      "Segunda versión de Guiada. Una copia independiente para evolucionar la entrada de retratos en órbita.",
    reference: "Claude · Product overview",
    url: "https://claude.com/es/product/overview",
  },
  {
    id: "guiada-03",
    number: "08",
    label: "Guiada 3",
    description:
      "Una copia independiente de Guiada 02 con una galería editorial de todo el equipo y retratos superpuestos.",
    reference: "Team Sol6.1 · Editorial",
    url: "/casos-lab?lab=team-sol6-1&teamSol61Variant=editorial",
  },
  {
    id: "guiada-04",
    number: "09",
    label: "Guiada 4",
    description:
      "Una composición editorial de retratos superpuestos, con un borde de papel y nombres y cargos al pie.",
    reference: "BinPar · Retratos editoriales",
    url: "/casos-lab?lab=team&teamVariant=guiada-04",
  },
  {
    id: "guiada-05",
    number: "10",
    label: "Guiada 5",
    description:
      "Una galería abierta de retratos circulares que retoma las formas de las órbitas, con nombres y cargos bajo cada fotografía.",
    reference: "BinPar · Círculos",
    url: "/casos-lab?lab=team&teamVariant=guiada-05",
  },
  {
    id: "guiada-06",
    number: "11",
    label: "Guiada 6",
    description:
      "Una galería compacta de cinco columnas, con retratos alineados y una separación mínima entre fotografías.",
    reference: "BinPar · Grid compacto",
    url: "/casos-lab?lab=team&teamVariant=guiada-06",
  },
  {
    id: "prisma",
    number: "12",
    label: "Prisma",
    description:
      "Un abanico fotográfico que se despliega con profundidad y un directorio editorial con introducción lateral.",
    reference: "BinPar · Prisma",
    url: "/casos-lab?lab=team&teamVariant=prisma",
  },
  {
    id: "prisma-2",
    number: "15",
    label: "Prisma 2",
    description:
      "El retrato del CEO acompaña el scroll hasta abrir la galería del equipo.",
    reference: "BinPar · Prisma 2",
    url: "/casos-lab?lab=team&teamVariant=prisma-2",
  },
  {
    id: "mezcla",
    number: "16",
    label: "Mezcla",
    description:
      "La portada orbital de Guiada 3, un perfil compacto del CEO y la galería editorial de Prisma.",
    reference: "BinPar · Mezcla",
    url: "/casos-lab?lab=team&teamVariant=mezcla",
  },
  {
    id: "mezcla-3",
    number: "18",
    label: "Mezcla 3",
    description:
      "Copia exacta de Mezcla como punto de partida para una nueva variante.",
    reference: "BinPar · Mezcla 3",
    url: "/casos-lab?lab=team&teamVariant=mezcla-3",
  },
  {
    id: "mezcla-4",
    number: "19",
    label: "Mezcla 4",
    description:
      "La portada y galería de Mezcla 3, con una sección editorial sobre la idea que impulsa BinPar, sin retrato del CEO.",
    reference: "BinPar · Mezcla 4",
    url: "/casos-lab?lab=team&teamVariant=mezcla-4",
  },
  {
    id: "umbral",
    number: "13",
    label: "Umbral",
    description:
      "Una portada fotográfica a sangre con encuadres fluidos, un relato del CEO y una galería de retratos cuadrados.",
    reference: "BinPar · Umbral",
    url: "/casos-lab?lab=team&teamVariant=umbral",
  },
  {
    id: "nexo",
    number: "14",
    label: "Nexo",
    description:
      "Una apertura orgánica sobre un mosaico del equipo y una galería abierta organizada por disciplinas.",
    reference: "BinPar · Nexo",
    url: "/casos-lab?lab=team&teamVariant=nexo",
  },
] as const;

export type TeamDirection = (typeof teamDirections)[number]["id"];

export const teamSol61Directions = [
  {
    id: "editorial",
    number: "01",
    label: "Editorial",
    description:
      "La presencia humana, con el ritmo de una publicación contemporánea.",
    reference: "https://www.instrument.com/about",
    referenceLabel: "Instrument · Retrato y jerarquía",
  },
  {
    id: "index",
    number: "02",
    label: "Índice",
    description:
      "Los nombres construyen la página. La imagen acompaña al descubrimiento.",
    reference: "https://bakkenbaeck.com/team",
    referenceLabel: "Bakken & Bæck · Directorio vivo",
  },
  {
    id: "weave",
    number: "03",
    label: "Trama",
    description:
      "Una lectura del conjunto a través de las personas y sus ámbitos profesionales.",
    reference: "https://bakkenbaeck.com/about",
    referenceLabel: "Bakken & Bæck · Disciplinas conectadas",
  },
  {
    id: "chapters",
    number: "04",
    label: "Capítulos",
    description:
      "Un recorrido visual que relaciona a las personas con su forma de trabajar.",
    reference: "https://www.metalab.com/about",
    referenceLabel: "Metalab · Fotografía y contexto",
  },
  {
    id: "focus",
    number: "05",
    label: "Foco",
    description:
      "Un encuentro fotográfico, con libertad para explorar a cada persona.",
    reference: "https://basement.studio/people",
    referenceLabel: "Basement / Koto · Imagen e índice",
  },
] as const;

export type TeamSol61Direction = (typeof teamSol61Directions)[number]["id"];

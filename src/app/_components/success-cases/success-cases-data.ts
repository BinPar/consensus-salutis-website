export type InstitutionalCase = {
  id: string;
  name: string;
  organization: string;
  territory: string;
  logo: string;
  darkLogo?: string | null;
  width: number;
  height: number;
  // Geographic artwork is optional: adding a case never requires a map pin.
  region?: string;
  point?: { x: number; y: number };
};

export const institutionalCases: readonly InstitutionalCase[] = [
  {
    id: "axia",
    name: "Axia",
    organization: "Generalitat de Catalunya",
    territory: "Catalunya",
    region: "Cataluña/Catalunya",
    logo: "/logos/Axia.svg",
    darkLogo: "/logos/axia-white.svg",
    width: 158,
    height: 48,
    point: { x: 441, y: 116 },
  },
  {
    id: "sermas",
    name: "SERMAS",
    organization: "Servicio Madrileño de Salud",
    territory: "Comunidad de Madrid",
    region: "Comunidad de Madrid",
    logo: "/logos/sermas-lite.svg",
    darkLogo: null,
    width: 499,
    height: 116,
    point: { x: 244, y: 179 },
  },
];

export const casesIntro = {
  title: "IA médica que ya forma parte del sistema sanitario.",
  body: "Organizaciones sanitarias que incorporan inteligencia artificial para facilitar el acceso al conocimiento clínico fiable, acompañar la atención asistencial y reforzar la mejora continua.",
};

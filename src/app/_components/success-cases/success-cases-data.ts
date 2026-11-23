import successCasesEs from "../../../../messages/es/successCases.json";

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

type CaseStructure = Omit<
  InstitutionalCase,
  "name" | "organization" | "territory"
>;

// Estructura de cada caso; sus textos están en `successCases.cases.<id>`.
export const institutionalCaseData = [
  {
    id: "axia",
    region: "Cataluña/Catalunya",
    logo: "/logos/Axia.svg",
    darkLogo: "/logos/axia-white.svg",
    width: 158,
    height: 48,
    point: { x: 441, y: 116 },
  },
  {
    id: "sermas",
    region: "Comunidad de Madrid",
    logo: "/logos/sermas-lite.svg",
    darkLogo: null,
    width: 499,
    height: 116,
    point: { x: 244, y: 179 },
  },
] as const satisfies readonly CaseStructure[];

/*
  Casos con sus textos en castellano, para el laboratorio (`casos-lab`) y los
  tests, que no pueden usar hooks. La web usa `useInstitutionalCases`.
*/
export const institutionalCases: readonly InstitutionalCase[] =
  institutionalCaseData.map((item) => ({
    ...item,
    ...successCasesEs.cases[item.id],
  }));

// Solo lo lee el laboratorio; la web usa `successCases.intro`.
export const casesIntro = {
  title: "IA médica que ya forma parte del sistema sanitario.",
  body: successCasesEs.intro.body,
};

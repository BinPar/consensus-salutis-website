import { processFollowup } from "./clinical-process-data";
import { processAnswerParagraphs } from "./clinical-process-typing";

// Títulos de la plataforma real; la numeración se deriva del texto mostrado.
const references = [
  {
    title: "Manual ProMIR · Cardiología · Insuficiencia cardíaca",
    anchors: ["c62888"],
  },
  {
    title: "Manual ProMIR · Nefrología · Fracaso renal agudo",
    anchors: ["c7d2a7", "c7bf72"],
  },
  {
    title: "Manual ProMIR · Nefrología · Insuficiencia renal crónica",
    anchors: ["c7b5cc"],
  },
  {
    title:
      "Manual ProMIR · Nefrología · Riesgo cardiovascular y enfermedad renal",
    anchors: ["c73b77"],
  },
  {
    title: "Manual ProMIR · Nefrología · Cuerpo de texto",
    anchors: ["c73d65"],
  },
] as const;

export type SceneReference = {
  title: string;
  anchors: readonly string[];
  order: number;
};

function referencesForParagraphs(
  paragraphs: readonly string[],
): SceneReference[] {
  const used: (typeof references)[number][] = [];
  for (const paragraph of paragraphs) {
    for (const match of paragraph.matchAll(/⟦([^⟧]+)⟧/g)) {
      const reference = references.find((entry) =>
        entry.anchors.some((anchor) => anchor === match[1]),
      );
      if (!reference)
        throw new Error(`Referencia de escena desconocida: ${match[1]}`);
      if (!used.includes(reference)) used.push(reference);
    }
  }
  return used.map((reference, index) => ({ ...reference, order: index + 1 }));
}

const followupParagraphs = processFollowup.finalOpinion.split("\n\n");
export const processFollowupParagraphs = [
  followupParagraphs[0]!.split(". ")[0]! + ".",
  followupParagraphs[3]!.split(" En un fracaso")[0]!,
  followupParagraphs[4]!,
];

export const processSceneReferences = referencesForParagraphs(
  processAnswerParagraphs,
);
export const processFollowupReferences = referencesForParagraphs([
  ...processAnswerParagraphs,
  ...processFollowupParagraphs,
]);

export function sceneReferenceForAnchor(
  anchor: string,
  bibliography: readonly SceneReference[] = processSceneReferences,
) {
  return bibliography.find((reference) => reference.anchors.includes(anchor));
}

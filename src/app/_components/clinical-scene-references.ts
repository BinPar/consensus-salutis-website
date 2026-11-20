import { useTranslations } from "next-intl";
import { useMemo } from "react";

import es from "../../../messages/es/clinical.json";
import {
  processAnswerParagraphs,
  useProcessAnswerParagraphs,
} from "./clinical-process-typing";

// Títulos de la plataforma real; la numeración se deriva del texto mostrado.
const references = [
  { id: "heartFailure", anchors: ["c62888"] },
  { id: "acuteKidneyFailure", anchors: ["c7d2a7", "c7bf72"] },
  { id: "chronicKidneyFailure", anchors: ["c7b5cc"] },
  { id: "cardiovascularRisk", anchors: ["c73b77"] },
  { id: "bodyText", anchors: ["c73d65"] },
] as const;

type ReferenceId = (typeof references)[number]["id"];

export type SceneReference = {
  title: string;
  anchors: readonly string[];
  order: number;
};

function referencesForParagraphs(
  paragraphs: readonly string[],
  title: (id: ReferenceId) => string,
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
  return used.map(({ id, anchors }, index) => ({
    title: title(id),
    anchors,
    order: index + 1,
  }));
}

/*
  Fragmentos de la respuesta al seguimiento que se muestran, guardados como
  piezas explícitas en el JSON. `nsaids` no sale en estas escenas, pero es
  el párrafo que usan las escenas de funcionalidades.
*/
export const processFollowupParagraphIds = [
  "relevantData",
  "creatinine",
  "reconciliation",
] as const;

/** Pregunta y pasajes del seguimiento, con sus referencias numeradas. */
export function useProcessFollowup() {
  const t = useTranslations("clinical");
  const answer = useProcessAnswerParagraphs();
  return useMemo(() => {
    const title = (id: ReferenceId) => t(`references.${id}`);
    const paragraphs = processFollowupParagraphIds.map(
      (id) => t.raw(`followup.paragraphs.${id}`) as string,
    );
    return {
      question: t("followup.question"),
      paragraphs,
      nsaids: t.raw("followup.paragraphs.nsaids") as string,
      answerReferences: referencesForParagraphs(answer, title),
      references: referencesForParagraphs([...answer, ...paragraphs], title),
    };
  }, [t, answer]);
}

/** Bibliografía de la respuesta en el idioma de la página. */
export function useSceneReferences() {
  return useProcessFollowup().answerReferences;
}

/* Versión en castellano para los módulos que no pueden usar los hooks. */
const esTitle = (id: ReferenceId) => es.references[id];

export const processFollowupParagraphs: string[] =
  processFollowupParagraphIds.map((id) => es.followup.paragraphs[id]);

export const processSceneReferences = referencesForParagraphs(
  processAnswerParagraphs,
  esTitle,
);
export const processFollowupReferences = referencesForParagraphs(
  [...processAnswerParagraphs, ...processFollowupParagraphs],
  esTitle,
);

export function sceneReferenceForAnchor(
  anchor: string,
  bibliography: readonly SceneReference[] = processSceneReferences,
) {
  return bibliography.find((reference) => reference.anchors.includes(anchor));
}

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import es from "../../../messages/es/clinical.json";
import { processResult as result } from "./clinical-process-data";

/*
  Los tres pasajes de la respuesta que se muestran, guardados como piezas
  explícitas en el JSON en lugar de recortarse del texto completo. Son texto
  con su propio marcado (`**`, anclas ⟦…⟧), por eso se leen con `t.raw`.
*/
export const processAnswerParagraphIds = [
  "assessment",
  "precipitant",
  "claim",
] as const;

export function useProcessAnswerParagraphs(): string[] {
  const t = useTranslations("clinical.answer");
  return useMemo(
    () => processAnswerParagraphIds.map((id) => t.raw(id) as string),
    [t],
  );
}

/** Pasajes en castellano, para los módulos que no pueden usar el hook. */
export const processAnswerParagraphs: string[] = processAnswerParagraphIds.map(
  (id) => es.answer[id],
);

// Use the agreed 5.2s answer in mock 04 as the cadence for all three chats.
// Every text then takes the time required by its actual character count.
// La cadencia se calibra con el texto fuente: es la misma en todos los idiomas.
const referenceLength = processAnswerParagraphs
  .join("")
  .replace(/\*\*/g, "")
  .replace(
    /⟦([^⟧]+)⟧/g,
    (_, anchor: string) =>
      `[${result.citations.find((citation) => citation.anchor === anchor)!.order}]`,
  ).length;

const charactersPerSecond = referenceLength / 5.2;

export function typingDuration(length: number) {
  return length / charactersPerSecond;
}

export function writtenCharacters(
  seconds: number,
  start: number,
  length: number,
  reduced: boolean,
) {
  return reduced
    ? length
    : Math.min(
        length,
        Math.max(0, Math.floor((seconds - start) * charactersPerSecond)),
      );
}

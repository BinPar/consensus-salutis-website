import { processResult as result } from "./clinical-process-data";

export const processAnswerParagraphs = [
  result.finalOpinion.split(" El ibuprofeno")[0]!,
  `El ibuprofeno${result.finalOpinion.split(" El ibuprofeno")[1]!.split("\n\n")[0]}`,
  /Debe evitarse en la ERC grave[^⟦]+⟦c73b77⟧/.exec(result.finalOpinion)![0],
];

// Use the agreed 5.2s answer in mock 04 as the cadence for all three chats.
// Every text then takes the time required by its actual character count.
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

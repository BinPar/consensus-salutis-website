import { describe, expect, it } from "vitest";
import { processAnswerParagraphs } from "./clinical-process-typing";
import {
  processFollowupParagraphs,
  processFollowupReferences,
  processSceneReferences,
  sceneReferenceForAnchor,
} from "./clinical-scene-references";

const anchorsIn = (paragraphs: readonly string[]) =>
  [...paragraphs.join("\n").matchAll(/⟦([^⟧]+)⟧/g)].map((match) => match[1]!);

describe("referencias de las escenas clínicas", () => {
  it("numera las cuatro fuentes citadas por orden de aparición, sin entradas sobrantes", () => {
    const cited = anchorsIn(processAnswerParagraphs).map(
      (anchor) => sceneReferenceForAnchor(anchor)!.order,
    );
    expect(cited).toEqual([1, 2, 1, 3, 4]);
    expect(processSceneReferences.map((reference) => reference.order)).toEqual([
      ...new Set(cited),
    ]);
    expect(sceneReferenceForAnchor("c73b77")?.title).toContain(
      "Riesgo cardiovascular y enfermedad renal",
    );
  });

  it("mantiene los números del contexto y añade solo la nueva fuente del seguimiento", () => {
    expect(processFollowupReferences.slice(0, 4)).toEqual(
      processSceneReferences,
    );
    expect(
      processFollowupReferences.map((reference) => reference.order),
    ).toEqual([1, 2, 3, 4, 5]);
    expect(
      anchorsIn(processFollowupParagraphs).map(
        (anchor) =>
          sceneReferenceForAnchor(anchor, processFollowupReferences)!.order,
      ),
    ).toEqual([3, 5]);
  });

  it("cada entrada del seguimiento tiene al menos una cita en el texto mostrado", () => {
    const anchors = anchorsIn([
      ...processAnswerParagraphs,
      ...processFollowupParagraphs,
    ]);
    for (const reference of processFollowupReferences) {
      expect(reference.anchors.some((anchor) => anchors.includes(anchor))).toBe(
        true,
      );
    }
  });
});

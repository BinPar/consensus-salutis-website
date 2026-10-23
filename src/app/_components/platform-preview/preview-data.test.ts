import { describe, expect, it } from "vitest";
import {
  closeSourceTab,
  documentCitations,
  initialCitation,
  initialConversations,
  initialTabs,
  openSourceTab,
} from "./preview-data";
import {
  initialAnswer,
  followupAnswer,
  initialReferences,
  followupReferences,
} from "./preview-consultation-content";

describe("preview document tabs", () => {
  it("selects another passage without duplicating its source document", () => {
    const citation = documentCitations.find((c) => c.anchor === "c73b77")!;
    const next = openSourceTab(initialTabs, citation);
    expect(next.tabs).toHaveLength(1);
    expect(next.tabs[0]?.citation).toBe(citation);
    expect(initialTabs.tabs[0]?.citation).toBe(initialCitation);
  });
  it("opens a second document and restores its neighbour when closed", () => {
    const citation = documentCitations.find(
      (c) => c.source !== initialCitation.source,
    )!;
    const opened = openSourceTab(initialTabs, citation);
    expect(opened.tabs).toHaveLength(2);
    expect(opened.activeKey).toBe(citation.source);
    expect(closeSourceTab(opened, citation.source)).toEqual(initialTabs);
    expect(closeSourceTab(initialTabs, initialCitation.source)).toEqual({
      tabs: [],
      activeKey: null,
    });
  });
  it("resolves every visible citation to its captured source", () => {
    for (const conversation of initialConversations) {
      for (const message of conversation.messages) {
        for (const [, anchor] of message.text.matchAll(/⟦([^⟧]+)⟧/g)) {
          expect(
            message.citations.some((c) => c.anchor === anchor),
            anchor,
          ).toBe(true);
        }
      }
    }
  });
});

describe("contenido actualizado de las dos consultas", () => {
  it.each([
    {
      id: "valoracion",
      answer: initialAnswer,
      references: initialReferences,
      numbers: [1, 2, 3, 1, 1, 3, 1, 4, 5, 1, 6, 7, 1, 8, 1, 3],
    },
    {
      id: "seguimiento",
      answer: followupAnswer,
      references: followupReferences,
      numbers: [1, 1, 2, 1, 3, 4, 5, 1, 6, 6, 6, 7, 8, 9, 1],
    },
  ])(
    "conserva el texto y la correspondencia de cada cita en $id",
    ({ id, answer, references, numbers }) => {
      const message = initialConversations
        .find((conversation) => conversation.id === id)!
        .messages.at(-1)!;
      const cited: number[] = [];
      const decoded = message.text.replace(
        /⟦([^⟧]+)⟧/g,
        (_, anchor: string) => {
          const citation = message.citations.find(
            (entry) => entry.anchor === anchor,
          )!;
          cited.push(citation.order);
          return `[${citation.order}]`;
        },
      );
      const expected = answer.replace(
        /\[(\d+(?:,\s*\d+)*)\]/g,
        (_, group: string) =>
          group
            .split(",")
            .map((number) => `[${number.trim()}]`)
            .join(" "),
      );
      expect(decoded).toBe(expected);
      expect(cited).toEqual(numbers);
      expect(message.citations.map((citation) => citation.title)).toEqual(
        references.map((reference) => reference.title),
      );
      expect(message.citations.map((citation) => citation.order)).toEqual([
        ...new Set(cited),
      ]);
    },
  );
});

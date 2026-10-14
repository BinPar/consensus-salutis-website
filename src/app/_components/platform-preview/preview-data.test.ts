import { describe, expect, it } from "vitest";
import {
  closeSourceTab,
  documentCitations,
  initialCitation,
  initialConversations,
  initialTabs,
  openSourceTab,
} from "./preview-data";

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

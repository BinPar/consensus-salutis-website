import { processResult } from "../clinical-process-data";
import {
  initialReferences,
  followupReferences,
  type PreviewReferenceId,
} from "./preview-consultation-content";

export type PreviewCitation = {
  anchor: string;
  order: number;
  source: string;
  title: string;
  quote: string | null;
  expert?: string;
};
export type PreviewMessage = {
  role: "user" | "assistant";
  text: string;
  citations: readonly PreviewCitation[];
};
export type PreviewConversation = {
  id: string;
  title: string;
  pinned: boolean;
  messages: readonly PreviewMessage[];
};
export type SourceSelection = { key: string; citation: PreviewCitation };
export type SourceTabs = { tabs: SourceSelection[]; activeKey: string | null };

export function cleanQuote(text: string) {
  return text
    .replace(/<[^>]*>/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*|#/g, "")
    .trim();
}
/** Anchor de cada pasaje citado en el documento de la consulta. */
export type PreviewQuoteAnchor =
  (typeof processResult.citations)[number]["anchor"];
export const previewQuoteAnchors: readonly PreviewQuoteAnchor[] =
  processResult.citations.map((c) => c.anchor);
export type PreviewConversationId = "valoracion" | "seguimiento";

/** Textos de la maqueta en el idioma de la página (`platform.preview`). */
export type PreviewText = {
  /** Preguntas de la consulta y del seguimiento (`clinical`). */
  questions: { consultation: string; followup: string };
  /** Pasajes citados, en bruto (`clinical.citations.<anchor>`). */
  quotes: Record<PreviewQuoteAnchor, string>;
  conversations: Record<PreviewConversationId, string>;
  answers: { initial: string; followup: string };
  references: Record<PreviewReferenceId, string>;
};

// Adaptación de contenido al formato de citas que ya utiliza la maqueta.
function withCitationAnchors(
  text: string,
  references: readonly PreviewCitation[],
) {
  return text.replace(/\[(\d+(?:,\s*\d+)*)\]/g, (_, group: string) =>
    group
      .split(",")
      .map((number) => {
        const citation = references.find((c) => c.order === Number(number));
        if (!citation)
          throw new Error(`Referencia de maqueta desconocida: ${number}`);
        return `⟦${citation.anchor}⟧`;
      })
      .join(" "),
  );
}

/** Conversaciones de ejemplo y cita inicial, montadas con sus textos. */
export function createPreviewData(text: PreviewText) {
  const documentCitations: readonly PreviewCitation[] =
    processResult.citations.map((c) => ({
      anchor: c.anchor,
      order: c.order,
      expert: c.expert,
      source: c.source,
      title: c.source,
      quote: cleanQuote(text.quotes[c.anchor]),
    }));
  const citations: readonly PreviewCitation[] = initialReferences.map(
    (reference, index) => ({
      anchor: reference.anchor,
      title: text.references[reference.reference],
      source: reference.source,
      order: index + 1,
      quote:
        documentCitations.find((c) => c.anchor === reference.anchor)?.quote ??
        null,
    }),
  );
  const followupCitations: readonly PreviewCitation[] = followupReferences.map(
    (reference, index) => {
      const initial = initialReferences.find(
        (entry) => entry.reference === reference.reference,
      );
      return {
        title: text.references[reference.reference],
        source: reference.source,
        anchor: `preview-followup-${index + 1}`,
        order: index + 1,
        quote:
          citations.find((c) => c.anchor === initial?.anchor)?.quote ?? null,
      };
    },
  );
  const consultation: PreviewMessage = {
    role: "user",
    text: text.questions.consultation,
    citations: [],
  };
  const reply: PreviewMessage = {
    role: "assistant",
    text: withCitationAnchors(text.answers.initial, citations),
    citations,
  };
  const initialConversations: readonly PreviewConversation[] = [
    {
      id: "valoracion",
      title: text.conversations.valoracion,
      pinned: false,
      messages: [consultation, reply],
    },
    {
      id: "seguimiento",
      title: text.conversations.seguimiento,
      pinned: false,
      messages: [
        consultation,
        reply,
        { role: "user", text: text.questions.followup, citations: [] },
        {
          role: "assistant",
          text: withCitationAnchors(text.answers.followup, followupCitations),
          citations: followupCitations,
        },
      ],
    },
  ];
  const initialCitation = citations.find((c) => c.anchor === "c7b8ef")!;
  const initialTabs: SourceTabs = {
    tabs: [{ key: initialCitation.source, citation: initialCitation }],
    activeKey: initialCitation.source,
  };
  // Document wording from the supplied product capture and existing captured corpus excerpts.
  const renalProgression = cleanQuote(initialCitation.quote ?? "") + ").";
  return {
    initialConversations,
    initialCitation,
    initialTabs,
    documentCitations,
    renalProgression,
  };
}

// Same document-key deduplication and neighbour selection as citation-viewer-tabs.ts in apps/chat.
export function openSourceTab(
  state: SourceTabs,
  citation: PreviewCitation,
): SourceTabs {
  const key = citation.source;
  return {
    tabs: state.tabs.some((tab) => tab.key === key)
      ? state.tabs.map((tab) => (tab.key === key ? { key, citation } : tab))
      : [...state.tabs, { key, citation }],
    activeKey: key,
  };
}
export function closeSourceTab(state: SourceTabs, key: string): SourceTabs {
  const index = state.tabs.findIndex((tab) => tab.key === key);
  if (index < 0) return state;
  const tabs = state.tabs.filter((tab) => tab.key !== key);
  return {
    tabs,
    activeKey: !tabs.length
      ? null
      : state.activeKey === key
        ? tabs[Math.min(index, tabs.length - 1)]!.key
        : state.activeKey,
  };
}

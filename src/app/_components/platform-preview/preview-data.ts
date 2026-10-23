import {
  processConsultation,
  processFollowup,
  processResult,
} from "../clinical-process-data";
import { evidenceDocumentContext } from "../evidence-document-context";
import {
  initialAnswer,
  followupAnswer,
  initialReferences,
  followupReferences,
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
export const documentCitations: readonly PreviewCitation[] =
  processResult.citations.map((c) => ({
    ...c,
    title: c.source,
    quote: cleanQuote(c.quote),
  }));
const citations: readonly PreviewCitation[] = initialReferences.map(
  (reference, index) => ({
    ...reference,
    order: index + 1,
    quote:
      documentCitations.find((c) => c.anchor === reference.anchor)?.quote ??
      null,
  }),
);
const followupCitations: readonly PreviewCitation[] = followupReferences.map(
  (reference, index) => ({
    ...reference,
    anchor: `preview-followup-${index + 1}`,
    order: index + 1,
    quote: citations.find((c) => c.title === reference.title)?.quote ?? null,
  }),
);

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
const consultation: PreviewMessage = {
  role: "user",
  text: processConsultation.question,
  citations: [],
};
const reply: PreviewMessage = {
  role: "assistant",
  text: withCitationAnchors(initialAnswer, citations),
  citations,
};
export const initialConversations: readonly PreviewConversation[] = [
  {
    id: "valoracion",
    title: "Evaluación inicial de disnea y edema periférico",
    pinned: false,
    messages: [consultation, reply],
  },
  {
    id: "seguimiento",
    title: "Revisión de la medicación y función renal",
    pinned: false,
    messages: [
      consultation,
      reply,
      { role: "user", text: processFollowup.question, citations: [] },
      {
        role: "assistant",
        text: withCitationAnchors(followupAnswer, followupCitations),
        citations: followupCitations,
      },
    ],
  },
];
export const initialCitation = citations.find((c) => c.anchor === "c7b8ef")!;
export const initialTabs: SourceTabs = {
  tabs: [{ key: initialCitation.source, citation: initialCitation }],
  activeKey: initialCitation.source,
};

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

// Document wording from the supplied product capture and existing captured corpus excerpts.
export const renalContext = {
  etiology:
    "Las causas de enfermedad renal crónica van a ser distintas en función de la edad del paciente. Así, en la edad pediátrica dominan los problemas congénitos y glomerulares, en pacientes de edad media la poliquistosis renal, y en pacientes mayores la diabetes mellitus y las causas vasculares.",
  diabetes:
    "En números absolutos la diabetes mellitus con nefropatía diabética es la principal causa de ERC a nivel mundial.",
  progression: cleanQuote(initialCitation.quote ?? "") + ").",
  progressionAfter:
    "Pequeñas fluctuaciones del FG no indican necesariamente progresión, por ello se exige que sea un descenso del FG sostenido. La hipertensión arterial (HTA) y la proteinuria serán los factores principales de progresión de la enfermedad y otros factores de riesgo modificables. Otros serán el control de la glucemia en la población diabética, la dislipemia, la hiperuricemia y el control de la acidosis metabólica.",
  risks: [
    "Proteinuria",
    "Hipertensión arterial",
    "Diabetes mellitus",
    "Enfermedad cardiovascular",
    "Tabaquismo",
  ],
};
export const drugContext = evidenceDocumentContext;

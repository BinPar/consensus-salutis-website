import {
  processConsultation,
  processFollowup,
  processResult,
} from "../clinical-process-data";
import { evidenceDocumentContext } from "../evidence-document-context";

export type PreviewCitation = {
  anchor: string;
  order: number;
  source: string;
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
const citations: readonly PreviewCitation[] = processResult.citations.map(
  (c) => ({ ...c, quote: cleanQuote(c.quote) }),
);
const followupCitations: readonly PreviewCitation[] =
  processFollowup.citations.map((c, index) => ({
    ...c,
    order: index + 1,
    quote:
      citations.find((original) => original.anchor === c.anchor)?.quote ?? null,
  }));
const consultation: PreviewMessage = {
  role: "user",
  text: processConsultation.question,
  citations: [],
};
const reply: PreviewMessage = {
  role: "assistant",
  text: processResult.finalOpinion,
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
        text: processFollowup.finalOpinion,
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
export const documentCitations = citations;

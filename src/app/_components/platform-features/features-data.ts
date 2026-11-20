// Funcionalidades de la plataforma: 36 en cinco grupos, cada una con su escena.

import { useTranslations } from "next-intl";
import { useMemo } from "react";

export const evidenceFeatureIds = [
  "citations",
  "bibliography",
  "preserved",
  "viewer",
  "verified",
  "provenance",
  "updates",
] as const;
export type EvidenceFeatureId = (typeof evidenceFeatureIds)[number];

export const consultationFeatureIds = [
  "natural",
  "clarify",
  "followup",
  "committee",
  "modes",
  "progress",
  "images",
] as const;
export type ConsultationFeatureId = (typeof consultationFeatureIds)[number];

export const formatFeatureIds = [
  "schemes",
  "figures",
  "download",
  "tables",
  "textalt",
  "panel",
] as const;
export type FormatFeatureId = (typeof formatFeatureIds)[number];

export const workspaceFeatureIds = [
  "projects",
  "instructions",
  "saved",
  "preferences",
  "private",
  "history",
  "languages",
  "theme",
] as const;
export type WorkspaceFeatureId = (typeof workspaceFeatureIds)[number];

export const governanceFeatureIds = [
  "corpus",
  "library",
  "committees",
  "review",
  "versions",
  "control",
  "rating",
  "brand",
] as const;
export type GovernanceFeatureId = (typeof governanceFeatureIds)[number];

export type FeatureMockId =
  | EvidenceFeatureId
  | ConsultationFeatureId
  | FormatFeatureId
  | WorkspaceFeatureId
  | GovernanceFeatureId;

export type FeatureGroupId =
  "evidence" | "consultation" | "formats" | "workspace" | "governance";

export type PlatformFeature = {
  number: string;
  title: string;
  description: string;
  /** Second sentence for readers new to the platform. */
  detail?: string;
  /** Scene that shows the feature. */
  mock: FeatureMockId;
};

export type PlatformFeatureGroup = {
  id: FeatureGroupId;
  number: string;
  title: string;
  features: PlatformFeature[];
};

// Estructura de los grupos; los textos están en `features.groups` y
// `features.items` de los mensajes, con el id como clave.
const featureGroupStructure: {
  id: FeatureGroupId;
  number: string;
  features: { number: string; mock: FeatureMockId }[];
}[] = [
  {
    id: "evidence",
    number: "01",
    features: [
      { number: "01", mock: "citations" },
      { number: "02", mock: "bibliography" },
      { number: "03", mock: "preserved" },
      { number: "04", mock: "viewer" },
      { number: "05", mock: "verified" },
      { number: "06", mock: "provenance" },
      { number: "07", mock: "updates" },
    ],
  },
  {
    id: "consultation",
    number: "02",
    features: [
      { number: "08", mock: "natural" },
      { number: "09", mock: "clarify" },
      { number: "10", mock: "followup" },
      { number: "11", mock: "committee" },
      { number: "12", mock: "modes" },
      { number: "13", mock: "progress" },
      { number: "14", mock: "images" },
    ],
  },
  {
    id: "formats",
    number: "03",
    features: [
      { number: "15", mock: "schemes" },
      { number: "16", mock: "figures" },
      { number: "17", mock: "download" },
      { number: "18", mock: "tables" },
      { number: "19", mock: "textalt" },
      { number: "20", mock: "panel" },
    ],
  },
  {
    id: "workspace",
    number: "04",
    features: [
      { number: "21", mock: "projects" },
      { number: "22", mock: "instructions" },
      { number: "23", mock: "saved" },
      { number: "24", mock: "preferences" },
      { number: "25", mock: "private" },
      { number: "26", mock: "history" },
      { number: "27", mock: "languages" },
      { number: "28", mock: "theme" },
    ],
  },
  {
    id: "governance",
    number: "05",
    features: [
      { number: "29", mock: "corpus" },
      { number: "30", mock: "library" },
      { number: "31", mock: "committees" },
      { number: "32", mock: "review" },
      { number: "33", mock: "versions" },
      { number: "34", mock: "control" },
      { number: "35", mock: "rating" },
      { number: "36", mock: "brand" },
    ],
  },
];

/** Los grupos con sus textos en el idioma de la página. */
export function usePlatformFeatureGroups(): PlatformFeatureGroup[] {
  const t = useTranslations("features");
  return useMemo(
    () =>
      featureGroupStructure.map((group) => ({
        id: group.id,
        number: group.number,
        title: t(`groups.${group.id}.title`),
        features: group.features.map(({ number, mock }) => ({
          number,
          mock,
          title: t(`items.${mock}.title`),
          description: t(`items.${mock}.description`),
          detail: t(`items.${mock}.detail`),
        })),
      })),
    [t],
  );
}

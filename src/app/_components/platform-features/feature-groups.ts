import { useTranslations } from "next-intl";
import { useMemo } from "react";

import {
  usePlatformFeatureGroups,
  type FeatureGroupId,
  type FeatureMockId,
  type PlatformFeature,
} from "./features-data";

/** How each group is presented on /plataforma: anchor, heading and order. */
export type FeatureGroupSection = {
  /** Section anchor, also used by the side navigation. */
  id: string;
  navLabel: string;
  /** Title in its two tones. */
  heading: readonly [string, string];
  lead: string;
  features: PlatformFeature[];
};

// Ancla y orden de cada grupo; los textos están en `features.groups`.
const sections: {
  group: FeatureGroupId;
  id: string;
  order: readonly FeatureMockId[];
}[] = [
  {
    group: "evidence",
    id: "evidencia",
    order: [
      "citations",
      "bibliography",
      "viewer",
      "verified",
      "provenance",
      "preserved",
      "updates",
    ],
  },
  {
    group: "consultation",
    id: "consulta",
    order: [
      "natural",
      "images",
      "modes",
      "committee",
      "progress",
      "clarify",
      "followup",
    ],
  },
  {
    group: "formats",
    id: "formatos",
    order: ["schemes", "tables", "figures", "panel", "download", "textalt"],
  },
  {
    group: "workspace",
    id: "espacio-personal",
    order: [
      "projects",
      "history",
      "instructions",
      "private",
      "saved",
      "preferences",
      "languages",
      "theme",
    ],
  },
  {
    group: "governance",
    id: "gobierno",
    order: [
      "corpus",
      "library",
      "review",
      "versions",
      "control",
      "committees",
      "rating",
      "brand",
    ],
  },
];

/** Las secciones de grupo con sus textos en el idioma de la página. */
export function useFeatureGroupSections(): FeatureGroupSection[] {
  const t = useTranslations("features.groups");
  const groups = usePlatformFeatureGroups();
  return useMemo(
    () =>
      sections.map(({ group, order, id }) => {
        const features = groups.find((entry) => entry.id === group)!.features;
        return {
          id,
          navLabel: t(`${group}.navLabel`),
          heading: [t(`${group}.heading`), t(`${group}.headingAccent`)],
          lead: t(`${group}.lead`),
          features: order.map((mock) =>
            features.find((feature) => feature.mock === mock)!,
          ),
        };
      }),
    [t, groups],
  );
}

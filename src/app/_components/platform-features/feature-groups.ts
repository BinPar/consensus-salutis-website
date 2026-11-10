import {
  platformFeatureGroups,
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

const sections: (Omit<FeatureGroupSection, "features"> & {
  group: string;
  order: readonly FeatureMockId[];
})[] = [
  {
    group: "evidence",
    id: "evidencia",
    navLabel: "Evidencia",
    heading: ["Evidencia", "visible."],
    lead: "Cada afirmación remite al documento que la respalda. El pasaje se consulta en su contexto, con su procedencia y su vigencia a la vista.",
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
    navLabel: "Consulta",
    heading: ["Consulta", "clínica."],
    lead: "La duda se formula como en una sesión clínica. Cada especialidad revisa su corpus, el avance queda a la vista y la conversación conserva el caso.",
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
    navLabel: "Formatos",
    heading: ["Formatos", "de respuesta."],
    lead: "La respuesta se presenta en el formato que mejor la explica. Esquemas, figuras y tablas conservan sus citas y se consultan en el panel lateral.",
    order: ["schemes", "tables", "figures", "panel", "download", "textalt"],
  },
  {
    group: "workspace",
    id: "espacio-personal",
    navLabel: "Espacio personal",
    heading: ["Espacio", "personal."],
    lead: "Cada profesional organiza sus consultas en proyectos con instrucciones y fuentes propias, y ajusta cómo se leen las respuestas.",
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
    navLabel: "Gobierno",
    heading: ["Gobierno", "institucional."],
    lead: "La organización decide qué documentos consulta el comité, revisa cada cambio antes de publicarlo y comprueba que la calidad de las respuestas se mantiene.",
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

export const featureGroupSections: FeatureGroupSection[] = sections.map(
  ({ group, order, ...section }) => {
    const features = platformFeatureGroups.find(
      (entry) => entry.id === group,
    )!.features;
    return {
      ...section,
      features: order.map((mock) =>
        features.find((feature) => feature.mock === mock)!,
      ),
    };
  },
);

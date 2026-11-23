// Respuestas y bibliografías facilitadas por el usuario desde la plataforma actual.
// Los textos (respuestas y títulos de las referencias) están en
// `platform.preview` de los mensajes; aquí queda la estructura de las citas.

export const previewReferenceIds = [
  "heartFailure",
  "chronicKidneyFailure",
  "acuteKidneyFailure",
  "hypertension",
  "cardiovascularRisk",
  "thoracicSyndromes",
  "nephrologyBody",
  "basicCardiology",
  "heartFailureSection",
  "chronicKidneyDefinition",
] as const;
export type PreviewReferenceId = (typeof previewReferenceIds)[number];

export const initialReferences = [
  {
    anchor: "c62888",
    reference: "heartFailure",
    source: "promir-cardiologia.md",
  },
  {
    anchor: "c7b8ef",
    reference: "chronicKidneyFailure",
    source: "promir-nefrologia.md",
  },
  {
    anchor: "c7bb6e",
    reference: "acuteKidneyFailure",
    source: "promir-nefrologia.md",
  },
  {
    anchor: "c739f1",
    reference: "hypertension",
    source: "promir-cardiologia.md",
  },
  {
    anchor: "preview-initial-5",
    reference: "cardiovascularRisk",
    source: "promir-cardiologia.md",
  },
  {
    anchor: "c6298f",
    reference: "thoracicSyndromes",
    source: "promir-radiologia-urgencias.md",
  },
  {
    anchor: "c73b77",
    reference: "nephrologyBody",
    source: "promir-nefrologia.md",
  },
  {
    anchor: "preview-initial-8",
    reference: "basicCardiology",
    source: "promir-cardiologia.md",
  },
] as const satisfies readonly {
  anchor: string;
  reference: PreviewReferenceId;
  source: string;
}[];

/**
 * Las referencias que también están en la consulta inicial toman de ella el
 * pasaje citado, por su `reference`.
 */
export const followupReferences = [
  { reference: "heartFailure", source: "promir-cardiologia.md" },
  { reference: "heartFailureSection", source: "promir-cardiologia.md" },
  { reference: "chronicKidneyFailure", source: "promir-nefrologia.md" },
  { reference: "acuteKidneyFailure", source: "promir-nefrologia.md" },
  { reference: "thoracicSyndromes", source: "promir-radiologia-urgencias.md" },
  { reference: "nephrologyBody", source: "promir-nefrologia.md" },
  { reference: "chronicKidneyDefinition", source: "promir-nefrologia.md" },
  { reference: "hypertension", source: "promir-cardiologia.md" },
  { reference: "cardiovascularRisk", source: "promir-cardiologia.md" },
] as const satisfies readonly {
  reference: PreviewReferenceId;
  source: string;
}[];

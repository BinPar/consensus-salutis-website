import {
  Archive,
  BookOpen,
  FileCheck2,
  FileSearch,
  History,
  ListTree,
  Quote,
} from "lucide-react";

// Functional wording supplied by the user. Illustrations contain schematic, non-clinical text.
export const evidenceTools = [
  {
    id: "citations",
    number: "01",
    title: "Citas por afirmación",
    description: "Cada afirmación enlaza con su fuente.",
    icon: Quote,
    family: "answer",
    detail:
      "La cita parte de una afirmación concreta y abre el fragmento que la respalda, sin perder la respuesta de vista.",
  },
  {
    id: "bibliography",
    number: "02",
    title: "Bibliografía",
    description: "Las fuentes utilizadas, al final de cada respuesta.",
    icon: BookOpen,
    family: "answer",
    detail:
      "Una relación de las fuentes citadas permite recorrer los documentos utilizados en la respuesta desde un mismo lugar.",
  },
  {
    id: "preserved",
    number: "03",
    title: "Evidencia conservada",
    description:
      "La respuesta guarda lo que citó, aunque el documento se retire.",
    icon: Archive,
    family: "answer",
    detail:
      "El fragmento queda conservado con la respuesta. El estado actual del documento se muestra por separado.",
  },
  {
    id: "viewer",
    number: "04",
    title: "Visor del documento",
    description: "El PDF, en la página citada y con el pasaje resaltado.",
    icon: FileSearch,
    family: "document",
    detail:
      "La consulta del original se abre en la página citada. El pasaje señalado permite leer la evidencia en su contexto.",
  },
  {
    id: "verified",
    number: "05",
    title: "Texto verificado",
    description: "Indica si el pasaje coincide con el PDF original.",
    icon: FileCheck2,
    family: "document",
    detail:
      "La coincidencia con el texto original tiene su propio indicador, independiente de la localización del pasaje en la página.",
  },
  {
    id: "provenance",
    number: "06",
    title: "Procedencia completa",
    description: "Documento, capítulo, apartado y página.",
    icon: ListTree,
    family: "document",
    detail:
      "La referencia conserva el recorrido desde el documento hasta el punto concreto de lectura.",
  },
  {
    id: "updates",
    number: "07",
    title: "Avisos de actualización",
    description: "Señala los datos sustituidos por una fuente posterior.",
    icon: History,
    family: "document",
    detail:
      "El aviso distingue el contenido que se citó entonces de la fuente posterior, para revisar la vigencia de la información.",
  },
] as const;

export type EvidenceTool = (typeof evidenceTools)[number];
export type EvidenceToolId = EvidenceTool["id"];
export type EvidenceFilter = "all" | "answer" | "document";

export const evidenceFilters: { id: EvidenceFilter; label: string }[] = [
  { id: "all", label: "Todas" },
  { id: "answer", label: "En la respuesta" },
  { id: "document", label: "En el documento" },
];

export const evidenceStages = [
  {
    id: "answer",
    number: "01",
    title: "Seguir la cita.",
    description:
      "La lectura empieza en la respuesta. Cada afirmación permite llegar a la fuente que la respalda.",
    tools: ["citations", "bibliography"],
    scene: "citations",
  },
  {
    id: "document",
    number: "02",
    title: "Consultar el original.",
    description:
      "El documento se abre en su contexto, con la ubicación del pasaje y el estado de verificación del texto.",
    tools: ["viewer", "verified", "provenance"],
    scene: "viewer",
  },
  {
    id: "history",
    number: "03",
    title: "Conservar la evidencia.",
    description:
      "La respuesta conserva lo que citó. Una actualización posterior se presenta con su propio aviso.",
    tools: ["preserved", "updates"],
    scene: "preserved",
  },
] as const;

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import es from "../../../messages/es/clinical.json";

/*
  Document context supplied for mock 04, preserving the source wording.
  Es texto literal de la fuente, por eso se lee con `t.raw`. El párrafo de
  AINE llega partido: `highlight` es el pasaje que se resalta como cita.
*/
type EvidenceDocumentContext = {
  nephropathies: string[];
  dosing: string;
  antimicrobials: string[];
  nsaids: { highlight: string; rest: string };
  interactions: string;
};

export function useEvidenceDocumentContext(): EvidenceDocumentContext {
  const t = useTranslations("clinical.documentContext");
  return useMemo(
    () => ({
      nephropathies: t.raw("nephropathies") as string[],
      dosing: t.raw("dosing") as string,
      antimicrobials: t.raw("antimicrobials") as string[],
      nsaids: {
        highlight: t.raw("nsaids.highlight") as string,
        rest: t.raw("nsaids.rest") as string,
      },
      interactions: t.raw("interactions") as string,
    }),
    [t],
  );
}

/** Versión en castellano, con el párrafo de AINE entero, para otros módulos. */
export const evidenceDocumentContext = {
  nephropathies: es.documentContext.nephropathies,
  dosing: es.documentContext.dosing,
  antimicrobials: es.documentContext.antimicrobials,
  nsaids: es.documentContext.nsaids.highlight + es.documentContext.nsaids.rest,
  interactions: es.documentContext.interactions,
};

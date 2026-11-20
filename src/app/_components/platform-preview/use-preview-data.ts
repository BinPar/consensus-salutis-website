import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { useProcessConsultation } from "../clinical-process-data";
import { useProcessFollowup } from "../clinical-scene-references";
import { previewReferenceIds } from "./preview-consultation-content";
import {
  createPreviewData,
  previewQuoteAnchors,
  type PreviewText,
} from "./preview-data";

/** Datos de la maqueta con sus textos en el idioma de la página. */
export function usePreviewData() {
  const t = useTranslations("platform.preview");
  // Los pasajes llevan marcado y enlaces: se leen en bruto, sin formato ICU.
  const tQuotes = useTranslations("clinical.citations");
  const consultation = useProcessConsultation().question;
  const followup = useProcessFollowup().question;
  return useMemo(() => {
    const text: PreviewText = {
      questions: { consultation, followup },
      quotes: Object.fromEntries(
        previewQuoteAnchors.map((anchor) => [
          anchor,
          tQuotes.raw(anchor) as string,
        ]),
      ) as PreviewText["quotes"],
      conversations: {
        valoracion: t("conversations.valoracion"),
        seguimiento: t("conversations.seguimiento"),
      },
      answers: {
        initial: t("answers.initial"),
        followup: t("answers.followup"),
      },
      references: Object.fromEntries(
        previewReferenceIds.map((id) => [id, t(`references.${id}`)]),
      ) as PreviewText["references"],
    };
    return createPreviewData(text);
  }, [t, tQuotes, consultation, followup]);
}

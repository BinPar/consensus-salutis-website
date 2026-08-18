"use client";

/**
 * El informe, dentro del hilo de la entrevista.
 *
 * ## Va aquí y de momento solo aquí
 *
 * La página permanente y reenviable del informe —con su hoja de impresión y su
 * URL por `reportSlug`— es la issue #6. Mientras no exista, el informe se
 * entrega en la misma pantalla en la que se ha ganado: cerrar la entrevista con
 * un «te llegará por correo» y nada en la pantalla dejaría la evaluación sin
 * final visible, que es el estado que §5 pide diseñar y no dejar al azar.
 *
 * ## Lo que se pinta es solo el markdown
 *
 * Ni insignia de color, ni nivel como etiqueta, ni la versión de criterios, ni
 * el coste. El nombre del nivel y la frase de diagnóstico ya vienen dentro del
 * informe, escritos en prosa por el redactor y con el matiz que el redactor les
 * da; sacarlos también como una píldora de color arriba convertiría un documento
 * institucional en un semáforo, que es justo lo que el diseño evita.
 */

import { CircleCheck } from "lucide-react";

import { Markdown } from "~/app/_components/interview/markdown";
import type { InterviewReport } from "~/lib/interview";

export function ReportView({ report }: { report: InterviewReport }) {
  return (
    <section
      aria-label="Informe de idoneidad"
      className="border-primary-light/20 dark:border-primary-dark/20 mt-2 rounded-2xl border bg-white/70 p-5 sm:p-7 dark:bg-white/3"
    >
      <p className="text-primary-light font-display dark:text-primary-dark flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase">
        <CircleCheck aria-hidden="true" strokeWidth={1.8} className="size-4" />
        Evaluación completada
      </p>

      <div className="mt-5">
        <Markdown>{report.reportMarkdown}</Markdown>
      </div>
    </section>
  );
}

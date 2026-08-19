"use client";

/**
 * El final de la entrevista: la evaluación está completada y el informe vive en
 * su página permanente (issue #6, `/informe/[slug]`).
 *
 * ## Aquí se entrega la puerta, no el documento
 *
 * Hasta que existió la página del informe, el markdown se pintaba entero en este
 * hueco para que la evaluación tuviera un final visible. Ahora el final visible
 * es el enlace: la página tiene la URL reenviable —que es la acción principal
 * del informe— y el mismo documento con su semáforo y su tablero. Pintar el
 * markdown también aquí sería contar lo mismo dos veces, y este hilo no es el
 * sitio desde el que se reenvía.
 *
 * El markdown queda como red de seguridad: si una evaluación completada llega
 * sin `reportSlug` —no debería, pero el campo es opcional en el estado—, el
 * informe se enseña aquí antes que no enseñarse en ningún sitio.
 */

import { ArrowRight, CircleCheck } from "lucide-react";

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

      {report.reportSlug.length > 0 ? (
        <>
          <p className="font-body mt-4 text-[15px] leading-7 text-slate-600 dark:text-slate-400">
            El informe de idoneidad está listo. Se abre en su propia página, con
            un enlace que podéis reenviar dentro de la institución.
          </p>
          <a
            href={`/informe/${report.reportSlug}`}
            className="bg-primary-light dark:bg-primary-dark shadow-big-blocks mt-5 inline-flex min-h-11 items-center gap-2.5 rounded-full px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 dark:text-[#03111d] dark:hover:bg-[#71fffe]"
          >
            Abrir el informe
            <ArrowRight aria-hidden="true" strokeWidth={1.8} className="size-4" />
          </a>
        </>
      ) : (
        <div className="mt-5">
          <Markdown>{report.reportMarkdown}</Markdown>
        </div>
      )}
    </section>
  );
}

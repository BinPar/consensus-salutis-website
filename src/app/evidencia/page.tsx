import type { Metadata } from "next";

import {
  CapabilityGrid,
  DarkSection,
  MetricGrid,
  PageHero,
  PageShell,
} from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Evidencia",
  description:
    "Evidencia técnica, trazabilidad y evaluación continua de Consensus Salutis.",
};

const evidenceMetrics = [
  {
    value: "600/600",
    label: "Señal técnica MIR documentada y contextualizada.",
  },
  { value: "30.000+", label: "Preguntas disponibles para evaluación interna." },
  { value: "5+ años", label: "Depuración continua de base de contenidos." },
  { value: "0", label: "Fallos reportados en el benchmark citado." },
];

const items = [
  {
    title: "Evidencia como sistema",
    body: "La confianza no descansa en un titular: se construye con corpus, pruebas, referencias y revisión continuada.",
  },
  {
    title: "Metodología trazable",
    body: "Los resultados se presentan junto a su contexto, fuente, corpus y límites para evitar promesas fuera de ámbito.",
  },
  {
    title: "Evaluación continua",
    body: "La plataforma permite crear preguntas clave y ejecutar pruebas automáticas cuando se incorporan nuevos documentos.",
  },
];

export default function EvidenciaPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          eyebrow="Evidencia"
          title="Precisión medible sin perder trazabilidad clínica."
          body="Consensus Salutis combina evaluación continuada, preguntas de control y referencias visibles para que cada respuesta pueda ser revisada, corregida y mejorada dentro de un marco institucional."
        />
        <DarkSection>
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <MetricGrid metrics={evidenceMetrics} />
            <p className="font-body mt-5 max-w-3xl text-sm leading-6 text-slate-500">
              Los benchmarks se presentan como señal técnica contextualizada. El
              producto se comunica como soporte a decisión y consulta de
              evidencia, no como sustituto del criterio profesional.
            </p>
          </div>
        </DarkSection>
        <DarkSection variant="panel">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <CapabilityGrid items={items} />
          </div>
        </DarkSection>
      </main>
    </PageShell>
  );
}

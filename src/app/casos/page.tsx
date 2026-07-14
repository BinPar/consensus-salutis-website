import type { Metadata } from "next";

import {
  ThemeSection,
  Eyebrow,
  PageHero,
  PageShell,
} from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Casos",
  description:
    "Casos, validadores y ecosistema de Consensus Salutis para organizaciones sanitarias.",
};

const cases = [
  {
    label: "Servicio Madrileño de Salud",
    title: "Consulta de información científica y guías clínicas.",
    body: "Aplicación del modelo en Atención Primaria: ingesta de guías, gobierno documental, dashboards y mejora continua con comité responsable.",
  },
  {
    label: "Editorial Médica Panamericana",
    title: "Contenido médico experto y actualizado.",
    body: "Base de conocimiento con décadas de experiencia editorial médica, materiales gráficos, tablas, vídeos y preguntas de evaluación.",
  },
  {
    label: "AWS",
    title: "Infraestructura cloud native y escalable.",
    body: "Arquitectura preparada para contenedores, observabilidad, alta disponibilidad y despliegue en entornos controlados.",
  },
  {
    label: "MedicalBenchmark",
    title: "Evaluación técnica y cultura de medición.",
    body: "Señal metodológica para documentar rendimiento, reproducibilidad y evolución del sistema en escenarios médicos exigentes.",
  },
];

export default function CasosPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          eyebrow="Casos y validadores"
          title="Un ecosistema construido para operar en salud."
          body="Consensus Salutis combina experiencia institucional, conocimiento médico experto, infraestructura cloud y cultura de evaluación para entornos sanitarios exigentes."
        />
        <ThemeSection>
          <div className="mx-auto grid w-full max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-2">
            {cases.map((item) => (
              <article
                key={item.label}
                className="rounded-md border border-cyan-800/10 bg-white/80 p-7 shadow-lg shadow-slate-900/5 dark:border-cyan-300/10 dark:bg-[#081a2b]/82 dark:shadow-[#020817]/20"
              >
                <p className="text-xs font-semibold tracking-[0.18em] text-primary-light uppercase dark:text-primary-dark">
                  {item.label}
                </p>
                <h2 className="font-display mt-4 text-2xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
                  {item.title}
                </h2>
                <p className="font-body mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </ThemeSection>
        <ThemeSection variant="panel">
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <div className="max-w-3xl">
              <Eyebrow>Uso responsable</Eyebrow>
              <h2 className="font-display mt-4 text-3xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
                Credibilidad sin ruido: casos, contenido, tecnología y método.
              </h2>
              <p className="font-body mt-5 text-base leading-8 text-slate-600 dark:text-slate-400">
                Esta sección separa casos de uso, validadores tecnológicos y
                fuentes de contenido, manteniendo una narrativa precisa y
                verificable.
              </p>
            </div>
          </div>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

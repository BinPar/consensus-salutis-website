import type { Metadata } from "next";

import {
  CapabilityGrid,
  DarkSection,
  EvidenceFlow,
  Eyebrow,
  PageHero,
  PageShell,
} from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Plataforma",
  description:
    "Capacidades de Consensus Salutis para consulta clínica, ingesta documental y gobierno del conocimiento sanitario.",
};

const capabilities = [
  {
    title: "Ingesta multiformato",
    body: "PDF, DOCX, XLSX, PPTX, MD, vídeo, audio y EPUB con extracción automática de contenido relevante.",
  },
  {
    title: "Referencias verificables",
    body: "Cada respuesta puede enlazar al fragmento o página original que sustenta la información clínica.",
  },
  {
    title: "Ciclo de publicación",
    body: "Pruebas, preproducción y producción separadas para cargar, validar y publicar conocimiento sin perder control.",
  },
  {
    title: "Tests automáticos",
    body: "Preguntas clave para comprobar que nuevos contenidos no degradan respuestas críticas.",
  },
  {
    title: "Roles institucionales",
    body: "Administradores, editores, supervisores y usuarios finales con permisos alineados con gobierno del dato.",
  },
  {
    title: "Dashboard operativo",
    body: "Uso por centro, evolución de consultas, temas frecuentes y respuestas señaladas por usuarios.",
  },
];

export default function PlataformaPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          eyebrow="Plataforma"
          title="Un sistema operativo para el conocimiento clínico."
          body="Consensus Salutis transforma corpus médico, guías clínicas y documentación propia en una capa de consulta institucional con referencias, roles y procesos de validación."
        />
        <DarkSection>
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <CapabilityGrid items={capabilities} />
          </div>
        </DarkSection>
        <DarkSection variant="panel">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Gobierno del dato</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
                El conocimiento no solo se consulta. Se gobierna.
              </h2>
            </div>
            <div className="space-y-7 text-base leading-8 text-slate-400">
              <p>
                Las actualizaciones se incorporan en entornos controlados, pasan
                por revisión, se validan mediante preguntas clave y pueden
                trasladarse a producción cuando el equipo responsable lo decide.
              </p>
              <EvidenceFlow />
            </div>
          </div>
        </DarkSection>
      </main>
    </PageShell>
  );
}

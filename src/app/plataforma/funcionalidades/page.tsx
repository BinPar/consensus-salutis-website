import type { Metadata } from "next";

import { FeaturesOverview } from "~/app/_components/platform-features/features-overview";
import { PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Funcionalidades",
  description:
    "Todas las funcionalidades de BinPar agrupadas: evidencia visible, consulta clínica, formatos de respuesta, espacio personal y gobierno institucional.",
  alternates: { canonical: "/plataforma/funcionalidades" },
};

export default function FuncionalidadesPage() {
  return (
    <PageShell>
      <FeaturesOverview />
    </PageShell>
  );
}

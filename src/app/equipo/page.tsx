import type { Metadata } from "next";
import { PageShell } from "~/app/_components/site";
import { TeamPage } from "~/app/_components/team/team-page";

export const metadata: Metadata = {
  title: "Equipo",
  description:
    "Conoce a las personas detrás de BinPar. Distintas miradas y una misma curiosidad para acercar el conocimiento médico a quienes lo necesitan.",
  alternates: { canonical: "/equipo" },
};

export default function EquipoPage() {
  return (
    <PageShell>
      <TeamPage />
    </PageShell>
  );
}

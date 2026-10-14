import type { Metadata } from "next";

import { PlatformWalkthrough } from "~/app/_components/platform-walkthrough";
import { PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Plataforma",
  description:
    "De la consulta clínica a la evidencia: descubre cómo BinPar reúne expertos, contrasta aportaciones y ofrece una orientación con fuentes verificables.",
};

export default function PlataformaPage() {
  return (
    <PageShell>
      <PlatformWalkthrough />
    </PageShell>
  );
}

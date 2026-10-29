import type { Metadata } from "next";

import { MailGenerator } from "~/app/_components/mail-generator/mail-generator";
import { PageShell } from "~/app/_components/site";
import { PRODUCTION_SITE_URL } from "~/lib/site";

export const metadata: Metadata = {
  title: "Generador de firmas de correo",
  description: "Crear y copiar la firma de correo del equipo de BinPar.",
  robots: { index: false, follow: false },
};

export default function MailGeneratorPage() {
  return (
    <PageShell>
      <MailGenerator assetOrigin={PRODUCTION_SITE_URL} variant="open" />
    </PageShell>
  );
}

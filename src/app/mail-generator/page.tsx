import type { Metadata } from "next";

import { MailGenerator } from "~/app/_components/mail-generator/mail-generator";
import { SIGNATURE_ASSET_ORIGIN } from "~/app/_components/mail-generator/signature-assets";
import { PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Generador de firmas de correo",
  description: "Crear y copiar la firma de correo del equipo de BinPar.",
  robots: { index: false, follow: false },
};

export default function MailGeneratorPage() {
  return (
    <PageShell>
      <MailGenerator assetOrigin={SIGNATURE_ASSET_ORIGIN} variant="open" />
    </PageShell>
  );
}

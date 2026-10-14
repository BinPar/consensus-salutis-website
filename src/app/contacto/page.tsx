import type { Metadata } from "next";

import { HomeMotionBackground } from "~/app/_components/motion-system";
import { PageShell } from "~/app/_components/site";
import { ContactPageContent } from "./_components/contact-page-content";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicitar una reunión institucional sobre BinPar.",
};

export default function ContactoPage() {
  return (
    <PageShell>
      <main className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
        <HomeMotionBackground />
        <ContactPageContent />
      </main>
    </PageShell>
  );
}

import type { Metadata } from "next";

import { ContactForm } from "~/app/_components/contact-form";
import { Eyebrow, PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicitar una reunión institucional sobre Consensus Salutis.",
};

export default function ContactoPage() {
  return (
    <PageShell>
      <main className="bg-[#f4f9fc] dark:bg-[#06111f]">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="min-w-0">
            <Eyebrow>Contacto</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-[#05215e] sm:text-5xl dark:text-slate-50">
              Abramos una conversación sobre tu organización sanitaria.
            </h1>
            <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Revisamos caso de uso, restricciones de seguridad, requisitos de
              integración y el nivel de evidencia necesario para un piloto
              institucional.
            </p>
          </div>
          <ContactForm />
        </section>
      </main>
    </PageShell>
  );
}

import type { Metadata } from "next";

import { Eyebrow, PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Solicitar una reunión institucional sobre Consensus Salutis.",
};

export default function ContactoPage() {
  return (
    <PageShell>
      <main className="bg-[#06111f]">
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <Eyebrow>Contacto</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
              Abramos una conversación sobre tu organización sanitaria.
            </h1>
            <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Revisamos caso de uso, restricciones de seguridad, requisitos de
              integración y el nivel de evidencia necesario para un piloto
              institucional.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="mailto:info@binpar.com?subject=Reuni%C3%B3n%20Consensus%20Salutis"
                className="rounded-md bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#04111e] shadow-[0_0_34px_rgba(45,212,191,0.26)] transition hover:bg-cyan-200"
              >
                Escribir a BinPar
              </a>
              <a
                href="mailto:info@binpar.com?subject=Dossier%20Consensus%20Salutis"
                className="rounded-md border border-cyan-300/20 bg-white/3 px-5 py-3 text-center text-sm font-semibold text-cyan-50 transition hover:border-cyan-200/50 hover:bg-cyan-300/10"
              >
                Solicitar dossier
              </a>
            </div>
          </div>
          <aside className="rounded-md border border-cyan-300/10 bg-[#081a2b]/82 p-7 shadow-lg shadow-[#020817]/20">
            <p className="text-sm font-semibold text-slate-50">
              Para preparar la reunión
            </p>
            <ul className="font-body mt-5 space-y-4 text-sm leading-6 text-slate-400">
              <li>Ámbito asistencial y volumen aproximado de usuarios.</li>
              <li>Fuentes documentales, guías y protocolos prioritarios.</li>
              <li>Requisitos de seguridad, SSO, auditoría y despliegue.</li>
              <li>Indicadores de éxito para piloto o despliegue inicial.</li>
            </ul>
          </aside>
        </section>
      </main>
    </PageShell>
  );
}

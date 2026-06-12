import type { Metadata } from "next";

import { ThemeSection, Eyebrow, PageShell } from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Información sobre el tratamiento de datos personales en Consensus Salutis.",
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <main>
        <ThemeSection>
          <article className="mx-auto w-full max-w-4xl px-5 sm:px-8">
            <Eyebrow>Información legal</Eyebrow>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#05215e] sm:text-5xl dark:text-slate-50">
              Política de Privacidad
            </h1>
            <div className="font-body mt-10 space-y-8 text-base leading-8 text-slate-600 dark:text-slate-400">
              <LegalSection title="Responsable del tratamiento">
                BinPar Team S.L., con NIF B85271930 y domicilio social en Paseo
                de la Castellana 43, 4, es responsable del tratamiento de los
                datos enviados mediante el formulario de contacto de Consensus
                Salutis. Puedes contactar mediante info@binpar.com.
              </LegalSection>
              <LegalSection title="Finalidad y base jurídica">
                Tratamos el nombre, correo electrónico y contenido del mensaje
                exclusivamente para gestionar y responder la consulta recibida.
                La base jurídica es el consentimiento otorgado al marcar la
                aceptación de esta política.
              </LegalSection>
              <LegalSection title="Conservación y destinatarios">
                Los datos se conservarán durante el tiempo necesario para
                atender la consulta y cumplir las obligaciones legales
                aplicables. No se cederán a terceros salvo obligación legal o a
                proveedores necesarios para prestar el servicio bajo las
                garantías correspondientes.
              </LegalSection>
              <LegalSection title="Derechos">
                Puedes solicitar el acceso, rectificación, supresión,
                limitación, oposición o portabilidad de tus datos escribiendo a
                info@binpar.com. También puedes presentar una reclamación ante
                la Agencia Española de Protección de Datos.
              </LegalSection>
              <LegalSection title="Seguridad">
                Aplicamos medidas técnicas y organizativas orientadas a proteger
                los datos frente a accesos, alteraciones o divulgaciones no
                autorizadas. El formulario incorpora controles anti-spam y
                limitación de solicitudes.
              </LegalSection>
            </div>
          </article>
        </ThemeSection>
      </main>
    </PageShell>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-[#05215e] dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}

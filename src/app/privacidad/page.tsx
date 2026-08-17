import type { Metadata } from "next";
import Link from "next/link";

import { ThemeSection, Eyebrow, PageShell } from "~/app/_components/site";
import { PURPOSE_STATEMENT, RETENTION_STATEMENT } from "~/lib/eligibility";

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
            <h1 className="font-display mt-5 text-4xl font-semibold tracking-tight text-[#05215e] sm:text-5xl dark:text-slate-50">
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
              {/*
                Evaluador de idoneidad. El plazo y la finalidad salen de las
                mismas constantes que el texto del consentimiento en /evaluador:
                los dos textos tienen que decir lo mismo, y compartiendo la
                constante no pueden divergir editando solo uno.
              */}
              <LegalSection title="Evaluador de idoneidad">
                Si completas el{" "}
                <Link
                  href="/evaluador"
                  className="text-primary-light dark:text-secondary-dark underline underline-offset-4 hover:text-cyan-800 dark:hover:text-cyan-200"
                >
                  evaluador de idoneidad
                </Link>
                , tratamos los datos de identificación que facilitas —nombre,
                cargo, correo electrónico institucional, institución y ámbito
                geográfico— junto con la transcripción de la entrevista.{" "}
                {PURPOSE_STATEMENT} La base jurídica es el consentimiento que
                otorgas de forma expresa antes de empezar, y puedes retirarlo en
                cualquier momento escribiendo a info@binpar.com.
              </LegalSection>
              <LegalSection title="Retención de la evaluación">
                {/*
                  Retención indefinida, sostenida por el consentimiento. Misma
                  constante que el texto del consentimiento en /evaluador.
                */}
                {RETENTION_STATEMENT} Puedes retirar el consentimiento o pedir la
                supresión en cualquier momento escribiendo a info@binpar.com, y en
                ese caso eliminamos la ficha y la transcripción. En esta evaluación
                no se tratan datos de salud de pacientes en ningún momento.
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
      <h2 className="font-display text-xl font-semibold text-[#05215e] dark:text-slate-100">
        {title}
      </h2>
      <p className="mt-3">{children}</p>
    </section>
  );
}

import type { Metadata } from "next";

import {
  CapabilityGrid,
  DarkSection,
  Eyebrow,
  PageHero,
  PageShell,
} from "~/app/_components/site";

export const metadata: Metadata = {
  title: "Seguridad",
  description:
    "Seguridad, privacidad, compliance y operación institucional de Consensus Salutis.",
};

const controls = [
  {
    title: "Datos bajo control",
    body: "Las consultas no se usan para entrenar modelos globales y el tratamiento se diseña para entornos autorizados.",
  },
  {
    title: "Anonimización y bloqueo",
    body: "Filtro de información personal para anonimizar o bloquear mensajes con datos identificables según configuración.",
  },
  {
    title: "Autenticación empresarial",
    body: "SSO mediante OpenID, OAuth 2.0, LDAP, SAML o JWT, con recomendación de 2FA para perfiles de gestión.",
  },
  {
    title: "Auditoría completa",
    body: "Logs estructurados, historial de versiones y trazabilidad de acciones para revisión de calidad y cumplimiento.",
  },
  {
    title: "Operación observable",
    body: "Monitorización, alertas e integración con sistemas como CloudWatch, Datadog, Splunk, Grafana Loki o Sentry.",
  },
  {
    title: "Continuidad",
    body: "Copias diarias, simulacros trimestrales de restauración, RPO máximo de 24 horas y RTO inferior a 8 horas.",
  },
];

export default function SeguridadPage() {
  return (
    <PageShell>
      <main>
        <PageHero
          eyebrow="Seguridad y compliance"
          title="Diseñado para operar donde la confianza no es decorativa."
          body="Consensus Salutis se plantea desde el diseño para privacidad, auditoría, despliegue en la Unión Europea y gobierno técnico compatible con organizaciones sanitarias."
        />
        <DarkSection>
          <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
            <CapabilityGrid items={controls} />
          </div>
        </DarkSection>
        <DarkSection variant="deep">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <Eyebrow>Marco regulatorio</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
                Seguridad, trazabilidad y criterio profesional en el centro.
              </h2>
            </div>
            <div className="font-body space-y-5 text-base leading-8 text-slate-400">
              <p>
                La comunicación pública habla de diseño orientado a
                cumplimiento, controles técnicos y trazabilidad, evitando
                promesas absolutas si no van acompañadas de certificaciones o
                informes específicos.
              </p>
              <p>
                El producto se presenta como soporte a decisión y consulta de
                evidencia; no como sustituto del criterio profesional.
              </p>
            </div>
          </div>
        </DarkSection>
      </main>
    </PageShell>
  );
}

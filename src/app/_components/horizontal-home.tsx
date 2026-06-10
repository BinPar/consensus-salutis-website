"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  CapabilityGrid,
  CTAGroup,
  DarkSection,
  EvidenceFlow,
  Eyebrow,
  MetricGrid,
  SignalPanel,
} from "~/app/_components/site";

const metrics = [
  { value: "3 TB", label: "Conocimiento médico estructurado y gobernable." },
  {
    value: "8.327",
    label: "Epígrafes clínicos listos para consulta trazable.",
  },
  {
    value: "30.000+",
    label: "Preguntas para evaluación continua del sistema.",
  },
  { value: "24h", label: "Actualización urgente de contenidos relevantes." },
];

const capabilities = [
  {
    title: "Respuesta con rastro",
    body: "Cada salida puede exponer las fuentes utilizadas y devolver al fragmento exacto que sustenta la respuesta.",
  },
  {
    title: "Conocimiento bajo gobierno",
    body: "Guías, protocolos y documentación propia entran por un flujo de prueba, validación y publicación controlada.",
  },
  {
    title: "Operación sanitaria",
    body: "SSO, 2FA, auditoría, dashboards y observabilidad pensados para organizaciones con información sensible.",
  },
];

const panels = [
  "Inicio",
  "Métricas",
  "Arquitectura",
  "Atención Primaria",
  "Reunión",
];

function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

export function HorizontalHome() {
  const railRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) return;

    const handleWheel = (event: WheelEvent) => {
      const max = rail.scrollWidth - rail.clientWidth;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const canMove =
        (delta > 0 && rail.scrollLeft < max) ||
        (delta < 0 && rail.scrollLeft > 0);

      if (!canMove) return;

      event.preventDefault();
      rail.scrollLeft = Math.max(0, Math.min(max, rail.scrollLeft + delta));
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });

    return () => rail.removeEventListener("wheel", handleWheel);
  }, []);

  const updateProgress = () => {
    const rail = railRef.current;

    if (!rail) return;

    const max = rail.scrollWidth - rail.clientWidth;
    setProgress(max > 0 ? rail.scrollLeft / max : 0);
  };

  const scrollBy = (amount: number) => {
    const rail = railRef.current;

    if (!rail) return;

    rail.scrollBy({
      left: amount,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <>
      <main className="relative z-10 hidden min-h-0 flex-1 lg:block">
        <section className="relative h-full overflow-hidden border-b border-cyan-300/10">
          <div
            ref={railRef}
            tabIndex={0}
            aria-label="Home horizontal de Consensus Salutis"
            onScroll={updateProgress}
            onKeyDown={(event) => {
              const rail = railRef.current;

              if (!rail) return;

              if (event.key === "ArrowRight" || event.key === "PageDown") {
                event.preventDefault();
                scrollBy(window.innerWidth * 0.82);
              }

              if (event.key === "ArrowLeft" || event.key === "PageUp") {
                event.preventDefault();
                scrollBy(-window.innerWidth * 0.82);
              }

              if (event.key === "Home") {
                event.preventDefault();
                rail.scrollTo({
                  left: 0,
                  behavior: reducedMotion ? "auto" : "smooth",
                });
              }

              if (event.key === "End") {
                event.preventDefault();
                rail.scrollTo({
                  left: rail.scrollWidth,
                  behavior: reducedMotion ? "auto" : "smooth",
                });
              }
            }}
            className="relative h-full scrollbar-none overflow-x-auto overflow-y-hidden outline-none [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex h-full w-max">
              <HeroPanel />
              <MetricsPanel />
              <ArchitecturePanel />
              <PrimaryCarePanel />
              <ContactPanel />
            </div>
          </div>

          <div className="pointer-events-none absolute right-8 bottom-7 left-8">
            <div className="flex items-center justify-between gap-6">
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                {
                  panels[
                    Math.min(
                      panels.length - 1,
                      Math.round(progress * (panels.length - 1)),
                    )
                  ]
                }
              </p>
              <div className="h-px flex-1 bg-cyan-300/10">
                <div
                  className="h-px bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                  style={{ width: `${Math.max(progress * 100, 7)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Scroll vertical para avanzar
              </p>
            </div>
          </div>
        </section>
      </main>

      <MobileHome />
    </>
  );
}

function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative flex h-full w-screen shrink-0 items-center px-10 py-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function HeroPanel() {
  return (
    <Panel>
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative">
          <Eyebrow>IA médica institucional</Eyebrow>
          <h1 className="mt-6 max-w-4xl text-6xl font-semibold tracking-tight text-slate-50 xl:text-7xl">
            Conocimiento clínico gobernado por IA.
          </h1>
          <p className="mt-7 max-w-2xl text-xl leading-9 text-slate-300">
            Consensus Salutis convierte guías, protocolos y corpus médico en
            respuestas trazables para Atención Primaria. Una capa de IA seria,
            auditable y preparada para operar dentro de un sistema sanitario.
          </p>
          <div className="mt-9">
            <CTAGroup />
          </div>
        </div>
        <SignalPanel />
      </div>
    </Panel>
  );
}

function MetricsPanel() {
  return (
    <Panel className="bg-[#030916]/70">
      <div className="max-w-5xl">
        <Eyebrow>Señales operativas</Eyebrow>
        <h2 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-slate-50">
          Volumen, control y actualización continua.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
          La capa de IA se apoya en conocimiento médico estructurado, preguntas
          de control y procesos de actualización pensados para entornos reales.
        </p>
      </div>
      <div className="mt-10">
        <MetricGrid metrics={metrics} />
      </div>
    </Panel>
  );
}

function ArchitecturePanel() {
  return (
    <Panel className="bg-[#081827]/72">
      <div className="max-w-4xl">
        <Eyebrow>Producto</Eyebrow>
        <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-50">
          Del documento disperso a la decisión informada.
        </h2>
        <p className="mt-5 text-lg leading-8 text-slate-400">
          La plataforma articula contenido médico validado, documentación
          propia, orquestación IA y procesos de gobierno para reducir la
          fricción de consultar información clínica en entornos reales.
        </p>
      </div>
      <div className="mt-10">
        <CapabilityGrid items={capabilities} />
      </div>
    </Panel>
  );
}

function PrimaryCarePanel() {
  return (
    <Panel>
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Eyebrow>Atención Primaria</Eyebrow>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-50">
            Preguntar, contrastar, citar, aprender.
          </h2>
          <p className="mt-6 text-lg leading-8 text-slate-400">
            Para escenarios donde el profesional necesita consultar información
            científica, protocolos locales, campañas de salud y materiales de
            formación en poco tiempo.
          </p>
        </div>
        <EvidenceFlow />
      </div>
    </Panel>
  );
}

function ContactPanel() {
  return (
    <Panel className="bg-[#030916]/82">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <Eyebrow>Siguiente paso</Eyebrow>
          <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-50">
            Una conversación seria sobre tu organización sanitaria.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            Revisamos caso de uso, restricciones de seguridad, requisitos de
            integración y el nivel de evidencia necesario para un piloto
            institucional.
          </p>
          <div className="mt-9">
            <Link
              href="/contacto"
              className="rounded-md bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#04111e] shadow-[0_0_34px_rgba(45,212,191,0.26)] transition hover:bg-cyan-200"
            >
              Solicitar reunión
            </Link>
          </div>
        </div>
        <div className="rounded-md border border-cyan-300/10 bg-[#081a2b]/82 p-7 shadow-lg shadow-[#020817]/20">
          <p className="text-sm font-semibold text-slate-50">
            Preparar la reunión
          </p>
          <ul className="mt-5 space-y-4 text-sm leading-6 text-slate-400">
            <li>Ámbito asistencial y volumen aproximado de usuarios.</li>
            <li>Fuentes documentales, guías y protocolos prioritarios.</li>
            <li>Requisitos de seguridad, SSO, auditoría y despliegue.</li>
            <li>Indicadores de éxito para piloto o despliegue inicial.</li>
          </ul>
        </div>
      </div>
    </Panel>
  );
}

function MobileHome() {
  return (
    <main className="relative z-10 bg-[#06111f] lg:hidden">
      <section className="relative overflow-hidden border-b border-cyan-300/10 px-5 py-16">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.1)_72%,transparent)]" />
        <div className="relative">
          <Eyebrow>IA médica institucional</Eyebrow>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-50">
            Conocimiento clínico gobernado por IA.
          </h1>
          <p className="mt-7 text-lg leading-8 text-slate-300">
            Consensus Salutis convierte guías, protocolos y corpus médico en
            respuestas trazables para Atención Primaria.
          </p>
          <div className="mt-9">
            <CTAGroup />
          </div>
        </div>
      </section>

      <DarkSection variant="deep">
        <div className="px-5">
          <MetricGrid metrics={metrics} />
        </div>
      </DarkSection>

      <DarkSection variant="panel">
        <div className="px-5">
          <Eyebrow>Producto</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
            Del documento disperso a la decisión informada.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-400">
            La plataforma articula contenido médico validado, documentación
            propia, orquestación IA y procesos de gobierno.
          </p>
          <div className="mt-10">
            <CapabilityGrid items={capabilities} />
          </div>
        </div>
      </DarkSection>

      <DarkSection>
        <div className="space-y-8 px-5">
          <div>
            <Eyebrow>Atención Primaria</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
              Preguntar, contrastar, citar, aprender.
            </h2>
          </div>
          <EvidenceFlow />
          <Link
            href="/contacto"
            className="inline-flex rounded-md bg-cyan-300 px-5 py-3 text-sm font-semibold text-[#04111e]"
          >
            Solicitar reunión
          </Link>
        </div>
      </DarkSection>
    </main>
  );
}

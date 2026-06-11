"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import {
  CapabilityGrid,
  CTAGroup,
  DarkSection,
  EvidenceFlow,
  Eyebrow,
  SignalPanel,
} from "~/app/_components/site";
import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import {
  MotionLink,
  Reveal,
  ViewportReveal,
} from "~/app/_components/motion-system";

const metrics = [
  { value: "+3 TB", label: "Conocimiento médico estructurado y gobernable." },
  {
    value: "+8.327",
    label: "Epígrafes clínicos listos para consulta trazable.",
  },
  {
    value: "+30.000",
    label: "Preguntas para evaluación continua del sistema.",
  },
  { value: "<24h", label: "Actualización urgente de contenidos relevantes." },
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

export function HorizontalHome() {
  const railRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const previousScrollLeft = useRef(0);
  const [progress, setProgress] = useState(0);
  const [revealedPanels, setRevealedPanels] = useState<Set<number>>(
    () => new Set([0]),
  );
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
    const direction =
      rail.scrollLeft > previousScrollLeft.current
        ? "forward"
        : rail.scrollLeft < previousScrollLeft.current
          ? "backward"
          : "none";

    setRevealedPanels((current) => {
      const next = new Set(current);

      panelRefs.current.forEach((panel, index) => {
        if (!panel || index === 0) return;

        const panelLeft = panel.offsetLeft;
        const visibleWidth = Math.max(
          0,
          Math.min(
            panelLeft + panel.offsetWidth,
            rail.scrollLeft + rail.clientWidth,
          ) - Math.max(panelLeft, rail.scrollLeft),
        );
        const visibility = visibleWidth / panel.offsetWidth;

        if (direction === "forward" && visibility >= 0.35) {
          next.add(index);
        }

        if (
          direction === "backward" &&
          panelLeft >= rail.scrollLeft + rail.clientWidth
        ) {
          next.delete(index);
        }
      });

      return next;
    });

    previousScrollLeft.current = rail.scrollLeft;
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
              <HeroPanel
                panelRef={(node) => {
                  panelRefs.current[0] = node;
                }}
                visible={revealedPanels.has(0)}
              />
              <MetricsPanel
                panelRef={(node) => {
                  panelRefs.current[1] = node;
                }}
                visible={revealedPanels.has(1)}
              />
              <ArchitecturePanel
                panelRef={(node) => {
                  panelRefs.current[2] = node;
                }}
                visible={revealedPanels.has(2)}
              />
              <PrimaryCarePanel
                panelRef={(node) => {
                  panelRefs.current[3] = node;
                }}
                visible={revealedPanels.has(3)}
              />
              <ContactPanel
                panelRef={(node) => {
                  panelRefs.current[4] = node;
                }}
                visible={revealedPanels.has(4)}
              />
            </div>
          </div>

          <div className="pointer-events-none absolute right-8 bottom-4 left-8">
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
                <motion.div
                  className="h-px origin-left bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.55)]"
                  animate={{ scaleX: Math.max(progress, 0.07) }}
                  transition={{ type: "spring", stiffness: 180, damping: 28 }}
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
  panelRef,
}: {
  children: React.ReactNode;
  className?: string;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <section
      ref={panelRef}
      className={`relative flex h-full w-screen shrink-0 items-center px-10 py-12 ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function HeroPanel({
  visible,
  panelRef,
}: {
  visible: boolean;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <Panel panelRef={panelRef}>
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative">
          <Reveal visible={visible}>
            <Eyebrow>IA médica institucional</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold tracking-tight text-slate-50 xl:text-7xl">
              Conocimiento clínico gobernado por IA.
            </h1>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="mt-7 max-w-2xl text-xl leading-9 text-slate-300">
              Consensus Salutis convierte guías, protocolos y corpus médico en
              respuestas trazables para Atención Primaria. Una capa de IA seria,
              auditable y preparada para operar dentro de un sistema sanitario.
            </p>
          </Reveal>
          <Reveal visible={visible} delay={0.3} className="mt-9">
            <CTAGroup />
          </Reveal>
        </div>
        <Reveal visible={visible} delay={0.4}>
          <SignalPanel />
        </Reveal>
      </div>
    </Panel>
  );
}

function MetricsPanel({
  visible,
  panelRef,
}: {
  visible: boolean;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <Panel
      className="bg-linear-to-br from-[#030916]/70 to-[#030916]/30"
      panelRef={panelRef}
    >
      <div className="max-w-5xl">
        <Reveal visible={visible}>
          <Eyebrow>KPIs operativos</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight text-slate-50">
            Volumen y actualización continua.
          </h2>
        </Reveal>
        <Reveal visible={visible} delay={0.2}>
          <p className="mt-6 max-w-5xl text-lg leading-8 text-slate-400">
            La plataforma combina una base de conocimiento médico estructurada
            con guías clínicas y protocolos propios de cada organización. Los
            contenidos pasan por procesos automatizados de ingesta, evaluación
            mediante preguntas clave, validación clínica y publicación
            controlada antes de incorporarse a las respuestas del sistema.
          </p>
        </Reveal>
      </div>
      <StaggeredMetricGrid visible={visible} className="mt-10" />
    </Panel>
  );
}

function ArchitecturePanel({
  visible,
  panelRef,
}: {
  visible: boolean;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <Panel
      className="bg-linear-to-bl from-[#030916]/70 to-[#030916]/30"
      panelRef={panelRef}
    >
      <div className="max-w-4xl">
        <Reveal visible={visible}>
          <Eyebrow>Producto</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-50">
            De documentos dispersos a la decisión informada.
          </h2>
        </Reveal>
        <Reveal visible={visible} delay={0.2}>
          <p className="mt-5 text-lg leading-8 text-slate-400">
            La plataforma articula contenido médico validado, documentación
            propia, orquestación IA y procesos de gobierno para reducir la
            fricción de consultar información clínica en entornos reales.
          </p>
        </Reveal>
      </div>
      <Reveal visible={visible} delay={0.3} className="mt-10">
        <CapabilityGrid items={capabilities} />
      </Reveal>
    </Panel>
  );
}

function PrimaryCarePanel({
  visible,
  panelRef,
}: {
  visible: boolean;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <Panel panelRef={panelRef}>
      <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal visible={visible}>
            <Eyebrow>Atención Primaria</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-slate-50">
              Preguntar, contrastar, citar, aprender.
            </h2>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              Para escenarios donde el profesional necesita consultar
              información científica, protocolos locales, campañas de salud y
              materiales de formación en poco tiempo.
            </p>
          </Reveal>
        </div>
        <Reveal visible={visible} delay={0.3}>
          <EvidenceFlow />
        </Reveal>
      </div>
    </Panel>
  );
}

function ContactPanel({
  visible,
  panelRef,
}: {
  visible: boolean;
  panelRef: (node: HTMLElement | null) => void;
}) {
  return (
    <Panel className="bg-[#030916]/82" panelRef={panelRef}>
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
        <div>
          <Reveal visible={visible}>
            <Eyebrow>Siguiente paso</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-50">
              Una conversación seria sobre tu organización sanitaria.
            </h2>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Revisamos caso de uso, restricciones de seguridad, requisitos de
              integración y el nivel de evidencia necesario para un piloto
              institucional.
            </p>
          </Reveal>
          <Reveal visible={visible} delay={0.3} className="mt-9">
            <MotionLink
              href="/contacto"
              className="rounded-md bg-cyan-300 px-5 py-3 text-center text-sm font-semibold text-[#04111e] shadow-[0_0_34px_rgba(45,212,191,0.26)] transition hover:bg-cyan-200"
            >
              Solicitar reunión
            </MotionLink>
          </Reveal>
        </div>
        <Reveal visible={visible} delay={0.4}>
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
        </Reveal>
      </div>
    </Panel>
  );
}

function MobileHome() {
  return (
    <main className="relative z-10 bg-[#06111f] lg:hidden">
      <section className="relative overflow-hidden border-b border-cyan-300/10 px-5 py-16">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.1)_72%,transparent)]" />
        <ViewportReveal className="relative">
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
          <div className="mt-10">
            <ClinicalChatMock compact />
          </div>
        </ViewportReveal>
      </section>

      <DarkSection variant="deep">
        <StaggeredMetricGrid className="px-5" />
      </DarkSection>

      <DarkSection variant="panel">
        <ViewportReveal className="px-5">
          <Eyebrow>Producto</Eyebrow>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-50">
            De documentos dispersos a la decisión informada.
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-400">
            La plataforma articula contenido médico validado, documentación
            propia, orquestación IA y procesos de gobierno.
          </p>
          <div className="mt-10">
            <CapabilityGrid items={capabilities} />
          </div>
        </ViewportReveal>
      </DarkSection>

      <DarkSection>
        <ViewportReveal className="space-y-8 px-5">
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
        </ViewportReveal>
      </DarkSection>
    </main>
  );
}

function StaggeredMetricGrid({
  visible,
  className = "",
}: {
  visible?: boolean;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const shown = reducedMotion ? true : visible;

  return (
    <motion.div
      className={`grid gap-8 overflow-hidden sm:grid-cols-2 lg:grid-cols-4 ${className}`}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={visible === undefined ? undefined : shown ? "visible" : "hidden"}
      whileInView={visible === undefined ? "visible" : undefined}
      viewport={{ amount: 0.3, once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: reducedMotion ? 0 : 0.3,
            staggerChildren: reducedMotion ? 0 : 0.18,
          },
        },
      }}
    >
      {metrics.map((metric) => (
        <motion.div
          key={metric.label}
          className="rounded-2xl border border-cyan-300/20 bg-white/3 p-6 backdrop-blur-sm"
          variants={{
            hidden: { opacity: reducedMotion ? 1 : 0 },
            visible: {
              opacity: 1,
              transition: { duration: reducedMotion ? 0 : 0.42 },
            },
          }}
        >
          <p className="text-3xl font-semibold text-cyan-100">{metric.value}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {metric.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

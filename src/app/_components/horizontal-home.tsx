"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  CTAGroup,
  ThemeSection,
  Eyebrow,
  SignalPanel,
} from "~/app/_components/site";
import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import { ContactForm } from "~/app/_components/contact-form";
import { Reveal, ViewportReveal } from "~/app/_components/motion-system";

const metrics = [
  {
    value: 3,
    prefix: "+",
    suffix: " TB",
    label: "Conocimiento médico estructurado y gobernable.",
  },
  {
    value: 8327,
    prefix: "+",
    label: "Epígrafes clínicos listos para consulta trazable.",
  },
  {
    value: 30000,
    prefix: "+",
    label: "Preguntas para evaluación continua del sistema.",
  },
  {
    value: 24,
    prefix: "<",
    suffix: "h",
    label: "Actualización urgente de contenidos relevantes.",
  },
];

const productPillars = [
  {
    name: "Editorial Médica Panamericana",
    role: "Conocimiento clínico",
    logo: "/logos/emp.svg",
    logoWidth: 180,
    logoHeight: 45,
    logoClassName: "h-10 w-auto max-w-[150px] ",
    body: "Más de 70 años de experiencia editorial sostienen una base médica estructurada y actualizada de forma continua, con mas de 3TB de conocimiento médico.",
  },
  {
    name: "AWS",
    role: "Infraestructura resiliente",
    logo: "/logos/Amazon_Web_Services_Logo.svg",
    logoWidth: 84,
    logoHeight: 50,
    logoClassName: "h-11 w-auto opacity-80",
    body: "Arquitectura cloud native preparada para aislar cargas, escalar automáticamente y mantener continuidad, observabilidad y cumplimiento.",
  },
  {
    name: "BinPar",
    role: "Producto e ingeniería",
    logo: "/logos/BinparSquare.svg",
    logoWidth: 112,
    logoHeight: 54,
    logoClassName: "h-10 w-auto",
    body: "Más de 15 años desarrollando software sanitario convierten contenidos y protocolos en un sistema integrable, evaluable y trazable.",
  },
];

const clinicalProcess = [
  {
    step: "01",
    title: "Plantear la consulta",
    body: "El profesional formula una duda clínica en lenguaje natural, aportando el contexto necesario para orientar la consulta.",
    signal: "Lenguaje clínico natural",
  },
  {
    step: "02",
    title: "Localizar conocimiento relevante",
    body: "El sistema recupera conocimiento relevante del corpus médico, las guías clínicas y los protocolos institucionales.",
    signal: "Corpus + guías + protocolos",
  },
  {
    step: "03",
    title: "Contrastar y priorizar",
    body: "El sistema contrasta las fuentes recuperadas y aplica las prioridades documentales definidas por la organización.",
    signal: "Prioridades configurables",
  },
  {
    step: "04",
    title: "Responder con evidencia visible",
    body: "El sistema sintetiza una respuesta operativa y enlaza el fragmento o la página original que sustenta cada conclusión.",
    signal: "Referencia al fragmento original",
  },
  {
    step: "05",
    title: "Revisar y mejorar",
    body: "La valoración profesional permite revisar los contenidos y reforzar las pruebas automáticas para futuras consultas.",
    signal: "Feedback + pruebas automáticas",
  },
];

const panels = [
  "Inicio",
  "Métricas",
  "Arquitectura",
  "Atención Primaria",
  "Reunión",
];

type DesktopLayout = "horizontal" | "vertical";
type PanelHeight = "natural" | "viewport";
type PanelRef = (node: HTMLElement | null) => void;

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
        <section className="relative h-full overflow-hidden border-b border-cyan-800/10 dark:border-cyan-300/10">
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

              <PrimaryCarePanel
                panelRef={(node) => {
                  panelRefs.current[3] = node;
                }}
                visible={revealedPanels.has(3)}
              />
              <ArchitecturePanel
                panelRef={(node) => {
                  panelRefs.current[2] = node;
                }}
                visible={revealedPanels.has(2)}
              />
              <MetricsPanel
                panelRef={(node) => {
                  panelRefs.current[1] = node;
                }}
                visible={revealedPanels.has(1)}
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
              <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase dark:text-slate-500">
                {
                  panels[
                    Math.min(
                      panels.length - 1,
                      Math.round(progress * (panels.length - 1)),
                    )
                  ]
                }
              </p>
              <div className="bg-primary-light/10 h-px flex-1 dark:bg-cyan-300/10">
                <motion.div
                  className="bg-primary-light h-px origin-left shadow-[0_0_18px_rgba(34,211,238,0.55)] dark:bg-cyan-300"
                  animate={{ scaleX: Math.max(progress, 0.07) }}
                  transition={{ type: "spring", stiffness: 180, damping: 28 }}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
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

export function VerticalHome() {
  return (
    <>
      <main className="relative z-10 hidden lg:block">
        <VerticalPanel initiallyVisible>
          {(visible, panelRef) => (
            <HeroPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
        <VerticalPanel>
          {(visible, panelRef) => (
            <PrimaryCarePanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
        <VerticalPanel>
          {(visible, panelRef) => (
            <ArchitecturePanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>

        <VerticalPanel>
          {(visible, panelRef) => (
            <MetricsPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
        <VerticalPanel>
          {(visible, panelRef) => (
            <ContactPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
      </main>

      <MobileHome />
    </>
  );
}

function VerticalPanel({
  children,
  initiallyVisible = false,
}: {
  children: (visible: boolean, panelRef: PanelRef) => React.ReactNode;
  initiallyVisible?: boolean;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const previousScrollY = useRef(0);
  const [visible, setVisible] = useState(initiallyVisible);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const updateVisibility = (mode: "initial" | "scroll" = "scroll") => {
      const panel = panelRef.current;

      if (!panel) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY.current;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const rect = panel.getBoundingClientRect();
      const activationBottom = window.innerHeight * 0.85;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const visibility = visibleHeight / rect.height;
      const passedActivationPoint =
        rect.bottom <= 0 || rect.top <= activationBottom - rect.height * 0.45;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && visibility >= 0.45)
      ) {
        setVisible(true);
      }

      if (scrollingUp && rect.top >= activationBottom) {
        setVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    const handleScroll = () => updateVisibility("scroll");

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateVisibility("initial");
    const frameId = window.requestAnimationFrame(() =>
      updateVisibility("initial"),
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return children(visible, (node) => {
    panelRef.current = node;
  });
}

function Panel({
  children,
  className = "",
  panelRef,
  layout = "horizontal",
  height = "natural",
}: {
  children: React.ReactNode;
  className?: string;
  panelRef: PanelRef;
  layout?: DesktopLayout;
  height?: PanelHeight;
}) {
  const layoutClassName =
    layout === "horizontal"
      ? "flex h-full w-screen shrink-0 items-center px-10 py-12"
      : height === "viewport"
        ? "flex min-h-[calc(100svh-4rem)] items-center px-10 py-20"
        : "px-10 py-28";

  return (
    <section
      ref={panelRef}
      className={`relative ${layoutClassName} ${className}`}
    >
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}

function HeroPanel({
  visible,
  panelRef,
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <Panel panelRef={panelRef} layout={layout} height="viewport">
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative">
          <Reveal visible={visible}>
            <Eyebrow>IA médica institucional</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h1 className="mt-6 max-w-4xl text-6xl font-semibold tracking-tight text-[#05215e] xl:text-7xl dark:text-slate-50">
              Conocimiento clínico gobernado por IA.
            </h1>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="font-body mt-7 max-w-2xl text-xl leading-9 text-slate-700 dark:text-slate-300">
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
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <Panel
      className="bg-linear-to-br from-[#deedf3]/80 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"
      panelRef={panelRef}
      layout={layout}
    >
      <MetricsIntro visible={visible} />
      <StaggeredMetricGrid visible={visible} className="mt-10" />
    </Panel>
  );
}

function MetricsIntro({
  visible,
  compact = false,
}: {
  visible?: boolean;
  compact?: boolean;
}) {
  const content = (
    <>
      <Eyebrow>KPIs operativos</Eyebrow>
      <h2
        className={`mt-4 max-w-4xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50 ${
          compact ? "text-3xl" : "text-5xl"
        }`}
      >
        Volumen y actualización continua.
      </h2>
      <p
        className={`font-body max-w-5xl text-slate-600 dark:text-slate-400 ${
          compact
            ? "mt-3.5 text-base leading-7 sm:mt-5"
            : "mt-6 text-lg leading-8"
        }`}
      >
        La plataforma combina una base de conocimiento médico estructurada con
        guías clínicas y protocolos propios de cada organización. Los contenidos
        pasan por procesos automatizados de ingesta, evaluación mediante
        preguntas clave, validación clínica y publicación controlada antes de
        incorporarse a las respuestas del sistema.
      </p>
    </>
  );

  if (visible === undefined) {
    return <ViewportReveal>{content}</ViewportReveal>;
  }

  return (
    <div className="max-w-5xl">
      <Reveal visible={visible}>
        <Eyebrow>KPIs operativos</Eyebrow>
      </Reveal>
      <Reveal visible={visible} delay={0.1}>
        <h2
          className={`mt-4 max-w-4xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50 ${
            compact ? "text-3xl" : "text-5xl"
          }`}
        >
          Volumen y actualización continua.
        </h2>
      </Reveal>
      <Reveal visible={visible} delay={0.2}>
        <p
          className={`font-body max-w-5xl text-slate-600 dark:text-slate-400 ${
            compact
              ? "mt-3.5 text-base leading-7 sm:mt-5"
              : "mt-6 text-lg leading-8"
          }`}
        >
          La plataforma combina una base de conocimiento médico estructurada con
          guías clínicas y protocolos propios de cada organización. Los
          contenidos pasan por procesos automatizados de ingesta, evaluación
          mediante preguntas clave, validación clínica y publicación controlada
          antes de incorporarse a las respuestas del sistema.
        </p>
      </Reveal>
    </div>
  );
}

function ArchitecturePanel({
  visible,
  panelRef,
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <Panel className="" panelRef={panelRef} layout={layout}>
      <div className="max-w-6xl">
        <Reveal visible={visible}>
          <Eyebrow>Producto</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="mt-4 max-w-135 text-5xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
            De documentos dispersos a la decisión informada.
          </h2>
        </Reveal>
        <Reveal visible={visible} delay={0.2}>
          <p className="font-body mt-5 mb-10 max-w-5xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            La robustez de Consensus Salutis se construye sobre un sistema
            completo: contenidos médicos revisados, una infraestructura
            preparada para operar de forma continua y una capa de software que
            controla el ciclo de cada respuesta. Tres capacidades coordinadas
            para responder con confianza y operar con continuidad.
          </p>
        </Reveal>
      </div>
      <ProductPillars
        visible={visible}
        compact={layout === "horizontal"}
        className={layout === "horizontal" ? "mt-6" : "mt-9"}
      />
    </Panel>
  );
}

function PrimaryCarePanel({
  visible,
  panelRef,
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <Panel
      panelRef={panelRef}
      layout={layout}
      className="bg-linear-to-br from-[#deedf3]/80 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"
    >
      <div className="max-w-5xl">
        <Reveal visible={visible}>
          <Eyebrow>Proceso de consulta</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="mt-4 text-5xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
            De la pregunta a la evidencia.
          </h2>
        </Reveal>
        <Reveal visible={visible} delay={0.2}>
          <p className="font-body mt-5 max-w-4xl text-lg leading-8 text-slate-600 dark:text-slate-400">
            Consensus Salutis acompaña cada consulta desde la formulación de la
            duda clínica hasta una respuesta contrastada, referenciada y
            preparada para ser revisada.
          </p>
        </Reveal>
      </div>
      <ClinicalProcess
        visible={visible}
        compact={layout === "horizontal"}
        className={layout === "horizontal" ? "mt-6" : "mt-10"}
      />
    </Panel>
  );
}

function ContactPanel({
  visible,
  panelRef,
  layout = "horizontal",
}: {
  visible: boolean;
  panelRef: PanelRef;
  layout?: DesktopLayout;
}) {
  return (
    <Panel
      className="bg-[#deedf3]/82 dark:bg-[#030916]/82"
      panelRef={panelRef}
      layout={layout}
      height="viewport"
    >
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Reveal visible={visible}>
            <Eyebrow>Siguiente paso</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h2 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
              Una conversación seria sobre tu organización sanitaria.
            </h2>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="font-body mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Revisamos caso de uso, restricciones de seguridad, requisitos de
              integración y el nivel de evidencia necesario para un piloto
              institucional.
            </p>
          </Reveal>
        </div>
        <Reveal visible={visible} delay={0.3}>
          <ContactForm compact />
        </Reveal>
      </div>
    </Panel>
  );
}

function MobileHome() {
  return (
    <main className="relative z-10 bg-[#f4f9fc] lg:hidden dark:bg-[#06111f]">
      <section className="relative overflow-hidden border-b border-cyan-800/10 px-5 py-10 sm:py-16 dark:border-cyan-300/10">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_30%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.1)_72%,transparent)]" />
        <ViewportReveal className="relative">
          <Eyebrow>IA médica institucional</Eyebrow>
          <h1 className="mt-3.5 text-4xl font-semibold tracking-tight text-[#05215e] sm:mt-6 sm:text-5xl dark:text-slate-50">
            Conocimiento clínico gobernado por IA.
          </h1>
          <p className="font-body mt-3.5 text-base leading-7 text-slate-700 sm:mt-7 sm:text-lg sm:leading-8 dark:text-slate-300">
            Consensus Salutis convierte guías, protocolos y corpus médico en
            respuestas trazables para Atención Primaria.
          </p>
          <div className="mt-7">
            <ClinicalChatMock compact />
          </div>
          <div className="mt-9">
            <CTAGroup />
          </div>
        </ViewportReveal>
      </section>

      <ThemeSection>
        <div className="px-5">
          <ViewportReveal>
            <Eyebrow>Proceso de consulta</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
              De la pregunta a la evidencia.
            </h2>
            <p className="font-body mt-3.5 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
              Consensus Salutis acompaña cada consulta hasta una respuesta
              contrastada, referenciada y preparada para ser revisada.
            </p>
          </ViewportReveal>
          <ClinicalProcess className="mt-10" />
        </div>
      </ThemeSection>

      <ThemeSection variant="panel">
        <div className="px-5">
          <ViewportReveal>
            <Eyebrow>Producto</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
              De documentos dispersos a la decisión informada.
            </h2>
            <p className="font-body mt-3.5 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
              La robustez de Consensus Salutis se construye sobre contenidos
              médicos revisados, infraestructura preparada para operar de forma
              continua y software que controla el ciclo de cada respuesta. Tres
              capacidades coordinadas para responder con confianza y operar con
              continuidad.
            </p>
          </ViewportReveal>
          <ProductPillars className="mt-8 lg:mt-10" />
        </div>
      </ThemeSection>

      <ThemeSection variant="deep">
        <div className="px-5">
          <MetricsIntro compact />
          <StaggeredMetricGrid className="mt-8" />
        </div>
      </ThemeSection>

      <ThemeSection variant="deep">
        <div className="px-5">
          <ViewportReveal>
            <Eyebrow>Contacto</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#05215e] dark:text-slate-50">
              Hablemos de tu organización sanitaria.
            </h2>
            <p className="font-body mt-3.5 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
              Revisamos caso de uso, restricciones de seguridad, requisitos de
              integración y el nivel de evidencia necesario.
            </p>
          </ViewportReveal>
          <ContactForm className="mt-10" />
        </div>
      </ThemeSection>
    </main>
  );
}

function ClinicalProcess({
  visible,
  className = "",
  compact = false,
}: {
  visible?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const show = reducedMotion ? true : visible;
  const sharedAnimation = {
    initial: reducedMotion ? "visible" : "hidden",
    animate: visible === undefined ? undefined : show ? "visible" : "hidden",
    whileInView: visible === undefined ? "visible" : undefined,
    viewport: { amount: 0.25, once: true },
  } as const;
  return (
    <motion.div
      {...sharedAnimation}
      className={`relative ${className}`}
      variants={{
        hidden: {},
        visible: {},
      }}
    >
      <div
        className={`relative hidden grid-cols-3 lg:grid ${
          compact ? "gap-x-10 gap-y-10" : "gap-x-14 gap-y-16"
        }`}
      >
        {clinicalProcess.map((item, index) => (
          <ProcessMilestone
            key={item.step}
            item={item}
            index={index}
            compact={compact}
            desktop
            connector={index === 0 || index === 1 || index === 3}
            className={
              [
                "col-start-1 row-start-1",
                "col-start-2 row-start-1",
                "col-start-3 row-start-1",
                "col-start-1 row-start-2",
                "col-start-2 row-start-2",
              ][index]
            }
            reducedMotion={reducedMotion}
          />
        ))}
      </div>

      <div className="relative lg:hidden">
        {clinicalProcess.map((item, index) => (
          <MobileProcessMilestone
            key={item.step}
            item={item}
            index={index}
            last={index === clinicalProcess.length - 1}
            reducedMotion={reducedMotion}
          />
        ))}
      </div>
    </motion.div>
  );
}

function MobileProcessMilestone({
  item,
  index,
  last,
  reducedMotion,
}: {
  item: (typeof clinicalProcess)[number];
  index: number;
  last: boolean;
  reducedMotion: boolean | null;
}) {
  const nodeDelay = reducedMotion ? 0 : [0, 0.72, 1.44, 2.16, 2.88][index];
  const connectorDelay = reducedMotion ? 0 : [0.16, 0.88, 1.6, 2.32, 0][index];

  return (
    <motion.article
      className="grid grid-cols-[4.5rem_1fr]"
      variants={{
        hidden: { opacity: reducedMotion ? 1 : 0 },
        visible: {
          opacity: 1,
          transition: {
            delay: nodeDelay,
            duration: reducedMotion ? 0 : 0.32,
          },
        },
      }}
    >
      <div className="relative flex justify-center">
        <span className="border-primary-light relative z-10 grid size-10 place-items-center rounded-full border bg-white/50 text-xs font-semibold text-cyan-800 shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f] dark:text-cyan-100 dark:shadow-[0_0_18px_rgba(103,232,249,0.18)]">
          {item.step}
        </span>
        {!last ? (
          <>
            <span
              aria-hidden="true"
              className="absolute top-10 bottom-0 left-1/2 w-px -translate-x-1/2 bg-cyan-600/15 dark:bg-cyan-200/15"
            />
            <motion.span
              aria-hidden="true"
              className="bg-primary-light absolute top-10 bottom-0 left-1/2 w-px origin-top -translate-x-1/2 dark:bg-cyan-300"
              variants={{
                hidden: { scaleY: reducedMotion ? 1 : 0 },
                visible: {
                  scaleY: 1,
                  transition: {
                    delay: connectorDelay,
                    duration: reducedMotion ? 0 : 0.58,
                    ease: "easeInOut",
                  },
                },
              }}
            />
          </>
        ) : null}
      </div>
      <div className={last ? "pb-0" : "pb-6"}>
        <h3 className="mt-1 text-base font-semibold text-[#05215e] dark:text-slate-100">
          {item.title}
        </h3>
        <p className="font-body mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {item.body}
        </p>
        <p className="text-primary-light mt-2 text-[10px] font-semibold tracking-[0.12em] uppercase dark:text-cyan-300">
          {item.signal}
        </p>
      </div>
    </motion.article>
  );
}

function ProcessMilestone({
  item,
  index,
  compact = false,
  className = "",
  desktop = false,
  connector = false,
  reducedMotion,
}: {
  item: (typeof clinicalProcess)[number];
  index: number;
  compact?: boolean;
  className?: string;
  desktop?: boolean;
  connector?: boolean;
  reducedMotion: boolean | null;
}) {
  const nodeDelay = reducedMotion ? 0 : [0, 0.72, 1.44, 2.16, 2.88][index];
  const connectorDelay = reducedMotion ? 0 : [0.16, 0.88, 0, 2.32, 0][index];

  return (
    <motion.article
      className={`relative z-10 ${className}`}
      variants={{
        hidden: { opacity: reducedMotion ? 1 : 0 },
        visible: {
          opacity: 1,
          transition: {
            delay: nodeDelay,
            duration: reducedMotion ? 0 : 0.32,
          },
        },
      }}
    >
      {desktop && connector ? (
        <motion.span
          aria-hidden="true"
          className={`border-primary-light absolute z-0 origin-left border-t dark:border-cyan-300 ${
            compact
              ? "top-4 left-4 w-[calc(100%+2.5rem)]"
              : "top-5 left-5 w-[calc(100%+3.5rem)]"
          }`}
          variants={{
            hidden: { scaleX: reducedMotion ? 1 : 0 },
            visible: {
              scaleX: 1,
              transition: {
                delay: connectorDelay,
                duration: reducedMotion ? 0 : 0.58,
                ease: "easeInOut",
              },
            },
          }}
        />
      ) : null}
      <span
        className={`border-primary-light relative z-10 grid shrink-0 place-items-center rounded-full border bg-white/50 font-semibold text-cyan-800 shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f] dark:text-cyan-100 dark:shadow-[0_0_18px_rgba(103,232,249,0.18)] ${
          compact ? "size-8 text-[10px]" : "size-10 text-xs"
        } ${desktop ? "" : "absolute top-0 -left-12"}`}
      >
        {item.step}
      </span>
      <h3
        className={`${compact ? "mt-3 text-sm" : "mt-4 text-base"} font-semibold text-[#05215e] dark:text-slate-100`}
      >
        {item.title}
      </h3>
      <p
        className={`${compact ? "mt-1 min-h-10 text-[13px] leading-5" : "mt-2 min-h-12 text-sm leading-6"} font-body text-slate-600 dark:text-slate-400`}
      >
        {item.body}
      </p>
      <p className="text-primary-light mt-2 text-[10px] font-semibold tracking-[0.12em] uppercase dark:text-cyan-300">
        {item.signal}
      </p>
    </motion.article>
  );
}

function ProductPillars({
  visible,
  className = "",
  compact = false,
}: {
  visible?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const show = reducedMotion ? true : visible;
  const sharedAnimation = {
    initial: reducedMotion ? "visible" : "hidden",
    animate: visible === undefined ? undefined : show ? "visible" : "hidden",
    whileInView: visible === undefined ? "visible" : undefined,
    viewport: { amount: 0.35, once: true },
  } as const;

  return (
    <motion.div
      {...sharedAnimation}
      className={`relative ${className}`}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.24,
          },
        },
      }}
    >
      <div
        className={`grid ${compact ? "lg:gap-10" : "md:gap-4 lg:gap-10"} md:grid-cols-3`}
      >
        {productPillars.map((pillar) => (
          <motion.article
            key={pillar.name}
            className={`relative ${compact ? "py-4" : "py-4 sm:py-6"}`}
            variants={{
              hidden: { opacity: reducedMotion ? 1 : 0 },
              visible: {
                opacity: 1,
                transition: { duration: reducedMotion ? 0 : 0.42 },
              },
            }}
          >
            <div className="flex items-start justify-between gap-5">
              <div className={`flex items-center ${compact ? "h-10" : "h-12"}`}>
                <Image
                  src={pillar.logo}
                  alt={pillar.name}
                  width={pillar.logoWidth}
                  height={pillar.logoHeight}
                  className={`${pillar.logoClassName} dark:opacity-80 dark:brightness-0 dark:invert`}
                />
              </div>
            </div>
            <p
              className={`${compact ? "mt-3" : "mt-1 lg:mt-5"} border-primary-light text-primary-light shrink-0 border-b pt-4 pb-3 text-xs font-semibold tracking-[0.13em] uppercase lg:tracking-[0.18em] dark:border-cyan-300/20 dark:text-cyan-300`}
            >
              {pillar.role}
            </p>
            <p
              className={`${compact ? "mt-2 text-[13px] leading-5" : "mt-3 text-sm leading-6"} font-body text-slate-600 dark:text-slate-400`}
            >
              {pillar.body}
            </p>
          </motion.article>
        ))}
      </div>
    </motion.div>
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
  const [inViewport, setInViewport] = useState(false);
  const shown = reducedMotion ? true : (visible ?? inViewport);
  const countersActive = reducedMotion ? true : shown;

  return (
    <motion.div
      className={`grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 lg:gap-8 ${className}`}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={shown ? "visible" : "hidden"}
      onViewportEnter={() => setInViewport(true)}
      onViewportLeave={() => setInViewport(false)}
      viewport={{ amount: 0.3 }}
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
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          className="shadow-big-blocks flex flex-col items-center sm:block rounded-2xl border border-cyan-800/20 bg-white/30 p-3 sm:p-6 backdrop-blur-xs dark:border-cyan-300/20 dark:bg-white/3 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)] dark:backdrop-blur-sm"
          variants={{
            hidden: { opacity: reducedMotion ? 1 : 0 },
            visible: {
              opacity: 1,
              transition: { duration: reducedMotion ? 0 : 0.42 },
            },
          }}
        >
          <AnimatedMetricValue
            active={countersActive}
            delay={0.3 + index * 0.18}
            prefix={metric.prefix}
            suffix={metric.suffix}
            value={metric.value}
          />
          <p className="font-body mt-2 text-xs text-center sm:text-left sm:text-sm leading-5 sm:leading-6 text-slate-600 dark:text-slate-400">
            {metric.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}

function AnimatedMetricValue({
  active,
  delay,
  prefix = "",
  suffix = "",
  value,
}: {
  active: boolean;
  delay: number;
  prefix?: string;
  suffix?: string;
  value: number;
}) {
  const reducedMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(reducedMotion ? value : 0);
  // const formattedValue = `${prefix}${value.toLocaleString("es-ES")}${suffix}`;

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    setDisplayValue(0);

    if (!active) return;

    let frameId = 0;
    let startTime = 0;
    const duration = 1100;
    const timeoutId = window.setTimeout(() => {
      const update = (time: number) => {
        startTime ||= time;
        const progress = Math.min((time - startTime) / duration, 1);
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(Math.round(value * easedProgress));

        if (progress < 1) {
          frameId = window.requestAnimationFrame(update);
        }
      };

      frameId = window.requestAnimationFrame(update);
    }, delay * 1000);

    return () => {
      window.clearTimeout(timeoutId);
      window.cancelAnimationFrame(frameId);
    };
  }, [active, delay, reducedMotion, value]);

  return (
    <p
      // aria-label={formattedValue}
      className="text-xl sm:text-3xl font-semibold text-cyan-800 dark:text-cyan-100"
    >
      <span aria-hidden="true">
        {prefix}
        {displayValue.toLocaleString("es-ES")}
        {suffix}
      </span>
    </p>
  );
}

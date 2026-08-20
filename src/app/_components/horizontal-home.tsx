"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { BlogArticleCard } from "~/app/_components/blog-article-card";
import { latestBlogArticles } from "~/app/_components/blog-articles";
import { ProductSignalLeft } from "~/app/_components/product-signal-left";
import {
  CTAGroup,
  ThemeSection,
  Eyebrow,
  SignalPanel,
} from "~/app/_components/site";
import { ClinicalChatMock } from "~/app/_components/clinical-chat-mock";
import { ContactForm } from "~/app/_components/contact-form";
import {
  MorphPath,
  Reveal,
  SignalField,
  ViewportReveal,
} from "~/app/_components/motion-system";

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
    name: "BinPar",
    role: "Producto e ingeniería",
    logo: "/logos/BinparSquare.svg",
    logoWidth: 112,
    logoHeight: 54,
    logoClassName: "h-10 w-auto",
    body: "Más de 15 años desarrollando software sanitario convierten contenidos y protocolos en un sistema integrable, evaluable y trazable.",
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
    name: "Editorial Médica Panamericana",
    role: "Conocimiento clínico",
    logo: "/logos/emp.svg",
    logoWidth: 180,
    logoHeight: 45,
    logoClassName: "h-10 w-auto max-w-[150px] ",
    body: "Más de 70 años de experiencia editorial sostienen una base médica estructurada y actualizada de forma continua, con mas de 3TB de conocimiento médico.",
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

const successCases = [
  {
    name: "Axia",
    organization: "Generalitat de Catalunya",
    logo: "/logos/Axia.svg",
    darkLogo: "/logos/axia-white.svg",
    logoWidth: 158,
    logoHeight: 48,
  },
  {
    name: "SERMAS",
    organization: "Servicio Madrileño de Salud",
    logo: "/logos/sermas-lite.svg",
    darkLogo: null,
    logoWidth: 499,
    logoHeight: 116,
  },
];

const panels = [
  "Inicio",
  "Casos de éxito",
  "Atención Primaria",
  "Arquitectura",
  "Métricas",
  "Reunión",
];
const mobilePanelOrder = [0, 1, 2, 3, 4, 5, 6] as const;
const homeBlogArticles = latestBlogArticles.slice(0, 4);

type DesktopLayout = "horizontal" | "vertical";
type PanelHeight = "natural" | "viewport";
type PanelRef = (node: HTMLElement | null) => void;

function usePassedViewport(amount: number) {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const previousScrollY = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const updateVisibility = (mode: "initial" | "scroll" = "scroll") => {
      const element = elementRef.current;

      if (!element) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY.current;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const rect = element.getBoundingClientRect();
      if (rect.height === 0) return;

      const activationBottom = window.innerHeight * 1.12;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const visibility = visibleHeight / rect.height;
      const passedActivationPoint =
        rect.bottom <= 0 || rect.top <= activationBottom - rect.height * amount;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && (rect.bottom <= 0 || visibility >= amount))
      ) {
        setVisible(true);
      }

      if (scrollingUp && rect.top >= activationBottom) {
        setVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    const handleScroll = () => updateVisibility("scroll");
    const handleResize = () => updateVisibility("initial");

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    updateVisibility("initial");
    const frameId = window.requestAnimationFrame(() =>
      updateVisibility("initial"),
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [amount]);

  return [elementRef, visible] as const;
}

export function HorizontalHome() {
  const railRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const previousScrollLeft = useRef(0);
  const [progress, setProgress] = useState(0);
  const [revealedPanels, setRevealedPanels] = useState<Set<number>>(
    () => new Set([0]),
  );
  const reducedMotion = useReducedMotion();
  const revealPanelsThrough = useCallback((panelIndex: number) => {
    setRevealedPanels((current) => {
      const next = new Set(current);
      const orderIndex = mobilePanelOrder.indexOf(
        panelIndex as (typeof mobilePanelOrder)[number],
      );

      if (orderIndex === -1) return next;

      mobilePanelOrder.slice(0, orderIndex + 1).forEach((index) => {
        next.add(index);
      });

      return next;
    });
  }, []);

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
              <div className="relative flex h-full [clip-path:inset(0)]">
                <FixedSignalLayer />
                <HeroPanel
                  panelRef={(node) => {
                    panelRefs.current[0] = node;
                  }}
                  visible={revealedPanels.has(0)}
                />

                <SuccessCasesPanel
                  panelRef={(node) => {
                    panelRefs.current[1] = node;
                  }}
                  visible={revealedPanels.has(1)}
                />
                <PrimaryCarePanel
                  panelRef={(node) => {
                    panelRefs.current[2] = node;
                  }}
                  visible={revealedPanels.has(2)}
                />
              </div>
              <ArchitecturePanel
                panelRef={(node) => {
                  panelRefs.current[3] = node;
                }}
                visible={revealedPanels.has(3)}
              />
              <MetricsPanel
                panelRef={(node) => {
                  panelRefs.current[4] = node;
                }}
                visible={revealedPanels.has(4)}
              />

              <ContactPanel
                panelRef={(node) => {
                  panelRefs.current[5] = node;
                }}
                visible={revealedPanels.has(5)}
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
              <div className="bg-primary-light/10 dark:bg-primary-dark/10 h-px flex-1">
                <motion.div
                  className="bg-primary-light dark:bg-primary-dark h-px origin-left shadow-[0_0_18px_rgba(34,211,238,0.55)]"
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

      <MobileHome onPanelReveal={revealPanelsThrough} />
    </>
  );
}

export function VerticalHome() {
  const [revealedPanels, setRevealedPanels] = useState<Set<number>>(
    () => new Set([0]),
  );
  const revealPanelsThrough = useCallback((panelIndex: number) => {
    setRevealedPanels((current) => {
      const next = new Set(current);
      const orderIndex = mobilePanelOrder.indexOf(
        panelIndex as (typeof mobilePanelOrder)[number],
      );

      if (orderIndex === -1) return next;

      mobilePanelOrder.slice(0, orderIndex + 1).forEach((index) => {
        next.add(index);
      });

      return next;
    });
  }, []);

  return (
    <>
      <main className="relative z-10 hidden lg:block">
        <div className="relative [clip-path:inset(0)]">
          <FixedSignalLayer />
          <VerticalPanel initiallyVisible={revealedPanels.has(0)}>
            {(visible, panelRef) => (
              <HeroPanel
                layout="vertical"
                panelRef={panelRef}
                visible={visible}
              />
            )}
          </VerticalPanel>
          <VerticalPanel initiallyVisible={revealedPanels.has(1)}>
            {(visible, panelRef) => (
              <SuccessCasesPanel
                layout="vertical"
                panelRef={panelRef}
                visible={visible}
              />
            )}
          </VerticalPanel>
          <VerticalPanel initiallyVisible={revealedPanels.has(2)}>
            {(visible, panelRef) => (
              <PrimaryCarePanel
                layout="vertical"
                panelRef={panelRef}
                visible={visible}
              />
            )}
          </VerticalPanel>
        </div>
        <VerticalPanel initiallyVisible={revealedPanels.has(3)}>
          {(visible, panelRef) => (
            <ArchitecturePanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>

        <VerticalPanel initiallyVisible={revealedPanels.has(4)}>
          {(visible, panelRef) => (
            <MetricsPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
        <VerticalPanel initiallyVisible={revealedPanels.has(5)}>
          {(visible, panelRef) => (
            <BlogPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
        <VerticalPanel initiallyVisible={revealedPanels.has(6)}>
          {(visible, panelRef) => (
            <ContactPanel
              layout="vertical"
              panelRef={panelRef}
              visible={visible}
            />
          )}
        </VerticalPanel>
      </main>

      <MobileHome onPanelReveal={revealPanelsThrough} />
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
    if (initiallyVisible) {
      setVisible(true);
    }
  }, [initiallyVisible]);

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
        rect.bottom <= 0 || rect.top <= activationBottom;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && (passedActivationPoint || visibility >= 0.05))
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

function FixedSignalLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 -right-50 z-0">
      <SignalField
        className="-top-48 h-[calc(100%+12rem)]"
        intensity="hero"
        opacity={0.72}
      />
    </div>
  );
}

function ProductSignalAccent({ className = "" }: { className?: string }) {
  const gradientId = useId().replace(/:/g, "");
  const fillId = `product-signal-fill-${gradientId}`;
  const darkFillId = `product-signal-dark-fill-${gradientId}`;
  const innerFillId = `product-signal-inner-${gradientId}`;
  const shapePaths = [
    "M72 92C110 32 184 40 226 76C264 108 318 100 338 146C362 202 316 246 258 274C204 300 174 336 118 316C64 296 82 248 46 208C12 170 30 124 72 92Z",
    "M100 66C140 24 210 52 238 98C266 144 328 120 342 174C360 238 296 266 230 260C166 254 156 330 100 296C44 262 78 228 42 188C6 148 56 104 100 66Z",
    "M58 116C92 48 166 24 220 62C274 100 300 108 340 142C388 184 326 266 270 296C216 326 176 320 124 304C66 286 74 244 38 202C2 160 18 140 58 116Z",
    "M82 78C118 18 200 34 232 84C260 128 322 100 350 154C380 212 312 258 248 286C190 312 158 334 108 306C54 276 84 236 42 192C8 156 44 106 82 78Z",
    "M72 92C110 32 184 40 226 76C264 108 318 100 338 146C362 202 316 246 258 274C204 300 174 336 118 316C64 296 82 248 46 208C12 170 30 124 72 92Z",
  ];
  const offsetShapePaths = [
    ...shapePaths.slice(1, shapePaths.length - 1),
    shapePaths[0]!,
    shapePaths[1]!,
  ];
  const transition = {
    duration: 10,
    ease: "linear" as const,
    repeat: Infinity,
    times: [0, 0.24, 0.52, 0.78, 1],
  };
  const offsetTransition = {
    ...transition,
    duration: transition.duration * 1.09,
    times: [0, 0.22, 0.5, 0.76, 1],
  };

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-0 opacity-80 dark:opacity-45 ${className}`}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 384 384"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <defs>
          <linearGradient id={fillId} x1="52" y1="48" x2="330" y2="318">
            <stop stopColor="rgb(8 145 178)" stopOpacity="0.34" />
            <stop offset="0.56" stopColor="rgb(20 184 166)" stopOpacity="0.2" />
            <stop offset="1" stopColor="rgb(246 255 83)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id={darkFillId} x1="52" y1="48" x2="330" y2="318">
            <stop stopColor="rgb(0 188 187)" stopOpacity="0.34" />
            <stop
              offset="0.58"
              stopColor="rgb(20 184 166)"
              stopOpacity="0.24"
            />
            <stop offset="1" stopColor="rgb(125 211 252)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={innerFillId} x1="90" y1="72" x2="302" y2="280">
            <stop stopColor="rgb(125 211 252)" stopOpacity="0.32" />
            <stop offset="1" stopColor="rgb(20 184 166)" stopOpacity="0.18" />
          </linearGradient>
        </defs>
        <MorphPath
          className="dark:hidden"
          paths={shapePaths}
          transition={transition}
          fill={`url(#${fillId})`}
          opacity={"0.25"}
        />
        <MorphPath
          className="hidden dark:block"
          paths={shapePaths}
          transition={transition}
          fill={`url(#${darkFillId})`}
          opacity={"0.28"}
        />
        <g transform="translate(-14 8)">
          <MorphPath
            className="dark:hidden"
            paths={offsetShapePaths}
            transition={offsetTransition}
            fill={`url(#${fillId})`}
            opacity={"0.2"}
          />
          <MorphPath
            className="hidden dark:block"
            paths={offsetShapePaths}
            transition={offsetTransition}
            fill={`url(#${darkFillId})`}
            opacity={"0.24"}
          />
        </g>
      </svg>
    </div>
  );
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
        ? "flex min-h-[calc(100svh)] items-center px-10 py-20"
        : "px-10 py-20";

  return (
    <section
      ref={panelRef}
      className={`relative overflow-hidden ${layoutClassName} ${className}`}
    >
      <div className="relative z-10 mx-auto w-full max-w-7xl">{children}</div>
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
      <ProductSignalLeft className="fixed -bottom-80 -left-155 w-250 rotate-20" />
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative">
          <Reveal visible={visible}>
            <Eyebrow>IA médica institucional</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h1 className="font-display mt-6 max-w-4xl text-6xl font-extrabold tracking-tight text-[#05215e] xl:text-6xl dark:text-slate-50">
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

function SuccessCasesPanel({
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
      className="bg-white from-[#deedf3]/40 to-transparent dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"
      panelRef={panelRef}
      layout={layout}
    >
      <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-5xl">
          <Reveal visible={visible}>
            <Eyebrow>Casos de éxito</Eyebrow>
          </Reveal>
          <Reveal visible={visible} delay={0.1}>
            <h2 className="font-display mt-4 max-w-2xl text-5xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
              Nuestros casos en el sistema sanitario.
            </h2>
          </Reveal>
          <Reveal visible={visible} delay={0.2}>
            <p className="font-body mt-5 max-w-5xl text-lg leading-8 text-slate-600 dark:text-slate-400">
              Dos servicios sanitarios que ya incorporan inteligencia artificial
              para facilitar el acceso rápido al conocimiento clínico fiable,
              optimizar procesos de atención asistencial y reforzar la mejora
              continua.
            </p>
          </Reveal>
        </div>

        <SuccessCases
          visible={visible}
          compact={layout === "horizontal"}
          className={layout === "horizontal" ? "mt-6" : "mt-10"}
        />
      </div>
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
        className={`font-display mt-4 max-w-110 font-extrabold tracking-tight text-[#05215e] dark:text-slate-50 ${
          compact ? "text-3xl sm:text-4xl" : "text-5xl"
        }`}
      >
        Volumen datos y actualización continua.
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
          className={`font-display mt-4 max-w-xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50 ${
            compact ? "text-3xl" : "text-5xl"
          }`}
        >
          Volumen datos y actualización continua.
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
    <Panel
      className="bg-white dark:bg-transparent"
      panelRef={panelRef}
      layout={layout}
    >
      <div className="relative z-10 max-w-6xl">
        <Reveal visible={visible}>
          <Eyebrow>Producto</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="font-display mt-4 max-w-135 text-5xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
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
        className={layout === "horizontal" ? "z-10 mt-6" : "z-10 mt-9"}
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
      className="bg-linear-to-br from-[#deedf3]/90 to-[#edf6f9]/30 dark:from-[#030916]/70 dark:to-[#030916]/30"
    >
      <div className="max-w-5xl">
        <Reveal visible={visible}>
          <Eyebrow>Proceso de consulta</Eyebrow>
        </Reveal>
        <Reveal visible={visible} delay={0.1}>
          <h2 className="font-display mt-4 max-w-92.5 text-5xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
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

function BlogPanel({
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
      className="bg-white dark:bg-transparent"
    >
      <BlogContent visible={visible} />
    </Panel>
  );
}

function BlogContent({
  visible,
  compact = false,
}: {
  visible?: boolean;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [viewportRef, inViewport] = usePassedViewport(0.28);
  const show = reducedMotion ? true : (visible ?? inViewport);
  const heading = (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow>Lecturas clínicas</Eyebrow>
        <h2
          className={`font-display mt-4 max-w-4xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50 ${
            compact ? "text-3xl sm:text-4xl" : "text-5xl"
          }`}
        >
          Últimos artículos
        </h2>
        <p
          className={`font-body mt-5 max-w-3xl text-slate-600 dark:text-slate-400 ${
            compact ? "text-base leading-7" : "text-lg leading-8"
          }`}
        >
          Lecturas recientes sobre IA médica, tendencias sanitarias y nuevas
          formas de transformar la asistencia al paciente en el sistema de
          salud.
        </p>
      </div>
      <Link
        href="/blog"
        className="font-body bg-primary-light shadow-big-blocks dark:bg-primary-dark dark:hover:bg-primary-dark-lighter inline-flex h-10 shrink-0 items-center justify-center gap-2 self-start rounded-full px-6 text-sm font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:bg-[#087a85] sm:self-end dark:text-[#03111d] dark:shadow-[0_0_24px_rgba(0,188,187,0.18)]"
      >
        Ver todos
        <ArrowRight aria-hidden="true" className="size-4" strokeWidth={1.8} />
      </Link>
    </div>
  );

  return (
    <motion.section
      ref={viewportRef}
      className="relative z-10"
      initial={reducedMotion ? "visible" : "hidden"}
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.12,
          },
        },
      }}
    >
      {compact ? (
        <ViewportReveal>{heading}</ViewportReveal>
      ) : (
        <Reveal visible={show}>{heading}</Reveal>
      )}

      <div
        className={`mt-8 grid gap-4 ${
          compact ? "sm:grid-cols-2" : "lg:grid-cols-3 xl:grid-cols-4"
        }`}
      >
        {homeBlogArticles.map((article, index) => (
          <motion.div
            key={article.title}
            variants={{
              hidden: { opacity: reducedMotion ? 1 : 0 },
              visible: {
                opacity: 1,
                transition: { duration: reducedMotion ? 0 : 0.42 },
              },
            }}
            className={`h-full ${
              !compact && index === 3 ? "lg:max-xl:hidden" : ""
            }`}
          >
            <BlogArticleCard article={article} compact={compact} />
          </motion.div>
        ))}
      </div>
    </motion.section>
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
      className="min-h-fit bg-[#deedf3]/82 dark:bg-[#030916]/82"
      panelRef={panelRef}
      layout={layout}
      height="viewport"
    >
      <ProductSignalAccent className="-top-30 -left-35 w-170" />
      <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="relative">
          {/* <ContactSignalAccent /> */}
          <div className="relative z-10">
            <Reveal visible={visible}>
              <Eyebrow>Siguiente paso</Eyebrow>
            </Reveal>
            <Reveal visible={visible} delay={0.1}>
              <h2 className="font-display mt-4 max-w-3xl text-5xl font-extrabold tracking-tight text-[#05215e] dark:text-slate-50">
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
        </div>
        <Reveal visible={visible} delay={0.3}>
          <ContactForm compact />
        </Reveal>
      </div>
    </Panel>
  );
}

function MobileHome({
  onPanelReveal,
}: {
  onPanelReveal?: (panelIndex: number) => void;
}) {
  const sectionRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const updateRevealedPanels = () => {
      const mobileQuery = window.matchMedia("(max-width: 1023.98px)");

      if (!mobileQuery.matches) return;

      const activationBottom = window.innerHeight * 1.12;

      sectionRefs.current.forEach((section, sectionIndex) => {
        if (!section) return;

        const panelIndex = mobilePanelOrder[sectionIndex];
        if (panelIndex === undefined) return;

        const rect = section.getBoundingClientRect();
        if (rect.height === 0) return;

        const hasPassedActivationPoint =
          rect.bottom <= 0 || rect.top <= activationBottom;

        if (hasPassedActivationPoint) {
          onPanelReveal?.(panelIndex);
        }
      });
    };

    window.addEventListener("scroll", updateRevealedPanels, { passive: true });
    window.addEventListener("resize", updateRevealedPanels);

    updateRevealedPanels();
    const frameId = window.requestAnimationFrame(updateRevealedPanels);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateRevealedPanels);
      window.removeEventListener("resize", updateRevealedPanels);
    };
  }, [onPanelReveal]);

  return (
    <main className="relative z-10 bg-transparent lg:hidden">
      <div className="relative [clip-path:inset(0)]">
        <SignalField intensity="hero" opacity={0.72} className="fixed" />
        <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
        <section
          ref={(node) => {
            sectionRefs.current[0] = node;
          }}
          className="relative overflow-hidden border-b border-cyan-800/10 px-5 py-10 sm:px-10 sm:py-16 dark:border-cyan-300/10"
        >
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.03),rgba(244,249,252,0.38)_10%,rgba(13,148,136,0.02)_60%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.01),rgba(6,17,31,0.42)_20%,rgba(20,184,166,0.01)_80%,transparent)]" />
          <ViewportReveal className="relative z-10 mt-10">
            <Eyebrow>IA médica institucional</Eyebrow>
            <h1 className="font-display mt-3.5 max-w-xl text-4xl font-extrabold tracking-tight text-[#05215e] sm:mt-6 sm:text-5xl dark:text-slate-50">
              Conocimiento clínico gobernado por IA.
            </h1>
            <p className="font-body mt-3.5 max-w-xl text-base leading-7 text-slate-700 sm:mt-7 sm:text-lg sm:leading-8 dark:text-slate-300">
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

        <ThemeSection
          ref={(node) => {
            sectionRefs.current[1] = node;
          }}
          variant="transparent"
          className="bg-white dark:bg-transparent dark:bg-linear-to-br dark:from-[#030916]/80 dark:to-[#030916]/40"
        >
          <div className="px-5 sm:px-10">
            <ViewportReveal>
              <Eyebrow>Casos de éxito</Eyebrow>
              <h2 className="font-display mt-4 max-w-sm text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
                Nuestros casos en el sistema sanitario.
              </h2>
              <p className="font-body mt-3.5 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
                Dos servicios sanitarios que ya incorporan inteligencia
                artificial para facilitar el acceso rápido al conocimiento
                clínico fiable, optimizar procesos de atención asistencial y
                reforzar la mejora continua.
              </p>
            </ViewportReveal>
            <SuccessCases className="mt-8" />
          </div>
        </ThemeSection>

        <ThemeSection
          ref={(node) => {
            sectionRefs.current[2] = node;
          }}
        >
          <div className="px-5 sm:px-10">
            <ViewportReveal>
              <Eyebrow>Proceso de consulta</Eyebrow>
              <h2 className="font-display mt-4 max-w-70 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
                De la pregunta a la evidencia.
              </h2>
              <p className="font-body mt-3.5 max-w-xl text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
                Consensus Salutis acompaña cada consulta hasta una respuesta
                contrastada, referenciada y preparada para ser revisada.
              </p>
            </ViewportReveal>
            <ClinicalProcess className="mt-10" />
          </div>
        </ThemeSection>
      </div>

      <ThemeSection
        ref={(node) => {
          sectionRefs.current[3] = node;
        }}
        variant="transparent"
        className="bg-white dark:bg-transparent"
      >
        <div className="relative z-10 px-5 sm:px-10">
          <ViewportReveal className="relative z-10">
            <Eyebrow>Producto</Eyebrow>
            <h2 className="font-display mt-4 max-w-120 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
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

      <ThemeSection
        ref={(node) => {
          sectionRefs.current[4] = node;
        }}
        variant="deep"
      >
        <div className="px-5 sm:px-10">
          <MetricsIntro compact />
          <StaggeredMetricGrid className="mt-8" />
        </div>
      </ThemeSection>

      <ThemeSection
        ref={(node) => {
          sectionRefs.current[5] = node;
        }}
        variant="transparent"
        className="bg-white dark:bg-transparent"
      >
        <div className="px-5 sm:px-10">
          <BlogContent compact />
        </div>
      </ThemeSection>

      <ThemeSection
        ref={(node) => {
          sectionRefs.current[6] = node;
        }}
        variant="deep"
      >
        <div className="relative px-5 sm:px-10">
          <ProductSignalAccent className="-top-24 -left-18 w-120" />
          {/* <ContactSignalAccent compact /> */}
          <ViewportReveal className="relative z-10">
            <Eyebrow>Contacto</Eyebrow>
            <h2 className="font-display mt-4 max-w-110 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
              Hablemos de tu organización sanitaria.
            </h2>
            <p className="font-body mt-3.5 max-w-120 text-base leading-7 text-slate-600 sm:mt-5 dark:text-slate-400">
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

function SuccessCases({
  visible,
  className = "",
}: {
  visible?: boolean;
  className?: string;
  compact?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [viewportRef, inViewport] = usePassedViewport(0.3);
  const show = reducedMotion ? true : (visible ?? inViewport);

  return (
    <motion.div
      ref={viewportRef}
      className={className}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={show ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reducedMotion ? 0 : 0.18,
          },
        },
      }}
    >
      <div className="grid grid-cols-1 gap-x-6">
        <motion.div className="grid w-full gap-3 sm:grid-cols-1 md:gap-6 lg:flex-1 dark:border-cyan-300/15">
          {successCases.map((item, index) => (
            <motion.div
              key={item.name}
              className="shadow-big-blocks flex min-w-0 flex-col items-center justify-center rounded-2xl border border-cyan-800/15 bg-white/70 px-5 py-3 backdrop-blur-xs dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)]"
              initial={{ opacity: reducedMotion ? 1 : 0 }}
              animate={{ opacity: show ? 1 : 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.4,
                delay: show && !reducedMotion ? index * 0.18 : 0,
              }}
            >
              <div className="flex h-14 items-center justify-center">
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={item.logoWidth}
                  height={item.logoHeight}
                  className={`max-h-11 w-full object-contain object-left ${
                    item.darkLogo
                      ? "dark:hidden"
                      : "dark:brightness-0 dark:invert"
                  }`}
                />
                {item.darkLogo ? (
                  <Image
                    src={item.darkLogo}
                    alt={item.name}
                    width={item.logoWidth}
                    height={item.logoHeight}
                    className="hidden max-h-11 w-full object-contain object-left dark:block"
                  />
                ) : null}
              </div>
              <p className="text-primary-light font-display dark:text-primary-dark mt-2 text-xs font-semibold tracking-[0.13em] uppercase">
                {item.organization}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
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
  const [viewportRef, inViewport] = usePassedViewport(0.25);
  const show = reducedMotion ? true : (visible ?? inViewport);
  const sharedAnimation = {
    initial: reducedMotion ? "visible" : "hidden",
    animate: show ? "visible" : "hidden",
  } as const;
  return (
    <motion.div
      ref={viewportRef}
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
        <span className="border-primary-light dark:text-primary-dark-lighter relative z-10 grid size-10 place-items-center rounded-full border bg-white/50 text-xs font-semibold text-cyan-800 shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f] dark:shadow-[0_0_18px_rgba(103,232,249,0.18)]">
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
              className="bg-primary-light dark:bg-primary-dark absolute top-10 bottom-0 left-1/2 w-px origin-top -translate-x-1/2"
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
        <h3 className="font-display mt-1 text-base font-semibold text-[#05215e] dark:text-slate-100">
          {item.title}
        </h3>
        <p className="font-body mt-2 min-h-12 text-sm leading-6 text-slate-600 dark:text-slate-400">
          {item.body}
        </p>
        <p className="font-body text-primary-light dark:text-primary-dark mt-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
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
        className={`border-primary-light font-display dark:text-primary-dark-lighter relative z-10 grid shrink-0 place-items-center rounded-full border bg-white/80 font-semibold text-cyan-800 shadow-sm backdrop-blur-sm dark:border-cyan-300 dark:bg-[#06111f] dark:shadow-[0_0_18px_rgba(103,232,249,0.18)] ${
          compact ? "size-8 text-[10px]" : "size-10 text-xs"
        } ${desktop ? "" : "absolute top-0 -left-12"}`}
      >
        {item.step}
      </span>
      <h3
        className={`${compact ? "mt-3 text-sm" : "mt-4 text-base"} font-display font-body text-[#05215e] dark:text-slate-100`}
      >
        {item.title}
      </h3>
      <p
        className={`${compact ? "mt-1 min-h-10 text-[13px] leading-5" : "mt-2 min-h-12 text-sm leading-6"} font-body text-slate-600 dark:text-slate-400`}
      >
        {item.body}
      </p>
      <p className="font-body text-primary-light dark:text-primary-dark mt-2 text-[10px] font-semibold tracking-[0.12em] uppercase">
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
  const [viewportRef, inViewport] = usePassedViewport(0.35);
  const show = reducedMotion ? true : (visible ?? inViewport);
  const sharedAnimation = {
    initial: reducedMotion ? "visible" : "hidden",
    animate: show ? "visible" : "hidden",
  } as const;

  return (
    <motion.div
      ref={viewportRef}
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
              className={`${compact ? "mt-3" : "mt-1 lg:mt-5"} border-primary-light font-display text-primary-light dark:text-primary-dark shrink-0 border-b pt-4 pb-3 text-xs font-semibold tracking-[0.13em] uppercase lg:tracking-[0.18em] dark:border-cyan-300/20`}
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
  const [viewportRef, inViewport] = usePassedViewport(0.3);
  const shown = reducedMotion ? true : (visible ?? inViewport);
  const countersActive = reducedMotion ? true : shown;

  return (
    <motion.div
      ref={viewportRef}
      className={`grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4 lg:gap-8 ${className}`}
      initial={reducedMotion ? "visible" : "hidden"}
      animate={shown ? "visible" : "hidden"}
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
          className="shadow-big-blocks flex flex-col items-center rounded-2xl border border-cyan-800/20 bg-white/80 p-3 backdrop-blur-xs sm:block sm:p-6 dark:border-cyan-300/20 dark:bg-[#152230e6]/90 dark:shadow-[0_0_18px_rgba(103,232,249,0.08)] dark:backdrop-blur-sm"
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
          <p className="font-body mt-2 text-center text-xs leading-5 text-slate-600 sm:text-left sm:text-sm sm:leading-6 dark:text-slate-400">
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
      className="font-display dark:text-primary-dark-lighter text-xl font-semibold text-cyan-800 sm:text-3xl"
    >
      <span aria-hidden="true">
        {prefix}
        {displayValue.toLocaleString("es-ES")}
        {suffix}
      </span>
    </p>
  );
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Pause, Play, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { clinicalProcessStages } from "./clinical-process-showcase";
import type { ProcessStage } from "./clinical-process-player";
import { Eyebrow } from "./eyebrow";
import { SectionNavigation } from "./section-navigation";
import { PlatformPreview } from "./platform-preview/platform-preview";
import { ProductSignalLeft } from "./product-signal-left";
import { HomePaintPanel } from "./home-paint-panel";
import { HomeMotionBackground, SignalField, Reveal } from "./motion-system";
import {
  ProcessBackground,
  surfaceMask,
} from "./success-cases/success-cases-surfaces";

const sectionBlendDepth = "clamp(160px, 22vw, 360px)";
const sectionFadeIn = surfaceMask(sectionBlendDepth);
const sectionFadeOut = sectionFadeIn.replace("to bottom", "to top");

const stageIds = [
  "consulta",
  "conocimiento",
  "contraste",
  "fuentes",
  "seguimiento",
];
const platformSections = [
  { id: "plataforma", label: "La plataforma" },
  { id: "consulta", label: "Consulta" },
  { id: "contraste", label: "Contraste" },
  { id: "fuentes", label: "Fuentes" },
  { id: "seguimiento", label: "Seguimiento" },
];
const buttonClass =
  "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700";

export function PlatformWalkthrough() {
  return (
    <div className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
      <HomeMotionBackground />
      <SectionNavigation sections={platformSections} />
      <main className="section-navigation-layout relative z-10">
        <HomePaintPanel>
          {(painted, panelRef) => (
            <section
              id="plataforma"
              tabIndex={-1}
              data-section-anchor
              ref={panelRef}
              data-platform-painted={painted}
              className="section-navigation-inset relative z-10 overflow-hidden px-5 pt-36 pb-16 [clip-path:inset(0)] sm:px-8 sm:pt-44 sm:pb-20 lg:px-10"
            >
              <div
                aria-hidden="true"
                data-platform-intro-background=""
                className="pointer-events-none absolute inset-0 z-0"
                style={{
                  maskImage: sectionFadeOut,
                }}
              >
                <div
                  className="fixed inset-0 -right-50 z-0"
                  data-platform-wave="right"
                >
                  <SignalField
                    className="-top-48 h-[calc(100%+12rem)]"
                    intensity="hero"
                    opacity={0.72}
                  />
                </div>
                <div data-platform-wave="left">
                  <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
                </div>
              </div>
              <div className="relative z-10 mx-auto w-full max-w-7xl">
                <div className="relative mx-auto mb-16 max-w-3xl text-center lg:mb-24">
                  <Reveal visible={painted}>
                    <p className="font-display mb-6 text-xs leading-4 font-bold tracking-[0.22em] text-balance text-primary-light uppercase dark:text-primary-dark">
                      Nuestra plataforma
                    </p>
                    <h1 className="font-display text-[32px] leading-[1.08] font-extrabold tracking-tight text-[#05215e] sm:text-[40px] lg:text-[54px] dark:text-slate-50">
                      De la consulta clínica
                      <br />
                      <span className="text-primary-light dark:text-primary-dark">
                        a la evidencia.
                      </span>
                    </h1>
                  </Reveal>
                  <Reveal visible={painted} delay={0.1}>
                    <p className="font-body mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600 lg:mt-6 dark:text-slate-400">
                      Explora la interfaz, los paneles y tu área de usuario con
                      una consulta de ejemplo. Descubre cómo se presenta la
                      respuesta y revisa las fuentes que la respaldan para
                      profundizar en el contexto clínico.
                    </p>
                  </Reveal>
                </div>
                <Reveal
                  visible={painted}
                  delay={0.2}
                  className="mx-auto w-full lg:w-[90%]"
                >
                  <PlatformPreview />
                </Reveal>
              </div>
            </section>
          )}
        </HomePaintPanel>

        {clinicalProcessStages.map((stage, index) => {
          const reverse = index % 2 === 1;
          return (
            <HomePaintPanel key={stage.number}>
              {(painted, panelRef) => (
                <section
                  ref={panelRef}
                  data-platform-painted={painted}
                  id={stageIds[index]}
                  tabIndex={-1}
                  data-section-anchor
                  aria-labelledby={`platform-stage-${stage.number}`}
                  data-platform-stage={stage.number}
                  className="section-navigation-inset relative px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
                >
                  {reverse ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 bg-white dark:bg-[#06111f]"
                      style={{
                        top: `calc(${sectionBlendDepth} / -2)`,
                        bottom: `calc(${sectionBlendDepth} / -2)`,
                        maskImage: `${sectionFadeIn}, ${sectionFadeOut}`,
                        maskComposite: "intersect",
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-1"
                      style={{
                        top: `calc(${sectionBlendDepth} / -2)`,
                        bottom: `calc(${sectionBlendDepth} / -2)`,
                      }}
                    >
                      <ProcessBackground
                        fadeToProduct
                        continuationSurface={
                          index === 0 ? "transparent" : "base"
                        }
                        blendDepth={sectionBlendDepth}
                        softFadeOut
                      />
                    </div>
                  )}
                  <div
                    className={`relative z-30 mx-auto grid w-full max-w-7xl items-center gap-10 lg:gap-12 ${reverse ? "lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]"}`}
                  >
                    <div
                      className={`min-w-0 ${reverse ? "lg:col-start-2 lg:row-start-1" : ""}`}
                    >
                      <Reveal visible={painted}>
                        <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase sm:text-xs">
                          {stage.signal}
                        </p>
                      </Reveal>
                      <Reveal visible={painted} delay={0.1}>
                        <h2
                          id={`platform-stage-${stage.number}`}
                          className="font-display mt-5 max-w-xl text-3xl leading-[1.15] font-extrabold tracking-tight text-[#05215e] sm:text-4xl xl:text-5xl dark:text-slate-50"
                        >
                          {stage.title}
                        </h2>
                      </Reveal>
                      <Reveal visible={painted} delay={0.2}>
                        <p className="font-body mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg dark:text-slate-400">
                          {stage.body}
                        </p>
                      </Reveal>
                    </div>
                    <Reveal
                      visible={painted}
                      delay={0.3}
                      className={`min-w-0 ${reverse ? "lg:col-start-1 lg:row-start-1" : ""}`}
                    >
                      <PlatformScene stage={stage} active={painted} />
                    </Reveal>
                  </div>
                </section>
              )}
            </HomePaintPanel>
          );
        })}

        <HomePaintPanel>
          {(painted, panelRef) => (
            <section
              id="demostracion"
              tabIndex={-1}
              data-section-anchor
              ref={panelRef}
              data-platform-painted={painted}
              className="section-navigation-inset relative px-5 py-20 sm:px-8 lg:px-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-0 bg-white dark:bg-[#06111f]"
                style={{
                  top: `calc(${sectionBlendDepth} / -2)`,
                  maskImage: sectionFadeIn,
                }}
              />
              <div className="relative z-30 mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
                <div>
                  <Reveal visible={painted}>
                    <Eyebrow>Siguiente paso</Eyebrow>
                  </Reveal>
                  <Reveal visible={painted} delay={0.1}>
                    <h2 className="font-display mt-4 max-w-2xl text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
                      El conocimiento de tu organización, en cada consulta.
                    </h2>
                  </Reveal>
                  <Reveal visible={painted} delay={0.2}>
                    <p className="font-body mt-5 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400">
                      Exploremos cómo integrar tus guías, protocolos y corpus
                      médico en un entorno de consulta gobernado.
                    </p>
                  </Reveal>
                </div>
                <Reveal visible={painted} delay={0.3} className="shrink-0">
                  <Link
                    href="/contacto"
                    className="font-body bg-primary-light focus-visible:outline-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark/85 inline-flex shrink-0 items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#03111d]"
                  >
                    Solicitar una demostración{" "}
                    <ArrowRight
                      size={17}
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                  </Link>
                </Reveal>
              </div>
            </section>
          )}
        </HomePaintPanel>
      </main>
    </div>
  );
}

/** Each section plays its own scene and freezes while outside the viewport. */
function PlatformScene({
  stage,
  active,
}: {
  stage: ProcessStage;
  active: boolean;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  // Match the server's initial scene before applying the browser preference.
  const [reduced, setReduced] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [paused, setPaused] = useState(false);
  const duration = stage.end - stage.start;

  useEffect(() => {
    setReduced(Boolean(prefersReducedMotion));
  }, [prefersReducedMotion]);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(Boolean(entry && entry.intersectionRatio >= 0.25)),
      { threshold: [0, 0.25] },
    );
    observer.observe(element);
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    setElapsed(0);
    setPaused(false);
  }, [active]);

  useEffect(() => {
    if (!active || !visible || !tabVisible || paused || reduced) return;
    let previous = performance.now();
    let request = 0;
    const advance = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      setElapsed((current) => (current + delta) % (duration + 2.7));
      request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(request);
  }, [active, visible, tabVisible, paused, reduced, duration]);

  const opacity = reduced
    ? 1
    : Math.min(1, elapsed / 0.35, (duration + 2.7 - elapsed) / 0.35);
  return (
    <figure className="m-0 min-w-0">
      <div
        ref={frame}
        data-platform-scene={stage.number}
        data-playing={active && visible && tabVisible && !paused && !reduced}
        className="shadow-big-blocks @container relative isolate h-[482px] overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80 backdrop-blur-sm dark:border-primary-dark/15 dark:bg-[#06111f]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px)]"
        />
        <div
          role="img"
          aria-label={`${stage.title}. ${stage.body}`}
          className="relative h-full"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ opacity }}
          >
            {stage.render(stage.start + Math.min(elapsed, duration), reduced)}
          </div>
        </div>
      </div>
      <figcaption className="font-body mt-4 flex items-center gap-4 text-[10px] font-medium tracking-[0.12em] text-slate-500 uppercase dark:text-slate-400">
        <span className="shrink-0">{stage.signal}</span>
        <div
          aria-hidden="true"
          className="bg-primary-light/25 dark:bg-primary-dark/25 h-0.5 min-w-0 flex-1 overflow-hidden rounded-full"
        >
          <motion.div
            className="bg-primary-light dark:bg-primary-dark h-full origin-left rounded-full"
            style={{ scaleX: reduced ? 1 : Math.min(1, elapsed / duration) }}
          />
        </div>
        {!reduced && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={`${paused ? "Reproducir" : "Pausar"}: ${stage.title}`}
              aria-pressed={paused}
              title={paused ? "Reproducir" : "Pausar"}
              onClick={() => setPaused((value) => !value)}
              className={buttonClass}
            >
              {paused ? (
                <Play size={16} strokeWidth={1.1} aria-hidden="true" />
              ) : (
                <Pause size={16} strokeWidth={1.1} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              aria-label={`Reiniciar: ${stage.title}`}
              title="Reiniciar escena actual"
              onClick={() => {
                setElapsed(0.35);
                setPaused(false);
              }}
              className={buttonClass}
            >
              <RotateCcw size={16} strokeWidth={1.1} aria-hidden="true" />
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  );
}

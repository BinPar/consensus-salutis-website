"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Eyebrow } from "./eyebrow";
import { FeatureHighlights } from "./platform-features/feature-highlights";
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

/** The side index of the page. */
const platformSections = [
  { id: "plataforma", label: "Plataforma" },
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "contacto", label: "Contacto" },
];

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
                    <p className="font-display text-primary-light dark:text-primary-dark mb-6 text-xs leading-4 font-bold tracking-[0.22em] text-balance uppercase">
                      Nuestra plataforma
                    </p>
                    <h1 className="font-display text-navy text-[32px] leading-[1.08] font-extrabold tracking-tight sm:text-[40px] lg:text-[54px] dark:text-slate-50">
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

        <section
          id="funcionalidades"
          tabIndex={-1}
          data-section-anchor
          aria-labelledby="platform-highlights-title"
          className="section-navigation-inset relative px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
        >
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
              continuationSurface="transparent"
              blendDepth={sectionBlendDepth}
              softFadeOut
            />
          </div>
          <div className="relative z-30 mx-auto w-full max-w-7xl">
            <FeatureHighlights />
          </div>
        </section>

        <HomePaintPanel>
          {(painted, panelRef) => (
            <section
              id="contacto"
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
                    <h2 className="font-display text-navy mt-4 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl dark:text-slate-50">
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
                    Solicitar más información{" "}
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

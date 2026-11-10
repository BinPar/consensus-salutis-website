"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import { Eyebrow } from "./eyebrow";
import { normalizeSearch } from "./blog/normalize-search";
import { FeatureFilterBar } from "./platform-features/feature-filter-bar";
import { featureGroupSections } from "./platform-features/feature-groups";
import { FeatureGroup } from "./platform-features/feature-group";
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

/** The side index covers the page as a whole; the features bar covers the groups. */
const platformSections = [
  { id: "plataforma", label: "Plataforma" },
  { id: "funcionalidades", label: "Funcionalidades" },
  { id: "contacto", label: "Contacto" },
];

/** Text the features search looks into, per feature. */
const searchIndex = new Map(
  featureGroupSections.flatMap((section) =>
    section.features.map((feature) => [
      feature,
      normalizeSearch(
        [
          feature.title,
          feature.description,
          feature.detail ?? "",
          section.navLabel,
          ...section.heading,
        ].join(" "),
      ),
    ]),
  ),
);

export function PlatformWalkthrough() {
  const [query, setQuery] = useState("");
  const featuresRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const searchTerm = normalizeSearch(query);
  const groups = useMemo(
    () =>
      featureGroupSections
        .map((section) => ({
          ...section,
          features: section.features.filter(
            (feature) =>
              !searchTerm || searchIndex.get(feature)?.includes(searchTerm),
          ),
        }))
        .filter((section) => section.features.length > 0),
    [searchTerm],
  );
  const filterEntries = useMemo(
    () =>
      groups.map((section) => ({
        id: section.id,
        label: section.navLabel,
        count: section.features.length,
      })),
    [groups],
  );

  // While searching from inside the features, bring their start back under the
  // bar so the first results are in view, as the blog gallery does with pages.
  const searchedRef = useRef(false);
  useEffect(() => {
    const zone = featuresRef.current;
    // Not on mount: a deep link such as #contacto keeps its position.
    if (!searchedRef.current) {
      searchedRef.current = true;
      return;
    }
    if (!zone) return;
    const top = zone.getBoundingClientRect().top;
    if (top < 64) window.scrollTo({ top: window.scrollY + top - 64 });
  }, [searchTerm]);

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

        <div
          ref={featuresRef}
          id="funcionalidades"
          tabIndex={-1}
          data-section-anchor
          aria-label="Funcionalidades"
          className="relative"
        >
          <FeatureFilterBar
            entries={filterEntries}
            query={query}
            onQueryChange={setQuery}
            barRef={barRef}
          />
          {groups.length === 0 && (
            <div
              role="status"
              className="section-navigation-inset font-body relative z-30 px-5 py-16 text-center sm:px-8 lg:px-10"
            >
              <p className="text-navy text-base font-medium dark:text-slate-100">
                No se han encontrado funcionalidades.
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Prueba con otra búsqueda o{" "}
                <Link
                  href="/contacto"
                  className="text-primary-light dark:text-primary-dark font-semibold underline-offset-4 hover:underline"
                >
                  pregúntanos directamente
                </Link>
                .
              </p>
            </div>
          )}
          {groups.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              tabIndex={-1}
              data-section-anchor
              aria-labelledby={`platform-group-${section.id}`}
              className="section-navigation-inset relative px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24"
            >
              {index % 2 === 1 ? (
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
                    continuationSurface={index === 0 ? "transparent" : "base"}
                    blendDepth={sectionBlendDepth}
                    softFadeOut
                  />
                </div>
              )}
              <div className="relative z-30 mx-auto w-full max-w-7xl">
                <FeatureGroup section={section} />
              </div>
            </section>
          ))}
        </div>

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

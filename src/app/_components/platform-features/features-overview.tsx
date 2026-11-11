"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

import { HomeMotionBackground } from "../motion-system";
import { SectionNavigation } from "../section-navigation";
import { FeatureFilterBar } from "./feature-filter-bar";
import { FeatureGroupBand } from "./feature-group-band";
import { FeaturesIntro } from "./features-intro";
import { useFeatureSearch } from "./use-feature-search";

/** Height of the fixed site header, as the features bar assumes it. */
const headerHeight = 64;

/** The side index covers the page as a whole; the features bar covers the groups. */
const pageSections = [
  { id: "introduccion", label: "Introducción" },
  { id: "funcionalidades", label: "Funcionalidades" },
];

/**
 * /plataforma/funcionalidades: an entry section and, under it, every feature
 * group of the platform with the same sticky bar (group pills and search) as
 * the features zone of /plataforma.
 */
export function FeaturesOverview() {
  const { query, setQuery, searchTerm, groups, entries } = useFeatureSearch();
  const featuresRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // While searching from inside the features, bring their start back under the
  // bar so the first results are in view. Not on mount: a deep link keeps its
  // position.
  const searchedRef = useRef(false);
  useEffect(() => {
    if (!searchedRef.current) {
      searchedRef.current = true;
      return;
    }
    const top = featuresRef.current?.getBoundingClientRect().top;
    if (top !== undefined && top < headerHeight)
      window.scrollTo({ top: window.scrollY + top - headerHeight });
  }, [searchTerm]);

  return (
    <div className="relative isolate bg-[#fbfdff] dark:bg-[#06111f]">
      <HomeMotionBackground />
      <SectionNavigation sections={pageSections} />
      <main className="section-navigation-layout relative z-10">
        <FeaturesIntro targetId="funcionalidades" />
        <div
          ref={featuresRef}
          id="funcionalidades"
          tabIndex={-1}
          data-section-anchor
          aria-label="Funcionalidades"
          className="relative"
        >
          <FeatureFilterBar
            entries={entries}
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
          {/*
            The heading and the scenes paint as they are scrolled into view.
            A search moves groups into view without any scroll, so the key
            remounts them per search: each checks again whether it is on
            screen, as on load, instead of staying unpainted until a scroll.
          */}
          {groups.map((section, index) => (
            <FeatureGroupBand
              key={`${section.id}:${searchTerm}`}
              section={section}
              index={index}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

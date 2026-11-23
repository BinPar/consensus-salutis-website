"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Link } from "~/i18n/navigation";

import { Eyebrow } from "../eyebrow";
import { HomePaintPanel } from "../home-paint-panel";
import { Reveal } from "../motion-system";
import { FeatureCard } from "./feature-group";
import {
  usePlatformFeatureGroups,
  type FeatureMockId,
  type PlatformFeature,
} from "./features-data";

/**
 * The features /plataforma shows, two per row: the consultation, the evidence
 * behind each answer and how the organisation governs its corpus. The full
 * list lives on /plataforma/funcionalidades.
 */
const highlightIds: readonly FeatureMockId[] = [
  "committee",
  "citations",
  "clarify",
  "viewer",
  "updates",
  "corpus",
  "control",
  "review",
];

const titleId = "platform-highlights-title";

/**
 * The main features of /plataforma: a section heading with the link to
 * /plataforma/funcionalidades, and their scenes two per row.
 */
export function FeatureHighlights() {
  const t = useTranslations("features.highlights");
  const groups = usePlatformFeatureGroups();
  const allFeatures = useMemo(
    () => groups.flatMap((group) => group.features),
    [groups],
  );
  const features: PlatformFeature[] = useMemo(
    () =>
      highlightIds.map((mock) =>
        allFeatures.find((feature) => feature.mock === mock)!,
      ),
    [allFeatures],
  );
  return (
    <>
      <HomePaintPanel>
        {(painted, panelRef) => (
          <header
            ref={panelRef}
            className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end lg:gap-16"
          >
            <div>
              <Reveal visible={painted}>
                <Eyebrow>{t("eyebrow")}</Eyebrow>
              </Reveal>
              <Reveal visible={painted} delay={0.1}>
                <h2
                  id={titleId}
                  className="font-display text-navy mt-5 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl dark:text-slate-50"
                >
                  {t.rich("title", {
                    br: () => <br />,
                    accent: (chunks) => (
                      <span className="text-primary-light dark:text-primary-dark">
                        {chunks}
                      </span>
                    ),
                  })}
                </h2>
              </Reveal>
              <Reveal visible={painted} delay={0.2}>
                <p className="font-body mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  {t("lead", { count: allFeatures.length })}
                </p>
              </Reveal>
            </div>
            <Reveal visible={painted} delay={0.3} className="shrink-0">
              <Link
                href="/plataforma/funcionalidades"
                className="font-body bg-primary-light focus-visible:outline-primary-light dark:bg-primary-dark dark:hover:bg-primary-dark/85 inline-flex min-h-11 items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#03111d]"
              >
                {t("cta")}
                <ArrowRight size={17} strokeWidth={1.8} aria-hidden="true" />
              </Link>
            </Reveal>
          </header>
        )}
      </HomePaintPanel>
      <ul
        aria-labelledby={titleId}
        className="mt-12 grid list-none gap-x-10 gap-y-16 p-0 sm:grid-cols-2 lg:mt-16 xl:gap-x-16"
      >
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.number}
            feature={feature}
            index={index}
            layout="wide"
          />
        ))}
      </ul>
    </>
  );
}

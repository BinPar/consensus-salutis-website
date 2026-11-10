"use client";

import { motion } from "framer-motion";

import { Eyebrow } from "../eyebrow";
import { HomePaintPanel } from "../home-paint-panel";
import { Reveal } from "../motion-system";
import { useProductEntrance } from "../product-strata/product-strata-section";
import type { FeatureGroupSection } from "./feature-groups";
import type { PlatformFeature } from "./features-data";
import { FeatureScene } from "./scenes/feature-scene";

/** Title and explanation under each scene. */
function FeatureCaption({ feature }: { feature: PlatformFeature }) {
  return (
    <figcaption className="mt-3 px-1">
      <h3 className="font-display text-navy text-lg font-semibold tracking-tight dark:text-slate-50">
        {feature.title}
      </h3>
      <p className="font-body mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
        {feature.description}
        {feature.detail ? ` ${feature.detail}` : null}
      </p>
    </figcaption>
  );
}

/**
 * A scene card. It paints like the cards of the team grid (team-gallery):
 * on its own, once a fifth of it has reached the viewport, one after another
 * within its row; its scene starts playing when it is painted.
 */
function FeatureCard({
  feature,
  index,
}: {
  feature: PlatformFeature;
  index: number;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <li>
      <motion.div
        ref={(node) => {
          ref.current = node;
        }}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: painted ? 1 : 0 }}
        transition={{
          duration: reduced ? 0 : 0.42,
          delay: painted && !reduced ? (index % 3) * 0.08 : 0,
          ease: "easeOut",
        }}
      >
        <figure className="m-0 flex flex-col">
          <FeatureScene
            feature={feature.mock}
            label={`${feature.title}. ${feature.description}`}
            active={painted}
            alignGrid
          />
          <FeatureCaption feature={feature} />
        </figure>
      </motion.div>
    </li>
  );
}

/**
 * One group of features: its heading (eyebrow, two-tone title and lead) and
 * its scenes in a grid, three per row on desktop. Like every panel of the
 * site, the heading and each scene paint on their own as they reach the
 * viewport and fade out again when scrolled back above it.
 */
export function FeatureGroup({ section }: { section: FeatureGroupSection }) {
  const titleId = `platform-group-${section.id}`;
  return (
    <>
      <HomePaintPanel>
        {(painted, panelRef) => (
          // Section heading of the site: Eyebrow, display title and lead.
          <header ref={panelRef}>
            <Reveal visible={painted}>
              <Eyebrow>Funcionalidades</Eyebrow>
            </Reveal>
            <Reveal visible={painted} delay={0.1}>
              <h2
                id={titleId}
                className="font-display text-navy mt-5 max-w-4xl text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl dark:text-slate-50"
              >
                {section.heading[0]}{" "}
                <span className="text-primary-light dark:text-primary-dark">
                  {section.heading[1]}
                </span>
              </h2>
            </Reveal>
            <Reveal visible={painted} delay={0.2}>
              <p className="font-body mt-5 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                {section.lead}
              </p>
            </Reveal>
          </header>
        )}
      </HomePaintPanel>
      <ul
        aria-labelledby={titleId}
        className="mt-12 grid list-none gap-x-8 gap-y-14 p-0 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3"
      >
        {section.features.map((feature, index) => (
          <FeatureCard key={feature.number} feature={feature} index={index} />
        ))}
      </ul>
    </>
  );
}

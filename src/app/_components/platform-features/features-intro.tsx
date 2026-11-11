"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { blogContentWidth } from "../blog/blog-layout";
import { HomePaintPanel } from "../home-paint-panel";
import { FixedSignalLayer } from "../horizontal-home";
import { Reveal, SignalField } from "../motion-system";
import { ProductSignalLeft } from "../product-signal-left";
import { featureGroupSections } from "./feature-groups";
import { FeatureScene } from "./scenes/feature-scene";

/** One scene per group, the first one each group lists. */
const showcase = featureGroupSections.map((section) => ({
  group: section.navLabel,
  feature: section.features[0]!,
}));

/** How long the last frame of a scene stays before the next one starts. */
const holdMs = 1800;

/**
 * Scene player of the entry: one scene of each group in turn. Pause holds the
 * current scene; reduced motion keeps the first one on its final frame.
 */
function FeatureShowcase({ active }: { active: boolean }) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  const { group, feature } = showcase[index]!;
  const handleFinish = useCallback(() => setHolding(true), []);

  useEffect(() => {
    if (!holding) return;
    const timer = window.setTimeout(() => {
      setHolding(false);
      setIndex((current) => (current + 1) % showcase.length);
    }, holdMs);
    return () => window.clearTimeout(timer);
  }, [holding]);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.figure
        key={feature.mock}
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduced ? undefined : { opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="m-0"
      >
        <figcaption className="font-body mb-4 flex items-baseline justify-between gap-4 px-1">
          <span className="text-navy min-w-0 truncate text-base font-medium dark:text-slate-100">
            <span className="text-primary-light dark:text-primary-dark font-semibold">
              {group}
            </span>
            <span
              aria-hidden="true"
              className="text-slate-400 dark:text-slate-500"
            >
              {" · "}
            </span>
            {feature.title}
          </span>
          <span className="shrink-0 text-sm font-medium text-slate-400 tabular-nums dark:text-slate-500">
            <span className="text-navy dark:text-slate-100">
              {String(index + 1).padStart(2, "0")}
            </span>{" "}
            / {String(showcase.length).padStart(2, "0")}
          </span>
        </figcaption>
        <FeatureScene
          feature={feature.mock}
          label={`${feature.title}. ${feature.description}`}
          active={active}
          onFinish={handleFinish}
          alignGrid
        />
      </motion.figure>
    </AnimatePresence>
  );
}

/**
 * Entry of /plataforma/funcionalidades, composed as the blog entrance: a
 * full-viewport stage with the copy on the left and a scene player on the
 * right, so the features bar starts below the first screen.
 */
export function FeaturesIntro({ targetId }: { targetId: string }) {
  const reduced = useReducedMotion();
  return (
    <HomePaintPanel>
      {(painted, panelRef) => (
        <section
          id="introduccion"
          tabIndex={-1}
          data-section-anchor
          ref={panelRef}
          aria-labelledby="features-page-title"
          className="relative isolate flex min-h-[calc(100svh-var(--blog-header-height,64px)+64px)] items-center overflow-hidden pt-16 [clip-path:inset(0)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,#000_calc(100%_-_280px),#000c_calc(100%_-_180px),#0004_calc(100%_-_70px),transparent)]"
          >
            <div className="hidden lg:block">
              <FixedSignalLayer />
            </div>
            <div className="lg:hidden">
              <SignalField intensity="hero" opacity={0.72} className="fixed" />
            </div>
            <ProductSignalLeft className="fixed -bottom-80 -left-200 w-250 rotate-20 sm:-left-155" />
          </div>
          <div
            className={`${blogContentWidth} relative z-10 grid items-center gap-8 py-20 max-[900px]:py-16 min-[900px]:grid-cols-[1.15fr_0.85fr] min-[900px]:gap-12`}
          >
            <div className="min-w-0 max-[900px]:text-center">
              <Reveal visible={painted}>
                <p className="font-display text-primary-light dark:text-primary-dark text-xs font-bold tracking-[0.22em] uppercase">
                  Plataforma · Funcionalidades
                </p>
                <h1
                  id="features-page-title"
                  className="font-display text-navy mt-5 max-w-4xl text-[32px] leading-[1.08] font-extrabold tracking-tight sm:text-[40px] lg:text-[54px] dark:text-slate-50"
                >
                  Todo lo que ofrece
                  <br />
                  <span className="text-primary-light dark:text-primary-dark">
                    la plataforma.
                  </span>
                </h1>
              </Reveal>
              <Reveal visible={painted} delay={0.1}>
                <p className="font-body mt-5 max-w-2xl text-sm leading-6 text-slate-600 max-[900px]:mx-auto sm:text-lg sm:leading-8 dark:text-slate-400">
                  Lo que conviene comprobar antes de llevarla a tu organización:
                  de dónde sale cada respuesta, quién decide qué documentos
                  consulta y cómo se vigila su calidad con el tiempo.
                </p>
              </Reveal>
              <Reveal visible={painted} delay={0.2}>
                <a
                  href={`#${targetId}`}
                  onClick={(event) => {
                    const target = document.getElementById(targetId);
                    if (!target) return;
                    event.preventDefault();
                    target.scrollIntoView({
                      behavior: reduced ? "instant" : "smooth",
                      block: "start",
                    });
                    target.focus({ preventScroll: true });
                  }}
                  className="font-body bg-primary-light dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark dark:hover:bg-primary-dark/85 mt-7 inline-flex min-h-11 items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-4 dark:text-[#04111e]"
                >
                  Explorar funcionalidades{" "}
                  <ArrowDown size={17} strokeWidth={1.8} aria-hidden="true" />
                </a>
              </Reveal>
            </div>
            <Reveal
              visible={painted}
              delay={0.3}
              className="relative w-full min-w-0 max-[900px]:mx-auto max-[900px]:max-w-[420px]"
            >
              <FeatureShowcase active={painted} />
            </Reveal>
          </div>
        </section>
      )}
    </HomePaintPanel>
  );
}

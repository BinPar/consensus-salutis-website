"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { evidenceGroup } from "./features-data";
import type { PlatformClaudeDirection } from "../platform-claude-directions";
import {
  FeatureCopy,
  GroupLabel,
  SectionHeading,
  eyebrow,
  features,
} from "./feature-shared";
import { EvidenceScene } from "./scenes/feature-scene";
import {
  BellowsLayout,
  GuidedLayout,
  IndexLayout,
  JourneyLayout,
  journeyGroups,
} from "./feature-explorations";

export type FeatureLayout = Exclude<PlatformClaudeDirection, "reference">;

/* 01 · Retícula: uniform cards in three columns, the group opens the grid. */
function GridLayout() {
  return (
    <div className="mt-16 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:mt-20 lg:grid-cols-[repeat(2,480px)] lg:justify-between lg:gap-y-16">
      <div className="flex flex-col justify-center pb-2 lg:pr-12">
        <p className={eyebrow}>Grupo {evidenceGroup.number}</p>
        <h3 className="font-display text-navy mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl dark:text-slate-50">
          {evidenceGroup.title}
        </h3>
        <p className="font-body mt-4 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-400">
          Cada afirmación conserva el camino hasta el documento que la respalda:
          la cita, el pasaje, la página y su vigencia.
        </p>
      </div>
      {features.map((feature) => (
        <figure key={feature.number} className="m-0 flex flex-col">
          <EvidenceScene
            feature={feature.mock}
            label={`${feature.title}. ${feature.description}`}
          />
          <figcaption className="mt-3 px-1">
            <FeatureCopy feature={feature} />
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/* 02 · Carril: one row per group, large cards with scroll snap and controls. */
function RailLayout() {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    index: 0,
    start: true,
    end: false,
  });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      const cards = [...element.children] as HTMLElement[];
      const left = element.scrollLeft;
      const index = cards.reduce(
        (closest, card, current) =>
          Math.abs(card.offsetLeft - element.offsetLeft - left) <
          Math.abs(cards[closest]!.offsetLeft - element.offsetLeft - left)
            ? current
            : closest,
        0,
      );
      const end = left + element.clientWidth >= element.scrollWidth - 2;
      // The last cards cannot reach the leading edge; at the end of the
      // track the last one becomes the active scene.
      setPosition({
        index: end ? cards.length - 1 : index,
        start: left <= 2,
        end,
      });
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  const go = (direction: 1 | -1) => {
    const element = track.current;
    const card = element?.children[0] as HTMLElement | undefined;
    if (!element || !card) return;
    const gap = parseFloat(getComputedStyle(element).columnGap) || 0;
    element.scrollBy({
      left: direction * (card.offsetWidth + gap),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  const control =
    "grid size-11 place-items-center rounded-full border border-cyan-800/15 text-primary-light transition hover:border-primary-light/40 hover:bg-primary-light/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light disabled:cursor-default disabled:opacity-35 disabled:hover:bg-transparent dark:border-cyan-300/15 dark:text-primary-dark dark:hover:border-primary-dark/40 dark:hover:bg-primary-dark/5 dark:focus-visible:outline-primary-dark";

  return (
    <div className="mt-16 lg:mt-20">
      <div className="flex items-end justify-between gap-6 border-b border-cyan-800/10 pb-6 dark:border-cyan-300/10">
        <div>
          <p className={eyebrow}>Grupo {evidenceGroup.number}</p>
          <h3 className="font-display text-navy mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl dark:text-slate-50">
            {evidenceGroup.title}
          </h3>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className="font-display mr-2 text-sm font-semibold text-slate-500 tabular-nums dark:text-slate-400"
            aria-live="polite"
          >
            <span className="text-navy dark:text-slate-50">
              {String(position.index + 1).padStart(2, "0")}
            </span>{" "}
            / {String(features.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            className={control}
            onClick={() => go(-1)}
            disabled={position.start}
            aria-label="Funcionalidad anterior"
          >
            <ArrowLeft size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={control}
            onClick={() => go(1)}
            disabled={position.end}
            aria-label="Funcionalidad siguiente"
          >
            <ArrowRight size={18} strokeWidth={1.8} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={track}
        className="mt-8 -mr-5 flex snap-x snap-mandatory [scrollbar-width:none] gap-5 overflow-x-auto pr-5 pb-2 sm:-mr-8 sm:pr-8 lg:mr-[calc((100%-100vw)/2)] lg:gap-6 lg:pr-[calc((100vw-100%)/2)] [&::-webkit-scrollbar]:hidden"
        aria-label={`${evidenceGroup.title}: funcionalidades`}
      >
        {features.map((feature, index) => (
          <figure
            key={feature.number}
            className="m-0 flex w-[86%] shrink-0 snap-start flex-col sm:w-[420px] lg:w-[480px]"
          >
            <EvidenceScene
              feature={feature.mock}
              label={`${feature.title}. ${feature.description}`}
              active={index === position.index}
            />
            <figcaption className="mt-3 px-1">
              <FeatureCopy feature={feature} />
            </figcaption>
          </figure>
        ))}
      </div>
      <div
        className="mt-6 h-0.5 overflow-hidden rounded-full bg-cyan-800/10 dark:bg-cyan-300/10"
        aria-hidden="true"
      >
        <div
          className="bg-primary-light dark:bg-primary-dark h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
          style={{
            width: `${((position.index + 1) / features.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

/* 03 · Foco: the list sets the pace; one card stays fixed and follows the reading. */
function FocusLayout() {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    let observer: IntersectionObserver | undefined;
    const connect = () => {
      observer?.disconnect();
      if (!desktop.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            if (entry.isIntersecting)
              setActive(Number((entry.target as HTMLElement).dataset.index));
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
      for (const item of items.current) if (item) observer.observe(item);
    };
    connect();
    desktop.addEventListener("change", connect);
    return () => {
      observer?.disconnect();
      desktop.removeEventListener("change", connect);
    };
  }, []);

  const select = (index: number) => {
    setActive(index);
    items.current[index]?.scrollIntoView({
      block: "center",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  return (
    <div className="mt-16 lg:mt-20">
      <GroupLabel />
      <div className="mt-4 grid gap-10 lg:grid-cols-[minmax(0,1fr)_480px] lg:gap-16">
        <ol className="lg:py-[18vh]">
          {features.map((feature, index) => (
            <li
              key={feature.number}
              ref={(element) => {
                items.current[index] = element;
              }}
              data-index={index}
              className="border-b border-cyan-800/10 py-8 last:border-b-0 lg:border-b-0 lg:py-0"
            >
              <button
                type="button"
                onClick={() => select(index)}
                aria-current={active === index ? "true" : undefined}
                className={`group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark hidden w-full rounded-2xl py-7 pr-4 pl-5 text-left transition-[opacity,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 motion-reduce:transition-none lg:block ${active === index ? "bg-primary-light/[0.06] dark:bg-primary-dark/[0.07] opacity-100" : "opacity-45 hover:opacity-80"}`}
              >
                <FeatureCopy feature={feature} size="large" />
              </button>
              <div className="lg:hidden">
                <FeatureCopy feature={feature} />
                <EvidenceScene
                  feature={feature.mock}
                  label={`${feature.title}. ${feature.description}`}
                  className="mt-6"
                />
              </div>
            </li>
          ))}
        </ol>
        <div className="hidden lg:block">
          <div className="sticky top-[calc(var(--lab-toolbar-height,72px)+max(3rem,(100vh-var(--lab-toolbar-height,72px)-26rem)/2))]">
            {/* Scenes share one grid cell, so each keeps its own controls. */}
            <div className="grid">
              {features.map((feature, index) => (
                <div
                  key={feature.number}
                  aria-hidden={active !== index}
                  inert={active !== index}
                  className={`transition-opacity duration-300 [grid-area:1/1] motion-reduce:transition-none ${active === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <EvidenceScene
                    feature={feature.mock}
                    label={`${feature.title}. ${feature.description}`}
                    active={active === index}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlatformFeatures({ layout }: { layout: FeatureLayout }) {
  return (
    <section
      id="platform-claude-features"
      tabIndex={-1}
      aria-label="Funcionalidades de la plataforma"
      data-feature-layout={layout}
      className="section-navigation-inset relative z-10 px-5 py-24 sm:px-8 lg:px-10 lg:py-32"
    >
      <div className="mx-auto w-full max-w-7xl">
        {layout !== "journey" && layout !== "journey-4" && <SectionHeading />}
        {layout === "grid" ? (
          <GridLayout />
        ) : layout === "rail" ? (
          <RailLayout />
        ) : layout === "focus" ? (
          <FocusLayout />
        ) : layout === "guided" ? (
          <GuidedLayout />
        ) : layout === "bellows" ? (
          <BellowsLayout />
        ) : layout === "index" ? (
          <IndexLayout />
        ) : layout === "journey" ? (
          // 08 · Recorrido: each group repeats the composition, one after another.
          <>
            <JourneyLayout group={journeyGroups.evidence} />
            <JourneyLayout
              group={journeyGroups.consultation}
              className="mt-32 lg:mt-44"
            />
            <JourneyLayout
              group={journeyGroups.formats}
              className="mt-32 lg:mt-44"
            />
            <JourneyLayout
              group={journeyGroups.workspace}
              className="mt-32 lg:mt-44"
            />
            <JourneyLayout
              group={journeyGroups.governance}
              className="mt-32 lg:mt-44"
            />
          </>
        ) : (
          <JourneyLayout
            variant={
              layout === "journey-2"
                ? "index"
                : layout === "journey-3"
                  ? "bar"
                  : layout === "journey-4"
                    ? "rows"
                    : "sidebar"
            }
          />
        )}
      </div>
    </section>
  );
}

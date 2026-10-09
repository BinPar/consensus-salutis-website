"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { institutionalCases } from "./success-cases-data";
import { CasesBackground } from "./success-cases-surfaces";
import { DefinitiveTwoVariant } from "./territorial-case-definitive-two";

export function SuccessCasesSection({
  panelRef,
  visible = true,
  layout = "vertical",
}: {
  panelRef?: (node: HTMLElement | null) => void;
  visible?: boolean;
  layout?: "vertical" | "horizontal";
}) {
  const section = useRef<HTMLElement>(null);
  const inView = useInView(section, { amount: "some" });
  const reduced = !!useReducedMotion();
  const [mapPainted, setMapPainted] = useState(false);
  const [introPainted, setIntroPainted] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  useEffect(() => {
    let previousScrollY = window.scrollY;
    const update = (initial = false) => {
      const scrollY = window.scrollY;
      const activationBottom = window.innerHeight * 1.12;
      for (const [selector, setPainted] of [
        ["[data-case-stage]", setMapPainted],
        ["[data-case-intro]", setIntroPainted],
      ] as const) {
        const element = section.current?.querySelector(selector);
        if (!element) continue;
        const rect = element.getBoundingClientRect();
        if (!rect.height || !rect.width) continue;
        const visibleHeight = Math.max(
          0,
          Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
        );
        if (
          (initial && rect.top <= activationBottom - rect.height * 0.28) ||
          (scrollY > previousScrollY &&
            (rect.bottom <= 0 || visibleHeight / rect.height >= 0.28))
        ) {
          setPainted(true);
        }
        if (scrollY < previousScrollY && rect.top >= activationBottom) {
          setPainted(false);
        }
      }
      previousScrollY = scrollY;
    };
    const onScroll = () => update();
    const onResize = () => update(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    update(true);
    const frame = requestAnimationFrame(() => update(true));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);
  const painted = visible && mapPainted;
  const running = !reduced && painted && inView && tabVisible;
  return (
    <section
      ref={(node) => {
        section.current = node;
        panelRef?.(node);
      }}
      aria-label="Casos de éxito"
      data-home-success-cases="definitive-two"
      data-map-painted={painted || reduced}
      data-intro-painted={(visible && introPainted) || reduced}
      className={`relative overflow-hidden px-5 sm:px-10 ${layout === "horizontal" ? "flex h-full w-screen shrink-0 items-center py-12" : "pt-28 pb-12 sm:pt-32"}`}
    >
      <CasesBackground />
      <motion.div
        className="case-proposal relative isolate z-10 mx-auto w-full max-w-7xl"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: reduced || (visible && inView) ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.36 }}
        style={
          { "--case-motion": running ? "running" : "paused" } as CSSProperties
        }
      >
        <DefinitiveTwoVariant
          key={painted ? "painted" : "unpainted"}
          cases={institutionalCases}
          motionEnabled={running}
        />
      </motion.div>
      <style jsx global>{`
        [data-home-success-cases] [data-case-intro] > * {
          opacity: 0;
          transition: opacity 0.36s ease;
        }
        [data-home-success-cases][data-intro-painted="true"]
          [data-case-intro]
          > * {
          opacity: 1;
        }
        [data-home-success-cases][data-intro-painted="true"]
          [data-case-intro]
          > h2 {
          transition-delay: 0.1s;
        }
        [data-home-success-cases][data-intro-painted="true"]
          [data-case-intro]
          > p:nth-of-type(2) {
          transition-delay: 0.2s;
        }
        [data-home-success-cases][data-intro-painted="true"]
          [data-case-intro]
          > div {
          transition-delay: 0.3s;
        }
        @media (prefers-reduced-motion: reduce) {
          [data-home-success-cases] [data-case-intro] > * {
            transition: none;
          }
        }
        [data-home-success-cases][data-map-painted="false"] [data-case-stage] {
          opacity: 0;
        }
        [data-home-success-cases][data-map-painted="false"]
          [data-case-stage]
          * {
          animation: none !important;
        }
      `}</style>
    </section>
  );
}

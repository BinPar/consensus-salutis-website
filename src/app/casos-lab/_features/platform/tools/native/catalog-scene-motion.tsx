"use client";

import { useEffect, useState, type RefObject } from "react";
import { Mark } from "~/app/_components/clinical-process-visuals";
import { ArrowUp, Paperclip } from "lucide-react";

export const catalogSceneDuration = 4.8;

// Same visibility gates as PlatformScene. Each miniature plays once, then rests.
export function useCatalogSceneMotion(frame: RefObject<HTMLDivElement | null>) {
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduced(media.matches);
    const updateTab = () => setTabVisible(!document.hidden);
    updateMotion();
    updateTab();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateTab);
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(Boolean(entry && entry.intersectionRatio >= 0.25)),
      { threshold: [0, 0.25] },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateTab);
    };
  }, [frame]);
  const running =
    visible &&
    tabVisible &&
    !reduced &&
    !paused &&
    seconds < catalogSceneDuration;
  useEffect(() => {
    if (!running) return;
    let previous = performance.now();
    let request = 0;
    const advance = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      setSeconds((value) => Math.min(catalogSceneDuration, value + delta));
      request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(request);
  }, [running]);
  return {
    seconds: reduced ? catalogSceneDuration : seconds,
    reduced,
    running,
    paused,
    complete: reduced || seconds >= catalogSceneDuration,
    toggle: () => setPaused((value) => !value),
    replay: () => {
      setSeconds(0);
      setPaused(false);
    },
  };
}

export function CatalogSceneHeader() {
  return (
    <div className="vfp-scene-brand relative flex h-14 items-center gap-2.5 px-5">
      <Mark className="size-6" />
      <span className="font-display text-navy text-sm font-semibold dark:text-slate-100">
        BinPar
      </span>
    </div>
  );
}

// Composer markup from EvidenceScene, with the same dimensions and surfaces.
export function CatalogSceneComposer() {
  return (
    <div className="vfp-scene-composer absolute inset-x-4 bottom-4">
      <div className="shadow-big-blocks dark:border-primary-dark/15 relative grid h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] items-center overflow-hidden rounded-[28px] border border-cyan-800/15 bg-white/85 backdrop-blur-md dark:bg-[#152230e6]/90">
        <span className="dark:border-primary-dark/15 grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:text-slate-400">
          <Paperclip size={20} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 truncate text-sm leading-6 text-slate-500 dark:text-slate-400">
          Pregunta clínica al comité...
        </span>
        <span className="bg-primary-light dark:bg-primary-dark grid size-9 place-items-center place-self-center rounded-full text-white opacity-45 dark:text-[#04111e]">
          <ArrowUp size={20} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

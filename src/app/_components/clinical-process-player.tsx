"use client";

import { useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ProcessStage = {
  number: string;
  title: string;
  body: string;
  signal: string;
  start: number;
  end: number;
  render: (seconds: number, reduced: boolean) => ReactNode;
};

const transition = 0.35;
const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

const stageTitleClass =
  "font-display mt-3.5 max-w-xl text-4xl font-extrabold tracking-tight text-[#05215e] sm:mt-6 sm:text-5xl dark:text-slate-50";

/** The five consultation stages share one playback clock. */
export function ClinicalProcessPlayer({
  stages,
}: {
  stages: readonly ProcessStage[];
}) {
  const titleId = useId();
  const frame = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const reduced = Boolean(useReducedMotion());
  const [clock, setClock] = useState({ index: 0, time: 0 });
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [visible, setVisible] = useState(false);
  const [painted, setPainted] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useLayoutEffect(() => {
    const element = frame.current;
    const column = element?.parentElement;
    const homeGrid = document.querySelector<HTMLElement>("[data-home-grid]");
    if (!element || !column || !homeGrid) return;
    let request = 0;
    let offsetX = 0;
    let offsetY = 0;
    const align = () => {
      request = 0;
      const bounds = element.getBoundingClientRect();
      const available = column.getBoundingClientRect().width;
      if (!bounds.width || !available) return;
      // Follow the hero's origin; this section never moves the page texture.
      const position =
        homeGrid.style.getPropertyValue("--home-grid-position") || "0px 0px";
      const [originX = 0, originY = 0] = position
        .trim()
        .split(/\s+/)
        .map((value) => parseFloat(value));
      const left = bounds.left + window.scrollX - offsetX;
      const top = bounds.top + window.scrollY - offsetY;
      const compact = document.documentElement.clientWidth < 640;
      const compactWidth =
        Math.floor((document.documentElement.clientWidth - 8) / 44) * 44;
      offsetX = compact
        ? (available - compactWidth) / 2
        : originX + Math.round((left - originX) / 44) * 44 - left;
      offsetY = originY + Math.round((top - originY) / 44) * 44 - top;
      element.style.left = `${offsetX}px`;
      element.style.top = `${offsetY}px`;
      element
        .closest<HTMLElement>("[data-process-showcase]")
        ?.style.setProperty("--process-frame-offset-y", `${offsetY}px`);
      // Keep the left edge on-grid and use the remaining column exactly:
      // rounding the width to 44px left a visible gutter at the page's right edge.
      element.style.width = `${compact ? compactWidth : available - offsetX}px`;
      const grid = element.querySelector<HTMLElement>("[data-mock-grid]");
      if (grid) {
        grid.style.backgroundAttachment = "fixed";
        grid.style.backgroundPosition = position;
      }
    };
    const schedule = () => {
      if (!request) request = requestAnimationFrame(align);
    };
    align();
    const resize = new ResizeObserver(schedule);
    resize.observe(column);
    resize.observe(document.documentElement);
    const origin = new MutationObserver(schedule);
    origin.observe(homeGrid, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      cancelAnimationFrame(request);
      resize.disconnect();
      origin.disconnect();
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
      element.style.removeProperty("left");
      element.style.removeProperty("top");
      element.style.removeProperty("width");
      element
        .closest<HTMLElement>("[data-process-showcase]")
        ?.style.removeProperty("--process-frame-offset-y");
    };
  }, []);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let isPainted = false;
    const updatePaint = (initial = false) => {
      const element = section.current;
      if (!element) return;
      const rect = element.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const scrollY = window.scrollY;
      const activationBottom = window.innerHeight * 0.85;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const entering =
        (initial && rect.top <= activationBottom - rect.height * 0.28) ||
        (scrollY > previousScrollY &&
          (rect.bottom <= 0 || visibleHeight / rect.height >= 0.28));
      const leaving = scrollY < previousScrollY && rect.top >= activationBottom;
      if ((entering && !isPainted) || (leaving && isPainted)) {
        isPainted = entering && !leaving;
        setPainted(isPainted);
        setClock({ index: 0, time: 0 });
        setSelected(null);
        setPaused(false);
        setSpeed(1);
      }
      previousScrollY = scrollY;
    };
    const onScroll = () => updatePaint();
    const onResize = () => updatePaint(true);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    updatePaint(true);
    const request = requestAnimationFrame(() => updatePaint(true));
    return () => {
      cancelAnimationFrame(request);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
    if (!painted || !visible || !tabVisible || paused || reduced) return;
    let previous = performance.now();
    let request = 0;
    const advance = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      setClock((current) => {
        const stage = stages[current.index]!;
        const duration = stage.end - stage.start + transition;
        const time = current.time + delta * speed;
        return time < duration
          ? { ...current, time }
          : {
              index: (current.index + 1) % stages.length,
              // The incoming scene already played during the crossfade.
              time: time - duration + transition,
            };
      });
      request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(request);
  }, [painted, visible, tabVisible, paused, reduced, stages, speed]);

  const nextSpeed = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
  const index = reduced ? (selected ?? 3) : clock.index;
  const stage = stages[index]!;
  const duration = stage.end - stage.start;
  const elapsed = reduced ? duration : clock.time;
  const progress = Math.min(1, elapsed / duration);
  const blend = reduced ? 0 : ease((elapsed - duration) / transition);
  const nextIndex = (index + 1) % stages.length;
  const next = stages[nextIndex]!;
  const entrance = reduced ? 1 : ease(elapsed / transition);
  const layers = [
    {
      index,
      scene: stage,
      time: stage.start + Math.min(elapsed, duration),
      opacity: entrance * (1 - blend),
    },
    ...(elapsed > duration && !reduced
      ? [
          {
            index: nextIndex,
            scene: next,
            time: next.start + Math.min(elapsed - duration, transition),
            opacity: blend,
          },
        ]
      : []),
  ];

  const select = (target: number) => {
    setSelected(target);
    // A paused selection must remain visible rather than freeze at opacity 0.
    setClock({ index: target, time: paused ? transition : 0 });
  };

  return (
    <section
      ref={section}
      aria-labelledby={titleId}
      data-process-showcase=""
      data-process-painted={painted || reduced}
      className="relative transition-opacity duration-700 motion-reduce:transition-none"
      style={{ opacity: painted || reduced ? 1 : 0 }}
    >
      <h2 id={titleId} className="sr-only">
        De la pregunta a la evidencia.
      </h2>
      <div className="grid items-start gap-8 lg:grid-cols-3 lg:gap-12">
        <div className="min-w-0 lg:flex lg:h-[482px] lg:flex-col">
          {/* Overlapping copy reserves the tallest chapter at each breakpoint. */}
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] lg:min-h-0 lg:flex-1 lg:content-center">
            {stages.map((item, itemIndex) => (
              <div
                key={item.number}
                aria-hidden={itemIndex !== index}
                className={`col-start-1 row-start-1 min-w-0 transition-opacity duration-350 motion-reduce:transition-none ${itemIndex === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
              >
                <p className="text-primary-light font-display dark:text-primary-dark mb-3 text-xs font-bold tracking-[0.22em] uppercase">
                  {item.number} / 05
                </p>
                <h3 className={stageTitleClass}>{item.title}</h3>
                <p className="font-body mt-5 max-w-5xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                  {item.body}
                </p>
                <p className="text-primary-light font-display dark:text-primary-dark mt-4 text-xs font-bold tracking-[0.22em] uppercase">
                  {item.signal}
                </p>
              </div>
            ))}
          </div>
          <div className="font-body mt-6 shrink-0 text-xs text-slate-500 lg:relative lg:top-[var(--process-frame-offset-y,0px)] dark:text-slate-400">
            <div className="flex items-center justify-between gap-2 pb-1.5">
              <nav aria-label="Etapas de la consulta" className="shrink-0">
                <ol className="flex items-center gap-0.5 xl:gap-1">
                  {stages.map((item, itemIndex) => (
                    <li key={item.number}>
                      <button
                        type="button"
                        onClick={() => select(itemIndex)}
                        aria-current={itemIndex === index ? "step" : undefined}
                        aria-label={`${item.number}. ${item.title}`}
                        title={item.title}
                        className={`font-display relative grid size-8 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 ${itemIndex === index ? "bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark" : "text-slate-500 hover:bg-cyan-800/5 dark:text-slate-400 dark:hover:bg-white/5"}`}
                      >
                        {item.number}
                        {itemIndex === index && (
                          <span
                            aria-hidden="true"
                            className="bg-primary-light/25 dark:bg-primary-dark/25 absolute inset-x-1 -bottom-1.5 h-0.5 overflow-hidden rounded-full"
                          >
                            <span
                              className="bg-primary-light dark:bg-primary-dark block h-full origin-left rounded-full"
                              style={{ transform: `scaleX(${progress})` }}
                            />
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ol>
              </nav>
              <div className="flex shrink-0 items-center gap-1">
                {!reduced && (
                  <button
                    type="button"
                    onClick={() => setSpeed(nextSpeed)}
                    aria-label={`Velocidad ×${speed}. Cambiar a ×${nextSpeed}`}
                    title={`Velocidad ×${speed} · Cambiar a ×${nextSpeed}`}
                    className="font-display bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 place-items-center rounded-full text-[11px] font-semibold tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  >
                    ×{speed}
                  </button>
                )}
                {!reduced && (
                  <button
                    type="button"
                    onClick={() => setPaused((value) => !value)}
                    aria-pressed={paused}
                    aria-label={
                      paused ? "Reproducir recorrido" : "Pausar recorrido"
                    }
                    title={paused ? "Reproducir" : "Pausar"}
                    className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  >
                    {paused ? (
                      <Play size={16} strokeWidth={1.1} />
                    ) : (
                      <Pause size={16} strokeWidth={1.1} />
                    )}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => select(index)}
                  aria-label={`Reiniciar animación de la etapa ${stage.number}`}
                  title="Reiniciar escena actual"
                  className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                >
                  <RotateCcw size={16} strokeWidth={1.1} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <figure className="m-0 min-w-0 lg:col-span-2">
          <div
            ref={frame}
            data-process-showcase-frame=""
            data-playing={
              painted && visible && tabVisible && !paused && !reduced
            }
            className="shadow-big-blocks @container relative isolate h-[482px] overflow-hidden rounded-3xl border border-cyan-800/15 bg-white/80 backdrop-blur-sm dark:border-cyan-300/15 dark:bg-[#06111f]"
          >
            <div
              aria-hidden="true"
              data-mock-grid=""
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]"
            />
            <div
              role="img"
              aria-label={`${stage.title}. ${stage.body}`}
              className="relative h-full"
            >
              {layers.map((layer) => (
                <div
                  key={layer.index}
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ opacity: layer.opacity }}
                >
                  {layer.scene.render(layer.time, reduced)}
                </div>
              ))}
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}

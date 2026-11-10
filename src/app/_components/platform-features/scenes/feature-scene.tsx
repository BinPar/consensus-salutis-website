"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { FeatureMockId } from "../features-data";
import { consultationScenes } from "./consultation-scenes";
import { evidenceScenes, type SceneDefinition } from "./evidence-scenes";
import { formatScenes } from "./formats-scenes";
import { workspaceScenes } from "./workspace-scenes";
import { governanceScenes } from "./governance-scenes";

/*
 * Frame shared by every feature scene of /plataforma: the artboard, the scene
 * clock and the controls. Each group keeps its scenes in its own module.
 */

const ARTBOARD = { width: 420, height: 330 };
// Frames of up to 480px fill without enlarging the scene further.
const MAX_SCALE = 480 / ARTBOARD.width;

const scenes: Record<FeatureMockId, SceneDefinition> = {
  ...evidenceScenes,
  ...consultationScenes,
  ...formatScenes,
  ...workspaceScenes,
  ...governanceScenes,
};

/**
 * Scene clock: plays once while at least a quarter of the frame is visible and
 * the tab is shown, then rests on the final frame. The pause control holds it
 * on the current frame and resumes it; the replay control starts it again.
 * Inactive scenes and reduced motion show the final frame.
 */
function useSceneClock(
  frame: RefObject<HTMLDivElement | null>,
  duration: number,
  active: boolean,
  onFinish?: () => void,
) {
  const [time, setTime] = useState(0);
  const finishRef = useRef(onFinish);
  // True once the clock has advanced in the current run.
  const played = useRef(false);
  useEffect(() => {
    finishRef.current = onFinish;
  }, [onFinish]);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
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
  }, [frame]);

  // Becoming the active scene starts it from the beginning.
  useEffect(() => {
    played.current = false;
    setPaused(false);
    if (active) setTime(0);
  }, [active]);

  const finished = time >= duration;
  // Notifies a scene that played to its end (never on reduced motion).
  useEffect(() => {
    if (!finished || !active || reduced || !played.current) return;
    played.current = false;
    finishRef.current?.();
  }, [finished, active, reduced]);
  useEffect(() => {
    if (!active || !visible || !tabVisible || reduced || finished || paused)
      return;
    let previous = performance.now();
    let request = 0;
    const advance = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      played.current = true;
      setTime((current) => Math.min(duration, current + delta));
      request = requestAnimationFrame(advance);
    };
    request = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(request);
  }, [active, visible, tabVisible, reduced, finished, paused, duration]);

  return {
    time: reduced || !active ? duration : time,
    reduced: reduced || !active,
    progress: reduced || !active ? 1 : time / duration,
    showControls: !reduced,
    // A finished scene shows play, which starts it again.
    paused: paused || finished,
    togglePause: () => {
      if (finished) {
        played.current = false;
        setPaused(false);
        setTime(0);
        return;
      }
      setPaused((value) => !value);
    },
    replay: () => {
      played.current = false;
      setPaused(false);
      setTime(0);
    },
  };
}

/** Origin of the page grid ([data-home-grid]), kept in sync. */
export function usePageGridPosition(enabled = true) {
  const [position, setPosition] = useState("0px 0px");
  useEffect(() => {
    if (!enabled) return;
    const grid = document.querySelector<HTMLElement>("[data-home-grid]");
    if (!grid) return;
    const sync = () =>
      setPosition(
        grid.style.getPropertyValue("--home-grid-position").trim() || "0px 0px",
      );
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(grid, { attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [enabled]);
  return position;
}

/**
 * Scene frame of PlatformScene (platform-walkthrough.tsx): 44px grid, 24px
 * radius, cyan border. The 480×360 artboard scales down to fit.
 */
export function FeatureScene({
  feature,
  label,
  active = true,
  onFinish,
  alignGrid = false,
  className = "",
}: {
  feature: FeatureMockId;
  label: string;
  active?: boolean;
  /**
   * Anchors the frame grid to the page grid (fixed, same origin), as the
   * /plataforma scene player does, so its lines continue the page's.
   */
  alignGrid?: boolean;
  /** Called when the scene has played to its end. */
  onFinish?: () => void;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const scene = scenes[feature];
  const clock = useSceneClock(frame, scene.duration, active, onFinish);
  const gridPosition = usePageGridPosition(alignGrid);
  useLayoutEffect(() => {
    const element = frame.current;
    if (!element) return;
    const measure = () =>
      setScale(
        Math.min(
          MAX_SCALE,
          element.clientWidth / ARTBOARD.width,
          element.clientHeight / ARTBOARD.height,
        ),
      );
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={className}>
      <div
        ref={frame}
        data-evidence-scene={feature}
        data-scene-time={clock.time.toFixed(2)}
        role="img"
        aria-label={label}
        className="shadow-big-blocks dark:border-primary-dark/15 relative isolate aspect-[14/11] w-full overflow-hidden rounded-[20px] border border-cyan-800/15 bg-white/80 backdrop-blur-sm dark:bg-[#06111f]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_srgb,var(--color-primary-dark)_4.5%,transparent)_1px,transparent_1px)]"
          style={
            alignGrid
              ? {
                  backgroundAttachment: "fixed",
                  backgroundPosition: gridPosition,
                }
              : undefined
          }
        />
        {scene.surface === "panel" && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-white dark:bg-[#152230]"
          />
        )}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2"
          style={{
            width: ARTBOARD.width,
            height: ARTBOARD.height,
            transform: `translate(-50%, -50%) scale(${scale})`,
            visibility: scale ? "visible" : "hidden",
          }}
        >
          {scene.render({ time: clock.time, reduced: clock.reduced })}
        </div>
      </div>
      {/* Scene controls from PlatformScene: progress line, pause and replay. */}
      <div className="mt-4 flex h-8 items-center gap-4">
        <div
          aria-hidden="true"
          className="bg-primary-light/25 dark:bg-primary-dark/25 h-0.5 min-w-0 flex-1 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary-light dark:bg-primary-dark h-full origin-left rounded-full"
            style={{ transform: `scaleX(${clock.progress})` }}
          />
        </div>
        {clock.showControls && (
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={clock.togglePause}
              aria-pressed={clock.paused}
              aria-label={
                clock.paused ? `Reproducir: ${label}` : `Pausar: ${label}`
              }
              title={clock.paused ? "Reproducir" : "Pausar"}
              className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
            >
              {clock.paused ? (
                <Play size={16} strokeWidth={1.1} aria-hidden="true" />
              ) : (
                <Pause size={16} strokeWidth={1.1} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              onClick={clock.replay}
              aria-label={`Repetir: ${label}`}
              title="Repetir escena"
              className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark hover:bg-primary-light/15 dark:hover:bg-primary-dark/15 grid size-8 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
            >
              <RotateCcw size={16} strokeWidth={1.1} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

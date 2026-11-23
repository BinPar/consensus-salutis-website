import { useEffect, useState, type RefObject } from "react";

/**
 * Surface of the full-width sticky bands (blog gallery, /plataforma features):
 * transparent in place, the site header surface (white/80 or #06111f/70 with
 * backdrop-blur-md, as `.header-scroll-backdrop` fully painted) and a border on
 * both edges once it sticks. Pair it with `data-stuck` from `useStuck`.
 */
export const stickyBandClass =
  "border-y border-transparent transition-[background-color,border-color] duration-200 ease-out motion-reduce:transition-none data-[stuck=true]:border-cyan-800/15 data-[stuck=true]:bg-white/80 data-[stuck=true]:backdrop-blur-md dark:data-[stuck=true]:border-primary-dark/15 dark:data-[stuck=true]:bg-[#06111f]/70";

/**
 * Whether a sticky element is stuck: its container has scrolled above the
 * element's sticky `top`, so the element no longer sits in its own place.
 */
export function useStuck(ref: RefObject<HTMLElement | null>) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const element = ref.current;
      const container = element?.parentElement;
      if (!element || !container) return;
      const top = parseFloat(getComputedStyle(element).top) || 0;
      setStuck(container.getBoundingClientRect().top < top - 0.5);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref]);

  return stuck;
}

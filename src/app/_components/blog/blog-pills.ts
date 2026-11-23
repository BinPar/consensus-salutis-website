import {
  useLayoutEffect,
  useState,
  type DependencyList,
  type RefObject,
} from "react";

/** Filter pill of the blog bar, shared with the /plataforma features bar. */
export const blogPillClass = (active: boolean) =>
  `font-body inline-flex h-[32px] shrink-0 cursor-pointer items-center gap-2 rounded-full border pr-1.5 pl-4 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
    active
      ? "border-primary-light bg-primary-light shadow-big-blocks dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#03111d]"
      : "hover:border-primary-light/35 dark:hover:border-primary-dark/30 border-primary-light/20 bg-primary-light/5 hover:bg-primary-light/10 text-slate-600 hover:text-cyan-800 dark:border-primary-dark/10 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/15 dark:text-slate-400 dark:hover:text-primary-dark"
  }`;

/** Count badge inside a pill. */
export const blogPillCountClass = (active: boolean) =>
  `inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1 text-[10px] leading-none font-semibold tabular-nums ${active ? "bg-white/20 text-white dark:bg-[#03111d]/10 dark:text-[#03111d]" : "bg-primary-light/10 text-primary-light dark:bg-primary-dark/15 dark:text-primary-dark"}`;

/** Fades the edges of a horizontally scrolling pill row while it overflows. */
export function useScrollEdges(
  scrollRef: RefObject<HTMLElement | null>,
  deps: DependencyList,
) {
  const [edges, setEdges] = useState({ left: false, right: false });

  useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const measure = () => {
      const maxScroll = element.scrollWidth - element.clientWidth;
      const left = element.scrollLeft > 1;
      const right = maxScroll - element.scrollLeft > 1;
      setEdges((previous) =>
        previous.left === left && previous.right === right
          ? previous
          : { left, right },
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    element.addEventListener("scroll", measure, { passive: true });
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", measure);
      document.fonts.removeEventListener("loadingdone", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const edgeMask =
    edges.left || edges.right
      ? `linear-gradient(to right, ${edges.left ? "transparent, #000 32px" : "#000"}, ${edges.right ? "#000 calc(100% - 32px), transparent" : "#000"})`
      : undefined;

  return { edges, edgeMask };
}

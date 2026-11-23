"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useMotionValue } from "framer-motion";

export type ArticleHeading = { id: string; title: string; level: 2 | 3 };

/** El índice se obtiene del MDX renderizado, sin duplicar títulos ni editar el contenido. */
export function useArticleIndex(slug: string) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<ArticleHeading[]>([]);
  const [activeId, setActiveId] = useState("");
  const readingProgress = useMotionValue(0);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const elements = [...body.querySelectorAll<HTMLElement>("h2, h3")];
    const used = new Set<string>();
    const entries = elements.map((element) => {
      const title = element.textContent?.trim() ?? "";
      const base =
        element.id ||
        `article-section-${
          title
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "") || "apartado"
        }`;
      let id = base;
      let suffix = 2;
      while (used.has(id)) id = `${base}-${suffix++}`;
      used.add(id);
      element.id = id;
      element.tabIndex = -1;
      element.classList.add("focus:outline-none");
      return {
        id,
        title,
        level: element.tagName === "H2" ? (2 as const) : (3 as const),
      };
    });
    setHeadings(entries);
    let frame = 0;
    const measure = () => {
      frame = 0;
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const stops = elements.map((element) =>
        Math.max(
          0,
          Math.min(
            maxScroll,
            window.scrollY + element.getBoundingClientRect().top - 96,
          ),
        ),
      );
      let current = 0;
      while (
        current < elements.length - 1 &&
        window.scrollY >= stops[current + 1]! - 0.5
      ) {
        current++;
      }
      let next = Math.min(current + 1, elements.length - 1);
      // Los últimos apartados pueden compartir el mismo destino alcanzable.
      while (next < elements.length - 1 && stops[next + 1] === stops[next])
        next++;
      const start = stops[current] ?? 0;
      const distance = (stops[next] ?? start) - start;
      const progress =
        distance > 0
          ? Math.max(0, Math.min(1, (window.scrollY - start) / distance))
          : 0;
      readingProgress.set(current + Math.max(0, next - current) * progress);
      setActiveId(elements[current]?.id ?? "");
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    const linked = elements.find(
      (element) => `#${element.id}` === window.location.hash,
    );
    if (linked) linked.scrollIntoView({ block: "start", behavior: "instant" });
    measure();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [slug, readingProgress]);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    )
      return;
    const target = bodyRef.current?.querySelector<HTMLElement>(
      `#${CSS.escape(id)}`,
    );
    if (!target) return;
    event.preventDefault();
    // La marca sigue el scroll real, sin adelantarse al destino del clic.
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    target.focus({ preventScroll: true });
    const url = new URL(window.location.href);
    url.hash = id;
    window.history.replaceState(window.history.state, "", url);
  };

  return { bodyRef, headings, activeId, readingProgress, navigate };
}

"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";

export type ArticleHeading = { id: string; title: string; level: 2 | 3 };

/** El índice se obtiene del MDX renderizado, sin duplicar títulos ni editar el contenido. */
export function useArticleIndex(slug: string) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [headings, setHeadings] = useState<ArticleHeading[]>([]);
  const [activeId, setActiveId] = useState("");

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
      const edge = 64 + 40; // El header de producción mide 64 px.
      let current = elements[0]?.id ?? "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top > edge) break;
        current = element.id;
      }
      // El último apartado puede no alcanzar el borde superior al acabar la página.
      if (
        window.scrollY > 0 &&
        window.scrollY + window.innerHeight >=
          document.documentElement.scrollHeight - 2
      ) {
        current = elements.at(-1)?.id ?? current;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.fonts.addEventListener("loadingdone", schedule);
    const linked = elements.find(
      (element) => `#${element.id}` === window.location.hash,
    );
    if (linked) linked.scrollIntoView({ block: "start", behavior: "instant" });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [slug]);

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
    setActiveId(id);
  };

  return { bodyRef, headings, activeId, navigate };
}

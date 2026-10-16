"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useRef, useState, type MouseEvent } from "react";

import { SideLinkedInLink } from "./side-linkedin-link";
import "./section-navigation.css";

export type PageSection = {
  id: string;
  label: string;
};

/** A page index, separate from the site's primary navigation. */
export function SectionNavigation({
  sections,
  deferUntilContent = false,
}: {
  sections: PageSection[];
  deferUntilContent?: boolean;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [visible, setVisible] = useState(!deferUntilContent);
  const listRef = useRef<HTMLOListElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contrastRef = useRef<HTMLDivElement>(null);
  const socialContrastRef = useRef<HTMLSpanElement>(null);
  const reducedMotion = useReducedMotion();
  const indicatorY = useMotionValue(7);
  const smoothIndicatorY = useSpring(indicatorY, {
    stiffness: 400,
    damping: 38,
    mass: 0.5,
  });

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const darkSurfaces = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-section-navigation-surface="dark"]',
      ),
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!desktop.matches) return;

      // Clip a visual copy to the dark band, including partial overlaps at its edges.
      for (const contrast of [contrastRef.current, socialContrastRef.current]) {
        const track = contrast?.parentElement?.getBoundingClientRect();
        if (contrast && track) {
          const surface = darkSurfaces
            .map((element) => element.getBoundingClientRect())
            .find(
              (rect) =>
                rect.top < track.bottom &&
                rect.bottom > track.top &&
                rect.left < track.right &&
                rect.right > track.left,
            );
          contrast.style.clipPath = surface
            ? `inset(${Math.max(0, surface.top - track.top)}px 0 ${Math.max(0, track.bottom - surface.bottom)}px 0)`
            : "inset(100% 0 0 0)";
        }
      }

      const links = Array.from(listRef.current?.querySelectorAll("a") ?? []);
      const targets = sections.flatMap((section) => {
        const element = document.getElementById(section.id);
        const link = links.find((entry) => entry.hash === `#${section.id}`);
        return element?.getClientRects().length && link
          ? [{ id: section.id, rect: element.getBoundingClientRect(), link }]
          : [];
      });
      const first = targets[0];
      const last = targets.at(-1);
      if (!first || !last) return;

      // Match each label to its section's reachable scroll destination.
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      const stops = targets.map((target) =>
        Math.max(0, Math.min(maxScroll, window.scrollY + target.rect.top - 96)),
      );
      let index = 0;
      while (
        index < targets.length - 1 &&
        window.scrollY >= stops[index + 1]! - 0.5
      ) {
        index++;
      }

      const current = targets[index]!;
      const next = targets[index + 1] ?? current;
      const distance = (stops[index + 1] ?? stops[index]!) - stops[index]!;
      const progress =
        distance > 0
          ? Math.max(
              0,
              Math.min(1, (window.scrollY - stops[index]!) / distance),
            )
          : 0;
      const start = current.link.offsetTop + current.link.offsetHeight / 2 - 11;
      const end = next.link.offsetTop + next.link.offsetHeight / 2 - 11;
      indicatorY.set(start + (end - start) * progress);
      setActiveId(current.id);
      setVisible(
        (!deferUntilContent || first.rect.top <= 96.5) && last.rect.bottom > 96,
      );
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    // Sections can change height as fonts, maps and interactive content load.
    const observer = new ResizeObserver(scheduleUpdate);
    for (const { id } of sections) {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    }
    if (listRef.current) observer.observe(listRef.current);
    for (const surface of darkSurfaces) observer.observe(surface);
    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    desktop.addEventListener("change", scheduleUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      desktop.removeEventListener("change", scheduleUpdate);
    };
  }, [sections, deferUntilContent, indicatorY]);

  useEffect(() => {
    // Keep the current entry visible on short desktop windows and at zoom.
    const list = listRef.current;
    const scroller = scrollRef.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!scroller || !link) return;
    const top = link.offsetTop;
    if (top < scroller.scrollTop) scroller.scrollTop = top;
    else if (
      top + link.offsetHeight >
      scroller.scrollTop + scroller.clientHeight
    )
      scroller.scrollTop = top + link.offsetHeight - scroller.clientHeight;
  }, [activeId]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    // Preserve native open-in-new-tab and copy-link behavior.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    if (window.location.hash !== `#${id}`)
      window.history.pushState(null, "", `#${id}`);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
      block: "start",
    });
    // Keyboard users continue reading from the destination, below the header.
    target.focus({ preventScroll: true });
  }

  if (sections.length < 2) return null;

  return (
    <>
      <SideLinkedInLink visible={visible} contrastRef={socialContrastRef} />
      <nav
        aria-label="Secciones de esta página"
        className="section-navigation font-body"
        data-visible={visible}
        aria-hidden={!visible}
        inert={!visible}
      >
        <div ref={scrollRef} className="section-navigation-scroll">
          <div className="section-navigation-track">
            <ol ref={listRef} className="section-navigation-list">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    className="section-navigation-link"
                    href={`#${section.id}`}
                    aria-current={
                      activeId === section.id ? "location" : undefined
                    }
                    onClick={(event) => navigate(event, section.id)}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ol>
            <motion.span
              className="section-navigation-marker"
              aria-hidden="true"
              style={{ y: reducedMotion ? indicatorY : smoothIndicatorY }}
            />
            <div
              ref={contrastRef}
              className="section-navigation-track section-navigation-contrast"
              aria-hidden="true"
              inert
            >
              <ol className="section-navigation-list">
                {sections.map((section) => (
                  <li key={section.id}>
                    <span
                      className="section-navigation-link"
                      data-current={activeId === section.id}
                    >
                      {section.label}
                    </span>
                  </li>
                ))}
              </ol>
              <motion.span
                className="section-navigation-marker"
                style={{ y: reducedMotion ? indicatorY : smoothIndicatorY }}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const SCROLL_RANGE = 96;

type HeaderStyle = CSSProperties & {
  "--header-bg-progress": number;
};

export function ScrollHeaderFrame({
  children,
  deferUntilCover = false,
}: {
  children: ReactNode;
  deferUntilCover?: boolean;
}) {
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(!deferUntilCover);

  useEffect(() => {
    if (!deferUntilCover) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reveal = () => setRevealed(true);
    const check = () => {
      const cover = Array.from(
        document.querySelectorAll<HTMLElement>(".home-entry"),
      ).find((element) => element.getBoundingClientRect().width > 0);
      if (
        preference.matches ||
        cover?.dataset.entranceComplete === "true" ||
        (cover && cover.getBoundingClientRect().bottom <= 0)
      )
        reveal();
    };
    window.addEventListener("binpar:home-cover-ready", reveal);
    window.addEventListener("scroll", check, { passive: true });
    preference.addEventListener("change", check);
    check();
    return () => {
      window.removeEventListener("binpar:home-cover-ready", reveal);
      window.removeEventListener("scroll", check);
      preference.removeEventListener("change", check);
    };
  }, [deferUntilCover]);

  useEffect(() => {
    let frame = 0;

    const updateProgress = () => {
      frame = 0;
      setProgress(Math.min(window.scrollY / SCROLL_RANGE, 1));
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`header-scroll-backdrop fixed top-0 z-40 w-full px-5 backdrop-blur-md transition-opacity duration-500 ease-in-out motion-reduce:transition-none sm:px-8 ${revealed ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}
      aria-hidden={!revealed}
      inert={!revealed}
      style={{ "--header-bg-progress": progress } as HeaderStyle}
    >
      {children}
    </header>
  );
}

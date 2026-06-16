"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

const SCROLL_RANGE = 96;

type HeaderStyle = CSSProperties & {
  "--header-bg-progress": number;
};

export function ScrollHeaderFrame({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(0);

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
      className="header-scroll-backdrop sticky top-0 z-40 px-5 backdrop-blur-md sm:px-8"
      style={{ "--header-bg-progress": progress } as HeaderStyle}
    >
      {children}
    </header>
  );
}

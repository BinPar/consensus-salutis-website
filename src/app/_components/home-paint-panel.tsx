"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type PanelRef = (node: HTMLElement | null) => void;

export function HomePaintPanel({
  children,
  initiallyVisible = false,
}: {
  children: (visible: boolean, panelRef: PanelRef) => ReactNode;
  initiallyVisible?: boolean;
}) {
  const panelRef = useRef<HTMLElement | null>(null);
  const previousScrollY = useRef(0);
  const [visible, setVisible] = useState(initiallyVisible);

  useEffect(() => {
    if (initiallyVisible) {
      setVisible(true);
    }
  }, [initiallyVisible]);

  useEffect(() => {
    previousScrollY.current = window.scrollY;

    const updateVisibility = (mode: "initial" | "scroll" = "scroll") => {
      const panel = panelRef.current;

      if (!panel) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY.current;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const rect = panel.getBoundingClientRect();
      const activationBottom = window.innerHeight * 0.85;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const visibility = visibleHeight / rect.height;
      const passedActivationPoint =
        rect.bottom <= 0 || rect.top <= activationBottom;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && (passedActivationPoint || visibility >= 0.05))
      ) {
        setVisible(true);
      }

      if (scrollingUp && rect.top >= activationBottom) {
        setVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    const handleScroll = () => updateVisibility("scroll");

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateVisibility("initial");
    const frameId = window.requestAnimationFrame(() =>
      updateVisibility("initial"),
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return children(visible, (node) => {
    panelRef.current = node;
  });
}

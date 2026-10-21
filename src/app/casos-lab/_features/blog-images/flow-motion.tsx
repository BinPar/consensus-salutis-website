"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

export function FlowMotionSurface({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const surface = useRef<HTMLDivElement>(null);
  const visible = useInView(surface, { amount: 0.05 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const running = visible && !reduced && (hovered || focused);
  return (
    <motion.div
      ref={surface}
      tabIndex={0}
      role="img"
      aria-label="Portada abstracta Flujo. Pasa el cursor o enfoca para animar las curvas."
      initial={false}
      animate={running ? "flowing" : "still"}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      data-flow-motion={running ? "active" : "still"}
      className={`focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark pointer-events-auto relative h-full w-full overflow-hidden rounded-[inherit] outline-offset-[-3px] focus-visible:outline-2 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function FlowLines({
  lines,
}: {
  lines: { path: string; width: number; opacity: number }[];
}) {
  const reduced = useReducedMotion();
  const still = {
    x: 0,
    y: 0,
    transition: { duration: reduced ? 0 : 0.7, ease: "easeOut" as const },
  };
  const first: Variants = {
    still,
    flowing: {
      x: [0, 24, -12, 0],
      y: [0, -10, 7, 0],
      transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
    },
  };
  const second: Variants = {
    still,
    flowing: {
      x: [0, -18, 14, 0],
      y: [0, 12, -7, 0],
      transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
    },
  };
  return (
    <>
      {[first, second].map((variants, group) => (
        <motion.g
          key={group}
          variants={variants}
          initial={false}
          data-flow-lines={group}
        >
          {lines
            .filter((_, index) => index % 2 === group)
            .map((line) => (
              <path
                key={line.path}
                d={line.path}
                stroke="currentColor"
                strokeWidth={line.width}
                opacity={line.opacity}
              />
            ))}
        </motion.g>
      ))}
    </>
  );
}

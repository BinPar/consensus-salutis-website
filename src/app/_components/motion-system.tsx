"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type MouseEvent, type ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: "easeOut" }}>
      {children}
    </MotionConfig>
  );
}

export function RouteEntrance({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.3 }}
    >
      {children}
    </motion.div>
  );
}

export function HomeMotionBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06111f]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.08)_72%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)] bg-size-[44px_44px]" />
    </div>
  );
}

export function HomeTransitionShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [exiting, setExiting] = useState(false);

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    const link = (event.target as HTMLElement).closest("a");
    const href = link?.getAttribute("href");

    if (
      !href ||
      !href.startsWith("/") ||
      href === "/" ||
      link?.target === "_blank" ||
      reducedMotion
    ) {
      return;
    }

    event.preventDefault();
    setExiting(true);
    window.setTimeout(() => router.push(href), 250);
  };

  return (
    <div onClickCapture={handleClickCapture}>
      {children}
      <AnimatePresence>
        {exiting && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-100 bg-[#030916]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export function MotionLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

export function MotionSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

export function Reveal({
  children,
  visible,
  delay = 0,
  className,
}: {
  children: ReactNode;
  visible: boolean;
  delay?: number;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: visible || reducedMotion ? 1 : 0 }}
      transition={{
        duration: reducedMotion ? 0 : 0.36,
        delay: visible ? delay : 0,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ViewportReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.3, once: true }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}

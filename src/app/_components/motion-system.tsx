"use client";

import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [exiting, setExiting] = useState(false);
  const navigatingRef = useRef(false);

  useEffect(() => {
    navigatingRef.current = false;
    setExiting(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: globalThis.MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        navigatingRef.current
      ) {
        return;
      }

      const target = event.target;
      const link =
        target instanceof Element
          ? target.closest<HTMLAnchorElement>("a[href]")
          : null;

      if (
        !link ||
        link.target === "_blank" ||
        link.hasAttribute("download") ||
        reducedMotion
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      const current = new URL(window.location.href);

      if (
        destination.origin !== current.origin ||
        destination.pathname === current.pathname
      ) {
        return;
      }

      event.preventDefault();
      navigatingRef.current = true;
      setExiting(true);
      window.setTimeout(
        () =>
          router.push(
            `${destination.pathname}${destination.search}${destination.hash}`,
          ),
        180,
      );
    };

    document.addEventListener("click", handleClick, true);

    return () => document.removeEventListener("click", handleClick, true);
  }, [reducedMotion, router]);

  return (
    <MotionConfig reducedMotion="user" transition={{ ease: "easeOut" }}>
      {children}
      <AnimatePresence>
        {exiting && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-100 bg-[#deedf3] dark:bg-[#030916]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export function RouteEntrance({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reducedMotion ? 0 : 0.22 }}
    >
      {children}
    </motion.div>
  );
}

export function HomeMotionBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f4f9fc] dark:bg-[#06111f]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(8,145,178,0.1),transparent_30%,rgba(13,148,136,0.08)_72%,transparent)] dark:bg-[linear-gradient(120deg,rgba(34,211,238,0.12),transparent_30%,rgba(20,184,166,0.08)_72%,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,145,178,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(8,145,178,0.1)_1px,transparent_1px)] bg-size-[44px_44px] dark:bg-[linear-gradient(rgba(125,211,252,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.045)_1px,transparent_1px)]" />
    </div>
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
  const revealRef = useRef<HTMLDivElement | null>(null);
  const previousScrollY = useRef(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    previousScrollY.current = window.scrollY;

    const updateVisibility = (mode: "initial" | "scroll" = "scroll") => {
      const element = revealRef.current;

      if (!element) return;

      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > previousScrollY.current;
      const scrollingUp = currentScrollY < previousScrollY.current;
      const rect = element.getBoundingClientRect();
      if (rect.height === 0) return;

      const activationBottom = window.innerHeight * 0.85;
      const visibleHeight = Math.max(
        0,
        Math.min(rect.bottom, activationBottom) - Math.max(rect.top, 0),
      );
      const visibility = visibleHeight / rect.height;
      const passedActivationPoint =
        rect.bottom <= 0 || rect.top <= activationBottom - rect.height * 0.3;

      if (
        (mode === "initial" && passedActivationPoint) ||
        (scrollingDown && (rect.bottom <= 0 || visibility >= 0.3))
      ) {
        setVisible(true);
      }

      if (scrollingUp && rect.top >= activationBottom) {
        setVisible(false);
      }

      previousScrollY.current = currentScrollY;
    };

    const handleScroll = () => updateVisibility("scroll");
    const handleResize = () => updateVisibility("initial");

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    updateVisibility("initial");
    const frameId = window.requestAnimationFrame(() =>
      updateVisibility("initial"),
    );

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  return (
    <motion.div
      ref={revealRef}
      className={className}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={{ opacity: visible || reducedMotion ? 1 : 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.4 }}
    >
      {children}
    </motion.div>
  );
}

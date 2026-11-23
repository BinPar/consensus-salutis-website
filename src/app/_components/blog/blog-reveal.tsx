"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { useBlogHydrated } from "./use-blog-hydrated";

/** Misma activación y transición que la galería de Equipo, compartida con la galería de Equipo. */
export function BlogReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  const hydrated = useBlogHydrated();
  const visible = hydrated && painted;
  const staticMotion = hydrated && reduced;
  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
      }}
      data-blog-painted={visible}
      className={className}
      initial={staticMotion ? false : { opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{
        duration: staticMotion ? 0 : 0.42,
        delay: visible && !staticMotion ? delay : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

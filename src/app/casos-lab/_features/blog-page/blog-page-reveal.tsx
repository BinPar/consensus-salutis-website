"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";

/** Misma activación y transición que la galería de Equipo, solo en el lab. */
export function BlogPageReveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
      }}
      data-blog-painted={painted}
      className={className}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: painted ? 1 : 0 }}
      transition={{
        duration: reduced ? 0 : 0.42,
        delay: painted && !reduced ? delay : 0,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";

export function TeamIdeaReveal({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const { ref, painted, reduced } = useProductEntrance();

  return (
    <motion.div
      ref={(node) => {
        ref.current = node;
      }}
      className={className}
      data-team-idea-reveal=""
      initial={{ opacity: 0 }}
      animate={{ opacity: painted ? 1 : 0 }}
      transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

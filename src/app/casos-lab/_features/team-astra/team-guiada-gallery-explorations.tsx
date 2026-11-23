"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { guided03Members as members } from "./team-guiada-03-data";
import "./team-guiada-gallery-explorations.css";

export function TeamGuiadaGalleryExploration({
  variant,
  portraits,
}: {
  variant: "guiada-04" | "guiada-05" | "guiada-06";
  portraits: ReactNode[];
}) {
  const { ref, painted, reduced } = useProductEntrance();
  const [columns, setColumns] = useState(5);
  const titleId = `${variant}-gallery-title`;

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const tablet = window.matchMedia("(min-width: 640px)");
    const update = () => setColumns(
      variant === "guiada-06"
        ? desktop.matches ? 5 : 2
        : desktop.matches ? 5 : tablet.matches ? 3 : 2,
    );
    update();
    desktop.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, [variant]);

  return (
    <section
      className={`ta-gallery-exploration ta-${variant}-gallery`}
      aria-labelledby={titleId}
    >
      <div className="ta-gallery-exploration-inner">
        <motion.header
          ref={ref}
          className="ta-gallery-exploration-heading"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: painted ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
        >
          <h2
            id={titleId}
            className="font-display text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl"
          >
            Las personas
            <br />
            <span>detrás de BinPar.</span>
          </h2>
          <p>
            Cada persona aporta una forma de pensar, de crear y de resolver.
            Conoce al equipo que da forma a BinPar cada día.
          </p>
        </motion.header>
        <ul
          className="ta-gallery-exploration-grid"
          aria-label="Miembros del equipo"
        >
          {members.map((member, index) => (
            <GalleryCard
              key={member.slug}
              slug={member.slug}
              column={index % columns}
            >
              <figure tabIndex={variant === "guiada-06" ? 0 : undefined}>
                <div className="ta-gallery-exploration-photo">
                  {portraits[index]}
                </div>
                <figcaption>
                  <h3>{member.name}</h3>
                  <p>{member.role}</p>
                </figcaption>
              </figure>
            </GalleryCard>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GalleryCard({
  slug,
  column,
  children,
}: {
  slug: string;
  column: number;
  children: ReactNode;
}) {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <motion.li
      ref={(node) => {
        ref.current = node;
      }}
      className="ta-gallery-exploration-card"
      data-gallery-member={slug}
      data-gallery-painted={painted}
      style={{ "--gallery-column": column } as CSSProperties}
      initial={reduced ? false : { opacity: 0, scale: 0.94 }}
      animate={{
        opacity: painted ? 1 : 0,
        scale: painted || reduced ? 1 : 0.94,
      }}
      transition={{
        duration: reduced ? 0 : 0.42,
        delay: reduced || !painted ? 0 : column * 0.12,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.li>
  );
}

"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { guided03Members as teamMembers } from "./team-guiada-03-data";
import "./team-guiada-03-gallery.css";

export function TeamGuiada03Gallery({ portraits }: { portraits: ReactNode[] }) {
  const { ref, painted, reduced } = useProductEntrance();
  const [columns, setColumns] = useState(5);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const tablet = window.matchMedia("(min-width: 640px)");
    const updateColumns = () =>
      setColumns(desktop.matches ? 5 : tablet.matches ? 3 : 2);
    updateColumns();
    desktop.addEventListener("change", updateColumns);
    tablet.addEventListener("change", updateColumns);
    return () => {
      desktop.removeEventListener("change", updateColumns);
      tablet.removeEventListener("change", updateColumns);
    };
  }, []);

  return (
    <section
      className="ta-guided-03-gallery"
      aria-labelledby="ta-guided-03-gallery-title"
    >
      <div className="ta-guided-03-gallery-inner">
        <motion.header
          ref={ref}
          className="ta-guided-03-gallery-heading"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: painted ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
        >
          <h2
            id="ta-guided-03-gallery-title"
            className="font-display font-extrabold tracking-tight text-4xl leading-tight xl:text-5xl"
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
          className="ta-guided-03-gallery-grid"
          aria-label="Miembros del equipo"
        >
          {teamMembers.map((person, index) => (
            <GalleryPerson
              key={person.slug}
              slug={person.slug}
              column={index % columns}
            >
              <figure>
                <div className="ta-guided-03-gallery-photo">
                  {portraits[index]}
                </div>
                <figcaption>
                  <h3>{person.name}</h3>
                  <p>{person.role}</p>
                </figcaption>
              </figure>
            </GalleryPerson>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GalleryPerson({
  slug,
  column,
  children,
}: {
  slug: string;
  column: number;
  children: ReactNode;
}) {
  // Each card follows the home scroll trigger so later rows wait for the viewport.
  const { ref, painted, reduced } = useProductEntrance();

  return (
    <motion.li
      ref={(node) => {
        ref.current = node;
      }}
      className="ta-guided-03-gallery-person"
      data-gallery-member={slug}
      data-gallery-painted={painted}
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

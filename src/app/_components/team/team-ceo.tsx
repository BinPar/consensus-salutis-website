"use client";

import { motion } from "framer-motion";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { teamCeo } from "./team-data";
import { TeamPortrait } from "./team-portrait";
import { teamContentWidth } from "./team-layout";

export function TeamCeo() {
  const { ref, painted, reduced } = useProductEntrance();
  return (
    <section
      id="equipo-ceo"
      tabIndex={-1}
      ref={ref}
      aria-labelledby="equipo-ceo-title"
      data-team-ceo=""
      data-ceo-painted={painted}
      className="relative z-1 scroll-mt-16 bg-[linear-gradient(to_bottom,transparent,var(--team-paper)_var(--team-ceo-fade))] pt-24 pb-[45px] focus:outline-none motion-reduce:bg-(--team-paper) motion-reduce:pt-14 [@media(width<=767px)]:pt-16 [@media(width<=767px)]:motion-reduce:pt-14"
    >
      <div
        className={`${teamContentWidth} grid grid-cols-[320px_minmax(0,1fr)] items-center gap-16 [@media(768px<=width<=1100px)]:grid-cols-[240px_minmax(0,1fr)] [@media(768px<=width<=1100px)]:gap-10 [@media(width<=767px)]:grid-cols-[minmax(0,1fr)] [@media(width<=767px)]:gap-7`}
      >
        <motion.div
          className="relative aspect-square w-full overflow-hidden rounded-3xl bg-(--team-panel) max-md:mx-auto [@media(width<=767px)]:w-[min(220px,100%)] [@media(width<=767px)]:rounded-[20px]"
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{
            opacity: painted ? 1 : 0,
            scale: painted || reduced ? 1 : 0.94,
          }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        >
          <TeamPortrait
            person={teamCeo}
            sizes="(max-width: 767px) 220px, 300px"
          />
        </motion.div>
        <motion.div
          className="font-body max-md:text-center"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: painted ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        >
          <p className="font-display m-0 text-xs leading-4 font-bold tracking-[0.22em] text-(--team-accent) uppercase">
            La persona detrás de la idea
          </p>
          <h2
            id="equipo-ceo-title"
            className="font-display mt-5 mb-6 text-4xl leading-tight font-extrabold tracking-tight text-balance text-(--team-ink) xl:text-5xl dark:text-slate-50"
          >
            Ignacio Ferro Picón
            <br />
            <span className="text-[0.7em] text-(--team-accent)">
              CEO de BinPar
            </span>
          </h2>
          <div className="grid gap-4 text-lg leading-8 text-slate-600 dark:text-slate-400 [@media(width<=767px)]:text-base [@media(width<=767px)]:leading-7">
            <p className="m-0">
              Al frente de BinPar, Ignacio lidera un equipo con más de quince
              años de experiencia desarrollando tecnología para el sector de la
              salud. Hoy, esa experiencia está detrás de la plataforma de IA
              médica que conecta conocimiento médico con la práctica clínica. El
              objetivo, llevar el conocimiento hasta donde hace falta: ayudar a
              quienes cuidan de nuestra salud a resolver sus dudas, consultar
              fuentes y seguir aprendiendo en su práctica diaria.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

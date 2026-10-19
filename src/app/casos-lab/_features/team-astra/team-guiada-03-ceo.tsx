"use client";

import { motion } from "framer-motion";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import { RealTeamPortrait } from "../../_shared/team-portraits";
import "./team-guiada-03-ceo.css";

export function TeamGuiada03Ceo() {
  const { ref, painted, reduced } = useProductEntrance();

  return (
    <section
      ref={ref}
      className="ta-guided-03-ceo"
      aria-labelledby="ta-guided-03-ceo-title"
      data-ceo-painted={painted}
    >
      <div className="ta-guided-03-ceo-inner">
        <motion.div
          className="ta-guided-03-ceo-photo"
          initial={reduced ? false : { opacity: 0, scale: 0.94 }}
          animate={{
            opacity: painted ? 1 : 0,
            scale: painted || reduced ? 1 : 0.94,
          }}
          transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
        >
          <RealTeamPortrait
            slug="ignacio-ferro"
            name="Ignacio Ferro Picón"
            sizes="(max-width: 767px) 220px, 300px"
          />
        </motion.div>
        <motion.div
          className="ta-guided-03-ceo-content font-body"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: painted ? 1 : 0 }}
          transition={{
            duration: reduced ? 0 : 0.5,
            ease: "easeOut",
          }}
        >
          <p className="ta-eyebrow">La persona detrás de la idea</p>
          <h2
            id="ta-guided-03-ceo-title"
            className="font-display font-extrabold tracking-tight text-4xl leading-tight xl:text-5xl"
          >
            Ignacio Ferro Picón
            <br />
            <span className="ta-guided-03-ceo-role">CEO de BinPar</span>
          </h2>
          <div className="ta-guided-03-ceo-bio">
            <p>
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

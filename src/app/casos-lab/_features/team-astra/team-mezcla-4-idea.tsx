"use client";

import { motion } from "framer-motion";
import { useProductEntrance } from "~/app/_components/product-strata/product-strata-section";
import "./team-mezcla-4-idea.css";

export function TeamMezcla4Idea() {
  const { ref, painted, reduced } = useProductEntrance();

  return (
    <section
      id="mezcla-4-idea"
      ref={ref}
      className="ta-guided-03-ceo tm4-idea"
      aria-labelledby="mezcla-4-idea-title"
      data-idea-painted={painted}
    >
      <motion.div
        className="tn-container tm4-idea-inner"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: painted ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5, ease: "easeOut" }}
      >
        <div>
          <p className="tn-eyebrow">La idea que nos mueve</p>
          <h2
            id="mezcla-4-idea-title"
            className="tn-title font-display text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl"
          >
            El conocimiento,
            <br />
            <span>donde hace falta.</span>
          </h2>
        </div>
        <div className="tm4-idea-copy font-body">
          <p>
            Más de quince años desarrollando tecnología para el sector de la
            salud nos han enseñado que el conocimiento tiene valor cuando llega
            a quien lo necesita. Con esa idea nace BinPar: una plataforma de IA
            médica que conecta el conocimiento médico con la práctica clínica.
            Para ayudar a quienes cuidan de nuestra salud a resolver sus dudas,
            consultar fuentes y seguir aprendiendo en su día a día.
          </p>
        </div>
      </motion.div>
    </section>
  );
}

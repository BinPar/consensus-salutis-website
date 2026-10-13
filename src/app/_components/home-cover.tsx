"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

import "./home-cover.css";

export function HomeCoverContent({ onExplore }: { onExplore: () => void }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="home-cover-content home-entry-content"
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.7 }}
    >
      <div className="home-aura-app-icon" aria-hidden="true">
        <Image
          src="/logos/binpar-brand/binpar-isotipo-light.svg"
          alt=""
          width={44}
          height={48}
          className="dark:hidden"
        />
        <Image
          src="/logos/binpar-brand/binpar-isotipo-dark.svg"
          alt=""
          width={44}
          height={48}
          className="hidden dark:block"
        />
      </div>
      <h1 className="home-cover-title font-display font-extrabold tracking-tight">
        Binpar
        <span>Respuestas clínicas trazables.</span>
      </h1>
      <p className="home-cover-description font-body text-lg leading-8 text-slate-600 dark:text-slate-400">
        Binpar la IA médica institucional que conecta guías, protocolos y corpus
        médico con la práctica clínica.
      </p>
      <button type="button" className="home-cover-explore" onClick={onExplore}>
        Descubrir la plataforma
        <ArrowUpRight size={17} strokeWidth={1.5} />
      </button>
    </motion.div>
  );
}

export function HomeCover({ targetId }: { targetId: string }) {
  const reduced = useReducedMotion();

  return (
    <section
      className="home-entry"
      aria-label="Binpar: respuestas clínicas trazables"
    >
      <HomeCoverContent
        onExplore={() => {
          document.getElementById(targetId)?.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
            block: "start",
          });
        }}
      />
    </section>
  );
}

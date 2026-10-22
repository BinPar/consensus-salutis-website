"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { BrandIsotypeReveal } from "./brand-isotype-reveal";
import { BrandIsotypeParticles } from "./brand-isotype-particles";

import "./home-cover.css";

export function HomeCoverContent({
  onExplore,
  animateEntrance = false,
  running = true,
  entranceAnimation = "trace",
}: {
  onExplore: () => void;
  animateEntrance?: boolean;
  running?: boolean;
  entranceAnimation?: "trace" | "particles";
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="home-cover-content home-entry-content"
      data-entry-study={animateEntrance}
      data-entry-animation={animateEntrance ? entranceAnimation : undefined}
      style={
        animateEntrance
          ? ({
              "--entry-motion": running ? "running" : "paused",
            } as React.CSSProperties)
          : undefined
      }
      initial={reduced || animateEntrance ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.7 }}
    >
      <div className="home-aura-app-icon" aria-hidden="true">
        {animateEntrance ? (
          entranceAnimation === "particles" ? (
            <BrandIsotypeParticles running={running} />
          ) : (
            <BrandIsotypeReveal />
          )
        ) : (
          <>
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
          </>
        )}
      </div>
      <h1 className="home-cover-title font-display font-extrabold tracking-tight">
        BinPar
        <span>Respuestas clínicas trazables.</span>
      </h1>
      <p className="home-cover-description font-body text-lg leading-8 text-slate-600 dark:text-slate-400">
        BinPar la IA médica institucional que conecta guías, protocolos y corpus
        médico con la práctica clínica.
      </p>
      <button type="button" className="home-cover-explore" onClick={onExplore}>
        Descubrir
        <ArrowDown size={17} strokeWidth={1.5} aria-hidden="true" />
      </button>
    </motion.div>
  );
}

export function HomeCover({ targetId }: { targetId: string }) {
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: "some" });
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const update = () => setTabVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  return (
    <section
      ref={root}
      className="home-entry"
      onAnimationStart={(event) => {
        if (
          !(event.target instanceof HTMLElement) ||
          !event.target.classList.contains("home-cover-explore") ||
          event.animationName !== "aura-entry-fade"
        )
          return;
        event.currentTarget.dataset.entranceComplete = "true";
        window.dispatchEvent(new Event("binpar:home-cover-ready"));
      }}
      aria-label="BinPar: respuestas clínicas trazables"
    >
      <HomeCoverContent
        animateEntrance
        entranceAnimation="trace"
        running={inView && tabVisible && !reduced}
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

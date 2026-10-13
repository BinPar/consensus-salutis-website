"use client";

import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HomeCoverContent } from "~/app/_components/home-cover";
import { HomeCoverField } from "./home-cover-field";
import { HomeCorpus } from "./home-corpus";
import { HomeEvidence } from "./home-evidence";
import { HomeAura } from "./home-aura";
import { homeDirections } from "./home-directions";
import type { HomeDirection } from "./home-directions";
import "./home-proposals.css";

export function HomeProposal({
  direction,
  onExplore,
}: {
  direction: HomeDirection;
  onExplore: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const inView = useInView(root, { amount: "some" });
  const [reduced, setReduced] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const auraComposition = direction === "aura" || direction === "aura-signal";

  const running = inView && tabVisible && !reduced;
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    const visibility = () => setTabVisible(!document.hidden);
    update();
    visibility();
    preference.addEventListener("change", update);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preference.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  const explore = () => {
    onExplore();
    requestAnimationFrame(() =>
      requestAnimationFrame(() =>
        document.getElementById("home-introduction")?.scrollIntoView({
          behavior: reduced ? "instant" : "smooth",
          block: "start",
        }),
      ),
    );
  };
  return (
    <section
      ref={root}
      aria-label={`Portada BinPar: ${homeDirections.find((item) => item.id === direction)?.label}`}
      data-home-proposal={direction}
      data-home-running={running}
      className={`home-cover home-cover-${direction} ${direction === "aura-signal" ? "home-cover-aura" : ""}`}
      onPointerMove={(e) => {
        if (reduced || e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        pointer.current = {
          x: ((e.clientX - r.left) / r.width) * 2 - 1,
          y: ((e.clientY - r.top) / r.height) * 2 - 1,
        };
      }}
      onPointerLeave={() => {
        pointer.current = { x: 0, y: 0 };
      }}
    >
      {direction === "architecture" && (
        <div className="home-cover-atmosphere" aria-hidden>
          <div />
          <div />
          <div />
        </div>
      )}
      {direction === "prism-field" && (
        <HomeAura running={running} pointer={pointer} />
      )}
      {direction === "architecture" ||
      direction === "prism" ||
      direction === "prism-isotype" ||
      direction === "prism-center" ||
      direction === "prism-field" ? (
        <HomeCoverField
          direction={direction}
          running={running}
          pointer={pointer}
        />
      ) : direction === "corpus" ? (
        <HomeCorpus running={running} pointer={pointer} />
      ) : direction === "evidence" ? (
        <HomeEvidence running={running} pointer={pointer} />
      ) : null}
      {direction !== "aura-signal" && (
        <div className="home-cover-topline">
          <Image
            src="/logos/binpar-brand/binpar-logo-light.svg"
            alt="BinPar"
            width={160}
            height={44}
            className="dark:hidden"
          />
          <Image
            src="/logos/binpar-brand/binpar-logo-dark.svg"
            alt="BinPar"
            width={160}
            height={44}
            className="hidden dark:block"
          />
        </div>
      )}
      {direction === "aura-signal" ? (
        <HomeCoverContent onExplore={explore} />
      ) : (
        <motion.div
          className="home-cover-content"
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.7 }}
        >
          {auraComposition && (
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
          )}
          <h2 className="home-cover-title font-display font-extrabold tracking-tight">
            Conocimiento médico.
            <br />
            <span>Respuestas trazables.</span>
          </h2>
          <p className="home-cover-description font-body text-lg leading-8 text-slate-600 dark:text-slate-400">
            IA médica institucional que conecta guías, protocolos y corpus
            médico con la práctica clínica.
          </p>
          <button
            type="button"
            className="home-cover-explore"
            onClick={explore}
          >
            Descubrir la plataforma
            <ArrowUpRight size={17} strokeWidth={1.5} />
          </button>
        </motion.div>
      )}
      <div className="home-cover-bottom">
        <button
          type="button"
          aria-label="Descubrir la plataforma"
          onClick={explore}
        >
          <ArrowDown size={18} strokeWidth={1.4} />
        </button>
      </div>
      <div className="home-cover-blend" aria-hidden />
    </section>
  );
}

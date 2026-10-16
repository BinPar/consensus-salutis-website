"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef, useState } from "react";
import { HomeGrid } from "./motion-system";
import "./volume-section.css";

const metrics = [
  { value: "+3", unit: "TB", label: "Conocimiento médico estructurado" },
  { value: "+8.327", unit: "", label: "Epígrafes clínicos" },
  { value: "+30.000", unit: "", label: "Preguntas de evaluación" },
  { value: "<24", unit: "h", label: "Actualización urgente" },
] as const;

const updatingPhrases = ["se actualiza.", "evoluciona.", "crece."] as const;

function UpdatingHeading({ id }: { id: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const inView = useInView(heading, { amount: 0.5 });
  const reducedMotion = useReducedMotion();
  const [text, setText] = useState<string>(updatingPhrases[0]);

  useEffect(() => {
    setText(updatingPhrases[0]);
    if (!inView || reducedMotion !== false) return;
    let phraseIndex = 0;
    let length = updatingPhrases[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const phrase = updatingPhrases[phraseIndex]!;
      length += deleting ? -1 : 1;
      setText(phrase.slice(0, length));
      let delay = deleting ? 45 : 85;
      if (deleting && length === 0) {
        phraseIndex = (phraseIndex + 1) % updatingPhrases.length;
        deleting = false;
        delay = 220;
      } else if (!deleting && length === phrase.length) {
        deleting = true;
        delay = 2400;
      }
      timer = setTimeout(tick, delay);
    };
    timer = setTimeout(tick, 2400);
    return () => clearTimeout(timer);
  }, [inView, reducedMotion]);

  return (
    <h2
      ref={heading}
      id={id}
      className="font-display"
      aria-label="El conocimiento avanza. La base se actualiza."
    >
      <span aria-hidden="true">
        El conocimiento avanza.
        <span className="vol-updating-line">
          <span className="vol-updating-space">La base se actualiza.</span>
          <span className="vol-updating-text">La base {text}</span>
        </span>
      </span>
    </h2>
  );
}

export function VolumeSection({
  panelRef,
  visible,
  palette = "teal",
}: {
  panelRef?: (node: HTMLElement | null) => void;
  visible?: boolean;
  palette?: "teal" | "original";
}) {
  const reducedMotion = useReducedMotion();
  const headingId = useId();
  return (
    <motion.aside
      ref={panelRef}
      aria-labelledby={headingId}
      data-home-volume=""
      data-volume-palette={palette}
      data-section-navigation-surface={
        palette === "original" ? "dark" : undefined
      }
      className="vol-banner vol-contrast-teal"
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      animate={
        visible === undefined
          ? undefined
          : { opacity: reducedMotion || visible ? 1 : 0 }
      }
      whileInView={visible === undefined ? { opacity: 1 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.35 }}
    >
      <div className="vol-grid-window" aria-hidden="true">
        <HomeGrid className="vol-home-grid" />
      </div>
      <div className="vol-container">
        <div className="vol-original-contrast">
          <div>
            <p className="vol-original-eyebrow font-display">
              Volumen y actualización
            </p>
            <UpdatingHeading id={headingId} />
            <p className="vol-original-intro font-body">
              Una base médica estructurada que incorpora las guías y protocolos
              de cada organización, con evaluación continua y validación
              clínica.
            </p>
          </div>
          <div className="vol-figures">
            {metrics.map((metric) => (
              <div className="vol-metric" key={metric.value}>
                <p className="vol-value font-display">
                  {metric.value}
                  {metric.unit && (
                    <span className="vol-unit">{metric.unit}</span>
                  )}
                </p>
                <p className="vol-label font-body">{metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

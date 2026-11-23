"use client";

import { motion, useReducedMotion } from "framer-motion";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { VolumeSection } from "~/app/_components/volume-section";
import type { VolumeDirection } from "./volume-directions";
import "./volume-proposals.css";

const metrics = [
  { value: "+3", unit: "TB", label: "Conocimiento médico estructurado" },
  { value: "+8.327", unit: "", label: "Epígrafes clínicos" },
  { value: "+30.000", unit: "", label: "Preguntas de evaluación" },
  { value: "<24", unit: "h", label: "Actualización urgente" },
] as const;

type Proposal = Exclude<VolumeDirection, "reference">;

function Metric({ index }: { index: number }) {
  const metric = metrics[index]!;
  return (
    <div className="vol-metric">
      <p className="vol-value font-display">
        {metric.value}
        {metric.unit && <span className="vol-unit">{metric.unit}</span>}
      </p>
      <p className="vol-label font-body">{metric.label}</p>
    </div>
  );
}

function Figures({ indices = [0, 1, 2, 3] }: { indices?: number[] }) {
  return (
    <div className="vol-figures">
      {indices.map((index) => (
        <Metric key={index} index={index} />
      ))}
    </div>
  );
}

function Copy({ compact = false }: { compact?: boolean }) {
  return (
    <div className="vol-copy">
      <h2 id="volume-heading" className="font-display">
        {compact ? "Base médica." : "El conocimiento avanza."} <br />
        {compact ? "Siempre al día." : "La base se actualiza."}
      </h2>
      <p className="font-body">
        {compact
          ? "Corpus médico, evaluación y actualización continua."
          : "Una base médica estructurada, con guías y protocolos propios de cada organización."}
      </p>
    </div>
  );
}

function Assurance() {
  return (
    <p className="vol-assurance font-body">
      <ShieldCheck size={18} strokeWidth={1.8} aria-hidden="true" />
      Evaluación y validación clínica antes de publicar.
    </p>
  );
}

export function VolumeProposal({ direction }: { direction: Proposal }) {
  if (direction === "contrast-teal-original") {
    return <VolumeSection palette="original" />;
  }
  return direction === "contrast-teal" ? (
    <VolumeSection />
  ) : (
    <OtherVolumeProposal direction={direction} />
  );
}

function OtherVolumeProposal({ direction }: { direction: Proposal }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.aside
      aria-labelledby="volume-heading"
      className={`vol-banner vol-${direction}`}
      initial={{ opacity: reducedMotion ? 1 : 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reducedMotion ? 0 : 0.35 }}
    >
      <div className="vol-container">
        {direction === "editorial" && (
          <div className="vol-filet">
            <Copy compact />
            <Figures />
          </div>
        )}
        {direction === "archive" && (
          <div className="vol-frame">
            <div className="vol-frame-intro">
              <Copy compact />
              <Assurance />
            </div>
            <Figures />
          </div>
        )}
        {direction === "atlas" && (
          <div className="vol-band">
            <div className="vol-band-head">
              <h2 id="volume-heading" className="font-display">
                Conocimiento médico. Evaluación continua.
              </h2>
              <Assurance />
            </div>
            <Figures />
          </div>
        )}
        {direction === "cycle" && (
          <div className="vol-update-banner">
            <div className="vol-update-main">
              <Copy compact />
              <Figures indices={[0, 1, 2]} />
            </div>
            <div className="vol-update-time">
              <RefreshCw size={20} strokeWidth={1.8} aria-hidden="true" />
              <Metric index={3} />
              <p className="font-body">
                Contenidos relevantes con publicación controlada.
              </p>
            </div>
          </div>
        )}
        {direction === "pulse" && (
          <div className="vol-original-contrast">
            <div>
              <p className="vol-original-eyebrow font-display">
                Volumen y actualización
              </p>
              <h2 id="volume-heading" className="font-display">
                El conocimiento avanza. La base se actualiza.
              </h2>
              <p className="vol-original-intro font-body">
                Una base médica estructurada que incorpora las guías y
                protocolos de cada organización, con evaluación continua y
                validación clínica.
              </p>
              {direction === "pulse" && (
                <p className="vol-original-assurance font-body">
                  <RefreshCw size={20} strokeWidth={1.8} aria-hidden="true" />
                  Publicación controlada de nuevos contenidos.
                </p>
              )}
            </div>
            <Figures />
          </div>
        )}
        {(direction === "contrast-ice" ||
          direction === "contrast-white" ||
          direction === "contrast-panel") && (
          <div className="vol-light-contrast">
            <div>
              <Copy />
              <Assurance />
            </div>
            <Figures />
          </div>
        )}
      </div>
    </motion.aside>
  );
}

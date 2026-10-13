"use client";

import {
  motion,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useId, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Cloud,
  FileText,
  Layers3,
  Network,
  ShieldCheck,
} from "lucide-react";
import { Mark } from "~/app/_components/clinical-process-visuals";
import {
  pillars,
  micro,
  body,
  Heading,
  Brand,
  useStrataScene,
  StrataDetails,
  ProductStrataContent,
} from "~/app/_components/product-strata/product-strata-scene";
import { useProductEntrance as useEntrance } from "~/app/_components/product-strata/product-strata-section";
import type { ProductDirection } from "./product-directions";

const focus =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark";
const glass =
  "rounded-2xl border border-cyan-800/15 bg-white/90 shadow-[0_12px_40px_-18px_rgba(0,109,121,.22)] backdrop-blur-sm dark:border-cyan-300/20 dark:bg-[#0b1d2d]/90";

function Detail({
  index,
  label = "Aportación al sistema",
}: {
  index: number;
  label?: string;
}) {
  const p = pillars[index]!;
  const Icon = p.icon;
  const reduced = useReducedMotion();
  return (
    <motion.div
      key={index}
      initial={reduced ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.2 }}
      className="flex gap-4 border-t border-cyan-800/15 pt-5 dark:border-cyan-300/15"
      aria-live="polite"
    >
      <Icon
        className="text-primary-light dark:text-primary-dark mt-1 size-5 shrink-0"
        strokeWidth={1.5}
        aria-hidden
      />
      <div>
        <p className={micro}>{label}</p>
        <p className={`${body} mt-2 text-sm leading-6`}>{p.detail}</p>
      </div>
    </motion.div>
  );
}

function Core({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Mark className={compact ? "size-6 sm:size-9" : "size-12"} />
      <p
        className={`font-display mt-2 font-bold text-[#05215e] sm:mt-3 dark:text-slate-50 ${compact ? "text-base sm:text-lg" : "text-2xl"}`}
      >
        BinPar
      </p>
      <p className={`${micro} mt-1 text-[6px] sm:mt-2 sm:text-[8px]`}>
        IA médica institucional
      </p>
    </div>
  );
}

function Registration() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {[
        "top-0 left-0 border-t border-l",
        "top-0 right-0 border-t border-r",
        "bottom-0 left-0 border-b border-l",
        "bottom-0 right-0 border-b border-r",
      ].map((c) => (
        <span
          key={c}
          className={`absolute size-5 border-cyan-800/25 dark:border-cyan-300/30 ${c}`}
        />
      ))}
    </div>
  );
}

function Convergence() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  return (
    <div className="grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
      <div>
        <Heading description="El conocimiento médico, la infraestructura y la ingeniería no actúan por separado. Su conexión da solidez a cada respuesta.">
          La fuerza está en{" "}
          <span className="text-primary-light dark:text-primary-dark">
            cómo se conecta.
          </span>
        </Heading>
        <div className="mt-8 grid grid-cols-3 gap-3 border-y border-cyan-800/10 py-5 dark:border-cyan-300/10">
          {pillars.map((p) => (
            <div key={p.name}>
              <p className="font-display text-xl font-bold tracking-tight text-[#05215e] dark:text-slate-100">
                {p.proof}
              </p>
              <p className="font-body mt-1 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
                {p.proofLabel}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Detail index={selected} />
        </div>
      </div>
      <div>
        <div className="text-primary-light dark:text-primary-dark relative mx-auto aspect-[600/430] w-full max-w-[700px]">
          <div className="product-glow absolute inset-[5%] rounded-full bg-[radial-gradient(ellipse,rgba(0,109,121,.13),transparent_68%)] dark:bg-[radial-gradient(ellipse,rgba(0,188,187,.15),transparent_68%)]" />
          <Registration />
          <svg
            viewBox="0 0 600 430"
            className="absolute inset-0 size-full overflow-visible"
            fill="none"
            aria-hidden
          >
            <defs>
              <radialGradient id={`${id}-core`}>
                <stop stopColor="currentColor" stopOpacity=".13" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="410" cy="215" r="145" fill={`url(#${id}-core)`} />
            {[75, 215, 355].map((y, i) => (
              <g key={y} opacity={selected === i ? 1 : 0.35}>
                <path
                  className="product-draw"
                  d={`M160 ${y}H210C${y === 215 ? "280 215 290 215" : `280 ${y} 270 215`} 340 215`}
                  stroke="currentColor"
                  strokeWidth={selected === i ? 1.5 : 0.8}
                  pathLength="1"
                  style={{ animationDelay: `${0.15 + i * 0.2}s` }}
                />
                <path
                  className="product-flow"
                  d={`M160 ${y}H210C${y === 215 ? "280 215 290 215" : `280 ${y} 270 215`} 340 215`}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="5 95"
                  pathLength="100"
                  style={{ animationDelay: `${-i * 1.1}s` }}
                />
                <circle cx="172" cy={y} r="3" fill="currentColor" />
              </g>
            ))}
            <circle
              cx="410"
              cy="215"
              r="93"
              stroke="currentColor"
              strokeOpacity=".16"
            />
            <circle
              cx="410"
              cy="215"
              r="113"
              stroke="currentColor"
              strokeOpacity=".1"
              strokeDasharray="2 7"
            />
            <path
              className="product-draw"
              d="M486 215H565"
              stroke="currentColor"
              strokeOpacity=".4"
              pathLength="1"
            />
            <circle cx="565" cy="215" r="4" fill="currentColor" />
          </svg>
          {pillars.map((p, i) => (
            <button
              type="button"
              key={p.name}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              aria-label={`Explorar ${p.role}`}
              className={`${focus} ${glass} absolute left-[1.5%] flex h-[18%] w-[26%] flex-col items-center justify-center gap-2 transition-colors ${selected === i ? "!border-primary-light/50 dark:!border-primary-dark/60" : ""}`}
              style={{ top: `${[8, 41, 74][i]}%` }}
            >
              <Brand index={i} className="scale-75 sm:scale-100" />
              <span className={`${micro} hidden text-[8px] sm:block`}>
                {p.short}
              </span>
            </button>
          ))}
          <div
            className={`${glass} absolute top-[32%] left-[56.5%] flex h-[36%] w-[24%] items-center justify-center !rounded-[30px]`}
          >
            <Core compact />
          </div>
          <span
            className={`${micro} absolute top-[54%] right-0 text-[7px] sm:text-[9px]`}
          >
            Respuesta
            <br />
            trazable
          </span>
          <p className={`${micro} absolute right-5 bottom-5 text-[8px]`}>
            Una arquitectura · Tres aportaciones
          </p>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-4">
          {pillars.map((p) => (
            <p
              key={p.name}
              className="font-body text-[10px] leading-5 text-slate-500 dark:text-slate-400"
            >
              {p.summary}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function StrataPlane({
  layer,
  active,
  id,
  thickness,
  scale,
  topSurface,
  surfaceGrid,
  glassBlur,
}: {
  layer: number;
  active: boolean;
  id: string;
  thickness: number;
  scale: MotionValue<number>;
  topSurface: string;
  surfaceGrid: string;
  glassBlur: CSSProperties;
}) {
  // Grow in the surface plane; compensate the extrusion to keep its height fixed.
  const transform = useTransform(
    scale,
    (value) =>
      `matrix(${value}, 0, 0, ${value}, ${325 * (1 - value)}, ${128 * (1 - value)})`,
  );
  const relief = useTransform(scale, (value) => thickness / value);
  const reliefHeight = useTransform(relief, (value) => 96 + value);
  const reliefClip = useTransform(
    relief,
    (value) =>
      `polygon(0% 0%, 50% ${(96 / (96 + value)) * 100}%, 100% 0%, 100% ${(value / (96 + value)) * 100}%, 50% 100%, 0% ${(value / (96 + value)) * 100}%)`,
  );
  const leftFace = useTransform(
    relief,
    (value) => `M55 128L325 224L325 ${224 + value}L55 ${128 + value}Z`,
  );
  const rightFace = useTransform(
    relief,
    (value) => `M325 224L595 128L595 ${128 + value}L325 ${224 + value}Z`,
  );
  const reliefContour = useTransform(
    relief,
    (value) =>
      `M55 128V${128 + value}L325 ${224 + value}L595 ${128 + value}V128M325 224V${224 + value}`,
  );
  return (
    <motion.g
      className="origin-top-left!"
      style={{ transform, transformBox: "view-box" }}
      data-strata-plane=""
    >
      <motion.foreignObject x="55" y="128" width="540" height={reliefHeight}>
        <motion.div
          data-strata-glass="relief"
          className="size-full bg-white/30 dark:bg-[#0b2030]/30"
          style={{
            ...glassBlur,
            clipPath: reliefClip,
          }}
        />
      </motion.foreignObject>
      <motion.path
        data-strata-face="left"
        d={leftFace}
        fill="currentColor"
        fillOpacity={active ? 0.09 : 0.035}
      />
      <motion.path
        data-strata-face="right"
        d={rightFace}
        fill="currentColor"
        fillOpacity={active ? 0.23 : 0.14}
      />
      <motion.path
        data-strata-contour=""
        d={reliefContour}
        stroke="currentColor"
        strokeOpacity={active ? 0.65 : 0.2}
        strokeWidth="1"
      />
      <foreignObject x="55" y="32" width="540" height="192">
        <div
          data-strata-glass="surface"
          className="size-full bg-white/30 dark:bg-[#0b2030]/30"
          style={{
            ...glassBlur,
            clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)",
          }}
        />
      </foreignObject>
      <path
        data-strata-tint=""
        d={topSurface}
        fill="currentColor"
        fillOpacity={active ? 0.085 : 0}
      />
      <path
        data-strata-grid=""
        className="stroke-[#008b7b] dark:stroke-[#29bda8]"
        d={surfaceGrid}
        clipPath={`url(#${id}-surface-clip)`}
        stroke="currentColor"
        strokeOpacity=".1"
        strokeWidth=".6"
        pointerEvents="none"
      />
      <path
        data-strata-surface=""
        data-strata-contour=""
        d={topSurface}
        fill={`url(#${id}-layer)`}
        stroke="currentColor"
        strokeOpacity={active ? 0.65 : 0.27}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        className="product-flow"
        d={topSurface}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 98"
        pathLength="100"
        style={{ animationDelay: `${-layer * 1.4}s` }}
      />
      {layer === 0 && (
        <text
          x="325"
          y="128"
          fill="currentColor"
          className="font-display"
          textAnchor="middle"
          fontSize="10"
          fontWeight="600"
          letterSpacing="1.6"
        >
          BINPAR / SISTEMA INTEGRADO
        </text>
      )}
      <text
        x="325"
        y="192"
        fill="currentColor"
        className="font-display"
        textAnchor="middle"
        fontSize="11"
        fontWeight="600"
      >
        0{layer + 1}
      </text>
    </motion.g>
  );
}

function Strata({
  reduced,
  running,
  scaleActive = true,
  keyboardEnabled = false,
  showEyebrow = true,
  showContinuityLabel = true,
  compactLayout = false,
}: {
  reduced: boolean;
  running: boolean;
  scaleActive?: boolean;
  keyboardEnabled?: boolean;
  showEyebrow?: boolean;
  showContinuityLabel?: boolean;
  compactLayout?: boolean;
}) {
  const thickness = 10;
  const model = useStrataScene({
    reduced,
    running,
    scaleActive,
    keyboardEnabled,
  });
  const { paused, layerYs, layerScales, order, selected, selectTurn } = model;
  const [topY, middleY, bottomY] = layerYs as [
    MotionValue<number>,
    MotionValue<number>,
    MotionValue<number>,
  ];
  const [topScale, middleScale, bottomScale] = layerScales as [
    MotionValue<number>,
    MotionValue<number>,
    MotionValue<number>,
  ];
  const topGuide = useTransform(
    [topY, middleY, topScale, middleScale],
    (values) =>
      `M${325 - 270 * Number(values[2])} ${128 + thickness + Number(values[0])}L${325 - 270 * Number(values[3])} ${204 + Number(values[1])}M${325 + 270 * Number(values[2])} ${128 + thickness + Number(values[0])}L${325 + 270 * Number(values[3])} ${204 + Number(values[1])}`,
  );
  const bottomGuide = useTransform(
    [middleY, bottomY, middleScale, bottomScale],
    (values) =>
      `M${325 - 270 * Number(values[2])} ${204 + thickness + Number(values[0])}L${325 - 270 * Number(values[3])} ${280 + Number(values[1])}M${325 + 270 * Number(values[2])} ${204 + thickness + Number(values[0])}L${325 + 270 * Number(values[3])} ${280 + Number(values[1])}`,
  );
  const id = useId();
  // One parallelogram defines every surface and animation path.
  const topSurface = "M55 128L325 32L595 128L325 224Z";
  // Subdivide the two projected axes of the surface, not the screen axes.
  const surfaceGrid = Array.from({ length: 7 }, (_, index) => {
    const fraction = (index + 1) / 8;
    return [
      `M${55 + 270 * fraction} ${128 - 96 * fraction}L${325 + 270 * fraction} ${224 - 96 * fraction}`,
      `M${55 + 270 * fraction} ${128 + 96 * fraction}L${325 + 270 * fraction} ${32 + 96 * fraction}`,
    ].join(" ");
  }).join(" ");
  const glassBlur = {
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };
  const layerTransition = {
    duration: reduced ? 0 : 0.55,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };
  return (
    <>
      <Heading
        centered
        compact={compactLayout}
        eyebrow={showEyebrow ? undefined : null}
        description="Un producto sólido se construye en profundidad. Tres capas complementarias sostienen la misma experiencia clínica."
      >
        Tres capacidades.
        <br />
        <span className="text-primary-light dark:text-primary-dark">
          Una sola arquitectura.
        </span>
      </Heading>
      <div
        className={`mt-10 grid items-center gap-8 lg:gap-16 ${compactLayout ? "max-lg:mt-6 max-lg:gap-5 md:grid-cols-[.95fr_1.05fr] lg:grid-cols-[1.05fr_.95fr]" : "lg:grid-cols-[1.25fr_.75fr]"}`}
      >
        <div
          className={`text-primary-light dark:text-primary-dark relative mx-auto aspect-[650/410] w-full ${compactLayout ? "max-w-[640px] max-md:max-w-[440px]" : "max-w-[720px]"}`}
        >
          {!compactLayout && (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,rgba(0,109,121,.055),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_50%_75%,rgba(0,188,187,.075),transparent_65%)]" />
          )}
          <svg
            viewBox="0 0 650 410"
            className="absolute size-full overflow-visible"
            fill="none"
            role="group"
            aria-label="Capas de la arquitectura del producto"
            style={
              {
                "--product-motion": running && !paused ? "running" : "paused",
              } as CSSProperties
            }
          >
            <defs>
              <clipPath id={`${id}-surface-clip`}>
                <path d={topSurface} />
              </clipPath>
              <linearGradient id={`${id}-layer`} x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="currentColor" stopOpacity=".025" />
                <stop
                  offset=".55"
                  stopColor="currentColor"
                  stopOpacity=".075"
                />
                <stop offset="1" stopColor="currentColor" stopOpacity=".035" />
              </linearGradient>
            </defs>
            {[topGuide, bottomGuide].map((guide, layer) => (
              <motion.path
                key={layer}
                initial={false}
                d={guide}
                data-strata-guide=""
                stroke="currentColor"
                strokeOpacity=".23"
                strokeDasharray="2 6"
                strokeWidth=".9"
              />
            ))}
            {[2, 1, 0].map((layer) => {
              const index = order[layer]!;
              const active = selected === index;
              return (
                <motion.g
                  key={layer}
                  data-strata-layer={layer}
                  role="button"
                  tabIndex={0}
                  aria-label={`Capa 0${layer + 1}: ${pillars[index]!.role}`}
                  aria-pressed={active}
                  onClick={() => selectTurn(layer)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      selectTurn(layer);
                    }
                  }}
                  className="cursor-pointer outline-none"
                  style={{ outline: "none", y: layerYs[layer] }}
                  initial={reduced ? false : { opacity: 0 }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={layerTransition}
                >
                  <g
                    transform={`translate(0 ${layer * 76})`}
                    data-strata-active={active}
                    className="[&_path]:transition-[fill-opacity,stroke-opacity] [&_path]:duration-250 motion-reduce:[&_path]:transition-none"
                  >
                    <StrataPlane
                      layer={layer}
                      active={active}
                      id={id}
                      thickness={thickness}
                      scale={layerScales[layer]!}
                      topSurface={topSurface}
                      surfaceGrid={surfaceGrid}
                      glassBlur={glassBlur}
                    />
                  </g>
                </motion.g>
              );
            })}
          </svg>
          {showContinuityLabel && (
            <span className="product-lab-pill absolute bottom-0 left-[3%] inline-flex items-center gap-2 rounded-full border border-cyan-800/15 bg-white/80 px-3 py-2 text-[10px] dark:border-cyan-300/20 dark:bg-[#06111f]/80">
              <Layers3 size={13} aria-hidden />
              Diseñado para operar con continuidad
            </span>
          )}
        </div>
        <StrataDetails
          model={model}
          reduced={reduced}
          compactLayout={compactLayout}
        />
      </div>
    </>
  );
}

function Orbital() {
  const [selected, setSelected] = useState(1);
  const points = [
    { x: 50, y: 7 },
    { x: 88, y: 72 },
    { x: 12, y: 72 },
  ];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
      <div className="text-primary-light dark:text-primary-dark relative mx-auto aspect-square w-full max-w-[580px]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,109,121,.12),transparent_65%)] dark:bg-[radial-gradient(circle,rgba(0,188,187,.18),transparent_65%)]" />
        <svg
          viewBox="0 0 560 560"
          className="absolute size-full"
          fill="none"
          aria-hidden
        >
          <circle
            cx="280"
            cy="280"
            r="200"
            stroke="currentColor"
            strokeOpacity=".18"
          />
          <circle
            cx="280"
            cy="280"
            r="222"
            stroke="currentColor"
            strokeOpacity=".1"
            strokeDasharray="1 6"
          />
          <circle
            cx="280"
            cy="280"
            r="147"
            stroke="currentColor"
            strokeOpacity=".09"
          />
          <g className="product-orbit">
            <circle
              cx="280"
              cy="280"
              r="200"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="20 1237"
            />
            <circle cx="280" cy="80" r="4" fill="currentColor" />
          </g>
          {[
            { x: 280, y: 56 },
            { x: 484, y: 390 },
            { x: 76, y: 390 },
          ].map((p, i) => (
            <g key={i} opacity={selected === i ? 1 : 0.25}>
              <path
                className="product-draw"
                d={`M${p.x} ${p.y}L280 280`}
                stroke="currentColor"
                pathLength="1"
              />
              <circle
                cx="280"
                cy="280"
                r={83 + i * 12}
                stroke="currentColor"
                strokeOpacity=".18"
              />
            </g>
          ))}
        </svg>
        <div
          className={`${glass} absolute top-[33%] left-[33%] flex size-[34%] items-center justify-center !rounded-full`}
        >
          <Core compact />
        </div>
        {pillars.map((p, i) => (
          <button
            type="button"
            key={p.name}
            onClick={() => setSelected(i)}
            aria-label={`Explorar ${p.role}`}
            aria-pressed={selected === i}
            className={`${focus} ${glass} absolute flex h-[15%] w-[29%] -translate-x-1/2 items-center justify-center ${selected === i ? "!border-primary-light/50 dark:!border-primary-dark/50" : ""}`}
            style={{ left: `${points[i]!.x}%`, top: `${points[i]!.y}%` }}
          >
            <Brand index={i} className="scale-75 sm:scale-100" />
          </button>
        ))}
        <p
          className={`${micro} absolute bottom-[2%] left-0 w-full text-center text-[8px]`}
        >
          Tres especialistas en lo suyo. Un mismo propósito.
        </p>
      </div>
      <div>
        <Heading
          eyebrow="Producto · Un equilibrio que hace posible la respuesta"
          description="La robustez nace de una relación: conocimiento con profundidad, infraestructura que sostiene e ingeniería que los convierte en producto."
        >
          Un producto.
          <br />
          <span className="text-primary-light dark:text-primary-dark">
            Tres fuerzas coordinadas.
          </span>
        </Heading>
        <div
          className="mt-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Explorar las fuerzas del sistema"
        >
          {pillars.map((p, i) => (
            <button
              type="button"
              key={p.name}
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`${focus} rounded-full border px-4 py-2 text-xs transition-colors ${selected === i ? "border-primary-light bg-primary-light dark:border-primary-dark dark:bg-primary-dark text-white dark:text-[#06111f]" : "border-cyan-800/15 text-slate-500 dark:border-cyan-300/15 dark:text-slate-400"}`}
            >
              {p.short}
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Detail index={selected} />
        </div>
        <div className="mt-7 grid gap-3">
          {pillars.map((p, i) => (
            <div key={p.name} className="flex gap-3">
              <span className="bg-primary-light/40 dark:bg-primary-dark/40 mt-1.5 size-1.5 shrink-0 rounded-full" />
              <p className="font-body text-xs leading-5 text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {p.short}.
                </span>{" "}
                {pillars[i]!.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const documentNames = [
  "Guía clínica",
  "Protocolo",
  "Referencia",
  "Evidencia",
  "Criterios",
  "Contexto",
];

function Fragments({
  running,
  reduced,
}: {
  running: boolean;
  reduced: boolean;
}) {
  const [seconds, setSeconds] = useState(0);
  const [manual, setManual] = useState<number | null>(null);
  useEffect(() => {
    if (!running || manual !== null) return;
    let last = performance.now(),
      request = 0,
      total = 0;
    const tick = (now: number) => {
      total += Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      if (total >= 0.1) {
        const delta = total;
        setSeconds((current) => current + delta);
        total = 0;
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [running, manual]);
  const phase = reduced ? 2 : (manual ?? Math.floor((seconds % 18) / 6));
  const partner = [1, 2, 0][phase]!;
  const assembled = phase === 2;
  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
        <Heading description="No basta con reunir documentos. Hace falta un sistema que los estructure, los sostenga y los convierta en conocimiento útil para la consulta.">
          De documentos dispersos
          <br />a una{" "}
          <span className="text-primary-light dark:text-primary-dark">
            respuesta con fundamento.
          </span>
        </Heading>
        <div className="lg:pl-12">
          <p className={micro}>Conocimiento → Infraestructura → Ingeniería</p>
          <p className={`${body} mt-3 text-sm`}>
            La aportación diferencial está en la unión. Cada empresa resuelve
            una parte del sistema para que el conjunto pueda responder con
            confianza.
          </p>
        </div>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_.65fr]">
        <div className="relative min-w-0 overflow-hidden rounded-3xl border border-cyan-800/15 bg-[#f4f9fc] p-5 sm:p-8 dark:border-cyan-300/20 dark:bg-[#071827]">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,109,121,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(0,109,121,.045)_1px,transparent_1px)] bg-[size:36px_36px] dark:opacity-50" />
          <div className="relative flex items-center justify-between border-b border-cyan-800/10 pb-4 dark:border-cyan-300/10">
            <span className={micro}>Materia clínica / Sistema BinPar</span>
            <span className="font-body text-[9px] text-slate-400">
              0{phase + 1} / 03
            </span>
          </div>
          <div className="relative mt-6 grid min-h-[290px] grid-cols-2 items-center gap-4 sm:mt-10 sm:min-h-[310px] sm:grid-cols-[1.1fr_.9fr]">
            <div className="relative grid grid-cols-2 gap-2 px-2 sm:gap-3">
              {documentNames.map((name, i) => (
                <motion.div
                  key={name}
                  initial={false}
                  animate={{
                    rotate: assembled ? 0 : [-7, 5, -3, 6, 4, -5][i],
                    y: assembled ? 0 : [-7, 9, 3, -6, 4, -2][i],
                    opacity: phase === 0 || assembled ? 1 : 0.5,
                  }}
                  transition={{
                    duration: reduced ? 0 : 0.85,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="rounded-lg border border-cyan-800/15 bg-white p-2.5 shadow-[0_6px_14px_-8px_rgba(0,109,121,.3)] sm:p-4 dark:border-cyan-300/15 dark:bg-[#102638]"
                >
                  <FileText
                    size={15}
                    className="text-primary-light dark:text-primary-dark"
                    aria-hidden
                  />
                  <p className="font-body mt-2 text-[8px] font-semibold text-slate-600 sm:text-[10px] dark:text-slate-300">
                    {name}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    <div className="h-px w-full bg-cyan-800/15 dark:bg-cyan-300/20" />
                    <div className="h-px w-3/4 bg-cyan-800/10 dark:bg-cyan-300/10" />
                    <div className="h-px w-1/2 bg-cyan-800/10 dark:bg-cyan-300/10" />
                  </div>
                </motion.div>
              ))}
            </div>
            <div className={`${glass} relative z-10 p-4 sm:p-6`}>
              <Mark className="size-7" />
              <p className="font-display mt-4 text-base font-bold text-[#05215e] sm:text-xl dark:text-white">
                Conocimiento
                <br />
                para decidir.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  "Contexto clínico",
                  "Fuentes identificadas",
                  "Respuesta trazable",
                ].map((s, i) => (
                  <div
                    key={s}
                    className="flex items-center gap-2 border-t border-cyan-800/10 pt-2 dark:border-cyan-300/10"
                  >
                    <Check
                      size={11}
                      className="text-primary-light dark:text-primary-dark shrink-0"
                      aria-hidden
                    />
                    <span
                      className="font-body text-[8px] leading-4 text-slate-500 sm:text-[10px] dark:text-slate-400"
                      style={{ opacity: assembled ? 1 : 0.45 + i * 0.1 }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-cyan-800/10 pt-4 dark:border-cyan-300/10">
            <span className="inline-flex items-center gap-2">
              <span className="bg-primary-light dark:bg-primary-dark size-1.5 rounded-full" />
              <span className="font-body text-[9px] text-slate-500 dark:text-slate-400">
                {
                  [
                    "Estructurar el conocimiento",
                    "Sostener la operación",
                    "Articular la respuesta",
                  ][phase]
                }
              </span>
            </span>
            <span className={micro}>Sinergia</span>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-6">
          <div
            role="group"
            aria-label="Explorar la transformación"
            className="space-y-2"
          >
            {[1, 2, 0].map((index, i) => (
              <button
                key={index}
                type="button"
                onClick={() => setManual(i)}
                aria-pressed={phase === i}
                className={`${focus} flex w-full gap-4 rounded-xl border p-4 text-left transition-colors ${phase === i ? "border-primary-light/35 dark:border-primary-dark/40 bg-cyan-50/60 dark:bg-cyan-900/20" : "border-transparent hover:bg-cyan-50/40 dark:hover:bg-white/5"}`}
              >
                <span className={`${micro} mt-1 opacity-60`}>0{i + 1}</span>
                <div>
                  <Brand index={index} />
                  <p className={`${micro} mt-3 text-[9px]`}>
                    {pillars[index]!.role}
                  </p>
                  <p className="font-body mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {pillars[index]!.summary}
                  </p>
                </div>
              </button>
            ))}
          </div>
          <Detail index={partner} label="Lo que aporta al conjunto" />
          {!reduced && (
            <button
              type="button"
              onClick={() => {
                setManual(null);
                setSeconds(0);
              }}
              className={`${focus} border-primary-light/30 text-primary-light dark:text-primary-dark self-start border-b pb-1 text-xs`}
            >
              Reproducir la transformación{" "}
              <ArrowUpRight className="ml-1 inline" size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function Blueprint() {
  const [selected, setSelected] = useState(0);
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-cyan-800/20 bg-[#eaf4f7] p-6 sm:p-10 lg:p-12 dark:border-cyan-300/20 dark:bg-[#071827]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(0,109,121,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(0,109,121,.055)_1px,transparent_1px)] bg-[size:44px_44px] dark:opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-40 -right-24 size-[550px] rounded-full border-[65px] border-white/25 dark:border-cyan-300/3"
        aria-hidden
      />
      <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-cyan-800/15 pb-5 dark:border-cyan-300/15">
        <span className={micro}>BinPar / Arquitectura de producto</span>
        <span className="text-primary-light dark:text-primary-dark inline-flex items-center gap-2 text-[9px] font-medium">
          <span className="product-status size-1.5 rounded-full bg-current" />
          Tres capacidades coordinadas
        </span>
      </div>
      <div className="relative mt-9 grid items-center gap-8 lg:grid-cols-[1fr_.7fr]">
        <Heading
          eyebrow="Producto · La solidez tiene una estructura"
          description="El producto reúne tres responsabilidades complementarias: cuidar el conocimiento, sostener la operación y gobernar el ciclo de la respuesta."
        >
          Diseñado como un sistema.
          <br />
          <span className="text-primary-light dark:text-primary-dark">
            Sólido en cada conexión.
          </span>
        </Heading>
        <div className="grid grid-cols-3 gap-3 lg:gap-5">
          {[
            { Icon: BookOpen, label: "Conocimiento" },
            { Icon: Cloud, label: "Continuidad" },
            { Icon: ShieldCheck, label: "Trazabilidad" },
          ].map(({ Icon, label }) => (
            <div
              key={label}
              className="border-l border-cyan-800/20 pl-3 dark:border-cyan-300/20"
            >
              <Icon
                size={22}
                strokeWidth={1.3}
                className="text-primary-light dark:text-primary-dark"
                aria-hidden
              />
              <p
                className={`${micro} mt-4 text-[7px] tracking-[.08em] sm:text-[8px] sm:tracking-[.19em]`}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative mt-10 sm:mt-14">
        <svg
          viewBox="0 0 1000 120"
          preserveAspectRatio="none"
          className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-x-0 -top-8 hidden h-20 w-full sm:block"
          fill="none"
          aria-hidden
        >
          <path
            className="product-draw"
            d="M166 115V60H500V10M500 115V10M834 115V60H500"
            stroke="currentColor"
            strokeOpacity=".4"
            pathLength="1"
          />
          <path
            className="product-flow"
            d="M166 115V60H500V10M500 115V10M834 115V60H500"
            stroke="currentColor"
            strokeWidth="2"
            pathLength="100"
            strokeDasharray="5 95"
          />
          <circle cx="500" cy="10" r="3" fill="currentColor" />
        </svg>
        <div
          className="relative grid gap-3 sm:grid-cols-3"
          role="group"
          aria-label="Explorar la arquitectura"
        >
          {pillars.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => setSelected(i)}
              aria-pressed={selected === i}
              className={`${focus} relative overflow-hidden rounded-2xl border bg-white/85 p-5 text-left transition-colors sm:p-6 dark:bg-[#102638]/90 ${selected === i ? "border-primary-light/50 dark:border-primary-dark/50" : "border-cyan-800/15 dark:border-cyan-300/15"}`}
            >
              <span className="font-display text-primary-light/45 dark:text-primary-dark/45 absolute top-4 right-4 text-[9px]">
                0{i + 1}
              </span>
              <Brand index={i} large />
              <p className={`${micro} mt-7 text-[9px]`}>{p.role}</p>
              <p className="font-body mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {p.summary}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-cyan-800/10 pt-3 dark:border-cyan-300/10">
                <span className="font-display text-sm font-semibold text-[#05215e] dark:text-slate-100">
                  {p.proof}
                </span>
                <ArrowUpRight
                  size={15}
                  className="text-primary-light dark:text-primary-dark"
                  aria-hidden
                />
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-7 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <Detail index={selected} />
        <span
          className={`${micro} hidden items-center gap-2 text-[8px] lg:flex`}
        >
          <Network size={15} aria-hidden />
          Sistema integrable · Evaluable · Trazable
        </span>
      </div>
    </div>
  );
}

function Composition({
  direction,
  running,
  reduced,
}: {
  direction: ProductDirection;
  running: boolean;
  reduced: boolean;
}) {
  if (direction === "strata-3")
    return <ProductStrataContent reduced={reduced} running={running} />;
  if (direction === "strata" || direction === "strata-2")
    return (
      <Strata
        reduced={reduced}
        running={running}
        scaleActive={direction !== "strata-2"}
        keyboardEnabled={direction !== "strata-2"}
        showEyebrow={direction === "strata-2"}
        showContinuityLabel={direction === "strata-2"}
        compactLayout={direction !== "strata-2"}
      />
    );
  if (direction === "orbital") return <Orbital />;
  if (direction === "fragments")
    return <Fragments running={running} reduced={reduced} />;
  if (direction === "blueprint") return <Blueprint />;
  return <Convergence />;
}

export function ProductProposal({
  direction,
}: {
  direction: ProductDirection;
}) {
  const { ref, painted, running, reduced } = useEntrance();
  return (
    <section
      ref={ref}
      id="product-preview"
      data-product-direction={direction}
      data-product-painted={painted}
      aria-label="Propuesta de producto"
      className={`product-lab-proposal relative flex min-h-[calc(100svh-var(--lab-toolbar-height,80px)-24px)] [scroll-margin-top:calc(var(--lab-toolbar-height,80px)+24px)] items-center overflow-hidden bg-white px-5 sm:px-10 dark:bg-[#06111f] ${direction === "strata" || direction === "strata-3" ? "py-10 max-lg:items-start lg:py-20" : "py-16 sm:py-20"}`}
      style={
        { "--product-motion": running ? "running" : "paused" } as CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-[#deedf3]/45 to-transparent dark:from-[#030916]/50"
        aria-hidden
      />
      <motion.div
        className="relative mx-auto w-full max-w-7xl"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: painted ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : 0.5 }}
      >
        <Composition
          key={painted ? "painted" : "unpainted"}
          direction={direction}
          running={running}
          reduced={reduced}
        />
      </motion.div>
      <style jsx global>{`
        @media (hover: hover) {
          .product-lab-proposal
            [data-strata-layer]:hover
            [data-strata-active="false"]
            [data-strata-contour] {
            stroke-opacity: 0.45;
          }
          .product-lab-proposal
            [data-strata-layer]:hover
            [data-strata-active="false"]
            [data-strata-tint] {
            fill-opacity: 0.04;
          }
        }
        .product-lab-proposal .product-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: product-lab-draw 1.8s cubic-bezier(0.22, 1, 0.36, 1) both;
          animation-play-state: var(--product-motion, paused);
        }
        .product-lab-proposal .product-flow {
          animation: product-lab-flow 5s linear infinite;
          animation-play-state: var(--product-motion, paused);
        }
        .product-lab-proposal .product-orbit {
          transform-origin: 280px 280px;
          animation: product-lab-orbit 28s linear infinite;
          animation-play-state: var(--product-motion, paused);
        }
        .product-lab-proposal .product-glow {
          animation: product-lab-glow 6s ease-in-out infinite;
          animation-play-state: var(--product-motion, paused);
        }
        .product-lab-proposal .product-status {
          animation: product-lab-glow 3s ease-in-out infinite;
          animation-play-state: var(--product-motion, paused);
        }
        @keyframes product-lab-draw {
          0% {
            stroke-dasharray: 1;
            stroke-dashoffset: 1;
          }
          99.99% {
            stroke-dasharray: 1;
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }
        @keyframes product-lab-flow {
          to {
            stroke-dashoffset: -100;
          }
        }
        @keyframes product-lab-orbit {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes product-lab-glow {
          50% {
            opacity: 0.45;
          }
        }
        .product-lab-proposal[data-product-painted="false"] * {
          animation: none !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .product-lab-proposal * {
            animation: none !important;
            transition: none !important;
          }
          .product-lab-proposal .product-draw {
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
          .product-lab-proposal .product-flow {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

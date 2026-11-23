"use client";

import { useState } from "react";
import { BlogCover } from "~/app/_components/blog-cover";
import { AbstractCover } from "./abstract-cover";
import { CoverIsotype } from "./cover-isotype";
import {
  type BlogImagesDirection,
  type CoverTreatment,
} from "./blog-images-directions";

const samples = [
  "como-medir-la-fiabilidad-de-una-respuesta-clinica",
  "lab-blog-trazabilidad",
  "lab-blog-conocimiento",
  "lab-blog-practica",
  ...Array.from({ length: 8 }, (_, i) => `muestra-placeholder-${i + 5}`),
];
const treatments = [
  "neutral-reference",
  "light",
  "flow",
  "veil",
  "interference",
  "strata",
  "refraction",
  "refined",
  "refined-2",
  "aurora",
  "threshold",
  "nacre",
] as const;
const descriptions = {
  "neutral-reference": {
    label: "Referencia neutra",
    note: "Exactamente la portada original, sustituyendo únicamente el matiz amarillo por azul hielo.",
  },
  "refined-2": {
    label: "Afinada 2",
    note: "El acabado de Afinada en tonos fríos, con entre una y cuatro formas por portada.",
  },
  aurora: {
    label: "Aurora",
    note: "Campos de color continuos, luz envolvente y textura fina.",
  },
  threshold: {
    label: "Umbral",
    note: "Una superficie continua, un borde delicado y espacio central.",
  },
  nacre: {
    label: "Nácar",
    note: "Reflejos suaves y un contraste de tonos más profundo.",
  },
  light: { label: "Luz", note: "Color difuso, profundidad y espacio abierto." },
  flow: {
    label: "Flujo",
    note: "Trazos abiertos sobre un campo de luz. Pasa el cursor o enfoca para animar.",
  },
  veil: {
    label: "Veladuras",
    note: "Planos translúcidos, superposición y textura fina.",
  },
  interference: {
    label: "Interferencia",
    note: "Dos tramas curvas superpuestas: ritmo, densidad y espacio.",
  },
  strata: {
    label: "Estratos",
    note: "Capas de color con sombras cortas y bordes de luz.",
  },
  refraction: {
    label: "Refracción",
    note: "Planos diagonales, contrastes de tono y microtextura.",
  },
  original: {
    label: "Original",
    note: "Portada actual con el isotipo de BinPar. Referencia sin cambios.",
  },
  refined: {
    label: "Afinada",
    note: "Las mismas formas. Curvas continuas, luz más cuidada y grano fino.",
  },
};
const aspects = {
  card: "aspect-[8/5]",
  header: "aspect-[16/7]",
  vertical: "aspect-[4/5]",
} as const;
const input =
  "rounded-full border border-cyan-800/15 bg-white px-3 py-2 text-xs text-slate-600 focus-visible:outline-2 focus-visible:outline-primary-light dark:border-cyan-300/15 dark:bg-[#0a1a2b] dark:text-slate-300";

function Preview({
  slug,
  treatment,
  aspect,
  overlay,
  index,
}: {
  slug: string;
  treatment: CoverTreatment | "original";
  aspect: keyof typeof aspects;
  overlay: boolean;
  index: number;
}) {
  return (
    <figure className="min-w-0">
      <div
        className={`relative isolate overflow-hidden rounded-xl ${aspects[aspect]}`}
        data-cover-preview=""
      >
        {treatment === "original" ? (
          <>
            <BlogCover slug={slug} />
            <CoverIsotype />
          </>
        ) : (
          <AbstractCover slug={slug} treatment={treatment} />
        )}
        {overlay && (
          <div className="pointer-events-none absolute inset-0 flex items-end bg-linear-to-t from-white/95 via-white/30 to-transparent p-5 dark:from-[#06111f]/95 dark:via-[#06111f]/30">
            <p className="font-display max-w-64 text-lg leading-snug font-semibold text-[#05215e] dark:text-slate-50">
              Cómo medir la fiabilidad de una respuesta clínica.
            </p>
          </div>
        )}
      </div>
      <figcaption className="mt-3 flex min-w-0 items-start gap-3 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
        <span className="text-primary-light dark:text-primary-dark shrink-0">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="break-all">{slug}</span>
      </figcaption>
    </figure>
  );
}

export function BlogImagesLab({
  direction,
}: {
  direction: BlogImagesDirection;
}) {
  const [aspect, setAspect] = useState<keyof typeof aspects>("card");
  const [overlay, setOverlay] = useState(false);
  const [customSlug, setCustomSlug] = useState("una-nueva-lectura");
  const rows =
    direction === "new"
      ? (["original", "aurora", "threshold", "nacre"] as const)
      : direction === "compare"
        ? (["original", ...treatments] as const)
        : [direction];
  return (
    <main
      id="blog-images-preview"
      className="font-body relative z-10 min-h-screen bg-[#fbfdff] px-5 py-10 sm:px-10 dark:bg-[#06111f]"
    >
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-cyan-800/10 pb-7 dark:border-cyan-300/10">
          <div className="max-w-xl">
            <p className="font-display text-primary-light dark:text-primary-dark text-[10px] font-bold tracking-[0.22em] uppercase">
              Estudio de portadas · Laboratorio
            </p>
            <h1 className="font-display mt-3 text-3xl font-extrabold tracking-tight text-[#05215e] sm:text-4xl dark:text-slate-50">
              Portadas de marca.
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              La referencia original y todas las propuestas conservadas, con los
              mismos identificadores y el isotipo de BinPar.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              Encuadre
              <select
                aria-label="Encuadre de portada"
                value={aspect}
                onChange={(event) =>
                  setAspect(event.target.value as keyof typeof aspects)
                }
                className={input}
              >
                <option value="card">Ficha · 8:5</option>
                <option value="header">Cabecera · 16:7</option>
                <option value="vertical">Vertical · 4:5</option>
              </select>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <input
                type="checkbox"
                checked={overlay}
                onChange={(event) => setOverlay(event.target.checked)}
                className="size-4 accent-[#006d79] dark:accent-[#00bcbb]"
              />
              Probar con título
            </label>
          </div>
        </div>
        <div className="space-y-10 py-8">
          {rows.map((treatment) => (
            <section key={treatment} aria-label={descriptions[treatment].label}>
              <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h2 className="font-display text-base font-semibold text-[#05215e] dark:text-slate-100">
                  {descriptions[treatment].label}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {descriptions[treatment].note}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
                {(direction === "compare" || direction === "new"
                  ? samples.slice(0, 4)
                  : samples
                ).map((slug, index) => (
                  <Preview
                    key={slug}
                    slug={slug}
                    index={index}
                    treatment={treatment}
                    aspect={aspect}
                    overlay={overlay}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
        <section
          aria-labelledby="custom-cover-title"
          className="mt-4 border-t border-cyan-800/10 pt-8 pb-10 dark:border-cyan-300/10"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2
                id="custom-cover-title"
                className="font-display text-lg font-semibold text-[#05215e] dark:text-slate-100"
              >
                Prueba otro identificador
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                El mismo identificador conserva su composición en todos los
                encuadres.
              </p>
            </div>
            <label className="flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
              Identificador del artículo
              <input
                maxLength={200}
                value={customSlug}
                onChange={(event) => setCustomSlug(event.target.value)}
                className={`${input} w-64 max-w-full`}
              />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {treatments.map((treatment, index) => (
              <div key={treatment}>
                <p className="text-primary-light dark:text-primary-dark mb-3 text-xs font-semibold">
                  {descriptions[treatment].label}
                </p>
                <Preview
                  slug={customSlug}
                  treatment={treatment}
                  aspect={aspect}
                  overlay={overlay}
                  index={index}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

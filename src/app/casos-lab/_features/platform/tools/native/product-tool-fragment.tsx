"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BookOpenIcon,
  FileQuestionIcon,
  FileScanIcon,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import {
  initialAnswer,
  initialReferences,
} from "../../preview/preview-consultation-content";
import { initialCitation, renalContext } from "../../preview/preview-data";
import {
  CitationBibliography,
  CitationClaim,
  CitationMarker,
  CitationQuote,
  CitationUnit,
  DocumentState,
  HighlightStatus,
  SourceLocation,
  TextProvenanceStatus,
} from "./product-fragments";
import { Badge } from "./product-runtime";
import type { EvidenceToolId } from "../tools-data";

const paragraph = initialAnswer.split("\n\n")[0]!.replace(/\s*\[\d+\]/g, "");
const quote = renalContext.progression;
const catalogQuote = renalContext.diabetes;
const sourceTitle = "Manual ProMIR · Nefrología";
const labelClass =
  "font-display text-xs font-bold uppercase tracking-[0.22em] text-primary-light dark:text-primary-dark";
const buttonClass =
  "font-body inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-light disabled:pointer-events-none disabled:opacity-50 motion-reduce:transform-none dark:focus-visible:outline-primary-dark [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[1.8] text-slate-600 hover:bg-primary-light/10 hover:text-primary-light dark:text-slate-300 dark:hover:bg-primary-dark/10 dark:hover:text-cyan-100 size-7 rounded-full";

function AnswerFragment({
  bibliography = false,
  compact = false,
}: {
  bibliography?: boolean;
  compact?: boolean;
}) {
  return (
    <div className="font-body text-base leading-7 text-slate-700 dark:text-slate-300">
      <p className="my-2 leading-7 whitespace-pre-wrap first:mt-0 last:mb-0">
        {compact
          ? bibliography
            ? catalogQuote
            : paragraph.split(". ")[0] + "."
          : paragraph}{" "}
        <CitationMarker anchor="c62888" referenceIndex={0} format="numbered">
          [1]
        </CitationMarker>{" "}
        {!compact && (
          <CitationMarker anchor="c7b8ef" referenceIndex={0} format="numbered">
            [2]
          </CitationMarker>
        )}
      </p>
      {bibliography ? (
        <CitationBibliography
          entries={initialReferences
            .slice(0, compact ? 3 : 4)
            .map((item, index) => ({
              sourceKey: item.anchor,
              number: index + 1,
              text: item.title,
              references: [{ anchor: item.anchor, referenceIndex: 0 }],
            }))}
        />
      ) : (
        <>
          <p className="my-2 leading-7 whitespace-pre-wrap first:mt-0 last:mb-0">
            <mark className="bg-primary-light/12 dark:bg-primary-dark/18 rounded-[0.2rem] box-decoration-clone px-0.5 text-inherit">
              {compact ? catalogQuote : quote}
            </mark>{" "}
            <CitationMarker
              anchor="c7b8ef"
              referenceIndex={0}
              format="numbered"
            >
              [2]
            </CitationMarker>
          </p>
          {!compact && (
            <div className="mt-5">
              <CitationClaim target={{ claimText: quote }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PreservedFragment({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <CitationUnit
        unit={{
          availability: "available",
          basis: "historical_snapshot",
          content: compact ? catalogQuote : quote,
        }}
        anchor={initialCitation.anchor}
        expert={{ slug: "nefrología", version: 3 }}
      />
      <DocumentState
        tone="unavailable"
        icon={<FileQuestionIcon aria-hidden="true" />}
        eyebrow="Documento no disponible"
        title={sourceTitle}
        description="El documento se retiró del corpus. La respuesta conserva el texto que citó."
      />
    </div>
  );
}

function ProvenanceFragment({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <section>
        <div className="flex items-start gap-3">
          <span className="border-primary-light/20 bg-primary-light/10 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark-lighter mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border">
            <BookOpenIcon
              className="size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>
          <div className="min-w-0 flex-1">
            <p className={labelClass}>Procedencia documental</p>
            <h3 className="font-display text-heading-navy mt-1 text-lg leading-6 font-semibold dark:text-slate-50">
              {sourceTitle}
            </h3>
            <p className="font-body mt-1 text-sm leading-5 font-semibold text-slate-700 dark:text-slate-200">
              Insuficiencia renal crónica
            </p>
            <p className="font-body mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Apartado: {compact ? "Etiología" : "Progresión de la ERC"}
            </p>
            <p className="font-body mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Editorial Médica Panamericana
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>Respalda</Badge>
            </div>
          </div>
        </div>
      </section>
      {!compact && (
        <SourceLocation
          source={{ chapterTitle: "Insuficiencia renal crónica" }}
          locator={{ section: "Progresión de la ERC" }}
        />
      )}
      <CitationQuote
        quote={compact ? catalogQuote : quote}
        relation="supports"
        priorToUpdate={false}
      />
    </div>
  );
}

function UpdatesFragment({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-5">
      <p className="font-body bg-primary-light/5 dark:bg-primary-dark/5 shrink-0 border-b border-cyan-800/15 px-4 py-2 text-xs leading-5 text-slate-700 dark:border-cyan-300/20 dark:text-slate-200">
        Anterior a la actualización: una fuente posterior actualizó parte de
        esta unidad, así que este pasaje puede recoger un dato ya sustituido.
      </p>
      <CitationUnit
        unit={{
          availability: "available",
          basis: "historical_snapshot",
          content: compact ? catalogQuote : quote,
        }}
        anchor={initialCitation.anchor}
        expert={{ slug: "nefrología", version: 3 }}
      />
      {!compact && (
        <CitationQuote quote={quote} relation="supports" priorToUpdate />
      )}
    </div>
  );
}

function PdfFragment({
  verified,
  compact = false,
}: {
  verified: boolean;
  compact?: boolean;
}) {
  const documentViewport = useRef<HTMLDivElement>(null);
  const selectedPassage = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    if (!compact) return;
    const viewport = documentViewport.current;
    const passage = selectedPassage.current;
    if (!viewport || !passage) return;
    const centerPassage = () => {
      viewport.scrollTop = Math.max(
        0,
        passage.offsetTop - (viewport.clientHeight - passage.offsetHeight) / 2,
      );
    };
    centerPassage();
    const observer = new ResizeObserver(centerPassage);
    observer.observe(viewport);
    observer.observe(passage);
    return () => observer.disconnect();
  }, [compact]);
  return (
    <section
      className="flex min-h-0 flex-1 flex-col"
      data-pdf-source-document=""
    >
      <header className="dark:bg-surface-dark flex shrink-0 items-start gap-3 border-b border-cyan-800/15 bg-white px-4 py-3 dark:border-cyan-300/15">
        <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark-lighter grid size-8 shrink-0 place-items-center rounded-lg">
          <FileScanIcon
            className="size-4"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className={labelClass}>Fuente original</p>
          <h3 className="font-display text-heading-navy mt-0.5 truncate text-sm font-semibold dark:text-slate-100">
            Soporte vital avanzado en el niño (2026)
          </h3>
          <p className="font-body mt-0.5 text-[10px] text-slate-600 dark:text-slate-400">
            PDF · 1 página
          </p>
        </div>
        {verified ? (
          <TextProvenanceStatus
            kind="verified"
            label="Texto verificado"
            description="La cita coincide en orden y contexto con un pasaje de la capa de texto del PDF original."
          />
        ) : (
          <HighlightStatus
            kind="literal"
            label="Coincidencia literal"
            description="La caja procede de una coincidencia exacta en la capa de texto del PDF."
          />
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="shadow-big-blocks dark:bg-surface-dark/70 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-cyan-800/15 bg-white/80 backdrop-blur-sm dark:border-cyan-300/15 dark:shadow-[0_0_18px_rgb(83_234_253/8%)]">
          <div className="relative flex min-h-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-800/10 px-3 py-2 dark:border-cyan-300/10">
              <span className="font-body min-w-22 text-center text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
                Página 1 de 1
              </span>
              <div className="flex items-center gap-1">
                <button type="button" className={buttonClass} disabled>
                  <MinusIcon className="size-3.5" strokeWidth={1.8} />
                </button>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value="1"
                  readOnly
                  className="focus-visible:ring-primary-light/60 dark:focus-visible:ring-primary-dark/60 [&::-webkit-slider-thumb]:bg-primary-light dark:[&::-webkit-slider-thumb]:bg-primary-dark [&::-moz-range-thumb]:bg-primary-light dark:[&::-moz-range-thumb]:bg-primary-dark h-7 w-24 cursor-pointer appearance-none rounded-full bg-transparent focus-visible:ring-2 focus-visible:outline-none sm:w-28 [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-cyan-800/15 dark:[&::-moz-range-track]:bg-cyan-300/20 [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-cyan-800/15 dark:[&::-webkit-slider-runnable-track]:bg-cyan-300/20 [&::-webkit-slider-thumb]:-mt-[3px] [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow"
                />
                <button type="button" className={buttonClass}>
                  <PlusIcon className="size-3.5" strokeWidth={1.8} />
                </button>
                <span className="font-body w-10 text-center text-[11px] text-slate-600 tabular-nums dark:text-slate-400">
                  100%
                </span>
              </div>
            </div>
            <div
              ref={documentViewport}
              className="relative min-h-0 flex-1 overflow-hidden"
            >
              <div className="shadow-big-blocks relative w-full shrink-0 overflow-hidden bg-white dark:shadow-[0_0_18px_rgb(83_234_253/8%)]">
                <Image
                  src="/lab/platform-tools/sva-p1.jpg"
                  width={1312}
                  height={1920}
                  className="block size-full bg-white object-contain"
                  alt=""
                  unoptimized
                />
                <span
                  ref={selectedPassage}
                  className="border-primary-light bg-primary-light/12 dark:border-primary-dark dark:bg-primary-dark/18 pointer-events-none absolute border-2 shadow-[0_0_0_1px_rgb(0_109_121/12%)]"
                  style={{
                    left: "44%",
                    top: "12.4%",
                    width: "20%",
                    height: "4.2%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Catalogue scenes select a complete example and fit it as a single native-size composition. */
export function ProductToolFragment({
  tool,
  appearance,
}: {
  tool: EvidenceToolId;
  appearance?: "catalog";
}) {
  const container = useRef<HTMLDivElement>(null);
  const composition = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [nativeHeight, setNativeHeight] = useState<number>();
  const [nativeWidth, setNativeWidth] = useState<number>();
  const compact = appearance === "catalog";
  const pdf = tool === "viewer" || tool === "verified";
  const surface =
    appearance === "catalog"
      ? tool === "citations" || tool === "bibliography"
        ? "chat"
        : "source"
      : undefined;
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const measure = () => {
      const widthScale = element.clientWidth / 560;
      if (!widthScale) return;
      const contentHeight = composition.current?.offsetHeight ?? 0;
      const nextScale =
        compact && !pdf && contentHeight > 0
          ? Math.min(widthScale, element.clientHeight / contentHeight)
          : widthScale;
      setScale(nextScale);
      setNativeHeight(compact ? element.clientHeight / nextScale : undefined);
      setNativeWidth(compact ? element.clientWidth / nextScale : undefined);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (compact && !pdf && composition.current)
      observer.observe(composition.current);
    return () => observer.disconnect();
  }, [compact, pdf, tool]);
  return (
    <div
      ref={container}
      className="vfp-product-viewport"
      data-product-surface={surface}
      role="img"
      aria-label={`Fragmento de la interfaz de BinPar: ${tool}`}
    >
      <div
        className="vfp-product-native"
        data-product-surface={surface}
        aria-hidden="true"
        inert
        style={{
          transform: `scale(${scale})`,
          height: nativeHeight,
          width: nativeWidth,
        }}
      >
        <div
          ref={composition}
          className={
            tool === "viewer" || tool === "verified"
              ? "vfp-product-content flex h-full min-h-0 flex-col"
              : "vfp-product-content space-y-5 px-4 py-5 sm:px-5"
          }
        >
          {tool === "citations" ? (
            <AnswerFragment compact={compact} />
          ) : tool === "bibliography" ? (
            <AnswerFragment bibliography compact={compact} />
          ) : tool === "preserved" ? (
            <PreservedFragment compact={compact} />
          ) : tool === "provenance" ? (
            <ProvenanceFragment compact={compact} />
          ) : tool === "updates" ? (
            <UpdatesFragment compact={compact} />
          ) : (
            <PdfFragment verified={tool === "verified"} compact={compact} />
          )}
        </div>
      </div>
    </div>
  );
}

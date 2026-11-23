"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  BookOpenIcon,
  FileTextIcon,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  XIcon,
} from "lucide-react";
import {
  ProcessChatVeil,
  processMotion,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import {
  CitationQuote,
  CitationUnit,
  SourceLocation,
} from "./product-fragments";
import { Badge } from "./product-runtime";
import { PdfFragment } from "./product-tool-fragment";
import type { EvidenceToolId } from "../tools-data";
import {
  CatalogSceneComposer,
  CatalogSceneHeader,
  catalogSceneDuration,
  useCatalogSceneMotion,
} from "./catalog-scene-motion";

// One consultation and one source across all seven scenes. Presentation classes
// below come from CitationViewer, PdfFrame and ChatMarkdown in the product.
const documentTitle = "Soporte vital avanzado en el niño (2026)";
const passage = "No responde a estímulos. Respiración ausente o anormal.";
const anchor = "c62888";
const source = {
  number: 1,
  sourceKey: "sva-2026",
  text: `${documentTitle}. Gerencia Asistencial de Atención Primaria. Página 1.`,
  references: [{ anchor, referenceIndex: 0 }],
};
const eyebrow =
  "font-display text-xs font-bold uppercase tracking-[0.22em] text-primary-light dark:text-primary-dark";
const citationAnswer =
  "La valoración inicial del protocolo parte de la ausencia de respuesta y de una respiración ausente o anormal.";
const citationBibliographyAt =
  0.15 + typingDuration(citationAnswer.length) + 0.2;
const citationPointerAt = citationBibliographyAt + 0.65;
const citationApproachAt = citationPointerAt + 0.15;
const citationClickAt = citationApproachAt + 0.7;
const citationPanelAt = citationClickAt + 0.2;
const citationDocumentAt = citationPanelAt + 0.45;
const citationHighlightAt = citationDocumentAt + 0.3;

function SourcePanel({ children }: { children: ReactNode }) {
  return (
    <div className="vfp-scene-source-panel">
      <div className="vfp-source-tabs bg-rail-light/30 dark:bg-canvas-dark/45 flex shrink-0 border-b">
        <div className="min-w-0 flex-1 pt-1 pr-1 pl-2">
          <div className="flex h-10 w-full items-start gap-1">
            <div
              data-active="true"
              className="vfp-source-tab text-heading-navy dark:bg-surface-dark relative isolate z-10 -mb-px flex h-10 max-w-56 min-w-20 flex-[1_1_14rem] items-center rounded-t-md border border-b-0 bg-white shadow-[0_-4px_14px_rgb(0_109_121/4%)] dark:text-slate-50"
            >
              <span className="flex h-full min-w-0 flex-1 items-center gap-1.5 pr-7 pl-2.5">
                <FileTextIcon
                  className="-mt-1.25 size-3.5 shrink-0"
                  strokeWidth={1.8}
                />
                <span className="font-body -mt-1.25 min-w-0 flex-1 truncate text-[11px] font-semibold">
                  {documentTitle}
                </span>
              </span>
              <span className="absolute right-1 -mt-1.25 grid size-6 place-items-center rounded-full text-slate-500 dark:text-slate-400">
                <XIcon className="size-3.5" strokeWidth={1.8} />
              </span>
            </div>
          </div>
        </div>
        <span className="mr-2 flex shrink-0 items-center justify-center">
          <XIcon
            className="size-4 text-slate-600 dark:text-slate-300"
            strokeWidth={1.8}
          />
        </span>
      </div>
      <div className="vfp-scene-source-body">{children}</div>
    </div>
  );
}

function AnswerScene({
  bibliography,
  seconds,
  reduced,
}: {
  bibliography: boolean;
  seconds: number;
  reduced: boolean;
}) {
  const sentence = bibliography
    ? "El protocolo reúne la valoración inicial y las fuentes utilizadas."
    : citationAnswer;
  const written = writtenCharacters(seconds, 0.15, sentence.length, reduced);
  const bibliographyAt = 0.15 + typingDuration(sentence.length) + 0.2;
  const selected = bibliography
    ? 0
    : sceneReveal(seconds, citationClickAt, 0.25, reduced);
  const entries = bibliography
    ? [
        source,
        {
          ...source,
          number: 2,
          sourceKey: "erc-guidelines",
          text: "European Resuscitation Council Guidelines 2025. Paediatric Life Support.",
        },
        {
          ...source,
          number: 3,
          sourceKey: "aha-guidelines",
          text: "2025 American Heart Association Guidelines. Pediatric Advanced Life Support.",
        },
      ]
    : [source];
  return (
    <>
      <ProcessChatVeil />
      <CatalogSceneHeader />
      <div className="vfp-scene-chat-body font-body text-[13px] leading-[22px] text-slate-600 dark:text-slate-300">
        <p className="mb-3">
          {sentence.slice(0, written)}{" "}
          {written === sentence.length ? (
            <span
              data-catalog-citation=""
              className="text-primary-light dark:text-primary-dark relative inline-flex rounded-sm px-0.5 align-super text-[10px] leading-none font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, currentColor ${selected * 15}%, transparent)`,
              }}
            >
              [1]
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="bg-primary-light dark:bg-primary-dark ml-0.5 inline-block h-3.5 w-px align-middle"
            />
          )}
        </p>
        <section
          className="dark:border-primary-dark/15 mt-3 border-t border-cyan-800/15 pt-3 pb-2"
          style={{
            opacity: sceneReveal(seconds, bibliographyAt, 0.35, reduced),
          }}
        >
          <p className="font-display text-primary-light dark:text-primary-dark text-[11px] font-bold tracking-[0.16em] uppercase">
            Bibliografía
          </p>
          <ol className="mt-3 space-y-2">
            {entries.map((entry, index) => (
              <li
                key={entry.sourceKey}
                className="flex items-start gap-2.5"
                style={{
                  opacity: sceneReveal(
                    seconds,
                    bibliographyAt + 0.1 + index * 0.06,
                    0.3,
                    reduced,
                  ),
                }}
              >
                <span className="font-display border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark grid size-6 shrink-0 place-items-center rounded-md border text-[10px] font-semibold">
                  {entry.number}
                </span>
                <span
                  className="min-w-0 flex-1 truncate pt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-400"
                  title={entry.text}
                >
                  {entry.text}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
      <CatalogSceneComposer />
    </>
  );
}

function CitationWorkspace({
  seconds,
  reduced,
}: {
  seconds: number;
  reduced: boolean;
}) {
  const panel = sceneReveal(seconds, citationPanelAt, 0.65, reduced);
  return (
    <div
      className="vfp-citation-workspace"
      style={{ "--vfp-citation-panel": panel } as CSSProperties}
    >
      <div className="vfp-citation-chat">
        <AnswerScene bibliography={false} seconds={seconds} reduced={reduced} />
      </div>
      <div
        className="vfp-citation-source-slot"
        style={{
          opacity: sceneReveal(seconds, citationPanelAt, 0.25, reduced),
        }}
      >
        <SourcePanel>
          <PdfFragment verified={false} compact />
        </SourcePanel>
      </div>
    </div>
  );
}

function PreservedScene() {
  return (
    <div className="vfp-scene-panel-inset">
      <CitationUnit
        unit={{
          availability: "available",
          basis: "historical_snapshot",
          content: passage,
        }}
        anchor={anchor}
        expert={{ slug: "pediatría", version: 3 }}
      />
    </div>
  );
}

function ProvenanceScene() {
  return (
    <div className="vfp-scene-panel-inset">
      <section>
        <div className="flex items-start gap-3">
          <span className="border-primary-light/20 bg-primary-light/10 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark-lighter mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border">
            <BookOpenIcon className="size-5" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className={eyebrow}>Procedencia documental</p>
            <h3 className="font-display text-heading-navy mt-1 text-lg leading-6 font-semibold dark:text-slate-50">
              {documentTitle}
            </h3>
            <p className="font-body mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Gerencia Asistencial de Atención Primaria · 2026
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge>Respalda</Badge>
            </div>
          </div>
        </div>
      </section>
      <div className="mt-5">
        <SourceLocation source={{}} locator={{ page: 1 }} />
      </div>
    </div>
  );
}

function UpdateScene() {
  return (
    <div className="vfp-scene-panel-inset">
      <p
        data-scene-update-notice=""
        className="font-body bg-primary-light/5 dark:bg-primary-dark/5 shrink-0 border-b border-cyan-800/15 px-4 py-2 text-xs leading-5 text-slate-700 dark:border-cyan-300/20 dark:text-slate-200"
      >
        Anterior a la actualización: una fuente posterior actualizó parte de
        esta unidad, así que este pasaje puede recoger un dato ya sustituido.
      </p>
      <div className="mt-5">
        <CitationQuote quote={passage} relation="supports" priorToUpdate />
      </div>
    </div>
  );
}

const labels: Record<EvidenceToolId, string> = {
  citations:
    "Una afirmación de la respuesta enlazada con su fuente documental.",
  bibliography:
    "Las referencias documentales agrupadas al final de la misma respuesta.",
  preserved: "El pasaje original conservado con la respuesta.",
  viewer: "El documento original abierto en el pasaje citado.",
  verified:
    "El indicador de texto verificado junto al mismo documento original.",
  provenance:
    "La identidad y la página del documento que respalda la afirmación.",
  updates: "El aviso que identifica un pasaje anterior a una actualización.",
};

/** One frame, one native scale and one source document for the catalogue. */
export function CatalogProductScene({ tool }: { tool: EvidenceToolId }) {
  const viewport = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [citationPoint, setCitationPoint] = useState({ x: 380, y: 110 });
  const motion = useCatalogSceneMotion(viewport);
  const citationReady =
    motion.reduced || motion.seconds >= citationBibliographyAt - 0.2;
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () =>
      setScale(Math.min(element.clientWidth / 560, element.clientHeight / 360));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useLayoutEffect(() => {
    if (tool !== "citations" || !citationReady) return;
    const root = scene.current;
    const citation = root?.querySelector<HTMLElement>(
      "[data-catalog-citation]",
    );
    if (!root || !citation) return;
    const measure = () => {
      const a = root.getBoundingClientRect();
      const b = citation.getBoundingClientRect();
      setCitationPoint({
        x: (b.left - a.left) / scale + 4,
        y: (b.top - a.top) / scale + 4,
      });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(citation);
    return () => observer.disconnect();
  }, [tool, scale, citationReady]);
  const chat = tool === "citations" || tool === "bibliography";
  const pointerVisible =
    tool === "citations" && !motion.reduced
      ? sceneReveal(motion.seconds, citationPointerAt, 0.25, false) *
        (1 - sceneReveal(motion.seconds, citationClickAt + 0.25, 0.25, false))
      : 0;
  const pointerApproach = sceneReveal(
    motion.seconds,
    citationApproachAt,
    0.7,
    motion.reduced,
  );
  return (
    <figure className="vfp-scene-figure">
      <div
        ref={viewport}
        className="vfp-product-viewport vfp-catalog-scene"
        role="img"
        aria-label={labels[tool]}
        data-scene-tool={tool}
        data-playing={motion.running}
      >
        <div
          ref={scene}
          className="vfp-product-native vfp-catalog-scene-native"
          data-product-surface={chat ? "chat" : "source"}
          aria-hidden="true"
          inert
          style={
            {
              transform: `translate(-50%, -50%) scale(${scale})`,
              "--vfp-scene-content": sceneReveal(
                motion.seconds,
                tool === "citations" ? citationDocumentAt : 0.2,
                0.35,
                motion.reduced,
              ),
              "--vfp-scene-detail": sceneReveal(
                motion.seconds,
                1.4,
                processMotion.draw,
                motion.reduced,
              ),
              "--vfp-scene-highlight": sceneReveal(
                motion.seconds,
                tool === "citations" ? citationHighlightAt : 2,
                0.4,
                motion.reduced,
              ),
            } as CSSProperties
          }
        >
          {tool === "citations" ? (
            <CitationWorkspace
              seconds={motion.seconds}
              reduced={motion.reduced}
            />
          ) : chat ? (
            <AnswerScene
              bibliography={tool === "bibliography"}
              seconds={motion.seconds}
              reduced={motion.reduced}
            />
          ) : (
            <SourcePanel>
              {tool === "preserved" ? (
                <PreservedScene />
              ) : tool === "provenance" ? (
                <ProvenanceScene />
              ) : tool === "updates" ? (
                <UpdateScene />
              ) : (
                <PdfFragment verified={tool === "verified"} compact />
              )}
            </SourcePanel>
          )}
          {tool === "citations" && (
            <MousePointer2
              size={28}
              strokeWidth={1.8}
              className="vfp-scene-pointer text-primary-light dark:text-primary-dark pointer-events-none absolute top-0 left-0 z-20 fill-white dark:fill-[#152230]"
              style={{
                opacity: pointerVisible,
                transform: `translate(${citationPoint.x - 35 * (1 - pointerApproach)}px,${citationPoint.y + 35 * (1 - pointerApproach)}px)`,
              }}
            />
          )}
        </div>
      </div>
      <figcaption className="vfp-scene-playback font-body">
        <span>{motion.complete ? "Ejemplo de uso" : "Secuencia de uso"}</span>
        <span className="vfp-scene-progress" aria-hidden="true">
          <span
            style={{
              transform: `scaleX(${Math.min(1, motion.seconds / catalogSceneDuration)})`,
            }}
          />
        </span>
        {!motion.reduced && (
          <div>
            <button
              type="button"
              onClick={motion.toggle}
              disabled={motion.complete}
              aria-label={`${motion.paused ? "Reproducir" : "Pausar"}: ${labels[tool]}`}
              title={motion.paused ? "Reproducir" : "Pausar"}
            >
              {motion.paused ? (
                <Play size={14} strokeWidth={1.8} />
              ) : (
                <Pause size={14} strokeWidth={1.8} />
              )}
            </button>
            <button
              type="button"
              onClick={motion.replay}
              aria-label={`Repetir: ${labels[tool]}`}
              title="Repetir escena"
            >
              <RotateCcw size={14} strokeWidth={1.8} />
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  );
}

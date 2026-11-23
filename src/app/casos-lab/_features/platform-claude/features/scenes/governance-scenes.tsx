"use client";

import {
  ArrowUp,
  Clock3,
  Layers3,
  Bot,
  Building2,
  ChevronDown,
  Check,
  FileX2,
  GitCommitVertical,
  Layers,
  Lock,
  Paperclip,
  Plus,
  Star,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  FlowDot,
  Mark,
  ProcessChatVeil,
  PulseLayer,
  drawProgress,
  processBorderClass,
  processCardClass,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import type { GovernanceFeatureId } from "../features-data";
import { Pointer, centre, pointerStyle } from "./consultation-scenes";
import {
  PlatformButton,
  PlatformDialog,
  PlatformField,
  ResponseActions,
} from "./platform-ui";
import {
  Answer,
  Caret,
  ChatHeader,
  Connector,
  DOT_GAP,
  DOT_TRANSIT,
  SceneCard,
  bodyText,
  claimParagraph,
  curvePath,
  curvePoint,
  eyebrow,
  useBoxes,
  verticalCurve,
  type SceneDefinition,
  type SceneProps,
} from "./evidence-scenes";

/*
 * «Gobierno institucional» scenes. An illustrative organization, «Área
 * Sanitaria Norte», adds its own protocols to the common base and governs the
 * corpus behind the consultations of the other groups. UI strings come from
 * the editor (messages/es: library, ingestion, benchmarkSuites, chatbots).
 */

const organization = "Área Sanitaria Norte";

const enter = (value: number, distance = 8): CSSProperties => ({
  opacity: value,
  transform: `translateY(${distance * (1 - value)}px)`,
});
const press = (time: number, at: number) => {
  const t = (time - at) / 0.35;
  return t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;
};
const pulseAt = (time: number, at: number, reduced: boolean, length = 1) =>
  !reduced && time >= at && time < at + length ? pulseProgress(time, at, 1) : 0;

function Typed({ text, written }: { text: string; written: number }) {
  return (
    <>
      {text.slice(0, written)}
      {written > 0 && written < text.length && <Caret />}
    </>
  );
}

function PanelHeading({
  label,
  title,
  aside,
  style,
}: {
  label: string;
  title: string;
  aside?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div className="flex items-start justify-between gap-3" style={style}>
      <div className="min-w-0">
        <p className={eyebrow}>{label}</p>
        <h3 className="font-display text-navy mt-1.5 truncate text-lg font-semibold tracking-tight dark:text-slate-50">
          {title}
        </h3>
      </div>
      {aside}
    </div>
  );
}

/* 29 · Corpus por organización: own protocols over the common base. */
const CORPUS_BASE = 0.5;
const CORPUS_OWN = 2.2;
const corpusDone = CORPUS_OWN + 0.5 + 0.5 + 2 * DOT_GAP + DOT_TRANSIT;

function CorpusScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(3);
  const curves =
    boxes.length === 3
      ? [
          verticalCurve(boxes[0]!, boxes[1]!),
          verticalCurve(boxes[0]!, boxes[2]!),
        ]
      : [];
  const done = reduced || time >= corpusDone;
  const starts = [CORPUS_BASE, CORPUS_OWN];
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-between px-6 pt-7 pb-5"
    >
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {curves.map((curve, index) => {
          const drawAt = starts[index]! + 0.5;
          return (
            <g key={index}>
              <Connector
                d={curvePath(curve)}
                active={index === 1}
                draw={drawProgress(time, drawAt, 0.5, reduced)}
              />
              {!reduced &&
                [0, 1, 2].map((dot) => {
                  // Upwards: from the corpus layer to the committee.
                  const t =
                    1 - (time - drawAt - 0.5 - dot * DOT_GAP) / DOT_TRANSIT;
                  if (t <= 0 || t >= 1) return null;
                  return <FlowDot key={dot} {...curvePoint(curve, t)} />;
                })}
            </g>
          );
        })}
      </svg>
      <div
        className="flex justify-center"
        style={enter(sceneReveal(time, 0.2, 0.35, reduced))}
      >
        <div
          ref={target(0)}
          className={`${processBorderClass(done)} relative flex h-[58px] w-fit min-w-[236px] items-center gap-3 rounded-2xl border bg-white/95 pr-5 pl-4 shadow-[0_8px_24px_rgba(0,109,121,0.10)] dark:bg-[#152230]`}
        >
          <PulseLayer value={pulseAt(time, corpusDone, reduced)} />
          <Mark className="relative size-7" />
          <div className="relative min-w-0">
            <p className="font-display text-navy text-sm font-semibold whitespace-nowrap dark:text-slate-50">
              Comité de {organization}
            </p>
            <p className="font-body text-xs leading-5 whitespace-nowrap text-slate-500 dark:text-slate-400">
              {done ? "430 documentos consultables" : "Base común heredada"}
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-2 gap-4">
          <div ref={target(1)}>
            <SceneCard
              icon={Layers}
              label="Base común"
              title="412 documentos"
              dashed
              style={enter(sceneReveal(time, CORPUS_BASE, 0.35, reduced))}
            >
              <p className="font-body mt-2 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
                Heredada por todas las organizaciones.
              </p>
            </SceneCard>
          </div>
          <div ref={target(2)}>
            <SceneCard
              icon={Building2}
              label="Del área"
              title="18 documentos"
              active
              pulse={pulseAt(time, CORPUS_OWN + 0.3, reduced)}
              style={enter(sceneReveal(time, CORPUS_OWN, 0.35, reduced))}
            >
              <p className="font-body mt-2 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
                Solo visibles para el área.
              </p>
            </SceneCard>
          </div>
        </div>
        <p
          className="font-body mt-3 text-center text-[10px] leading-4 text-slate-500 dark:text-slate-400"
          style={{
            opacity: sceneReveal(time, CORPUS_BASE + 0.3, 0.3, reduced),
          }}
        >
          Los marcados con borde discontinuo se heredan de un nodo superior.
        </p>
      </div>
    </div>
  );
}

/*
 * 30 · Biblioteca de documentos: the editor's library (library-card,
 * library-cover). Each document is an A4 cover with its type stripe, its
 * title, publisher and year, the approval date, the node chip (dashed when
 * inherited) and the experts it feeds.
 */
const libraryTabs = ["Todos", "Guía", "Protocolo", "Libro", "Del centro"];
const libraryDocs = [
  {
    title: "Protocolo de analgesia del área",
    publisher: organization,
    meta: "Área Sanitaria Norte · 2026",
    date: "Aprobado el 3 nov. 2026",
    node: organization,
    inherited: false,
    stripe: "#00a7a6",
    experts: ["FA", "NE"],
  },
  {
    title: "Manual ProMIR · Nefrología",
    publisher: "ProMIR",
    meta: "ProMIR · 2025",
    date: "Aprobado el 12 sept. 2026",
    node: "Base común",
    inherited: true,
    stripe: "#62748e",
    experts: ["CA", "FA", "NE"],
  },
] as const;
const LIBRARY_DOCS = 0.5;

function LibraryScene({ time, reduced }: SceneProps) {
  return (
    <div className="relative flex h-full flex-col bg-[#f7fbfd] px-5 pt-4 dark:bg-[#0b1a29]">
      <PanelHeading
        label="Corpus"
        title="Biblioteca"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
        aside={
          <span className="font-body mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            430 documentos
          </span>
        }
      />
      <div
        className="mt-2 flex gap-1"
        style={{ opacity: sceneReveal(time, 0.3, 0.3, reduced) }}
      >
        {libraryTabs.map((tab, index) => (
          <span
            key={tab}
            className={`font-body rounded-full px-2.5 py-1 text-[10px] font-semibold ${index === 0 ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#06111f]" : "text-slate-600 dark:text-slate-300"}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-5">
        {libraryDocs.map((doc, index) => (
          <div
            key={doc.title}
            className="flex min-w-0 flex-col"
            style={enter(
              sceneReveal(time, LIBRARY_DOCS + index * 0.25, 0.35, reduced),
            )}
          >
            {/* Cover with the type stripe. */}
            <div className="dark:border-primary-dark/15 shadow-big-blocks relative aspect-[2/1] overflow-hidden rounded-[8px] border border-cyan-800/16 bg-white dark:bg-[#06111f]">
              <span
                className="absolute inset-y-0 left-0 w-1"
                style={{ backgroundColor: doc.stripe }}
              />
              <div className="flex h-full flex-col gap-1 bg-[#deedf3]/50 px-3 pt-3.5 pb-2 pl-4 dark:bg-[#06111f]">
                <span className="font-display text-navy/80 truncate text-[8px] font-bold tracking-[0.18em] uppercase dark:text-slate-300">
                  {doc.publisher}
                </span>
                <span className="font-display text-navy line-clamp-3 text-[13px] leading-[1.15] font-extrabold dark:text-slate-50">
                  {doc.title}
                </span>
              </div>
            </div>
            <p className="font-body text-navy mt-2 line-clamp-2 text-xs leading-[1.3] font-bold dark:text-slate-50">
              {doc.title}
            </p>
            <p className="font-body mt-0.5 truncate text-[10.5px] text-slate-500 dark:text-slate-400">
              {doc.meta}
            </p>
            <p className="font-body text-navy mt-0.5 flex items-center gap-1 text-[10.5px] dark:text-slate-200">
              <Clock3
                size={11}
                strokeWidth={2}
                className="shrink-0 text-slate-500"
              />
              <span className="truncate">{doc.date}</span>
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span
                className={`font-body inline-flex min-w-0 items-center gap-1 truncate rounded-full py-0.5 pr-2 pl-1.5 text-[10px] font-semibold ${doc.inherited ? "border border-dashed border-cyan-800/30 text-slate-600 dark:border-cyan-300/26 dark:text-slate-400" : "bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark"}`}
              >
                <Layers3 size={11} strokeWidth={2} className="shrink-0" />
                <span className="truncate">{doc.node}</span>
              </span>
              <span className="flex shrink-0">
                {doc.experts.map((initials, expert) => (
                  <span
                    key={initials}
                    className={`font-display text-navy inline-flex size-6 items-center justify-center rounded-full border-2 border-[#f7fbfd] bg-[#e8f2f7] text-[8px] font-bold dark:border-[#0b1a29] dark:bg-[#152230] dark:text-slate-100 ${expert > 0 ? "-ml-1.5" : ""}`}
                  >
                    {initials}
                  </span>
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * 31 · Comités configurables: the «Agentes» block of a chatbot in the
 * administration (chatbot-modes-panel). With modes on, the organization adds
 * «Precisión» next to «Estándar» and the chat starts offering the picker.
 * Agent and model columns are left out: they name internal pieces.
 */
const adminModes = [
  {
    name: "Estándar",
    description: "Respuesta ágil para la consulta habitual.",
    isDefault: true,
  },
  {
    name: "Precisión",
    description: "Más exhaustivo para casos complejos; tarda algo más.",
    isDefault: false,
  },
] as const;
const COMMITTEES_POINTER = 0.9;
const committeesOpen = COMMITTEES_POINTER + 1;
const committeesPick = committeesOpen + 1;
const committeesAdded = committeesPick + 0.15;

function ActionButton({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="bg-primary-light dark:bg-primary-dark grid size-7 shrink-0 place-items-center rounded-full text-white dark:text-[#04111e]">
      <Icon size={13} strokeWidth={2} />
    </span>
  );
}

function CommitteesScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const open = !reduced && time >= committeesOpen && time < committeesPick;
  const added = sceneReveal(time, committeesAdded, 0.35, reduced);
  const two = reduced || time >= committeesAdded;
  const pointer = pointerStyle(
    [
      { at: COMMITTEES_POINTER, point: { x: 260, y: 150 } },
      { at: committeesOpen - 0.2, point: centre(boxes[0]) },
      { at: committeesPick - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [committeesOpen - 0.15, committeesPick - 0.15],
    sceneReveal(time, COMMITTEES_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, committeesAdded + 0.4, 0.3, reduced)),
  );
  const cell = "px-3 py-1.5 align-top";
  const head =
    "font-body px-3 py-1.5 text-left text-[11px] font-normal text-slate-500 dark:text-slate-400";
  const row = (mode: (typeof adminModes)[number]) => (
    <>
      <td className={cell}>
        <span className="text-navy block truncate text-[13px] font-medium dark:text-slate-50">
          {mode.name}
        </span>
        <span className="block truncate text-[11px] leading-4 text-slate-500 dark:text-slate-400">
          {mode.description}
        </span>
      </td>
      <td className={cell}>
        {mode.isDefault && (
          <span className="dark:border-primary-dark/20 text-navy inline-flex rounded-full border border-cyan-800/15 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap dark:text-slate-100">
            Por defecto
          </span>
        )}
      </td>
      <td className={cell}>
        <span className="flex justify-end gap-1.5">
          {!mode.isDefault && <ActionButton icon={Star} />}
          <ActionButton icon={X} />
        </span>
      </td>
    </>
  );
  return (
    <div ref={root} className="relative flex h-full flex-col px-5 pt-4">
      <div
        className="flex items-start justify-between gap-3"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      >
        {/* Heading of the block in the chatbot record. */}
        <h3 className="font-display text-navy pt-1.5 text-lg font-semibold tracking-tight dark:text-slate-50">
          Agentes
        </h3>
        {/* «Sin modos» / «Con modos». */}
        <span className="dark:border-primary-dark/15 mt-1 inline-flex rounded-full border border-cyan-800/15 bg-white/60 p-0.5 dark:bg-white/3">
          <span
            title="Sin modos"
            className="text-navy grid size-8 place-items-center rounded-full dark:text-slate-200"
          >
            <Bot size={16} strokeWidth={1.8} />
          </span>
          <span
            title="Con modos"
            className="bg-primary-light dark:bg-primary-dark grid size-8 place-items-center rounded-full text-white dark:text-[#04111e]"
          >
            <Layers size={16} strokeWidth={1.8} />
          </span>
        </span>
      </div>
      <div
        className="dark:border-primary-dark/15 mt-2.5 overflow-hidden rounded-xl border border-cyan-800/15 bg-white/90 dark:bg-[#152230]/90"
        style={enter(sceneReveal(time, 0.3, 0.35, reduced))}
      >
        <table className="font-body w-full table-fixed border-collapse">
          <thead>
            <tr className="dark:border-primary-dark/15 border-b border-cyan-800/12">
              <th className={head}>Nombre</th>
              <th className={`${head} w-[90px] whitespace-nowrap`}>
                Por defecto
              </th>
              <th className={`${head} w-[88px] text-right`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr>{row(adminModes[0])}</tr>
            <tr
              className="dark:border-primary-dark/10 relative border-t border-cyan-800/10"
              style={{
                opacity: added,
                display: two || added > 0 ? undefined : "none",
              }}
            >
              {row(adminModes[1])}
            </tr>
          </tbody>
        </table>
      </div>
      <div
        className="relative mt-2.5 flex items-center gap-2"
        style={{ opacity: sceneReveal(time, 0.5, 0.3, reduced) }}
      >
        <span
          ref={target(0)}
          className={`dark:border-primary-dark/20 font-body inline-flex h-9 min-w-44 items-center justify-between gap-2 rounded-lg border bg-white pr-1.5 pl-3 text-[13px] text-slate-600 dark:bg-[#152230] dark:text-slate-300 ${open ? "border-primary-light/50 dark:border-primary-dark/50" : "border-cyan-800/20"}`}
        >
          Añadir modo
          <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark grid size-6 place-items-center rounded-full">
            <ChevronDown
              size={13}
              strokeWidth={2}
              className={open ? "rotate-180" : ""}
            />
          </span>
        </span>
        <span className="dark:border-primary-dark/20 font-body text-navy inline-flex h-9 items-center gap-1.5 rounded-full border border-cyan-800/20 px-3.5 text-[13px] dark:text-slate-100">
          <Plus size={15} strokeWidth={1.8} />
          Crear modo
        </span>
        {/* Options of the «Añadir modo» select, opened above it. */}
        <div
          className="shadow-big-blocks dark:border-primary-dark/15 absolute bottom-[calc(100%+6px)] left-0 z-30 w-60 rounded-xl border border-cyan-800/15 bg-white/95 p-1 backdrop-blur-md dark:bg-[#152230]/95"
          style={{ visibility: open ? "visible" : "hidden" }}
        >
          <div
            ref={target(1)}
            className={`flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 ${!reduced && time >= committeesPick - 0.5 ? "bg-primary-light/8 dark:bg-primary-dark/10" : ""}`}
          >
            <span className="font-body text-navy text-[13px] dark:text-slate-100">
              Precisión
            </span>
            <span className="font-body text-primary-light dark:text-primary-dark text-[11px]">
              {organization}
            </span>
          </div>
        </div>
      </div>
      <p className="font-body mt-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
        {two
          ? "El profesional elige entre estos 2 modos en el chat; empieza con el último que usó o con el por defecto."
          : "Con un solo modo el chat no muestra selector: siempre usa este."}
      </p>
      <Pointer style={pointer} />
    </div>
  );
}

/*
 * 32 · Publicación revisada: the editor's proposal review (pr-review). Each
 * proposed change shows its diff and is included or discarded; «Aprobar y
 * publicar» publishes a new version of the corpus.
 */
const REVIEW_INCLUDE = 1.6;
const reviewApprove = REVIEW_INCLUDE + 1.3;
const reviewPublished = reviewApprove + 1;

function ReviewScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const included = reduced || time >= REVIEW_INCLUDE;
  const publishing =
    !reduced && time >= reviewApprove && time < reviewPublished;
  const published = reduced || time >= reviewPublished;
  const pointer = pointerStyle(
    [
      { at: 0.7, point: { x: 200, y: 140 } },
      { at: REVIEW_INCLUDE - 0.2, point: centre(boxes[0]) },
      { at: reviewApprove - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [REVIEW_INCLUDE - 0.15, reviewApprove - 0.15],
    sceneReveal(time, 0.7, 0.3, reduced) *
      (1 - sceneReveal(time, reviewApprove + 0.4, 0.3, reduced)),
  );
  const line = (kind: "removed" | "added") =>
    `flex ${kind === "added" ? "bg-primary-light/10 dark:bg-primary-dark/12" : "bg-rose-700/10 dark:bg-rose-300/14"}`;
  const gutter = (kind: "removed" | "added") =>
    `w-5 shrink-0 border-r border-cyan-800/10 text-center select-none ${kind === "added" ? "text-primary-light dark:text-primary-dark" : "text-rose-700 dark:text-rose-300"}`;
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col bg-[#f7fbfd] px-5 pt-4 dark:bg-[#0b1a29]"
    >
      <PanelHeading
        label="Propuesta"
        title="Protocolo de analgesia del área"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      />
      <p className="font-body mt-1 text-[11px] text-slate-500 dark:text-slate-400">
        Cambios propuestos · 1 operación
      </p>
      <section
        className="dark:border-primary-dark/20 mt-2.5 overflow-hidden rounded-xl border border-cyan-800/15 bg-white/80 dark:bg-[#152230]/80"
        style={enter(sceneReveal(time, 0.4, 0.35, reduced))}
      >
        <div className="dark:border-primary-dark/15 flex items-center justify-between gap-2 border-b border-cyan-800/10 px-3 py-2">
          <span className="font-body text-navy text-[11px] font-semibold dark:text-slate-100">
            Cambio 1 · Actualizar
          </span>
          <span className="flex items-center gap-1.5">
            {included && (
              <span className="font-body bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark inline-flex h-6 items-center rounded-full px-2 text-[10px] font-semibold">
                Incluido
              </span>
            )}
            <span
              ref={target(0)}
              className={`grid size-6 place-items-center rounded-full ${included ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#06111f]" : "border-primary-light/25 text-primary-light border bg-white/65 dark:bg-white/[0.03]"}`}
              style={{
                transform: `scale(${1 - press(time, REVIEW_INCLUDE - 0.15) * 0.08})`,
              }}
            >
              <Check size={12} strokeWidth={2} />
            </span>
            <span className="border-primary-light/25 text-primary-light grid size-6 place-items-center rounded-full border bg-white/65 dark:bg-white/[0.03]">
              <X size={12} strokeWidth={2} />
            </span>
          </span>
        </div>
        <div className="font-mono text-[10.5px] leading-[17px] text-slate-700 dark:text-slate-200">
          <div className={line("removed")}>
            <span className={gutter("removed")}>−</span>
            <span className="px-2 py-1 line-through decoration-rose-700/70">
              Ibuprofeno 400 mg cada 8 horas como analgesia de primera elección.
            </span>
          </div>
          <div className={line("added")}>
            <span className={gutter("added")}>+</span>
            <span className="px-2 py-1">
              Evitar AINE en la ERC; con aclaramiento inferior a 30 mL/min están
              contraindicados.
            </span>
          </div>
        </div>
      </section>
      {/* Editorial decision. */}
      <div
        className="mt-3 flex items-center justify-between gap-2"
        style={{ opacity: sceneReveal(time, 0.6, 0.3, reduced) }}
      >
        <span className="font-body text-[10.5px] text-slate-500 dark:text-slate-400">
          {published
            ? "Aprobado y publicado en v15"
            : included
              ? "1 cambio incluido"
              : "1 sin revisar"}
        </span>
        <span className="flex items-center gap-1">
          <PlatformButton variant="ghost" disabled={published}>
            Rechazar propuesta
          </PlatformButton>
          <PlatformButton
            buttonRef={target(1)}
            disabled={!included || published}
            pressed={press(time, reviewApprove - 0.15)}
          >
            {publishing ? "Publicando…" : "Aprobar y publicar"}
          </PlatformButton>
        </span>
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 33 · Versiones del corpus: every change is a numbered version. */
const versions: {
  icon: LucideIcon;
  label: string;
  title: string;
}[] = [
  {
    icon: GitCommitVertical,
    label: "Versión 14 · 3 nov. 2026",
    title: "Protocolo de analgesia actualizado",
  },
  {
    icon: GitCommitVertical,
    label: "Versión 13 · 21 oct. 2026",
    title: "Guía local de hiperpotasemia añadida",
  },
  {
    icon: FileX2,
    label: "Versión 12 · 2 oct. 2026",
    title: "Documento retirado del corpus",
  },
];
const VERSIONS_NEW = 1.6;

function VersionRow({
  icon,
  label,
  title,
  active = false,
  pulse = 0,
  style,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
  active?: boolean;
  pulse?: number;
  style?: CSSProperties;
}) {
  return (
    <li className="relative pl-8" style={style}>
      <span
        className={`absolute top-1/2 left-[7px] size-[11px] -translate-y-1/2 rounded-full border-2 ${active ? "border-primary-light bg-primary-light dark:border-primary-dark dark:bg-primary-dark" : "border-primary-light/50 dark:border-primary-dark/50 bg-white dark:bg-[#06111f]"}`}
      />
      <SceneCard
        icon={icon}
        label={label}
        title={title}
        active={active}
        pulse={pulse}
        className="h-[60px]"
      />
    </li>
  );
}

function VersionsScene({ time, reduced }: SceneProps) {
  const added = sceneReveal(time, VERSIONS_NEW, 0.45, reduced);
  return (
    <div className="relative flex h-full flex-col justify-center px-6">
      <span
        aria-hidden="true"
        className="border-primary-light/40 dark:border-primary-dark/40 absolute top-8 bottom-8 left-[36px] border-l border-dashed"
      />
      <ol className="relative">
        <div
          className="grid"
          style={{ gridTemplateRows: `${added}fr`, opacity: added }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="pb-2.5">
              <VersionRow
                icon={GitCommitVertical}
                label="Versión 15 · publicada ahora"
                title="Guía de ERC · revisión 3"
                active
                pulse={pulseAt(time, VERSIONS_NEW + 0.4, reduced)}
              />
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          {versions.map((version, index) => (
            <VersionRow
              key={version.label}
              {...version}
              style={enter(sceneReveal(time, 0.2 + index * 0.2, 0.3, reduced))}
            />
          ))}
        </div>
      </ol>
    </div>
  );
}

/* 34 · Preguntas de control: the battery run after each change. */
const CONTROL_TOTAL = 40;
// Verdicts of the illustrative run: one regression, two partial answers.
const controlVerdict = (index: number) =>
  index === 22
    ? "incorrect"
    : index === 9 || index === 31
      ? "partial"
      : "correct";
const CONTROL_RUN = 0.8;
const controlDone = CONTROL_RUN + 2.6;

function ControlScene({ time, reduced }: SceneProps) {
  const progress = reduced
    ? 1
    : Math.max(
        0,
        Math.min(1, (time - CONTROL_RUN) / (controlDone - CONTROL_RUN)),
      );
  const answered = Math.round(progress * CONTROL_TOTAL);
  const done = reduced || time >= controlDone;
  const alert = sceneReveal(time, controlDone + 0.2, 0.4, reduced);
  // Verdict colours of the editor's question map.
  const legend = [
    {
      label: "Correcta",
      className: "bg-primary-light/35 dark:bg-primary-dark/30",
    },
    { label: "Parcial", className: "bg-[#73a9b0]" },
    { label: "Incorrecta", className: "bg-rose-700 dark:bg-rose-300" },
  ];
  return (
    <div className="relative flex h-full flex-col px-5 pt-5">
      <PanelHeading
        label="Preguntas de control"
        title="Batería · Nefrología"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
        aside={
          <span className="font-body mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {CONTROL_TOTAL} preguntas
          </span>
        }
      />
      <p className="font-body mt-2 flex items-center justify-between text-[11px] text-slate-600 tabular-nums dark:text-slate-300">
        <span>Versión 15 del corpus</span>
        <span
          className={
            done
              ? "text-primary-light dark:text-primary-dark font-semibold"
              : ""
          }
        >
          {done ? "Completada" : `${answered} de ${CONTROL_TOTAL}`}
        </span>
      </p>
      {/* One mark per question, in order (campaign-questions). */}
      <div className="mt-3 flex h-20 gap-[3px]">
        {Array.from({ length: CONTROL_TOTAL }, (_, index) => {
          const verdict = controlVerdict(index);
          const shown = index < answered;
          return (
            <span
              key={index}
              className={`min-w-0 flex-1 rounded-[1px] ${!shown ? "bg-slate-300/40 dark:bg-white/6" : verdict === "incorrect" ? "bg-rose-700 dark:bg-rose-300" : verdict === "partial" ? "bg-[#73a9b0]" : "bg-primary-light/35 dark:bg-primary-dark/30"}`}
            />
          );
        })}
      </div>
      <div className="font-body mt-2.5 flex gap-4 text-[10px] text-slate-500 dark:text-slate-400">
        {legend.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-sm ${item.className}`} />
            {item.label}
          </span>
        ))}
      </div>
      <div
        className={`${processCardClass} relative mt-3 flex items-center gap-3 border-rose-300/70 px-3.5 py-2.5 dark:border-rose-400/30`}
        style={enter(alert)}
      >
        <TriangleAlert
          size={20}
          strokeWidth={1.1}
          className="shrink-0 text-rose-600 dark:text-rose-300"
        />
        <div className="min-w-0">
          <p className="font-display text-navy text-[13px] font-semibold dark:text-slate-100">
            1 pregunta empeora respecto a la versión 14
          </p>
          <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            Pregunta 23 · antes Correcta, ahora Incorrecta
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * 35 · Valoración profesional: «Respuesta no útil» opens the rating dialog
 * (response-rating): the comment is required, «Enviar valoración» saves it
 * and the actions row shows «Valoración guardada».
 */
const ratingComment =
  "Añadir el ajuste de dosis del paracetamol en la ERC grave.";
const RATING_POINTER = 0.6;
const ratingClick = RATING_POINTER + 1;
const ratingTyping = ratingClick + 0.7;
const ratingTyped = ratingTyping + typingDuration(ratingComment.length);
const ratingSend = ratingTyped + 0.9;

function RatingScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const chosen = reduced || time >= ratingClick;
  const dialog = reduced
    ? 0
    : sceneReveal(time, ratingClick, 0.25, false) *
      (1 - sceneReveal(time, ratingSend, 0.2, false));
  const written = writtenCharacters(
    time,
    ratingTyping,
    ratingComment.length,
    reduced,
  );
  const sent = reduced || time >= ratingSend;
  const pointer = pointerStyle(
    [
      { at: RATING_POINTER, point: { x: 230, y: 250 } },
      { at: ratingClick - 0.2, point: centre(boxes[0]) },
      { at: ratingTyped, point: { x: 300, y: 300 } },
      { at: ratingSend - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [ratingClick - 0.15, ratingSend - 0.15],
    sceneReveal(time, RATING_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, ratingSend + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p>
          <Answer text={claimParagraph} />
        </p>
        <div className="mt-3">
          <ResponseActions
            rating={chosen ? "negative" : undefined}
            notice={sent ? "Valoración guardada" : undefined}
            negativeRef={target(0)}
          />
        </div>
      </div>
      <PlatformDialog
        open={dialog}
        title="Respuesta no útil"
        footer={
          <>
            <PlatformButton variant="ghost">Cancelar</PlatformButton>
            <PlatformButton
              buttonRef={target(1)}
              disabled={written === 0}
              pressed={press(time, ratingSend - 0.15)}
            >
              Enviar valoración
            </PlatformButton>
          </>
        }
      >
        <div className="grid gap-1.5">
          <p className="font-body text-navy text-xs font-medium dark:text-slate-100">
            Comentario (obligatorio)
          </p>
          <PlatformField multiline focused={written > 0 && !sent}>
            {written > 0 ? (
              <Typed text={ratingComment} written={written} />
            ) : (
              <span className="text-slate-500">
                Comentario sobre la respuesta…
              </span>
            )}
          </PlatformField>
        </div>
      </PlatformDialog>
      <Pointer style={pointer} />
    </div>
  );
}

/* 36 · Marca y dominio propios: the platform takes the organization's look. */
const brandDomain = "consulta.areanorte.es";
const BRAND_TYPING = 0.5;
const brandTyped = BRAND_TYPING + typingDuration(brandDomain.length) * 1.6;
const brandSwap = brandTyped + 0.5;
const brandColor = "#3a4fa3";

function BrandScene({ time, reduced }: SceneProps) {
  const written = reduced
    ? brandDomain.length
    : Math.min(
        brandDomain.length,
        Math.max(
          0,
          Math.floor(
            ((time - BRAND_TYPING) / (brandTyped - BRAND_TYPING)) *
              brandDomain.length,
          ),
        ),
      );
  const swap = reduced ? 1 : sceneReveal(time, brandSwap, 0.6, false);
  const own = swap > 0.5;
  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#06111f]">
      {/* Browser bar with the organization's domain. */}
      <div className="dark:border-primary-dark/15 flex h-10 shrink-0 items-center gap-3 border-b border-cyan-800/10 bg-[#e8f2f7]/40 px-4 dark:bg-[#152230]">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              className="size-2 rounded-full bg-slate-300 dark:bg-slate-600"
            />
          ))}
        </span>
        <span className="dark:border-primary-dark/15 font-body flex h-6 min-w-0 flex-1 items-center gap-1.5 rounded-full border border-cyan-800/12 bg-white px-3 text-[11px] text-slate-700 dark:bg-[#06111f] dark:text-slate-200">
          <Lock
            size={11}
            strokeWidth={1.6}
            className="shrink-0 text-slate-400"
          />
          <Typed text={brandDomain} written={written} />
        </span>
      </div>
      {/* chatbot-intro: the logo above the organization and the name. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-2 pb-16 text-center">
        <span className="relative h-12 w-24">
          <span
            className="absolute inset-0 grid place-items-center"
            style={{ opacity: 1 - swap }}
          >
            <Mark className="size-12" />
          </span>
          <span
            className="absolute inset-0 grid place-items-center"
            style={{ opacity: swap }}
          >
            <span
              className="font-display grid size-12 place-items-center rounded-xl text-base font-bold text-white"
              style={{ backgroundColor: brandColor }}
            >
              AN
            </span>
          </span>
        </span>
        <p
          className={`font-display text-[10px] font-bold tracking-[0.18em] uppercase ${own ? "" : "text-primary-light dark:text-primary-dark"}`}
          style={own ? { color: brandColor } : undefined}
        >
          {own ? organization : "BinPar"}
        </p>
        <p className="font-display text-navy text-xl font-extrabold tracking-tight dark:text-slate-50">
          Comité clínico
        </p>
      </div>
      <div className="absolute inset-x-6 bottom-5">
        <div className="shadow-big-blocks dark:border-primary-dark/15 relative grid h-[52px] grid-cols-[56px_minmax(0,1fr)_56px] items-center rounded-[28px] border border-cyan-800/15 bg-white/85 dark:bg-[#152230e6]/90">
          <span className="dark:border-primary-dark/15 grid size-9 place-items-center place-self-center rounded-full border border-cyan-800/15 text-slate-500 dark:text-slate-400">
            <Paperclip size={20} strokeWidth={1.1} />
          </span>
          <span className="font-body truncate text-sm text-slate-500 dark:text-slate-400">
            Pregunta clínica al comité...
          </span>
          <span
            className={`grid size-9 place-items-center place-self-center rounded-full text-white transition-colors duration-300 ${own ? "" : "bg-primary-light dark:bg-primary-dark dark:text-[#04111e]"}`}
            style={own ? { backgroundColor: brandColor } : undefined}
          >
            <ArrowUp size={20} strokeWidth={1.1} />
          </span>
        </div>
      </div>
    </div>
  );
}

export const governanceScenes: Record<GovernanceFeatureId, SceneDefinition> = {
  corpus: {
    render: (props) => <CorpusScene {...props} />,
    surface: "process",
    duration: corpusDone + 1.6,
  },
  library: {
    render: (props) => <LibraryScene {...props} />,
    surface: "panel",
    duration: LIBRARY_DOCS + 0.25 + 2,
  },
  committees: {
    render: (props) => <CommitteesScene {...props} />,
    surface: "panel",
    duration: committeesAdded + 1.6,
  },
  review: {
    render: (props) => <ReviewScene {...props} />,
    surface: "panel",
    duration: reviewPublished + 1.4,
  },
  versions: {
    render: (props) => <VersionsScene {...props} />,
    surface: "process",
    duration: VERSIONS_NEW + 2,
  },
  control: {
    render: (props) => <ControlScene {...props} />,
    surface: "panel",
    duration: controlDone + 1.8,
  },
  rating: {
    render: (props) => <RatingScene {...props} />,
    surface: "chat",
    duration: ratingSend + 1.4,
  },
  brand: {
    render: (props) => <BrandScene {...props} />,
    surface: "panel",
    duration: brandSwap + 1.8,
  },
};

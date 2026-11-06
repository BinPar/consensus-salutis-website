"use client";

import {
  ArrowUp,
  Building2,
  Check,
  FileX2,
  GitCommitVertical,
  Layers,
  Lock,
  Paperclip,
  ThumbsDown,
  ThumbsUp,
  TriangleAlert,
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
  sourceTitle,
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

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-[18px] w-8 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-primary-light dark:bg-primary-dark" : "bg-slate-300 dark:bg-slate-600"}`}
    >
      <span
        className="absolute top-0.5 left-0.5 size-3.5 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: `translateX(${on ? 14 : 0}px)` }}
      />
    </span>
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
          className={`${processBorderClass(done)} relative flex h-[58px] w-[248px] items-center gap-3 rounded-2xl border bg-white/95 px-4 shadow-[0_8px_24px_rgba(0,109,121,0.10)] dark:bg-[#152230]`}
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
                Guías y manuales que heredan todas las organizaciones.
              </p>
            </SceneCard>
          </div>
          <div ref={target(2)}>
            <SceneCard
              icon={Building2}
              label="Protocolos del área"
              title="18 documentos"
              active
              pulse={pulseAt(time, CORPUS_OWN + 0.3, reduced)}
              style={enter(sceneReveal(time, CORPUS_OWN, 0.35, reduced))}
            >
              <p className="font-body mt-2 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
                Aportados en este nodo y visibles solo para el área.
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

/* 30 · Biblioteca de documentos: type, approval, experts and a summary. */
const libraryTabs = ["Todos", "Guía", "Protocolo", "Libro", "Del centro"];
const libraryDocs = [
  {
    title: "Protocolo de analgesia del área",
    type: "Protocolo",
    meta: "Aprobado el 3 nov. 2026",
    experts: 2,
  },
  {
    title: sourceTitle,
    type: "Libro",
    meta: "Base común",
    experts: 3,
    inherited: true,
  },
  {
    title: "Guía de práctica clínica de ERC",
    type: "Guía",
    meta: "Aprobado el 21 oct. 2026",
    experts: 2,
  },
] as const;
const librarySummary =
  "Pautas de analgesia en la ERC: evitar AINE y ajustar los opioides según el filtrado.";
const LIBRARY_OPEN = 1.6;
const libraryTyping = LIBRARY_OPEN + 0.4;

function DocCover() {
  return (
    <span className="dark:border-primary-dark/20 flex h-8 w-6 shrink-0 flex-col gap-[3px] rounded-[3px] border border-cyan-800/20 bg-white px-1 pt-1.5 dark:bg-[#06111f]">
      <span className="bg-primary-light/40 dark:bg-primary-dark/40 h-px w-full" />
      <span className="h-px w-full bg-slate-300 dark:bg-slate-600" />
      <span className="h-px w-3/4 bg-slate-300 dark:bg-slate-600" />
      <span className="h-px w-full bg-slate-300 dark:bg-slate-600" />
    </span>
  );
}

function LibraryScene({ time, reduced }: SceneProps) {
  const open = sceneReveal(time, LIBRARY_OPEN, 0.4, reduced);
  const written = writtenCharacters(
    time,
    libraryTyping,
    librarySummary.length,
    reduced,
  );
  return (
    <div className="relative flex h-full flex-col px-5 pt-4">
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
        className="dark:border-primary-dark/15 mt-3 flex gap-4 border-b border-cyan-800/12"
        style={{ opacity: sceneReveal(time, 0.3, 0.3, reduced) }}
      >
        {libraryTabs.map((tab, index) => (
          <span
            key={tab}
            className={`font-body -mb-px pb-2 text-[11px] ${index === 0 ? "border-primary-light text-navy dark:border-primary-dark border-b-2 font-semibold dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {libraryDocs.map((doc, index) => (
          <li
            key={doc.title}
            className={`${processCardClass} ${processBorderClass(index === 0 && open > 0.5)} relative px-3 py-1.5 ${"inherited" in doc ? "border-dashed" : ""}`}
            style={enter(sceneReveal(time, 0.5 + index * 0.2, 0.3, reduced))}
          >
            <div className="flex items-center gap-3">
              <DocCover />
              <div className="min-w-0 flex-1">
                <p className="font-display text-navy truncate text-[13px] font-semibold dark:text-slate-100">
                  {doc.title}
                </p>
                <p className="font-body mt-0.5 flex items-center gap-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark rounded-full px-1.5 font-semibold">
                    {doc.type}
                  </span>
                  {doc.meta}
                </p>
              </div>
              <span className="font-body shrink-0 text-[11px] text-slate-500 dark:text-slate-400">
                {doc.experts} expertos
              </span>
            </div>
            {index === 0 && (
              <div className="grid" style={{ gridTemplateRows: `${open}fr` }}>
                <div className="min-h-0 overflow-hidden">
                  <p className="font-body min-h-9 pt-2 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
                    <span className="text-navy font-semibold dark:text-slate-100">
                      Qué aporta:{" "}
                    </span>
                    <Typed text={librarySummary} written={written} />
                  </p>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 31 · Comités configurables: experts and modes chosen by the organization. */
const committeeExperts = [
  "Cardiología",
  "Farmacología",
  "Nefrología",
  "Urgencias",
] as const;
const committeeModes = [
  {
    name: "Estándar",
    description: "Respuesta ágil para la consulta habitual.",
  },
  {
    name: "Precisión",
    description: "Más exhaustivo para casos complejos; tarda algo más.",
  },
] as const;
const COMMITTEES_POINTER = 0.9;
const committeesExpert = COMMITTEES_POINTER + 1;
const committeesMode = committeesExpert + 1.3;

function CommitteesScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const expertOn = reduced || time >= committeesExpert;
  const modeOn = reduced || time >= committeesMode;
  const pointer = pointerStyle(
    [
      { at: COMMITTEES_POINTER, point: { x: 210, y: 300 } },
      { at: committeesExpert - 0.2, point: centre(boxes[0]) },
      { at: committeesMode - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [committeesExpert - 0.15, committeesMode - 0.15],
    sceneReveal(time, COMMITTEES_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, committeesMode + 0.4, 0.3, reduced)),
  );
  const section =
    "font-display mt-3 mb-2 text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400";
  return (
    <div ref={root} className="relative flex h-full flex-col px-5 pt-5">
      <PanelHeading
        label={organization}
        title="Comité clínico"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      />
      <p className={section}>Expertos</p>
      <div className="grid grid-cols-2 gap-2">
        {committeeExperts.map((expert, index) => {
          const on = index < 3 || expertOn;
          return (
            <div
              key={expert}
              className={`${processCardClass} ${processBorderClass(index === 3 && expertOn)} relative flex h-10 items-center justify-between gap-2 px-3`}
              style={enter(sceneReveal(time, 0.3 + index * 0.1, 0.3, reduced))}
            >
              <PulseLayer
                value={
                  index === 3 ? pulseAt(time, committeesExpert, reduced) : 0
                }
              />
              <span
                className={`font-body relative text-[13px] font-semibold ${on ? "text-navy dark:text-slate-100" : "text-slate-400"}`}
              >
                {expert}
              </span>
              <span
                ref={index === 3 ? target(0) : undefined}
                className="relative"
              >
                <Toggle on={on} />
              </span>
            </div>
          );
        })}
      </div>
      <p className={section}>Modos de respuesta</p>
      <div className="space-y-2">
        {committeeModes.map((mode, index) => {
          const on = index === 0 || modeOn;
          return (
            <div
              key={mode.name}
              className={`${processCardClass} ${processBorderClass(index === 1 && modeOn)} relative flex items-center gap-3 px-3 py-1.5`}
              style={enter(sceneReveal(time, 0.6 + index * 0.1, 0.3, reduced))}
            >
              <PulseLayer
                value={index === 1 ? pulseAt(time, committeesMode, reduced) : 0}
              />
              <div className="relative min-w-0 flex-1">
                <p className="font-body text-navy flex items-center gap-2 text-[13px] font-semibold dark:text-slate-100">
                  {mode.name}
                  {index === 0 && (
                    <span className="bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark rounded-full px-1.5 text-[10px] font-semibold">
                      Predeterminado
                    </span>
                  )}
                </p>
                <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                  {mode.description}
                </p>
              </div>
              <span
                ref={index === 1 ? target(1) : undefined}
                className="relative"
              >
                <Toggle on={on} />
              </span>
            </div>
          );
        })}
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 32 · Publicación revisada: a proposed change is approved before publishing. */
const reviewStages = ["Conversión", "Revisión", "Publicación"] as const;
const REVIEW_POINTER = 1.8;
const reviewApprove = REVIEW_POINTER + 1;
const reviewPublished = reviewApprove + 0.9;

function ReviewScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(1);
  const approved = reduced || time >= reviewApprove;
  const published = reduced || time >= reviewPublished;
  const stage = published ? 3 : approved ? 2 : 1;
  const pointer = pointerStyle(
    [
      { at: REVIEW_POINTER, point: { x: 200, y: 140 } },
      { at: reviewApprove - 0.2, point: centre(boxes[0]) },
    ],
    time,
    reduced,
    [reviewApprove - 0.15],
    sceneReveal(time, REVIEW_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, reviewApprove + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative flex h-full flex-col px-5 pt-6">
      <ol
        className="flex items-center gap-2"
        style={{ opacity: sceneReveal(time, 0.1, 0.3, reduced) }}
      >
        {reviewStages.map((name, index) => {
          const done = index < stage;
          const current = index === stage;
          return (
            <li key={name} className="flex flex-1 items-center gap-2">
              <span
                className={`relative grid size-6 shrink-0 place-items-center overflow-hidden rounded-full border text-[10px] font-semibold ${done ? "bg-primary-light dark:bg-primary-dark border-transparent text-white dark:text-[#04111e]" : current ? "border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark" : "dark:border-primary-dark/20 border-cyan-800/20 text-slate-400"}`}
              >
                {current && (
                  <PulseLayer
                    value={reduced ? 0 : pulseProgress(time, 0, 1.2)}
                  />
                )}
                {done ? <Check size={13} strokeWidth={2} /> : index + 1}
              </span>
              <span
                className={`font-body text-xs ${done || current ? "text-navy font-semibold dark:text-slate-100" : "text-slate-500 dark:text-slate-400"}`}
              >
                {name}
              </span>
              {index < reviewStages.length - 1 && (
                <span
                  className={`h-px flex-1 ${done ? "bg-primary-light/50 dark:bg-primary-dark/50" : "bg-cyan-800/15 dark:bg-cyan-300/15"}`}
                />
              )}
            </li>
          );
        })}
      </ol>
      <section
        className={`${processCardClass} ${processBorderClass(!approved)} relative mt-5 p-4`}
        style={enter(sceneReveal(time, 0.4, 0.35, reduced))}
      >
        <PulseLayer value={pulseAt(time, reviewApprove, reduced)} />
        <p className={`${eyebrow} relative`}>Cambio propuesto</p>
        <p className="font-display text-navy relative mt-1 truncate text-sm font-semibold dark:text-slate-100">
          Protocolo de analgesia del área · revisión 2
        </p>
        <div className="font-body relative mt-3 space-y-1 text-xs leading-[18px]">
          <p
            className="flex gap-2 rounded-md bg-rose-50 px-2 py-1.5 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200"
            style={{ opacity: sceneReveal(time, 0.8, 0.3, reduced) }}
          >
            <span aria-hidden="true">−</span>
            <span className="line-through decoration-rose-400/60">
              Ibuprofeno 400 mg cada 8 horas como analgesia de primera elección.
            </span>
          </p>
          <p
            className="bg-primary-light/8 text-navy dark:bg-primary-dark/10 flex gap-2 rounded-md px-2 py-1.5 dark:text-slate-100"
            style={{ opacity: sceneReveal(time, 1.1, 0.3, reduced) }}
          >
            <span
              aria-hidden="true"
              className="text-primary-light dark:text-primary-dark"
            >
              +
            </span>
            <span>
              Evitar AINE en la ERC; con aclaramiento inferior a 30 mL/min están
              contraindicados.
            </span>
          </p>
        </div>
        <div className="relative mt-3 flex items-center gap-2">
          <span
            className={`font-body inline-flex items-center gap-1 text-[11px] font-semibold ${approved ? "text-primary-light dark:text-primary-dark" : "text-slate-500 dark:text-slate-400"}`}
          >
            {approved && <Check size={13} strokeWidth={1.8} />}
            {published
              ? "Aprobado y publicado"
              : approved
                ? "Aprobado"
                : "Pendiente de aprobar"}
          </span>
          <span className="font-body ml-auto px-2 text-xs text-slate-500 dark:text-slate-400">
            Rechazar
          </span>
          <span
            ref={target(0)}
            className={`bg-primary-light dark:bg-primary-dark font-body inline-flex h-8 items-center rounded-full px-3.5 text-xs font-semibold text-white transition-opacity duration-200 dark:text-[#04111e] ${approved ? "opacity-45" : ""}`}
            style={{
              transform: `scale(${1 - press(time, reviewApprove - 0.15) * 0.06})`,
            }}
          >
            Aprobar
          </span>
        </div>
      </section>
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
  const legend = [
    {
      label: "Correcta",
      className: "bg-primary-light/70 dark:bg-primary-dark/70",
    },
    {
      label: "Parcial",
      className:
        "bg-primary-light/20 border-primary-light/50 dark:bg-primary-dark/20 dark:border-primary-dark/50 border",
    },
    { label: "Incorrecta", className: "bg-rose-500/75" },
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
      <div className="mt-2.5 grid grid-cols-10 gap-1.5">
        {Array.from({ length: CONTROL_TOTAL }, (_, index) => {
          const verdict = controlVerdict(index);
          const shown = index < answered;
          return (
            <span
              key={index}
              className={`h-[22px] rounded-[5px] transition-colors duration-200 ${!shown ? "dark:border-primary-dark/15 border border-cyan-800/12" : verdict === "incorrect" ? "bg-rose-500/75" : verdict === "partial" ? "bg-primary-light/20 border-primary-light/50 dark:bg-primary-dark/20 dark:border-primary-dark/50 border" : "bg-primary-light/70 dark:bg-primary-dark/70"}`}
            />
          );
        })}
      </div>
      <div className="font-body mt-2.5 flex gap-4 text-[10px] text-slate-500 dark:text-slate-400">
        {legend.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span className={`size-2.5 rounded-[3px] ${item.className}`} />
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

/* 35 · Valoración profesional: «not useful», with a comment for review. */
const ratingComment =
  "Añadir el ajuste de dosis del paracetamol en la ERC grave.";
const RATING_POINTER = 0.6;
const ratingClick = RATING_POINTER + 1;
const ratingTyping = ratingClick + 0.6;
const ratingTyped = ratingTyping + typingDuration(ratingComment.length);
const ratingSend = ratingTyped + 0.9;

function RatingScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const chosen = reduced || time >= ratingClick;
  const open = sceneReveal(time, ratingClick, 0.4, reduced);
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
  const icon =
    "grid size-8 place-items-center rounded-full text-slate-500 transition-colors duration-200 dark:text-slate-400";
  return (
    <div ref={root} className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p>
          <Answer text={claimParagraph} />
        </p>
        <div className="mt-2 flex items-center gap-0.5">
          <span className={icon}>
            <ThumbsUp size={15} strokeWidth={1.4} />
          </span>
          <span
            ref={target(0)}
            className={`${icon} ${chosen ? "bg-primary-light/10 text-primary-light dark:bg-primary-dark/12 dark:text-primary-dark" : ""}`}
            style={{
              transform: `scale(${1 - press(time, ratingClick - 0.15) * 0.1})`,
            }}
          >
            <ThumbsDown size={15} strokeWidth={1.4} />
          </span>
          {sent && (
            <span className="font-body text-primary-light dark:text-primary-dark ml-2 inline-flex items-center gap-1 text-[11px] font-semibold">
              <Check size={13} strokeWidth={1.8} />
              Valoración guardada
            </span>
          )}
        </div>
        <div
          className="grid"
          style={{ gridTemplateRows: `${open}fr`, opacity: open }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`${processCardClass} ${processBorderClass(!sent)} mt-2 p-3`}
            >
              <p className="font-body text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Comentario (obligatorio)
              </p>
              <p className="dark:border-primary-dark/15 font-body mt-1.5 min-h-9 rounded-lg border border-cyan-800/15 bg-white px-2.5 py-2 text-xs leading-[18px] text-slate-700 dark:bg-[#06111f] dark:text-slate-200">
                {written > 0 ? (
                  <Typed text={ratingComment} written={written} />
                ) : (
                  <span className="text-slate-400">
                    Comentario sobre la respuesta…
                  </span>
                )}
              </p>
              <div className="mt-2 flex justify-end">
                <span
                  ref={target(1)}
                  className={`bg-primary-light dark:bg-primary-dark font-body inline-flex h-7 items-center rounded-full px-3 text-[11px] font-semibold text-white transition-opacity duration-200 dark:text-[#04111e] ${written === 0 || sent ? "opacity-45" : ""}`}
                  style={{
                    transform: `scale(${1 - press(time, ratingSend - 0.15) * 0.06})`,
                  }}
                >
                  {sent ? "Enviada a revisión" : "Enviar valoración"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
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
  const accent = own ? brandColor : undefined;
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
      <div className="relative flex h-14 items-center gap-2.5 px-6">
        <span className="relative size-7">
          <span className="absolute inset-0" style={{ opacity: 1 - swap }}>
            <Mark className="size-7" />
          </span>
          <span
            className="font-display absolute inset-0 grid place-items-center rounded-lg text-[11px] font-bold text-white"
            style={{ opacity: swap, backgroundColor: brandColor }}
          >
            AN
          </span>
        </span>
        <span className="font-display text-navy text-sm font-semibold dark:text-slate-100">
          {own ? organization : "BinPar"}
        </span>
      </div>
      <div className="relative mt-7 px-6 text-center">
        <p
          className="font-display text-[10px] font-bold tracking-[0.18em] uppercase"
          style={{ color: accent }}
        >
          <span
            className={own ? "" : "text-primary-light dark:text-primary-dark"}
          >
            Comité clínico
          </span>
        </p>
        <p className="font-display text-navy mt-2 text-2xl font-semibold tracking-tight dark:text-slate-50">
          ¿Qué quieres consultar?
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
    duration: libraryTyping + typingDuration(librarySummary.length) + 1.2,
  },
  committees: {
    render: (props) => <CommitteesScene {...props} />,
    surface: "panel",
    duration: committeesMode + 1.4,
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

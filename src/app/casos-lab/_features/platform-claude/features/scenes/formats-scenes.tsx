"use client";

import {
  ChevronDown,
  Download,
  FileImage,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  Workflow,
  X,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  ProcessChatVeil,
  drawProgress,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import { processFollowup } from "~/app/_components/clinical-process-data";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import type { FormatFeatureId } from "../features-data";
import { Pointer, centre, pointerStyle } from "./consultation-scenes";
import {
  Answer,
  Caret,
  ChatHeader,
  Connector,
  Passage,
  SceneCard,
  answerLength,
  bodyText,
  eyebrow,
  sourceTitle,
  useBoxes,
  type SceneDefinition,
  type SceneProps,
} from "./evidence-scenes";

/*
 * «Formatos de respuesta» scenes. The same consultation: the decision tree
 * orders the evidence on NSAIDs in CKD, the figure illustrates the afferent
 * vasoconstriction cited in the answer, and the side panel holds the source,
 * the scheme and the figure. UI strings come from the chat
 * (messages/es/chatThread.json: «Esquema», «Descargar imagen», «Preparando
 * imagen…», «Restablecer», «Ver recorrido en texto», «Ampliar imagen»).
 */

const enter = (value: number, distance = 8): CSSProperties => ({
  opacity: value,
  transform: `translateY(${distance * (1 - value)}px)`,
});

/** Typed text with a caret while it is being written. */
function Typed({ text, written }: { text: string; written: number }) {
  return (
    <>
      {text.slice(0, written)}
      {written > 0 && written < text.length && <Caret />}
    </>
  );
}

/* Decision tree of the scheme, drawn in a 320 × 150 box. */
const TREE = { width: 320, height: 150 };
const treeTitle = "Uso de AINE en la ERC";
const treeRoot = "Aclaramiento de creatinina";
const treeBranches = [
  {
    label: "< 30 mL/min",
    result: "AINE contraindicados",
    x: 80,
    d: "M 160 40 C 160 72, 80 72, 80 104",
    labelAt: { x: 112, y: 70 },
  },
  {
    label: "≥ 30 mL/min",
    result: "Evitar AINE; solo si son imprescindibles",
    x: 240,
    d: "M 160 40 C 160 72, 240 72, 240 104",
    labelAt: { x: 208, y: 70 },
  },
] as const;

/** Text route of the scheme, as the accessible alternative lists it. */
const treeRoute = treeBranches.map(
  (branch) => `${treeRoot} → ${branch.label}: ${branch.result}`,
);

function DecisionTree({
  time,
  start = 0,
  reduced,
  scale = 1,
}: {
  time: number;
  start?: number;
  reduced: boolean;
  scale?: number;
}) {
  const root = sceneReveal(time, start, 0.35, reduced);
  const node =
    "font-display text-navy absolute flex -translate-x-1/2 items-center justify-center rounded-lg border bg-white px-2 text-center text-[11px] leading-[15px] font-semibold dark:bg-[#152230] dark:text-slate-100";
  return (
    <div
      className="relative mx-auto"
      style={{ width: TREE.width * scale, height: TREE.height * scale }}
    >
      <div
        className="absolute top-0 left-0 origin-top-left"
        style={{
          width: TREE.width,
          height: TREE.height,
          transform: `scale(${scale})`,
        }}
      >
        <svg
          className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
          aria-hidden="true"
        >
          {treeBranches.map((branch, index) => (
            <Connector
              key={branch.label}
              d={branch.d}
              active
              draw={drawProgress(
                time,
                start + 0.4 + index * 0.15,
                0.5,
                reduced,
              )}
            />
          ))}
        </svg>
        <div
          className={`${node} border-primary-light/40 bg-primary-light/8 dark:border-primary-dark/40 dark:bg-primary-dark/10 top-1 h-9 w-[184px]`}
          style={{ left: TREE.width / 2, opacity: root }}
        >
          {treeRoot}
        </div>
        {treeBranches.map((branch, index) => {
          const label = sceneReveal(
            time,
            start + 0.75 + index * 0.15,
            0.3,
            reduced,
          );
          const leaf = sceneReveal(
            time,
            start + 0.95 + index * 0.15,
            0.35,
            reduced,
          );
          return (
            <div key={branch.label}>
              <span
                className="font-body text-primary-light dark:text-primary-dark absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-1.5 text-[10px] leading-4 font-semibold whitespace-nowrap dark:bg-[#06111f]"
                style={{
                  left: branch.labelAt.x,
                  top: branch.labelAt.y,
                  opacity: label,
                }}
              >
                {branch.label}
              </span>
              <div
                className={`${node} dark:border-primary-dark/15 top-[104px] h-10 w-[150px] border-cyan-800/15`}
                style={{
                  left: branch.x,
                  opacity: leaf,
                  transform: `translateY(${6 * (1 - leaf)}px)`,
                }}
              >
                {branch.result}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Expand control of the chat media (MediaExpandButton). */
function ExpandButton({ label = "Ampliar" }: { label?: string }) {
  return (
    <span
      title={label}
      className="dark:border-primary-dark/15 absolute top-2 right-2 grid size-7 place-items-center rounded-full border border-cyan-800/15 bg-white/90 text-slate-600 dark:bg-[#152230]/90 dark:text-slate-300"
    >
      <Maximize2 size={14} strokeWidth={1.4} />
    </span>
  );
}

/** Scheme card of the chat (chat-diagram): canvas, expand and its sources. */
function SchemeCard({
  children,
  sources,
  footer,
  style,
}: {
  children: ReactNode;
  sources?: number;
  footer?: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <figure
      className="dark:border-primary-dark/20 relative m-0 rounded-2xl border border-cyan-800/15 bg-white/80 p-2.5 dark:bg-[#152230]/90"
      style={style}
    >
      <div className="relative rounded-xl bg-white p-2 dark:bg-[#06111f]">
        <p className="font-display text-navy text-center text-[11px] font-semibold dark:text-slate-100">
          {treeTitle}
        </p>
        {children}
        <ExpandButton />
      </div>
      {sources !== undefined && (
        <div
          className="mt-1.5 flex gap-1"
          style={{ opacity: sources }}
          aria-label="Fuentes del esquema"
        >
          {[4, 5].map((number) => (
            <span
              key={number}
              className="text-primary-light dark:text-primary-dark rounded px-1 py-0.5 text-xs font-semibold"
            >
              [{number}]
            </span>
          ))}
        </div>
      )}
      {footer}
    </figure>
  );
}

/* 15 · Esquemas clínicos: the answer draws a decision tree with its sources. */
const schemesIntro =
  "Criterios para valorar el uso de AINE según la función renal:";
const SCHEMES_TYPING = 0.3;
const schemesCard = SCHEMES_TYPING + typingDuration(schemesIntro.length) + 0.2;
const schemesTree = schemesCard + 0.4;
const schemesSources = schemesTree + 1.6;

function SchemesScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    SCHEMES_TYPING,
    schemesIntro.length,
    reduced,
  );
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="mb-2 min-h-[22px]">
          <Typed text={schemesIntro} written={written} />
        </p>
        <SchemeCard
          sources={sceneReveal(time, schemesSources, 0.35, reduced)}
          style={enter(sceneReveal(time, schemesCard, 0.4, reduced))}
        >
          <DecisionTree time={time} start={schemesTree} reduced={reduced} />
        </SchemeCard>
      </div>
    </div>
  );
}

/** Figure of the corpus: NSAIDs narrow the afferent arteriole. */
function AfferentFigure({
  constrict = 1,
  pulse = 0,
  className = "",
}: {
  constrict?: number;
  pulse?: number;
  className?: string;
}) {
  const half = 9 - 4.5 * constrict;
  const top = 75 - half;
  const bottom = 75 + half;
  const label = "font-body fill-slate-500 text-[12.5px] dark:fill-slate-400";
  return (
    <svg
      viewBox="0 0 372 150"
      aria-hidden="true"
      className={`text-primary-light dark:text-primary-dark ${className}`}
    >
      {/* Afferent arteriole, narrowed by the NSAID effect. */}
      <path
        d={`M 0 66 L 70 66 C 90 66, 92 ${top}, 110 ${top} L 142 ${top} C 146 ${top}, 148 70, 150 70 M 0 84 L 70 84 C 90 84, 92 ${bottom}, 110 ${bottom} L 142 ${bottom} C 146 ${bottom}, 148 80, 150 80`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <rect
        x="104"
        y={top - 6}
        width="44"
        height={bottom - top + 12}
        rx="6"
        fill="currentColor"
        opacity={0.06 + pulse * 0.12}
      />
      {/* Glomerulus inside Bowman's capsule. */}
      <circle
        cx="188"
        cy="75"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {[
        [176, 62],
        [198, 60],
        [208, 78],
        [192, 90],
        [172, 84],
        [188, 75],
      ].map(([cx, cy]) => (
        <circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r="9"
          fill="currentColor"
          fillOpacity="0.06"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.75"
        />
      ))}
      {/* Efferent arteriole. */}
      <path
        d="M 226 70 C 240 66, 250 60, 270 60 L 372 60 M 226 80 C 240 78, 250 74, 270 74 L 372 74"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <text x="4" y="106" className={label}>
        Arteriola aferente
      </text>
      <text x="103" y="40" className={`${label} fill-current`}>
        AINE
      </text>
      <text x="158" y="140" className={label}>
        Glomérulo
      </text>
      <text x="262" y="94" className={label}>
        Arteriola eferente
      </text>
    </svg>
  );
}

/* 16 · Figuras del corpus: the guideline figure, beside the text it explains. */
const figureParagraph = processFollowup.finalOpinion.split("\n\n")[5]!;
const figureLength = answerLength(figureParagraph);
const FIGURE_TYPING = 0.3;
const figureShown = FIGURE_TYPING + typingDuration(figureLength) + 0.25;
const figureConstrict = figureShown + 0.6;

function FiguresScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(time, FIGURE_TYPING, figureLength, reduced);
  const shown = sceneReveal(time, figureShown, 0.4, reduced);
  const constrict = reduced ? 1 : sceneReveal(time, figureConstrict, 1, false);
  const pulse =
    !reduced && time >= figureConstrict + 1 && time < figureConstrict + 2
      ? pulseProgress(time, figureConstrict + 1, 1)
      : 0;
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="mb-3">
          <Answer text={figureParagraph} written={written} />
        </p>
        <figure className="m-0" style={enter(shown)}>
          <div className="dark:border-primary-dark/15 relative rounded-xl border border-cyan-800/15 bg-white p-2 dark:bg-[#06111f]">
            <AfferentFigure
              constrict={constrict}
              pulse={pulse}
              className="h-[118px] w-full"
            />
            <ExpandButton label="Ampliar imagen" />
          </div>
          <figcaption className="font-body mt-1.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            Figura · {sourceTitle}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/** Side panel with tabs, as in the source viewer of the evidence scenes. */
type PanelTab = { icon: LucideIcon; title: string };
function TabbedPanel({
  tabs,
  active,
  tabRef,
  tabStyle,
  children,
}: {
  tabs: PanelTab[];
  active: number;
  tabRef?: (index: number) => (element: HTMLElement | null) => void;
  tabStyle?: (index: number) => CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full min-w-0 flex-col overflow-hidden bg-white dark:bg-[#152230]">
      <div className="vpe-tabs dark:border-primary-dark/15 flex h-11 shrink-0 items-end gap-1 border-b border-cyan-800/10 bg-[#e8f2f7]/30 px-2 pt-1 dark:bg-[#06111f]/45">
        {tabs.map((tab, index) => {
          const current = index === active;
          return (
            <div
              key={tab.title}
              ref={tabRef?.(index)}
              style={tabStyle?.(index)}
              className={`relative -mb-px flex h-10 min-w-0 items-center gap-1.5 rounded-t-md border border-b-0 px-2.5 ${tabs.length > 1 ? "max-w-[150px] flex-1" : "max-w-60 flex-1"} ${current ? "vpe-tab text-navy bg-white dark:bg-[#152230] dark:text-slate-100" : "border-transparent text-slate-500 dark:text-slate-400"}`}
            >
              <tab.icon
                size={18}
                strokeWidth={1.1}
                className="-mt-1 shrink-0"
              />
              <span className="font-body -mt-1 min-w-0 flex-1 truncate text-[11px] font-semibold">
                {tab.title}
              </span>
              {current && (
                <X
                  size={16}
                  strokeWidth={1.1}
                  className="-mt-1 shrink-0 text-slate-400"
                />
              )}
            </div>
          );
        })}
        <span className="mb-1 ml-auto grid size-8 shrink-0 place-items-center text-slate-600 dark:text-slate-300">
          <X size={20} strokeWidth={1.1} />
        </span>
      </div>
      {children}
    </div>
  );
}

/** Zoom controls and download of the scheme panel (diagram-panel). */
function SchemeToolbar({
  downloadRef,
  preparing,
  pressed,
}: {
  downloadRef?: (element: HTMLElement | null) => void;
  preparing: boolean;
  pressed: number;
}) {
  const control =
    "dark:border-primary-dark/20 grid size-8 place-items-center rounded-full border border-cyan-800/20 text-slate-600 dark:text-slate-300";
  return (
    <header className="dark:border-primary-dark/15 flex shrink-0 items-center justify-between gap-2 border-b border-cyan-800/15 px-3 py-2.5">
      <div className="flex items-center gap-1.5">
        <span className={control}>
          <Minus size={14} strokeWidth={1.8} />
        </span>
        <span className="font-body min-w-10 text-center text-xs text-slate-600 tabular-nums dark:text-slate-300">
          100 %
        </span>
        <span className={control}>
          <Plus size={14} strokeWidth={1.8} />
        </span>
        <span className="dark:border-primary-dark/20 font-body inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-800/20 px-2.5 text-xs text-slate-600 dark:text-slate-300">
          <RotateCcw size={14} strokeWidth={1.8} />
          Restablecer
        </span>
      </div>
      <span
        ref={downloadRef}
        className={`font-body text-primary-light dark:text-primary-dark dark:border-primary-dark/20 inline-flex h-8 items-center gap-1.5 rounded-full border border-cyan-800/20 px-3 text-xs transition-colors duration-200 ${pressed > 0 ? "bg-primary-light/10 dark:bg-primary-dark/10" : ""}`}
        style={{ transform: `scale(${1 - pressed * 0.06})` }}
      >
        <Download size={14} strokeWidth={1.8} />
        {preparing ? "Preparando imagen…" : "Descargar imagen"}
      </span>
    </header>
  );
}

/* 17 · Descarga como imagen: the scheme panel exports it as PNG. */
const DOWNLOAD_POINTER = 1.2;
const downloadClick = DOWNLOAD_POINTER + 1;
const downloadReady = downloadClick + 1;

function DownloadScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(1);
  const button = centre(boxes[0]);
  const press = (time - downloadClick) / 0.35;
  const preparing = !reduced && time >= downloadClick && time < downloadReady;
  const saved = sceneReveal(time, downloadReady, 0.4, reduced);
  const pointer = pointerStyle(
    [
      { at: DOWNLOAD_POINTER, point: { x: button.x - 120, y: button.y + 120 } },
      { at: downloadClick - 0.2, point: button },
    ],
    time,
    reduced,
    [downloadClick - 0.15],
    sceneReveal(time, DOWNLOAD_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, downloadReady + 0.2, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full">
      <TabbedPanel tabs={[{ icon: Workflow, title: "Esquema 1" }]} active={0}>
        <SchemeToolbar
          downloadRef={target(0)}
          preparing={preparing}
          pressed={press > 0 && press < 1 ? Math.sin(press * Math.PI) : 0}
        />
        <div className="relative flex-1 px-3 pt-3">
          <p className="font-display text-navy mb-1.5 text-center text-xs font-semibold dark:text-slate-100">
            {treeTitle}
          </p>
          <DecisionTree
            time={time}
            start={0.2}
            reduced={reduced}
            scale={0.72}
          />
        </div>
      </TabbedPanel>
      <div className="absolute inset-x-6 bottom-4" style={enter(saved, 12)}>
        <SceneCard
          icon={FileImage}
          label="Imagen descargada · PNG"
          title="uso-de-aine-en-la-erc.png"
          active
          pulse={
            !reduced && time >= downloadReady && time < downloadReady + 1
              ? pulseProgress(time, downloadReady, 1)
              : 0
          }
        />
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 18 · Tablas comparativas: rows typed with their citations. */
const tableIntro = "Fármacos que conviene revisar en la ERC:";
const tableRows = [
  {
    drug: "AINE",
    note: "Evitar; contraindicados si el aclaramiento es inferior a 30 mL/min.",
    citation: 4,
  },
  {
    drug: "IECA y ARA-II",
    note: "Renoprotectores; en fases avanzadas pueden requerir menos dosis.",
    citation: 5,
  },
  {
    drug: "Ahorradores de potasio",
    note: "Evitar en la insuficiencia renal; no asociar con IECA, ARA-II o AINE.",
    citation: 5,
  },
] as const;
const tableCells = tableRows.flatMap((row) => [
  { text: row.drug },
  { text: row.note, citation: `[${row.citation}]` },
]);
const tableLength = tableCells.reduce(
  (sum, cell) => sum + cell.text.length + (cell.citation?.length ?? 0),
  0,
);
const TABLE_TYPING = 0.3;
const tableStart = TABLE_TYPING + typingDuration(tableIntro.length) + 0.2;
const tableEnd = tableStart + 0.4 + typingDuration(tableLength);

function TablesScene({ time, reduced }: SceneProps) {
  const intro = writtenCharacters(
    time,
    TABLE_TYPING,
    tableIntro.length,
    reduced,
  );
  let budget = writtenCharacters(time, tableStart + 0.4, tableLength, reduced);
  const cells = tableCells.map((cell) => {
    const count = Math.min(budget, cell.text.length);
    budget = Math.max(0, budget - cell.text.length);
    const cited = cell.citation ? budget >= cell.citation.length : false;
    if (cell.citation) budget = Math.max(0, budget - cell.citation.length);
    return { count, cited, typing: count > 0 && count < cell.text.length };
  });
  const table = sceneReveal(time, tableStart, 0.35, reduced);
  const head =
    "font-display text-navy px-3 py-2 text-left text-[11px] font-semibold dark:text-slate-100";
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="mb-3 min-h-[22px]">
          <Typed text={tableIntro} written={intro} />
        </p>
        <div
          className="dark:border-primary-dark/15 overflow-hidden rounded-xl border border-cyan-800/15 bg-white/90 dark:bg-[#152230]/90"
          style={{ opacity: table }}
        >
          <table className="w-full table-fixed border-collapse">
            <thead className="bg-primary-light/6 dark:bg-primary-dark/8">
              <tr className="dark:border-primary-dark/15 border-b border-cyan-800/15">
                <th className={`${head} w-[118px]`}>Fármaco</th>
                <th className={head}>En la ERC</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs leading-[18px] text-slate-600 dark:text-slate-300">
              {tableRows.map((row, index) => {
                const drug = cells[index * 2]!;
                const note = cells[index * 2 + 1]!;
                return (
                  <tr
                    key={row.drug}
                    className="dark:border-primary-dark/10 border-b border-cyan-800/10 align-top last:border-b-0"
                  >
                    <td className="text-navy px-3 py-2 font-semibold dark:text-slate-100">
                      {row.drug.slice(0, drug.count)}
                      {drug.typing && <Caret />}
                    </td>
                    <td className="px-3 py-2">
                      {row.note.slice(0, note.count)}
                      {note.typing && <Caret />}
                      {note.cited && (
                        <span className="text-primary-light dark:text-primary-dark ml-0.5 px-0.5 align-super text-[10px] leading-none font-semibold">
                          [{row.citation}]
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* 19 · Recorrido en texto: the scheme read as a list of steps. */
const TEXTALT_POINTER = 1.4;
const textaltClick = TEXTALT_POINTER + 1;
const textaltOpen = textaltClick + 0.15;
const textaltTyping = textaltOpen + 0.35;
const textaltLength = treeRoute.reduce((sum, line) => sum + line.length, 0);
const textaltEnd = textaltTyping + typingDuration(textaltLength);

function TextAltScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(1);
  const toggle = centre(boxes[0]);
  const open = sceneReveal(time, textaltOpen, 0.35, reduced);
  let budget = writtenCharacters(time, textaltTyping, textaltLength, reduced);
  const pointer = pointerStyle(
    [
      { at: TEXTALT_POINTER, point: { x: toggle.x + 110, y: toggle.y - 60 } },
      { at: textaltClick - 0.2, point: { x: toggle.x - 30, y: toggle.y } },
    ],
    time,
    reduced,
    [textaltClick - 0.15],
    sceneReveal(time, TEXTALT_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, textaltOpen + 0.5, 0.3, reduced)),
  );
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-center px-6"
    >
      <ProcessChatVeil />
      <SchemeCard
        footer={
          <>
            <span
              ref={target(0)}
              className="font-body text-primary-light dark:text-primary-dark mt-2.5 inline-flex items-center gap-1 rounded-md text-xs font-semibold"
            >
              <ChevronDown
                size={14}
                strokeWidth={1.8}
                style={{ transform: `rotate(${-90 + 90 * open}deg)` }}
              />
              Ver recorrido en texto
            </span>
            <div className="grid" style={{ gridTemplateRows: `${open}fr` }}>
              <ol className="font-body min-h-0 list-none space-y-1.5 overflow-hidden pt-2 text-xs leading-[18px] text-slate-600 dark:text-slate-300">
                {treeRoute.map((line) => {
                  const count = Math.min(budget, line.length);
                  budget = Math.max(0, budget - line.length);
                  return (
                    <li
                      key={line}
                      className="border-primary-light/40 dark:border-primary-dark/40 min-h-9 border-l-2 pl-2.5"
                    >
                      <Typed text={line} written={count} />
                    </li>
                  );
                })}
              </ol>
            </div>
          </>
        }
      >
        <DecisionTree time={time} start={0.2} reduced={reduced} scale={0.72} />
      </SchemeCard>
      <Pointer style={pointer} />
    </div>
  );
}

/* 20 · Panel lateral: source, scheme and figure open as tabs. */
const panelTabs: PanelTab[] = [
  { icon: FileText, title: sourceTitle },
  { icon: Workflow, title: "Esquema 1" },
  { icon: ImageIcon, title: "Imagen" },
];
const PANEL_SCHEME = 1.3;
const PANEL_IMAGE = 2.9;
const PANEL_POINTER = 4.3;
const panelBack = PANEL_POINTER + 1;
const panelHeaders = [
  { label: "Fuente de consulta", title: sourceTitle },
  { label: "Esquema", title: treeTitle },
  { label: "Imagen", title: "AINE y arteriola aferente" },
] as const;

function PanelScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(3);
  // The pointer returns to the scheme tab, the frame the scene rests on.
  const active = reduced
    ? 1
    : time >= panelBack
      ? 1
      : time >= PANEL_IMAGE
        ? 2
        : time >= PANEL_SCHEME
          ? 1
          : 0;
  const opened = [
    1,
    sceneReveal(time, PANEL_SCHEME - 0.2, 0.3, reduced),
    sceneReveal(time, PANEL_IMAGE - 0.2, 0.3, reduced),
  ];
  const first = centre(boxes[1]);
  const pointer = pointerStyle(
    [
      { at: PANEL_POINTER, point: { x: first.x + 150, y: first.y + 130 } },
      { at: panelBack - 0.2, point: first },
    ],
    time,
    reduced,
    [panelBack - 0.15],
    sceneReveal(time, PANEL_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, panelBack + 0.4, 0.3, reduced)),
  );
  const layer = (index: number): CSSProperties => ({
    opacity: active === index ? 1 : 0,
    transition: reduced ? undefined : "opacity 250ms ease-out",
  });
  return (
    <div ref={root} className="relative h-full">
      <TabbedPanel
        tabs={panelTabs}
        active={active}
        tabRef={target}
        tabStyle={(index) => ({
          opacity: opened[index],
          transform: `translateY(${6 * (1 - opened[index]!)}px)`,
        })}
      >
        <header className="dark:border-primary-dark/15 shrink-0 border-b border-cyan-800/10 px-4 py-3">
          <p className={eyebrow}>{panelHeaders[active].label}</p>
          <p className="font-display text-navy mt-0.5 truncate text-sm font-semibold dark:text-slate-100">
            {panelHeaders[active].title}
          </p>
        </header>
        <div className="relative min-h-0 flex-1">
          <div
            className="font-body absolute inset-0 overflow-hidden px-5 pt-4 text-[13px] leading-6 text-slate-700 dark:text-slate-300"
            style={layer(0)}
          >
            <Passage />
          </div>
          <div className="absolute inset-0 px-3 pt-6" style={layer(1)}>
            <DecisionTree time={time} start={PANEL_SCHEME} reduced={reduced} />
          </div>
          <div className="absolute inset-0 px-6 pt-5" style={layer(2)}>
            <AfferentFigure className="h-[150px] w-full" />
          </div>
        </div>
      </TabbedPanel>
      <Pointer style={pointer} />
    </div>
  );
}

export const formatScenes: Record<FormatFeatureId, SceneDefinition> = {
  schemes: {
    render: (props) => <SchemesScene {...props} />,
    surface: "chat",
    duration: schemesSources + 1.2,
  },
  figures: {
    render: (props) => <FiguresScene {...props} />,
    surface: "chat",
    duration: figureConstrict + 2.4,
  },
  download: {
    render: (props) => <DownloadScene {...props} />,
    surface: "panel",
    duration: downloadReady + 1.6,
  },
  tables: {
    render: (props) => <TablesScene {...props} />,
    surface: "chat",
    duration: tableEnd + 1.2,
  },
  textalt: {
    render: (props) => <TextAltScene {...props} />,
    surface: "chat",
    duration: textaltEnd + 1.2,
  },
  panel: {
    render: (props) => <PanelScene {...props} />,
    surface: "panel",
    duration: panelBack + 1.4,
  },
};

"use client";

import { AudioLines, Download, FileImage, Maximize2 } from "lucide-react";
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
  PlatformTabs,
  ZoomControls,
  zoomControl,
  type PlatformTab,
} from "./platform-ui";
import {
  Answer,
  Caret,
  ChatHeader,
  Connector,
  Passage,
  SceneCard,
  answerLength,
  bodyText,
  curvePath,
  eyebrow,
  sourceTitle,
  useBoxes,
  verticalCurve,
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
const press = (time: number, at: number) => {
  const t = (time - at) / 0.35;
  return t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0;
};

function Typed({ text, written }: { text: string; written: number }) {
  return (
    <>
      {text.slice(0, written)}
      {written > 0 && written < text.length && <Caret />}
    </>
  );
}

/*
 * Decision tree of the scheme, in the look of the chat's diagrams (Mermaid):
 * square nodes with a pale fill and a thin border, a diamond for the
 * decision, solid orthogonal connectors with rounded elbows and filled
 * arrowheads, and plain edge labels over the line. Drawn in a 320 × 150 box.
 */
const TREE = { width: 320, height: 150 };
const treeRoot = "¿Aclaramiento de creatinina < 30 mL/min?";
const treeBranches = [
  {
    label: "Sí",
    result: "AINE contraindicados",
    x: 70,
    d: "M 76 40 H 74 Q 70 40 70 44 V 101",
  },
  {
    label: "No",
    result: "Evitar AINE; solo si son imprescindibles",
    x: 250,
    d: "M 244 40 H 246 Q 250 40 250 44 V 101",
  },
] as const;

/** Text route of the scheme, as the accessible alternative lists it. */
const treeRoute = treeBranches.map(
  (branch) => `${treeRoot} → ${branch.label}: ${branch.result}`,
);

const diagramNode =
  "font-body absolute flex items-center justify-center border border-[#3f7c88]/80 bg-[#e9f1f5] px-2 text-center text-[11px] leading-[14px] text-navy dark:border-primary-dark/50 dark:bg-[#152230] dark:text-slate-100";

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
          className="pointer-events-none absolute inset-0 size-full text-[#2f6b77] dark:text-[#7fd3dc]"
          aria-hidden="true"
        >
          {/* Decision diamond. */}
          <polygon
            points="160,0 244,40 160,80 76,40"
            className="fill-[#e9f1f5] stroke-[#3f7c88]/80 dark:fill-[#152230] dark:stroke-[#7fd3dc]/50"
            strokeWidth="1"
            style={{ opacity: root }}
          />
          {treeBranches.map((branch, index) => {
            const draw = drawProgress(
              time,
              start + 0.4 + index * 0.15,
              0.5,
              reduced,
            );
            return (
              <g key={branch.label}>
                <path
                  d={branch.d}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  pathLength="1"
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - draw}
                />
                <path
                  d={`M ${branch.x - 4} 100 L ${branch.x + 4} 100 L ${branch.x} 106 Z`}
                  fill="currentColor"
                  style={{ opacity: draw >= 0.98 ? 1 : 0 }}
                />
              </g>
            );
          })}
        </svg>
        <div
          className="font-body text-navy absolute top-0 left-[102px] flex h-20 w-[116px] items-center justify-center text-center text-[11px] leading-[14px] dark:text-slate-100"
          style={{ opacity: root }}
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
              {/* Edge label written over the line, as Mermaid does. */}
              <span
                className="font-body text-navy absolute -translate-x-1/2 text-[11px] leading-[14px] dark:text-slate-100"
                style={{ left: branch.x, top: 64, opacity: label }}
              >
                {branch.label}
              </span>
              <div
                className={`${diagramNode} top-[106px] h-10 w-[130px]`}
                style={{
                  left: branch.x - 65,
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

/**
 * Scheme card of the chat (chat-diagram): a framed white canvas, its sources
 * below. The whole canvas opens the panel; there is no visible expand icon.
 */
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
      <div className="relative rounded-xl bg-white p-2.5 dark:bg-[#06111f]">
        {children}
      </div>
      {sources !== undefined && (
        <div
          className="mt-2 flex gap-1"
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
const figureCaption = "Efecto de los AINE sobre la arteriola aferente.";
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
        {/* resource-figure: framed image, caption with a top rule. */}
        <figure
          className="dark:border-primary-dark/20 shadow-big-blocks m-0 overflow-hidden rounded-xl border border-cyan-800/15 bg-white/80 dark:bg-[#152230]/90"
          style={enter(shown)}
        >
          <div className="flex items-center justify-center bg-white/80 p-2 dark:bg-[#0b1a29]/75">
            <AfferentFigure
              constrict={constrict}
              pulse={pulse}
              className="h-[104px] w-full"
            />
          </div>
          <figcaption className="dark:border-primary-dark/10 font-body border-t border-cyan-800/10 px-3 py-1.5 text-[11px] leading-[18px] text-slate-600 dark:text-slate-400">
            {figureCaption}
          </figcaption>
        </figure>
      </div>
    </div>
  );
}

/* 17 · Descarga como imagen: the scheme panel exports it as PNG. */
const DOWNLOAD_POINTER = 1.2;
const downloadClick = DOWNLOAD_POINTER + 1;
const downloadReady = downloadClick + 1;

function DownloadScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(1);
  const button = centre(boxes[0]);
  const pressed = press(time, downloadClick);
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
    <div
      ref={root}
      className="relative flex h-full flex-col bg-white dark:bg-[#152230]"
    >
      <PlatformTabs
        tabs={[{ kind: "diagram", title: "Esquema 1" }]}
        active={0}
      />
      {/* diagram-panel: zoom controls and «Descargar imagen». */}
      <ZoomControls>
        <span
          ref={target(0)}
          className={`${zoomControl} px-2.5 ${pressed > 0 ? "bg-primary-light/10 dark:bg-primary-dark/10" : ""}`}
          style={{ transform: `scale(${1 - pressed * 0.06})` }}
        >
          <Download size={14} strokeWidth={1.8} />
          {preparing ? "Preparando imagen…" : "Descargar imagen"}
        </span>
      </ZoomControls>
      <div className="relative flex-1 px-3 pt-4">
        <DecisionTree time={time} start={0.2} reduced={reduced} />
      </div>
      {/* The browser's download of the PNG: a representation, outside the UI. */}
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
    "font-body h-8 px-2 text-left align-middle text-[11px] font-normal text-slate-600 dark:text-slate-400";
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="mb-3 min-h-[22px]">
          <Typed text={tableIntro} written={intro} />
        </p>
        <div
          className="dark:border-primary-dark/15 overflow-hidden rounded border border-cyan-800/15"
          style={{ opacity: table }}
        >
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="dark:border-primary-dark/15 border-b border-cyan-800/15">
                <th className={`${head} w-[104px]`}>Fármaco</th>
                <th className={head}>En la ERC</th>
              </tr>
            </thead>
            <tbody className="font-body text-xs leading-[18px] text-slate-900 dark:text-slate-100">
              {tableRows.map((row, index) => {
                const drug = cells[index * 2]!;
                const note = cells[index * 2 + 1]!;
                return (
                  <tr
                    key={row.drug}
                    className="dark:border-primary-dark/10 border-b border-cyan-800/10 align-middle last:border-b-0"
                  >
                    <td className="p-2">
                      {row.drug.slice(0, drug.count)}
                      {drug.typing && <Caret />}
                    </td>
                    <td className="p-2">
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

/*
 * 19 · Recorrido en texto: a representation, not a visible control. Every
 * scheme carries its route as text for screen readers (DiagramAccessibleText);
 * the scene shows the scheme and what the reader announces.
 */
const TEXTALT_READ = 1.6;
const textaltLength = treeRoute.reduce((sum, line) => sum + line.length, 0);
const textaltEnd = TEXTALT_READ + 0.4 + typingDuration(textaltLength);

function TextAltScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const curve =
    boxes.length === 2 ? verticalCurve(boxes[0]!, boxes[1]!) : undefined;
  const reader = sceneReveal(time, TEXTALT_READ, 0.35, reduced);
  let budget = writtenCharacters(
    time,
    TEXTALT_READ + 0.4,
    textaltLength,
    reduced,
  );
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col justify-center gap-5 px-8 py-6"
    >
      <svg
        className="text-primary-light dark:text-primary-dark pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
      >
        {curve && (
          <Connector
            d={curvePath(curve)}
            active
            draw={drawProgress(time, TEXTALT_READ - 0.5, 0.5, reduced)}
          />
        )}
      </svg>
      <div ref={target(0)} className="mx-auto w-[230px]">
        <SchemeCard>
          <DecisionTree
            time={time}
            start={0.2}
            reduced={reduced}
            scale={0.58}
          />
        </SchemeCard>
      </div>
      <div ref={target(1)} style={enter(reader)}>
        <SceneCard
          icon={AudioLines}
          label="Lector de pantalla"
          title="Recorrido en texto del esquema"
          active={reader > 0.5 && budget < textaltLength}
        >
          <ol className="font-body mt-2 list-none space-y-1 text-[11px] leading-4 text-slate-600 dark:text-slate-300">
            {treeRoute.map((line) => {
              const count = Math.min(budget, line.length);
              budget = Math.max(0, budget - line.length);
              return (
                <li key={line} className="min-h-8">
                  <Typed text={line} written={count} />
                </li>
              );
            })}
          </ol>
        </SceneCard>
      </div>
    </div>
  );
}

/* 20 · Panel lateral: source, scheme and figure open as tabs (citation-viewer). */
const panelTabs: PlatformTab[] = [
  { kind: "document", title: sourceTitle },
  { kind: "diagram", title: "Esquema 1" },
  { kind: "image", title: figureCaption },
];
const PANEL_SCHEME = 1.3;
const PANEL_IMAGE = 2.9;
const PANEL_POINTER = 4.3;
const panelBack = PANEL_POINTER + 1;

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
  const tab = centre(boxes[1]);
  const pointer = pointerStyle(
    [
      { at: PANEL_POINTER, point: { x: tab.x + 150, y: tab.y + 130 } },
      { at: panelBack - 0.2, point: tab },
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
    <div
      ref={root}
      className="relative flex h-full flex-col bg-white dark:bg-[#152230]"
    >
      <PlatformTabs
        tabs={panelTabs}
        active={active}
        tabRef={target}
        tabStyle={(index) => ({
          opacity: opened[index],
          transform: `translateY(${6 * (1 - opened[index]!)}px)`,
        })}
      />
      <div className="relative min-h-0 flex-1">
        {/* Document: the source header and the passage. */}
        <div className="absolute inset-0 flex flex-col" style={layer(0)}>
          <header className="dark:border-primary-dark/15 flex shrink-0 items-center gap-2 border-b border-cyan-800/10 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className={eyebrow}>Fuente de consulta</p>
              <p className="font-display text-navy mt-0.5 truncate text-sm font-semibold dark:text-slate-100">
                {sourceTitle}
              </p>
            </div>
            <span className="font-body flex shrink-0 items-center gap-1.5 px-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <Maximize2 size={14} strokeWidth={1.8} />
              Ver documento completo
            </span>
          </header>
          <div className="font-body min-h-0 flex-1 overflow-hidden px-5 pt-4 text-[13px] leading-6 text-slate-700 dark:text-slate-300">
            <Passage />
          </div>
        </div>
        {/* Scheme: zoom controls with the download, then the canvas. */}
        <div className="absolute inset-0 flex flex-col" style={layer(1)}>
          <ZoomControls>
            <span className={`${zoomControl} px-2.5`}>
              <Download size={14} strokeWidth={1.8} />
              Descargar imagen
            </span>
          </ZoomControls>
          <div className="px-3 pt-4">
            <DecisionTree time={time} start={PANEL_SCHEME} reduced={reduced} />
          </div>
        </div>
        {/* Image: zoom controls, then the figure. */}
        <div className="absolute inset-0 flex flex-col" style={layer(2)}>
          <ZoomControls />
          <div className="px-4 pt-6">
            <AfferentFigure className="h-[150px] w-full" />
          </div>
        </div>
      </div>
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

"use client";

import {
  BookmarkCheck,
  BookmarkPlus,
  Check,
  Copy,
  FileText,
  FolderInput,
  FolderOpen,
  MessageSquare,
  Moon,
  MoreHorizontal,
  PencilLine,
  Pin,
  Plus,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  ProcessChatVeil,
  PulseLayer,
  processBorderClass,
  processCardClass,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import type { WorkspaceFeatureId } from "../features-data";
import { Pointer, pointerStyle } from "./consultation-scenes";
import {
  Answer,
  Caret,
  ChatHeader,
  Composer,
  SceneCard,
  answerLength,
  bodyText,
  claimParagraph,
  eyebrow,
  type SceneDefinition,
  type SceneProps,
} from "./evidence-scenes";

/*
 * «Espacio personal» scenes. The consultations of the other groups live in a
 * personal project, «Fármacos en la ERC». UI strings come from the chat
 * (messages/es/chatShell.json, chatThread.json and the ui package).
 */

const projectName = "Fármacos en la ERC";

const enter = (value: number, distance = 8): CSSProperties => ({
  opacity: value,
  transform: `translateY(${distance * (1 - value)}px)`,
});
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

/** Project heading: «Proyecto personal» and its name. */
function ProjectTitle({ style }: { style?: CSSProperties }) {
  return (
    <div style={style}>
      <p className={eyebrow}>Proyecto personal</p>
      <div className="mt-1.5 flex items-center gap-2">
        <FolderOpen
          size={20}
          strokeWidth={1.1}
          className="text-primary-light dark:text-primary-dark shrink-0"
        />
        <h3 className="font-display text-navy text-lg font-semibold tracking-tight dark:text-slate-50">
          {projectName}
        </h3>
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  pressed = 0,
  muted = false,
}: {
  children: ReactNode;
  pressed?: number;
  muted?: boolean;
}) {
  return (
    <span
      className={`bg-primary-light dark:bg-primary-dark font-body inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-white transition-opacity duration-200 dark:text-[#04111e] ${muted ? "opacity-45" : ""}`}
      style={{ transform: `scale(${1 - pressed * 0.06})` }}
    >
      {children}
    </span>
  );
}

/* 21 · Proyectos: conversations gathered in a project. */
const projectChats = [
  { title: "AINE en paciente con ERC", when: "ayer" },
  { title: "IECA e hiperpotasemia", when: "lun." },
  { title: "Ajuste de dosis de metformina", when: "12 oct." },
] as const;
const PROJECTS_MOVED = 2.6;

function ProjectsScene({ time, reduced }: SceneProps) {
  const moved = sceneReveal(time, PROJECTS_MOVED, 0.45, reduced);
  const pulse =
    !reduced && time >= PROJECTS_MOVED + 0.3 && time < PROJECTS_MOVED + 1.3
      ? pulseProgress(time, PROJECTS_MOVED + 0.3, 1)
      : 0;
  const row =
    "relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13px]";
  return (
    <div className="relative flex h-full flex-col px-6 pt-6">
      <ProjectTitle style={enter(sceneReveal(time, 0.2, 0.35, reduced))} />
      <div
        className="dark:border-primary-dark/15 mt-4 flex gap-5 border-b border-cyan-800/12"
        style={{ opacity: sceneReveal(time, 0.4, 0.3, reduced) }}
      >
        <span className="font-body border-primary-light text-navy dark:border-primary-dark -mb-px border-b-2 pb-2 text-xs font-semibold dark:text-slate-100">
          Chats{" "}
          <span className="text-slate-500 tabular-nums dark:text-slate-400">
            {moved > 0.5 ? 4 : 3}
          </span>
        </span>
        <span className="font-body pb-2 text-xs text-slate-500 dark:text-slate-400">
          Fuentes
        </span>
      </div>
      <ul className="font-body mt-2">
        <li
          className="grid"
          style={{ gridTemplateRows: `${moved}fr`, opacity: moved }}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              className={`${row} bg-primary-light/6 dark:bg-primary-dark/8 text-navy font-semibold dark:text-slate-100`}
            >
              <PulseLayer value={pulse} />
              <FolderInput
                size={16}
                strokeWidth={1.3}
                className="text-primary-light dark:text-primary-dark relative shrink-0"
              />
              <span className="relative min-w-0 flex-1 truncate">
                Analgesia en ERC grave
              </span>
              <span className="text-primary-light dark:text-primary-dark relative text-[11px] font-semibold">
                Movida al proyecto
              </span>
            </div>
          </div>
        </li>
        {projectChats.map((chat, index) => (
          <li
            key={chat.title}
            className={`${row} text-slate-700 dark:text-slate-200`}
            style={enter(sceneReveal(time, 0.7 + index * 0.25, 0.3, reduced))}
          >
            <MessageSquare
              size={16}
              strokeWidth={1.3}
              className="shrink-0 text-slate-400"
            />
            <span className="min-w-0 flex-1 truncate">{chat.title}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {chat.when}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 22 · Instrucciones comunes: written once for the whole project. */
const instructionsText =
  "Comparar los fármacos en tablas e indicar siempre el ajuste según el filtrado glomerular.";
const INSTRUCTIONS_TYPING = 0.7;
const instructionsTyped =
  INSTRUCTIONS_TYPING + typingDuration(instructionsText.length);
const instructionsSave = instructionsTyped + 0.6;
const instructionsSaved = instructionsSave + 0.8;

function InstructionsScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    INSTRUCTIONS_TYPING,
    instructionsText.length,
    reduced,
  );
  const saving =
    !reduced && time >= instructionsSave && time < instructionsSaved;
  const saved = reduced || time >= instructionsSaved;
  return (
    <div className="relative flex h-full flex-col px-6 pt-6">
      <ProjectTitle style={enter(sceneReveal(time, 0.1, 0.35, reduced))} />
      <section
        className={`${processCardClass} ${processBorderClass(written > 0 && !saved)} relative mt-4 p-4`}
        style={enter(sceneReveal(time, 0.3, 0.35, reduced))}
      >
        <PulseLayer
          value={
            saved && !reduced && time < instructionsSaved + 1
              ? pulseProgress(time, instructionsSaved, 1)
              : 0
          }
        />
        <div className="relative flex items-center justify-between gap-3">
          <p className="font-display text-navy text-sm font-semibold dark:text-slate-100">
            Instrucciones del proyecto
          </p>
          <span className="font-body text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
            Revisión {saved ? 2 : 1}
          </span>
        </div>
        <div className="dark:border-primary-dark/15 font-body relative mt-3 min-h-[76px] rounded-xl border border-cyan-800/15 bg-white px-3 py-2.5 text-[13px] leading-[22px] text-slate-700 dark:bg-[#06111f] dark:text-slate-200">
          {written > 0 ? (
            <Typed text={instructionsText} written={written} />
          ) : (
            <span className="text-slate-400">
              Sin instrucciones adicionales
            </span>
          )}
        </div>
        <p className="font-body relative mt-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
          Indicar el formato, idioma o enfoque de las respuestas. Las reglas
          clínicas y las fuentes institucionales mantienen su prioridad.
        </p>
        <div className="relative mt-3 flex items-center justify-end gap-2">
          <span className="font-body px-2 text-xs text-slate-500 dark:text-slate-400">
            Cancelar
          </span>
          <PrimaryButton
            pressed={press(time, instructionsSave - 0.15)}
            muted={written === 0}
          >
            {saved && <Check size={14} strokeWidth={1.8} />}
            {saving ? "Guardando…" : saved ? "Guardadas" : "Guardar"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

/* 23 · Respuestas como fuente: the final answer saved to the project. */
const savedLength = answerLength(claimParagraph);
const SAVED_TYPING = 0.3;
const savedActions = SAVED_TYPING + typingDuration(savedLength) + 0.2;
const savedPointer = savedActions + 0.3;
const savedClick = savedPointer + 1;
const savedCard = savedClick + 0.4;

function SavedScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(time, SAVED_TYPING, savedLength, reduced);
  const saved = reduced || time >= savedClick;
  // Artboard coordinates of the «Guardar en fuentes» control.
  const button = { x: 300, y: 168 };
  const pointer = pointerStyle(
    [
      { at: savedPointer, point: { x: 190, y: 250 } },
      { at: savedClick - 0.2, point: button },
    ],
    time,
    reduced,
    [savedClick - 0.15],
    sceneReveal(time, savedPointer, 0.3, reduced) *
      (1 - sceneReveal(time, savedCard + 0.3, 0.3, reduced)),
  );
  const icon =
    "grid size-8 place-items-center rounded-full text-slate-500 dark:text-slate-400";
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="min-h-[88px]">
          <Answer text={claimParagraph} written={written} />
        </p>
        <div
          className="mt-2 flex h-9 items-center gap-0.5"
          style={{ opacity: sceneReveal(time, savedActions, 0.3, reduced) }}
        >
          <span className={icon}>
            <Copy size={15} strokeWidth={1.4} />
          </span>
          <span className={icon}>
            <ThumbsUp size={15} strokeWidth={1.4} />
          </span>
          <span className={icon}>
            <ThumbsDown size={15} strokeWidth={1.4} />
          </span>
          <span
            className={`font-body ml-auto inline-flex h-8 w-[156px] items-center justify-center gap-1.5 rounded-full border text-xs font-semibold transition-colors duration-200 ${saved ? "border-primary-light/40 bg-primary-light/10 text-primary-light dark:border-primary-dark/40 dark:bg-primary-dark/12 dark:text-primary-dark" : "dark:border-primary-dark/20 border-cyan-800/20 text-slate-600 dark:text-slate-300"}`}
            style={{
              transform: `scale(${1 - press(time, savedClick - 0.15) * 0.06})`,
            }}
          >
            {saved ? (
              <BookmarkCheck size={15} strokeWidth={1.4} />
            ) : (
              <BookmarkPlus size={15} strokeWidth={1.4} />
            )}
            {saved ? "Guardada en fuentes" : "Guardar en fuentes"}
          </span>
        </div>
      </div>
      <div
        className="absolute inset-x-6 bottom-5"
        style={enter(sceneReveal(time, savedCard, 0.4, reduced), 12)}
      >
        <SceneCard
          icon={BookmarkCheck}
          label="Fuente del proyecto · Disponible"
          title="Respuesta: AINE en paciente con ERC"
          active
          pulse={
            !reduced && time >= savedCard + 0.3 && time < savedCard + 1.3
              ? pulseProgress(time, savedCard + 0.3, 1)
              : 0
          }
        />
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 24 · Preferencias de respuesta: kept between chats. */
const preferencesText =
  "Prefiero respuestas breves, con las dosis en tabla y sin repetir los antecedentes del paciente.";
const PREFERENCES_TYPING = 0.7;
const preferencesTyped =
  PREFERENCES_TYPING + typingDuration(preferencesText.length);
const preferencesSave = preferencesTyped + 0.5;
const preferencesSaved = preferencesSave + 0.8;

function PreferencesScene({ time, reduced }: SceneProps) {
  const written = writtenCharacters(
    time,
    PREFERENCES_TYPING,
    preferencesText.length,
    reduced,
  );
  const saving = !reduced && time >= preferencesSave && time < preferencesSaved;
  const saved = reduced || time >= preferencesSaved;
  return (
    <div className="relative flex h-full flex-col px-6 pt-6">
      <div style={enter(sceneReveal(time, 0.1, 0.35, reduced))}>
        <p className={eyebrow}>Perfil y configuración</p>
        <h3 className="font-display text-navy mt-1.5 text-lg font-semibold tracking-tight dark:text-slate-50">
          Preferencias de respuesta
        </h3>
      </div>
      <section
        className={`${processCardClass} ${processBorderClass(written > 0 && !saved)} relative mt-4 p-4`}
        style={enter(sceneReveal(time, 0.3, 0.35, reduced))}
      >
        <PulseLayer
          value={
            saved && !reduced && time < preferencesSaved + 1
              ? pulseProgress(time, preferencesSaved, 1)
              : 0
          }
        />
        <p className="font-body relative text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          Texto de preferencias
        </p>
        <div className="dark:border-primary-dark/15 font-body relative mt-2 min-h-[76px] rounded-xl border border-cyan-800/15 bg-white px-3 py-2.5 text-[13px] leading-[22px] text-slate-700 dark:bg-[#06111f] dark:text-slate-200">
          {written > 0 ? (
            <Typed text={preferencesText} written={written} />
          ) : (
            <span className="text-slate-400">
              Por ejemplo: Prefiero respuestas breves.
            </span>
          )}
        </div>
        <p className="font-body relative mt-2 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
          Se aplican a tus chats. Solo ajustan la presentación; la finalidad y
          las reglas clínicas de las respuestas no cambian.
        </p>
        <div className="relative mt-3 flex justify-end">
          <PrimaryButton
            pressed={press(time, preferencesSave - 0.15)}
            muted={written === 0}
          >
            {saved && <Check size={14} strokeWidth={1.8} />}
            {saving ? "Guardando…" : saved ? "Guardadas" : "Guardar"}
          </PrimaryButton>
        </div>
      </section>
    </div>
  );
}

/* 25 · Documentos privados: project sources, citable once processed. */
const privateSources = [
  { name: "Notas de la sesión clínica.md", meta: "Markdown · Revisión 1" },
  { name: "Ajuste de dosis en ERC.txt", meta: "TXT · Revisión 2" },
] as const;
const PRIVATE_ADDED = 0.6;
const PRIVATE_PROCESS = 1.3;
const privateReady = PRIVATE_PROCESS + 2;
const PRIVATE_PAGES = 18;

function SourceRow({
  icon: Icon = FileText,
  name,
  meta,
  status,
  children,
  active = false,
  pulse = 0,
  style,
}: {
  icon?: LucideIcon;
  name: string;
  meta: string;
  status: ReactNode;
  children?: ReactNode;
  active?: boolean;
  pulse?: number;
  style?: CSSProperties;
}) {
  return (
    <li
      className={`${processCardClass} ${processBorderClass(active)} relative px-3 py-2`}
      style={style}
    >
      <PulseLayer value={pulse} />
      <div className="relative flex items-center gap-3">
        <span className="border-primary-light/20 bg-primary-light/8 text-primary-light dark:border-primary-dark/25 dark:bg-primary-dark/10 dark:text-primary-dark grid size-7 shrink-0 place-items-center rounded-lg border">
          <Icon size={16} strokeWidth={1.3} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-navy truncate text-[13px] font-semibold dark:text-slate-100">
            {name}
          </p>
          <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            {meta}
          </p>
        </div>
        <span className="font-body shrink-0 text-[11px] font-semibold">
          {status}
        </span>
      </div>
      {children}
    </li>
  );
}

function PrivateScene({ time, reduced }: SceneProps) {
  const added = sceneReveal(time, PRIVATE_ADDED, 0.4, reduced);
  const progress = reduced
    ? 1
    : Math.max(0, Math.min(1, (time - PRIVATE_PROCESS) / 2));
  const ready = reduced || time >= privateReady;
  const pages = Math.round(progress * PRIVATE_PAGES);
  return (
    <div className="relative flex h-full flex-col px-6 pt-6">
      <div
        className="flex items-start justify-between gap-3"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      >
        <div>
          <p className={eyebrow}>{projectName}</p>
          <h3 className="font-display text-navy mt-1.5 text-lg font-semibold tracking-tight dark:text-slate-50">
            Fuentes
          </h3>
        </div>
        <span className="dark:border-primary-dark/20 font-body text-primary-light dark:text-primary-dark mt-1 inline-flex h-8 items-center gap-1 rounded-full border border-cyan-800/20 px-3 text-xs font-semibold">
          <Plus size={14} strokeWidth={1.8} />
          Añadir
        </span>
      </div>
      <p className="font-body mt-1 text-[11px] text-slate-500 tabular-nums dark:text-slate-400">
        {added > 0.5 ? 3 : 2} de 20 fuentes · Solo disponible para el
        propietario de este proyecto.
      </p>
      <ul className="mt-2.5 space-y-1.5">
        <div
          className="grid"
          style={{ gridTemplateRows: `${added}fr`, opacity: added }}
        >
          <div className="min-h-0 overflow-hidden">
            <SourceRow
              name="Protocolo de analgesia del servicio.pdf"
              meta={`PDF con texto · ${PRIVATE_PAGES} páginas`}
              active={!ready}
              pulse={
                ready && !reduced && time < privateReady + 1
                  ? pulseProgress(time, privateReady, 1)
                  : 0
              }
              status={
                ready ? (
                  <span className="text-primary-light dark:text-primary-dark inline-flex items-center gap-1">
                    <Check size={13} strokeWidth={1.8} />
                    Disponible
                  </span>
                ) : time >= PRIVATE_PROCESS ? (
                  <span className="text-slate-600 dark:text-slate-300">
                    Procesando
                  </span>
                ) : (
                  <span className="text-slate-500">En cola</span>
                )
              }
            >
              {!ready && (
                <div className="relative mt-2 flex items-center gap-2.5">
                  <span className="bg-primary-light/15 dark:bg-primary-dark/20 h-1 flex-1 overflow-hidden rounded-full">
                    <span
                      className="bg-primary-light dark:bg-primary-dark block h-full rounded-full"
                      style={{ width: `${progress * 100}%` }}
                    />
                  </span>
                  <span className="font-body text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
                    {pages} de {PRIVATE_PAGES} páginas
                  </span>
                </div>
              )}
            </SourceRow>
          </div>
        </div>
        {privateSources.map((source, index) => (
          <SourceRow
            key={source.name}
            name={source.name}
            meta={source.meta}
            style={enter(sceneReveal(time, 0.2 + index * 0.15, 0.3, reduced))}
            status={
              <span className="text-primary-light dark:text-primary-dark inline-flex items-center gap-1">
                <Check size={13} strokeWidth={1.8} />
                Disponible
              </span>
            }
          />
        ))}
      </ul>
      <p className="font-body mt-auto mb-4 text-[10px] leading-4 text-slate-500 dark:text-slate-400">
        PDF con texto: hasta 10 MB. TXT y Markdown: hasta 256 KB, según el
        límite del comité.
      </p>
    </div>
  );
}

/*
 * 26 · Historial ordenado: a chat is pinned and renamed from its menu. Rows
 * have fixed slots, so the moving chat glides between the two sections.
 */
const HISTORY_ROW = 36;
const historyChats = [
  "AINE en paciente con ERC",
  "Disnea y edema en ERC",
  "Ajuste de dosis de metformina",
  "Dosis de digoxina en ERC",
] as const;
const historyRename = "AINE y ERC grave";
const HISTORY_POINTER = 0.9;
const historyMenu1 = HISTORY_POINTER + 1;
const historyPin = historyMenu1 + 0.9;
const historyMenu2 = historyPin + 1.1;
const historyEdit = historyMenu2 + 0.9;
const historyTyping = historyEdit + 0.3;
const historyDone = historyTyping + typingDuration(historyRename.length) + 0.4;
const historyMenuItems = [
  { icon: PencilLine, label: "Cambiar el nombre" },
  { icon: Pin, label: "Anclar chat" },
  { icon: FolderInput, label: "Mover conversación" },
  { icon: Trash2, label: "Eliminar" },
] as const;

function HistoryMenu({
  top,
  open,
  highlight,
}: {
  top: number;
  open: number;
  highlight: number;
}) {
  return (
    <div
      className="shadow-big-blocks dark:border-primary-dark/15 absolute right-5 z-30 w-48 rounded-2xl border border-cyan-800/15 bg-white/95 p-1.5 backdrop-blur-md dark:bg-[#152230]/95"
      style={{
        top,
        opacity: open,
        visibility: open > 0 ? "visible" : "hidden",
        transform: `translateY(${4 * (1 - open)}px)`,
      }}
    >
      {historyMenuItems.map((item, index) => (
        <div
          key={item.label}
          className={`font-body flex h-8 items-center gap-2.5 rounded-xl px-2.5 text-xs ${index === highlight ? "bg-primary-light/8 dark:bg-primary-dark/10 text-navy dark:text-slate-50" : "text-slate-600 dark:text-slate-300"} ${index === 3 ? "text-rose-700 dark:text-rose-300" : ""}`}
        >
          <item.icon size={14} strokeWidth={1.4} />
          {item.label}
        </div>
      ))}
    </div>
  );
}

function HistoryScene({ time, reduced }: SceneProps) {
  const pinT = reduced ? 1 : sceneReveal(time, historyPin + 0.1, 0.5, false);
  const pinned = reduced || time >= historyPin;
  const renamed = reduced || time >= historyEdit;
  const typed = writtenCharacters(
    time,
    historyTyping,
    historyRename.length,
    reduced,
  );
  const editing = !reduced && time >= historyEdit && time < historyDone;
  const menu1 = reduced
    ? 0
    : sceneReveal(time, historyMenu1, 0.15, false) *
      (1 - sceneReveal(time, historyPin, 0.15, false));
  const menu2 = reduced
    ? 0
    : sceneReveal(time, historyMenu2, 0.15, false) *
      (1 - sceneReveal(time, historyEdit, 0.15, false));
  // Slots: «Anclados» label at 72, pinned rows from 92; «Recientes» after.
  const recentLabel = 92 + (1 + pinT) * HISTORY_ROW + 12;
  // The other recent chats keep their slots: before the pin they follow the
  // moving one, after it they follow the label that moved down.
  const recentRow = (index: number) =>
    92 + 2 * HISTORY_ROW + 12 + 22 + index * HISTORY_ROW;
  const firstRecent = 92 + HISTORY_ROW + 12 + 22;
  const movingTop = firstRecent + (92 + HISTORY_ROW - firstRecent) * pinT;
  const hover = !reduced && time >= HISTORY_POINTER + 0.7 && time < historyDone;
  const more = (top: number) => ({ x: 382, y: top + HISTORY_ROW / 2 });
  const pointer = pointerStyle(
    [
      { at: HISTORY_POINTER, point: { x: 170, y: 300 } },
      { at: historyMenu1 - 0.2, point: more(firstRecent) },
      { at: historyPin - 0.2, point: { x: 300, y: firstRecent - 140 + 54 } },
      { at: historyMenu2 - 0.2, point: more(92 + HISTORY_ROW) },
      {
        at: historyEdit - 0.2,
        point: { x: 300, y: 92 + 2 * HISTORY_ROW + 26 },
      },
    ],
    time,
    reduced,
    [
      historyMenu1 - 0.15,
      historyPin - 0.15,
      historyMenu2 - 0.15,
      historyEdit - 0.15,
    ],
    sceneReveal(time, HISTORY_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, historyEdit + 0.3, 0.3, reduced)),
  );
  const label =
    "font-display absolute left-5 text-[9px] font-semibold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400";
  const row =
    "font-body absolute inset-x-5 flex items-center gap-2.5 rounded-xl px-3 text-[13px]";
  const list = sceneReveal(time, 0.2, 0.35, reduced);
  return (
    <div className="relative h-full bg-white/60 dark:bg-[#06111f]/60">
      <div style={{ opacity: list }}>
        <span className="dark:border-primary-dark/15 font-body text-navy absolute top-5 left-5 inline-flex h-9 items-center gap-2 rounded-full border border-cyan-800/15 bg-white px-3.5 text-xs font-semibold dark:bg-[#152230] dark:text-slate-100">
          <Plus size={14} strokeWidth={1.8} />
          Nuevo chat
        </span>
        <p className={label} style={{ top: 72 }}>
          Anclados
        </p>
        <div
          className={`${row} text-slate-700 dark:text-slate-200`}
          style={{ top: 92, height: HISTORY_ROW }}
        >
          <Pin
            size={14}
            strokeWidth={1.4}
            className="shrink-0 text-slate-400"
          />
          <span className="truncate">Protocolo de hiperpotasemia</span>
        </div>
        <p className={label} style={{ top: recentLabel }}>
          Recientes
        </p>
        {/* The chat that is pinned and renamed. */}
        <div
          className={`${row} z-10 ${hover ? "bg-primary-light/8 dark:bg-primary-dark/10" : ""} text-navy font-semibold dark:text-slate-100`}
          style={{ top: movingTop, height: HISTORY_ROW }}
        >
          {pinned ? (
            <Pin
              size={14}
              strokeWidth={1.4}
              className="text-primary-light dark:text-primary-dark shrink-0"
            />
          ) : (
            <MessageSquare
              size={14}
              strokeWidth={1.4}
              className="shrink-0 text-slate-400"
            />
          )}
          {editing ? (
            <span className="border-primary-light/45 dark:border-primary-dark/45 min-w-0 flex-1 rounded-md border bg-white px-2 py-0.5 font-normal dark:bg-[#152230]">
              <Typed text={historyRename} written={typed} />
              {typed === 0 && <Caret />}
            </span>
          ) : (
            <span className="min-w-0 flex-1 truncate">
              {renamed ? historyRename : historyChats[0]}
            </span>
          )}
          <MoreHorizontal
            size={16}
            strokeWidth={1.4}
            className="shrink-0 text-slate-500"
            style={{ opacity: hover && !editing ? 1 : 0 }}
          />
        </div>
        {historyChats.slice(1).map((chat, index) => (
          <div
            key={chat}
            className={`${row} text-slate-700 dark:text-slate-200`}
            style={{ top: recentRow(index), height: HISTORY_ROW }}
          >
            <MessageSquare
              size={14}
              strokeWidth={1.4}
              className="shrink-0 text-slate-400"
            />
            <span className="truncate">{chat}</span>
          </div>
        ))}
      </div>
      {/* The first menu opens above the chat; the second, below it. */}
      <HistoryMenu
        top={firstRecent - 140}
        open={menu1}
        highlight={time >= historyPin - 0.5 ? 1 : -1}
      />
      <HistoryMenu
        top={92 + 2 * HISTORY_ROW + 4}
        open={menu2}
        highlight={time >= historyEdit - 0.5 ? 0 : -1}
      />
      <Pointer style={pointer} />
    </div>
  );
}

/* 27 · Tres idiomas: the interface switches language at once. */
const locales = [
  {
    code: "ES",
    title: "¿Qué quieres consultar?",
    placeholder: "Pregunta clínica al comité...",
    newChat: "Nuevo chat",
  },
  {
    code: "CA",
    title: "Què voleu consultar?",
    placeholder: "Pregunta clínica al comitè...",
    newChat: "Xat nou",
  },
  {
    code: "EN",
    title: "What would you like to ask?",
    placeholder: "Clinical question for the committee...",
    newChat: "New chat",
  },
] as const;
const LOCALE_SWITCH = [1.6, 3.2, 4.8] as const;
// Segment centres of the switcher, in artboard coordinates.
const localeX = [324, 357, 390] as const;

function LanguagesScene({ time, reduced }: SceneProps) {
  const locale = reduced
    ? 0
    : time >= LOCALE_SWITCH[2]
      ? 0
      : time >= LOCALE_SWITCH[1]
        ? 2
        : time >= LOCALE_SWITCH[0]
          ? 1
          : 0;
  const current = locales[locale];
  const switched = [0, ...LOCALE_SWITCH].filter((at) => time >= at).pop()!;
  const swap = reduced ? 1 : sceneReveal(time, switched, 0.3, false);
  const order = [1, 2, 0];
  const pointer = pointerStyle(
    [
      { at: 0.6, point: { x: 260, y: 140 } },
      ...LOCALE_SWITCH.map((at, index) => ({
        at: at - 0.2,
        point: { x: localeX[order[index]!]!, y: 28 },
      })),
    ],
    time,
    reduced,
    LOCALE_SWITCH.map((at) => at - 0.15),
    sceneReveal(time, 0.6, 0.3, reduced) *
      (1 - sceneReveal(time, LOCALE_SWITCH[2] + 0.4, 0.3, reduced)),
  );
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className="dark:border-primary-dark/15 absolute top-3 right-4 flex h-8 items-center rounded-full border border-cyan-800/15 bg-white p-0.5 dark:bg-[#152230]">
        {locales.map((item, index) => (
          <span
            key={item.code}
            className={`font-display grid h-7 w-8 place-items-center rounded-full text-[10px] font-bold tracking-[0.08em] transition-colors duration-200 ${index === locale ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#04111e]" : "text-slate-500 dark:text-slate-400"}`}
          >
            {item.code}
          </span>
        ))}
      </div>
      <div
        className="relative mt-12 px-6 text-center"
        style={{ opacity: swap }}
      >
        <p className={eyebrow}>{current.newChat}</p>
        <p className="font-display text-navy mt-2 text-2xl font-semibold tracking-tight dark:text-slate-50">
          {current.title}
        </p>
      </div>
      <div className="absolute inset-x-6 bottom-5" style={{ opacity: swap }}>
        <Composer placeholder={current.placeholder} />
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/* 28 · Tema claro y oscuro: the dark theme spreads from the toggle. */
const THEME_SWITCH = 1.6;

function ThemeChat({ dark }: { dark: boolean }) {
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <span
        title={dark ? "Activar modo claro" : "Activar modo oscuro"}
        className="dark:border-primary-dark/15 absolute top-3 right-4 grid size-8 place-items-center rounded-full border border-cyan-800/15 bg-white text-slate-600 dark:bg-[#152230] dark:text-slate-300"
      >
        {dark ? (
          <Sun size={16} strokeWidth={1.4} />
        ) : (
          <Moon size={16} strokeWidth={1.4} />
        )}
      </span>
      <p className={`relative px-6 ${bodyText}`}>
        <Answer text={claimParagraph} />
      </p>
      <div className="absolute inset-x-6 bottom-5">
        <Composer />
      </div>
    </div>
  );
}

function ThemeScene({ time, reduced }: SceneProps) {
  const spread = reduced ? 1 : sceneReveal(time, THEME_SWITCH, 0.9, false);
  const toggle = { x: 388, y: 28 };
  const pointer = pointerStyle(
    [
      { at: 0.5, point: { x: 280, y: 160 } },
      { at: THEME_SWITCH - 0.2, point: toggle },
    ],
    time,
    reduced,
    [THEME_SWITCH - 0.15],
    sceneReveal(time, 0.5, 0.3, reduced) *
      (1 - sceneReveal(time, THEME_SWITCH + 0.4, 0.3, reduced)),
  );
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-0 bg-white">
        <ThemeChat dark={false} />
      </div>
      {/* The `dark` class turns on the dark variants of everything inside. */}
      <div
        className="dark absolute inset-0 bg-[#06111f]"
        style={{
          clipPath: `circle(${spread * 540}px at ${toggle.x}px ${toggle.y}px)`,
        }}
      >
        <ThemeChat dark />
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

export const workspaceScenes: Record<WorkspaceFeatureId, SceneDefinition> = {
  projects: {
    render: (props) => <ProjectsScene {...props} />,
    surface: "panel",
    duration: PROJECTS_MOVED + 1.8,
  },
  instructions: {
    render: (props) => <InstructionsScene {...props} />,
    surface: "panel",
    duration: instructionsSaved + 1.4,
  },
  saved: {
    render: (props) => <SavedScene {...props} />,
    surface: "chat",
    duration: savedCard + 1.8,
  },
  preferences: {
    render: (props) => <PreferencesScene {...props} />,
    surface: "panel",
    duration: preferencesSaved + 1.4,
  },
  private: {
    render: (props) => <PrivateScene {...props} />,
    surface: "panel",
    duration: privateReady + 1.4,
  },
  history: {
    render: (props) => <HistoryScene {...props} />,
    surface: "panel",
    duration: historyDone + 1,
  },
  languages: {
    render: (props) => <LanguagesScene {...props} />,
    surface: "chat",
    duration: LOCALE_SWITCH[2] + 1.2,
  },
  theme: {
    render: (props) => <ThemeScene {...props} />,
    surface: "chat",
    duration: THEME_SWITCH + 2,
  },
};

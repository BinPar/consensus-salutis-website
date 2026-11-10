"use client";

import {
  Ellipsis,
  Moon,
  X,
  FileText,
  FolderInput,
  MessageCircle,
  Notebook,
  Pencil,
  Pin,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import {
  ProcessChatVeil,
  PulseLayer,
  pulseProgress,
  sceneReveal,
} from "~/app/_components/clinical-process-visuals";
import {
  typingDuration,
  writtenCharacters,
} from "~/app/_components/clinical-process-typing";
import type { WorkspaceFeatureId } from "../features-data";
import { Pointer, centre, pointerStyle } from "./consultation-scenes";
import {
  Answer,
  Caret,
  ChatHeader,
  Composer,
  answerLength,
  bodyText,
  claimParagraph,
  useBoxes,
  type SceneDefinition,
  type SceneProps,
} from "./evidence-scenes";
import {
  LocaleSwitcher,
  PlatformButton,
  PlatformDialog,
  PlatformField,
  ProfilePanel,
  ProfileSection,
  ProfileUser,
  ResponseActions,
} from "./platform-ui";

/*
 * «Espacio personal» scenes, copied from the chat's own screens: the project
 * workspace (project-workspace, project-source-library), the conversation
 * navigation (chat-navigation), the profile panel (account-menu,
 * profile-menu) and their dialogs. Sizes follow the scene scale; looks, order
 * and texts follow the code (messages/es/chatShell.json and the ui package).
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
/** Dialog visibility between opening and closing times. */
const dialogOpen = (
  time: number,
  opens: number,
  closes: number,
  reduced: boolean,
) =>
  reduced
    ? 0
    : sceneReveal(time, opens, 0.25, false) *
      (1 - sceneReveal(time, closes, 0.2, false));

function Typed({ text, written }: { text: string; written: number }) {
  return (
    <>
      {text.slice(0, written)}
      {written > 0 && written < text.length && <Caret />}
    </>
  );
}

/** Header of the project workspace: notebook tile, name and its two tabs. */
function ProjectHeader({
  panel,
  style,
}: {
  panel: "chats" | "sources";
  style?: CSSProperties;
}) {
  const tab = (current: boolean) =>
    `font-body h-7 border-b-2 px-1 text-xs font-medium ${current ? "border-primary-light text-primary-light dark:border-primary-dark dark:text-primary-dark" : "border-transparent text-slate-500 dark:text-slate-400"}`;
  return (
    <header
      className="dark:border-primary-dark/10 flex items-center justify-between gap-3 border-b border-cyan-800/10 px-5 py-3"
      style={style}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="bg-primary-light/8 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark grid size-8 shrink-0 place-items-center rounded-lg">
          <Notebook size={16} strokeWidth={1.8} />
        </span>
        <h3 className="font-display text-navy truncate text-base font-semibold tracking-tight dark:text-slate-50">
          {projectName}
        </h3>
      </div>
      <div className="flex shrink-0 gap-3">
        <span className={tab(panel === "chats")}>Chats</span>
        <span className={tab(panel === "sources")}>Fuentes</span>
      </div>
    </header>
  );
}

/* 21 · Proyectos: the project's conversations (ProjectConversationList). */
const projectChats = [
  { title: "AINE en paciente con ERC", when: "hace 1 día" },
  { title: "IECA e hiperpotasemia", when: "hace 3 días" },
  { title: "Ajuste de dosis de metformina", when: "hace 4 semanas" },
] as const;
const PROJECTS_MOVED = 2.6;

function ChatRow({
  title,
  when,
  pulse = 0,
}: {
  title: string;
  when: string;
  pulse?: number;
}) {
  return (
    <div className="relative flex min-w-0 items-start gap-3 py-2.5">
      <PulseLayer value={pulse} />
      <MessageCircle
        size={16}
        strokeWidth={1.8}
        className="relative mt-1 shrink-0 text-slate-500 dark:text-slate-400"
      />
      <span className="relative min-w-0 flex-1">
        <span className="font-body block truncate text-[13px] leading-6 text-slate-900 dark:text-slate-100">
          {title}
        </span>
        <span className="font-body block text-[11px] text-slate-500 dark:text-slate-400">
          {when}
        </span>
      </span>
    </div>
  );
}

function ProjectsScene({ time, reduced }: SceneProps) {
  const moved = sceneReveal(time, PROJECTS_MOVED, 0.45, reduced);
  return (
    <div className="relative flex h-full flex-col bg-white dark:bg-[#152230]">
      <ProjectHeader
        panel="chats"
        style={{ opacity: sceneReveal(time, 0.2, 0.35, reduced) }}
      />
      {/* A conversation moved into the project joins the top of the list. */}
      <ul className="dark:divide-primary-dark/15 divide-y divide-cyan-800/15 px-5 pt-1">
        <li
          className="grid"
          style={{ gridTemplateRows: `${moved}fr`, opacity: moved }}
        >
          <div className="min-h-0 overflow-hidden">
            <ChatRow
              title="Analgesia en ERC grave"
              when="hace un momento"
              pulse={
                !reduced &&
                time >= PROJECTS_MOVED + 0.3 &&
                time < PROJECTS_MOVED + 1.3
                  ? pulseProgress(time, PROJECTS_MOVED + 0.3, 1) * 0.6
                  : 0
              }
            />
          </div>
        </li>
        {projectChats.map((chat, index) => (
          <li
            key={chat.title}
            style={enter(sceneReveal(time, 0.6 + index * 0.25, 0.3, reduced))}
          >
            <ChatRow title={chat.title} when={chat.when} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* 22 · Instrucciones comunes: the project instructions and their dialog. */
const instructionsText =
  "Comparar los fármacos en tablas e indicar siempre el ajuste según el filtrado glomerular.";
const INSTRUCTIONS_POINTER = 0.8;
const instructionsOpen = INSTRUCTIONS_POINTER + 1;
const instructionsTyping = instructionsOpen + 0.5;
const instructionsTyped =
  instructionsTyping + typingDuration(instructionsText.length);
const instructionsSave = instructionsTyped + 0.8;

function InstructionsScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const dialog = dialogOpen(time, instructionsOpen, instructionsSave, reduced);
  const written = writtenCharacters(
    time,
    instructionsTyping,
    instructionsText.length,
    reduced,
  );
  const saved = reduced || time >= instructionsSave;
  const pointer = pointerStyle(
    [
      { at: INSTRUCTIONS_POINTER, point: { x: 200, y: 260 } },
      { at: instructionsOpen - 0.2, point: centre(boxes[0]) },
      { at: instructionsTyped, point: { x: 260, y: 290 } },
      { at: instructionsSave - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [instructionsOpen - 0.15, instructionsSave - 0.15],
    sceneReveal(time, INSTRUCTIONS_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, instructionsSave + 0.4, 0.3, reduced)),
  );
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col bg-white dark:bg-[#152230]"
    >
      <ProjectHeader panel="sources" />
      <div className="px-5 pt-4">
        <section
          className="dark:border-primary-dark/10 relative rounded-xl border border-cyan-800/10 bg-white p-3.5 dark:bg-[#152230]"
          style={enter(sceneReveal(time, 0.2, 0.35, reduced))}
        >
          <PulseLayer
            value={
              saved && !reduced && time < instructionsSave + 1.2
                ? pulseProgress(time, instructionsSave + 0.2, 1) * 0.6
                : 0
            }
          />
          <div className="relative flex items-center justify-between gap-3">
            <p className="font-display text-navy text-[13px] font-semibold dark:text-slate-50">
              Instrucciones del proyecto
            </p>
            <PlatformButton
              variant="ghost"
              buttonRef={target(0)}
              pressed={press(time, instructionsOpen - 0.15)}
            >
              Editar instrucciones
            </PlatformButton>
          </div>
          <p className="font-body relative mt-2 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {saved ? instructionsText : "Sin instrucciones adicionales"}
          </p>
        </section>
      </div>
      <PlatformDialog
        open={dialog}
        title="Instrucciones del proyecto"
        footer={
          <>
            <PlatformButton variant="outline">Cancelar</PlatformButton>
            <PlatformButton
              buttonRef={target(1)}
              disabled={written === 0}
              pressed={press(time, instructionsSave - 0.15)}
            >
              Guardar
            </PlatformButton>
          </>
        }
      >
        <div className="grid gap-1.5">
          <p className="font-body text-navy text-xs font-medium dark:text-slate-100">
            Instrucciones del proyecto
          </p>
          <PlatformField multiline focused>
            <Typed text={instructionsText} written={written} />
            {written === 0 && <Caret />}
          </PlatformField>
          <p className="font-body text-right text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
            {written} de 16.000 caracteres
          </p>
          <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            Los cambios se aplican al siguiente turno. Una aclaración conserva
            el contexto de la pregunta original.
          </p>
        </div>
      </PlatformDialog>
      <Pointer style={pointer} />
    </div>
  );
}

/*
 * 23 · Respuestas como fuente: in a project, «Guardar en fuentes» under the
 * final answer opens its dialog (save-project-answer); once saved, the
 * action reads «Guardada en fuentes».
 */
const savedLength = answerLength(claimParagraph);
const savedName = "AINE en paciente con ERC";
const SAVED_TYPING = 0.3;
const savedActions = SAVED_TYPING + typingDuration(savedLength) + 0.2;
const savedPointer = savedActions + 0.3;
const savedClick = savedPointer + 1;
const savedConfirm = savedClick + 1.8;

function SavedScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const written = writtenCharacters(time, SAVED_TYPING, savedLength, reduced);
  const saved = reduced || time >= savedConfirm;
  const dialog = dialogOpen(time, savedClick, savedConfirm, reduced);
  const pointer = pointerStyle(
    [
      { at: savedPointer, point: { x: 190, y: 250 } },
      { at: savedClick - 0.2, point: centre(boxes[0]) },
      { at: savedConfirm - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [savedClick - 0.15, savedConfirm - 0.15],
    sceneReveal(time, savedPointer, 0.3, reduced) *
      (1 - sceneReveal(time, savedConfirm + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <div className={`relative px-6 ${bodyText}`}>
        <p className="min-h-[88px]">
          <Answer text={claimParagraph} written={written} />
        </p>
        <div
          className="mt-3"
          style={{ opacity: sceneReveal(time, savedActions, 0.3, reduced) }}
        >
          <ResponseActions
            save={{
              saved,
              pressed: press(time, savedClick - 0.15),
              buttonRef: target(0),
            }}
          />
        </div>
      </div>
      <PlatformDialog
        open={dialog}
        title="Guardar en fuentes"
        description="Guardar la respuesta final como fuente privada de este proyecto. No se incluyen los extractos recuperados de otras fuentes o conversaciones."
        footer={
          <>
            <PlatformButton variant="ghost">Cancelar</PlatformButton>
            <PlatformButton
              buttonRef={target(1)}
              pressed={press(time, savedConfirm - 0.15)}
            >
              Guardar en fuentes
            </PlatformButton>
          </>
        }
      >
        <div className="grid gap-1.5">
          <p className="font-body text-navy text-xs font-medium dark:text-slate-100">
            Nombre de la fuente
          </p>
          <PlatformField focused>{savedName}</PlatformField>
        </div>
      </PlatformDialog>
      <Pointer style={pointer} />
    </div>
  );
}

/*
 * 24 · Preferencias de respuesta: the section of the profile panel and the
 * preferences editor (preferences-editor-dialog).
 */
const preferencesText =
  "Prefiero respuestas breves, con las dosis en tabla y sin repetir los antecedentes del paciente.";
const PREFERENCES_POINTER = 0.8;
const preferencesOpen = PREFERENCES_POINTER + 1;
const preferencesTyping = preferencesOpen + 0.5;
const preferencesTyped =
  preferencesTyping + typingDuration(preferencesText.length);
const preferencesSave = preferencesTyped + 0.8;

function PreferencesScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(2);
  const dialog = dialogOpen(time, preferencesOpen, preferencesSave, reduced);
  const written = writtenCharacters(
    time,
    preferencesTyping,
    preferencesText.length,
    reduced,
  );
  const saved = reduced || time >= preferencesSave;
  const pointer = pointerStyle(
    [
      { at: PREFERENCES_POINTER, point: { x: 120, y: 120 } },
      { at: preferencesOpen - 0.2, point: centre(boxes[0]) },
      { at: preferencesTyped, point: { x: 260, y: 300 } },
      { at: preferencesSave - 0.2, point: centre(boxes[1]) },
    ],
    time,
    reduced,
    [preferencesOpen - 0.15, preferencesSave - 0.15],
    sceneReveal(time, PREFERENCES_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, preferencesSave + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full bg-[#f7fbfd] dark:bg-[#0b1a29]">
      <ProfilePanel
        className="absolute inset-x-6 top-5 border-0 bg-transparent p-0 dark:bg-transparent"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      >
        <ProfileSection title="Preferencias de respuesta">
          {saved ? (
            <div className="dark:border-primary-dark/15 bg-primary-light/5 dark:bg-primary-dark/5 font-body text-navy relative overflow-hidden rounded-lg border border-cyan-800/10 px-2.5 py-2 text-xs leading-5 dark:text-slate-50">
              <PulseLayer
                value={
                  !reduced && time < preferencesSave + 1.2
                    ? pulseProgress(time, preferencesSave + 0.2, 1) * 0.6
                    : 0
                }
              />
              <span className="relative line-clamp-3">{preferencesText}</span>
            </div>
          ) : (
            <p className="font-body text-xs text-slate-500 dark:text-slate-400">
              Aún no hay preferencias guardadas.
            </p>
          )}
          <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            Puedes editar el texto completo o pedir cambios en el chat.
          </p>
          <PlatformButton
            variant="outline"
            className="w-full"
            buttonRef={target(0)}
            pressed={press(time, preferencesOpen - 0.15)}
          >
            Ver y editar preferencias
          </PlatformButton>
          <p className="font-body text-[11px] leading-4 text-slate-500 dark:text-slate-400">
            Se aplican a tus chats. Solo ajustan la presentación; la finalidad y
            las reglas clínicas de las respuestas no cambian.
          </p>
        </ProfileSection>
      </ProfilePanel>
      <PlatformDialog
        open={dialog}
        title="Preferencias de respuesta"
        description="Escribe cómo quieres que se presenten las respuestas. Puedes usar Markdown. El texto aceptado se guardará tal como lo escribas."
        footer={
          <>
            <PlatformButton variant="outline">Cancelar</PlatformButton>
            <PlatformButton
              buttonRef={target(1)}
              disabled={written === 0}
              pressed={press(time, preferencesSave - 0.15)}
            >
              Guardar
            </PlatformButton>
          </>
        }
      >
        <div className="grid gap-1.5">
          <p className="font-body text-navy text-xs font-medium dark:text-slate-100">
            Texto de preferencias
          </p>
          <PlatformField multiline focused>
            <span className="font-mono text-[11px]">
              <Typed text={preferencesText} written={written} />
              {written === 0 && <Caret />}
            </span>
          </PlatformField>
          <p className="font-body text-right text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
            {written}/1000
          </p>
        </div>
      </PlatformDialog>
      <Pointer style={pointer} />
    </div>
  );
}

/* 25 · Documentos privados: the project sources (project-source-library). */
const privateSources = [
  { name: "Notas de la sesión clínica.md" },
  { name: "Ajuste de dosis en ERC.txt" },
] as const;
const PRIVATE_ADDED = 0.6;
const PRIVATE_PROCESS = 1.3;
const privateReady = PRIVATE_PROCESS + 2;
const PRIVATE_PAGES = 18;

function SourceRow({
  name,
  status,
  pulse = 0,
}: {
  name: string;
  status: ReactNode;
  pulse?: number;
}) {
  return (
    <div className="dark:border-primary-dark/10 relative flex min-w-0 items-start gap-3 overflow-hidden rounded-xl border border-cyan-800/10 bg-white px-3.5 py-2.5 dark:bg-[#152230]">
      <PulseLayer value={pulse} />
      <span className="bg-primary-light/5 text-primary-light dark:bg-primary-dark/10 dark:text-primary-dark relative grid size-8 shrink-0 place-items-center rounded-lg">
        <FileText size={14} strokeWidth={1.8} />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="font-body truncate text-[13px] leading-5 font-medium text-slate-900 dark:text-slate-100">
          {name}
        </p>
        <p className="font-body mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
          {status}
        </p>
      </div>
    </div>
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
    <div className="relative flex h-full flex-col bg-white dark:bg-[#152230]">
      <ProjectHeader panel="sources" />
      <div
        className="flex items-center justify-between gap-3 px-5 pt-3.5"
        style={enter(sceneReveal(time, 0.1, 0.35, reduced))}
      >
        <p className="font-display text-navy text-[13px] font-semibold dark:text-slate-50">
          Fuentes
        </p>
        <PlatformButton variant="outline">
          <Plus size={14} strokeWidth={1.8} />
          Añadir
        </PlatformButton>
      </div>
      <div className="mt-2.5 space-y-2 px-5">
        <div
          className="grid"
          style={{ gridTemplateRows: `${added}fr`, opacity: added }}
        >
          <div className="min-h-0 overflow-hidden">
            <SourceRow
              name="Protocolo de analgesia del servicio.pdf"
              pulse={
                ready && !reduced && time < privateReady + 1
                  ? pulseProgress(time, privateReady, 1) * 0.6
                  : 0
              }
              status={
                ready
                  ? "Disponible"
                  : time >= PRIVATE_PROCESS
                    ? `Procesando · ${pages} de ${PRIVATE_PAGES} páginas`
                    : "En cola"
              }
            />
          </div>
        </div>
        {privateSources.map((source, index) => (
          <div
            key={source.name}
            style={enter(sceneReveal(time, 0.2 + index * 0.15, 0.3, reduced))}
          >
            <SourceRow name={source.name} status="Disponible" />
          </div>
        ))}
      </div>
    </div>
  );
}

/*
 * 26 · Historial ordenado: the conversation navigation. A chat is pinned from
 * its actions menu and then renamed in its dialog (rename-thread-dialog).
 * Rows have fixed slots, so the pinned chat glides between the sections.
 */
const HISTORY_ROW = 34;
const historyChats = [
  "AINE en paciente con ERC",
  "Disnea y edema en ERC",
  "Ajuste de dosis de metformina",
  "Dosis de digoxina en ERC",
] as const;
const historyRename = "AINE y ERC grave";
const HISTORY_POINTER = 0.9;
const historyMenu1 = HISTORY_POINTER + 1;
const historyPin = historyMenu1 + 1;
const historyMenu2 = historyPin + 1.1;
const historyDialog = historyMenu2 + 0.9;
const historyTyping = historyDialog + 0.5;
const historySave =
  historyTyping + typingDuration(historyRename.length) * 1.4 + 0.6;
const historyMenuItems = [
  { icon: Pencil, label: "Cambiar el nombre" },
  { icon: FolderInput, label: "Mover conversación" },
  { icon: Pin, label: "Anclar chat" },
  { icon: Trash2, label: "Eliminar" },
] as const;
const MENU_ITEM = 32;

function HistoryMenu({
  top,
  open,
  highlight,
  pinned,
}: {
  top: number;
  open: number;
  highlight: number;
  pinned: boolean;
}) {
  return (
    <div
      className="shadow-big-blocks dark:border-primary-dark/15 absolute right-5 z-30 w-44 rounded-xl border border-cyan-800/15 bg-[#f7fbfd]/98 p-1.5 text-slate-700 backdrop-blur-xl dark:bg-[#0b1a29]/98 dark:text-slate-200"
      style={{
        top,
        opacity: open,
        visibility: open > 0 ? "visible" : "hidden",
        transform: `translateY(${-4 * (1 - open)}px)`,
      }}
    >
      {historyMenuItems.map((item, index) => (
        <div
          key={item.label}
          className={`font-body flex items-center gap-2.5 rounded-lg px-2.5 text-xs font-medium ${index === highlight ? "bg-primary-light/10 dark:bg-primary-dark/10 text-cyan-800 dark:text-cyan-100" : ""}`}
          style={{ height: MENU_ITEM }}
        >
          <item.icon size={14} strokeWidth={1.8} />
          {index === 2 && pinned ? "Desanclar chat" : item.label}
        </div>
      ))}
    </div>
  );
}

function HistoryScene({ time, reduced }: SceneProps) {
  const pinT = reduced ? 1 : sceneReveal(time, historyPin + 0.1, 0.5, false);
  const pinned = reduced || time >= historyPin;
  const renamed = reduced || time >= historySave;
  const typed = writtenCharacters(
    time,
    historyTyping,
    historyRename.length,
    reduced,
  );
  const menu1 = reduced
    ? 0
    : sceneReveal(time, historyMenu1, 0.15, false) *
      (1 - sceneReveal(time, historyPin, 0.15, false));
  const menu2 = reduced
    ? 0
    : sceneReveal(time, historyMenu2, 0.15, false) *
      (1 - sceneReveal(time, historyDialog, 0.15, false));
  const dialog = dialogOpen(time, historyDialog, historySave, reduced);
  // Slots: «Anclados» at 64, pinned rows from 84; «Recientes» after them.
  const pinnedTop = 84;
  const recentLabel = pinnedTop + (1 + pinT) * HISTORY_ROW + 10;
  const recentRow = (index: number) =>
    pinnedTop + 2 * HISTORY_ROW + 10 + 26 + index * HISTORY_ROW;
  const firstRecent = pinnedTop + HISTORY_ROW + 10 + 26;
  const movingTop =
    firstRecent + (pinnedTop + HISTORY_ROW - firstRecent) * pinT;
  const hover =
    !reduced && time >= HISTORY_POINTER + 0.7 && time < historyDialog;
  // The ellipsis sits at the row's right end; left of the pin once pinned.
  const ellipsis = (top: number, isPinned: boolean) => ({
    x: isPinned ? 362 : 390,
    y: top + HISTORY_ROW / 2,
  });
  const menu1Top = firstRecent - 4 * MENU_ITEM - 16;
  const menu2Top = pinnedTop + 2 * HISTORY_ROW + 2;
  const { root, target, boxes } = useBoxes(1);
  const pointer = pointerStyle(
    [
      { at: HISTORY_POINTER, point: { x: 170, y: 300 } },
      { at: historyMenu1 - 0.2, point: ellipsis(firstRecent, false) },
      {
        at: historyPin - 0.2,
        point: { x: 300, y: menu1Top + 6 + 2.5 * MENU_ITEM },
      },
      {
        at: historyMenu2 - 0.2,
        point: ellipsis(pinnedTop + HISTORY_ROW, true),
      },
      {
        at: historyDialog - 0.2,
        point: { x: 300, y: menu2Top + 6 + 0.5 * MENU_ITEM },
      },
      { at: historyTyping + 0.6, point: { x: 280, y: 290 } },
      { at: historySave - 0.2, point: centre(boxes[0]) },
    ],
    time,
    reduced,
    [
      historyMenu1 - 0.15,
      historyPin - 0.15,
      historyMenu2 - 0.15,
      historyDialog - 0.15,
      historySave - 0.15,
    ],
    sceneReveal(time, HISTORY_POINTER, 0.3, reduced) *
      (1 - sceneReveal(time, historySave + 0.4, 0.3, reduced)),
  );
  // navigation-section-header: teal, uppercase, spaced.
  const label =
    "font-display text-primary-light dark:text-primary-dark absolute left-5 text-[9px] font-bold tracking-[0.18em] uppercase";
  const row =
    "font-body absolute inset-x-5 flex items-center rounded-lg px-3 pr-16 text-[13px] font-medium text-slate-600 dark:text-slate-300";
  const list = sceneReveal(time, 0.2, 0.35, reduced);
  return (
    <div
      ref={root}
      className="relative h-full bg-[#f2f8fb]/70 dark:bg-[#0b1a29]/70"
    >
      <div style={{ opacity: list }}>
        <span className="font-body absolute top-5 left-5 inline-flex h-9 items-center gap-3 px-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
          <SquarePen size={16} strokeWidth={1.8} />
          Nuevo chat
        </span>
        <p className={label} style={{ top: 64 }}>
          Anclados
        </p>
        <div className={row} style={{ top: pinnedTop, height: HISTORY_ROW }}>
          <span className="truncate">Protocolo de hiperpotasemia</span>
          <Pin
            size={14}
            strokeWidth={1.8}
            className="absolute right-2 text-slate-500"
          />
        </div>
        <p className={label} style={{ top: recentLabel }}>
          Recientes
        </p>
        {/* The chat that is pinned and renamed. */}
        <div
          className={`${row} z-10 ${hover ? "bg-white/65 text-cyan-800 dark:bg-white/5 dark:text-cyan-100" : ""}`}
          style={{ top: movingTop, height: HISTORY_ROW }}
        >
          <span className="min-w-0 flex-1 truncate">
            {renamed ? historyRename : historyChats[0]}
          </span>
          <Ellipsis
            size={14}
            strokeWidth={1.8}
            className={`absolute text-slate-500 ${pinned ? "right-9" : "right-2"}`}
            style={{ opacity: hover ? 1 : 0 }}
          />
          {pinned && (
            <Pin
              size={14}
              strokeWidth={1.8}
              className="absolute right-2 text-slate-500"
            />
          )}
        </div>
        {historyChats.slice(1).map((chat, index) => (
          <div
            key={chat}
            className={row}
            style={{ top: recentRow(index), height: HISTORY_ROW }}
          >
            <span className="truncate">{chat}</span>
          </div>
        ))}
      </div>
      {/* The first menu opens above the chat; the second, below it. */}
      <HistoryMenu
        top={menu1Top}
        open={menu1}
        highlight={time >= historyPin - 0.5 ? 2 : -1}
        pinned={false}
      />
      <HistoryMenu
        top={menu2Top}
        open={menu2}
        highlight={time >= historyDialog - 0.5 ? 0 : -1}
        pinned
      />
      <PlatformDialog
        open={dialog}
        title="Cambiar el nombre"
        description="Escribe un nombre breve para identificar esta conversación."
        footer={
          <>
            <PlatformButton variant="outline">Cancelar</PlatformButton>
            <PlatformButton
              buttonRef={target(0)}
              pressed={press(time, historySave - 0.15)}
            >
              Guardar
            </PlatformButton>
          </>
        }
      >
        <div className="grid gap-1.5">
          <p className="font-body text-navy text-xs font-medium dark:text-slate-100">
            Nombre de la conversación
          </p>
          <PlatformField focused>
            {typed > 0 ? (
              <Typed text={historyRename} written={typed} />
            ) : (
              <>
                {historyChats[0]}
                <Caret />
              </>
            )}
          </PlatformField>
          <p className="font-body flex justify-between text-[10px] text-slate-500 tabular-nums dark:text-slate-400">
            <span>Máximo 72 caracteres.</span>
            <span>
              {typed > 0 ? typed : historyChats[0].length} de 72 caracteres
            </span>
          </p>
        </div>
      </PlatformDialog>
      <Pointer style={pointer} />
    </div>
  );
}

/*
 * 27 · Tres idiomas: the profile panel (account-menu, profile-menu) changes
 * language at once from its switch. Texts are the chat's own in es, ca, en.
 */
const locales = [
  {
    panel: "Perfil y configuración",
    language: "Idioma",
    role: "Clínico",
    preferences: "Preferencias de respuesta",
    empty: "Aún no hay preferencias guardadas.",
    edit: "Ver y editar preferencias",
  },
  {
    panel: "Perfil i configuració",
    language: "Idioma",
    role: "Clínic",
    preferences: "Preferències de resposta",
    empty: "Encara no hi ha preferències desades.",
    edit: "Veure i editar les preferències",
  },
  {
    panel: "Profile and settings",
    language: "Language",
    role: "Clinician",
    preferences: "Response preferences",
    empty: "No preferences saved yet.",
    edit: "View and edit preferences",
  },
] as const;
const LOCALE_SWITCH = [1.6, 3.2, 4.8] as const;
const localeOrder = [1, 2, 0] as const;

function LanguagesScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(3);
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
  const text: CSSProperties = { opacity: swap };
  const pointer = pointerStyle(
    [
      { at: 0.6, point: { x: 200, y: 280 } },
      ...LOCALE_SWITCH.map((at, index) => ({
        at: at - 0.2,
        point: centre(boxes[localeOrder[index]!]),
      })),
    ],
    time,
    reduced,
    LOCALE_SWITCH.map((at) => at - 0.15),
    sceneReveal(time, 0.6, 0.3, reduced) *
      (1 - sceneReveal(time, LOCALE_SWITCH[2] + 0.4, 0.3, reduced)),
  );
  return (
    <div
      ref={root}
      className="relative flex h-full flex-col bg-[#f2f8fb] dark:bg-[#0b1a29]"
    >
      {/* Panel header (inline profile panel). */}
      <div className="dark:border-primary-dark/10 flex h-11 shrink-0 items-center justify-between border-b border-cyan-800/10 bg-[#e8f2f7]/70 pr-5 pl-5 dark:bg-[#06111f]/50">
        <p
          className="font-display text-primary-light dark:text-primary-dark truncate text-[10px] font-bold tracking-[0.22em] uppercase"
          style={text}
        >
          {current.panel}
        </p>
        <X
          size={16}
          strokeWidth={1.8}
          className="shrink-0 text-slate-600 dark:text-slate-300"
        />
      </div>
      <div className="grid gap-2 p-3">
        <ProfileSection>
          <div className="flex items-center gap-3">
            {/* Avatar with the role badge (RoleBadge). */}
            <span className="relative shrink-0 pb-1.5">
              <span className="font-display dark:border-primary-dark/15 grid size-11 place-items-center rounded-full border border-cyan-800/15 bg-slate-400 text-lg text-white">
                L
              </span>
              <span
                className="bg-primary-light dark:bg-primary-dark absolute top-8 left-1/2 -translate-x-1/2 rounded-full border border-white px-1.5 py-px text-[8px] leading-none font-semibold whitespace-nowrap text-white dark:text-[#06111f]"
                style={text}
              >
                {current.role}
              </span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-body text-navy truncate text-sm font-semibold dark:text-slate-50">
                Laura Gómez
              </p>
              <p className="font-body truncate text-xs text-slate-500 dark:text-slate-400">
                lgomez@organizacion.es
              </p>
            </div>
            <span className="border-primary-light/20 grid size-8 shrink-0 place-items-center rounded-full border bg-white/40 text-slate-700 dark:border-cyan-300/20 dark:text-[#7fd3dc]">
              <Moon size={14} strokeWidth={1.8} />
            </span>
          </div>
        </ProfileSection>
        <ProfileSection>
          <div className="flex items-center justify-between gap-3">
            <span
              className="font-body text-xs font-semibold text-slate-500 dark:text-slate-400"
              style={text}
            >
              {current.language}
            </span>
            <LocaleSwitcher active={locale} localeRef={target} />
          </div>
        </ProfileSection>
        <ProfileSection title={current.preferences}>
          <p
            className="font-body text-xs text-slate-500 dark:text-slate-400"
            style={text}
          >
            {current.empty}
          </p>
          <PlatformButton variant="outline" className="w-full">
            <span style={text}>{current.edit}</span>
          </PlatformButton>
        </ProfileSection>
      </div>
      <Pointer style={pointer} />
    </div>
  );
}

/*
 * 28 · Tema claro y oscuro: the theme toggle of the profile panel; the dark
 * theme spreads from it.
 */
const THEME_SWITCH = 1.6;

function ThemeChat({
  dark,
  toggleRef,
  pressed,
}: {
  dark: boolean;
  toggleRef?: (element: HTMLElement | null) => void;
  pressed: number;
}) {
  return (
    <div className="relative h-full">
      <ProcessChatVeil />
      <ChatHeader />
      <p className={`relative px-6 pt-[86px] ${bodyText}`}>
        <Answer text={claimParagraph} />
      </p>
      <div className="absolute inset-x-6 bottom-5">
        <Composer />
      </div>
      <ProfilePanel className="shadow-big-blocks absolute top-3 right-4 w-[230px]">
        <ProfileSection>
          <ProfileUser dark={dark} toggleRef={toggleRef} pressed={pressed} />
        </ProfileSection>
      </ProfilePanel>
    </div>
  );
}

function ThemeScene({ time, reduced }: SceneProps) {
  const { root, target, boxes } = useBoxes(1);
  const spread = reduced ? 1 : sceneReveal(time, THEME_SWITCH, 0.9, false);
  const toggle = centre(boxes[0]);
  const pressed = press(time, THEME_SWITCH - 0.15);
  const pointer = pointerStyle(
    [
      { at: 0.5, point: { x: 260, y: 200 } },
      { at: THEME_SWITCH - 0.2, point: toggle },
    ],
    time,
    reduced,
    [THEME_SWITCH - 0.15],
    sceneReveal(time, 0.5, 0.3, reduced) *
      (1 - sceneReveal(time, THEME_SWITCH + 0.4, 0.3, reduced)),
  );
  return (
    <div ref={root} className="relative h-full overflow-hidden">
      <div className="absolute inset-0 bg-white">
        <ThemeChat dark={false} toggleRef={target(0)} pressed={pressed} />
      </div>
      {/* The `dark` class turns on the dark variants of everything inside. */}
      <div
        className="dark absolute inset-0 bg-[#06111f]"
        style={{
          clipPath: `circle(${spread * 560}px at ${toggle.x}px ${toggle.y}px)`,
        }}
      >
        <ThemeChat dark pressed={0} />
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
    duration: instructionsSave + 1.6,
  },
  saved: {
    render: (props) => <SavedScene {...props} />,
    surface: "chat",
    duration: savedConfirm + 1.6,
  },
  preferences: {
    render: (props) => <PreferencesScene {...props} />,
    surface: "panel",
    duration: preferencesSave + 1.6,
  },
  private: {
    render: (props) => <PrivateScene {...props} />,
    surface: "panel",
    duration: privateReady + 1.4,
  },
  history: {
    render: (props) => <HistoryScene {...props} />,
    surface: "panel",
    duration: historySave + 1.2,
  },
  languages: {
    render: (props) => <LanguagesScene {...props} />,
    surface: "panel",
    duration: LOCALE_SWITCH[2] + 1.2,
  },
  theme: {
    render: (props) => <ThemeScene {...props} />,
    surface: "chat",
    duration: THEME_SWITCH + 2,
  },
};

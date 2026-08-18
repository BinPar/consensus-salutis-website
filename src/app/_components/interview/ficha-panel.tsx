"use client";

/**
 * El panel de la ficha: lo que convierte la conversación en un formulario
 * auditable en vez de una caja negra.
 *
 * Tres propiedades que no son adorno, y cada una responde a un punto de la issue:
 *
 * 1. **Se rellena campo a campo según llegan las anotaciones del agente**, no al
 *    final. El cliente ve qué se ha entendido de lo que acaba de decir.
 * 2. **Cualquier valor se corrige con un clic**, y una corrección queda marcada
 *    como suya: a partir de ahí el agente no puede sobreescribirla. La regla la
 *    impone el servidor (`updateField`); aquí se hace visible, porque una
 *    garantía que no se ve no tranquiliza a nadie.
 * 3. **No hay banderas, ni nivel, ni reglas.** Ni un color de semáforo, ni un
 *    contador de «cumple / no cumple». El progreso que se muestra es cuántos
 *    campos se han recogido, que es un dato de avance y no una nota.
 *
 * Los campos sin valorar viven detrás de un desplegable por bloque. Con los 28
 * siempre visibles el panel se lee como un formulario de 28 huecos por rellenar
 * —que es justo la sensación que la entrevista quiere evitar—, y aun así se
 * pueden abrir y rellenar a mano en cualquier momento.
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Pencil, UserRoundCheck, X } from "lucide-react";

import {
  ALL_FICHA_FIELDS,
  FICHA_BLOCKS,
  FICHA_BLOCK_LABELS,
  FICHA_FIELDS,
  countFilledFields,
  fichaCell,
  formatFichaValue,
  parseFichaInput,
  toInputValue,
  type Ficha,
  type FichaFieldSpec,
  type FichaValue,
} from "~/lib/ficha";

export type FichaPanelProps = {
  ficha: Ficha;
  /** Paths (`bloque.campo`) que acaban de cambiar. Se resaltan un momento. */
  highlighted: ReadonlySet<string>;
  /** Guarda una corrección. Devuelve el error a mostrar, o `null` si fue bien. */
  onCorrect: (spec: FichaFieldSpec, valor: FichaValue) => Promise<string | null>;
  /** Con la entrevista cerrada la ficha se congela: ya no se toca. */
  readOnly?: boolean;
};

export function FichaPanel({
  ficha,
  highlighted,
  onCorrect,
  readOnly = false,
}: FichaPanelProps) {
  const [editing, setEditing] = useState<string | null>(null);
  const filled = countFilledFields(ficha);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-cyan-800/12 px-5 py-4 dark:border-cyan-300/12">
        <p className="text-primary-light font-display dark:text-primary-dark text-[10px] font-bold tracking-[0.18em] uppercase">
          Ficha de la evaluación
        </p>
        <p className="font-body mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
          Esto es lo que hemos entendido. Corrige cualquier valor con un clic y se
          quedará como tú lo dejes.
        </p>
        <p className="font-body mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 tabular-nums dark:text-slate-100">
            {filled}
          </span>{" "}
          de {ALL_FICHA_FIELDS.length} campos recogidos
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="grid gap-5">
          {FICHA_BLOCKS.map((block) => (
            <FichaBlockSection
              key={block}
              label={FICHA_BLOCK_LABELS[block]}
              specs={FICHA_FIELDS[block]}
              ficha={ficha}
              highlighted={highlighted}
              editing={editing}
              setEditing={setEditing}
              onCorrect={onCorrect}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function FichaBlockSection({
  label,
  specs,
  ficha,
  highlighted,
  editing,
  setEditing,
  onCorrect,
  readOnly,
}: {
  label: string;
  specs: readonly FichaFieldSpec[];
  ficha: Ficha;
  highlighted: ReadonlySet<string>;
  editing: string | null;
  setEditing: (path: string | null) => void;
  onCorrect: FichaPanelProps["onCorrect"];
  readOnly: boolean;
}) {
  const [showEmpty, setShowEmpty] = useState(false);

  const withValue = specs.filter((spec) => fichaCell(ficha, spec) !== undefined);
  const empty = specs.filter((spec) => fichaCell(ficha, spec) === undefined);

  // Un campo vacío que se está editando tiene que seguir visible aunque el
  // desplegable se cerrara: si no, el editor desaparece bajo el usuario.
  const editingEmpty = empty.some((spec) => spec.path === editing);
  const emptyVisible = showEmpty || editingEmpty;

  return (
    <section aria-labelledby={`ficha-${label}`}>
      <h3
        id={`ficha-${label}`}
        className="font-display text-[11px] font-bold tracking-[0.14em] text-slate-500 uppercase dark:text-slate-400"
      >
        {label}
      </h3>

      <div className="mt-2 grid gap-1">
        {withValue.length === 0 && !emptyVisible ? (
          <p className="font-body py-1 text-xs text-slate-400 dark:text-slate-500">
            Todavía sin recoger.
          </p>
        ) : null}

        {withValue.map((spec) => (
          <FichaRow
            key={spec.path}
            spec={spec}
            ficha={ficha}
            highlighted={highlighted.has(spec.path)}
            editing={editing === spec.path}
            onEdit={() => setEditing(spec.path)}
            onClose={() => setEditing(null)}
            onCorrect={onCorrect}
            readOnly={readOnly}
          />
        ))}

        {emptyVisible
          ? empty.map((spec) => (
              <FichaRow
                key={spec.path}
                spec={spec}
                ficha={ficha}
                highlighted={highlighted.has(spec.path)}
                editing={editing === spec.path}
                onEdit={() => setEditing(spec.path)}
                onClose={() => setEditing(null)}
                onCorrect={onCorrect}
                readOnly={readOnly}
              />
            ))
          : null}

        {empty.length > 0 && !readOnly ? (
          <button
            type="button"
            onClick={() => setShowEmpty((current) => !current)}
            aria-expanded={emptyVisible}
            className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark mt-1 flex w-fit items-center gap-1 rounded-md text-[11px] font-medium text-slate-500 transition hover:text-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-slate-400 dark:hover:text-cyan-200"
          >
            <ChevronDown
              aria-hidden="true"
              strokeWidth={1.8}
              className={`size-3.5 transition-transform ${emptyVisible ? "rotate-180" : ""}`}
            />
            {emptyVisible
              ? "Ocultar los que faltan"
              : `${empty.length} sin recoger`}
          </button>
        ) : null}
      </div>
    </section>
  );
}

function FichaRow({
  spec,
  ficha,
  highlighted,
  editing,
  onEdit,
  onClose,
  onCorrect,
  readOnly,
}: {
  spec: FichaFieldSpec;
  ficha: Ficha;
  highlighted: boolean;
  editing: boolean;
  onEdit: () => void;
  onClose: () => void;
  onCorrect: FichaPanelProps["onCorrect"];
  readOnly: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const cell = fichaCell(ficha, spec);
  const mine = cell?.origen === "usuario";

  if (editing) {
    return (
      <FichaEditor
        spec={spec}
        current={cell?.valor}
        onClose={onClose}
        onCorrect={onCorrect}
      />
    );
  }

  const value =
    cell === undefined ? null : formatFichaValue(cell.valor);

  /*
    El resaltado es un fondo que se desvanece. Con `prefers-reduced-motion` no se
    desvanece: se queda puesto mientras dure el resaltado y desaparece de golpe.
    Sigue diciendo lo mismo —«esto acaba de cambiar»— sin animar nada.
  */
  const highlightClass = highlighted
    ? `bg-primary-light/10 dark:bg-primary-dark/12 ${
        reducedMotion ? "" : "transition-colors duration-700"
      }`
    : reducedMotion
      ? ""
      : "transition-colors duration-700";

  const content = (
    <>
      <span className="font-body min-w-0 text-[11px] leading-5 font-medium text-slate-500 dark:text-slate-400">
        {spec.label}
      </span>
      <span className="min-w-0">
        {value === null ? (
          <span className="font-body text-xs text-slate-400 italic dark:text-slate-500">
            Sin recoger
          </span>
        ) : (
          <span className="font-body text-xs leading-5 break-words text-slate-900 dark:text-slate-100">
            {value}
          </span>
        )}
        {mine ? (
          <span className="text-primary-light dark:text-primary-dark mt-1 flex items-center gap-1 text-[10px] font-semibold">
            <UserRoundCheck aria-hidden="true" strokeWidth={1.8} className="size-3" />
            Corregido por ti
          </span>
        ) : null}
      </span>
    </>
  );

  if (readOnly) {
    return (
      <div
        className={`grid grid-cols-[8.5rem_1fr] items-start gap-3 rounded-md px-2 py-1.5 ${highlightClass}`}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      /*
        El nombre accesible dice el campo, su valor y qué hace el botón. Sin él,
        un lector de pantalla recorriendo el panel oiría veintiocho «botón».
      */
      aria-label={`${spec.label}: ${value ?? "sin recoger"}. Corregir.`}
      className={`group focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark grid w-full grid-cols-[8.5rem_1fr_auto] items-start gap-3 rounded-md px-2 py-1.5 text-left hover:bg-cyan-800/5 focus-visible:outline-2 focus-visible:outline-offset-1 dark:hover:bg-cyan-300/6 ${highlightClass}`}
    >
      {content}
      <Pencil
        aria-hidden="true"
        strokeWidth={1.8}
        className="mt-0.5 size-3 shrink-0 text-slate-400 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 dark:text-slate-500"
      />
    </button>
  );
}

const editorFieldClass =
  "font-body focus:border-primary-light/55 focus:ring-primary-light/10 w-full rounded-md border border-cyan-800/20 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none transition focus:ring-2 dark:border-cyan-300/20 dark:bg-[#04111e] dark:text-slate-100 dark:focus:border-cyan-300/55 dark:focus:ring-cyan-300/10";

function FichaEditor({
  spec,
  current,
  onClose,
  onCorrect,
}: {
  spec: FichaFieldSpec;
  current: FichaValue | undefined;
  onClose: () => void;
  onCorrect: FichaPanelProps["onCorrect"];
}) {
  const [draft, setDraft] = useState(() => toInputValue(spec.kind, current));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const firstControl = useRef<HTMLInputElement | HTMLButtonElement>(null);

  // El foco entra en el control al abrir el editor y vuelve a la fila al cerrar
  // (lo devuelve React al remontar el `button`, que es el mismo nodo lógico).
  useEffect(() => {
    firstControl.current?.focus();
  }, []);

  async function save() {
    const parsed = parseFichaInput(spec.kind, draft);
    if (parsed === null) {
      setError(
        spec.kind === "numero"
          ? "Escribe un número."
          : spec.kind === "lista"
            ? "Escribe al menos un valor, separado por comas."
            : "Escribe un valor.",
      );
      return;
    }

    setSaving(true);
    const failure = await onCorrect(spec, parsed);
    setSaving(false);

    if (failure !== null) {
      setError(failure);
      return;
    }

    onClose();
  }

  return (
    <div
      className="border-primary-light/25 dark:border-primary-dark/30 grid gap-2 rounded-md border bg-white/80 px-2.5 py-2 dark:bg-[#04111e]/70"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <p className="font-body text-[11px] font-semibold text-slate-700 dark:text-slate-200">
        {spec.label}
      </p>

      {spec.kind === "booleano" ? (
        <div className="flex gap-2" role="group" aria-label={spec.label}>
          {[
            ["true", "Sí"],
            ["false", "No"],
          ].map(([value, label], index) => (
            <button
              key={value}
              type="button"
              ref={index === 0 ? (firstControl as React.Ref<HTMLButtonElement>) : undefined}
              aria-pressed={draft === value}
              onClick={() => {
                setDraft(value!);
                setError(null);
              }}
              className={`font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark rounded-full px-3 py-1 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${
                draft === value
                  ? "bg-primary-light dark:bg-primary-dark text-white dark:text-[#04111e]"
                  : "border border-cyan-800/20 text-slate-600 hover:bg-cyan-800/5 dark:border-cyan-300/20 dark:text-slate-300 dark:hover:bg-cyan-300/8"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <input
          ref={firstControl as React.Ref<HTMLInputElement>}
          type="text"
          inputMode={spec.kind === "numero" ? "numeric" : "text"}
          value={draft}
          aria-label={spec.label}
          maxLength={300}
          className={editorFieldClass}
          placeholder={
            spec.kind === "lista"
              ? "Separa los valores con comas"
              : spec.kind === "numero"
                ? "Solo el número"
                : ""
          }
          onChange={(event) => {
            setDraft(event.target.value);
            setError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void save();
            }
          }}
        />
      )}

      {error ? (
        <p className="font-body text-[11px] text-rose-700 dark:text-rose-300" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="bg-primary-light font-body dark:bg-primary-dark focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white transition hover:bg-cyan-800 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 dark:text-[#04111e] dark:hover:bg-primary-dark-lighter"
        >
          <Check aria-hidden="true" strokeWidth={2} className="size-3" />
          {saving ? "Guardando…" : "Guardar"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="font-body focus-visible:outline-primary-light dark:focus-visible:outline-primary-dark inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-slate-500 transition hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 dark:text-slate-400 dark:hover:text-slate-100"
        >
          <X aria-hidden="true" strokeWidth={2} className="size-3" />
          Cancelar
        </button>
      </div>
    </div>
  );
}

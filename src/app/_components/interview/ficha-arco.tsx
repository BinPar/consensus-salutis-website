/**
 * El arco de bloques: por dónde va la conversación, en un solo trazo.
 *
 * ## Por qué un arco por bloques y no un contador de campos
 *
 * `0 de 28 campos recogidos` se lee como una deuda de veintiocho, y no es un
 * número que el cliente pueda cerrar: no elige cuántos campos hay, y un cierre
 * real deja cinco o seis sin valor. El único denominador que se enseña es
 * `3 de 5` sobre los bloques de conversación, porque los cinco se cierran siempre
 * y describen lo que hace la entrevista, no lo que el cliente debe.
 *
 * ## Y nunca un porcentaje
 *
 * En el centro va el nombre del bloque en curso, o `Cerrada` al final. Un `60 %`
 * en una entrevista de idoneidad se lee como una nota, que es justo lo que esta
 * pantalla no puede parecer.
 */

import { FICHA_BLOCK_LABELS, type FichaBlock } from "~/lib/ficha";

/** Los cinco bloques, con el rótulo corto que cabe dentro del arco. */
const CORTO: Record<FichaBlock, string> = {
  perfil: "Perfil",
  corpus: "Corpus",
  uso: "Uso",
  datos: "Datos",
  operativa: "Operativa",
};

/** `2π·42`, la circunferencia del trazo. La misma constante que la hoja de estilos. */
const CIRCUNFERENCIA = 263.894;

const TOTAL_BLOQUES = 5;

export type FichaArcoProps = {
  /** Bloques que la conversación ya dejó atrás, de 0 a 5. */
  cerrados: number;
  /** El bloque en curso, o `null` si la conversación no ha empezado. */
  actual: FichaBlock | null;
  /** La entrevista está cerrada: el arco se llena y el centro lo dice. */
  cerrada: boolean;
  /** Lado del arco en píxeles. 82 en el panel, 28 en la barra móvil. */
  size?: number;
  /** Sin el texto del centro. Es lo que hace legible la versión de 28px. */
  compact?: boolean;
};

export function FichaArco({
  cerrados,
  actual,
  cerrada,
  size = 82,
  compact = false,
}: FichaArcoProps) {
  const llenos = cerrada ? TOTAL_BLOQUES : Math.min(Math.max(cerrados, 0), TOTAL_BLOQUES);
  const offset = CIRCUNFERENCIA * (1 - llenos / TOTAL_BLOQUES);

  const etiqueta = cerrada
    ? "Evaluación cerrada"
    : actual === null
      ? "La entrevista no ha empezado"
      : `${FICHA_BLOCK_LABELS[actual]}, bloque ${llenos + 1} de ${TOTAL_BLOQUES}`;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={etiqueta}
    >
      <svg viewBox="0 0 100 100" className="block size-full" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="6"
          className="stroke-cyan-800/18 dark:stroke-cyan-300/18"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          transform="rotate(-90 50 50)"
          className="ficha-arco stroke-primary-light dark:stroke-primary-dark"
          style={{ strokeDashoffset: `${offset}px` }}
        />
      </svg>

      {compact ? null : (
        <div className="pointer-events-none absolute inset-0 grid place-content-center gap-px text-center">
          {cerrada ? (
            <span className="text-primary-light font-display dark:text-primary-dark text-[8.5px] leading-tight font-bold tracking-[0.1em] uppercase">
              Cerrada
            </span>
          ) : actual === null ? null : (
            <>
              <span className="text-primary-light font-display dark:text-primary-dark text-[8.5px] leading-tight font-bold tracking-[0.1em] uppercase">
                {CORTO[actual]}
              </span>
              <span className="font-body text-[8px] leading-tight text-slate-400 tabular-nums dark:text-slate-500">
                {llenos + 1} de {TOTAL_BLOQUES}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

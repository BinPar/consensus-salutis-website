/**
 * Render del markdown del informe de idoneidad.
 *
 * La gramática vive en `~/lib/markdown`; aquí solo se pinta. La frontera importa:
 * en ninguna rama de este archivo hay `dangerouslySetInnerHTML`, así que cada
 * trozo del informe sale como nodo de React y un `<script>` en el texto se
 * renderiza como texto. Ver la cabecera del parser para el resto del porqué.
 */

import { Fragment, type ReactNode } from "react";

import { parseInline, parseMarkdownBlocks } from "~/lib/markdown";

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  return parseInline(text).map((chunk, index) => {
    const key = `${keyPrefix}-${index}`;

    switch (chunk.kind) {
      case "strong":
        return (
          <strong
            key={key}
            className="font-semibold text-slate-900 dark:text-slate-100"
          >
            {chunk.text}
          </strong>
        );
      case "code":
        return (
          <code
            key={key}
            className="rounded-sm bg-cyan-800/8 px-1 py-0.5 text-[0.9em] dark:bg-cyan-300/10"
          >
            {chunk.text}
          </code>
        );
      case "em":
        return <em key={key}>{chunk.text}</em>;
      default:
        return <Fragment key={key}>{chunk.text}</Fragment>;
    }
  });
}

/**
 * Solo el énfasis en línea (negrita, cursiva, código), sin bloques.
 *
 * Es lo que pintan las burbujas del chat de la entrevista: el agente escribe
 * `**comité de ética**` y sin esto el cliente veía los asteriscos tal cual
 * (website#5 §4). No se usa el parser de bloques a propósito — un turno de chat
 * no tiene encabezados ni listas que respetar, y el `whitespace-pre-wrap` del
 * contenedor ya conserva los saltos de línea de los chunks de texto.
 */
export function MarkdownInline({ children }: { children: string }) {
  return <>{renderInline(children, "inline")}</>;
}

const HEADING_CLASS: Record<1 | 2 | 3, string> = {
  1: "font-display mt-0 text-2xl font-semibold tracking-tight text-[#05215e] sm:text-3xl dark:text-slate-50",
  2: "font-display mt-8 text-lg font-semibold tracking-tight text-[#05215e] sm:text-xl dark:text-slate-50",
  3: "font-display mt-6 text-base font-semibold text-[#05215e] dark:text-slate-100",
};

export function Markdown({ children }: { children: string }) {
  const blocks = parseMarkdownBlocks(children);

  return (
    <div className="font-body text-sm leading-7 text-slate-600 dark:text-slate-400">
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (block.type === "heading") {
          // El `#` del informe es su título, y dentro de la página ya hay un
          // `h1`: los niveles se bajan uno para no abrir un segundo `h1`.
          const Tag = (["h2", "h3", "h4"] as const)[block.level - 1]!;
          return (
            <Tag key={key} className={HEADING_CLASS[block.level]}>
              {renderInline(block.text, key)}
            </Tag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="border-primary-light/40 dark:border-primary-dark/40 mt-4 border-l-2 pl-4 text-base leading-7 text-slate-700 dark:text-slate-300"
            >
              {renderInline(block.text, key)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={key}
              className={`marker:text-primary-light dark:marker:text-primary-dark mt-3 grid gap-2 pl-5 ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`} className="pl-1">
                  {renderInline(item, `${key}-${itemIndex}`)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p key={key} className="mt-3">
            {renderInline(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}

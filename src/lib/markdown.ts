/**
 * Parser del subconjunto de markdown que produce el redactor del informe.
 *
 * ## Por qué a mano y sin librería
 *
 * El markdown del informe es de un subconjunto cerrado y conocido: seis bloques
 * con encabezados, la frase de diagnóstico como cita, párrafos, listas y
 * negrita. Meter un parser general para eso trae de regalo HTML embebido, y un
 * informe cuyo texto acaba en `dangerouslySetInnerHTML` es exactamente la
 * superficie que `sanitizeReportValue` se esfuerza en cerrar del otro lado.
 *
 * Este módulo devuelve **datos**, no HTML. Quien los pinta es
 * `~/app/_components/interview/markdown`, y lo hace con nodos de React: un
 * `<script>` en el texto se ve como texto.
 *
 * Lo que NO soporta —tablas, imágenes, enlaces, HTML— tampoco lo produce el
 * redactor. Si algún día lo hiciera, saldría como texto plano y no como una
 * página rota, que es el fallo correcto.
 *
 * Vive en `lib/` y no junto al componente porque la suite de tests solo recorre
 * `.ts`: el parser es la parte con lógica y tiene que ser probable.
 */

export type MarkdownBlock =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

const HEADING = /^(#{1,3})\s+(.*)$/;
const BULLET = /^[-*]\s+(.*)$/;
const ORDERED = /^\d+[.)]\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;

/** Agrupa las líneas en bloques. Una línea en blanco cierra el bloque abierto. */
export function parseMarkdownBlocks(markdown: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  let paragraph: string[] = [];
  let quote: string[] = [];
  let listItems: string[] = [];
  let listOrdered = false;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flushQuote = () => {
    if (quote.length === 0) return;
    blocks.push({ type: "quote", text: quote.join(" ") });
    quote = [];
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", ordered: listOrdered, items: listItems });
    listItems = [];
  };

  /** Cierra todo lo abierto. Un bloque nuevo cierra los anteriores. */
  const flushAll = () => {
    flushParagraph();
    flushQuote();
    flushList();
  };

  for (const rawLine of markdown.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trim();

    if (line.length === 0) {
      flushAll();
      continue;
    }

    // Una valla de bloque de código no debería llegar —el prompt la prohíbe—,
    // pero si llega no debe pintarse como un párrafo con tres acentos graves.
    if (line.startsWith("```")) continue;

    // La cita es la frase de diagnóstico: el redactor la marca con `>` y es la
    // línea que resume el informe entero. Sin este caso salía con el `>` delante.
    const quoted = QUOTE.exec(line);
    if (quoted) {
      flushParagraph();
      flushList();
      quote.push(quoted[1]!.trim());
      continue;
    }
    flushQuote();

    const heading = HEADING.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        level: heading[1]!.length as 1 | 2 | 3,
        text: heading[2]!.trim(),
      });
      continue;
    }

    const bullet = BULLET.exec(line);
    const ordered = bullet === null ? ORDERED.exec(line) : null;
    const item = bullet ?? ordered;

    if (item !== null) {
      flushParagraph();
      const isOrdered = ordered !== null;
      // Una lista numerada detrás de una con guiones abre lista nueva: son dos
      // listas y no una con dos estilos de viñeta.
      if (listItems.length > 0 && listOrdered !== isOrdered) flushList();
      listOrdered = isOrdered;
      listItems.push((item[1] ?? "").trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushAll();

  return blocks;
}

/** Un trozo de texto en línea, ya clasificado. */
export type InlineChunk = {
  kind: "text" | "strong" | "em" | "code";
  text: string;
};

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g;

/** Negrita, cursiva y código en línea. Todo lo demás es texto literal. */
export function parseInline(text: string): InlineChunk[] {
  return text
    .split(INLINE)
    .filter((chunk) => chunk.length > 0)
    .map((chunk): InlineChunk => {
      if (chunk.startsWith("**") && chunk.endsWith("**") && chunk.length > 4) {
        return { kind: "strong", text: chunk.slice(2, -2) };
      }
      if (chunk.startsWith("`") && chunk.endsWith("`") && chunk.length > 2) {
        return { kind: "code", text: chunk.slice(1, -1) };
      }
      if (chunk.startsWith("*") && chunk.endsWith("*") && chunk.length > 2) {
        return { kind: "em", text: chunk.slice(1, -1) };
      }
      return { kind: "text", text: chunk };
    });
}

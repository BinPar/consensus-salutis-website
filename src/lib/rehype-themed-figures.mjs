/*
  Figuras SVG y vídeos del blog con tema: cada `<nombre>.svg` (oscuro) tiene un gemelo
  `<nombre>.light.svg`. El tema es una clase en `<html>`, no
  `prefers-color-scheme`, así que un SVG en `<img>` no puede adaptarse solo.
  Este plugin convierte cada `<img>` de figura en dos y el CSS muestra uno; el
  `display: none` saca la oculta del árbol accesible y de la carga lazy.
  Va en compilación porque MDX no pasa el JSX literal (`<img>`) por
  `useMDXComponents`, solo los elementos que salen de sintaxis Markdown.
*/
const THEMED_FIGURE = /^\/img\/blog\/.+(?<!\.light)\.svg$/;

/**
 * Ruta del gemelo claro, o `null` si la imagen no es una figura con tema.
 * @param {string} src
 * @returns {string | null}
 */
export function lightFigureSrc(src) {
  return THEMED_FIGURE.test(src) ? src.replace(/\.svg$/, ".light.svg") : null;
}

// blog videos: whole render per theme, poster included
const THEMED_VIDEO = /^\/video\/blog\/.+(?<!\.light)\.(mp4|jpg)$/;

/**
 * Light twin of a blog video or poster, or `null` when not themed.
 * @param {string} src
 * @returns {string | null}
 */
export function lightVideoSrc(src) {
  return THEMED_VIDEO.test(src)
    ? src.replace(/\.(mp4|jpg)$/, ".light.$1")
    : null;
}

/**
 * @param {any} node
 * @param {string} name
 */
const attr = (node, name) =>
  node.attributes?.find(
    (/** @type {any} */ a) => a.type === "mdxJsxAttribute" && a.name === name,
  );

/**
 * @param {any} node
 * @param {string} src
 * @param {string} extra
 */
function variant(node, src, extra) {
  const current = attr(node, "className");
  const className = [
    typeof current?.value === "string" ? current.value : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
  const rest = node.attributes.filter(
    (/** @type {any} */ a) =>
      !(
        a.type === "mdxJsxAttribute" &&
        (a.name === "src" || a.name === "className")
      ),
  );
  return {
    ...node,
    attributes: [
      { type: "mdxJsxAttribute", name: "src", value: src },
      ...rest,
      { type: "mdxJsxAttribute", name: "className", value: className },
    ],
  };
}

/**
 * Copy of `<video>` with poster and `<source>` paths mapped; tracks untouched.
 * @param {any} node
 * @param {(src: string) => string} map
 * @param {string} extra
 */
function videoVariant(node, map, extra) {
  /** @param {any} n */
  const remap = (n) => ({
    ...n,
    attributes: n.attributes.map((/** @type {any} */ a) =>
      a.type === "mdxJsxAttribute" &&
      typeof a.value === "string" &&
      (a.name === "poster" || a.name === "src")
        ? { ...a, value: map(a.value) }
        : a,
    ),
  });
  const current = attr(node, "className")?.value;
  const className = [typeof current === "string" ? current : "", extra]
    .filter(Boolean)
    .join(" ");
  const video = remap(node);
  return {
    ...video,
    attributes: [
      ...video.attributes.filter(
        (/** @type {any} */ a) => a.name !== "className",
      ),
      { type: "mdxJsxAttribute", name: "className", value: className },
    ],
    children: (node.children ?? []).map((/** @type {any} */ c) =>
      c.name === "source" ? remap(c) : c,
    ),
  };
}

/** @param {any} node */
function isThemedVideo(node) {
  if (node.type !== "mdxJsxFlowElement" && node.type !== "mdxJsxTextElement")
    return false;
  if (node.name !== "video") return false;
  const poster = attr(node, "poster")?.value;
  return typeof poster === "string" && lightVideoSrc(poster) !== null;
}

/** @param {any} tree */
function transform(tree) {
  if (!Array.isArray(tree.children)) return;
  tree.children = tree.children.flatMap((/** @type {any} */ child) => {
    if (isThemedVideo(child)) {
      const toLight = (/** @type {string} */ v) => lightVideoSrc(v) ?? v;
      return [
        videoVariant(child, toLight, "dark:hidden"),
        videoVariant(child, (v) => v, "hidden dark:block"),
      ];
    }
    const isImg =
      (child.type === "mdxJsxFlowElement" ||
        child.type === "mdxJsxTextElement") &&
      child.name === "img";
    const src = isImg ? attr(child, "src")?.value : undefined;
    const light = typeof src === "string" ? lightFigureSrc(src) : null;
    if (!light) {
      transform(child);
      return [child];
    }
    return [
      variant(child, light, "dark:hidden"),
      variant(child, src, "hidden dark:block"),
    ];
  });
}

export default function rehypeThemedFigures() {
  return transform;
}

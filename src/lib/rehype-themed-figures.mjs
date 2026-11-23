/*
  Figuras SVG del blog con tema: cada `<nombre>.svg` (oscuro) tiene un gemelo
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

/** @param {any} tree */
function transform(tree) {
  if (!Array.isArray(tree.children)) return;
  tree.children = tree.children.flatMap((/** @type {any} */ child) => {
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

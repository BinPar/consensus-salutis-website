/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import createMDX from "@next/mdx";
import createNextIntlPlugin from "next-intl/plugin";

/** @type {import("next").NextConfig} */
const config = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // Keep metadata in the initial <head> for browser-based SEO audits too.
  htmlLimitedBots: /.*/,
  /*
    Los `.ttf` de Sora que compone la imagen OG se leen con `fs`, y eso el
    tracing no lo ve. Sin esta línea la imagen sale con la fuente del sistema en
    cualquier regeneración en runtime.
  */
  outputFileTracingIncludes: {
    "/[locale]/blog/[slug]/opengraph-image": [
      "./src/app/_fonts/**",
      "./public/logos/binpar-brand/binpar-logo-dark.svg",
    ],
    "/[locale]/share-image": [
      "./src/app/_fonts/**",
      "./public/logos/binpar-brand/binpar-logo-dark.svg",
    ],
  },
  experimental: {
    /*
      El sitio no tiene un layout raíz único (cada idioma pone su `<html lang>`),
      así que el 404 de las URL que no casan con nada lo da
      `src/app/global-not-found.tsx`.
    */
    globalNotFound: true,
  },
};

/*
  `remark-frontmatter` en cadena de strings, no importado: Turbopack solo acepta
  plugins por nombre y `pnpm dev` corre con `--turbo`. Sin él, el YAML del
  frontmatter se renderiza como un párrafo al principio del cuerpo del post.
*/
const themedFigures = new URL(
  "./src/lib/rehype-themed-figures.mjs",
  import.meta.url,
).pathname;

// build cache keys compiled MDX on loader options, not plugin source: hash busts it
/** @param {string} file */
const fileRev = (file) =>
  createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 12);

const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
    /* Ruta absoluta en string por la misma razón: Turbopack no acepta funciones. */
    rehypePlugins: [[themedFigures, { rev: fileRev(themedFigures) }]],
  },
});

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(config));

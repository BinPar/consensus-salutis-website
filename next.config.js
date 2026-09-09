/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import createMDX from "@next/mdx";

/** @type {import("next").NextConfig} */
const config = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  /*
    Los `.ttf` de Sora que compone la imagen OG se leen con `fs`, y eso el
    tracing no lo ve. Sin esta línea la imagen sale con la fuente del sistema en
    cualquier regeneración en runtime.
  */
  outputFileTracingIncludes: {
    "/blog/[slug]/opengraph-image": ["./src/app/_fonts/**"],
  },
};

/*
  `remark-frontmatter` en cadena de strings, no importado: Turbopack solo acepta
  plugins por nombre y `pnpm dev` corre con `--turbo`. Sin él, el YAML del
  frontmatter se renderiza como un párrafo al principio del cuerpo del post.
*/
const withMDX = createMDX({
  options: {
    remarkPlugins: [["remark-frontmatter", ["yaml"]]],
  },
});

export default withMDX(config);

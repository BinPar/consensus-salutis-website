/**
 * La capa de distribución: `sitemap.xml`, `robots.txt` y `rss.xml`.
 *
 * Lo que se fija aquí, y por qué:
 *
 * - El sitemap cubre **todas** las páginas públicas del repositorio. La lista de
 *   rutas se escribe a mano en `sitemap.ts` porque el sistema de ficheros no
 *   distingue pública de privada; el test recorre `src/app` y falla si aparece
 *   una página nueva que nadie ha clasificado. Sin esto, una página añadida en
 *   seis meses se quedaría fuera del índice en silencio.
 * - Ninguna ruta privada se cuela ni en el sitemap ni en el rastreo.
 * - El feed no adelanta borradores ni futuros y es XML válido.
 */
import fs from "node:fs";
import path from "node:path";

import type { MetadataRoute } from "next";
import { beforeAll, describe, expect, it, vi } from "vitest";

/*
  `~/lib/site` importa `~/env`, que valida el esquema al importarse. Las cuatro
  van juntas en una función porque los tests que reevalúan `robots` con
  `VERCEL_ENV` puesto llaman a `unstubAllEnvs()` y hay que volver a ponerlas.
*/
function stubBaseEnv() {
  vi.stubEnv("MARKETPLACE_SESSION_SECRET", "x".repeat(32));
  vi.stubEnv("MARKETPLACE_TOKEN_PEPPER", "y".repeat(32));
  vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://consensussalutis.com");
}

stubBaseEnv();

const APP_DIR = path.join(process.cwd(), "src/app");

let sitemapEntries: MetadataRoute.Sitemap;
let privatePrefixes: readonly string[];
let publicRoutes: readonly { path: string }[];
let robotsTxt: MetadataRoute.Robots;
let feed: string;
let postSlugs: string[];
let tagSlugs: string[];

beforeAll(async () => {
  const sitemapModule = await import("~/app/sitemap");
  const robotsModule = await import("~/app/robots");
  const rssModule = await import("~/app/blog/rss.xml/route");
  const blogModule = await import("~/lib/blog");

  sitemapEntries = sitemapModule.default();
  privatePrefixes = sitemapModule.PRIVATE_PATH_PREFIXES;
  publicRoutes = sitemapModule.PUBLIC_ROUTES;
  robotsTxt = robotsModule.default();
  feed = await rssModule.GET().text();
  postSlugs = blogModule.getBlogPosts().map((post) => post.slug);
  tagSlugs = blogModule.getBlogTags().map((entry) => entry.tag);
});

/**
 * Rutas con página en `src/app`, en forma de URL.
 *
 * Se descartan los segmentos dinámicos —no son una URL, son una plantilla— y las
 * páginas que solo redirigen, que no son contenido indexable (`/contact` existe
 * únicamente para mandar a `/contacto`).
 */
function routesWithPages() {
  const routes: string[] = [];

  function walk(directory: string, route: string) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) {
        /* `_components`, `_fonts`: convención de Next para lo que no es ruta. */
        if (entry.name.startsWith("_")) return;

        walk(path.join(directory, entry.name), `${route}/${entry.name}`);

        return;
      }

      if (entry.name !== "page.tsx") return;

      if (route.includes("[")) return;

      const source = fs.readFileSync(path.join(directory, entry.name), "utf8");

      if (/\bredirect\(/.test(source)) return;

      routes.push(route === "" ? "/" : route);
    });
  }

  walk(APP_DIR, "");

  return routes.sort();
}

function isPrivate(route: string) {
  return privatePrefixes.some(
    (prefix) => route === prefix || route.startsWith(`${prefix}/`),
  );
}

describe("sitemap", () => {
  it("no deja fuera ninguna página pública del repositorio", () => {
    const expected = routesWithPages().filter((route) => !isPrivate(route));
    const listed = publicRoutes.map((route) => route.path);

    expect([...listed].sort()).toEqual(expected);
  });

  it("incluye la home, el índice del blog y cada post", () => {
    const urls = sitemapEntries.map((entry) => entry.url);

    expect(urls).toContain("https://consensussalutis.com");
    expect(urls).toContain("https://consensussalutis.com/blog");

    postSlugs.forEach((slug) => {
      expect(urls).toContain(`https://consensussalutis.com/blog/${slug}`);
    });
  });

  it("incluye una entrada por tag", () => {
    const urls = sitemapEntries.map((entry) => entry.url);

    tagSlugs.forEach((tag) => {
      expect(urls).toContain(`https://consensussalutis.com/blog/tag/${tag}`);
    });
  });

  it("no cuela ninguna ruta privada", () => {
    sitemapEntries.forEach((entry) => {
      const route =
        entry.url.replace("https://consensussalutis.com", "") || "/";

      expect(isPrivate(route), `${entry.url} es privada`).toBe(false);
    });
  });

  it("no repite URLs", () => {
    const urls = sitemapEntries.map((entry) => entry.url);

    expect(new Set(urls).size).toBe(urls.length);
  });

  it("cada post lleva `lastModified` de `updatedAt` o de `date`", async () => {
    const { getBlogPosts } = await import("~/lib/blog");

    getBlogPosts().forEach((post) => {
      const entry = sitemapEntries.find(
        (candidate) =>
          candidate.url === `https://consensussalutis.com${post.href}`,
      );

      expect(entry?.lastModified).toEqual(
        new Date(post.updatedAt ?? post.date),
      );
    });
  });
});

describe("robots", () => {
  /* Vitest corre con NODE_ENV=test, así que el `robots` que se evalúa es el de fuera de producción. */
  it("fuera de producción cierra el sitio entero", () => {
    const rules = Array.isArray(robotsTxt.rules)
      ? robotsTxt.rules
      : [robotsTxt.rules];

    expect(rules[0]?.disallow).toBe("/");
    expect(robotsTxt.sitemap).toBeUndefined();
  });

  it("en producción sirve el sitemap y bloquea las rutas privadas", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();

    const { default: productionRobots } = await import("~/app/robots");
    const result = productionRobots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];

    expect(result.sitemap).toBe("https://consensussalutis.com/sitemap.xml");
    expect(rules[0]?.allow).toBe("/");
    expect(rules[0]?.disallow).toEqual([...privatePrefixes]);

    /* `/evaluador` es pública: la regla de la entrevista no puede arrastrarla. */
    expect(rules[0]?.disallow).not.toContain("/evaluador");

    vi.unstubAllEnvs();
    stubBaseEnv();
    vi.resetModules();
  });
});

describe("rss", () => {
  it("es un RSS 2.0 con el canal del blog", () => {
    expect(feed.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(
      true,
    );
    expect(feed).toContain('<rss version="2.0"');
    expect(feed).toContain("<link>https://consensussalutis.com/blog</link>");
    expect(feed).toContain("<language>es-ES</language>");
    expect(feed.trimEnd().endsWith("</rss>")).toBe(true);
  });

  it("las etiquetas de apertura y cierre cuadran", () => {
    ["channel", "item", "title", "link", "pubDate", "description"].forEach(
      (tag) => {
        const open = feed.match(new RegExp(`<${tag}[ >]`, "g"))?.length ?? 0;
        const close = feed.match(new RegExp(`</${tag}>`, "g"))?.length ?? 0;

        expect(open, `<${tag}>`).toBe(close);
      },
    );
  });

  it("trae un item por post publicable, con URL absoluta y fecha RFC 822", () => {
    const items = feed.match(/<item>/g) ?? [];

    expect(items).toHaveLength(postSlugs.length);

    postSlugs.forEach((slug) => {
      expect(feed).toContain(
        `<link>https://consensussalutis.com/blog/${slug}</link>`,
      );
    });

    (feed.match(/<pubDate>([^<]+)<\/pubDate>/g) ?? []).forEach((match) => {
      const value = match.replace(/<\/?pubDate>/g, "");

      expect(Number.isNaN(Date.parse(value))).toBe(false);
      expect(value.endsWith("GMT")).toBe(true);
    });
  });

  it("no cuela borradores ni fechas futuras cuando el filtro está activo", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.resetModules();

    const { getBlogPosts } = await import("~/lib/blog");
    const { GET } = await import("~/app/blog/rss.xml/route");
    const productionFeed = await GET().text();
    const today = new Date().toISOString().slice(0, 10);

    getBlogPosts().forEach((post) => {
      expect(post.draft).toBe(false);
      expect(post.date <= today).toBe(true);
    });

    expect((productionFeed.match(/<item>/g) ?? []).length).toBe(
      getBlogPosts().length,
    );

    vi.unstubAllEnvs();
    stubBaseEnv();
    vi.resetModules();
  });

  it("escapa el XML del contenido", async () => {
    const { GET } = await import("~/app/blog/rss.xml/route");
    const body = await GET().text();

    /* Ningún `&` suelto: los que queden tienen que ser entidades. */
    expect(body.replace(/&(amp|lt|gt|quot|apos);/g, "")).not.toContain("&");
  });
});

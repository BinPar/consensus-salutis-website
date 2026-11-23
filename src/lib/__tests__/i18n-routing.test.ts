/**
 * Idiomas y rutas: lo que no puede romperse al añadir o mover una página.
 *
 * - Cada página de `src/app/[locale]` tiene su URL en `routing.pathnames`; si
 *   falta, no sale en el sitemap ni en el hreflang y no se puede traducir.
 * - El middleware de idioma no toca la entrada de AWS Marketplace ni las
 *   secciones que solo existen en castellano.
 * - Las URL en castellano no cambian: sin prefijo y con su slug de siempre.
 */
import fs from "node:fs";
import path from "node:path";

import { beforeAll, describe, expect, it, vi } from "vitest";

import type {
  localizedMetadata as LocalizedMetadata,
  localizedUrl as LocalizedUrl,
} from "~/i18n/metadata";
import type {
  LOCALE_TAGS as LocaleTags,
  OG_LOCALES as OgLocales,
  routing as Routing,
} from "~/i18n/routing";

vi.stubEnv("MARKETPLACE_SESSION_SECRET", "x".repeat(32));
vi.stubEnv("MARKETPLACE_TOKEN_PEPPER", "y".repeat(32));
vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");
vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://consensussalutis.com");

const LOCALE_DIR = path.join(process.cwd(), "src/app/[locale]");

let routing: typeof Routing;
let LOCALE_TAGS: typeof LocaleTags;
let OG_LOCALES: typeof OgLocales;
let localizedUrl: typeof LocalizedUrl;
let localizedMetadata: typeof LocalizedMetadata;
let matcher: RegExp;

beforeAll(async () => {
  ({ routing, LOCALE_TAGS, OG_LOCALES } = await import("~/i18n/routing"));
  ({ localizedUrl, localizedMetadata } = await import("~/i18n/metadata"));
  const { config } = await import("~/middleware");
  const [pattern] = config.matcher;
  matcher = new RegExp(`^${pattern}$`);
});

/** Rutas internas de `[locale]`, con sus segmentos dinámicos tal cual. */
function localePageRoutes() {
  const routes: string[] = [];

  function walk(directory: string, route: string) {
    fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      if (entry.isDirectory()) {
        if (entry.name.startsWith("_")) return;
        /* El comodín solo existe para dar el 404 con el idioma. */
        if (entry.name.startsWith("[...")) return;

        walk(path.join(directory, entry.name), `${route}/${entry.name}`);

        return;
      }

      if (entry.name === "page.tsx") routes.push(route || "/");
    });
  }

  walk(LOCALE_DIR, "");

  return routes.sort();
}

describe("routing.pathnames", () => {
  it("tiene una entrada por cada página de [locale], ni más ni menos", () => {
    expect(Object.keys(routing.pathnames).sort()).toEqual(localePageRoutes());
  });

  it("el idioma por defecto va sin prefijo y con las URL de siempre", () => {
    expect(routing.defaultLocale).toBe("es");
    expect(localizedUrl("es", "/")).toBe("https://consensussalutis.com");
    expect(localizedUrl("es", "/plataforma")).toBe(
      "https://consensussalutis.com/plataforma",
    );
    expect(
      localizedUrl("es", {
        pathname: "/blog/[slug]",
        params: { slug: "un-post" },
      }),
    ).toBe("https://consensussalutis.com/blog/un-post");
  });

  it("el inglés va con prefijo y con las rutas traducidas", () => {
    expect(localizedUrl("en", "/")).toBe("https://consensussalutis.com/en");
    expect(localizedUrl("en", "/plataforma/funcionalidades")).toBe(
      "https://consensussalutis.com/en/platform/features",
    );
    expect(localizedUrl("en", "/aviso-legal")).toBe(
      "https://consensussalutis.com/en/legal-notice",
    );
  });

  it("el catalán va con prefijo y con las rutas traducidas", () => {
    expect(localizedUrl("ca", "/")).toBe("https://consensussalutis.com/ca");
    expect(localizedUrl("ca", "/plataforma/funcionalidades")).toBe(
      "https://consensussalutis.com/ca/plataforma/funcionalitats",
    );
    expect(localizedUrl("ca", "/aviso-legal")).toBe(
      "https://consensussalutis.com/ca/avis-legal",
    );
  });

  it("el gallego va con prefijo y con las rutas traducidas", () => {
    expect(localizedUrl("gl", "/")).toBe("https://consensussalutis.com/gl");
    expect(localizedUrl("gl", "/privacidad")).toBe(
      "https://consensussalutis.com/gl/privacidade",
    );
    expect(localizedUrl("gl", "/aviso-legal")).toBe(
      "https://consensussalutis.com/gl/aviso-legal",
    );
  });

  it("el euskera va con prefijo y con las rutas traducidas", () => {
    expect(localizedUrl("eu", "/")).toBe("https://consensussalutis.com/eu");
    expect(localizedUrl("eu", "/privacidad")).toBe(
      "https://consensussalutis.com/eu/pribatutasuna",
    );
    expect(localizedUrl("eu", "/contacto")).toBe(
      "https://consensussalutis.com/eu/kontaktua",
    );
  });

  it("cada página anuncia la imagen para compartir de su idioma", () => {
    const image = (locale: (typeof routing.locales)[number]) => {
      const images = localizedMetadata(locale, "/equipo").openGraph?.images;

      return Array.isArray(images) ? images[0] : images;
    };

    expect(image("es")).toMatchObject({
      url: "https://consensussalutis.com/share-image",
      width: 1200,
      height: 630,
    });
    expect(image("eu")).toMatchObject({
      url: "https://consensussalutis.com/eu/share-image",
    });
  });

  it("cada idioma tiene su etiqueta para Intl y Open Graph", () => {
    routing.locales.forEach((locale) => {
      expect(LOCALE_TAGS[locale]).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(OG_LOCALES[locale]).toBe(LOCALE_TAGS[locale].replace("-", "_"));
    });
  });
});

describe("middleware de idioma", () => {
  it.each([
    "/",
    "/plataforma",
    "/plataforma/funcionalidades",
    "/blog",
    "/blog/un-post",
    "/blog/un-post/opengraph-image",
    "/es/contacto",
    "/una-ruta-que-no-existe",
  ])("enruta %s", (pathname) => {
    expect(matcher.test(pathname)).toBe(true);
  });

  it.each([
    /* AWS Marketplace hace un POST aquí desde otro origen. */
    "/aws/registration",
    "/evaluador",
    "/evaluador/entrevista",
    "/informe/un-informe",
    "/espacio",
    "/espacio/acceso/un-token",
    "/casos-lab",
    "/api/contact",
    "/blog/rss.xml",
    "/en/blog/rss.xml",
    "/sitemap.xml",
    "/robots.txt",
    "/favicon.svg",
    "/_next/static/chunk.js",
  ])("no toca %s", (pathname) => {
    expect(matcher.test(pathname)).toBe(false);
  });
});

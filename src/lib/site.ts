/**
 * Origen absoluto del sitio.
 *
 * Lo necesitan las cuatro cosas que se sirven fuera del navegador del visitante
 * —`sitemap.xml`, `robots.txt`, `rss.xml` y el JSON-LD—, porque en todas ellas
 * una URL relativa no significa nada.
 *
 * Orden de resolución, y el porqué de cada escalón:
 *
 * 1. `NEXT_PUBLIC_SITE_URL`, si está: manda la configuración explícita.
 * 2. Producción: el dominio de marca, no `VERCEL_URL`. En producción
 *    `VERCEL_URL` es el hostname del deployment (`…-abc123.vercel.app`), y
 *    publicar ese host en el sitemap es publicar una URL que Google indexaría
 *    como contenido duplicado del dominio real.
 * 3. Preview: `VERCEL_URL`, que ahí sí es la URL que el revisor tiene delante.
 * 4. Local: `localhost:3000`.
 */
import { env } from "~/env";

export const PRODUCTION_SITE_URL = "https://consensussalutis.com";

function stripTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getSiteUrl() {
  if (env.NEXT_PUBLIC_SITE_URL) {
    return stripTrailingSlash(env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_ENV === "production") return PRODUCTION_SITE_URL;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;

  return "http://localhost:3000";
}

export function absoluteUrl(pathname: string) {
  return `${getSiteUrl()}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

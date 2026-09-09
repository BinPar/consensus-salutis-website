/**
 * `robots.txt` del sitio. Sirve el sitemap y cierra las rutas privadas.
 *
 * En un deployment que no es producción bloquea todo: un preview con el
 * contenido futuro y los borradores visibles no debe acabar indexado, y ahí el
 * `noindex` de cada página no llega —el sitemap y el rastreo sí.
 */
import type { MetadataRoute } from "next";

import { PRIVATE_PATH_PREFIXES } from "~/app/sitemap";
import { getSiteUrl } from "~/lib/site";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();
  const isProduction =
    process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.NODE_ENV === "production");

  if (!isProduction) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        /*
          Sin barra final: `Disallow: /informe` cierra tanto `/informe` como
          `/informe/<slug>`, y `/evaluador/entrevista` no arrastra a `/evaluador`,
          que sí es pública.
        */
        disallow: [...PRIVATE_PATH_PREFIXES],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

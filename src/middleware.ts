/**
 * Enrutado por idioma: `/plataforma` se sirve desde `/es/plataforma`, y
 * `/es/plataforma` redirige a `/plataforma` para que cada página tenga una sola
 * URL.
 *
 * El `matcher` deja fuera, a propósito:
 *
 * - `/aws`: AWS Marketplace hace un POST a `/aws/registration` desde otro
 *   origen. Nada debe interponerse ahí (ver el comentario de esa ruta).
 * - `/evaluador`, `/informe`, `/espacio`: solo existen en castellano y no
 *   cuelgan de `[locale]`.
 * - `/casos-lab`, `/api`, `/_next`, `/_vercel` y cualquier ruta con punto
 *   (`robots.txt`, `sitemap.xml`, `/blog/rss.xml`, imágenes...).
 */
import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|aws|evaluador|informe|espacio|casos-lab|_next|_vercel|.*\\..*).*)",
  ],
};

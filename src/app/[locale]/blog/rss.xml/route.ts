/**
 * Feed del blog de los idiomas con prefijo (`/en/blog/rss.xml`). El del idioma
 * por defecto vive en `/blog/rss.xml`, sin prefijo, y aquí no se repite.
 */
import { hasLocale } from "next-intl";

import { routing } from "~/i18n/routing";
import { blogRssResponse } from "~/lib/blog-rss";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale) || locale === routing.defaultLocale) {
    return new Response("Not found", { status: 404 });
  }

  return blogRssResponse(locale);
}

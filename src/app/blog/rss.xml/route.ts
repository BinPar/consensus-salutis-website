/**
 * Feed del blog en el idioma por defecto, en `/blog/rss.xml`. El resto de
 * idiomas lo sirve `src/app/[locale]/blog/rss.xml/route.ts` (`/en/blog/rss.xml`).
 */
import { routing } from "~/i18n/routing";
import { blogRssResponse } from "~/lib/blog-rss";

export function GET() {
  return blogRssResponse(routing.defaultLocale);
}

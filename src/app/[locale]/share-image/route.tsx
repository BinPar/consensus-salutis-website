/**
 * Imagen para compartir de todas las páginas que no tienen una propia (todas
 * menos los posts): la tarjeta de marca de `og-card.tsx` con el lema de la
 * portada (`common.share.title`) en el idioma de la página.
 *
 * La anuncia `localizedMetadata` (`shareImageUrl`) en `/share-image`,
 * `/en/share-image`, etc. Es un route handler y no un `opengraph-image.tsx`
 * por la misma razón que la de los posts: bajo `[locale]`, Next la anunciaría
 * en `/es/...`, una URL que el middleware redirige.
 */
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";

import { ogCard } from "~/app/_components/og-card";
import { routing } from "~/i18n/routing";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: requestedLocale } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale });

  return ogCard({
    eyebrow: t("home.hero.eyebrow"),
    /* Con `<accent>`: el segundo tono cae donde lo pide cada idioma. */
    title: t.raw("common.share.title") as string,
    footer: "binpar.com",
  });
}

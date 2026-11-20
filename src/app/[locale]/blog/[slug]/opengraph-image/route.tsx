/**
 * Imagen para compartir, 1200×630.
 *
 * Va aparte de la portada a propósito. La portada es 16:7, decorativa y no lleva
 * texto; la tarjeta de LinkedIn o X necesita 1200×630 y que el título se lea. Y
 * esta se genera **siempre**, a partir del título y de la marca: no depende de
 * que el post tenga `image` ni de que ningún generador externo haya funcionado.
 *
 * La tipografía va por bytes: `next/og` compone fuera del navegador y no sabe
 * nada de `next/font/google`, así que Sora entra como `.ttf` commiteado
 * (`src/app/_fonts/`, subset latino). Sin eso el título saldría con la fuente
 * del sistema y la tarjeta no sería de la marca.
 *
 * Es un route handler y no el fichero `opengraph-image.tsx` de Next: bajo
 * `[locale]`, Next anunciaría la imagen en `/es/blog/...`, una URL que el
 * middleware redirige. Así la URL la escribe la página (`OG_IMAGE` en
 * `og-image.ts`) y es la misma de siempre, sin prefijo.
 */
import fs from "node:fs";
import path from "node:path";

import { hasLocale } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";

import { formatBlogDate } from "~/app/_components/blog/blog-post-format";
import { routing } from "~/i18n/routing";
import { getBlogPostBySlug } from "~/lib/blog";

import { OG_IMAGE } from "../og-image";

/*
  `fs` y no `new URL(..., import.meta.url)`: ese patrón resuelve a una ruta de
  bundler (`/_next/static/media/...`) que `fetch` no sabe abrir en el servidor.
  Los dos ficheros entran en el bundle de la función por
  `outputFileTracingIncludes` en `next.config.js`.
*/
function readFont(fileName: string) {
  return fs.readFileSync(path.join(process.cwd(), "src/app/_fonts", fileName));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string; slug: string }> },
) {
  const { locale: requestedLocale, slug } = await params;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: "blog.og" });
  const format = await getFormatter({ locale });
  const post = getBlogPostBySlug(slug, locale);
  const title = post?.title ?? t("fallbackTitle");
  const footer = post
    ? `${post.author.name} · ${formatBlogDate(format, post.date)}`
    : "binpar.com";

  /* Tres escalones: un título largo baja de cuerpo en vez de desbordar. */
  const titleSize = title.length > 96 ? 52 : title.length > 62 ? 62 : 72;

  const extraBold = readFont("Sora-ExtraBold.ttf");
  const semiBold = readFont("Sora-SemiBold.ttf");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        backgroundColor: "#06111f",
        backgroundImage:
          "radial-gradient(900px 520px at 78% 8%, rgba(0,188,187,0.22), rgba(6,17,31,0) 70%), radial-gradient(700px 460px at 8% 96%, rgba(8,145,178,0.20), rgba(6,17,31,0) 72%)",
        fontFamily: "Sora",
        position: "relative",
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <path
          d="M-60 520C120 420 240 520 380 430C540 328 620 190 830 200C960 206 1030 268 1260 196"
          stroke="#00BCBB"
          strokeOpacity="0.5"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M-60 588C130 486 268 596 420 494C580 388 640 268 856 276C1000 282 1070 344 1260 288"
          stroke="#00BCBB"
          strokeOpacity="0.28"
          strokeWidth="2"
          fill="none"
        />
      </svg>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: "#00BCBB",
          }}
        />
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#00BCBB",
          }}
        >
          {t("eyebrow")}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          fontSize: titleSize,
          fontWeight: 800,
          lineHeight: 1.12,
          letterSpacing: -1.5,
          color: "#f8fafc",
          maxWidth: 980,
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid rgba(103,232,249,0.22)",
          paddingTop: 28,
        }}
      >
        <div style={{ fontSize: 26, fontWeight: 600, color: "#cbd5e1" }}>
          {footer}
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#f8fafc" }}>
          BinPar
        </div>
      </div>
    </div>,
    {
      width: OG_IMAGE.width,
      height: OG_IMAGE.height,
      fonts: [
        { name: "Sora", data: extraBold, weight: 800, style: "normal" },
        { name: "Sora", data: semiBold, weight: 600, style: "normal" },
      ],
    },
  );
}

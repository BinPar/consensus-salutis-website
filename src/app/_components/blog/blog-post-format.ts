/**
 * Etiqueta de fecha de un post.
 *
 * Función pura: la usan `localizeBlogPosts` (servidor), la imagen OG y el test,
 * cada uno con su formateador de next-intl.
 */
import type { createFormatter } from "next-intl";

type DateFormatter = Pick<ReturnType<typeof createFormatter>, "dateTime">;

/*
  UTC en el formateo: el YAML `date: 2026-02-11` se parsea como medianoche UTC y
  formatearlo en la zona local restaría un día en cualquier huso negativo.
*/
const BLOG_DATE_FORMAT = {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
} as const;

/**
 * «11 feb 2026»: sin los puntos de abreviatura que algunos motores añaden ni
 * los sufijos opcionales entre paréntesis del euskera («2026 ots 11(a)»).
 */
export function formatBlogDate(format: DateFormatter, isoDay: string) {
  return format
    .dateTime(new Date(isoDay), BLOG_DATE_FORMAT)
    .replace(/\./g, "")
    .replace(/\([a-z]\)/g, "");
}

import { timingSafeEqual } from "node:crypto";

/**
 * Compara dos cadenas en tiempo constante.
 *
 * `timingSafeEqual` exige buffers de la misma longitud, así que la diferencia de
 * longitud se resuelve antes. Eso no filtra nada explotable en los usos de este
 * módulo: las firmas HMAC tienen longitud fija y pública, y los identificadores
 * que se comparan aquí no son secretos por su longitud.
 */
export function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");

  if (leftBuffer.length !== rightBuffer.length) return false;

  return timingSafeEqual(leftBuffer, rightBuffer);
}

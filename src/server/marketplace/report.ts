/**
 * Acceso al informe por URL de larga duración.
 *
 * Caso distinto al de los tokens de un solo uso, y por eso va aparte: el informe
 * tiene que ser **reenviable dentro de la institución**. Su trabajo declarado es
 * justificar el proyecto ante dirección, y en ese mundo la gente reenvía. Un
 * enlace de un solo uso rompería el caso de uso principal.
 *
 * El intercambio se acepta con los ojos abiertos: el slug es un **secreto
 * compartible**. Lo que lo hace aceptable es la última línea de §5 de la issue —
 * con este acceso la página del informe es **solo lectura** y no da acceso al
 * espacio de cliente ni al estado de la suscripción. Un enlace filtrado expone
 * un informe, no una sesión. Y no hay PHI: son los datos de su propia
 * institución.
 */

import { randomBytes } from "node:crypto";

/**
 * 32 bytes en base64url — 43 caracteres, 256 bits de entropía.
 *
 * Sin caducidad corta, así que la única defensa es que no se pueda adivinar ni
 * enumerar. A este tamaño, no se puede.
 */
const REPORT_SLUG_BYTES = 32;

/** Longitud exacta de un slug válido, para poder rechazar basura antes de ir a la BD. */
export const REPORT_SLUG_LENGTH = 43;

/** Genera el `reportSlug` de un assessment. */
export function generateReportSlug() {
  return randomBytes(REPORT_SLUG_BYTES).toString("base64url");
}

/**
 * Comprueba que un slug tiene la forma esperada.
 *
 * Es una comprobación de forma, no de autorización: sirve para no consultar la
 * base de datos con cualquier cosa que llegue por la URL. Quien decide si existe
 * es el store.
 */
export function isWellFormedReportSlug(slug: string): boolean {
  return slug.length === REPORT_SLUG_LENGTH && /^[A-Za-z0-9_-]+$/.test(slug);
}

/**
 * Capacidades que concede el acceso por slug. Explícitas para que ampliarlas sea
 * una decisión visible en el diff y no un descuido.
 */
export const REPORT_SLUG_CAPABILITIES = {
  readReport: true,
  /** No da sesión: el espacio de cliente exige token de un solo uso o cookie. */
  accessCustomerSpace: false,
  /** No expone el estado de la suscripción de AWS. */
  readSubscriptionStatus: false,
} as const;

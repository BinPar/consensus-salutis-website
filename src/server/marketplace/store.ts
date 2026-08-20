/**
 * Puerto de persistencia del módulo marketplace. **Hoy es documentación
 * ejecutable, no la persistencia de ninguna ruta.**
 *
 * ## Cómo acabó así
 *
 * Este fichero nació como la costura hacia `BinPar/consensus-salutis#83`: el
 * modelo real (`eligibilityAssessments`, `customerSpaceTokens`) vivía en el
 * monorepo y esa issue estaba abierta, así que aquí se escribió el contrato que
 * esas tablas tendrían que cumplir, con un adaptador en memoria para poder
 * construir el evaluador mientras no existieran. El plan era añadir después un
 * adaptador que llamara a las `internalMutation` y cambiar `marketplaceStore`
 * por él.
 *
 * **El plan no se cumplió, y no se cumplió por buenos motivos.** Las dos mitades
 * se fueron a Convex, cada una por su razón:
 *
 * - La mitad de evaluaciones, con `#83`: la Etapa 0 pasó a `/eligibility-start`,
 *   que además firma la sesión de la entrevista. Lo pone el docblock de
 *   `DraftAssessment`.
 * - La mitad de tokens, con `#93` y `website#7`: quien EMITE el enlace es una
 *   action de Convex (la clave de Resend se queda con los datos) y quien lo
 *   canja es una `internalMutation` de Convex. Esta landing no guarda ni emite
 *   nada: deriva el hash (`hashToken`) y llama a `/marketplace-space-redeem`.
 *   Ver `convex-space.ts`.
 *
 * Se consideró escribir el adaptador de todas formas, para cumplir la letra del
 * plan, y se descartó: el éxito de `redeemToken` devuelve **la fila del token**
 * (`tokenHash`, `issuedAt`, `expiresAt`) y lo que el endpoint devuelve es **el
 * estado del espacio** (`status`, `statusSince`, `reportSlug`). Un adaptador
 * tendría que inventarse los campos que le faltan, y un contrato que se cumple
 * inventando datos no es un contrato: es un sitio donde mentir con tipos verdes.
 *
 * ## Entonces qué sigue haciendo aquí
 *
 * Las tres invariantes del canje, escritas y **probadas** con el adaptador en
 * memoria (`one-time-tokens.test.ts`, 13 casos). Son las que el lado de Convex
 * tiene que cumplir, y son la referencia contra la que se lee su código:
 *
 * 1. `redeemToken` es **una sola operación**, no un buscar-y-luego-marcar. El
 *    uso único tiene que ser atómico; si se parte en dos llamadas, dos canjes
 *    simultáneos del mismo enlace pasan los dos. En Convex es `redeemRow`, una
 *    única `internalMutation`.
 * 2. El puerto solo conoce **hashes** de token. El token en claro no entra aquí
 *    ni por parámetro, así que no hay forma de almacenarlo por descuido. En
 *    Convex, `customerSpaceTokens` guarda solo el hash.
 * 3. Un token de OTRA suscripción se rechaza **sin gastarse**
 *    (`wrong-subscription` no marca `usedAt`), o un canje cruzado le estropearía
 *    el enlace a su dueño. En Convex es el `expectedSubscriptionId` de
 *    `space.redeem`, comprobado antes del `patch` y dentro de la transacción —
 *    que es el único sitio donde esa garantía se puede sostener de verdad.
 *
 * Lo que **no** hay que hacer es volver a cablear esto a una ruta. Si alguna vez
 * hiciera falta, la pregunta previa es por qué la landing vuelve a querer una
 * base de datos.
 */

import { constantTimeEquals } from "~/server/marketplace/constant-time";

/** Fila de `customerSpaceTokens`, tal como la ve esta landing. */
export type CustomerSpaceToken = {
  /** HMAC del token. El token en claro solo existe en el email que se envía. */
  tokenHash: string;
  /** El enlace da acceso a una suscripción concreta, no es un login global. */
  subscriptionId: string;
  email: string;
  /**
   * Segundos desde epoch. CUÁNDO se emitió, que es lo que cuenta el límite por
   * email — y va aparte de `expiresAt` a propósito: contar por caducidad daba
   * por reciente todo lo emitido en la ventana MÁS el TTL del token, o sea media
   * hora de más sobre una ventana de una. En Convex esto es `_creationTime`, que
   * viene en milisegundos.
   */
  issuedAt: number;
  /** Segundos desde epoch. */
  expiresAt: number;
  /** Segundos desde epoch. Presente en cuanto se canjea. */
  usedAt?: number;
};

/** Por qué un canje no procede. Nunca se le detalla al usuario final. */
export type RedeemFailureReason =
  | "unknown"
  | "already-used"
  | "expired"
  | "wrong-subscription";

export type RedeemResult =
  | { ok: true; token: CustomerSpaceToken }
  | { ok: false; reason: RedeemFailureReason };

/** Los tres orígenes posibles de una evaluación. */
export type AssessmentOrigin = "directo" | "aws";

/**
 * Fila de `eligibilityAssessments` en el único estado que crea esta issue.
 * Un `draft` no consume la evaluación de la cuenta y no dispara ningún email.
 *
 * ⚠️ **La mitad de evaluaciones de este puerto ya no la usa nadie.** Desde la
 * issue #5, la Etapa 0 crea el `draft` contra `/eligibility-start` de Convex
 * (`./convex-eligibility`), que es donde tiene que estar para que la entrevista
 * pueda leerlo. `createDraftAssessment` y `getAssessment` se conservan como
 * contrato documentado y siguen probados, pero **no los vuelvas a cablear a una
 * ruta**: una evaluación que solo exista en esta memoria no tiene entrevista.
 *
 * La mitad de tokens (`saveToken`, `redeemToken`, `countRecentTokensForEmail`)
 * sí sigue viva: es la del espacio de cliente, que es otro camino.
 */
export type DraftAssessment = {
  assessmentId: string;
  origin: AssessmentOrigin;
  /** Nulo mientras no exista la integración con AWS (#3). */
  subscriptionId: string | null;
  status: "draft";
  /** Slug largo del informe reenviable. Ver `report.ts`. */
  reportSlug: string;
  createdAt: number;
  contact: {
    emailInstitucional: string;
    nombre: string;
    cargo: string;
    institucion: string;
    ambitoPais: string;
    webInstitucion?: string;
    /** Señal para el equipo. No penaliza en el veredicto. */
    dominioGenerico: boolean;
    consentimiento: {
      aceptado: true;
      /** Versión del texto aceptado, para poder demostrar qué se consintió. */
      textoVersion: string;
      aceptadoEn: number;
    };
  };
};

export type MarketplaceStore = {
  /** Guarda el hash de un token recién emitido. */
  saveToken(token: CustomerSpaceToken): Promise<void>;
  /**
   * Canjea un token de forma atómica: si procede, lo marca usado y lo devuelve.
   * Un segundo canje del mismo token falla con `already-used`.
   *
   * `expectedSubscriptionId` se comprueba **dentro** de esta operación, no antes
   * ni después. Si se comprobara fuera habría que elegir entre dos males:
   * canjear primero y quemar un token válido cuando la suscripción no cuadra, o
   * consultar primero y perder la atomicidad del uso único. Comprobándolo aquí
   * un token que no corresponde a la suscripción se rechaza **sin gastarse**.
   */
  redeemToken(
    tokenHash: string,
    now: number,
    expectedSubscriptionId?: string,
  ): Promise<RedeemResult>;
  /**
   * Cuenta tokens **emitidos** a un email desde `since`, para el límite. Compara
   * contra `issuedAt` y no contra `expiresAt`: ver el campo en
   * `CustomerSpaceToken`.
   */
  countRecentTokensForEmail(email: string, since: number): Promise<number>;
  /** Crea la evaluación en `draft`. No manda correo. */
  createDraftAssessment(assessment: DraftAssessment): Promise<void>;
  /** Devuelve un draft por id, o `null`. */
  getAssessment(assessmentId: string): Promise<DraftAssessment | null>;
};

/**
 * Adaptador en memoria. Sirve para desarrollo local y para los tests.
 *
 * No sobrevive a un reinicio ni se comparte entre instancias serverless, y por
 * eso no es el destino final de estos datos: lo es Convex, vía #83.
 */
export function createInMemoryStore(): MarketplaceStore {
  const tokens = new Map<string, CustomerSpaceToken>();
  const assessments = new Map<string, DraftAssessment>();
  const issuedByEmail = new Map<string, number[]>();

  return {
    async saveToken(token) {
      tokens.set(token.tokenHash, { ...token });

      const issued = issuedByEmail.get(token.email) ?? [];
      issued.push(token.issuedAt);
      issuedByEmail.set(token.email, issued);
    },

    async redeemToken(tokenHash, now, expectedSubscriptionId) {
      const token = tokens.get(tokenHash);

      if (!token) return { ok: false, reason: "unknown" };
      if (token.usedAt !== undefined) {
        return { ok: false, reason: "already-used" };
      }
      if (token.expiresAt <= now) return { ok: false, reason: "expired" };
      if (
        expectedSubscriptionId !== undefined &&
        !constantTimeEquals(token.subscriptionId, expectedSubscriptionId)
      ) {
        // Sin marcar `usedAt`: el token sigue sirviendo para su suscripción.
        return { ok: false, reason: "wrong-subscription" };
      }

      const redeemed: CustomerSpaceToken = { ...token, usedAt: now };
      tokens.set(tokenHash, redeemed);

      return { ok: true, token: redeemed };
    },

    async countRecentTokensForEmail(email, since) {
      const issued = issuedByEmail.get(email) ?? [];
      return issued.filter((issuedAt) => issuedAt >= since).length;
    },

    async createDraftAssessment(assessment) {
      assessments.set(assessment.assessmentId, { ...assessment });
    },

    async getAssessment(assessmentId) {
      return assessments.get(assessmentId) ?? null;
    },
  };
}

/**
 * Instancia que usan las rutas. Reemplazar por el adaptador de Convex cuando
 * `BinPar/consensus-salutis#83` esté disponible.
 */
export const marketplaceStore: MarketplaceStore = createInMemoryStore();

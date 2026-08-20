/**
 * Tokens de un solo uso para el espacio de cliente y el acceso reenviable.
 *
 * Lo que se manda por email nunca queda almacenado: se guarda el HMAC del
 * token, no el token. Un volcado de la base de datos no permite entrar en
 * ningún espacio de cliente.
 *
 * El token está ligado a `{ subscriptionId, email }` — el enlace da acceso a una
 * suscripción concreta, no es un login global. Y caduca en 30 minutos: la sesión
 * posterior es la cookie firmada de `session.ts`, que dura más.
 */

import { createHmac, randomBytes } from "node:crypto";

import type {
  CustomerSpaceToken,
  MarketplaceStore,
  RedeemFailureReason,
} from "~/server/marketplace/store";

/** Caducidad corta a propósito. La duración la aporta la cookie de sesión. */
export const TOKEN_TTL_SECONDS = 30 * 60;

/** 32 bytes de entropía: no adivinable por fuerza bruta. */
const TOKEN_BYTES = 32;

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Deriva el hash que se persiste.
 *
 * HMAC con pimienta de entorno y no un SHA-256 pelado: sin la pimienta, quien
 * consiga la tabla no puede precomputar nada aunque conozca el formato.
 */
export function hashToken(token: string, pepper: string) {
  return createHmac("sha256", pepper).update(token).digest("base64url");
}

/** Normaliza un email para comparar e indexar sin sorpresas de mayúsculas. */
export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export type IssuedToken = {
  /** Token en claro. Va al email y no se persiste en ningún sitio. */
  token: string;
  expiresAt: number;
};

/**
 * Emite un token y guarda solo su hash.
 *
 * Devuelve el token en claro una única vez: quien llama lo pone en el enlace del
 * email y lo descarta. No hay forma de recuperarlo después.
 */
export async function issueOneTimeToken(
  input: { subscriptionId: string; email: string },
  options: {
    store: MarketplaceStore;
    pepper: string;
    ttlSeconds?: number;
    now?: number;
  },
): Promise<IssuedToken> {
  const token = randomBytes(TOKEN_BYTES).toString("base64url");
  const issuedAt = options.now ?? nowInSeconds();
  const expiresAt = issuedAt + (options.ttlSeconds ?? TOKEN_TTL_SECONDS);

  await options.store.saveToken({
    tokenHash: hashToken(token, options.pepper),
    subscriptionId: input.subscriptionId,
    email: normalizeEmail(input.email),
    issuedAt,
    expiresAt,
  });

  return { token, expiresAt };
}

export type RedeemOutcome =
  | { ok: true; token: CustomerSpaceToken }
  | { ok: false; reason: RedeemFailureReason };

/**
 * Canjea un token. El segundo canje del mismo token falla siempre.
 *
 * `expectedSubscriptionId` es lo que hace que el enlace no sea un login global:
 * un token emitido para una suscripción no abre otra, ni siquiera con el token
 * correcto en la mano. La comprobación la hace el store dentro del canje atómico
 * — ver `MarketplaceStore.redeemToken` — para que un token que no corresponde no
 * se gaste al rechazarse.
 */
export async function redeemOneTimeToken(
  token: string,
  options: {
    store: MarketplaceStore;
    pepper: string;
    expectedSubscriptionId?: string;
    now?: number;
  },
): Promise<RedeemOutcome> {
  return options.store.redeemToken(
    hashToken(token, options.pepper),
    options.now ?? nowInSeconds(),
    options.expectedSubscriptionId,
  );
}

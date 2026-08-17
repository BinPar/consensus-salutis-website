/**
 * Limitación de tasa del módulo marketplace.
 *
 * Emitir un enlace al espacio de cliente se dispara con un email en un
 * formulario público. Sin límite, eso es un vector de spam contra el buzón de un
 * tercero: cualquiera puede pedir cien enlaces al correo de otro.
 *
 * Se limita por email y por IP. Reutiliza el patrón REST de Upstash que ya usa
 * `src/app/api/contact/route.ts`, con ventana fija y contadores hasheados —
 * ninguna clave de Redis contiene un email en claro.
 *
 * ## Por qué la respuesta no distingue
 *
 * `issueLinkOutcome` existe para que el formulario público responda **igual** con
 * email conocido y desconocido. Si el resultado se filtrara al usuario — «no hay
 * cuenta con ese correo» frente a «te hemos enviado el enlace» — el formulario
 * sería un oráculo de quién es cliente de Consensus Salutis, y la lista de
 * hospitales que han comprado es información comercial que no toca publicar.
 */

import { createHmac } from "node:crypto";

/** Cinco intentos por hora, igual que el formulario de contacto. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_SECONDS = 60 * 60;

export type RateLimitConfig = {
  redisUrl?: string;
  redisToken?: string;
  secret: string;
  /** Si no hay Redis, permitir en desarrollo y denegar en producción. */
  allowWithoutRedis: boolean;
  now?: number;
};

function hashIdentifier(value: string, secret: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

/**
 * Incrementa los contadores de IP y email y dice si el intento cabe en la
 * ventana.
 *
 * Ante un fallo de Redis devuelve `false` — cerrar y no abrir: un límite que
 * desaparece cuando el backend tose no es un límite.
 */
export async function checkMarketplaceRateLimit(
  input: { ip: string; email: string },
  config: RateLimitConfig,
): Promise<boolean> {
  if (!config.redisUrl || !config.redisToken) {
    return config.allowWithoutRedis;
  }

  const now = config.now ?? Date.now();
  const window = Math.floor(now / (RATE_WINDOW_SECONDS * 1000));
  const ipKey = `marketplace:ip:${hashIdentifier(input.ip, config.secret)}:${window}`;
  const emailKey = `marketplace:email:${hashIdentifier(input.email.trim().toLowerCase(), config.secret)}:${window}`;

  try {
    const response = await fetch(`${config.redisUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", ipKey],
        ["EXPIRE", ipKey, RATE_WINDOW_SECONDS],
        ["INCR", emailKey],
        ["EXPIRE", emailKey, RATE_WINDOW_SECONDS],
      ]),
      signal: AbortSignal.timeout(5_000),
    });

    if (!response.ok) return false;

    const result = (await response.json()) as Array<{ result?: number }>;
    const ipCount = Number(result[0]?.result ?? RATE_LIMIT + 1);
    const emailCount = Number(result[2]?.result ?? RATE_LIMIT + 1);

    return ipCount <= RATE_LIMIT && emailCount <= RATE_LIMIT;
  } catch {
    return false;
  }
}

/**
 * La única respuesta que el formulario público de «enviadme el enlace» puede
 * devolver.
 *
 * Es un objeto congelado y sin campos variables a propósito: no hay ninguna
 * forma de que quien llama filtre, sin darse cuenta, si el email existía. Lo que
 * de verdad pasó se registra en el servidor, no se responde.
 */
export const issueLinkOutcome = Object.freeze({
  ok: true as const,
  message:
    "Si ese correo corresponde a una suscripción activa, recibirás un enlace de acceso en unos minutos.",
});

export type IssueLinkOutcome = typeof issueLinkOutcome;

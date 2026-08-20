import { NextResponse, type NextRequest } from "next/server";
import { env } from "~/env";
import type { AccesoResponse } from "~/lib/espacio";
import { clientKeyFrom } from "~/server/marketplace/client-key";
import {
  requestSpaceLink,
  SpaceRequestError,
} from "~/server/marketplace/convex-space";
import { isSameOrigin } from "~/server/marketplace/same-origin";

/**
 * `POST /api/espacio/acceso` — el formulario de una línea del espacio de cliente
 * (issue #7 §3): un email, y a ese buzón le llega un enlace de un solo uso.
 *
 * ## Esta ruta contesta lo mismo, siempre
 *
 * Con email conocido y con email desconocido. Con suscripción activa y con
 * suscripción cancelada. Con el buzón saturado. Con Resend caído. **Siempre
 * `{ ok: true }`**, porque el formulario es público y cualquier diferencia lo
 * convierte en un oráculo de quién es cliente nuestro, preguntable de uno en uno.
 * La lista de clientes de un producto sanitario no se publica en un formulario.
 *
 * Es el criterio de aceptación §7 dicho en código: «email desconocido y email
 * conocido dan exactamente la misma respuesta». Y no es solo el cuerpo — el
 * `429` del límite tampoco puede depender de si el email existe, y por eso los
 * dos topes se consumen los dos en Convex antes de mirar nada.
 *
 * La única respuesta distinta es el `429`, y se puede: depende de cuánto ha
 * pedido **quien pregunta**, no de quién es el email. Un atacante que lo vea solo
 * aprende que está pidiendo demasiado.
 *
 * ## Y no distingue tampoco por lo que tarda
 *
 * `requestSpaceLink` **espera** a que Convex termine (la action se corre con
 * `runAction`, no se programa): si el caso con suscripción se resolviera en
 * segundo plano, respondería antes que el caso sin suscripción y el tiempo sería
 * el oráculo que el cuerpo se cuidó de no ser.
 *
 * ## Sin límite propio en este lado
 *
 * El contador vive en Convex, que es donde hay base de datos. Aquí no se puede
 * contar nada: cada invocación de esta función es un proceso nuevo y un `Map` en
 * memoria cuenta hasta uno. La historia de por qué esto no se intenta otra vez
 * está en `~/server/marketplace/rate-limit.ts`.
 */

export const runtime = "nodejs";

/** Un email cabe de sobra. Cualquier cosa mayor no es un formulario de una línea. */
const MAX_BODY_BYTES = 2_000;

function json(body: AccesoResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: NextRequest) {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return json(
      { ok: false, message: "La solicitud es demasiado grande." },
      413,
    );
  }
  if (!isSameOrigin(request)) {
    return json({ ok: false, message: "Solicitud no permitida." }, 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, message: "Formato no admitido." }, 415);
  }

  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) {
    return json(
      { ok: false, message: "La solicitud es demasiado grande." },
      413,
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    return json(
      { ok: false, message: "No hemos podido leer la solicitud." },
      400,
    );
  }
  if (typeof payload !== "object" || payload === null) {
    return json(
      { ok: false, message: "No hemos podido leer la solicitud." },
      400,
    );
  }

  const { email, website } = payload as { email?: unknown; website?: unknown };

  // Trampa para bots, igual que en los otros dos formularios: rellenado el campo
  // oculto, se contesta como si hubiera funcionado y NO se manda nada. Un bot que
  // recibiera un error probaría otra cosa.
  if (typeof website === "string" && website.trim().length > 0) {
    return json({ ok: true }, 200);
  }

  const validado = validarEmail(email);
  if (validado === null) {
    return json(
      {
        ok: false,
        message: "Revisa el campo indicado.",
        fieldErrors: { email: "Escribe un correo electrónico válido." },
      },
      400,
    );
  }

  try {
    await requestSpaceLink({
      email: validado,
      clientKey: clientKeyFrom(request, env.MARKETPLACE_TOKEN_PEPPER),
    });
  } catch (error) {
    if (error instanceof SpaceRequestError && error.reason === "rate-limited") {
      return json(
        {
          ok: false,
          message:
            "Has pedido varios enlaces seguidos. Espera unos minutos y vuelve a intentarlo, o escríbenos a soporte.",
        },
        429,
      );
    }
    // El resto —Convex caído, secreto mal configurado, Resend rechazando— se
    // registra y se contesta `ok`. Contarlo sería la única forma de saber, desde
    // fuera, que este email SÍ tenía suscripción: un fallo del envío solo puede
    // ocurrir cuando hubo algo que enviar.
    console.error(
      "[espacio] no se pudo pedir el enlace de acceso:",
      String(error),
    );
  }

  return json({ ok: true }, 200);
}

/**
 * La comprobación del email, escrita a mano.
 *
 * No reusa el zod del cliente a propósito: el mismo motivo que en la Etapa 0 —el
 * esquema del navegador no es una frontera de confianza— más el de siempre en
 * este repo, que ningún esquema de zod cruza la frontera de versiones con el
 * monorepo. Laxa por diseño: un `@` con algo a cada lado, sin espacios ni comas.
 * Rechazar aquí con una regla más estricta que la de la Etapa 0 dejaría fuera al
 * cliente cuyo email YA está en la base.
 */
function validarEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return null;
  return /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]+$/.test(email) ? email : null;
}

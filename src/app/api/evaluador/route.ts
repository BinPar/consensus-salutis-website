/**
 * Envío de la Etapa 0 del evaluador de idoneidad.
 *
 * Crea la evaluación en `draft` y ata el navegador a ella con la cookie firmada
 * de `~/server/marketplace/session`. Un `draft` no consume la evaluación de la
 * cuenta y **no dispara ningún email** — de ahí que aquí no haya nada que llame
 * a Resend, a diferencia de `/api/contact`.
 */

import { randomUUID } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import {
  CONSENT_TEXT_VERSION,
  isGenericEmailDomain,
  type EligibilityResponse,
} from "~/lib/eligibility";
import { validateAssessmentSubmission } from "~/server/marketplace/assessment-validators";
import { generateReportSlug } from "~/server/marketplace/report";
import {
  sessionCookieOptions,
  signSession,
} from "~/server/marketplace/session";
import { marketplaceStore } from "~/server/marketplace/store";

// `nodejs` y no edge: la firma de la cookie usa `crypto` de Node.
export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;

function json(body: EligibilityResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

/** Mismo control de origen que `/api/contact`. */
function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  const forwardedHost =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");

  if (!origin || !forwardedHost) return false;

  try {
    return new URL(origin).host === forwardedHost;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  const contentType = request.headers.get("content-type");

  if (contentLength > MAX_BODY_BYTES) {
    return json(
      { ok: false, message: "La solicitud es demasiado grande." },
      413,
    );
  }

  if (!isSameOrigin(request)) {
    return json({ ok: false, message: "Solicitud no permitida." }, 403);
  }

  if (!contentType?.toLowerCase().startsWith("application/json")) {
    return json({ ok: false, message: "Solicitud no válida." }, 415);
  }

  let payload: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
      return json(
        { ok: false, message: "La solicitud es demasiado grande." },
        413,
      );
    }
    payload = JSON.parse(rawBody) as unknown;
  } catch {
    return json({ ok: false, message: "Solicitud no válida." }, 400);
  }

  // Trampa para bots: se responde como si hubiera ido bien, sin crear nada.
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    typeof payload.website === "string" &&
    payload.website.length > 0
  ) {
    return json({ ok: true, assessmentId: randomUUID() }, 200);
  }

  const validated = validateAssessmentSubmission(payload);
  if (!validated.ok) {
    return json(
      {
        ok: false,
        message: "Revisa los campos indicados.",
        fieldErrors: validated.fieldErrors,
      },
      400,
    );
  }

  const assessmentId = randomUUID();
  const createdAt = Math.floor(Date.now() / 1000);

  try {
    await marketplaceStore.createDraftAssessment({
      assessmentId,
      // Mientras no exista #3 el evaluador es público y no hay suscripción
      // detrás: `directo` y `subscriptionId` nulo.
      origin: "directo",
      subscriptionId: null,
      status: "draft",
      reportSlug: generateReportSlug(),
      createdAt,
      contact: {
        ...validated.value,
        // Señal para el equipo. No penaliza en el veredicto ni bloquea el envío.
        dominioGenerico: isGenericEmailDomain(validated.value.emailInstitucional),
        consentimiento: {
          aceptado: true,
          textoVersion: CONSENT_TEXT_VERSION,
          aceptadoEn: createdAt,
        },
      },
    });
  } catch (error) {
    console.error("No se pudo crear la evaluación de idoneidad", error);
    return json(
      {
        ok: false,
        message:
          "No hemos podido guardar tus datos. Inténtalo de nuevo más tarde.",
      },
      503,
    );
  }

  const response = json({ ok: true, assessmentId }, 200);

  // La sesión solo lleva `assessmentId`: sin suscripción de AWS detrás, no hay
  // `awsAccountId` que firmar. Cuando llegue #3, los campos de AWS se añaden
  // aquí — y siempre dentro de esta cookie, nunca en la respuesta.
  response.cookies.set({
    ...sessionCookieOptions(),
    value: signSession(
      { assessmentId },
      { secret: env.MARKETPLACE_SESSION_SECRET },
    ),
  });

  return response;
}

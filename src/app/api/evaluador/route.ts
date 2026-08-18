/**
 * Envío de la Etapa 0 del evaluador de idoneidad.
 *
 * Crea la evaluación en `draft` en Convex y ata el navegador a ella con la
 * cookie firmada. Un `draft` no consume la evaluación de la cuenta y **no
 * dispara ningún email** — de ahí que aquí no haya nada que llame a Resend, a
 * diferencia de `/api/contact`.
 *
 * ## La persistencia es Convex, no el adaptador en memoria
 *
 * `~/server/marketplace/store` documenta esta costura: el modelo de datos real
 * vive en el monorepo y el adaptador en memoria existía para poder construir la
 * Etapa 0 antes de que aterrizara. Ya aterrizó
 * (`BinPar/consensus-salutis#83`, `#85`), así que la evaluación se crea contra
 * `/eligibility-start` y el store se queda para los tokens del espacio de
 * cliente, que son otra cosa.
 *
 * El cambio no es cosmético: sin él la Etapa 1 no tiene con qué hablar. La
 * entrevista corre en Convex y necesita que la evaluación exista **allí**.
 */

import { type NextRequest, NextResponse } from "next/server";

import {
  isGenericEmailDomain,
  type EligibilityResponse,
} from "~/lib/eligibility";
import { validateAssessmentSubmission } from "~/server/marketplace/assessment-validators";
import { startEligibilityAssessment } from "~/server/marketplace/convex-eligibility";
import { sessionCookieOptions } from "~/server/marketplace/session";

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
  //
  // `assessmentId` va vacío y NO se pone cookie: un bot que se llevara una sesión
  // podría abrir la entrevista, que es lo caro. Sin cookie, `/evaluador/entrevista`
  // le contesta que vuelva a identificarse.
  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    typeof payload.website === "string" &&
    payload.website.length > 0
  ) {
    return json({ ok: true, assessmentId: "" }, 200);
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

  // El dominio genérico es una señal para el equipo, no un descarte: se registra
  // y no cambia nada de lo que sigue. Una dirección médica que escribe desde su
  // correo personal sigue siendo una dirección médica.
  const dominioGenerico = isGenericEmailDomain(
    validated.value.emailInstitucional,
  );

  let started;
  try {
    started = await startEligibilityAssessment({
      ...validated.value,
      ambitoPais: validated.value.ambitoPais as "espana" | "latam" | "otro",
      consentimiento: true,
      // En milisegundos, que es lo que espera Convex. La versión del texto
      // consentido la fija `CONSENT_TEXT_VERSION` y viaja con la evaluación
      // desde el modelo de datos, no desde aquí.
      consentimientoAt: Date.now(),
    });
  } catch (error) {
    console.error(
      "No se pudo crear la evaluación de idoneidad",
      error,
      dominioGenerico ? "(contacto en dominio genérico)" : "",
    );
    return json(
      {
        ok: false,
        message:
          "No hemos podido guardar tus datos. Inténtalo de nuevo más tarde.",
      },
      503,
    );
  }

  const response = json({ ok: true, assessmentId: started.assessmentId }, 200);

  /*
    La cookie lleva el token que firmó Convex, TAL CUAL.

    Es el mismo formato que produce `signSession` y se verifica con
    `verifySession` y el mismo secreto, así que la página de la entrevista puede
    comprobarla en el servidor antes de pintar nada. Y es el mismo valor que el
    navegador manda en `Authorization` contra `/eligibility-stream`, que es otro
    origen y por tanto no recibe cookies de este dominio.

    Sigue siendo `HttpOnly`: al cliente se lo entrega la página, ya verificado, y
    no hay script que pueda leerlo del documento.

    Cuando llegue #3, los campos de AWS entran en este mismo token —firmados por
    Convex al arrancar— y nunca como campo de formulario ni parámetro de URL.
  */
  response.cookies.set({
    ...sessionCookieOptions({
      ttlSeconds: Math.max(
        60,
        started.expiresAt - Math.floor(Date.now() / 1000),
      ),
    }),
    value: started.sessionToken,
  });

  return response;
}

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
 *
 * ## Esta ruta no tiene límite de tasa, y es una carencia consciente
 *
 * Es un POST público sin autenticar, y lo que hace no es barato: crea una fila en
 * Convex y devuelve una sesión firmada que abre la Etapa 1, que tiene un modelo
 * detrás. El control de origen y la trampa para bots frenan a un bot torpe, no a
 * un bucle deliberado.
 *
 * El tope **no se pone aquí** por dónde tendría que vivir el contador. Esta
 * landing no tiene base de datos: el único almacén de la evaluación es Convex, la
 * fila se crea ahí mismo unas líneas más abajo y `/eligibility-start` es servidor
 * a servidor, ya autenticado y ya sabe el email. Un contador ahí no necesita
 * infraestructura nueva ni un secreto nuevo. La alternativa era Upstash, que no
 * está aprovisionado en ningún entorno del proyecto y que habría añadido una
 * segunda dependencia con estado para guardar un entero — y, peor, un límite que
 * deniega cuando no puede contar convierte esta ruta en un 429 para todo el
 * mundo, justo en la página de la que depende el alta.
 *
 * La política (cuánto, por qué el tope de IP va más alto que el de email) está
 * escrita en `~/server/marketplace/rate-limit`, para que implementarla en Convex
 * no obligue a redecidirla. Tampoco hay Turnstile a propósito: esta es la página
 * que abre el revisor de AWS y el captcha caería justo delante del campo de email
 * que el programa exige ver.
 */

import { type NextRequest, NextResponse } from "next/server";

import {
  isGenericEmailDomain,
  type EligibilityResponse,
} from "~/lib/eligibility";
import { env } from "~/env";
import { validateAssessmentSubmission } from "~/server/marketplace/assessment-validators";
import { startEligibilityAssessment } from "~/server/marketplace/convex-eligibility";
import {
  REGISTRATION_COOKIE_NAME,
  verifyRegistration,
} from "~/server/marketplace/registration";
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

  /*
    La procedencia de AWS, si la hay.

    Es la ÚNICA diferencia entre llegar por Marketplace y llegar por la web
    pública: la evaluación nace atada a la suscripción que `/aws/registration`
    canjeó y persistió. El `subscriptionId` sale de una cookie firmada por
    nosotros y no de un campo del formulario — que es la regla de AWS y lo que
    impide que alguien se cuelgue de la suscripción de otro escribiendo un
    identificador en el cuerpo del POST.

    Una cookie ausente, caducada o con la firma tocada no es un error: significa
    tráfico público, que es el caso mayoritario y el que siempre funciona.
  */
  const registration = verifyRegistration(
    request.cookies.get(REGISTRATION_COOKIE_NAME)?.value,
    { secret: env.MARKETPLACE_SESSION_SECRET },
  );

  let started;
  try {
    started = await startEligibilityAssessment(
      {
        ...validated.value,
        ambitoPais: validated.value.ambitoPais as "espana" | "latam" | "otro",
        consentimiento: true,
        // En milisegundos, que es lo que espera Convex. La versión del texto
        // consentido la fija `CONSENT_TEXT_VERSION` y viaja con la evaluación
        // desde el modelo de datos, no desde aquí.
        consentimientoAt: Date.now(),
      },
      registration.ok
        ? { subscriptionId: registration.registration.subscriptionId }
        : {},
    );
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

    Lleva `subscriptionId` cuando la evaluación vino de AWS, porque Convex lo
    firma dentro. El `awsAccountId` no: ése se queda en la cookie de procedencia
    de `~/server/marketplace/registration`, que es la que lo firmó al canjear el
    token, y de ahí lo lee el badge del informe.
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

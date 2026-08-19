import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import {
  contactSchema,
  type ContactField,
  type ContactResponse,
} from "~/lib/contact";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const contactFields = new Set<ContactField>([
  "name",
  "email",
  "message",
  "privacyAccepted",
]);

function json(body: ContactResponse, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function isContactField(value: unknown): value is ContactField {
  return typeof value === "string" && contactFields.has(value as ContactField);
}

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

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}

async function sendContactEmail(input: {
  name: string;
  email: string;
  message: string;
}) {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: input.email,
      subject: `Consulta Consensus Salutis de ${input.name}`,
      text: `Nombre: ${input.name}\nCorreo: ${input.email}\n\n${input.message}`,
      html: `<p><strong>Nombre:</strong> ${escapeHtml(input.name)}</p><p><strong>Correo:</strong> ${escapeHtml(input.email)}</p><p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>`,
    }),
    signal: AbortSignal.timeout(8_000),
  });

  return response.ok;
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

  if (
    typeof payload === "object" &&
    payload !== null &&
    "website" in payload &&
    typeof payload.website === "string" &&
    payload.website.length > 0
  ) {
    return json({ ok: true }, 200);
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<ContactField, string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (isContactField(field)) {
        fieldErrors[field] ??= issue.message;
      }
    }

    return json(
      {
        ok: false,
        message: "Revisa los campos indicados.",
        fieldErrors,
      },
      400,
    );
  }

  try {
    /*
      Aquí había un contador por IP y email contra Upstash, y antes de él una
      verificación de Turnstile. Los dos se han retirado por el mismo motivo: no
      estaban aprovisionados en ningún entorno del proyecto. El contador no se
      ejecutó nunca —y era inalcanzable, porque Turnstile cortaba antes con un
      400—, y Turnstile aprobaba con la clave de prueba pública de Cloudflare en
      el cliente mientras rechazaba a todo el mundo en el servidor. Una defensa
      declarada que no existe es peor que no tenerla, porque se lee como una
      defensa.

      Lo que queda es la trampa para bots de arriba. Si hace falta un tope por
      email, el sitio es Convex —la única base de datos del producto— y la
      política está escrita en `~/server/marketplace/rate-limit`.
    */
    const sent = await sendContactEmail(parsed.data);
    if (!sent) throw new Error("Contact email provider rejected the request");

    return json({ ok: true }, 200);
  } catch (error) {
    console.error("Contact form submission failed", error);
    return json(
      {
        ok: false,
        message:
          "No hemos podido enviar el mensaje. Inténtalo de nuevo más tarde.",
      },
      503,
    );
  }
}

import { createHmac } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "~/env";
import {
  contactSchema,
  type ContactField,
  type ContactResponse,
} from "~/lib/contact";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 10_000;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 60 * 60;
const DEVELOPMENT_TURNSTILE_SECRET = "1x0000000000000000000000000000000AA";
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

function clientIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function hashIdentifier(value: string) {
  const secret =
    env.CONTACT_RATE_LIMIT_SECRET ??
    "development-contact-rate-limit";

  return createHmac("sha256", secret).update(value).digest("hex");
}

async function verifyTurnstile(token: string, ip: string) {
  const secret =
    env.TURNSTILE_SECRET_KEY ??
    (env.NODE_ENV === "development" ? DEVELOPMENT_TURNSTILE_SECRET : undefined);

  if (!secret) return false;

  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });
  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5_000),
    },
  );
  const result = (await response.json()) as { success?: boolean };

  return response.ok && result.success === true;
}

async function checkRateLimit(ip: string, email: string) {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return env.NODE_ENV !== "production";
  }

  const window = Math.floor(Date.now() / (RATE_WINDOW_SECONDS * 1000));
  const ipKey = `contact:ip:${hashIdentifier(ip)}:${window}`;
  const emailKey = `contact:email:${hashIdentifier(email)}:${window}`;

  const response = await fetch(`${env.UPSTASH_REDIS_REST_URL}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
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

  const ip = clientIp(request);

  try {
    const turnstileValid = await verifyTurnstile(
      parsed.data.turnstileToken,
      ip,
    );
    if (!turnstileValid) {
      return json(
        {
          ok: false,
          message: "No se pudo verificar el envío. Inténtalo de nuevo.",
        },
        400,
      );
    }

    const allowed = await checkRateLimit(ip, parsed.data.email);
    if (!allowed) {
      return json(
        {
          ok: false,
          message:
            "Se han realizado demasiados intentos. Inténtalo de nuevo más tarde.",
        },
        429,
      );
    }

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

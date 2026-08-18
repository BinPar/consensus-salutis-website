import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    VERTICAL_HOME: z
      .enum(["true", "false"])
      .default("false")
      .transform((value) => value === "true"),
    RESEND_API_KEY: z.string().optional(),
    CONTACT_FROM_EMAIL: z.string().optional(),
    CONTACT_TO_EMAIL: z.string().email().default("adrian@binpar.com"),
    TURNSTILE_SECRET_KEY: z.string().optional(),
    UPSTASH_REDIS_REST_URL: z.string().url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
    CONTACT_RATE_LIMIT_SECRET: z.string().min(32).optional(),
    /**
     * Firma de la cookie de sesión del evaluador de idoneidad. Requerido: sin
     * él no se puede atar un navegador a su evaluación, ni sostener la regla de
     * AWS de no confiar en un `awsAccountId` que no venga firmado por nosotros.
     */
    MARKETPLACE_SESSION_SECRET: z.string().min(32),
    /**
     * Pimienta del hash de los tokens de un solo uso. Va aparte del secreto de
     * sesión para que filtrar uno no comprometa el otro.
     */
    MARKETPLACE_TOKEN_PEPPER: z.string().min(32),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
    /**
     * Origen HTTP del deployment de Convex (`https://<slug>.convex.site`, no
     * `.convex.cloud`: las `httpAction` se sirven desde el primero).
     *
     * Es `NEXT_PUBLIC_` porque **el navegador la llama directamente**: la UI de
     * la entrevista abre `POST /eligibility-stream` contra este origen con la
     * sesión firmada en `Authorization`. No se proxya desde esta landing a
     * propósito — el stream de la entrevista dura minutos y Convex ya restringe
     * el CORS a los orígenes de `MARKETPLACE_ALLOWED_ORIGIN`, que es un control
     * más estricto que el que podría poner un proxy sin `Origin`.
     *
     * La ruta de la Etapa 0 usa la misma variable desde el servidor, contra
     * `/eligibility-start`, que sí es servidor a servidor.
     */
    NEXT_PUBLIC_CONVEX_SITE_URL: z
      .string()
      .url("Debe ser la URL del deployment de Convex (https://….convex.site).")
      .transform((value) => value.replace(/\/$/, "")),
    /**
     * `/sign-in` de `apps/chat`. AWS exige que un cliente que ya tiene cuenta
     * pueda entrar desde la página de fulfillment, y esa identidad es Clerk en
     * el monorepo — no la sesión de esta landing.
     *
     * Por defecto una ruta relativa: todo vive en `consensussalutis.com` y no hay
     * subdominios, así que la plataforma es el mismo origen. Relativa y no
     * absoluta a propósito — así también funciona en los despliegues de preview,
     * donde el host no es el de producción. Acepta una URL absoluta por si algún
     * día la plataforma se sirve desde otro sitio.
     */
    NEXT_PUBLIC_PLATFORM_SIGN_IN_URL: z
      .string()
      .refine(
        (value) => value.startsWith("/") || /^https?:\/\//.test(value),
        "Debe ser una ruta absoluta (/sign-in) o una URL http(s).",
      )
      .default("/sign-in"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERTICAL_HOME: process.env.VERTICAL_HOME,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CONTACT_FROM_EMAIL: process.env.CONTACT_FROM_EMAIL,
    CONTACT_TO_EMAIL: process.env.CONTACT_TO_EMAIL,
    TURNSTILE_SECRET_KEY: process.env.TURNSTILE_SECRET_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CONTACT_RATE_LIMIT_SECRET: process.env.CONTACT_RATE_LIMIT_SECRET,
    MARKETPLACE_SESSION_SECRET: process.env.MARKETPLACE_SESSION_SECRET,
    MARKETPLACE_TOKEN_PEPPER: process.env.MARKETPLACE_TOKEN_PEPPER,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_CONVEX_SITE_URL: process.env.NEXT_PUBLIC_CONVEX_SITE_URL,
    NEXT_PUBLIC_PLATFORM_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_PLATFORM_SIGN_IN_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

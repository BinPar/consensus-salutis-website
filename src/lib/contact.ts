import { z } from "zod";

import { routing } from "~/i18n/routing";

/**
 * Códigos de error del formulario de contacto. El esquema y `/api/contact`
 * devuelven el código, no la frase: el cliente lo traduce con
 * `contact.errors.<código>`, así que el mismo esquema sirve a todos los idiomas.
 */
export const contactErrorCodes = [
  "nameRequired",
  "nameTooLong",
  "emailInvalid",
  "emailTooLong",
  "messageTooShort",
  "messageTooLong",
  "privacyRequired",
  "tooLarge",
  "forbidden",
  "invalid",
  "fieldErrors",
  "sendFailed",
] as const;

export type ContactErrorCode = (typeof contactErrorCodes)[number];

export function isContactErrorCode(value: unknown): value is ContactErrorCode {
  return (
    typeof value === "string" &&
    (contactErrorCodes as readonly string[]).includes(value)
  );
}

const code = (value: ContactErrorCode) => value;

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, code("nameRequired"))
    .max(100, code("nameTooLong")),
  email: z
    .string()
    .trim()
    .email(code("emailInvalid"))
    .max(254, code("emailTooLong"))
    .transform((value) => value.toLowerCase()),
  message: z
    .string()
    .trim()
    .min(20, code("messageTooShort"))
    .max(3000, code("messageTooLong")),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({
      message: code("privacyRequired"),
    }),
  }),
  /** Trampa para bots: la única defensa antibot que queda. Tiene que ir vacío. */
  website: z.string().max(0),
  /* Idioma de la página desde la que se escribe, para contestar en el mismo. */
  locale: z.enum(routing.locales).default(routing.defaultLocale),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactField = keyof Pick<
  ContactInput,
  "name" | "email" | "message" | "privacyAccepted"
>;

export type ContactResponse =
  | { ok: true }
  | {
      ok: false;
      error: ContactErrorCode;
      /**
       * Un código de `ContactErrorCode` por campo. Si zod falla por algo que el
       * esquema no etiqueta (un tipo inesperado), llega su mensaje tal cual.
       */
      fieldErrors?: Partial<Record<ContactField, string>>;
    };

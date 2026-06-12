import { z } from "zod";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Introduce tu nombre completo.")
    .max(100, "El nombre no puede superar los 100 caracteres."),
  email: z
    .string()
    .trim()
    .email("Introduce un correo electrónico válido.")
    .max(254, "El correo electrónico es demasiado largo.")
    .transform((value) => value.toLowerCase()),
  message: z
    .string()
    .trim()
    .min(20, "El mensaje debe tener al menos 20 caracteres.")
    .max(3000, "El mensaje no puede superar los 3000 caracteres."),
  privacyAccepted: z.literal(true, {
    errorMap: () => ({
      message: "Debes aceptar la Política de Privacidad.",
    }),
  }),
  turnstileToken: z.string().min(1, "No se pudo completar la verificación."),
  website: z.string().max(0),
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
      message: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
    };

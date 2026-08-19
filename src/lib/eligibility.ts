/**
 * Etapa 0 del evaluador de idoneidad: identificación y consentimiento.
 *
 * Determinista y sin IA a propósito. Va antes de la entrevista por tres razones,
 * y las tres son de peso: AWS exige un campo de email visible en la página de
 * registro, un dato de contacto no se le fía a la extracción de un LLM, y así se
 * captura el contacto aunque abandonen la entrevista a mitad.
 *
 * ## Este esquema es solo del cliente
 *
 * Validación en zod aquí, validadores propios en el servidor
 * (`src/server/marketplace/assessment-validators.ts`). **No se comparte el
 * esquema entre los dos lados**: el `override` del workspace del monorepo fija
 * `zod: 4.3.6` para todo su grafo y este repo declara `^3.24.2`. Mientras eso
 * siga así, cruzar un esquema de zod por la frontera es un problema esperando a
 * pasar. Son dos validaciones que de todos modos conviene tener.
 */

import { z } from "zod";

/**
 * Tres opciones, no cuatro países.
 *
 * El diseño inicial ofrecía México, Colombia, Argentina y Chile como si fueran
 * mercado. Con ámbito España y techo para LatAm, eso promete en el formulario
 * una cobertura que el informe matiza tres minutos después. Tres opciones, y el
 * matiz lo explica el informe.
 */
export const AMBITO_PAIS_OPTIONS = [
  { value: "espana", label: "España" },
  { value: "latam", label: "País de Latinoamérica" },
  { value: "otro", label: "Otro país" },
] as const;

export const AMBITO_PAIS_VALUES = AMBITO_PAIS_OPTIONS.map(
  (option) => option.value,
);

/**
 * El cargo no puntúa.
 *
 * Adapta tono, orden y qué se da por sabido en la entrevista. Se evalúa a la
 * institución, no a la persona.
 */
export const CARGO_OPTIONS = [
  { value: "direccion-medica", label: "Dirección médica" },
  { value: "sistemas", label: "Sistemas / TI" },
  { value: "calidad", label: "Calidad" },
  { value: "formacion", label: "Formación" },
  { value: "innovacion", label: "Innovación" },
  { value: "otro", label: "Otro" },
] as const;

export const CARGO_VALUES = CARGO_OPTIONS.map((option) => option.value);

/**
 * Dominios de correo de consumo.
 *
 * Marcar uno de estos es **una señal para el equipo, no un descarte**: una
 * dirección médica que escribe desde su correo personal sigue siendo una
 * dirección médica. No penaliza en el veredicto y no bloquea el envío.
 */
const GENERIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.es",
  "outlook.com",
  "outlook.es",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "me.com",
  "aol.com",
  "gmx.com",
  "protonmail.com",
  "proton.me",
  "yandex.com",
  "zoho.com",
  "mail.com",
]);

/** Detecta si un email es de dominio genérico. Señal, nunca bloqueo. */
export function isGenericEmailDomain(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  return domain ? GENERIC_EMAIL_DOMAINS.has(domain) : false;
}

/**
 * Retención indefinida, con supresión a petición.
 *
 * Es legal con consentimiento explícito, y la base jurídica es precisamente ese
 * consentimiento: mientras no se retire, no hay plazo predeterminado. Lo que
 * sostiene el modelo es el derecho de supresión, así que la frase **tiene que
 * decir las dos cosas** — indefinida y borrable a petición. Declarar solo la
 * primera mitad sería lo que un revisor señalaría.
 *
 * Esta constante es la **única** fuente del texto: la usan el consentimiento en
 * `/evaluador` y la política en `/privacidad`, para que no puedan divergir
 * editando uno solo de los dos.
 */
export const RETENTION_STATEMENT =
  "Conservamos la ficha de identificación y la transcripción de la entrevista mientras mantengas el consentimiento, sin plazo predeterminado, y las suprimimos en cuanto lo solicites.";

/**
 * Versión del texto consentido, para poder demostrar qué se aceptó.
 *
 * Se sube cada vez que cambia `RETENTION_STATEMENT` o `PURPOSE_STATEMENT`: un
 * consentimiento solo es demostrable si consta contra qué texto se dio.
 */
export const CONSENT_TEXT_VERSION = "2026-08-evaluador-v2";

/** Finalidad declarada, compartida por el consentimiento y la política. */
export const PURPOSE_STATEMENT =
  "Tratamos estos datos para elaborar tu evaluación de idoneidad, enviarte el informe resultante y contactarte en relación con esa evaluación.";

export const eligibilitySchema = z.object({
  emailInstitucional: z
    .string()
    .trim()
    .min(1, "Introduce tu correo electrónico.")
    .email("Introduce un correo electrónico válido.")
    .max(254, "El correo electrónico es demasiado largo.")
    .transform((value) => value.toLowerCase()),
  nombre: z
    .string()
    .trim()
    .min(2, "Introduce tu nombre y apellidos.")
    .max(120, "El nombre no puede superar los 120 caracteres."),
  cargo: z.enum(
    CARGO_VALUES as [string, ...string[]],
    { errorMap: () => ({ message: "Selecciona tu cargo." }) },
  ),
  institucion: z
    .string()
    .trim()
    .min(2, "Introduce el nombre oficial de la institución.")
    .max(200, "El nombre no puede superar los 200 caracteres."),
  ambitoPais: z.enum(
    AMBITO_PAIS_VALUES as [string, ...string[]],
    { errorMap: () => ({ message: "Selecciona el ámbito geográfico." }) },
  ),
  webInstitucion: z
    .string()
    .trim()
    .max(200, "La dirección web es demasiado larga.")
    .refine(
      (value) => value.length === 0 || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/.test(value),
      "Introduce una dirección web válida.",
    )
    .optional()
    .or(z.literal("")),
  consentimiento: z.literal(true, {
    errorMap: () => ({
      message: "Debes aceptar el tratamiento de datos para continuar.",
    }),
  }),
  /** Trampa para bots, igual que en el formulario de contacto. */
  website: z.string().max(0),
});

export type EligibilityInput = z.input<typeof eligibilitySchema>;

export type EligibilityField =
  | "emailInstitucional"
  | "nombre"
  | "cargo"
  | "institucion"
  | "ambitoPais"
  | "webInstitucion"
  | "consentimiento";

export const ELIGIBILITY_FIELDS: readonly EligibilityField[] = [
  "emailInstitucional",
  "nombre",
  "cargo",
  "institucion",
  "ambitoPais",
  "webInstitucion",
  "consentimiento",
];

export type EligibilityResponse =
  | {
      ok: true;
      /**
       * Id de la evaluación creada en `draft`. Se devuelve para poder continuar
       * a la entrevista (#5); la sesión va aparte, en cookie firmada.
       */
      assessmentId: string;
    }
  | {
      ok: false;
      message: string;
      fieldErrors?: Partial<Record<EligibilityField, string>>;
    };

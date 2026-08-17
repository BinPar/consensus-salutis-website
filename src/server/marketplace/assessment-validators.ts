/**
 * Validación de servidor de la Etapa 0.
 *
 * Deliberadamente **no** reutiliza el esquema de zod de `src/lib/eligibility.ts`.
 * La issue lo fija: el `override` del workspace del monorepo fija `zod: 4.3.6`
 * para todo su grafo y este repo declara `^3.24.2`, así que mientras eso siga
 * así no se cruza un esquema de zod por la frontera. Estos validadores están
 * escritos en el estilo de los validadores de Convex (`v.string()`, `v.union()`,
 * `v.optional()`) para que, cuando `BinPar/consensus-salutis#83` aterrice,
 * trasladarlos sea una traducción mecánica y no un rediseño.
 *
 * Son dos validaciones independientes, y eso es una propiedad, no una
 * duplicación molesta: el cliente puede saltarse la suya sin más que un `fetch`
 * a mano.
 */

import {
  AMBITO_PAIS_VALUES,
  CARGO_VALUES,
  type EligibilityField,
} from "~/lib/eligibility";

export type ValidatedContact = {
  emailInstitucional: string;
  nombre: string;
  cargo: string;
  institucion: string;
  ambitoPais: string;
  webInstitucion?: string;
  consentimiento: true;
};

export type ValidationResult =
  | { ok: true; value: ValidatedContact }
  | { ok: false; fieldErrors: Partial<Record<EligibilityField, string>> };

/** Formato de email pragmático: una arroba, un dominio con punto, sin espacios. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;
const WEB_PATTERN = /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/;

/**
 * Los valores permitidos, como conjuntos de `string`.
 *
 * Aquí llega texto arbitrario del cliente, así que la comprobación tiene que
 * aceptar cualquier `string` de entrada — no la unión literal que usa zod en el
 * cliente. Las listas siguen siendo las mismas, así que añadir un cargo en
 * `~/lib/eligibility` lo habilita también aquí.
 */
const ALLOWED_CARGOS: ReadonlySet<string> = new Set(CARGO_VALUES);
const ALLOWED_AMBITOS: ReadonlySet<string> = new Set(AMBITO_PAIS_VALUES);

function readString(payload: Record<string, unknown>, field: string) {
  const value = payload[field];
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Valida el cuerpo recibido. No confía en nada del cliente, ni en que los campos
 * sean strings.
 */
export function validateAssessmentSubmission(
  payload: unknown,
): ValidationResult {
  const fieldErrors: Partial<Record<EligibilityField, string>> = {};

  if (typeof payload !== "object" || payload === null) {
    return {
      ok: false,
      fieldErrors: { emailInstitucional: "Solicitud no válida." },
    };
  }

  const body = payload as Record<string, unknown>;

  const emailInstitucional = readString(body, "emailInstitucional").toLowerCase();
  if (emailInstitucional.length === 0) {
    fieldErrors.emailInstitucional = "Introduce tu correo electrónico.";
  } else if (emailInstitucional.length > 254) {
    fieldErrors.emailInstitucional = "El correo electrónico es demasiado largo.";
  } else if (!EMAIL_PATTERN.test(emailInstitucional)) {
    fieldErrors.emailInstitucional = "Introduce un correo electrónico válido.";
  }

  const nombre = readString(body, "nombre");
  if (nombre.length < 2) {
    fieldErrors.nombre = "Introduce tu nombre y apellidos.";
  } else if (nombre.length > 120) {
    fieldErrors.nombre = "El nombre no puede superar los 120 caracteres.";
  }

  const cargo = readString(body, "cargo");
  if (!ALLOWED_CARGOS.has(cargo)) {
    fieldErrors.cargo = "Selecciona tu cargo.";
  }

  const institucion = readString(body, "institucion");
  if (institucion.length < 2) {
    fieldErrors.institucion = "Introduce el nombre oficial de la institución.";
  } else if (institucion.length > 200) {
    fieldErrors.institucion = "El nombre no puede superar los 200 caracteres.";
  }

  const ambitoPais = readString(body, "ambitoPais");
  if (!ALLOWED_AMBITOS.has(ambitoPais)) {
    fieldErrors.ambitoPais = "Selecciona el ámbito geográfico.";
  }

  const webInstitucion = readString(body, "webInstitucion");
  if (webInstitucion.length > 200) {
    fieldErrors.webInstitucion = "La dirección web es demasiado larga.";
  } else if (webInstitucion.length > 0 && !WEB_PATTERN.test(webInstitucion)) {
    fieldErrors.webInstitucion = "Introduce una dirección web válida.";
  }

  // El consentimiento tiene que ser un `true` explícito. Un string "true", un 1
  // o un objeto no valen: no se puede demostrar un consentimiento inferido.
  if (body.consentimiento !== true) {
    fieldErrors.consentimiento =
      "Debes aceptar el tratamiento de datos para continuar.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  return {
    ok: true,
    value: {
      emailInstitucional,
      nombre,
      cargo,
      institucion,
      ambitoPais,
      webInstitucion: webInstitucion.length > 0 ? webInstitucion : undefined,
      consentimiento: true,
    },
  };
}

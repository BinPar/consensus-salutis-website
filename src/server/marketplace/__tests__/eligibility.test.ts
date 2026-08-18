/**
 * Criterios de aceptación de la issue #4.
 *
 * Cubre las dos validaciones — la de zod en el cliente y la del servidor — y las
 * reglas que no son de validación sino de producto: tres opciones de país, el
 * dominio genérico como señal y no como bloqueo, y que los dos textos de
 * consentimiento y política digan lo mismo.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  AMBITO_PAIS_OPTIONS,
  CARGO_OPTIONS,
  ELIGIBILITY_FIELDS,
  eligibilitySchema,
  isGenericEmailDomain,
  RETENTION_STATEMENT,
} from "~/lib/eligibility";
import { validateAssessmentSubmission } from "~/server/marketplace/assessment-validators";

const VALID = {
  emailInstitucional: "direccion.medica@hospital.es",
  nombre: "Ana Pérez García",
  cargo: "direccion-medica",
  institucion: "Hospital Universitario de Ejemplo",
  ambitoPais: "espana",
  webInstitucion: "hospital.es",
  consentimiento: true as const,
  website: "",
};

describe("los siete campos", () => {
  it("son exactamente siete", () => {
    expect(ELIGIBILITY_FIELDS).toHaveLength(7);
  });

  it("acepta un envío completo en cliente y en servidor", () => {
    expect(eligibilitySchema.safeParse(VALID).success).toBe(true);
    expect(validateAssessmentSubmission(VALID).ok).toBe(true);
  });

  it("acepta el envío sin la web, que es el único campo opcional", () => {
    const withoutWeb: Record<string, unknown> = { ...VALID };
    delete withoutWeb.webInstitucion;

    expect(eligibilitySchema.safeParse(withoutWeb).success).toBe(true);

    const server = validateAssessmentSubmission(withoutWeb);
    expect(server.ok).toBe(true);
    if (!server.ok) return;
    expect(server.value.webInstitucion).toBeUndefined();
  });

  for (const field of [
    "emailInstitucional",
    "nombre",
    "cargo",
    "institucion",
    "ambitoPais",
  ] as const) {
    it(`rechaza el envío sin ${field}, en los dos lados`, () => {
      const payload = { ...VALID, [field]: "" };

      expect(eligibilitySchema.safeParse(payload).success).toBe(false);

      const server = validateAssessmentSubmission(payload);
      expect(server.ok).toBe(false);
      if (server.ok) return;
      expect(server.fieldErrors[field]).toBeDefined();
    });
  }

  it("rechaza un email con formato inválido en los dos lados", () => {
    const payload = { ...VALID, emailInstitucional: "no-es-un-email" };

    expect(eligibilitySchema.safeParse(payload).success).toBe(false);
    expect(validateAssessmentSubmission(payload).ok).toBe(false);
  });

  it("normaliza el email a minúsculas en los dos lados", () => {
    const payload = { ...VALID, emailInstitucional: "  Direccion@Hospital.ES " };

    const client = eligibilitySchema.safeParse(payload);
    expect(client.success).toBe(true);
    if (client.success) {
      expect(client.data.emailInstitucional).toBe("direccion@hospital.es");
    }

    const server = validateAssessmentSubmission(payload);
    expect(server.ok).toBe(true);
    if (server.ok) {
      expect(server.value.emailInstitucional).toBe("direccion@hospital.es");
    }
  });

  it("el servidor no se fía de tipos: rechaza campos que no son string", () => {
    for (const payload of [
      null,
      "una cadena",
      { ...VALID, nombre: 42 },
      { ...VALID, cargo: { value: "direccion-medica" } },
      { ...VALID, emailInstitucional: ["a@b.es"] },
    ]) {
      expect(validateAssessmentSubmission(payload).ok).toBe(false);
    }
  });

  it("el servidor rechaza un cargo o ámbito que no está en la lista", () => {
    expect(
      validateAssessmentSubmission({ ...VALID, cargo: "director-general" }).ok,
    ).toBe(false);
    expect(
      validateAssessmentSubmission({ ...VALID, ambitoPais: "mexico" }).ok,
    ).toBe(false);
  });
});

describe("el cargo adapta el tono pero no puntúa", () => {
  it("ofrece los perfiles que la issue enumera", () => {
    const values = CARGO_OPTIONS.map((option) => option.value);

    for (const expected of [
      "direccion-medica",
      "sistemas",
      "calidad",
      "formacion",
      "innovacion",
    ]) {
      expect(values).toContain(expected);
    }
  });

  it("cualquier cargo válido pasa igual: se evalúa a la institución, no a la persona", () => {
    for (const option of CARGO_OPTIONS) {
      const result = validateAssessmentSubmission({
        ...VALID,
        cargo: option.value,
      });

      expect(result.ok).toBe(true);
      if (result.ok) expect(result.value.cargo).toBe(option.value);
    }
  });
});

describe("el selector de país tiene exactamente tres opciones", () => {
  it("son tres y son España, LatAm y otro país", () => {
    expect(AMBITO_PAIS_OPTIONS).toHaveLength(3);
    expect(AMBITO_PAIS_OPTIONS.map((option) => option.value)).toEqual([
      "espana",
      "latam",
      "otro",
    ]);
  });

  it("no ofrece países de LatAm por separado como si fueran mercado", () => {
    const labels = AMBITO_PAIS_OPTIONS.map((option) =>
      option.label.toLowerCase(),
    ).join(" ");

    for (const country of ["méxico", "mexico", "colombia", "argentina", "chile"]) {
      expect(labels).not.toContain(country);
    }
  });
});

describe("el dominio genérico es señal, no bloqueo", () => {
  it("detecta los dominios de consumo habituales", () => {
    for (const email of [
      "alguien@gmail.com",
      "alguien@hotmail.es",
      "alguien@outlook.com",
      "ALGUIEN@YAHOO.ES",
      "  alguien@icloud.com  ",
    ]) {
      expect(isGenericEmailDomain(email)).toBe(true);
    }
  });

  it("no marca un dominio institucional", () => {
    for (const email of [
      "direccion@hospital.es",
      "jefatura@salud.gob.es",
      "ti@clinicauniversitaria.cl",
    ]) {
      expect(isGenericEmailDomain(email)).toBe(false);
    }
  });

  // Criterio de aceptación §7: marcado como señal, sin bloquear el envío. Una
  // dirección médica que escribe desde su correo personal sigue siendo una
  // dirección médica.
  it("no impide enviar el formulario ni en cliente ni en servidor", () => {
    const payload = { ...VALID, emailInstitucional: "jefa.servicio@gmail.com" };

    expect(eligibilitySchema.safeParse(payload).success).toBe(true);
    expect(validateAssessmentSubmission(payload).ok).toBe(true);
  });
});

describe("consentimiento", () => {
  it("es obligatorio en los dos lados", () => {
    const payload = { ...VALID, consentimiento: false };

    expect(eligibilitySchema.safeParse(payload).success).toBe(false);

    const server = validateAssessmentSubmission(payload);
    expect(server.ok).toBe(false);
    if (server.ok) return;
    expect(server.fieldErrors.consentimiento).toBeDefined();
  });

  it("no acepta un consentimiento inferido de un valor truthy", () => {
    // Un "true" de string o un 1 no demuestran un consentimiento expreso.
    for (const value of ["true", 1, "on", {}, []]) {
      expect(
        validateAssessmentSubmission({ ...VALID, consentimiento: value }).ok,
      ).toBe(false);
    }
  });
});

describe("retención declarada y coherente entre los dos textos", () => {
  const evaluadorPage = readFileSync(
    join(process.cwd(), "src", "app", "evaluador", "page.tsx"),
    "utf8",
  );
  const privacidadPage = readFileSync(
    join(process.cwd(), "src", "app", "privacidad", "page.tsx"),
    "utf8",
  );
  const form = readFileSync(
    join(process.cwd(), "src", "app", "_components", "eligibility-form.tsx"),
    "utf8",
  );

  // Retención indefinida sostenida por el consentimiento. Lo que hace que el
  // modelo se sostenga es la supresión a petición, así que el texto tiene que
  // declarar las dos cosas: que no hay plazo y que se borra si lo piden.
  it("declara que no hay plazo predeterminado", () => {
    expect(RETENTION_STATEMENT.toLowerCase()).toContain(
      "sin plazo predeterminado",
    );
  });

  it("declara la supresión a petición junto a la retención indefinida", () => {
    expect(RETENTION_STATEMENT.toLowerCase()).toContain("solicites");
  });

  it("ata la retención al consentimiento, que es su base jurídica", () => {
    expect(RETENTION_STATEMENT.toLowerCase()).toContain("consentimiento");
  });

  // Criterio de aceptación §7: el plazo declarado en los dos textos. Comparten
  // la constante, así que no pueden divergir editando solo uno.
  it("el consentimiento y la política salen de la misma constante", () => {
    expect(form).toContain("RETENTION_STATEMENT");
    expect(privacidadPage).toContain("RETENTION_STATEMENT");
    expect(evaluadorPage).toContain("RETENTION_STATEMENT");
  });

  it("el consentimiento enlaza a /privacidad", () => {
    expect(form).toContain('href="/privacidad"');
  });
});

describe("requisitos de la página de fulfillment", () => {
  const evaluadorPage = readFileSync(
    join(process.cwd(), "src", "app", "evaluador", "page.tsx"),
    "utf8",
  );
  const form = readFileSync(
    join(process.cwd(), "src", "app", "_components", "eligibility-form.tsx"),
    "utf8",
  );

  it("el email es el primer campo del formulario, para que se vea sin scroll", () => {
    const emailIndex = form.indexOf('name="emailInstitucional"');
    const otherIndexes = [
      'name="nombre"',
      'name="cargo"',
      'name="institucion"',
      'name="ambitoPais"',
    ].map((needle) => form.indexOf(needle));

    expect(emailIndex).toBeGreaterThan(-1);
    for (const index of otherIndexes) {
      expect(emailIndex).toBeLessThan(index);
    }
  });

  it("el soporte está en la propia página, con contacto directo", () => {
    expect(evaluadorPage).toContain("mailto:");
    expect(evaluadorPage).toContain("info@binpar.com");
    expect(evaluadorPage).toContain("Soporte");
  });

  // Dos enlaces, porque son dos identidades distintas y no se cruzan.
  it("están los dos enlaces de acceso para clientes existentes", () => {
    expect(evaluadorPage).toContain("Acceder a mi espacio de evaluación");
    expect(evaluadorPage).toContain('href="/espacio"');
    expect(evaluadorPage).toContain("Entrar a la plataforma");
    expect(evaluadorPage).toContain("NEXT_PUBLIC_PLATFORM_SIGN_IN_URL");
  });
});

describe("el envío no dispara correo", () => {
  const route = readFileSync(
    join(process.cwd(), "src", "app", "api", "evaluador", "route.ts"),
    "utf8",
  );

  /*
    El `draft`, el `origin: "directo"` y el `subscriptionId` nulo los decide
    ahora Convex —`startAssessment` los escribe a partir de si viene o no una
    suscripción—, así que lo que le toca comprobar a este repo es que la ruta
    delega en ese arranque y que NO le pasa ninguna suscripción, que es lo que
    hace que la evaluación sea `directo` mientras no exista la issue #3.
  */
  it("crea el assessment delegando en Convex, sin suscripción", () => {
    expect(route).toContain("startEligibilityAssessment");
    expect(route).not.toContain("subscriptionId:");
  });

  // Criterio de aceptación §7: el envío crea el assessment en draft y no manda
  // ningún correo. Un draft no consume la evaluación de la cuenta.
  it("no llama a ningún proveedor de email", () => {
    expect(route).not.toContain("resend");
    expect(route).not.toContain("RESEND_API_KEY");
    expect(route).not.toContain("api.resend.com");
    expect(route).not.toMatch(/sendMail|sendEmail|sendContactEmail/);
  });
});

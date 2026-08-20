/**
 * La copy del espacio de cliente y la validación del formulario (issue #7 §3 y
 * §5), lo que sí es una función y se puede llamar.
 *
 * Los tres son casos de borde que se ven en la pantalla del cliente y no en un
 * log: una fecha que no ha llegado, un mes escrito en inglés y un correo con un
 * espacio delante porque se ha pegado del correo.
 */

import { describe, expect, it } from "vitest";

import {
  accesoSchema,
  cuerpoConFecha,
  ESTADO_COPY,
  fechaLarga,
} from "~/lib/espacio";

/** 15 de enero de 2026 a mediodía UTC: la hora evita que el día baile por zona. */
const QUINCE_DE_ENERO = Date.UTC(2026, 0, 15, 12);

describe("cuerpoConFecha · la frase con plazo", () => {
  const CON_PLAZO = ESTADO_COPY.resolved.cuerpo;

  it("sustituye el hueco por la fecha cuando la hay", () => {
    const resultado = cuerpoConFecha(CON_PLAZO, "15 de enero de 2026");

    expect(resultado).toContain("te contacta antes del 15 de enero de 2026");
    expect(resultado).not.toContain("{fecha}");
  });

  /*
    Sin fecha se cae la FRASE ENTERA, no solo el hueco. «Te contacta antes del
    undefined» —o «antes del », con el espacio colgando— es peor que no prometer
    plazo: el plazo comprometido lo pone el monorepo y cuando no viene es porque
    no hay ninguno que prometer.
  */
  it("sin fecha quita la frase entera, no deja el hueco a medias", () => {
    const resultado = cuerpoConFecha(CON_PLAZO, null);

    expect(resultado).not.toContain("{fecha}");
    expect(resultado).not.toContain("undefined");
    expect(resultado).not.toContain("null");
    expect(resultado).not.toContain("te contacta");
    expect(resultado).not.toMatch(/antes del\s*$/);
  });

  it("y lo que queda sigue siendo una frase bien formada", () => {
    const resultado = cuerpoConFecha(CON_PLAZO, null);

    expect(resultado.length).toBeGreaterThan(20);
    // Empieza en mayúscula y termina en punto: es lo que se pinta debajo del
    // titular, no un trozo de frase.
    expect(resultado).toMatch(/^[A-ZÁÉÍÓÚÑ]/);
    expect(resultado.endsWith(".")).toBe(true);
    expect(resultado).not.toMatch(/\s{2,}/);
  });

  it("un cuerpo sin hueco se queda igual, con fecha y sin ella", () => {
    // Tres de los cuatro estados no prometen plazo, y a esos no les pasa nada.
    const sinHueco = ESTADO_COPY.provisioned.cuerpo;

    expect(cuerpoConFecha(sinHueco, null)).toBe(sinHueco);
    expect(cuerpoConFecha(sinHueco, "15 de enero de 2026")).toBe(sinHueco);
  });
});

describe("fechaLarga · la fecha en la lengua del cliente", () => {
  it("escribe el mes en castellano, la misma forma que la página del informe", () => {
    expect(fechaLarga(QUINCE_DE_ENERO)).toBe("15 de enero de 2026");
  });

  it("no cuela ningún mes en inglés", () => {
    const doceMeses = Array.from({ length: 12 }, (_, mes) =>
      fechaLarga(Date.UTC(2026, mes, 15, 12)),
    ).join(" ");

    expect(doceMeses).not.toMatch(
      /January|February|March|April|June|July|August|October/,
    );
  });
});

describe("accesoSchema · el formulario de una línea", () => {
  it("acepta un correo institucional normal", () => {
    const result = accesoSchema.safeParse({
      email: "direccion.medica@hospital-universitario.es",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe(
      "direccion.medica@hospital-universitario.es",
    );
  });

  it("recorta los espacios de pegar el correo desde el buzón", () => {
    const result = accesoSchema.safeParse({
      email: "  compras@hospital.example  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.email).toBe("compras@hospital.example");
  });

  for (const [nombre, email] of [
    ["vacío", ""],
    ["solo espacios", "   "],
    ["sin arroba", "compras.hospital.example"],
    ["más largo de 254 caracteres", `${"a".repeat(250)}@hospital.example`],
  ] as const) {
    it(`rechaza un correo ${nombre}`, () => {
      const result = accesoSchema.safeParse({ email });

      expect(result.success).toBe(false);
      if (result.success) return;
      // El mensaje va en castellano y al campo: es lo que se pinta debajo del
      // input, no una traza.
      expect(result.error.issues[0]?.message).toMatch(/correo/i);
    });
  }

  it("rechaza un email que no es cadena", () => {
    expect(accesoSchema.safeParse({ email: 42 }).success).toBe(false);
    expect(accesoSchema.safeParse({}).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import {
  generateReportSlug,
  isWellFormedReportSlug,
  REPORT_SLUG_CAPABILITIES,
  REPORT_SLUG_LENGTH,
} from "~/server/marketplace/report";

describe("slug del informe reenviable", () => {
  it("genera un slug largo, no adivinable y seguro para URL", () => {
    const slug = generateReportSlug();

    expect(slug).toHaveLength(REPORT_SLUG_LENGTH);
    expect(slug).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(isWellFormedReportSlug(slug)).toBe(true);
  });

  it("no repite slugs", () => {
    const slugs = new Set(
      Array.from({ length: 200 }, () => generateReportSlug()),
    );

    expect(slugs.size).toBe(200);
  });

  it("rechaza slugs con forma inválida antes de tocar la base de datos", () => {
    for (const invalid of ["", "corto", "a".repeat(REPORT_SLUG_LENGTH + 1), `${"a".repeat(REPORT_SLUG_LENGTH - 1)}/`]) {
      expect(isWellFormedReportSlug(invalid)).toBe(false);
    }
  });

  // §5: un enlace filtrado expone un informe, no una sesión. Eso es lo que hace
  // aceptable que el slug sea un secreto compartible y sin caducidad corta.
  it("el acceso por slug es solo lectura y no concede sesión", () => {
    expect(REPORT_SLUG_CAPABILITIES.readReport).toBe(true);
    expect(REPORT_SLUG_CAPABILITIES.accessCustomerSpace).toBe(false);
    expect(REPORT_SLUG_CAPABILITIES.readSubscriptionStatus).toBe(false);
  });
});

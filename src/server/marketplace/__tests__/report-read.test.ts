import { describe, expect, it, vi } from "vitest";

vi.mock("~/env", () => ({
  env: { NEXT_PUBLIC_CONVEX_SITE_URL: "https://deployment.convex.site" },
}));

import { REPORT_SLUG_LENGTH } from "~/server/marketplace/report";
import {
  awsBadgeDigits,
  fetchReportBySlug,
} from "~/server/marketplace/report-read";
import type { SessionVerification } from "~/server/marketplace/session";

/**
 * La lectura del informe reenviable (issue #6) y la decisión del badge. Lo que
 * se prueba es el contrato con `/eligibility-report` (#90) y las reglas de
 * acceso: qué NO cruza al navegador y cuándo el badge no puede aparecer.
 */

const SLUG = "a".repeat(REPORT_SLUG_LENGTH);

const validPayload = () => ({
  assessmentId: "assessment-1",
  institucion: "Hospital Universitario Ejemplo",
  completedAt: 1_766_000_000_000,
  nivel: "casi",
  nivelNombre: "Casi listos",
  titular: "Podemos empezar ya, con dos servicios",
  diagnostico: "El encaje es bueno y hay trabajo previo identificado.",
  dims: [
    {
      dimension: "Datos y cumplimiento",
      color: "rojo",
      estado: "requiere replantearse",
      motivo: "No hay delegado de protección de datos asignado.",
    },
  ],
  pasos: [
    {
      dimension: "Datos y cumplimiento",
      color: "rojo",
      texto: "Asignar el delegado de protección de datos.",
      apoyo:
        "la plantilla de la evaluación de impacto y una sesión con vuestro DPO.",
    },
  ],
  encaje: {
    dentro: ["Consulta de protocolos"],
    pronto: [
      { uso: "Historia clínica", puerta: "se cierre el marco de datos" },
    ],
    fuera: ["Uso promocional"],
    quien: "Adjuntos y jefes de servicio.",
  },
  hoyCorto: "Consulta de protocolos en dos servicios",
  plazoHabil: "5 días laborables",
  canalSoporte: "marketplace@consensussalutis.com",
  reportMarkdown: "# Informe de idoneidad",
});

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

describe("fetchReportBySlug", () => {
  it("devuelve el informe de una respuesta que cumple el contrato", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(validPayload()));
    const report = await fetchReportBySlug(SLUG, { fetcher });

    expect(fetcher).toHaveBeenCalledWith(
      `https://deployment.convex.site/eligibility-report/${SLUG}`,
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(report?.nivelNombre).toBe("Casi listos");
    expect(report?.encaje?.pronto[0]?.puerta).toBe(
      "se cierre el marco de datos",
    );
    // El titular y nuestra parte de cada paso son lo que vende la página: si no
    // cruzaran la frontera, el informe volvería a abrir con la nota.
    expect(report?.titular).toBe("Podemos empezar ya, con dos servicios");
    expect(report?.pasos[0]?.apoyo).toContain("una sesión con vuestro DPO");
  });

  it("un informe de antes del titular sigue siendo válido: la página lo suple", async () => {
    // `titular` y `apoyo` los escribe el motor y son opcionales a propósito: un
    // informe guardado antes del cambio tiene que seguir abriéndose, con el
    // titular por nivel y sin la línea de nuestra parte.
    const payload: Record<string, unknown> = {
      ...validPayload(),
      pasos: validPayload().pasos.map(({ apoyo: _apoyo, ...paso }) => paso),
    };
    delete payload.titular;
    const fetcher = vi.fn().mockResolvedValue(jsonResponse(payload));
    const report = await fetchReportBySlug(SLUG, { fetcher });

    expect(report).not.toBeNull();
    expect(report?.titular).toBeUndefined();
    expect(report?.pasos[0]?.apoyo).toBeUndefined();
  });

  it("un slug malformado NI SE CONSULTA", async () => {
    const fetcher = vi.fn();
    for (const bad of ["", "corto", "a".repeat(44), `${"a".repeat(42)}!`]) {
      expect(await fetchReportBySlug(bad, { fetcher })).toBeNull();
    }
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("el 404 del endpoint es un informe que no existe", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        jsonResponse({ error: "Informe no encontrado." }, 404),
      );
    expect(await fetchReportBySlug(SLUG, { fetcher })).toBeNull();
  });

  it("una respuesta fuera de contrato no llega a la página", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ nivel: "casi" }));
    expect(await fetchReportBySlug(SLUG, { fetcher })).toBeNull();
  });

  it("un fallo de red no revienta la página: informe no disponible", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("ECONNREFUSED"));
    expect(await fetchReportBySlug(SLUG, { fetcher })).toBeNull();
  });

  it("los campos que no son del contrato SE DESCARTAN en la frontera", async () => {
    // Si el endpoint filtrara de más algún día, esta frontera es la segunda
    // puerta: nada que no esté en el esquema puede llegar a un componente.
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        ...validPayload(),
        subscriptionId: "sub-1",
        awsAccountId: "123456784471",
        ficha: { corpus: {} },
        banderas: [{ tipo: "phi_previsto", motivo: "x" }],
        reglasDisparadas: ["datos.sin-dpo"],
        criteriaVersion: 3,
      }),
    );
    const report = await fetchReportBySlug(SLUG, { fetcher });
    expect(report).not.toBeNull();
    for (const forbidden of [
      "subscriptionId",
      "awsAccountId",
      "ficha",
      "banderas",
      "reglasDisparadas",
      "criteriaVersion",
    ]) {
      expect(Object.keys(report ?? {}), forbidden).not.toContain(forbidden);
    }
  });
});

describe("awsBadgeDigits · el badge solo con la cookie que lo prueba", () => {
  const session = (
    over: Partial<{ assessmentId: string; awsAccountId?: string }> = {},
  ) =>
    ({
      ok: true,
      session: {
        assessmentId: "assessment-1",
        awsAccountId: "123456784471",
        iat: 1,
        exp: 2,
        ...over,
      },
    }) satisfies SessionVerification;

  it("aparece con cookie de AWS de ESTA evaluación, y solo los últimos dígitos", () => {
    expect(awsBadgeDigits(session(), "assessment-1")).toBe("4471");
  });

  it("no aparece con acceso reenviado (sin cookie)", () => {
    expect(
      awsBadgeDigits({ ok: false, reason: "missing" }, "assessment-1"),
    ).toBeNull();
  });

  it("no aparece con una cookie caducada o rota", () => {
    expect(
      awsBadgeDigits({ ok: false, reason: "expired" }, "assessment-1"),
    ).toBeNull();
    expect(
      awsBadgeDigits({ ok: false, reason: "bad-signature" }, "assessment-1"),
    ).toBeNull();
  });

  it("no aparece con la cookie de OTRA evaluación: el enlace reenviado no hereda badges", () => {
    expect(awsBadgeDigits(session(), "assessment-2")).toBeNull();
  });

  it("no aparece en una evaluación directa, que tiene cookie pero no suscripción", () => {
    expect(
      awsBadgeDigits(session({ awsAccountId: undefined }), "assessment-1"),
    ).toBeNull();
  });
});

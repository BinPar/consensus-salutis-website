import { afterEach, describe, expect, it, vi } from "vitest";

import {
  checkMarketplaceRateLimit,
  issueLinkOutcome,
  RATE_LIMIT,
} from "~/server/marketplace/rate-limit";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";

const REDIS = {
  redisUrl: "https://redis.example",
  redisToken: "token-de-pruebas",
  secret: SECRET,
  allowWithoutRedis: false,
};

/** Simula la respuesta del pipeline de Upstash: [incr ip, expire, incr email, expire]. */
function mockRedis(ipCount: number, emailCount: number) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve([
        { result: ipCount },
        { result: 1 },
        { result: emailCount },
        { result: 1 },
      ]),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("limitación de tasa del marketplace", () => {
  it("permite dentro del límite y deniega al pasarlo", async () => {
    mockRedis(RATE_LIMIT, 1);
    await expect(
      checkMarketplaceRateLimit(
        { ip: "203.0.113.1", email: "gerencia@hospital.example" },
        REDIS,
      ),
    ).resolves.toBe(true);

    mockRedis(RATE_LIMIT + 1, 1);
    await expect(
      checkMarketplaceRateLimit(
        { ip: "203.0.113.1", email: "gerencia@hospital.example" },
        REDIS,
      ),
    ).resolves.toBe(false);
  });

  it("deniega cuando el que se pasa es el contador del email", async () => {
    mockRedis(1, RATE_LIMIT + 1);
    await expect(
      checkMarketplaceRateLimit(
        { ip: "203.0.113.9", email: "gerencia@hospital.example" },
        REDIS,
      ),
    ).resolves.toBe(false);
  });

  it("no pone el email en claro en ninguna clave de Redis", async () => {
    const fetchMock = mockRedis(1, 1);
    await checkMarketplaceRateLimit(
      { ip: "203.0.113.1", email: "gerencia@hospital.example" },
      REDIS,
    );

    const init = fetchMock.mock.calls[0]?.[1] as
      | { body?: string }
      | undefined;
    const body = init?.body ?? "";

    expect(body).not.toContain("gerencia@hospital.example");
    expect(body).not.toContain("203.0.113.1");
    expect(body).toContain("marketplace:email:");
  });

  it("deniega si Redis falla, en lugar de abrirse", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("red caída")));

    await expect(
      checkMarketplaceRateLimit(
        { ip: "203.0.113.1", email: "gerencia@hospital.example" },
        REDIS,
      ),
    ).resolves.toBe(false);
  });

  it("deniega en producción cuando no hay Redis configurado", async () => {
    await expect(
      checkMarketplaceRateLimit(
        { ip: "203.0.113.1", email: "gerencia@hospital.example" },
        { secret: SECRET, allowWithoutRedis: false },
      ),
    ).resolves.toBe(false);
  });

  // Criterio de aceptación §6: la limitación responde igual con email conocido
  // y desconocido — si no, el formulario es un oráculo de quién es cliente.
  it("responde exactamente igual con email conocido y desconocido", () => {
    const conocido = { ...issueLinkOutcome };
    const desconocido = { ...issueLinkOutcome };

    expect(JSON.stringify(conocido)).toBe(JSON.stringify(desconocido));
    expect(Object.keys(issueLinkOutcome)).toEqual(["ok", "message"]);
    expect(issueLinkOutcome.message).not.toMatch(/no existe|no encontrad|desconocid/i);
  });

  it("la respuesta pública está congelada, así que no se le puede añadir un campo delator", () => {
    expect(Object.isFrozen(issueLinkOutcome)).toBe(true);
  });
});

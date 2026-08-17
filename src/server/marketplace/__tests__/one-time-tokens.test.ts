import { describe, expect, it } from "vitest";

import {
  hashToken,
  issueOneTimeToken,
  redeemOneTimeToken,
  TOKEN_TTL_SECONDS,
} from "~/server/marketplace/one-time-tokens";
import { createInMemoryStore } from "~/server/marketplace/store";

const PEPPER = "pimienta-de-pruebas-con-mas-de-32-caracteres";
const NOW = 1_760_000_000;

function setup() {
  return createInMemoryStore();
}

describe("tokens de un solo uso", () => {
  it("emite un token no adivinable y devuelve su caducidad", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    expect(issued.token.length).toBeGreaterThanOrEqual(40);
    expect(issued.expiresAt).toBe(NOW + TOKEN_TTL_SECONDS);
  });

  // Criterio de aceptación §6: se guarda el hash, no el token.
  it("no persiste el token en claro en ningún campo", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    const redeemed = await store.redeemToken(
      hashToken(issued.token, PEPPER),
      NOW + 1,
    );

    expect(redeemed.ok).toBe(true);
    if (!redeemed.ok) return;

    const serialized = JSON.stringify(redeemed.token);
    expect(serialized).not.toContain(issued.token);
    expect(redeemed.token.tokenHash).toBe(hashToken(issued.token, PEPPER));
  });

  it("caduca a los 30 minutos", () => {
    expect(TOKEN_TTL_SECONDS).toBe(30 * 60);
  });

  // Criterio de aceptación §6: emitir, canjear y reutilizar — el segundo canje falla.
  it("canjea una vez y falla el segundo canje", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    const first = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      now: NOW + 60,
    });

    expect(first.ok).toBe(true);
    if (first.ok) {
      expect(first.token.usedAt).toBe(NOW + 60);
      expect(first.token.subscriptionId).toBe("sub_1");
    }

    const second = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      now: NOW + 61,
    });

    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.reason).toBe("already-used");
  });

  // Criterio de aceptación §6: un token caducado falla.
  it("rechaza un token caducado", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    const result = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      now: NOW + TOKEN_TTL_SECONDS + 1,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("expired");
  });

  it("rechaza un token que nunca se emitió", async () => {
    const store = setup();
    const result = await redeemOneTimeToken("token-inventado", {
      store,
      pepper: PEPPER,
      now: NOW,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unknown");
  });

  it("rechaza un token válido verificado con otra pimienta", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    const result = await redeemOneTimeToken(issued.token, {
      store,
      pepper: "otra-pimienta-de-pruebas-con-mas-de-32-caracteres",
      now: NOW + 60,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unknown");
  });

  // Criterio de aceptación §6: un token de una suscripción no sirve para otra.
  it("no sirve para otra suscripción", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    const cross = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      expectedSubscriptionId: "sub_2",
      now: NOW + 60,
    });

    expect(cross.ok).toBe(false);
    if (cross.ok) return;
    expect(cross.reason).toBe("wrong-subscription");
  });

  it("un canje cruzado rechazado no gasta el token para su dueña", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
      { store, pepper: PEPPER, now: NOW },
    );

    await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      expectedSubscriptionId: "sub_2",
      now: NOW + 60,
    });

    // El intento contra sub_2 no debe haber quemado el token: sigue valiendo
    // para la suscripción a la que se emitió.
    const legit = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      expectedSubscriptionId: "sub_1",
      now: NOW + 61,
    });

    expect(legit.ok).toBe(true);
  });

  it("normaliza el email al que queda ligado el token", async () => {
    const store = setup();
    const issued = await issueOneTimeToken(
      { subscriptionId: "sub_1", email: "  Gerencia@Hospital.Example  " },
      { store, pepper: PEPPER, now: NOW },
    );

    const result = await redeemOneTimeToken(issued.token, {
      store,
      pepper: PEPPER,
      now: NOW + 60,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.token.email).toBe("gerencia@hospital.example");
  });

  it("dos emisiones nunca producen el mismo token", async () => {
    const store = setup();
    const tokens = new Set<string>();

    for (let index = 0; index < 50; index += 1) {
      const issued = await issueOneTimeToken(
        { subscriptionId: "sub_1", email: "gerencia@hospital.example" },
        { store, pepper: PEPPER, now: NOW },
      );
      tokens.add(issued.token);
    }

    expect(tokens.size).toBe(50);
  });
});

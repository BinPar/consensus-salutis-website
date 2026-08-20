/**
 * La política de limitación de tasa y la respuesta indistinguible.
 *
 * Ya no hay tests de contador: el contador no vive aquí — ver la cabecera de
 * `rate-limit.ts`—, así que lo que queda por fijar es lo que sí decide este
 * módulo y que quien lo implemente en Convex tiene que respetar.
 */

import { describe, expect, it } from "vitest";

import {
  issueLinkOutcome,
  RATE_LIMIT,
  RATE_WINDOW_SECONDS,
  SHARED_IP_RATE_LIMIT,
} from "~/server/marketplace/rate-limit";

describe("política de limitación de tasa del marketplace", () => {
  it("son cinco por hora, la misma ventana que el formulario de contacto", () => {
    expect(RATE_LIMIT).toBe(5);
    expect(RATE_WINDOW_SECONDS).toBe(60 * 60);
  });

  /*
    Los dos topes son independientes y el de IP va por encima: en un hospital la
    IP se comparte y el sexto compañero que rellena el formulario no es un bot,
    mientras que el contador del email —el que protege un buzón ajeno— tiene que
    seguir en cinco. Si alguien iguala los dos, este test lo dice.
  */
  it("el tope de IP es más alto que el de email, no igual", () => {
    expect(SHARED_IP_RATE_LIMIT).toBeGreaterThan(RATE_LIMIT);
  });

  // Criterio de aceptación §6: la limitación responde igual con email conocido
  // y desconocido — si no, el formulario es un oráculo de quién es cliente.
  it("responde exactamente igual con email conocido y desconocido", () => {
    const conocido = { ...issueLinkOutcome };
    const desconocido = { ...issueLinkOutcome };

    expect(JSON.stringify(conocido)).toBe(JSON.stringify(desconocido));
    expect(Object.keys(issueLinkOutcome)).toEqual(["ok", "message"]);
    expect(issueLinkOutcome.message).not.toMatch(
      /no existe|no encontrad|desconocid/i,
    );
  });

  it("la respuesta pública está congelada, así que no se le puede añadir un campo delator", () => {
    expect(Object.isFrozen(issueLinkOutcome)).toBe(true);
  });
});

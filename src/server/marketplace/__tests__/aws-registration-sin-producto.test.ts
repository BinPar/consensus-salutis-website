/**
 * El fallo que no puede pasar delante del revisor de AWS: sin
 * `AWS_MP_PRODUCT_CODE` puesto, la comparación del código de producto se vuelve
 * `undefined === undefined` y **acepta cualquier producto**.
 *
 * Va en un archivo aparte porque `~/env` valida el entorno al cargarse y la ruta
 * lo lee de ahí: con el resto de los tests en el mismo módulo, el entorno ya
 * estaría puesto antes de poder quitarlo.
 */

import { describe, expect, it, vi } from "vitest";

import type * as AwsResolveModule from "~/server/marketplace/aws-resolve-customer";
import type * as ConvexRegisterModule from "~/server/marketplace/convex-register";

vi.stubEnv(
  "MARKETPLACE_SESSION_SECRET",
  "secreto-de-pruebas-con-mas-de-32-caracteres",
);
vi.stubEnv(
  "MARKETPLACE_TOKEN_PEPPER",
  "secreto-de-pruebas-con-mas-de-32-caracteres",
);
vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");
// La que NO se pone. Es el objeto de este archivo.
vi.stubEnv("AWS_MP_PRODUCT_CODE", "");

/*
  Los dos colaboradores, sustituidos para poder afirmar que NO se les llama: sin
  código de producto no hay nada contra lo que comparar, así que ni se pregunta a
  AWS ni se escribe en Convex.
*/
const resolveCustomer =
  vi.fn<(token: string) => Promise<AwsResolveModule.ResolvedCustomer>>();
vi.mock("~/server/marketplace/aws-resolve-customer", async (importOriginal) => {
  const original = await importOriginal<typeof AwsResolveModule>();
  return { ...original, resolveCustomer };
});

const registerSubscription =
  vi.fn<
    (
      input: ConvexRegisterModule.SubscriptionRegistration,
    ) => Promise<ConvexRegisterModule.RegisteredSubscription>
  >();
vi.mock("~/server/marketplace/convex-register", async (importOriginal) => {
  const original = await importOriginal<typeof ConvexRegisterModule>();
  return { ...original, registerSubscription };
});

const { GET, POST } = await import("~/app/aws/registration/route");

describe("sin AWS_MP_PRODUCT_CODE configurado", () => {
  it("no canjea ni registra nada, y lo dice", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const response = await POST(
      new Request("https://consensussalutis.com/aws/registration", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "x-amzn-marketplace-token": "token-de-aws",
        }),
      }),
    );

    expect(response.status).toBe(503);
    // Ni siquiera se llega a hablar con AWS: no hay nada contra lo que comparar
    // lo que respondiera.
    expect(resolveCustomer).not.toHaveBeenCalled();
    expect(registerSubscription).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("el GET sigue funcionando: el revisor abre esa URL en un navegador", async () => {
    // Una landing sin listing configurado se despliega igual, y la URL tiene que
    // llevar al evaluador público en vez de enseñar un error.
    const response = GET(
      new Request("https://consensussalutis.com/aws/registration"),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://consensussalutis.com/evaluador",
    );
  });
});

/**
 * Criterio de aceptación §6 de la issue #3: la ruta `/aws/registration`.
 *
 * Los cinco primeros puntos se prueban aquí. El sexto —`ResolveCustomer`
 * respondiendo desde la cuenta proveedora en producción— no se puede probar en
 * CI por definición y se cierra en `BinPar/consensus-salutis#91`, con
 * suscripción real.
 *
 * Todo se ejercita contra la ruta REAL, con `Request` de verdad y sin `next/…`
 * de por medio: el POST de AWS es un POST HTTP pelado, y una prueba que llamara
 * a las funciones por dentro no diría nada sobre lo que pasa cuando llega.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

import type * as AwsResolveModule from "~/server/marketplace/aws-resolve-customer";
import type * as ConvexRegisterModule from "~/server/marketplace/convex-register";

const SECRET = "secreto-de-pruebas-con-mas-de-32-caracteres";
const PRODUCT_CODE = "1a2b3c4d5e6f7g8h9i0j";
const ACCOUNT_ID = "123456789012";
const LICENSE_ARN = `arn:aws:license-manager:us-east-1:${ACCOUNT_ID}:license/l-test`;

/*
  El entorno se pone ANTES de importar la ruta: `~/env` lo valida al cargarse, y
  `~/server/marketplace/aws-resolve-customer` lo lee para decidir si asume un rol
  o habla con el stub.
*/
vi.stubEnv("MARKETPLACE_SESSION_SECRET", SECRET);
vi.stubEnv("MARKETPLACE_TOKEN_PEPPER", SECRET);
vi.stubEnv("NEXT_PUBLIC_CONVEX_SITE_URL", "https://ejemplo.convex.site");
vi.stubEnv("AWS_MP_PRODUCT_CODE", PRODUCT_CODE);

/**
 * El canje contra AWS y la escritura en Convex, sustituidos: en CI no hay
 * Marketplace al que preguntar ni deployment donde escribir.
 *
 * Se sustituyen **solo esas dos funciones** y el resto del módulo se conserva
 * —`importOriginal`—, porque los tests distinguen los fallos por el tipo de
 * error que lanzan y unas clases falsas no probarían nada.
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
const { REGISTRATION_COOKIE_NAME, verifyRegistration } =
  await import("~/server/marketplace/registration");
const { ResolveCustomerError } =
  await import("~/server/marketplace/aws-resolve-customer");
const { RegisterSubscriptionError } =
  await import("~/server/marketplace/convex-register");

const URL_REGISTRO = "https://consensussalutis.com/aws/registration";

/**
 * El POST tal y como lo manda AWS: `form-urlencoded`, con el token y el tipo de
 * oferta **como campos del formulario** y no como cabeceras, que es el error
 * clásico al leer la guía por encima.
 *
 * Y, deliberadamente, **sin cookies y sin cabecera `Origin`**. Ver el test de la
 * red contra el CSRF.
 */
function postDeAws(fields: Record<string, string>) {
  return new Request(URL_REGISTRO, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(fields),
  });
}

function cookieDeLaRespuesta(response: Response): string | null {
  const header = response.headers.get("set-cookie");
  if (header === null) return null;
  const match = new RegExp(`${REGISTRATION_COOKIE_NAME}=([^;]+)`).exec(header);
  return match?.[1] ?? null;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  resolveCustomer.mockResolvedValue({
    awsAccountId: ACCOUNT_ID,
    licenseArn: LICENSE_ARN,
    productCode: PRODUCT_CODE,
  });
  registerSubscription.mockResolvedValue({
    subscriptionId: "sub_1",
    isNew: true,
    status: "resolved",
  });
});

describe("GET: la abre el revisor de AWS en un navegador", () => {
  it("devuelve 303 al evaluador y nunca un error", async () => {
    const response = GET(new Request(URL_REGISTRO));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://consensussalutis.com/evaluador",
    );
  });

  it("redirige al host de la petición, no al de producción", async () => {
    // En un preview deployment el host no es el de producción, y el `303` lo
    // sigue el navegador del revisor.
    const response = GET(
      new Request("https://preview-abc.vercel.app/aws/registration"),
    );

    expect(response.headers.get("location")).toBe(
      "https://preview-abc.vercel.app/evaluador",
    );
  });
});

describe("POST con token válido", () => {
  it("canjea, persiste, firma la cookie y redirige", async () => {
    const response = await POST(
      postDeAws({
        "x-amzn-marketplace-token": "token-de-aws",
        "x-amzn-marketplace-offer-type": "free-trial",
      }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://consensussalutis.com/evaluador",
    );

    // El token se canjea YA: caduca en ~1 h.
    expect(resolveCustomer).toHaveBeenCalledWith("token-de-aws");

    // El tipo de oferta viaja a Convex: distingue una prueba gratuita de una
    // suscripción de pago.
    expect(registerSubscription).toHaveBeenCalledWith({
      awsAccountId: ACCOUNT_ID,
      licenseArn: LICENSE_ARN,
      productCode: PRODUCT_CODE,
      offerType: "free-trial",
    });
  });

  it("deja la cookie firmada, con la suscripción y la cuenta dentro", async () => {
    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    const cookie = cookieDeLaRespuesta(response);
    expect(cookie).not.toBeNull();

    const verified = verifyRegistration(cookie, { secret: SECRET });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.registration.subscriptionId).toBe("sub_1");
    expect(verified.registration.awsAccountId).toBe(ACCOUNT_ID);
    expect(verified.registration.licenseArn).toBe(LICENSE_ARN);
  });

  it("la cookie es HttpOnly y SameSite=Lax", async () => {
    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );
    const header = response.headers.get("set-cookie") ?? "";

    expect(header).toContain("HttpOnly");
    // `Lax` y no `Strict`: la cookie se escribe en el `303` que sigue a un POST
    // de otro origen, y `Strict` la mataría justo en el caso que importa.
    expect(header).toContain("SameSite=Lax");
  });

  it("sin tipo de oferta no inventa uno", async () => {
    await POST(postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }));

    // Ausente, y no `undefined` ni `""`: una oferta vacía en la fila haría
    // pasar por prueba gratuita lo que no lo es.
    expect(registerSubscription.mock.calls[0]?.[0]).not.toHaveProperty(
      "offerType",
    );
  });
});

describe("la regla que AWS pone por escrito", () => {
  it("no escribe el awsAccountId en la URL del 303", async () => {
    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    // «Trust only AWS account IDs that are immediately returned from AWS or
    // those that your system has signed.» La URL no es un sitio firmado.
    expect(response.headers.get("location")).not.toContain(ACCOUNT_ID);
  });

  it("en la cookie va dentro del payload firmado, no suelto", async () => {
    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );
    const header = response.headers.get("set-cookie") ?? "";

    /*
      La garantía es de integridad, no de secreto: el payload va en base64url y
      cualquiera que tenga la cookie puede descodificarlo — es su propia cuenta,
      y no hay nada que ocultarle. Lo que no puede es CAMBIARLO sin romper la
      firma, que es lo que pide AWS: «or those that your system has signed».
    */
    expect(header).not.toContain(ACCOUNT_ID);

    const payload = cookieDeLaRespuesta(response)?.split(".")[0] ?? "";
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    expect(JSON.parse(decoded)).toMatchObject({ awsAccountId: ACCOUNT_ID });
  });

  it("no acepta un awsAccountId que venga en el formulario", async () => {
    await POST(
      postDeAws({
        "x-amzn-marketplace-token": "token-de-aws",
        // Un campo inventado por quien mande el POST. Solo cuenta lo que
        // devuelve `ResolveCustomer`.
        awsAccountId: "999999999999",
      }),
    );

    expect(registerSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ awsAccountId: ACCOUNT_ID }),
    );
  });
});

describe("POST sin token: visita directa", () => {
  it("redirige al evaluador público sin fallar", async () => {
    const response = await POST(postDeAws({}));

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe(
      "https://consensussalutis.com/evaluador",
    );
    expect(resolveCustomer).not.toHaveBeenCalled();
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("un token vacío es lo mismo que no traerlo", async () => {
    const response = await POST(postDeAws({ "x-amzn-marketplace-token": "" }));

    expect(response.status).toBe(303);
    expect(resolveCustomer).not.toHaveBeenCalled();
  });

  it("un cuerpo ilegible tampoco da error", async () => {
    const response = await POST(
      new Request(URL_REGISTRO, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "%%%no-es-un-formulario%%%",
      }),
    );

    expect(response.status).toBe(303);
  });
});

describe("productCode que no coincide", () => {
  it("devuelve 400 cuando lo dice AWS", async () => {
    resolveCustomer.mockResolvedValue({
      awsAccountId: ACCOUNT_ID,
      licenseArn: LICENSE_ARN,
      productCode: "el-de-otro-listing",
    });

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    expect(response.status).toBe(400);
    // Y no se persiste nada: aceptarlo sería escribir la suscripción de otro
    // listing en nuestro índice único de cuentas.
    expect(registerSubscription).not.toHaveBeenCalled();
  });

  it("propaga el 400 cuando lo dice Convex", async () => {
    // Los dos entornos son distintos y el que manda es el del backend.
    registerSubscription.mockRejectedValue(
      new RegisterSubscriptionError("product-mismatch", "no casa"),
    );

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    expect(response.status).toBe(400);
  });
});

describe("nada de esto puede romperle la página al comprador", () => {
  it("un token caducado lleva al evaluador, no a un error", async () => {
    // El caso más probable de todos: abrió la pestaña y la dejó ahí. El token
    // dura ~1 h y el revisor puede tardar.
    resolveCustomer.mockRejectedValue(
      new ResolveCustomerError("invalid-token", "ExpiredTokenException"),
    );

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-caducado" }),
    );

    expect(response.status).toBe(303);
    expect(response.headers.get("set-cookie")).toBeNull();
  });

  it("Convex caído lleva al evaluador, no a un error", async () => {
    registerSubscription.mockRejectedValue(
      new RegisterSubscriptionError("unavailable", "503"),
    );

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    expect(response.status).toBe(303);
  });
});

describe("una segunda suscripción de la misma cuenta", () => {
  it("lleva al informe existente cuando ya completó su evaluación", async () => {
    // Una evaluación por cuenta: para repetir hay que pasar por soporte.
    registerSubscription.mockResolvedValue({
      subscriptionId: "sub_1",
      isNew: false,
      status: "provisioned",
      reportSlug: "s".repeat(43),
    });

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    expect(response.headers.get("location")).toBe(
      `https://consensussalutis.com/informe/${"s".repeat(43)}`,
    );
    // Y refresca la cookie: es la misma persona volviendo.
    expect(cookieDeLaRespuesta(response)).not.toBeNull();
  });

  it("lleva al evaluador si dejó la entrevista a medias", async () => {
    // `isNew: false` sin informe es alguien que no terminó. Tiene que poder.
    registerSubscription.mockResolvedValue({
      subscriptionId: "sub_1",
      isNew: false,
      status: "resolved",
    });

    const response = await POST(
      postDeAws({ "x-amzn-marketplace-token": "token-de-aws" }),
    );

    expect(response.headers.get("location")).toBe(
      "https://consensussalutis.com/evaluador",
    );
  });
});

/**
 * La red contra un CSRF global futuro.
 *
 * Este repo no tiene middleware hoy, así que el POST sin autenticar de AWS
 * funciona. El día que alguien añada una protección CSRF global —o un middleware
 * de auth sin excluir `/aws/*`— esta ruta deja de aceptar el POST de AWS, y el
 * fallo aparecería en la revisión del listing y no en local.
 *
 * Por eso el test manda el POST **pelado**: sin cookies, sin `Origin`, sin
 * `Referer` y sin ninguna cabecera que no mande AWS. Si deja de pasar, CI se
 * pone en rojo antes de que nadie envíe nada a AWS.
 */
describe("el POST de AWS llega sin autenticar, y tiene que seguir funcionando", () => {
  it("acepta un POST sin cookies, sin Origin y sin Referer", async () => {
    const request = new Request(URL_REGISTRO, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "x-amzn-marketplace-token": "token-de-aws" }),
    });

    expect(request.headers.get("origin")).toBeNull();
    expect(request.headers.get("referer")).toBeNull();
    expect(request.headers.get("cookie")).toBeNull();

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(cookieDeLaRespuesta(response)).not.toBeNull();
  });

  it("no responde 403 ni 401 a un POST de otro origen", async () => {
    // AWS manda desde su propio origen. Un control de origen como el de
    // `/api/evaluador` aquí sería exactamente el fallo que se quiere evitar.
    const response = await POST(
      new Request(URL_REGISTRO, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "https://aws.amazon.com",
        },
        body: new URLSearchParams({
          "x-amzn-marketplace-token": "token-de-aws",
        }),
      }),
    );

    expect(response.status).toBe(303);
  });
});

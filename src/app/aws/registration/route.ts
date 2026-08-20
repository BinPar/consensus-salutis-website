/**
 * La URL que va en el listing de AWS Marketplace.
 *
 * Recibe el POST de AWS, canjea el token con `ResolveCustomer`, firma la
 * procedencia y redirige al evaluador. **Es el punto exacto donde falló la
 * publicación anterior.**
 *
 * ## Por qué es un `route.ts` y no una página
 *
 * En el App Router un `page.tsx` no puede recibir un POST — solo un `route.ts`.
 * Y AWS manda un POST. Pero la página de fulfillment también tiene que
 * renderizar HTML para el revisor, que la abrirá con un GET. No caben las dos
 * cosas en la misma ruta, así que son dos: esto redirige, y `/evaluador` es la
 * página. Esta ruta no crea el evaluador; lo enchufa. Lo único que añade es la
 * procedencia.
 *
 * ## El POST llega sin autenticar, y eso es correcto
 *
 * AWS no manda cookies ni cabecera `Origin`: es un POST de otro origen, sin
 * sesión previa, y tiene que funcionar. Este repo no tiene middleware —lo que lo
 * hace seguro frente a esto—, pero **cualquier CSRF global que se añada después
 * lo rompe**, y el fallo aparecería en la revisión de AWS y no en local. De ahí
 * el test que hace el POST pelado y falla en CI si deja de pasar.
 *
 * ## Nada de esto puede devolver un error al revisor
 *
 * El evaluador es público: llegar sin token, con un token caducado o con Convex
 * caído lleva al mismo sitio que llegar bien. La única excepción es un
 * `productCode` que no corresponde a este producto, que sí es un 400 — porque
 * aceptarlo significaría registrar la suscripción de otro listing.
 */

import { env } from "~/env";
import {
  resolveCustomer,
  ResolveCustomerError,
} from "~/server/marketplace/aws-resolve-customer";
import {
  registerSubscription,
  RegisterSubscriptionError,
} from "~/server/marketplace/convex-register";
import {
  registrationCookieOptions,
  REGISTRATION_TTL_SECONDS,
  signRegistration,
} from "~/server/marketplace/registration";

// `nodejs` y no edge: el SDK de AWS y la firma de la cookie necesitan el
// `crypto` nativo de Node.
export const runtime = "nodejs";
// Nada de esta ruta se puede prerenderizar: lee un cuerpo y escribe una cookie.
export const dynamic = "force-dynamic";

/** El evaluador público. El destino de todo lo que no sea un informe existente. */
const EVALUADOR = "/evaluador";

/**
 * Campos del formulario que manda AWS.
 *
 * Van en el cuerpo `application/x-www-form-urlencoded` y **no como cabeceras**,
 * que es el error clásico al leer la guía por encima.
 */
const TOKEN_FIELD = "x-amzn-marketplace-token";
const OFFER_TYPE_FIELD = "x-amzn-marketplace-offer-type";

/**
 * El `303` a un destino de este mismo sitio.
 *
 * Absoluto contra el host de la petición y no relativo: la respuesta la sigue el
 * navegador del comprador, y en un preview deployment el host no es el de
 * producción. `303` y no `302` porque convierte el POST en un GET, que es lo que
 * tiene que pasar para que el navegador aterrice en una página.
 */
function seeOther(request: Request, path: string, cookie?: string) {
  const location = new URL(path, request.url).toString();
  const headers = new Headers({
    Location: location,
    "Cache-Control": "no-store",
  });
  if (cookie !== undefined) headers.append("Set-Cookie", cookie);

  return new Response(null, { status: 303, headers });
}

/** Serializa la cookie a mano: aquí no hay `NextResponse` que la ponga. */
function serializeCookie(value: string) {
  const options = registrationCookieOptions();
  const parts = [
    `${options.name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    `SameSite=Lax`,
    "HttpOnly",
  ];
  if (options.secure) parts.push("Secure");

  return parts.join("; ");
}

/**
 * El revisor de AWS abrirá esta URL en el navegador. **No puede dar error.**
 *
 * También cubre a quien tenga el enlace guardado, o a quien llegue por un
 * buscador: en los tres casos el sitio correcto es el evaluador.
 */
export function GET(request: Request) {
  return seeOther(request, EVALUADOR);
}

export async function POST(request: Request) {
  let token: string | null = null;
  let offerType: string | undefined;

  try {
    const form = await request.formData();
    const rawToken = form.get(TOKEN_FIELD);
    const rawOffer = form.get(OFFER_TYPE_FIELD);

    if (typeof rawToken === "string" && rawToken.length > 0) token = rawToken;
    if (typeof rawOffer === "string" && rawOffer.length > 0) {
      offerType = rawOffer;
    }
  } catch {
    // Un cuerpo ilegible es indistinguible de una visita directa, y las dos
    // acaban en el mismo sitio.
    return seeOther(request, EVALUADOR);
  }

  // Sin token: visita directa. El evaluador también es público.
  if (token === null) return seeOther(request, EVALUADOR);

  /*
    El código de producto se comprueba antes de tocar AWS.

    Sin la variable puesta NO se registra nada. Un `undefined === undefined` que
    pasara la comparación aceptaría cualquier producto, que es exactamente el
    fallo que no puede pasar en el flujo que revisa AWS. Convex lo vuelve a
    comprobar contra el suyo, porque son dos entornos distintos y el día que uno
    se despliegue con el código de otro listing manda el del backend.
  */
  if (!env.AWS_MP_PRODUCT_CODE) {
    console.error(
      "AWS_MP_PRODUCT_CODE no está configurado: no se puede registrar ninguna suscripción.",
    );
    return new Response("Registro no disponible", {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Canjear YA: el token caduca —la documentación dice 4 h en un sitio y ~1 h en
  // otro— y guardarlo para luego convierte un plazo dudoso en un fallo
  // intermitente.
  let customer;
  try {
    customer = await resolveCustomer(token);
  } catch (error) {
    console.error("No se pudo canjear el token de registro de AWS", error);

    // Un token caducado es el caso más probable de todos: el comprador abrió la
    // pestaña y la dejó ahí. Mandarlo al evaluador es lo correcto — se
    // identifica igual, y la suscripción se reconcilia por los eventos de AWS.
    if (
      error instanceof ResolveCustomerError &&
      error.reason === "not-configured"
    ) {
      return new Response("Registro no disponible", {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      });
    }

    return seeOther(request, EVALUADOR);
  }

  /*
    El `productCode` que devuelve AWS tiene que ser el de ESTE producto.

    Es la única respuesta de error que ve un POST con token: aceptar un canje de
    otro listing significaría escribir una suscripción que no es nuestra en el
    índice único de cuentas.
  */
  if (customer.productCode !== env.AWS_MP_PRODUCT_CODE) {
    console.error(
      "Canje rechazado: el productCode no corresponde a este producto.",
    );
    return new Response("Suscripción no reconocida", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  let subscription;
  try {
    subscription = await registerSubscription({
      awsAccountId: customer.awsAccountId,
      licenseArn: customer.licenseArn,
      productCode: customer.productCode,
      ...(offerType !== undefined && { offerType }),
    });
  } catch (error) {
    console.error("No se pudo registrar la suscripción de AWS", error);

    // El desacuerdo sobre el producto se propaga: lo dice el backend, que es
    // quien manda si los dos entornos no coinciden.
    if (
      error instanceof RegisterSubscriptionError &&
      error.reason === "product-mismatch"
    ) {
      return new Response("Suscripción no reconocida", {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      });
    }

    /*
      Convex caído no puede ser un error en la cara del comprador: acaba de pagar
      —o de activar la prueba— en AWS, y lo que tiene delante es una página de
      producto rota. Se le manda al evaluador, que funciona sin suscripción, y la
      procedencia se recupera después por los eventos de AWS, que llegan por su
      cuenta a `awsEvents` y quedan huérfanos hasta que se reconcilian.
    */
    return seeOther(request, EVALUADOR);
  }

  /*
    Una evaluación por cuenta: si esta cuenta ya completó la suya, el destino es
    su informe y no la Etapa 0. Para repetir hay que pasar por soporte.

    Sin `reportSlug` el destino sigue siendo el evaluador, también cuando
    `isNew` es `false`: una resuscripción de quien dejó la entrevista a medias
    tiene que poder terminarla.
  */
  const destination = subscription.reportSlug
    ? `/informe/${subscription.reportSlug}`
    : EVALUADOR;

  /*
    El account ID viaja en cookie firmada, NUNCA como campo del formulario ni
    como parámetro de la URL del `303`:

      Trust only AWS account IDs that are immediately returned from AWS or those
      that your system has signed.
  */
  const cookie = signRegistration(
    {
      subscriptionId: subscription.subscriptionId,
      awsAccountId: customer.awsAccountId,
      licenseArn: customer.licenseArn,
    },
    {
      secret: env.MARKETPLACE_SESSION_SECRET,
      ttlSeconds: REGISTRATION_TTL_SECONDS,
    },
  );

  return seeOther(request, destination, serializeCookie(cookie));
}

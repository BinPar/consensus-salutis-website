import { env } from "~/env";
import { redeemSpaceToken } from "~/server/marketplace/convex-space";
import { isSameOrigin } from "~/server/marketplace/same-origin";
import { hashToken } from "~/server/marketplace/one-time-tokens";
import {
  signSpaceSession,
  spaceCookieOptions,
  SPACE_TTL_SECONDS,
} from "~/server/marketplace/space-session";

/**
 * `POST /api/espacio/canje` — el canje del enlace de un solo uso (issue #7 §3).
 *
 * ## Por qué el canje es un POST y no el `GET` del enlace del correo
 *
 * Porque el enlace es de un solo uso y hay software que lo abre sin que nadie lo
 * pulse. Los antivirus de correo corporativos, los previsualizadores de enlaces y
 * el prefetch del navegador hacen `GET` a lo que encuentran en un correo: si el
 * `GET` canjeara, el escáner del propio hospital quemaría el enlace antes de que
 * la dirección de compras llegara a verlo, y el cliente recibiría «este enlace ya
 * no vale» en su primer contacto con nosotros.
 *
 * Así que `GET /espacio/acceso/{token}` **no tiene efectos**: pinta una pantalla
 * con un botón. El canje —lo irreversible— pasa por aquí, por un `POST` que solo
 * sale de pulsar ese botón. Cuesta un clic, y el clic es además la confirmación
 * que hace que la pantalla siguiente no sea una sorpresa.
 *
 * ## Qué se manda a Convex, y qué no
 *
 * El **hash** del token, nunca el token. Se deriva aquí con `hashToken` y
 * `MARKETPLACE_TOKEN_PEPPER` —el mismo HMAC que el monorepo calcula con
 * `hashSpaceToken`, con un test allí que compara las dos implementaciones byte a
 * byte— así que el valor con el que se abre un espacio no viaja en el cuerpo de
 * ninguna petición saliente ni acaba en los logs del deployment.
 *
 * El canje en sí es **una sola operación** al otro lado. Esta ruta no comprueba
 * nada por su cuenta ni «ayuda» leyendo antes: partido en buscar y luego marcar,
 * dos canjes simultáneos del mismo enlace pasarían los dos.
 *
 * ## Las cuatro causas de rechazo son una sola pantalla
 *
 * Caducado, ya usado, inexistente y con email que no casa. Convex las distingue
 * en su log y devuelve `{ ok: false }` para las cuatro. Contárselas a quien canjea
 * le diría a quien prueba enlaces al azar cuál de ellos existió.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ESPACIO = "/espacio";

/**
 * A dónde va un canje que no cuela: al formulario, con una marca en la query para
 * que la página explique por qué está viendo el formulario otra vez.
 *
 * La marca **no dice cuál de las cuatro causas fue** —ni siquiera distingue
 * caducado de inexistente— porque la pantalla es una sola. Y va en la query y no
 * en una cookie porque no tiene que sobrevivir a nada: se lee una vez, al pintar.
 */
const ESPACIO_ENLACE_NO_VALIDO = "/espacio?enlace=no-valido";

/**
 * `303` y no `302`: convierte el `POST` en un `GET`, así que la página del espacio
 * se puede recargar sin volver a canjear —cosa que además fallaría, porque el
 * token ya está gastado—. Es la misma razón por la que `/aws/registration`
 * responde `303`.
 */
function seeOther(request: Request, path: string, cookie?: string): Response {
  const headers = new Headers({
    Location: new URL(path, request.url).toString(),
    "Cache-Control": "no-store",
  });
  if (cookie !== undefined) headers.append("Set-Cookie", cookie);
  return new Response(null, { status: 303, headers });
}

/**
 * Serializa la cookie a mano, como hace la ruta de registro de AWS: aquí se
 * responde con `Response` y no con `NextResponse`, porque lo único que hace falta
 * es una redirección con una cabecera.
 */
function serializeCookie(value: string): string {
  const options = spaceCookieOptions();
  const parts = [
    `${options.name}=${value}`,
    `Path=${options.path}`,
    `Max-Age=${options.maxAge}`,
    "SameSite=Lax",
    "HttpOnly",
  ];
  if (options.secure) parts.push("Secure");
  return parts.join("; ");
}

export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    // `error` y no `warn`: un canje desde un origen ajeno es un intento de
    // fijación de sesión, no el «este enlace ya no vale» de todos los días. Si
    // algún día se filtra por nivel, este es el evento que hay que ver POR ENCIMA
    // del ruido rutinario, no por debajo.
    console.error("[espacio] canje rechazado por origen ajeno");
    return seeOther(request, ESPACIO);
  }

  let token: string | null = null;
  try {
    const form = await request.formData();
    const value = form.get("token");
    if (typeof value === "string" && value.trim().length > 0)
      token = value.trim();
  } catch {
    // Cuerpo ilegible: al formulario de acceso, que es de donde se sale de
    // cualquier callejón de esta ruta.
    return seeOther(request, ESPACIO);
  }

  if (token === null || token.length > 512)
    return seeOther(request, ESPACIO_ENLACE_NO_VALIDO);

  const redeemed = await redeemSpaceToken({
    tokenHash: hashToken(token, env.MARKETPLACE_TOKEN_PEPPER),
  });
  if (!redeemed.ok) return seeOther(request, ESPACIO_ENLACE_NO_VALIDO);

  const cookie = signSpaceSession(
    {
      subscriptionId: redeemed.subscriptionId,
      awsLast4: redeemed.awsLast4,
      status: redeemed.status,
      // De milisegundos a segundos, y este es el ÚNICO sitio donde se convierte:
      // Convex cuenta en ms y el sobre firmado en segundos, junto a `iat` y `exp`.
      statusSinceSeconds: Math.floor(redeemed.statusSinceMs / 1_000),
    },
    { secret: env.MARKETPLACE_SESSION_SECRET, ttlSeconds: SPACE_TTL_SECONDS },
  );

  return seeOther(request, ESPACIO, serializeCookie(cookie));
}

/**
 * Un `GET` aquí no canjea nada: es la ruta a la que un prefetch llegaría si
 * alguien pusiera este `href` en un correo por error. Redirige al formulario.
 */
export function GET(request: Request): Response {
  return seeOther(request, ESPACIO);
}

/**
 * La comprobación de mismo origen de las rutas `POST` de esta landing.
 *
 * **Un solo implementador**, que es la misma regla que este repo ya aplica a la
 * firma de los sobres (`signed-payload.ts`): tres rutas la necesitan y tres copias
 * de una comprobación de seguridad son tres sitios donde relajarla sin que las
 * otras dos se enteren. Se extrajo cuando iban por la segunda copia, que es el
 * momento antes de que apareciera la tercera.
 *
 * ## Qué protege, ruta por ruta
 *
 * No es CSRF en el sentido clásico —ninguna de estas rutas cambia nada en la
 * cuenta de nadie— sino dos cosas concretas:
 *
 * - `/api/espacio/acceso` y `/api/contact` **mandan correo**. Si se pudieran
 *   disparar desde cualquier página, cualquiera podría montar un botón que manda
 *   correo nuestro al buzón de un tercero.
 * - `/api/espacio/canje` **escribe una cookie de sesión**. Sin esto, una página
 *   ajena hace `POST` con un token que controla el atacante, el `303` responde con
 *   `Set-Cookie`, y como la cookie es `SameSite=Lax` el navegador la guarda en una
 *   navegación de nivel superior: la víctima acaba con la sesión del espacio de
 *   OTRO abierta creyendo que es la suya. Fijación de sesión.
 *
 * ## Dónde NO se puede usar
 *
 * En `/aws/registration`. El `POST` de AWS Marketplace llega **sin `Origin`, sin
 * cookies y sin autenticar**, así que esa ruta no puede exigirlo y nunca podrá:
 * está anotado en su cabecera, y cualquier comprobación global que se añada
 * después la rompe.
 */

/**
 * `true` solo si el `Origin` de la petición coincide con el host que la sirvió.
 *
 * Compara **hosts**, no cadenas: comparar la URL completa fallaría por el
 * protocolo, y comparar por prefijo dejaría pasar
 * `consensussalutis.com.sitio-ajeno.example`, que es el error clásico de esta
 * comprobación.
 *
 * La ausencia de cualquiera de las dos cabeceras es un `false`. Una petición sin
 * `Origin` no es de un navegador, y estas rutas solo las llama un navegador desde
 * una página nuestra.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (origin === null || host === null) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    // Un `Origin` que no es una URL no es de un navegador tampoco.
    return false;
  }
}

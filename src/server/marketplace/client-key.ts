import { createHmac } from "node:crypto";

/**
 * La clave con la que el contador de tasa distingue clientes **sin
 * identificarlos**.
 *
 * El límite por IP de la política (`rate-limit.ts`) necesita algo estable por
 * cliente, y lo único estable que trae una petición es su dirección. Pero mandar
 * la IP a Convex significa guardar una tabla de direcciones IP en la base de un
 * sistema que trata datos de instituciones sanitarias, y **para contar no hace
 * falta saber quién es**: basta poder decir «esto es el mismo de antes». Así que
 * lo que viaja es `HMAC-SHA256(ip, pimienta)`, que es exactamente eso.
 *
 * Se reusa `MARKETPLACE_TOKEN_PEPPER` y no se añade otro secreto: es la misma
 * pimienta con la que se derivan los hashes de los enlaces, el mismo propósito
 * —que quien vea la tabla no pueda precomputar el original— y una variable más
 * solo añade un sitio donde equivocarse. La consecuencia hay que asumirla: si la
 * pimienta rota, los contadores en curso se reinician. Es una ventana de una hora
 * y falla abierto, que es el lado bueno por el que falla todo este límite.
 *
 * **Sin IP no hay clave, y sin clave no hay límite por cliente.** Se devuelve
 * cadena vacía y el contador del otro lado la ignora: agrupar a todos los
 * anónimos en un mismo cubo sería peor que no contarlos, porque el primero
 * dejaría fuera a los demás.
 */
export function clientKeyFrom(request: Request, pepper: string): string {
  const ip = clientIpFrom(request);
  if (ip === null) return "";
  // 32 caracteres: la clave se guarda en una fila por cliente y el tope del
  // endpoint es 128. Recortar el HMAC no debilita nada aquí —no protege un
  // secreto, solo distingue— y mantiene la tabla pequeña.
  return createHmac("sha256", pepper)
    .update(ip)
    .digest("base64url")
    .slice(0, 32);
}

/**
 * La dirección del cliente, según las cabeceras que pone la plataforma.
 *
 * `x-forwarded-for` puede traer una lista («cliente, proxy1, proxy2») y el
 * primero es el cliente. **Es falsificable por quien llegue directo**, y eso está
 * asumido: quien quiera saltarse un límite por IP puede hacerlo con un proxy de
 * todas formas, y este límite existe para que un formulario público no se
 * convierta en un cañón contra el buzón de un tercero, no para detener a alguien
 * decidido. Al que de verdad protege el buzón es al otro guardián, el que cuenta
 * enlaces realmente emitidos por email, y ese no depende de ninguna cabecera.
 */
export function clientIpFrom(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded !== null) {
    const first = forwarded.split(",")[0]?.trim();
    if (first !== undefined && first.length > 0) return first;
  }
  const real = request.headers.get("x-real-ip")?.trim();
  return real !== undefined && real.length > 0 ? real : null;
}

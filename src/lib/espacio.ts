import { z } from "zod";

/**
 * El espacio de cliente de AWS Marketplace (issue #7): los cuatro estados dichos
 * como los diría una persona, y la validación del formulario de acceso.
 *
 * Vive en `~/lib` y no en `~/server` porque la copy la pintan componentes de
 * servidor y el esquema lo valida el formulario en el navegador. Nada de aquí
 * habla con Convex.
 */

// ── El formulario de acceso ────────────────────────────────────────────────

/**
 * Una línea: el email institucional. Nada más, a propósito.
 *
 * El esquema NO se comparte con el servidor, igual que en `~/lib/eligibility`:
 * este repo declara zod 3 y el monorepo fija zod 4, así que ningún esquema cruza
 * esa frontera. La comprobación del servidor está escrita a mano en la ruta.
 */
export const accesoSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Escribe tu correo electrónico.")
    .max(254, "El correo es demasiado largo.")
    .email("Escribe un correo electrónico válido."),
});

export type AccesoInput = z.infer<typeof accesoSchema>;

export type AccesoResponse =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: { email?: string } };

/**
 * La respuesta que ve quien rellena el formulario. **Una sola, para email
 * conocido y desconocido.**
 *
 * Es el requisito de §3 y de §7 —«email desconocido y email conocido dan
 * exactamente la misma respuesta»— y la razón es que el formulario es público:
 * si la respuesta cambiara, cualquiera podría preguntarle al formulario si un
 * hospital es cliente nuestro, de uno en uno. La lista de clientes de un
 * producto sanitario no se publica en un formulario.
 *
 * Congelada, y sin ningún campo variable dentro: no hay forma de que una
 * refactorización cuele el email, un contador o un motivo.
 */
export const ACCESO_ENVIADO = Object.freeze({
  titulo: "Comprueba tu correo",
  cuerpo:
    "Si ese correo corresponde a una suscripción de AWS Marketplace, en unos minutos recibirás un enlace de acceso. El enlace caduca en 30 minutos y sirve una sola vez.",
} as const);

/** Copy del enlace que ya no vale. La misma para las cuatro causas. */
export const ENLACE_NO_VALIDO = Object.freeze({
  titulo: "Este enlace ya no vale",
  cuerpo:
    "Los enlaces de acceso caducan a los 30 minutos y sirven una sola vez. Pide uno nuevo con tu correo electrónico y te llega otro al instante.",
} as const);

// ── Los cuatro estados ─────────────────────────────────────────────────────

/**
 * Separación con la cabecera fija, que mide 64 px y flota.
 *
 * Las dos clases van juntas y en un solo sitio porque están **acopladas**: quien
 * abre la página ve o el aviso del enlace o el título, y el que salga primero es el
 * que pone la separación. El segundo usa `SEGUIDO`, que es un hueco normal entre
 * bloques. Con el `pt` escrito a mano en cada componente, cambiar el del aviso
 * movía el título sin que nada lo dijera.
 */
export const PT_BAJO_CABECERA = "pt-28 lg:pt-32";
export const PT_SEGUIDO = "pt-8";

/** Los cuatro estados de una suscripción, tal y como los mueve el monorepo. */
export const ESTADOS = [
  "resolved",
  "licensed",
  "provisioned",
  "ended",
] as const;

export type EstadoSuscripcion = (typeof ESTADOS)[number];

export type EstadoCopy = {
  /** El rótulo corto del bloque de estado. */
  rotulo: string;
  /** La frase, en lenguaje natural. `{fecha}` se sustituye si la hay. */
  titular: string;
  /** El detalle, debajo. */
  cuerpo: string;
  /**
   * Token del semáforo que pinta el estado. **Tres, no los cuatro**: `no` —el
   * rojo— no lo usa ninguno de los cuatro estados y no es un olvido. Ninguno de
   * los cuatro es un error del cliente: `ended` es un hecho administrativo y va en
   * neutro, y los dos intermedios son espera. Declarar el rojo aquí sería dejar la
   * puerta abierta a que alguien se lo ponga a `ended` sin discutirlo.
   */
  color: "ok" | "mid" | "neutro";
  /** Rótulo de la fecha de la última transición. */
  fechaRotulo: string;
};

/**
 * Los cuatro estados, dichos como los diría una persona (§5).
 *
 * El criterio de aceptación es literal: «¿lo entendería una dirección de
 * compras?». Así que no aparece ni `resolved`, ni `licensed`, ni `provisioned`,
 * ni `ended` en ninguna cadena que se pinte — ni el nombre interno, ni una
 * traducción literal del nombre interno. Lo que se dice es qué ha pasado y qué va
 * a pasar.
 *
 * **`ended` no va en rojo.** Va en neutro: una suscripción terminada no es un
 * error del cliente ni una alarma, es un hecho administrativo, y el rojo aquí
 * leería como «algo va mal por tu culpa» delante de la persona que decidió
 * cancelar. Mismo criterio que «a explorar» en la página del informe.
 *
 * `provisioned` es el único que va en verde, porque es el único que trae algo que
 * hacer: el enlace a la plataforma.
 */
export const ESTADO_COPY: Record<EstadoSuscripcion, EstadoCopy> = {
  resolved: {
    rotulo: "Evaluación recibida",
    titular: "Hemos recibido tu evaluación.",
    cuerpo:
      "Un responsable la está revisando y te contacta antes del {fecha}. No tienes que hacer nada mientras: esta página se actualiza sola cuando el estado cambia.",
    color: "mid",
    fechaRotulo: "Recibida el",
  },
  licensed: {
    rotulo: "Suscripción activa",
    titular: "Tu suscripción de AWS Marketplace está activa.",
    cuerpo:
      "Estamos preparando tu acceso a la plataforma. Cuando esté listo lo verás aquí, y te avisamos por correo a esta misma dirección.",
    color: "mid",
    fechaRotulo: "Activa desde el",
  },
  provisioned: {
    rotulo: "Acceso listo",
    titular: "Tu acceso está listo.",
    cuerpo:
      "Ya puedes entrar en la plataforma con tu correo institucional. Este espacio sigue aquí para consultar el estado de la suscripción y el informe.",
    color: "ok",
    fechaRotulo: "Listo desde el",
  },
  ended: {
    rotulo: "Suscripción terminada",
    titular: "Tu suscripción de AWS Marketplace ya no está activa.",
    // No promete el informe: puede no haberlo (una suscripción puede terminar sin
    // que nadie hiciera la entrevista) y el bloque de abajo ya dice si lo hay.
    // Prometerlo aquí y desmentirlo tres centímetros más abajo es peor que
    // callarse.
    cuerpo:
      "Si quieres volver a suscribirte, o revisar qué ha pasado con el acuerdo, escríbenos al canal de soporte y te contesta una persona.",
    color: "neutro",
    fechaRotulo: "Terminada el",
  },
};

/**
 * El enlace a la plataforma solo existe en `provisioned`.
 *
 * Está en una función y no repartido por la vista porque es un criterio de
 * aceptación con su propio test (§7: «el enlace a la plataforma **solo** aparece
 * en `provisioned`»). Antes de esa transición no hay cuenta que loguear, y
 * ofrecer un `/sign-in` que va a rechazar al cliente es peor que no ofrecerlo.
 */
export function muestraAccesoPlataforma(estado: EstadoSuscripcion): boolean {
  return estado === "provisioned";
}

/** Sustituye `{fecha}` en el cuerpo, o quita la frase entera si no hay fecha. */
export function cuerpoConFecha(cuerpo: string, fecha: string | null): string {
  if (fecha !== null) return cuerpo.replace("{fecha}", fecha);
  // Sin fecha, la frase que la contenía se cae completa: «te contacta antes del
  // undefined» es peor que no prometer plazo.
  return cuerpo
    .split(/(?<=\.)\s+/)
    .filter((frase) => !frase.includes("{fecha}"))
    .join(" ")
    .trim();
}

/**
 * Titular del informe cuando el motor no emitió `titular`.
 *
 * Los informes anteriores al rediseño «Oportunidad» no lo traen, y el bloque del
 * informe en el espacio necesita una frase. Son los mismos tres textos que usa
 * `informe-view.tsx` de respaldo: están repetidos porque allí son privados del
 * componente y exportarlos obligaría a un componente de la vista del informe a
 * ser importado por una página que no la pinta.
 */
export const TITULAR_INFORME_POR_NIVEL: Record<
  "listos" | "casi" | "explorar",
  string
> = {
  listos: "Podemos empezar ya",
  casi: "Podemos empezar, con una puerta que abrir",
  explorar: "Hay recorrido, y merece una conversación",
};

/**
 * Canal de soporte de último recurso.
 *
 * El canal de verdad vive en el criterio activo (`canalSoporte`) y, de respaldo,
 * en el deployment de Convex (`MARKETPLACE_SUPPORT_EMAIL`); llega por el endpoint
 * de estado. Esta constante se pinta en los dos casos en los que ese canal no
 * llega, que no son el mismo:
 *
 * 1. El endpoint contesta pero **sin canal** —ni criterio ni variable—, y lo manda
 *    como cadena vacía. Lo sustituye `parseState`.
 * 2. La lectura de estado **falla del todo**. Lo sustituye la página, en su rama
 *    degradada.
 *
 * Existe porque el bloque de soporte visible es un requisito de AWS: una tarjeta
 * de soporte con el hueco vacío no lo cumple, y una página sin tarjeta tampoco.
 * Que el valor esté duplicado aquí es el precio, y es el precio correcto: la
 * alternativa es que el requisito dependa de que una lectura HTTP funcione.
 */
export const SOPORTE_ULTIMO_RECURSO = "consensussalutis@binpar.com";

/** Fecha larga en castellano, la misma forma que usa la página del informe. */
export function fechaLarga(ms: number): string {
  return new Date(ms).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

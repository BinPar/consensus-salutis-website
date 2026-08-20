/**
 * Política de limitación de tasa del módulo marketplace.
 *
 * Emitir un enlace al espacio de cliente se dispara con un email en un
 * formulario público. Sin límite, eso es un vector de spam contra el buzón de un
 * tercero: cualquiera puede pedir cien enlaces al correo de otro. Hay que
 * limitar, y hay que limitar por email y por IP.
 *
 * ## Aquí está la política; el contador va en Convex
 *
 * Este archivo NO implementa el contador, y eso es deliberado. Esta landing no
 * tiene base de datos: el único almacén de la evaluación es Convex, en el
 * monorepo, que es donde están las filas y donde un contador no cuesta ni una
 * variable de entorno nueva. La primera versión de esto hablaba con Upstash por
 * REST, copiando el patrón de `src/app/api/contact/route.ts` — y Upstash no está
 * aprovisionado en ningún entorno del proyecto, así que era una dependencia
 * declarada que no existía y un contador que nunca contó.
 *
 * Lo que queda aquí es lo que no se puede perder al mover el contador de sitio:
 * los topes, por qué son dos y no uno, y la respuesta congelada. Quien implemente
 * la mutación en Convex (`BinPar/consensus-salutis#83`) no tiene que volver a
 * decidir nada de esto.
 *
 * ## Por qué la respuesta no distingue
 *
 * `issueLinkOutcome` existe para que el formulario público responda **igual** con
 * email conocido y desconocido. Si el resultado se filtrara al usuario — «no hay
 * cuenta con ese correo» frente a «te hemos enviado el enlace» — el formulario
 * sería un oráculo de quién es cliente de Consensus Salutis, y la lista de
 * hospitales que han comprado es información comercial que no toca publicar.
 */

/** Cinco intentos por hora y por email, igual que el formulario de contacto. */
export const RATE_LIMIT = 5;
export const RATE_WINDOW_SECONDS = 60 * 60;

/**
 * Tope por IP, más alto que el de email a propósito.
 *
 * Una institución sale a internet por una sola dirección, así que cinco por hora
 * por IP bloquearía al sexto compañero que rellena el formulario — y que lo
 * rellene otra persona del mismo hospital es un caso que el producto da por
 * bueno, no un ataque. El contador que de verdad protege un buzón ajeno es el del
 * email, y ese se queda en cinco: subir el de IP no afloja esa defensa.
 */
export const SHARED_IP_RATE_LIMIT = 20;

/**
 * Lo que el contador de Convex tiene que devolver, y por qué son tres estados y
 * no un booleano.
 *
 * Con un `true`/`false`, quien llama no puede distinguir a alguien que se ha
 * pasado del límite de un contador que no se ha podido consultar, y las dos cosas
 * no se responden igual: donde el efecto es mandar un correo al buzón de un
 * tercero, no poder contar significa no mandarlo; donde el efecto es crear un
 * borrador —la Etapa 0—, denegar tumbaría el alta entera. Quien decide es quien
 * llama, porque es el único que sabe qué cuesta cada error.
 */
export type RateLimitOutcome = "allow" | "over-limit" | "unavailable";

/**
 * La única respuesta que el formulario público de «enviadme el enlace» puede
 * devolver.
 *
 * Es un objeto congelado y sin campos variables a propósito: no hay ninguna
 * forma de que quien llama filtre, sin darse cuenta, si el email existía. Lo que
 * de verdad pasó se registra en el servidor, no se responde.
 */
export const issueLinkOutcome = Object.freeze({
  ok: true as const,
  message:
    "Si ese correo corresponde a una suscripción activa, recibirás un enlace de acceso en unos minutos.",
});

export type IssueLinkOutcome = typeof issueLinkOutcome;

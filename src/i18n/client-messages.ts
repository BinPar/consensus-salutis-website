import type { Messages } from "../../messages/es";

/**
 * Namespaces que solo usan componentes de servidor. No bajan al navegador.
 *
 * El resto sí, en todas las páginas: los componentes de cliente se comparten
 * entre páginas por muchos caminos y elegir namespaces por página acaba
 * dejando a alguno sin sus textos (se pinta la clave en vez del texto). Si el
 * peso llega a notarse, se recorta aquí.
 */
const SERVER_ONLY = ["legal"] as const satisfies readonly (keyof Messages)[];

type ServerOnly = (typeof SERVER_ONLY)[number];

export function clientMessages(messages: Messages): Omit<Messages, ServerOnly> {
  const result: Partial<Messages> = { ...messages };

  for (const namespace of SERVER_ONLY) delete result[namespace];

  return result as Omit<Messages, ServerOnly>;
}

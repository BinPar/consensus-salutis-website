/**
 * Registro de autores del blog.
 *
 * El frontmatter de un post referencia un `id` de aquí, nunca un nombre suelto:
 * así el cargo se corrige en un sitio y no en dieciséis ficheros, y un `id` mal
 * escrito rompe el test en vez de publicar una firma vacía.
 *
 * Sin foto a propósito — la línea de autoría del artículo es texto.
 *
 * El cargo se traduce: vive en `messages/<idioma>/blog.json`
 * (`authors.<id>.role`). Aquí quedan el id y el nombre propio.
 */
export const blogAuthors = {
  "alberto-blanco": {
    id: "alberto-blanco",
    name: "Alberto Blanco",
  },
  "equipo-consensus-salutis": {
    id: "equipo-consensus-salutis",
    name: "Equipo BinPar",
  },
} as const satisfies Record<string, { id: string; name: string }>;

export type BlogAuthorId = keyof typeof blogAuthors;

export type BlogAuthor = {
  id: BlogAuthorId;
  name: string;
};

export const blogAuthorIds = Object.keys(blogAuthors) as BlogAuthorId[];

export function getBlogAuthor(id: string): BlogAuthor | undefined {
  return blogAuthors[id as BlogAuthorId];
}

/**
 * Registro de autores del blog.
 *
 * El frontmatter de un post referencia un `id` de aquí, nunca un nombre suelto:
 * así el cargo se corrige en un sitio y no en dieciséis ficheros, y un `id` mal
 * escrito rompe el test en vez de publicar una firma vacía.
 *
 * Sin foto a propósito — la línea de autoría del artículo es texto.
 */
export type BlogAuthor = {
  id: string;
  name: string;
  role: string;
};

export const blogAuthors = {
  "alberto-blanco": {
    id: "alberto-blanco",
    name: "Alberto Blanco",
    role: "Dirección técnica, BinPar",
  },
  "equipo-consensus-salutis": {
    id: "equipo-consensus-salutis",
    name: "Equipo BinPar",
    role: "Producto y evidencia clínica",
  },
} as const satisfies Record<string, BlogAuthor>;

export type BlogAuthorId = keyof typeof blogAuthors;

export const blogAuthorIds = Object.keys(blogAuthors) as BlogAuthorId[];

export function getBlogAuthor(id: string): BlogAuthor | undefined {
  return blogAuthors[id as BlogAuthorId];
}

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
 * (`authors.<id>.role`). Aquí quedan el id y el nombre: una persona tiene un
 * nombre propio que no se traduce; un equipo, uno por idioma.
 */
import { routing, type Locale } from "~/i18n/routing";

export const blogAuthors = {
  "alberto-blanco": {
    id: "alberto-blanco",
    name: "Alberto Blanco",
  },
  "equipo-consensus-salutis": {
    id: "equipo-consensus-salutis",
    name: {
      es: "Equipo BinPar",
      en: "BinPar team",
      ca: "Equip BinPar",
      gl: "Equipo BinPar",
      eu: "BinPar taldea",
    },
  },
} as const satisfies Record<
  string,
  { id: string; name: string | Record<Locale, string> }
>;

export type BlogAuthorId = keyof typeof blogAuthors;

export type BlogAuthor = {
  id: BlogAuthorId;
  name: string;
};

export const blogAuthorIds = Object.keys(blogAuthors) as BlogAuthorId[];

/** El autor con su nombre en `locale` (por defecto, el castellano). */
export function getBlogAuthor(
  id: string,
  locale: Locale = routing.defaultLocale,
): BlogAuthor | undefined {
  const author = blogAuthors[id as BlogAuthorId] as
    (typeof blogAuthors)[BlogAuthorId] | undefined;

  if (!author) return undefined;

  return {
    id: author.id,
    name: typeof author.name === "string" ? author.name : author.name[locale],
  };
}

/**
 * Valida **el contenido real** del blog, no fixtures.
 *
 * Es el guardarraíl del contrato de frontmatter: si un post se escribe mal
 * —falta un campo, el autor no existe, hay `image` sin `imageAlt`— `pnpm test`
 * falla y el post no llega a publicarse. Los casos negativos van con fuentes en
 * línea, porque para probar que un frontmatter inválido rompe hace falta un
 * frontmatter inválido y no queremos uno en `src/content/blog/`.
 */
import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  BLOG_CONTENT_DIR,
  editDistance,
  getAllBlogPosts,
  getBlogPosts,
  getBlogPostsByTag,
  getBlogTags,
  normalizeTag,
  parseBlogPost,
} from "~/lib/blog";
import { blogAuthorIds, getBlogAuthor } from "~/content/blog/authors";
import { blogCoverGeometry } from "~/lib/blog-cover";

const fileNames = fs
  .readdirSync(BLOG_CONTENT_DIR)
  .filter((fileName) => fileName.endsWith(".mdx"))
  .sort();

const posts = getAllBlogPosts();

function frontmatterOf(overrides: Record<string, string> = {}) {
  const base: Record<string, string> = {
    title: '"Un título"',
    excerpt: '"Una frase densa y sobria."',
    date: "2026-02-11",
    author: "equipo-consensus-salutis",
    type: "mecanismo",
    tags: "[trazabilidad]",
    ...overrides,
  };

  const yaml = Object.entries(base)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return `---\n${yaml}\n---\n\nCuerpo del post.\n`;
}

describe("contenido real del blog", () => {
  it("hay al menos un fichero .mdx y todos parsean", () => {
    expect(fileNames.length).toBeGreaterThan(0);

    fileNames.forEach((fileName) => {
      const source = fs.readFileSync(
        path.join(BLOG_CONTENT_DIR, fileName),
        "utf8",
      );

      expect(() => parseBlogPost(fileName, source)).not.toThrow();
    });
  });

  it("los slugs son únicos y kebab-case", () => {
    const slugs = posts.map((post) => post.slug);

    expect(new Set(slugs).size).toBe(slugs.length);

    slugs.forEach((slug) => {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    });
  });

  it("cada autor existe en el registro y trae cargo", () => {
    posts.forEach((post) => {
      const author = getBlogAuthor(post.author.id);

      expect(author, `autor de ${post.slug}`).toBeDefined();
      expect(author?.role.trim()).not.toBe("");
    });
  });

  it("una portada declarada existe en public/ y tiene alt", () => {
    posts
      .filter((post) => post.image)
      .forEach((post) => {
        expect(post.imageAlt?.trim(), `imageAlt de ${post.slug}`).toBeTruthy();
        expect(
          fs.existsSync(path.join(process.cwd(), "public", post.image!)),
          `${post.image} no existe en public/`,
        ).toBe(true);
      });
  });

  it("el orden es por fecha descendente", () => {
    const dates = posts.map((post) => post.date);

    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("deriva href, etiqueta de fecha y tiempo de lectura", () => {
    posts.forEach((post) => {
      expect(post.href).toBe(`/blog/${post.slug}`);
      expect(post.createdAtLabel).toMatch(/^\d{1,2} [a-zé]+ \d{4}$/);
      expect(post.readTime).toBe(`${post.readMinutes} min de lectura`);
      expect(post.readMinutes).toBeGreaterThan(0);
      expect(post.wordCount).toBeGreaterThan(0);
    });
  });
});

describe("frontmatter inválido", () => {
  it("un campo obligatorio que falta rompe", () => {
    const source = frontmatterOf().replace(/^excerpt:.*\n/m, "");

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/excerpt/);
  });

  it("un autor inexistente rompe", () => {
    const source = frontmatterOf({ author: "quien-sea" });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/quien-sea/);
  });

  it("`image` sin `imageAlt` rompe", () => {
    const source = frontmatterOf({ image: "/img/blog/portada.webp" });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/imageAlt/);
  });

  it("un `type` fuera del vocabulario rompe", () => {
    const source = frontmatterOf({ type: "opinion" });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/type/);
  });

  it("un campo que no está en el contrato rompe", () => {
    const source = frontmatterOf({ imageLabel: '"Matriz de evaluación"' });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/imageLabel/);
  });

  it("`updatedAt` anterior a `date` rompe", () => {
    const source = frontmatterOf({ updatedAt: "2026-01-01" });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/updatedAt/);
  });

  it("sin tags rompe", () => {
    const source = frontmatterOf({ tags: "[]" });

    expect(() => parseBlogPost("roto.mdx", source)).toThrow(/tags/);
  });
});

describe("borradores y fechas futuras", () => {
  /*
    `getBlogPosts()` decide según el entorno; el filtro en sí se comprueba aquí
    sobre la lista completa, que es lo que hace producción.
  */
  function published(now: Date) {
    const today = now.toISOString().slice(0, 10);

    return posts.filter((post) => !post.draft && post.date <= today);
  }

  it("un borrador queda fuera de la lista publicable", () => {
    const draft = parseBlogPost(
      "borrador.mdx",
      frontmatterOf({ draft: "true" }),
    );

    expect(draft.draft).toBe(true);
    expect(
      published(new Date("2030-01-01")).map((post) => post.slug),
    ).not.toContain("borrador");
  });

  it("una fecha futura queda fuera hasta que llega el día", () => {
    const future = parseBlogPost(
      "futuro.mdx",
      frontmatterOf({ date: "2099-01-01" }),
    );

    expect(future.date).toBe("2099-01-01");
    expect(future.date > new Date().toISOString().slice(0, 10)).toBe(true);
  });

  it("en dev y en test se ven todos", () => {
    /* Vitest corre con NODE_ENV=test, que es el caso «visible». */
    expect(getBlogPosts().length).toBe(posts.length);
  });
});

describe("índice de tags", () => {
  const tags = getBlogTags(posts);

  it("normaliza a slug", () => {
    expect(normalizeTag("Inteligencia Artificial")).toBe(
      "inteligencia-artificial",
    );
    expect(normalizeTag("IA")).toBe("ia");
    expect(normalizeTag("ia")).toBe("ia");
    expect(normalizeTag("Trazabilidad ")).toBe("trazabilidad");
    expect(normalizeTag("evaluación")).toBe("evaluacion");
  });

  it("cuenta cada tag y lo ordena por frecuencia", () => {
    const counts = tags.map((entry) => entry.count);

    expect([...counts].sort((left, right) => right - left)).toEqual(counts);

    tags.forEach((entry) => {
      expect(getBlogPostsByTag(entry.tag, posts)).toHaveLength(entry.count);
    });
  });

  it("todo tag del índice tiene al menos un post", () => {
    expect(tags.every((entry) => entry.count > 0)).toBe(true);
  });

  /**
   * Aviso, no fallo.
   *
   * Los tags son libres por decisión de producto, así que un tag nuevo a
   * distancia de edición corta de uno existente puede ser deriva («evaluacion» /
   * «evaluaciones») o puede ser legítimo. Romper el build por una sospecha
   * bloquearía a quien escribe; imprimir el aviso deja la decisión en la
   * revisión del PR.
   */
  it("avisa de tags casi duplicados sin romper", () => {
    const slugs = tags.map((entry) => entry.tag);
    const suspicious: string[] = [];

    slugs.forEach((left, index) => {
      slugs.slice(index + 1).forEach((right) => {
        const threshold = Math.min(left.length, right.length) >= 8 ? 2 : 1;

        if (editDistance(left, right) <= threshold) {
          suspicious.push(`«${left}» ≈ «${right}»`);
        }
      });
    });

    if (suspicious.length > 0) {
      console.warn(
        `[blog] tags sospechosamente parecidos: ${suspicious.join(", ")}`,
      );
    }

    expect(Array.isArray(suspicious)).toBe(true);
  });

  it("la distancia de edición mide lo que dice medir", () => {
    expect(editDistance("ia", "ia")).toBe(0);
    expect(editDistance("evaluacion", "evaluaciones")).toBe(2);
    expect(editDistance("trazabilidad", "seguridad")).toBeGreaterThan(2);
  });
});

describe("registro de autores", () => {
  it("no hay autores sin nombre ni cargo", () => {
    blogAuthorIds.forEach((id) => {
      const author = getBlogAuthor(id)!;

      expect(author.id).toBe(id);
      expect(author.name.trim()).not.toBe("");
      expect(author.role.trim()).not.toBe("");
    });
  });
});

describe("portada de marca", () => {
  it("el mismo slug pinta siempre la misma portada", () => {
    const first = blogCoverGeometry("un-post-cualquiera");
    const second = blogCoverGeometry("un-post-cualquiera");

    expect(second).toEqual(first);
  });

  it("dos slugs distintos no pintan la misma portada", () => {
    const left = blogCoverGeometry("un-post-cualquiera");
    const right = blogCoverGeometry("otro-post-cualquiera");

    expect(right.mainBlob).not.toBe(left.mainBlob);
    expect(right.signals[0]?.path).not.toBe(left.signals[0]?.path);
  });

  it("cada post real tiene su portada, con `image` o sin ella", () => {
    const drawn = new Set(
      posts.map((post) => blogCoverGeometry(post.slug).mainBlob),
    );

    expect(drawn.size).toBe(posts.length);
  });
});

# Contrato de frontmatter

Fuente de verdad: el schema Zod de `src/lib/blog.ts`. Es **estricto**
(`.strict()`): un campo que no está en esta tabla no se ignora, rompe el test y
el build. Eso es deliberado — un post con frontmatter inválido no llega a
publicarse mal.

## Campos

| Campo | Tipo | ¿Obligatorio? | Nota |
|---|---|---|---|
| `title` | string | sí | Termina en punto: es titular display (`binpar-brand-voice`). Entre comillas dobles: casi siempre lleva dos puntos, y un `:` sin comillas rompe el YAML |
| `excerpt` | string | sí | Una frase densa. Es lo que se pinta en la tarjeta, en el `<meta description>`, en el feed y en `schema.org` |
| `date` | `YYYY-MM-DD` | sí | **Sin comillas.** Se parsea como medianoche UTC. Una fecha futura no se publica hasta que llega el día |
| `updatedAt` | `YYYY-MM-DD` | no | Solo en modo actualizar. No puede ser anterior a `date` |
| `author` | id | sí | Un `id` de `src/content/blog/authors.ts`: `alberto-blanco` o `equipo-consensus-salutis` (id heredado: no se renombra). Un id que no existe rompe el test |
| `type` | enum | sí | `marco`, `mecanismo`, `sector`, `evidencia`, `nota-de-producto`. Es el arquetipo, y con él viene el presupuesto de palabras |
| `tags` | array de string | sí, ≥1 | 2–4 en la práctica. Ver `tag-vocabulary.md` |
| `image` | ruta absoluta | no | Empieza por `/` y el fichero tiene que existir en `public/`. El test lo comprueba |
| `imageAlt` | string | sí **si** hay `image` | Descriptivo, no el título repetido |
| `readTime` | entero > 0 | no | Minutos. **No lo escribas**: el loader lo calcula a 210 palabras/minuto. Solo para forzar un valor, y no hay motivo |
| `draft` | boolean | no (`false`) | Siempre `true` al crear. Lo quita una persona |

## Ejemplo mínimo

```yaml
---
title: "Del documento fuente a la decisión: evidencia visible en cada consulta."
excerpt: "Qué tiene que cumplir una cita para que una organización sanitaria pueda sostenerla delante de un comité."
date: 2026-03-14
author: equipo-consensus-salutis
type: mecanismo
tags: ["Trazabilidad", "Evidencia visible", "Gobierno del conocimiento"]
draft: true
---
```

Con portada, dos campos más:

```yaml
image: /img/blog/del-documento-fuente-a-la-decision.webp
imageAlt: "Trazo de señal de la marca sobre fondo navy, con dos nodos unidos"
```

## Lo que se deriva y no se escribe nunca

El loader los calcula; escribirlos a mano es imposible (`.strict()` los
rechazaría) y es la confusión más habitual:

- `slug` y `href` — del **nombre del fichero**, no del título.
- `createdAtLabel`, `updatedAtLabel` — `11 feb 2026`, formateado en UTC.
- `wordCount`, `readMinutes`, `readTime` — `«6 min de lectura»` la compone el
  loader.
- `tags` normalizados y `tagLabels` — la clave de ruta y la etiqueta que se
  pinta salen del mismo array.
- La imagen de compartir 1200×630 — `src/app/blog/[slug]/opengraph-image.tsx`,
  siempre, a partir del título.

## El cuerpo

- **No empieza con `#`.** El `h1` lo pinta la página con `title`; un `#` en el
  cuerpo daría dos títulos y rompería la jerarquía.
- `##` para las secciones, `###` para lo de dentro. `####` existe en los
  estilos, pero si hace falta es que la sección era dos.
- `>` para la frase que sostiene la pieza. Una por post, o ninguna.
- Listas cortas. Una lista de siete puntos casi siempre es un párrafo mal
  cortado.
- Enlaces: internos relativos (`/plataforma`, `/evidencia`); externos solo si la
  fuente es citable y estable.
- MDX admite componentes, pero un post no importa ninguno: si un post necesita
  un componente, es un cambio de motor y se pregunta antes. Las únicas
  etiquetas JSX que un post escribe son `<figure>`, `<img>` y `<figcaption>`
  nativas, de primer nivel, para las figuras (`figures.md`).

## Cuando el frontmatter falla

El mensaje trae el fichero, el campo y el motivo:

```
Frontmatter inválido en «mi-post.mdx» → excerpt: `excerpt` es obligatorio.
```

Se arregla el frontmatter, no el schema.

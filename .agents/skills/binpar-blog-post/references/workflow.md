# Verificación, y qué no hace la skill

## Los comandos, en orden

```bash
pnpm lint && pnpm typecheck && pnpm test
```

```bash
pnpm build
```

`pnpm check` es el atajo de los tres primeros. Se ejecutan **después** de
escribir el `.mdx` y de resolver la portada, no antes.

Qué cubre cada uno para un post:

| Comando | Qué fija |
|---|---|
| `pnpm lint` | Nada del `.mdx` en sí; se ejecuta porque la verificación es la del repo, no una a medida |
| `pnpm typecheck` | Igual: el post no lleva tipos, pero el repo se verifica entero |
| `pnpm test` | **Lo que importa.** `src/lib/__tests__/blog.test.ts` valida el contenido real: frontmatter, autor existente, `image` que existe en `public/` con su `imageAlt`, figuras del cuerpo (`<img>` o `![]()`) que existen en `public/` con `alt`, slug único y kebab-case, orden por fecha, y el aviso de tags parecidos |
| `pnpm build` | Que el MDX compila y que la ruta se genera. El import del cuerpo es dinámico por plantilla, así que un MDX roto no se ve hasta aquí |

Fallos y qué hacer:

- `Frontmatter inválido en «…» → campo: motivo` → arregla el frontmatter. No
  toques el schema.
- `Autor «…» no está en el registro` → usa un `id` de
  `src/content/blog/authors.ts`. Añadir un autor es un cambio de motor: se
  pregunta.
- `/img/blog/….webp no existe en public/` → o generas la imagen, o quitas
  `image` e `imageAlt` y entra la portada de marca.
- `[blog] tags sospechosamente parecidos` → aviso, no fallo. Unifica o
  justifica.
- `/img/blog/<slug>/….svg (<fichero>) no existe en public/` o `alt de …` → la
  figura apunta mal o le falta `alt`. Se arregla el `.mdx` o se crea el fichero;
  no se quita el test.

## Cuenta de palabras contra el presupuesto

La misma cuenta que hace el loader —descuenta frontmatter, código, imágenes y
marcas de sintaxis— para comprobar el presupuesto del arquetipo:

```bash
node -e 'const m=require("gray-matter");const{content}=m(require("node:fs").readFileSync(process.argv[1],"utf8"));console.log(content.replace(/```[\s\S]*?```/g," ").replace(/`[^`]*`/g," ").replace(/!\[[^\]]*\]\([^)]*\)/g," ").replace(/\[([^\]]*)\]\([^)]*\)/g,"$1").replace(/<[^>]+>/g," ").replace(/[#>*_~|-]+/g," ").split(/\s+/).filter(Boolean).length)' src/content/blog/<slug>.mdx
```

Quedarse corto es peor que pasarse: significa que el ángulo no daba para el
arquetipo elegido.

## Ver una figura sin levantar el servidor

```bash
rsvg-convert -w 1200 public/img/blog/<slug>/<nombre>.svg -o "$SCRATCH/<nombre>.png"
```

Y mirar el PNG antes de enlazarla. Detalle en `figures.md`.

## Verlo en el navegador

```bash
pnpm dev
```

`/blog` y `/blog/<slug>`. Los borradores y las fechas futuras **sí** se ven en
dev y en los preview de rama, y **no** en producción: es lo que permite escribir
el post, revisarlo en el deployment de la rama y publicarlo quitando `draft` al
mergear, sin tocar el fichero.

## Autochequeo del modo auditar

Fragmento sembrado. **No lo copies a `src/content/blog/`** — vive aquí para
comprobar que la auditoría detecta lo que tiene que detectar:

```mdx
---
title: "El sistema que entiende la consulta clínica"
excerpt: "Cómo la plataforma interpreta la pregunta y decide qué guía aplicar."
date: 2026-03-14
author: equipo-consensus-salutis
type: mecanismo
tags: ["RAG", "Trazabilidad"]
draft: true
---

BinPar entiende la pregunta del clínico y decide qué protocolo
aplicar. La trazabilidad se sostiene sobre anchors con CRC-8 sobre un contador
global en Convex, de forma que la cita sigue apuntando al párrafo correcto
después de una actualización.

Los centros que la usan reducen los errores de prescripción un 30%.

¿Quieres verlo en tu servicio? Pide una demo.
```

Una auditoría correcta devuelve **al menos** estos hallazgos:

| Sev | Regla | Fragmento |
|---|---|---|
| alta | Personificación de la IA | «entiende la pregunta del clínico y decide qué protocolo aplicar» |
| alta | Personificación de la IA | «interpreta la pregunta y decide qué guía aplicar» (en `excerpt`) |
| alta | Filtración por encima del nivel funcional | «anchors con CRC-8 sobre un contador global en Convex» |
| alta | Eficacia clínica sin fuente | «reducen los errores de prescripción un 30%» |
| media | Segunda persona y CTA en arquetipo `mecanismo` | «¿Quieres verlo en tu servicio? Pide una demo» |
| media | Tag fuera de la frontera de divulgación | `"RAG"` |
| baja | Falta el punto final en `title` (titular display) | «El sistema que entiende la consulta clínica» |

Y con reescritura por fragmento. Por ejemplo, para el tercero: «una cita que
sigue apuntando al párrafo correcto después de que el documento se actualice, y
que puede verificarse».

Si una auditoría de este fragmento devuelve menos de los cuatro hallazgos de
severidad alta, la auditoría está mal hecha, no el fragmento.

## Lo que la skill no hace

- **Ni `git commit` ni `git push` ni `git add`.** En ningún modo, ni al final de
  un modo crear que ha pasado todas las verificaciones. Se entrega el árbol de
  trabajo sucio y se dice qué ficheros son.
- **No quita `draft: true`.** Publicar es una decisión humana.
- **No renombra ni borra un `.mdx` existente.** El nombre es la URL.
- **No despliega.** Ni `vercel`, ni `vercel --prod`, ni promoción de nada.
- **No toca el motor**: `src/lib/blog.ts`, `src/lib/blog-cover.ts`,
  `src/content/blog/authors.ts`, `src/app/blog/**`. Si el post necesita un campo
  nuevo, un autor nuevo o un componente, se para y lo pregunta.
- **No edita ficheros en modo auditar**, salvo petición explícita de aplicar los
  hallazgos.
- **No inventa cifras ni fuentes.** Si una afirmación necesita un estudio y no
  hay estudio, la afirmación se cae. No se suaviza: se cae.

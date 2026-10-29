---
name: binpar-blog-post
description: >
  Crear, actualizar y auditar posts del blog MDX de BinPar
  (`consensus-salutis-website`). Enseña el contrato de frontmatter de
  `src/lib/blog.ts`, la puerta de aprobación del ángulo antes de escribir, la
  cadena de portada y los comandos de verificación del repositorio. Úsala cuando
  se pida escribir, redactar, ampliar, actualizar, revisar o auditar un artículo
  o post del blog de BinPar, o cuando se vaya a tocar cualquier
  `.mdx` de `src/content/blog/`. Write, update or audit a BinPar blog post.
---

# BinPar · Blog post

Un post es **un fichero** `.mdx` en `src/content/blog/`. No hay índice que
tocar, ni registro que actualizar, ni ruta que añadir: el loader
(`src/lib/blog.ts`) descubre el fichero, valida su frontmatter y deriva slug,
`href`, etiquetas de fecha y tiempo de lectura. Publicar es crear el fichero y
quitarle `draft`.

Esta skill cubre lo que es de **este repositorio**: rutas, contrato de
frontmatter, figuras del cuerpo, cadena de portada y comandos. Cómo suena el texto no vive aquí —
vive en `binpar-brand-voice`, porque esa voz se reutiliza en
propuestas, documentos y presentaciones.

## Lo que esta skill nunca hace

- **No hace `git commit` ni `git push`.** En ningún modo. La revisión y la
  publicación son humanas.
- **No quita `draft: true`.** Eso lo hace una persona después de leer el post.
- **No renombra un `.mdx` publicado.** El nombre del fichero *es* la URL
  indexada.
- No toca `src/lib/blog.ts`, `src/content/blog/authors.ts` ni los componentes
  del blog. Si el post necesita un campo que el contrato no tiene, o un autor
  que no existe, se para y lo pregunta: es un cambio de motor, no de contenido.

## Antes de nada: las dos dependencias de voz

1. **`binpar-brand-voice`** — la voz de marca. Cárgala **entera**
   antes de escribir o auditar una sola frase: narrador impersonal, prohibición
   de personificar la IA, léxico acuñado, líneas rojas clínicas, frontera de
   divulgación funcional y presupuesto por arquetipo.
   Preflight: mira si la skill está disponible en la sesión. Si **no** lo está,
   dilo en la primera respuesta —«escribo sin la skill de voz, con el
   subconjunto mínimo»— y aplica la tabla de más abajo. No pares por ello, pero
   no finjas que la tienes.
2. **`unslop`** — encima de todo lo demás, siempre. El relleno de LLM es el modo
   de fallo más frecuente de este blog: párrafos que reformulan el anterior,
   frases que matizan sin añadir, listas de tres donde había una idea.

### Subconjunto mínimo de voz, si falta la skill

Fuente de verdad: `binpar-brand-voice`. Esto es solo el suelo
—lo enumerable— para que crear y auditar sigan funcionando sin ella.

| Regla | Severidad |
|---|---|
| **Nada de personificar la IA.** Vetados `entiende`, `sabe`, `interpreta`, `juzga`, `decide`, `opina`, `diagnostica`, `aprende de ti`. Permitidos `recupera`, `referencia`, `sintetiza`, `prioriza`, `señala`, `devuelve`, `contrasta` | alta |
| **Ni diagnóstico ni indicación terapéutica.** El sistema no diagnostica, no prescribe, no recomienda tratamiento a un paciente concreto | alta |
| **Ninguna afirmación de eficacia clínica sin fuente citable.** Ni «mejora los resultados» ni «reduce errores un X%» | alta |
| **Ni sello regulatorio ni producto sanitario.** Nunca insinuar marcado CE, MDR, certificación sanitaria o conformidad con el AI Act | alta |
| **Frontera de divulgación funcional.** Vetados en texto público: Convex, AI SDK, CRC, checksum, anchor, delta, VFS, nombres de tabla, slots de modelo, proveedores y versiones de modelo | alta |
| **Ni comparativas con competidores ni con modelos por nombre.** El posicionamiento se hace por contraste de enfoque | media |
| **Narrador impersonal.** Sin «tú» ni «usted»; «los equipos clínicos», «las organizaciones sanitarias». El producto aparece como máximo un par de veces en el cuerpo, nunca en la apertura ni cerrando como venta. Excepción: arquetipo `nota-de-producto` | media |
| **Léxico acuñado**, reutilizado en vez de sinónimos improvisados: consenso verificable, evidencia visible, gobierno del conocimiento clínico, preguntas de control, corpus vivo, umbral de revisión. Vetados: copiloto, asistente virtual, agente, cerebro clínico | media |
| **`title` es titular display: termina en punto**, como en el manual de identidad. Los `##` y `###` van sin punto. Nunca en mayúsculas ni con exclamación | baja |
| **Sin emojis.** Em dash con moderación; paréntesis para los apartes | baja |
| **Cierre reflexivo, sin llamada a la acción.** La conversión la hacen las páginas de producto. Solo `nota-de-producto` admite CTA | media |

Presupuesto de palabras por arquetipo, que es también el `type` del
frontmatter:

| `type` | Palabras |
|---|---|
| `marco` | 1.400–1.800 |
| `mecanismo` | 1.200–1.600 |
| `sector` | 1.000–1.400 |
| `evidencia` | 1.200–1.600 |
| `nota-de-producto` | 500–800 |

## Los tres modos

| Lo que se pide | Modo |
|---|---|
| «Escribe un post sobre X» | **crear** |
| «Actualiza / amplía / corrige el post Y» | **actualizar** |
| «Revisa el blog», «¿esto está en voz?» | **auditar** |

## Modo crear

El flujo tiene **una puerta de aprobación**, a propósito: el ángulo equivocado
cuesta un post entero de reescritura, y eso no se arregla editando frases.

### 1. Propuesta

Antes de escribir **nada**, propón en la respuesta —no en un fichero—:

- **Ángulo**: la tesis en una frase, y qué decisión ayuda a tomar al lector.
- **Arquetipo** (`type`) y por qué ese y no otro.
- **Tags**: 2–4, del vocabulario de `references/tag-vocabulary.md`.
- **Presupuesto**: el rango del arquetipo, repartido por sección.
- **Esqueleto**: los `##` con una línea cada uno.
- **Figuras**: ninguna, o cuáles y qué muestra cada una (SVG por defecto;
  imagen generada solo si no es un esquema). Criterio y reglas en
  `references/figures.md`. La mayoría de los posts van sin figuras.
- **Qué queda fuera**, si el tema tienta a cruzar una línea roja o la frontera
  de divulgación.

### 2. Esperar el OK

**Párate aquí.** No crees el `.mdx`, no generes la portada, no ejecutes nada.
Si el ángulo no se aprueba, se propone otro; no se escribe «mientras tanto».

### 3. Escribir el `.mdx`

`src/content/blog/<slug>.mdx`, con `draft: true` siempre. Slug kebab-case en
castellano sin artículos sueltos, derivado del título y estable.
Contrato de campos: `references/frontmatter-contract.md`.

El cuerpo empieza en el primer párrafo: **sin `#`**, que el `h1` lo pinta la
página con `title`. Jerarquía `##` / `###`. Un `>` para la idea que sostiene la
pieza, no para decorar.

### 4. Dibujar las figuras aprobadas

Solo las de la propuesta. SVG a mano con la paleta de marca en
`public/img/blog/<slug>/<nombre>.svg`, renderizado con `rsvg-convert` y
revisado antes de enlazarlo; imagen generada con codex solo si el preflight
pasa, y si no pasa la figura se cae sin bloquear el post. Bloque `<figure>` de
primer nivel en el `.mdx`, con `alt` y `figcaption`. Todo en
`references/figures.md`.

### 5. Resolver la portada

Cadena de tres eslabones con preflight, en `references/cover-and-og.md`. La
imagen de compartir (1200×630) **no** es asunto tuyo: se genera siempre a
partir del título.

### 6. Verificar

```bash
pnpm lint && pnpm typecheck && pnpm test
```

```bash
pnpm build
```

`pnpm test` valida el contenido real: un frontmatter inválido o una figura que
apunta a un fichero inexistente fallan ahí y no en producción. Detalle y qué hacer con cada fallo: `references/workflow.md`.

### 7. Entregar

Resume: ruta del fichero, `type`, tags, cuenta de palabras contra el
presupuesto, figuras (ruta y tipo, o «sin figuras»), qué eslabón de portada
entró, y el recordatorio de que sigue en
`draft: true` y sin commit.

## Modo actualizar

Editar un post ya publicado preservando **slug y `date` original**. La `date`
es cuándo se publicó, no cuándo se tocó por última vez.

1. Lee el `.mdx` entero antes de editar. Un post publicado ya está indexado y
   enlazado: se edita, no se reescribe por gusto.
2. **Nunca renombres el fichero.** Cambiar el slug rompe la URL indexada, el
   feed y cualquier enlace externo. Si el título cambia de sentido, el slug se
   queda como está y se dice.
3. Escribe `updatedAt: YYYY-MM-DD` con la fecha de hoy. El schema rechaza una
   `updatedAt` anterior a `date`.
4. Si el cambio es **sustantivo** —cambia una conclusión, corrige un dato,
   añade una sección— cierra con nota de revisión al pie:

   ```mdx
   ---

   *Revisado el 14 de marzo de 2026: se corrige el criterio de la sección 2, que
   confundía umbral de revisión con umbral de alerta.*
   ```

   Un cambio tipográfico o de estilo no lleva nota: solo `updatedAt`.
5. Verifica igual que en crear. No quites `draft` si lo tenía, ni lo pongas si
   no lo tenía.

## Modo auditar

Recorre `src/content/blog/`, aplica la checklist de la voz —o el subconjunto
mínimo— y devuelve, **por post**, los incumplimientos con severidad y
reescritura propuesta. Auditar es diagnosticar: **no edita ficheros** salvo que
se pida explícitamente aplicar los hallazgos.

Orden de trabajo: primero lo mecánico (frontmatter, título sin punto,
presupuesto de palabras, tags fuera de vocabulario, figuras con `alt` y pie),
después la lectura de voz párrafo a párrafo, que es lo que no se puede
automatizar. Las figuras se auditan como texto: cifra que no está en el cuerpo,
dato clínico literal, tecnología interna o paleta fuera de marca son hallazgos.

Salida por post:

```
### <slug> — <type>, <n> palabras (presupuesto <rango>)

| Sev | Regla | Fragmento | Reescritura propuesta |
|-----|-------|-----------|-----------------------|
| alta | Personificación de la IA | «el sistema entiende la pregunta» | «el sistema recupera los documentos que responden a la pregunta» |
```

Severidad **alta** para líneas rojas clínicas, personificación de la IA y
filtraciones por encima del nivel funcional. Media para narrador, léxico y
comparativas. Baja para tipografía y puntuación.

Cita el fragmento **literal**, nunca parafraseado: sin el fragmento exacto el
hallazgo no es verificable. Si un post no tiene hallazgos, dilo en una línea y
pasa al siguiente. Cierra con el recuento por severidad y con los dos o tres
patrones que se repiten entre posts, que es lo que de verdad corrige el próximo.

Autochequeo del modo, con un fragmento sembrado y su resultado esperado:
`references/workflow.md`.

## Referencias

| Fichero | Para qué |
|---|---|
| `references/frontmatter-contract.md` | Campos, derivados, qué no se escribe a mano |
| `references/cover-and-og.md` | La cadena de portada y el preflight de codex |
| `references/tag-vocabulary.md` | Vocabulario sugerido, para que los tags libres no deriven |
| `references/figures.md` | Cuándo una figura entra, paleta SVG de marca, imagen generada y su preflight |
| `references/workflow.md` | Comandos de verificación y qué no hace la skill |

Para cualquier decisión visual —color, tipografía, componente— la skill hermana
es `binpar-brand-design-system` (color: `references/color.md`; figuras y
gráficos: `references/charts.md`; motor del blog: `references/web/blog-patterns.md`).

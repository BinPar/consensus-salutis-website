# Portada y tarjeta de compartir

Dos imágenes distintas, y solo una es asunto tuyo.

| Imagen | Encuadre | Quién la hace |
|---|---|---|
| **Portada** del artículo y de la tarjeta del índice | 16:7 (1600×700) | Esta cadena, con `image` en el frontmatter, o la portada de marca por código |
| **Tarjeta de compartir** (LinkedIn, X, WhatsApp) | 1200×630 | `src/app/blog/[slug]/opengraph-image.tsx`, **siempre**, con el título dentro |

La de compartir no depende de que el post tenga `image` ni de que ningún
generador externo haya funcionado. No la toques y no la sustituyas por la
portada: son formatos distintos y la portada no lleva texto.

## La cadena de portada

Tres eslabones. Se baja al siguiente solo cuando el anterior no está
disponible, y **bajar no es fallar la tarea**.

### 1. Generación con codex, si codex funciona

Preflight primero, sin asumir nada. Dos condiciones, las dos:

```bash
codex --version >/dev/null 2>&1 && echo "codex: ok" || echo "codex: roto"
```

```bash
test -f ~/.codex/auth.json && echo "auth: ok" || echo "auth: falta"
```

El primer comando **sin pipe a `head` ni a nada**: un pipe se queda con el
código de salida del último proceso y un codex roto pasaría por bueno.

Si los dos pasan, genera la portada a `public/img/blog/<slug>.webp` con
gpt-image-2.5, en 1600×700, y rellena `image` e `imageAlt`. El prompt describe
lenguaje visual de marca —trazo de señal continuo, degradado teal→turquesa
sobre navy profundo, formas orgánicas blandas, sin texto, sin personas, sin
iconografía médica de stock— y nunca contenido clínico literal.

Después: comprueba que el fichero existe y que el encuadre es 16:7. Un fichero
que no existe con `image` puesto rompe `pnpm test`, y ese fallo es correcto.

**Estado de la máquina de referencia (2026-09-09):** operativo. El `codex` del
`PATH` es el global de bun (`@openai/codex@0.153.4`, la misma versión que
empaqueta la app de ChatGPT en `/Applications/ChatGPT.app/Contents/Resources/codex`),
con login por ChatGPT y la feature `image_generation` estable. Antes estaba roto
por dos instalaciones viejas: la de bun (0.122.0) sin binario vendor, y una de
nvm (0.72.0) que moría con código 137; la primera se actualizó y la segunda se
desinstaló. Si vuelve a fallar, `codex doctor` y `bun add -g @openai/codex@latest`.

Invocación que funcionó, desde un directorio de scratch (no desde el repo):

```bash
codex exec --skip-git-repo-check -s workspace-write -C "$SCRATCH" \
  'Generate ONE image with the image generation tool and save it as ./cover.png ... NO text ...'
```

El modelo guarda el PNG en `~/.codex/generated_images/<sesión>/` y lo copia a
`./cover.png` (salió 1895×830). Después, recorte a 16:7, reescalado a 1600×700 y
codificación con `sips` + `cwebp -q 85` a `public/img/blog/<slug>.webp`.

### 2. Preguntar al autor

Si el preflight no pasa, dilo con la causa concreta —«codex sale con código 1»,
«falta `~/.codex/auth.json`»— y pregunta si va a subir una imagen. Si la sube:
va a `public/img/blog/<slug>.webp`, 16:7, y se rellenan `image` e `imageAlt`.

`imageAlt` describe lo que se ve para quien no lo ve. No repite el título y no
dice «imagen de portada».

### 3. Portada de marca por código

Si no hay imagen, `image` e `imageAlt` **se quedan fuera del frontmatter** — no
vacíos, no como cadena vacía: el schema rechaza una cadena vacía y una `image`
sin `imageAlt`. Ausentes.

Entonces entra `BlogCover` (`src/app/_components/blog-cover.tsx`): dibuja el
signal-field de la marca con geometría determinista por slug
(`src/lib/blog-cover.ts`). El mismo slug pinta siempre la misma portada, dos
slugs no pintan la misma, y nunca queda fuera de marca. Es un eslabón legítimo,
no un hueco: **la mayoría de los posts pueden quedarse aquí**.

## Qué reportar

Di siempre qué eslabón entró y por qué. Un post entregado «con portada de
marca porque el preflight de codex sale con código 1» es información; «sin
portada» es un error de reporte.

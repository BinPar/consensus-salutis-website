# Figuras del cuerpo: SVG e imagen generada

Una figura entra en un post cuando muestra algo que la prosa dice peor: un
flujo con ramas, una comparación de recuentos, un antes y un después. No entra
para decorar ni para partir un texto largo. **La mayoría de los posts no
necesitan ninguna.** Máximo dos por post, y cada una se propone en la puerta de
aprobación del ángulo, no se añade al final.

Dos tipos, con reglas distintas:

| Tipo | Para qué | Cómo se hace |
|---|---|---|
| **SVG** | Diagramas, flujos, esquemas, comparativas de cifras | A mano, con la paleta de abajo |
| **Imagen generada** | Solo lo que no puede dibujarse como esquema | Codex `image_generation`, si el preflight pasa |

El SVG es el tipo por defecto. Lo que lleva información se dibuja; la imagen
generada es la excepción.

## Dónde van y cómo se enlazan

- Fichero: `public/img/blog/<slug>/<nombre>.svg` o `.webp`. Nombre en
  kebab-case en castellano, que diga qué muestra (`dos-lecturas.svg`, no
  `figura-1.svg`).
- En el `.mdx`, bloque JSX de primer nivel con línea en blanco antes y después:

  ```mdx
  <figure>
    <img src="/img/blog/<slug>/<nombre>.svg" alt="…" width="1200" height="620" loading="lazy" />
    <figcaption>…</figcaption>
  </figure>
  ```

  Etiquetas HTML nativas, sin importar componentes. `figure`, `img` y
  `figcaption` de primer nivel tienen estilo en la página del artículo; una
  imagen Markdown (`![alt](src)`) también renderiza, pero sin pie.
- `alt` describe lo que se ve para quien no lo ve: forma del diagrama, nodos,
  qué une a qué. No repite el pie. `figcaption` dice cómo leerla en una o dos
  frases, en voz de marca (sin remate aforístico, sin tricolon).
- `width` y `height` con las dimensiones reales del `viewBox`, para que la
  página reserve el espacio antes de cargar.
- `pnpm test` comprueba que cada `src` absoluto existe en `public/` y que el
  `alt` no está vacío.

## SVG: reglas de dibujo

La figura se ve igual en modo claro y oscuro porque **lleva su propio fondo
opaco**, como la portada. Nunca depende del fondo de la página ni de clases
Tailwind: es un fichero externo y no las recibe.

| Elemento | Valor |
|---|---|
| Fondo | `#06111f` (azul noche), retícula de 44 px con líneas de 1 px en `rgba(0,188,187,0.06)` |
| Caja | `rx="16"`, relleno `rgba(21,34,48,0.92)`, borde `rgba(0,188,187,0.55)` 2 px |
| Caja destacada | relleno `rgba(0,188,187,0.12)`, borde `#00BCBB`, título `#71fffe` |
| Contraste (una vez, o ninguna) | amarillo del tema oscuro `#f6ff53` en borde, etiqueta y flecha de **un único** elemento: lo que exige atención humana. Nunca decorativo ni en rellenos |
| Trazo y flechas | `rgba(0,188,187,0.75)`, 2,5 px, curvas Bézier suaves; punta `#00BCBB`. Discontinuo `7 6` para el camino excepcional |
| Texto | título `#f8fafc` 24–26 Sora semibold; secundario `#90a1b9` (slate 400) 18–19 Plus Jakarta Sans; etiqueta `#00BCBB` 17 Sora bold con `letter-spacing="1.5"` en mayúsculas |
| Fuente | Títulos y etiquetas `Sora, ui-sans-serif, system-ui, sans-serif`; texto secundario `'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif`. Las fuentes web no llegan al SVG externo; la pila cae a la del sistema y está previsto |
| `viewBox` | `0 0 1200 620` para un flujo horizontal. Ancho fijo 1200; alto según contenido |

Nada de verde/rojo semafórico, nada de monoespaciada, nada de iconografía
médica. La skill `technical-svg-diagrams` sirve para la geometría de un flujo,
**no** para su estilo: su paleta gris con acentos de colores no es de marca.
La fuente de verdad de color y de dibujo de datos es `binpar-brand-design-system`
(`references/color.md` y `references/charts.md`). Nada de amarillo en degradados ni
fondos: la lima que aún usan las portadas generadas por código es una desviación
conocida de la web (`references/web/README.md`), no un modelo.

Reglas de contenido:

- Toda cifra o etiqueta de la figura existe también en el texto. La figura no
  introduce datos nuevos; los ordena.
- Ningún dato clínico literal que el texto no tenga (dosis, umbrales, fármacos).
- Sin nombres de proveedor, modelo ni tecnología interna: la frontera de
  divulgación de la voz se aplica igual dentro del SVG.
- Texto mínimo. Si una caja necesita tres líneas, es un párrafo, no un nodo.
- Legible a 700 px de ancho, que es la columna del artículo: en un `viewBox` de
  1200, ningún texto por debajo de 17.

Comprobación antes de entregar, siempre:

```bash
rsvg-convert -w 1200 public/img/blog/<slug>/<nombre>.svg -o "$SCRATCH/<nombre>.png"
```

Y mirar el PNG. Lo habitual que falla: una etiqueta que desborda su caja, una
flecha que entra por el lado equivocado, un texto secundario que se solapa con
el título. Se corrige en el SVG y se vuelve a renderizar.

## Imagen generada: cuándo y cómo

Solo cuando la figura no es un esquema y el autor la ha aprobado en la
propuesta. Ejemplos legítimos: la textura de una superficie, una escena
abstracta que ilustra un concepto. Ejemplos vetados:

- Un documento clínico simulado, una tabla o una pantalla falsa. Parecen
  evidencia y no lo son.
- Personas, personal sanitario, pacientes, iconografía médica de stock.
- Cualquier cosa con texto dentro: los modelos lo escriben mal y la marca no
  pone texto en imagen.

Preflight idéntico al de la portada (`cover-and-og.md`, eslabón 1): `codex
--version` sin pipe y `~/.codex/auth.json`. Si pasa, se genera desde un
directorio de scratch con `codex exec` y la feature `image_generation`, con el
lenguaje visual de marca (trazo de señal continuo, teal→turquesa sobre navy,
formas orgánicas, sin texto, sin personas). Encuadre 16:9 o 3:2 según el hueco.
Después `sips` + `cwebp -q 85` a `public/img/blog/<slug>/<nombre>.webp`, y el
mismo bloque `<figure>` de arriba.

El modelo de imagen es **gpt-image-2.5**, el que hay detrás de la herramienta
`image_generation` del codex instalado. Codex no permite elegirlo (responde
«model selection wasn't available» si se le pide), así que no se nombra en el
prompt ni se comprueba: el preflight es el de codex y auth. **Si el preflight no pasa, la figura
generada se cae y el post sale sin ella.** No se pregunta por la imagen a menos
que el autor la hubiera pedido expresamente; en ese caso se dice la causa
concreta del fallo, como en la portada.

## Qué reportar

Por figura: ruta, tipo (SVG o generada), qué muestra, y en el caso generado qué
eslabón entró. Una figura propuesta que al final no se hizo también se reporta
con el motivo.

# Fichas de blog · revisión del 21 de octubre de 2026

## Ajuste al modelo real

Las seis variantes muestran cuatro fichas: los artículos recibidos del motor real se completan con tres muestras locales. Todas usan únicamente los campos de la ficha real: portada, título, resumen, fecha, tiempo de lectura y enlace. Se han retirado las categorías derivadas de etiquetas y los filtros y recuentos. `readTime` se muestra completo, sin recomponerlo. Galería incorpora también el resumen. «Por temas» pasa a llamarse «Retícula», manteniendo `topics` en la URL. Las cabeceras recuperan el texto y la acción «Ver todos» de la home real. Las muestras se distinguen únicamente al abrir su previsualización local; esa acción del laboratorio se pasa aparte del modelo de datos.

Las notas siguientes documentan las propuestas y validaciones anteriores a este ajuste; sus referencias a categorías, filtros o al interruptor de muestras describen el estado anterior.

## Nuevas variantes 07 a 09

Se mantienen las seis variantes anteriores. Paspartú (`mat`), Solapa (`lapel`) y Díptico (`diptych`) están en `blog-card-explorations.tsx` y reutilizan `Cover`, `Meta` y `ReadingAction`. Las cuatro fichas conservan portada, título, resumen, fecha, tiempo de lectura y acción de lectura. No se añaden categorías, autores, distintivos, filtros ni campos nuevos. Las muestras y su previsualización siguen siendo las mismas.

La investigación toma como referencias las colecciones editoriales de [Resend](https://resend.com/blog), [Linear](https://linear.app/now) y [Vercel](https://vercel.com/blog). Se consideran la jerarquía del titular, la separación de los metadatos y la repetición de una unidad de lectura. Las tres composiciones siguientes son propuestas propias para Consensus Salutis; no trasladan los buscadores, categorías o firmas de esas webs al modelo de la ficha.

- **Paspartú**: portada dentro de un marco blanco y una superficie suave; título y resumen separados de los metadatos por un filete. Flecha circular que toma el color de acento al interactuar.
- **Solapa**: portada de mayor altura con un panel opaco de lectura superpuesto. La elevación del panel y el desplazamiento de la flecha son breves y no alteran la disposición del resto de fichas.
- **Díptico**: portada vertical y titular en paralelo, con resumen y metadatos debajo a todo el ancho. A 1024 px se amplía el espacio del texto y se permite la partición de palabras largas para mantener las cuatro columnas.

Todas utilizan exclusivamente Tailwind v4, ambos temas, foco visible y movimiento reducido. No incorporan animación continua ni hojas CSS.

## Referencias revisadas

- [Resend Blog](https://resend.com/blog): revisión visual de las portadas y la separación entre imagen, título y firma. Se toma la claridad de la unidad editorial, sin copiar su tipografía ni su identidad oscura.
- [Vercel Blog](https://vercel.com/blog): revisión de destacados, categorías y colección de artículos. Se toma la repetición de una jerarquía de lectura estable; no se traslada su escala de página de archivo a la sección de la home.
- [USWDS · Card](https://designsystem.digital.gov/components/card/): referencia para agrupación semántica y reconocimiento de acciones.

Las siguientes decisiones son propuestas propias para esta home. Las referencias no validan por sí solas estas composiciones.

## Criterio de composición

Cuatro columnas desde 1024 px, dos en tablet y una en móvil. La ficha del artículo real conserva exactamente la portada de producción mediante `BlogCover` (o su imagen si dispone de ella). Las tres muestras locales completan la retícula con portadas generadas por el mismo `BlogCover` de producción a partir de sus slugs. Todas las fichas respetan la regla real: imagen propia si existe; SVG de marca en caso contrario. Las ilustraciones conceptuales anteriores quedan fuera de la previsualización.

1. **Abierta** (`open`): se conserva la propuesta de imagen arriba y texto sobre el fondo. Las proporciones se adaptan a cuatro columnas. Imagen 1.85:1, llamada a lectura al interactuar y subrayado del titular.
2. **Corte** (`cut`): sustituye a Cristal. Una superficie continua combina portada arriba y cuerpo claro debajo. La esquina inferior derecha de la imagen se recorta para alojar la flecha; la categoría se sitúa en la unión entre franjas. No hay panel flotante ni desenfoque. Al interactuar, un reflejo cruza la portada y la flecha gira y se rellena de teal. Los efectos se activan también con teclado y respetan movimiento reducido.
3. **Titular** (`headline`): sustituye a Foco con otra estructura. Categoría y tiempo preceden al título; la portada se sitúa después y el resumen y fecha cierran la pieza. Un filete superior articula las cuatro columnas sin cajas exteriores. El hover cambia el color del titular y desplaza la flecha de lectura.

Los enlaces anteriores se mantienen mediante alias: `glass` / `immersive` / `folios` → `cut`, `focus` / `index` → `headline`, `editorial` → `open`.

## Exploraciones de sección · variantes 04–06

Se conservan las tres variantes anteriores. Las nuevas composiciones tienen cabeceras y estructuras propias en `blog-section-explorations.tsx`. La portada, los metadatos y la acción de lectura se comparten mediante `blog-card-shared.tsx`; los componentes de producción permanecen intactos.

### Recursos de la home revisados

- `src/app/_components/horizontal-home.tsx`: orden real arquitectura → conocimiento → blog → contacto, escala de titulares y navegación lateral.
- `src/app/_components/product-strata/product-strata-scene.tsx`: titular centrado en dos tonos y retícula de capas de conocimiento.
- `src/app/_components/clinical-process-showcase.tsx`: relación entre consulta, referencias y vista previa de fuentes. Revisión visual de la escena «Fuentes verificables» en la home.
- `src/app/_components/volume-section.tsx`: retícula y superficie común del corpus; se conserva como contexto inmediatamente anterior.
- `src/app/_components/contact-assistant/contact-assistant.tsx`: lenguaje de conversación y composición de la entrada al contacto; se conserva en modo de previsualización inmediatamente después.

### Propuestas

4. **Señal** (`signal`): cabecera centrada y cuatro ventanas orgánicas unidas por un trazo de señal. El conjunto comparte un paisaje visual, sin cajas exteriores. La forma de cada portada cambia suavemente con cursor o foco; los titulares permanecen alineados. La señal decorativa solo se muestra cuando hay una fila de cuatro columnas.
5. **Galería** (`gallery`): sustituye a Atlas. Cuatro portadas de artículo con categoría y titular integrado sobre un degradado claro, con fecha y tiempo debajo. La composición conserva la portada original y mantiene el vínculo entre imagen y titular en una única pieza de blog.
6. **Por temas** (`topics`): sustituye a Conversación. Cabecera de blog, filtros reales por categoría y cuatro fichas con portada, título, resumen y metadatos. La colección se filtra localmente y anuncia el número de resultados. No se muestra una conversación ni se representan fuentes clínicas como controles de aplicación.

Los enlaces anteriores `atlas` y `conversation` se interpretan como `gallery` y `topics`.

Las tres conservan cuatro artículos, una portada original reconocible y superficies claras en el tema claro. No capturan el scroll ni reproducen animaciones continuas.

### Validación de las nuevas secciones

- `pnpm check`: lint, TypeScript y los 528 tests pasan tras sustituir las variantes 05 y 06.
- Galería y Por temas se revisan a 390, 768 y 1280 px en claro y oscuro: una, dos y cuatro columnas, sin desbordamiento y con portada original presente. Datos en `new-sections-validation.json`.
- Comprobados todos los filtros y el retorno a «Todos», que recupera las cuatro fichas. Los controles usan foco visible y `aria-pressed`; el recuento usa `role=status`.
- Se mantienen las secciones de contexto, el artículo real y las muestras locales.

## Contexto y aislamiento

Las seis variantes muestran arquitectura («Tres capacidades. Una sola arquitectura.») → conocimiento → blog → asistente de contacto en modo `preview` → footer. Arquitectura usa `ProductStrataSection` con disposición adaptable y el footer usa `VerticalFooter`, ambos componentes reales consumidos sin modificar. El footer es hermano del contenido principal, fuera de `main`. El control «Contexto» permite ocultarlas. Solo se modifican archivos dentro de `src/app/casos-lab/`. No se añaden hojas CSS ni dependencias. El artículo real mantiene su enlace; las muestras abren un diálogo local y no se publican.

## Revisión actual

- `pnpm check`: lint, TypeScript y 528 tests en 35 archivos correctos, incluidos los 12 de aislamiento.
- Escritorio a 1280 × 800: cuatro fichas y cuatro columnas en las tres variantes. Alturas: Abierta 340 px, Corte 371 px, Titular 401 px; sin desbordamiento.
- A 1024 px se mantienen las cuatro columnas, sin desbordamiento de titulares.
- Móvil a 390 × 844: cuatro fichas en una columna y sin desbordamiento horizontal, con movimiento reducido.
- La portada original está presente en la primera ficha de las tres variantes y se conserva al ocultar las muestras.
- Verificado el interruptor de muestras: queda el artículo real con su portada y enlace.
- La carga normal se revisó sin errores de consola. Al cargar con movimiento reducido desde el inicio, los componentes compartidos de producción `RouteEntrance`, `VolumeSection` y `ContactAssistant` presentan un aviso de hidratación por su opacidad inicial. Esta revisión no modifica esos componentes; la animación local usa un valor inicial constante y una utilidad `motion-reduce:`.

Revisión de Corte: cuatro columnas de 282 px a 1280 × 800, portada original presente y sin desbordamiento; una columna a 390 × 844, con foco visible y movimiento reducido. TypeScript, ESLint de la feature y las 12 pruebas de aislamiento correctos.

Contexto ampliado: verificadas arquitectura y footer en las seis variantes, su orden en el documento y el control Contexto para ocultar y restaurar ambos. Revisión a 1280 y 390 px sin desbordamiento. TypeScript, ESLint de la feature y las 12 pruebas de aislamiento correctos.

## Portadas realistas

Las seis variantes aplican `image` → imagen propia; sin `image` → `BlogCover(slug)`, tanto al artículo real como a las muestras locales. La selección de portada no depende de `sample`, del índice ni de la variante. El generador y el componente de producción se reutilizan sin modificarlos.

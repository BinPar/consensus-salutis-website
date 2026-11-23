# Página de blog

Categoría independiente del selector del laboratorio. Acceso directo: `/casos-lab?lab=blog-page`.

La vista «Referencia» reproduce el índice actual de `/blog`: introducción, filtros de etiquetas, rejilla, portadas, metadatos, estado vacío y paginación de doce artículos. Usa todos los artículos y las etiquetas del mismo loader de producción, sin añadir muestras. Los filtros y la paginación se resuelven con estado local y no abandonan el laboratorio. Como en producción, cada etiqueta muestra su conjunto completo, sin paginación.

`blog-page-reference-index.tsx` y `blog-page-reference-card.tsx` son copias locales de la composición y las fichas de producción. **La card está validada: no modificar su componente, dimensiones, tipografía, portada, metadatos o efectos mediante estas variantes.** Todas reutilizan `BlogGrid` y `BlogPageReferenceCard`, sin estilos descendientes que alteren las fichas. La portada original `BlogCover`, los fondos y el footer se consumen como componentes compartidos de solo lectura. Se omite la cabecera de la web en todas las versiones, incluida Referencia, para evitar salidas accidentales; se conserva la barra del laboratorio. Las capas decorativas quedan recortadas al área de referencia. Los enlaces a artículos y páginas de la web conservan sus destinos reales.

## Variantes de página

Se seleccionan con `blogPageVariant`; un valor desconocido vuelve a `base`. La referencia permanece disponible.

- **Horizonte** (`horizon`): vista de lectura digital con cabecera de aplicación y etiquetas reales. La interfaz aparece y el título se compone palabra a palabra, usando únicamente el título, resumen, autor, tiempo de lectura y portada del artículo existente.


Todas siguen la secuencia entrada → galería → footer. Cada entrada tiene una altura mínima de `100svh - altura de la barra del laboratorio`; en pantallas cortas puede crecer para no recortar el contenido. Usan el flujo, la retícula, las fuentes y los colores de Inicio y Plataforma. La referencia de estructura inicial es el [Recetario de Postext](https://postext.dev/es/cookbook); la escala y presencia de las entradas siguen las de Inicio, Plataforma y Equipo. No se añaden buscadores, colecciones, selecciones editoriales ni campos de contenido.

`blog-page-variants.tsx` compone la entrada y el marco exterior de la galería. Recibe filtros y galería del mismo controlador de `blog-page-lab.tsx`; orden, etiquetas, doce artículos por página y etiquetas sin paginación permanecen iguales. El recuento se calcula desde `filteredPosts.length`. No se añaden artículos de ejemplo. El filtro activo se conserva al cambiar de variante; el selector de variantes se refleja en la URL y admite Atrás/Adelante. La entrada conserva el mensaje del blog al filtrar; el estado de la etiqueta se presenta en la galería. Referencia conserva su comportamiento original.

`blog-page-entrances.tsx` contiene las escenas animadas y el texto de la página, que no se presenta como un campo de los artículos. Se excluyen libros, hojas, pliegos y cualquier analogía con el papel; el lenguaje visual es de interfaz digital, señal y tipografía. Las ilustraciones son decorativas y quedan fuera del árbol de accesibilidad; la galería contiene los enlaces reales. `blog-page-scene-cover.tsx` reproduce la portada original con identificadores SVG únicos, para que la ilustración y la card no compartan IDs. No cambia el generador ni las portadas de la galería.

Las entradas se animan una vez al entrar en pantalla, sin capturar el scroll. Un botón local permite repetirlas. Las animaciones de escena terminan en unos dos segundos y respetan movimiento reducido. «Explorar artículos» desplaza la página a la galería, con foco de teclado y margen para la barra del laboratorio. No modifica la lógica ni la navegación de artículos.


### Nuevas exploraciones

Ventanas y Manifiesto se conservan junto con Referencia, Horizonte, Foco, Lectura e Impacto. Pórtico, Editorial y Pulso están retiradas. Sus componentes están en `blog-page-new-entrances.tsx`:

- **Ventanas** (`windows`, 05): módulos de interfaz se despliegan desde el centro y dejan espacio al mensaje. Portada, título y etiquetas proceden de los artículos reales; los módulos no representan artículos adicionales. Se presentan como decoración, sin controles falsos enfocables.
- **Manifiesto** (`kinetic`, 06): el titular emerge línea a línea, con tipografía protagonista, composición abierta y descripción y acceso a la galería al pie. El mensaje es texto de la página, no un atributo del artículo.

Las tres mantienen la altura de pantalla, los temas claro y oscuro, la barra del laboratorio sin cabecera de la web, el acceso a la galería y el botón de repetir entrada. No alteran la card validada ni el controlador del blog.

Tailwind v4, sin hojas CSS nuevas. Sin formularios, envíos ni cambios en el contenido. Conserva los controles comunes de navegación y tema. Contexto y repetición de entrada se ocultan porque no corresponden a esta referencia.

La ruta hereda la restricción de `/casos-lab`: solo está disponible en desarrollo y no se indexa. No modifica `/blog`, los componentes de producción ni las otras categorías del laboratorio.

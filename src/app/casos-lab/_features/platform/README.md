# Plataforma · Referencia y herramientas

Abrir `/casos-lab?lab=platform`, o elegir «Plataforma» en la barra del laboratorio.

La referencia reproduce la entrada y el mock de `/plataforma` a fecha de 5 de noviembre de 2026. La barra del laboratorio sustituye a la cabecera de la web. No incluye el índice de las secciones posteriores, el recorrido clínico ni el cierre comercial.

## Composiciones de herramientas

Las tres propuestas conservan la entrada y el mock y añaden debajo el bloque «Evidencia visible», con las siete funcionalidades facilitadas por el usuario. «Referencia» conserva la versión inicial sin esta sección. El parámetro `platformVariant` y el selector general permiten comparar las propuestas; `#platform-tools` abre directamente la sección. La selección respeta Atrás/Adelante.

| Variante | Enlace | Composición e interacción |
| --- | --- | --- |
| Explorador | `/casos-lab?lab=platform&platformVariant=explorer#platform-tools` | Menú vertical de siete herramientas y una ilustración amplia que cambia al seleccionarlas. En móvil, el menú se convierte en una fila desplazable de botones. |
| Mosaico | `/casos-lab?lab=platform&platformVariant=mosaic#platform-tools` | Retícula de siete tarjetas con dos piezas de mayor anchura. Filtros por respuesta o documento y ampliación de cada ilustración en un diálogo accesible, con cierre por Escape y retorno del foco. |
| Recorrido | `/casos-lab?lab=platform&platformVariant=journey#platform-tools` | Índice fijo en escritorio y tres pasos de lectura: seguir la cita, consultar el original y conservar la evidencia. El índice sigue el desplazamiento y enlaza a cada paso. Las siete herramientas se distribuyen entre ellos. |
| Catálogo | `/casos-lab?lab=platform&platformVariant=catalog#platform-tools` | Siete fichas iguales, en dos columnas. Todas siguen el orden número → herramienta → explicación → fragmento de interfaz, sin piezas de distinto tamaño. |
| Desplegable | `/casos-lab?lab=platform&platformVariant=disclosure#platform-tools` | Una lista ordenada de siete herramientas. Cada fila despliega la misma composición: explicación a la izquierda y fragmento de la plataforma a la derecha. |

Catálogo y Desplegable responden a la corrección del usuario sobre fidelidad y uniformidad. Usan `tools/native/`, no las ilustraciones esquemáticas anteriores. `product-fragments.tsx` contiene las funciones de presentación copiadas literalmente del producto para citas, bibliografía, unidad conservada, estado documental, procedencia e indicadores del PDF. Los textos de interfaz se extraen de los mensajes españoles del producto. `product-runtime.tsx` sustituye las dependencias de datos e internacionalización para usar ejemplos locales.

Los fragmentos conservan un ancho nativo de 560 px y se reducen como una sola unidad: no se adaptan sus tipografías, controles o espaciados por herramienta. En Catálogo, la vista reserva 350 px de alto. Cada ejemplo selecciona el contenido necesario para ilustrar su función: dos pasajes con sus citas, un cierre breve con tres fuentes, evidencia conservada y estado del documento, procedencia sin bloques duplicados, y aviso con la unidad conservada. La composición se centra y se ajusta por su ancho y su altura completos; no se reduce solo la ventana ni se dejan bloques cortados. Los visores mantienen la cabecera y los controles y centran el pasaje dentro de su área documental. Citas y bibliografía reproducen la retícula de 44 px y el velo de lectura del chat; las demás herramientas usan el fondo del panel lateral (`rail-light/30`, `rail-dark/85`, desenfoque de 12 px). Desplegable conserva el recorte original de 560 × 480 px. El recorte del visor usa la página documental real de soporte vital avanzado que ya está en el repositorio del producto, copiada a `public/lab/platform-tools/`. Los datos del ejemplo y la selección de un pasaje son locales; no se consulta el backend. No se ejecutaron nuevas pruebas para estas dos variantes, por indicación del usuario.

Se desarrolla únicamente el primer grupo para decidir el lenguaje compositivo. No hay filtros inactivos ni grupos sin contenido. Las ilustraciones usan texto documental esquemático y se identifican como ejemplos de interfaz; los documentos y los números de página son ilustrativos.

La referencia visual procede de `apps/chat/src/components/citation-viewer.tsx`, `citation-footnote.tsx`, `chat-markdown.tsx` y `pdf-source-renderer.tsx` del repositorio hermano `consensus-salutis`: pestañas de fuentes, afirmación seleccionada, pasaje citado, evidencia conservada, procedencia e indicador de coincidencia con el PDF. No se importa código de ese repositorio ni se llaman sus servicios.

Los archivos de `tools/` son propios del laboratorio. Los estilos se delimitan con `:where([data-visual-lab])`; las variables viven en `.vlt-tools` y la animación tiene prefijo `visual-lab-`. No se escriben preferencias ni se interceptan peticiones globales. Las animaciones locales respetan movimiento reducido.

## Archivos propios

- `platform-lab.tsx`: composición local de la entrada original; conserva textos, tamaños, espaciados, fondos y revelado.
- `platform-lab.css`: encuadre de escritorio equivalente al de la página original, acotado a esta composición.
- `preview/`: copia independiente del mock, sus componentes, estilos, datos y funciones de tamaño. Las clases, variables CSS y animaciones usan `visual-lab-pp-`; todos los selectores están bajo `:where([data-visual-lab])`.
- `platform-directions.ts`: variantes y resolución del parámetro `platformVariant`.
- `tools/tools-data.ts`: las siete funcionalidades y su agrupación para filtros y recorrido.
- `tools/platform-tools.tsx`: las tres composiciones y sus interacciones.
- `tools/tool-illustration.tsx`: siete ilustraciones independientes basadas en la interfaz de la plataforma.
- `tools/platform-tools.css`: estilos y adaptación de la sección y de las ilustraciones.

Los fondos, el revelado, las marcas oficiales y los documentos clínicos compartidos se consumen en lectura. Los cambios de composición y comportamiento del mock se realizan en esta carpeta. Producción no importa ningún archivo de aquí.

## Interacciones

Conserva las conversaciones de ejemplo, las citas y el panel de fuentes, el reinicio, el perfil y la navegación adaptable del mock original. Las consultas son demostraciones locales; no se envían a servicios externos. El tema del perfil solo cambia el mock. La barra general conserva el selector de tema habitual del laboratorio.

## Validación

La comparación con `/plataforma` comprueba la geometría del titular y del mock y sus estilos calculados a 390, 1280 y 1440 px, en claro y oscuro, con movimiento reducido. También comprueba conversaciones, citas, reinicio, navegación lateral, menú móvil e historial del selector de laboratorio.

Las capturas y el informe están en [`../../_review/platform/`](../../_review/platform/). La revisión del repositorio se ejecuta con `pnpm check`, que incluye las protecciones de aislamiento.

Las capturas de las tres nuevas composiciones y su informe funcional están en [`../../_review/platform/tools/`](../../_review/platform/tools/).

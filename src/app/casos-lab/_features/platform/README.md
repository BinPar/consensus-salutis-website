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
| Catálogo 2 | `/casos-lab?lab=platform&platformVariant=catalog-2#platform-tools` | Visor editorial con índice horizontal de siete herramientas, explicación protagonista a la izquierda y escena refinada a la derecha. Incluye navegación anterior/siguiente, selección por teclado y selector compacto en móvil. Reutiliza exactamente las escenas de Catálogo y sus textos; cada selección reproduce la escena elegida. |

Catálogo y Desplegable responden a la corrección del usuario sobre fidelidad y uniformidad. Usan `tools/native/`, no las ilustraciones esquemáticas anteriores. `product-fragments.tsx` contiene las funciones de presentación copiadas literalmente del producto para citas, bibliografía, unidad conservada, estado documental, procedencia e indicadores del PDF. Los textos de interfaz se extraen de los mensajes españoles del producto. `product-runtime.tsx` sustituye las dependencias de datos e internacionalización para usar ejemplos locales.

Catálogo usa `tools/native/catalog-product-scene.tsx`: las siete escenas comparten un marco nativo fijo de 560 × 360 px, una única escala y una misma fuente documental, «Soporte vital avanzado en el niño (2026)». El encuadre exterior mantiene 350 px de alto. La escala ya no depende de la cantidad de contenido de cada herramienta. Citas y bibliografía conservan la retícula de 44 px y el velo del chat. Las cinco escenas documentales comparten las pestañas originales de `CitationViewer`, su fondo lateral y el mismo punto de entrada del contenido. Cada escena prioriza una sola función y evita apilar estados secundarios. Citas utiliza la referencia numérica y el formato de cita con nombre de fuente disponibles en el producto; no se añade un resaltado verde fijo a los párrafos.

El lenguaje visual de Catálogo se alinea con `PlatformScene` y `EvidenceScene` de `/plataforma`: marco de 24 px con borde y sombra suaves, retícula de 44 px, `ProcessChatVeil`, cabecera con `Mark`, cuerpo de chat de 13/22 px, compositor y bibliografía compacta. Las primitivas compartidas se consumen en lectura; los cambios de composición permanecen en el laboratorio.

En «Citas por afirmación», la cronología sigue la escena «Fuentes verificables»: se escribe la respuesta, la bibliografía aparece automáticamente al terminar, el cursor se acerca a la cita [1] y la selecciona; después se despliega el panel lateral, se muestra la referencia y se localiza el pasaje. La aparición de la bibliografía no depende de la selección de la cita. El chat permanece visible al abrirse el panel.

`catalog-scene-motion.tsx` añade una secuencia de 4,8 segundos por tarjeta: selección de cita mediante cursor, aparición sucesiva de referencias, evidencia conservada, localización del pasaje, verificación, procedencia o aviso. El pie utiliza progreso y controles de pausa/repetición como las escenas de la página. Cada tarjeta termina en reposo; no repite el ciclo automáticamente. El reloj se detiene fuera de pantalla y al ocultar la pestaña; con movimiento reducido se muestra el estado final completo. La ventana visual conserva sus 350 px y el marco nativo de 560 × 360 px.

Los visores reutilizan `PdfFragment`, con la cabecera, controles y estilos originales, y centran el pasaje dentro del documento. La imagen procede del repositorio del producto y se conserva en `public/lab/platform-tools/`. Desplegable mantiene sus fragmentos anteriores. Los ejemplos son locales y no consultan el backend. No se ejecutaron nuevas pruebas, por indicación del usuario.

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

## Catálogo 2 · Composición editorial

La variante usa `tools/native/catalog-two.tsx` y `catalog-2.css`. Un índice muestra las siete herramientas y mantiene visible la selección. Debajo, un solo bloque desarrolla la herramienta: antetítulo numerado, título, una entradilla y una explicación de apoyo a la izquierda; la escena animada y su contexto de lectura a la derecha. La navegación admite ratón, flechas, Inicio/Fin y controles anterior/siguiente. En móvil, el índice se convierte en selector y la escena se apila tras el texto.

El marco de escena y las animaciones proceden de `CatalogProductScene` sin modificaciones. La composición sustituye la primera versión de Catálogo 2 basada en siete filas; Catálogo conserva su retícula y sus componentes. Todos los estilos nuevos están bajo `:where([data-visual-lab])` y la animación de cambio respeta movimiento reducido.

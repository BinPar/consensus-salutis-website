# Portadas del laboratorio

Ruta: `/casos-lab?lab=blog-images`. Todo aislado de producción y de Fichas blog.

## Nuevas variantes

La pestaña **Nuevas** (`blogImagesVariant=new`) compara la referencia con Aurora (`aurora`), Umbral (`threshold`) y Nácar (`nacre`). Estas también se añaden a la comparativa completa y tienen vistas individuales de doce muestras.

- **Aurora**: campos de color continuos, luz difusa y un acento suave de la gama lima original.
- **Umbral**: una superficie amplia que recorre el encuadre, con un solo borde y una transición de luz suave.
- **Nácar**: una composición de reflejos más definidos y contraste tonal, con textura fina.

Son SVG estáticos con un generador determinista independiente (`signature-geometry.ts`). Los filtros de difusión y grano son propios de estas tres variantes. El isotipo conserva exactamente su archivo, color sólido, posición y límite responsive aprobado.

Las comprobaciones cubren determinismo y variedad sobre 24 identificadores más vacío, Unicode y longitud máxima, conservación de rutas previas y límites numéricos. Se revisan ambos temas y los tres encuadres a 390, 768, 1024 y 1440 px, con referencias SVG resueltas e isotipos dentro de la ficha. Lint de la funcionalidad, tipos y los 537 tests del proyecto correctos.

## Variantes conservadas

- Original: componente de producción, importado en lectura, con el isotipo superpuesto únicamente en el lab.
- Referencia neutra (`neutral-reference`): copia local exacta del original, sustituyendo únicamente el extremo amarillo por azul hielo.
- Luz (`light`), Flujo (`flow`) y Veladuras (`veil`): generador y acabado restaurados.
- Interferencia (`interference`), Estratos (`strata`) y Refracción (`refraction`): generador y acabado restaurados.
- Afinada (`refined`): opción adicional que conserva las formas de la portada original y ajusta tangentes, luz, contorno y textura.
- Afinada 2 (`refined-2`): acabado de Afinada con tonos fríos y variación de una a cuatro formas, en un generador independiente.

Solo Raster (`raster`), Módulos (`modules`) y Barrido (`scan`) están eliminados. Sus generadores no existen y sus URLs vuelven a la comparativa. Los enlaces de las seis variantes conservadas siguen funcionando.

La comparativa muestra la referencia y todas las opciones conservadas, incluidas las nuevas. Cada vista individual presenta doce identificadores estables. Cuatro columnas desde 1024 px, dos desde 640 y una por debajo. Encuadres 8:5, 16:7 y 4:5, identificador libre y título opcional.

Isotipo oficial de BinPar, sólido y sin efectos: 14 % del ancho, máximo 48 px, separado del recorte del fondo. Se conserva en todas las variantes.

## Afinada 2

Ruta `blogImagesVariant=refined-2`. Es independiente de Afinada y conserva su acabado: trazos suavizados, luz, contorno fino, grano e isotipo. La gama se limita a azul, cian, turquesa frío y hielo; el extremo lima del degradado se sustituye por azul hielo, también en el tema oscuro.

El identificador determina entre una y cuatro formas, su geometría orgánica, tamaño, posición y giro. Se mantiene una forma principal central y se distribuyen las secundarias alrededor, conservando una composición legible al recortar. El mismo identificador mantiene siempre el mismo resultado. Generador y renderer propios, sin modificar `refined-cover.tsx` ni `refined-geometry.ts`.

Se comprueban variedad de cantidades y geometría en 32 identificadores más vacío, Unicode y longitud máxima, determinismo, límites numéricos y conservación de las curvas de Afinada. Revisión de los tres recortes a 390 y 1440 px, ambos temas y recursos SVG únicos.

## Afinada

Importa `blogCoverGeometry(slug)` en lectura. Conserva las dos formas, posiciones, semilla, orientación de luz y extremos de las curvas. Solo alinea las tangentes en la unión de las cúbicas. El acabado añade grano monocromo fino y ajusta luz, color y contorno. No modifica las otras opciones.

## Comprobaciones

Las pruebas comprueban determinismo y variedad en 24 identificadores, límites de geometría, continuidad de las curvas afinadas, conservación de la geometría original y retirada exclusiva de las tres URLs rechazadas. La revisión visual contempla ambos temas y los tres recortes.

Componentes, generadores y pruebas están contenidos en esta carpeta. Sin dependencias nuevas, hojas CSS ni llamadas externas en ejecución. Las portadas permanecen estáticas salvo la interacción local de Flujo descrita a continuación.


## Movimiento de Flujo

Solo Flujo activa un movimiento al pasar el cursor o enfocar la portada con el teclado. Sus curvas se dividen en dos grupos con recorridos suaves de 10 y 12 segundos; el fondo, grano e isotipo permanecen estáticos. Al salir o perder el foco, los trazos vuelven a la composición original en 0,7 segundos. El recorte contiene todo el movimiento.

La animación solo funciona mientras la portada está visible y se desactiva con `prefers-reduced-motion`. En ese caso también se omite el retorno animado. El título de prueba no intercepta el puntero. No se modifican las geometrías ni las otras variantes; tampoco las fichas ni el generador de producción.

Verificación funcional: hover activa una sola ficha, Tab pasa el movimiento a la siguiente portada, el isotipo no cambia de posición, al salir las curvas recuperan su posición, al activar movimiento reducido los grupos quedan sin transformación y al sacar la ficha de pantalla se detiene. Probado el recorte en los tres formatos y a 390 y 1440 px.


## Referencia neutra

Ruta `blogImagesVariant=neutral-reference`. Conserva exactamente las formas, curvas, grosores, opacidades, degradados, iluminación y recorte de `BlogCover`. Solo cambia el último color del degradado de relleno: `rgb(246 255 83)` pasa a `rgb(181 225 236)`. El isotipo de BinPar es idéntico al de la referencia del laboratorio.

Se implementa en una copia local, sin tocar el componente ni los colores de producción. Los recursos SVG usan IDs por instancia para coexistir con el original. Verificación del DOM de las cuatro muestras: normalizados los IDs, el único cambio en cada SVG es ese color; el SVG del isotipo coincide exactamente. Lint y tipos correctos.

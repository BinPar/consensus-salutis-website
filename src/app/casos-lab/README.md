# Laboratorio visual aislado

Esta ruta contiene propuestas experimentales y solo se abre con `NODE_ENV=development`. Mantiene sus parámetros de URL y no introduce rutas o contratos nuevos en la web real.

## Organización

- `_features/`: propuestas agrupadas en `cases`, `home`, `product`, `volume`, `contact`, `footer`, `team-astra` y `team-sol61`. Cada grupo conserva componentes, datos, estilos y tests propios.
- `_shared/`: navegación y composición comunes del laboratorio.
- `_review/`: comparativas, procedencia de imágenes e informes de validación. Los nombres de sus carpetas y los enlaces relativos se conservan al moverlos.
- `public/lab/`: recursos estáticos exclusivos del laboratorio, separados por propuesta.

Los componentes de la web utilizados aquí siguen siendo propiedad de la web. No se deben trasladar ni eliminar al retirar el laboratorio. La dependencia permitida es laboratorio → componentes compartidos, nunca al revés.

En Team Astra, `guiada` y `guiada-02` tienen componentes y CSS independientes (`team-guiada-hero.tsx` / `team-guiada.css` y `team-guiada-02-hero.tsx` / `team-guiada-02.css`). Guiada 02 parte de una copia de Guiada; sus clases usan `ta-guided-02` para permitir cambios sin afectar a la primera. Ambas reutilizan los datos del equipo y las fotografías de `public/lab/team-portraits/`, mediante `_shared/team-portraits.tsx`, también utilizado por todas las variantes y fichas de Team Sol6.1.

`guiada-03` («Guiada 3») conserva una copia independiente del hero y la sección de Ignacio de Guiada 02, en los archivos `team-guiada-03*` y con clases `ta-guided-03`. Añade una galería de todos los miembros con cinco columnas en escritorio (desde 1024 px), tres en tablet y dos en móvil. Los retratos escalonados se superponen con un borde del color del fondo, inspirado en la entrada de Team Sol6.1 Editorial. Reutiliza los datos y fotografías compartidos; sus cambios de composición no modifican Guiada 02.

`guiada-04` y `guiada-05` («Guiada 4» y «Guiada 5») reutilizan sin modificar el hero y la sección de Ignacio de Guiada 3. Sus galerías están aisladas en `team-guiada-gallery-explorations.tsx` y su CSS: Guiada 4 presenta retratos del mismo tamaño con solapamiento uniforme y borde del color del fondo, escalonados suavemente en cinco columnas de escritorio y tres de tablet. En móvil se alinean en dos columnas sin solapamiento para preservar la legibilidad; los nombres y cargos van al pie. Guiada 5 presenta retratos circulares con textos debajo, en cinco columnas de escritorio, tres de tablet y dos de móvil. Ambas muestran los 15 miembros de `guided03Members` directamente. Usan las fotografías reales compartidas, los titulares estándar de la home y aparición progresiva con opacidad y escala, respetando movimiento reducido. No requieren navegación horizontal ni selección de personas.

Guiada 02 añade después del hero una sección editorial sobre Ignacio Ferro (`team-guiada-02-ceo.tsx` y su CSS local). Es un componente hermano, fuera del escenario que calcula los anillos. Para investigar su trayectoria se consultaron la [página del proyecto ALMA](https://www.binpar.com/product/alma), únicamente como referencia, y el [artículo de AWS de agosto de 2024](https://aws.amazon.com/es/blogs/publicsector/medica-panamericana-revolutionizes-medical-exam-prep-with-aws-generative-ai/), que identifica a Ignacio como CEO de BinPar y CTO de Editorial Médica Panamericana. El producto presentado se llama BinPar: su descripción procede de la web actual y el enlace lleva a `/plataforma`. Los más de quince años de experiencia se atribuyen al equipo de BinPar; el cargo en la editorial se expresa como trayectoria, sin asumir su vigencia actual.

`guiada-06` («Guiada 6») conserva la entrada y la sección de Ignacio, con su foto vertical 4:5 y esquinas rectas. Su galería muestra los 15 retratos alineados en cinco columnas desde 1024 px y dos por debajo, con 4 px de separación entre fotografías. Los nombres y cargos se muestran dentro de cada foto, en la esquina inferior izquierda, sin degradado sobre la fotografía. Comparte los estilos de titular y la aparición progresiva de las otras propuestas.

## Límites

Todos los selectores experimentales quedan bajo `:where([data-visual-lab])`, también los estilos globales incrustados. `:is()` conserva la especificidad del selector original y permite que `.dark` siga siendo un ancestro externo. Las animaciones tienen el prefijo `visual-lab-`. Las variables del laboratorio se asignan a su contenedor, no a `html` ni a `body`.

El formulario y el panel de contacto de referencia son copias locales de previsualización: validan los campos, muestran una confirmación de simulación y no llaman a ninguna API. El asistente compartido se usa mediante su modo `preview` existente. Los enlaces normales pueden salir del laboratorio; una vez en una página real, sus acciones son las de esa página. No se parchea `fetch` ni se intercepta la red globalmente.

La ruta devuelve 404 en producción y está excluida de indexación. Esto no significa que sea una aplicación separada: sigue participando en lint, tipos, tests y build. Los recursos de `public/lab` se distribuyen mientras existan.

## Comprobaciones

`pnpm check` incluye la prueba de arquitectura `src/lib/__tests__/lab-isolation.test.ts`. Detecta importaciones inversas, recursos experimentales usados por la web, estilos sin delimitar y el uso accidental de formularios con envío real. ESLint restringe también las importaciones estáticas inversas. Ambas comprobaciones funcionan cuando ya no existe el laboratorio.

Los resultados de la reorganización y del ensayo de retirada del 16 de octubre de 2026 están en [`_review/isolation/validation.json`](./_review/isolation/validation.json), junto a las comparaciones y comprobaciones funcionales.

Para revisar una modificación: comparar Inicio, Plataforma y Contacto antes/después, con ambos temas y anchos de 390, 1280 y 1440 px; comprobar también la navegación desde el laboratorio hacia esas páginas. Las pruebas del formulario real deben interceptar las peticiones solo en el navegador de prueba, sin enviar datos reales.

## Retirada completa

1. Conservar fuera del proyecto cualquier comparativa que se quiera archivar.
2. Eliminar `src/app/casos-lab/` y `public/lab/`. No eliminar componentes compartidos ni las protecciones de arquitectura.
3. Retirar únicamente la entrada `"/casos-lab"` de `PRIVATE_PATH_PREFIXES` en `src/app/sitemap.ts`. `robots.ts` consume esa lista y no necesita un cambio independiente.
4. Regenerar los artefactos de Next.js para no reutilizar tipos de rutas anteriores.
5. Ejecutar `pnpm check` y `pnpm build`; comprobar Inicio, Plataforma y Contacto y que `/casos-lab` devuelve 404.

El inventario de propiedad está en `removal-manifest.json`. El ensayo de retirada se realiza en una copia temporal, nunca borrando el laboratorio de la sesión de trabajo.

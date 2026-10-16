# Laboratorio visual aislado

Esta ruta contiene propuestas experimentales y solo se abre con `NODE_ENV=development`. Mantiene sus parámetros de URL y no introduce rutas o contratos nuevos en la web real.

## Organización

- `_features/`: propuestas agrupadas en `cases`, `home`, `product`, `volume`, `contact`, `footer`, `team-astra` y `team-sol61`. Cada grupo conserva componentes, datos, estilos y tests propios.
- `_shared/`: navegación y composición comunes del laboratorio.
- `_review/`: comparativas, procedencia de imágenes e informes de validación. Los nombres de sus carpetas y los enlaces relativos se conservan al moverlos.
- `public/lab/`: recursos estáticos exclusivos del laboratorio, separados por propuesta.

Los componentes de la web utilizados aquí siguen siendo propiedad de la web. No se deben trasladar ni eliminar al retirar el laboratorio. La dependencia permitida es laboratorio → componentes compartidos, nunca al revés.

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

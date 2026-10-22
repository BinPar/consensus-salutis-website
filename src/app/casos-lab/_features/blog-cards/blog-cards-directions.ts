export const blogCardsDirections = [
  {
    id: "open",
    number: "01",
    label: "Abierta",
    description:
      "Fichas abiertas con la portada, el título, el resumen, la fecha y el tiempo de lectura del artículo real. El texto se presenta directamente sobre el fondo.",
    effect:
      "La ficha se eleva suavemente 6 px al pasar el cursor o enfocar la lectura. La imagen se acerca un 3 %, el título permanece sin subrayado y el resumen admite tres líneas.",
  },
  {
    id: "open-2",
    number: "10",
    label: "Abierta 2",
    description:
      "La misma composición de Abierta, con sus proporciones, textos, metadatos e interacciones. Añade únicamente un degradado que funde la parte inferior de la portada con el fondo, adaptado a ambos temas.",
    effect:
      "Conserva la elevación suave de Abierta, con el título sin subrayado y el resumen de tres líneas. El degradado permanece fijo sobre la base de la portada.",
  },
  {
    id: "cut",
    number: "02",
    label: "Corte",
    description:
      "Fichas en una superficie clara continua. La portada ocupa la franja superior, con una esquina recortada que aloja la flecha. El cuerpo presenta el título, el resumen y los metadatos reales.",
    effect:
      "Un reflejo atraviesa la portada al interactuar; la flecha gira hacia la lectura y se rellena de teal. El texto y las dimensiones de la ficha permanecen estables.",
  },
  {
    id: "headline",
    number: "03",
    label: "Titular",
    description:
      "Piezas con el tiempo de lectura y el titular antes de la portada; el resumen y la fecha cierran la lectura. Un filete superior ordena la retícula sin encerrar el contenido en cajas.",
    effect:
      "El titular toma el color de acento, la imagen gana escala y la flecha de lectura avanza. La jerarquía y las posiciones se mantienen estables.",
  },
  {
    id: "signal",
    number: "04",
    label: "Señal",
    description:
      "Una composición abierta y centrada: las portadas reales con contornos orgánicos quedan unidas por una señal decorativa. Conserva el título, el resumen, la fecha y el tiempo de lectura de cada artículo.",
    effect:
      "El contorno de cada imagen se abre al pasar el cursor o enfocar la lectura. Un nodo y el enlace de lectura toman el color de acento.",
  },
  {
    id: "gallery",
    number: "05",
    label: "Galería",
    description:
      "Portadas apaisadas con el color intacto en sus dos primeros tercios y un fundido al fondo en el tramo inferior. El título se sitúa en la transición; las descripciones de tres líneas y los metadatos comparten alineación. La composición permanece abierta, sin bordes de tarjeta.",
    effect:
      "La portada gana ligeramente escala y la flecha avanza al pasar el cursor o enfocar la lectura.",
  },
  {
    id: "topics",
    number: "06",
    label: "Retícula",
    description:
      "Una retícula de fichas con portada, título, resumen, fecha y tiempo de lectura del modelo real. La composición conserva las superficies y los bordes de la propuesta anterior.",
    effect:
      "La portada gana ligeramente escala al pasar el cursor o enfocar la lectura. El acceso a lectura ocupa toda la ficha.",
  },
  {
    id: "mat",
    number: "07",
    label: "Paspartú",
    description:
      "Una portada enmarcada dentro de una superficie suave. El título y el resumen tienen su propio espacio; un filete separa la fecha y el tiempo de lectura. Conserva los cuatro artículos y los campos de la ficha real.",
    effect:
      "La imagen se acerca ligeramente y la flecha circular gira y toma el color de acento al pasar el cursor o enfocar la ficha.",
  },
  {
    id: "lapel",
    number: "08",
    label: "Solapa",
    description:
      "Una portada amplia sostiene un panel de lectura superpuesto, opaco y de bordes suaves. Título, resumen, fecha y tiempo de lectura permanecen visibles, con la misma información que las fichas reales.",
    effect:
      "El panel sube suavemente, el pequeño trazo de acento se extiende y la flecha avanza al pasar el cursor o enfocar la lectura.",
  },
  {
    id: "diptych",
    number: "09",
    label: "Díptico",
    description:
      "Portada vertical y titular en paralelo, con el resumen y los metadatos a todo el ancho debajo. Una composición editorial compacta que usa únicamente los campos del modelo real.",
    effect:
      "La superficie toma un ligero tono de marca y la flecha se desplaza en diagonal al pasar el cursor o enfocar la ficha.",
  },
] as const;

export type BlogCardsDirection = (typeof blogCardsDirections)[number]["id"];

export function parseBlogCardsDirection(
  value?: string | null,
): BlogCardsDirection {
  const legacy = {
    atlas: "gallery",
    conversation: "topics",
    editorial: "open",
    folios: "cut",
    immersive: "cut",
    glass: "cut",
    index: "headline",
    focus: "headline",
  } as const;
  const requested =
    value && value in legacy ? legacy[value as keyof typeof legacy] : value;
  return (
    blogCardsDirections.find((item) => item.id === requested)?.id ?? "open"
  );
}

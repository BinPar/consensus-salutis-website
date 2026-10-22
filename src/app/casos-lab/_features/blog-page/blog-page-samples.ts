import type { BlogPost, BlogTag } from "~/lib/blog";

type SampleTag = "evaluacion" | "trazabilidad" | "gobierno-del-conocimiento";
type Sample = readonly [string, string, string, number, SampleTag];

// Contenido ficticio para composición. Nunca entra en el loader de producción.
const samples: readonly Sample[] = [
  [
    "fuente-original",
    "De la pregunta clínica a la fuente original.",
    "El recorrido de la evidencia y las referencias que permiten revisar una respuesta y recuperar el contexto de su fuente.",
    6,
    "trazabilidad",
  ],
  [
    "conocimiento-cambia",
    "El conocimiento cambia. La práctica también.",
    "Cómo incorporar nuevas fuentes a los flujos de trabajo sanitarios y mantener el conocimiento actualizado y revisable.",
    4,
    "gobierno-del-conocimiento",
  ],
  [
    "ia-hospital",
    "Qué necesita una IA para ser útil en el hospital.",
    "Integración, contexto y revisión profesional para conectar la inteligencia artificial con las necesidades del trabajo asistencial.",
    5,
    "evaluacion",
  ],
  [
    "leer-evidencia",
    "Aprender a leer la evidencia detrás de una respuesta.",
    "No todas las referencias aportan lo mismo. Una aproximación a su vigencia, su alcance y su relación con la consulta clínica.",
    7,
    "trazabilidad",
  ],
  [
    "protocolos-vivos",
    "Protocolos que evolucionan con el equipo.",
    "Del documento compartido al conocimiento que se puede consultar, contrastar y revisar en el día a día de una institución.",
    5,
    "gobierno-del-conocimiento",
  ],
  [
    "contexto-clinico",
    "El contexto también forma parte de la pregunta.",
    "Qué información ayuda a formular una consulta y por qué los matices importan al interpretar una respuesta en la práctica clínica.",
    4,
    "evaluacion",
  ],
  [
    "actualizar-fuentes",
    "Actualizar una fuente es solo el principio.",
    "La revisión de contenidos requiere criterios compartidos, responsables claros y una forma de seguir los cambios a lo largo del tiempo.",
    6,
    "gobierno-del-conocimiento",
  ],
  [
    "incertidumbre",
    "Cómo hacer visible la incertidumbre.",
    "Exploramos formas de presentar límites y matices para que una respuesta pueda ser valorada con criterio profesional.",
    8,
    "evaluacion",
  ],
  [
    "referencias-contexto",
    "Referencias con contexto.",
    "Una cita resulta más útil cuando permite comprender qué respalda, de dónde procede y cómo llegar al contenido original.",
    3,
    "trazabilidad",
  ],
  [
    "consulta-seguimiento",
    "De una consulta puntual a un seguimiento con contexto.",
    "El valor de recuperar preguntas anteriores y mantener el hilo de una conversación sin perder de vista las fuentes consultadas.",
    5,
    "trazabilidad",
  ],
  [
    "preguntas-utiles",
    "Mejores preguntas para evaluar una herramienta de IA clínica.",
    "Más allá de una demostración: criterios de uso, revisión de respuestas y necesidades del equipo para orientar una evaluación.",
    7,
    "evaluacion",
  ],
  [
    "conocimiento-compartido",
    "Conocimiento compartido, criterios comunes.",
    "Cómo pensar la organización de guías y protocolos para que distintos profesionales puedan trabajar con una base de referencia común.",
    6,
    "gobierno-del-conocimiento",
  ],
  [
    "fuentes-discrepan",
    "Cuando las fuentes no dicen lo mismo.",
    "Identificar diferencias, revisar fechas y recuperar el contexto de una recomendación ayuda a comprender los puntos de desacuerdo.",
    5,
    "trazabilidad",
  ],
  [
    "revision-profesional",
    "La revisión profesional como parte del diseño.",
    "Una mirada a los momentos en los que la intervención del equipo aporta criterio y permite mejorar la experiencia de consulta.",
    4,
    "evaluacion",
  ],
  [
    "ciclo-conocimiento",
    "El ciclo del conocimiento clínico: incorporar, revisar y actualizar.",
    "La calidad de una base documental depende tanto de sus fuentes como de los procesos que permiten mantenerla a lo largo del tiempo.",
    9,
    "gobierno-del-conocimiento",
  ],
  [
    "tecnologia-cotidiana",
    "Tecnología que encuentra su lugar en la práctica cotidiana.",
    "Qué observar en una prueba de uso para entender si una herramienta encaja en los tiempos, los hábitos y las tareas de un equipo sanitario.",
    6,
    "evaluacion",
  ],
];

const labels: Record<SampleTag, string> = {
  evaluacion: "Evaluación",
  trazabilidad: "Trazabilidad",
  "gobierno-del-conocimiento": "Gobierno del conocimiento",
};

export function createBlogPageSamples(reference?: BlogPost): BlogPost[] {
  if (!reference) return [];
  const dateFormat = new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return samples.map(([key, title, excerpt, readMinutes, tag], index) => {
    const slug = `lab-blog-page-${key}`;
    const date = new Date(`${reference.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - index - 1);
    return {
      ...reference,
      slug,
      href: `#${slug}`,
      title,
      excerpt,
      date: date.toISOString().slice(0, 10),
      createdAtLabel: dateFormat.format(date).replaceAll(".", ""),
      updatedAt: null,
      updatedAtLabel: null,
      tags: [tag],
      tagLabels: [labels[tag]],
      image: null,
      imageAlt: null,
      readMinutes,
      readTime: `${readMinutes} min de lectura`,
      wordCount: readMinutes * 210,
      draft: false,
    };
  });
}

export function getBlogPageSampleTags(posts: BlogPost[]): BlogTag[] {
  const tags = new Map<string, BlogTag>();
  for (const post of posts) {
    post.tags.forEach((tag, index) => {
      const existing = tags.get(tag);
      if (existing) existing.count++;
      else
        tags.set(tag, { tag, label: post.tagLabels[index] ?? tag, count: 1 });
    });
  }
  return [...tags.values()].sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, "es"),
  );
}

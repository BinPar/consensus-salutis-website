export type BlogArticle = {
  createdAt: string;
  createdAtLabel: string;
  readTime: string;
  title: string;
  excerpt: string;
  imageLabel: string;
  imageSrc: string;
  href: string;
};

export const blogArticles: BlogArticle[] = [
  {
    createdAt: "2026-02-11",
    createdAtLabel: "11 feb 2026",
    readTime: "6 min de lectura",
    title: "Cómo medir la fiabilidad de una respuesta clínica.",
    excerpt:
      "Criterios de evaluación, preguntas de control y revisión experta para sostener confianza institucional.",
    imageLabel: "Matriz de evaluación",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-02-18",
    createdAtLabel: "18 feb 2026",
    readTime: "5 min de lectura",
    title: "Del documento fuente a la decisión: evidencia visible en cada consulta",
    excerpt:
      "Una capa de consulta clínica debe mostrar el origen de cada conclusión y preservar contexto documental.",
    imageLabel: "Fuente verificable",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-02-26",
    createdAtLabel: "26 feb 2026",
    readTime: "7 min de lectura",
    title: "Gobernar el conocimiento médico en el sector.",
    excerpt:
      "Roles, publicación controlada y validación continua para mantener una base clínica auditable.",
    imageLabel: "Ciclo gobernado",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-03-05",
    createdAtLabel: "5 mar 2026",
    readTime: "4 min de lectura",
    title: "Adopción responsable de IA clínica en organizaciones sanitarias",
    excerpt:
      "Privacidad, despliegue europeo y límites operativos para usar IA sin diluir responsabilidad profesional.",
    imageLabel: "Entorno seguro",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-03-12",
    createdAtLabel: "12 mar 2026",
    readTime: "6 min de lectura",
    title: "Qué debe explicar una IA médica antes de recomendar una acción",
    excerpt:
      "Transparencia, contexto clínico y límites operativos para sostener decisiones revisables.",
    imageLabel: "Explicabilidad clínica",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-03-19",
    createdAtLabel: "19 mar 2026",
    readTime: "5 min de lectura",
    title: "De la guía clínica al flujo asistencial: cerrar la distancia operativa",
    excerpt:
      "Cómo convertir recomendaciones documentales en respuestas útiles dentro del trabajo sanitario diario.",
    imageLabel: "Flujo asistencial",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-03-26",
    createdAtLabel: "26 mar 2026",
    readTime: "8 min de lectura",
    title: "Evaluar respuestas clínicas sin depender solo de benchmarks",
    excerpt:
      "Métodos internos, preguntas de control y revisión experta para medir rendimiento real.",
    imageLabel: "Evaluación continua",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-04-02",
    createdAtLabel: "2 abr 2026",
    readTime: "4 min de lectura",
    title: "Trazabilidad documental como requisito de confianza institucional",
    excerpt:
      "Por qué cada conclusión necesita origen, versión y contexto para ser auditada.",
    imageLabel: "Trazabilidad documental",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-04-09",
    createdAtLabel: "9 abr 2026",
    readTime: "7 min de lectura",
    title: "El papel del equipo clínico en la supervisión de sistemas de IA",
    excerpt:
      "Responsabilidades, revisión de contenidos y criterios de aceptación para operar con seguridad.",
    imageLabel: "Supervisión clínica",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-04-16",
    createdAtLabel: "16 abr 2026",
    readTime: "5 min de lectura",
    title: "Diseñar una base de conocimiento sanitario preparada para cambiar",
    excerpt:
      "Versionado, publicación controlada y mantenimiento continuo para corpus médicos vivos.",
    imageLabel: "Base de conocimiento",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-04-23",
    createdAtLabel: "23 abr 2026",
    readTime: "6 min de lectura",
    title: "Seguridad y privacidad en consultas clínicas asistidas por IA",
    excerpt:
      "Controles técnicos y organizativos para proteger información sensible en entornos sanitarios.",
    imageLabel: "Seguridad sanitaria",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-04-30",
    createdAtLabel: "30 abr 2026",
    readTime: "4 min de lectura",
    title: "Cómo definir preguntas de control para validar conocimiento médico",
    excerpt:
      "Una aproximación práctica para detectar degradación, inconsistencias y pérdida de contexto.",
    imageLabel: "Preguntas de control",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-05-07",
    createdAtLabel: "7 may 2026",
    readTime: "7 min de lectura",
    title: "IA médica institucional: producto, evidencia y gobierno en equilibrio",
    excerpt:
      "Tres dimensiones necesarias para pasar de un piloto atractivo a una capacidad sostenible.",
    imageLabel: "IA institucional",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-05-14",
    createdAtLabel: "14 may 2026",
    readTime: "5 min de lectura",
    title: "Qué exige un despliegue responsable de IA en Atención Primaria",
    excerpt:
      "Criterios de integración, adopción profesional y seguimiento para introducir IA con rigor.",
    imageLabel: "Atención Primaria",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-05-21",
    createdAtLabel: "21 may 2026",
    readTime: "6 min de lectura",
    title: "Métricas útiles para observar una plataforma clínica inteligente",
    excerpt:
      "Uso, calidad percibida, consultas frecuentes y señales de mejora continua para equipos gestores.",
    imageLabel: "Métricas clínicas",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
  {
    createdAt: "2026-05-28",
    createdAtLabel: "28 may 2026",
    readTime: "8 min de lectura",
    title: "Del piloto a producción: decisiones críticas para IA sanitaria",
    excerpt:
      "Infraestructura, soporte, validación y gobierno para escalar sin perder control clínico.",
    imageLabel: "Paso a producción",
    imageSrc: "/img/mockImage.png",
    href: "#",
  },
];

export const latestBlogArticles = [...blogArticles].sort(
  (articleA, articleB) =>
    Date.parse(articleB.createdAt) - Date.parse(articleA.createdAt),
);

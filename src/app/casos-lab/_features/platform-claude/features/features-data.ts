// Listado de funcionalidades facilitado por el usuario (6 de noviembre de 2026).
// Los cinco grupos tienen escenas.

export const evidenceFeatureIds = [
  "citations",
  "bibliography",
  "preserved",
  "viewer",
  "verified",
  "provenance",
  "updates",
] as const;
export type EvidenceFeatureId = (typeof evidenceFeatureIds)[number];

export const consultationFeatureIds = [
  "natural",
  "clarify",
  "followup",
  "committee",
  "modes",
  "progress",
  "images",
] as const;
export type ConsultationFeatureId = (typeof consultationFeatureIds)[number];

export const formatFeatureIds = [
  "schemes",
  "figures",
  "download",
  "tables",
  "textalt",
  "panel",
] as const;
export type FormatFeatureId = (typeof formatFeatureIds)[number];

export const workspaceFeatureIds = [
  "projects",
  "instructions",
  "saved",
  "preferences",
  "private",
  "history",
  "languages",
  "theme",
] as const;
export type WorkspaceFeatureId = (typeof workspaceFeatureIds)[number];

export const governanceFeatureIds = [
  "corpus",
  "library",
  "committees",
  "review",
  "versions",
  "control",
  "rating",
  "brand",
] as const;
export type GovernanceFeatureId = (typeof governanceFeatureIds)[number];

export type FeatureMockId =
  | EvidenceFeatureId
  | ConsultationFeatureId
  | FormatFeatureId
  | WorkspaceFeatureId
  | GovernanceFeatureId;

export type PlatformFeature = {
  number: string;
  title: string;
  description: string;
  /** Second sentence for readers new to the platform. */
  detail?: string;
  mock?: FeatureMockId;
};

export type PlatformFeatureGroup = {
  id: string;
  number: string;
  title: string;
  features: PlatformFeature[];
};

export const platformFeatureGroups: PlatformFeatureGroup[] = [
  {
    id: "evidence",
    number: "01",
    title: "Evidencia visible",
    features: [
      {
        number: "01",
        title: "Citas por afirmación",
        description: "Cada afirmación enlaza con su fuente.",
        detail:
          "Al pulsar el número junto a una frase, se abre el documento que la respalda sin perder de vista la respuesta.",
        mock: "citations",
      },
      {
        number: "02",
        title: "Bibliografía",
        description: "Las fuentes utilizadas, al final de cada respuesta.",
        detail:
          "La lista reúne las guías y manuales citados, para revisar de un vistazo en qué documentos se apoya cada respuesta.",
        mock: "bibliography",
      },
      {
        number: "03",
        title: "Evidencia conservada",
        description:
          "La respuesta guarda lo que citó, aunque el documento se retire.",
        detail:
          "Si una guía se retira o se sustituye, el pasaje citado sigue disponible para revisar en qué se basó aquella respuesta.",
        mock: "preserved",
      },
      {
        number: "04",
        title: "Visor del documento",
        description: "El PDF, en la página citada y con el pasaje resaltado.",
        detail:
          "El documento original se abre en un panel lateral, de modo que el pasaje se lee en su contexto, con lo que lo precede y lo sigue.",
        mock: "viewer",
      },
      {
        number: "05",
        title: "Texto verificado",
        description: "Indica si el pasaje coincide con el PDF original.",
        detail:
          "El texto citado se contrasta con el documento de origen, y un indicador señala si coincide literalmente con lo que dice el PDF.",
        mock: "verified",
      },
      {
        number: "06",
        title: "Procedencia completa",
        description: "Documento, capítulo, apartado y página.",
        detail:
          "Cada cita conserva su ubicación exacta dentro del documento, para localizarla o mencionarla en una sesión clínica o en un informe.",
        mock: "provenance",
      },
      {
        number: "07",
        title: "Avisos de actualización",
        description: "Señala los datos sustituidos por una fuente posterior.",
        detail:
          "Cuando una edición más reciente modifica la información citada, un aviso lo indica junto al pasaje para comprobar su vigencia.",
        mock: "updates",
      },
    ],
  },
  {
    id: "consultation",
    number: "02",
    title: "Consulta clínica",
    features: [
      {
        number: "08",
        title: "Lenguaje natural",
        description: "La duda se plantea como en una sesión clínica.",
        detail:
          "El caso se describe con sus antecedentes, su medicación y lo que preocupa, sin palabras clave ni formularios.",
        mock: "natural",
      },
      {
        number: "09",
        title: "Preguntas de aclaración",
        description: "Si falta un dato decisivo, el comité lo solicita.",
        detail:
          "Cuando la respuesta depende de un valor que no se ha indicado, como el filtrado glomerular, la pregunta llega antes que la respuesta, con opciones para contestar en un clic.",
        mock: "clarify",
      },
      {
        number: "10",
        title: "Seguimiento",
        description: "Las preguntas siguientes conservan el contexto.",
        detail:
          "Una nueva pregunta parte del caso y de las fuentes ya consultadas, sin repetir los datos del paciente.",
        mock: "followup",
      },
      {
        number: "11",
        title: "Comité por especialidad",
        description: "Varios expertos, cada uno con su corpus.",
        detail:
          "Cada especialidad revisa los documentos de su ámbito, y la respuesta reúne y contrasta sus aportaciones.",
        mock: "committee",
      },
      {
        number: "12",
        title: "Modos de respuesta",
        description: "Rapidez o profundidad, en cada pregunta.",
        detail:
          "El modo se elige junto al campo de consulta: una respuesta ágil para una duda concreta o una revisión más exhaustiva para un caso complejo.",
        mock: "modes",
      },
      {
        number: "13",
        title: "Progreso visible",
        description:
          "Expertos, fuentes y páginas consultadas, mientras se responde.",
        detail:
          "Durante la espera se ve qué especialidades trabajan, qué documentos revisan y en qué páginas, antes de leer la respuesta.",
        mock: "progress",
      },
      {
        number: "14",
        title: "Imágenes adjuntas",
        description: "Se pegan, arrastran o adjuntan a la consulta.",
        detail:
          "Un electrocardiograma, una analítica o una lesión fotografiada se incorporan a la pregunta para consultarlos junto al caso.",
        mock: "images",
      },
    ],
  },
  {
    id: "formats",
    number: "03",
    title: "Formatos de respuesta",
    features: [
      {
        number: "15",
        title: "Esquemas clínicos",
        description: "Árboles de decisión y mapas mentales con fuentes.",
        detail:
          "Un árbol de decisión ordena los criterios de la respuesta, y cada esquema indica las fuentes en las que se apoya.",
        mock: "schemes",
      },
      {
        number: "16",
        title: "Figuras del corpus",
        description: "Las figuras de las guías, dentro de la respuesta.",
        detail:
          "Cuando una guía incluye una ilustración pertinente, la figura aparece junto al texto que la explica.",
        mock: "figures",
      },
      {
        number: "17",
        title: "Descarga como imagen",
        description: "Cada esquema se exporta en PNG.",
        detail:
          "El esquema se guarda como imagen para incorporarlo a una sesión clínica, un protocolo o material docente.",
        mock: "download",
      },
      {
        number: "18",
        title: "Tablas comparativas",
        description: "Comparaciones legibles, sin perder las citas.",
        detail:
          "Fármacos, criterios o alternativas se comparan en columnas, y cada fila mantiene la referencia a su documento.",
        mock: "tables",
      },
      {
        number: "19",
        title: "Recorrido en texto",
        description: "Alternativa accesible a cada esquema.",
        detail:
          "Cada esquema puede leerse como una lista de pasos, útil con lectores de pantalla o para copiarlo en un informe.",
        mock: "textalt",
      },
      {
        number: "20",
        title: "Panel lateral",
        description: "Documentos, esquemas e imágenes en pestañas.",
        detail:
          "Las fuentes, los esquemas y las figuras se abren junto a la conversación, sin perder de vista la respuesta.",
        mock: "panel",
      },
    ],
  },
  {
    id: "workspace",
    number: "04",
    title: "Espacio personal",
    features: [
      {
        number: "21",
        title: "Proyectos",
        description: "Conversaciones agrupadas por tema.",
        detail:
          "Las consultas sobre un mismo asunto, como la revisión de un protocolo, se reúnen en un espacio con sus propias instrucciones y fuentes.",
        mock: "projects",
      },
      {
        number: "22",
        title: "Instrucciones comunes",
        description: "Formato, idioma o enfoque para todo un proyecto.",
        detail:
          "Se indica una vez cómo deben presentarse las respuestas del proyecto; las reglas clínicas y las fuentes institucionales mantienen su prioridad.",
        mock: "instructions",
      },
      {
        number: "23",
        title: "Respuestas como fuente",
        description: "Una respuesta se guarda para el resto del proyecto.",
        detail:
          "Una respuesta final se guarda como fuente privada y puede recuperarse desde otras conversaciones del mismo proyecto.",
        mock: "saved",
      },
      {
        number: "24",
        title: "Preferencias de respuesta",
        description: "Extensión, tono y formato, recordados entre chats.",
        detail:
          "Las preferencias quedan registradas y se aplican a todos los chats; ajustan la presentación, no la finalidad ni las reglas clínicas.",
        mock: "preferences",
      },
      {
        number: "25",
        title: "Documentos privados",
        description: "PDF, TXT y Markdown, citables como fuente.",
        detail:
          "Un protocolo del servicio o unas notas propias se añaden al proyecto y se citan como el resto de fuentes, visibles solo para su propietario.",
        mock: "private",
      },
      {
        number: "26",
        title: "Historial ordenado",
        description: "Fijar, renombrar, mover y recorrer por pregunta.",
        detail:
          "Las conversaciones se anclan, se renombran o se mueven a un proyecto, y en las más largas se salta directamente a cada pregunta.",
        mock: "history",
      },
      {
        number: "27",
        title: "Tres idiomas",
        description: "Español, catalán e inglés.",
        detail:
          "La interfaz se presenta en el idioma que elige cada profesional, y el cambio se aplica al momento.",
        mock: "languages",
      },
      {
        number: "28",
        title: "Tema claro y oscuro",
        description: "Lectura cómoda en consulta o de guardia.",
        detail:
          "El modo oscuro reduce el brillo en las guardias nocturnas, y el claro facilita la lectura con la luz de la consulta.",
        mock: "theme",
      },
    ],
  },
  {
    id: "governance",
    number: "05",
    title: "Gobierno institucional",
    features: [
      {
        number: "29",
        title: "Corpus por organización",
        description: "Protocolos propios sobre una base común.",
        detail:
          "Los protocolos del centro se añaden sobre una base común de guías y manuales, y el comité consulta ambos con la misma trazabilidad.",
        mock: "corpus",
      },
      {
        number: "30",
        title: "Biblioteca de documentos",
        description: "Inventario de las guías, con tipo y resumen.",
        detail:
          "Cada documento figura con su tipo, su fecha de aprobación, los expertos a los que alimenta y un resumen de lo que aporta.",
        mock: "library",
      },
      {
        number: "31",
        title: "Comités configurables",
        description: "Expertos y modos definidos por organización.",
        detail:
          "Cada organización elige qué especialidades forman su comité y qué modos de respuesta ofrece a sus profesionales.",
        mock: "committees",
      },
      {
        number: "32",
        title: "Publicación revisada",
        description: "Los cambios se revisan antes de entrar en el corpus.",
        detail:
          "Un documento nuevo o una actualización se revisa y se aprueba antes de publicarse, de modo que nada llega a las respuestas sin control.",
        mock: "review",
      },
      {
        number: "33",
        title: "Versiones del corpus",
        description: "Cada cambio queda registrado y versionado.",
        detail:
          "El corpus conserva su historial: qué cambió, cuándo y en qué documentos, para reconstruir en qué se basó cada respuesta.",
        mock: "versions",
      },
      {
        number: "34",
        title: "Preguntas de control",
        description: "Baterías que detectan si las respuestas se degradan.",
        detail:
          "Una batería de preguntas con respuesta de referencia se repite tras cada cambio y señala las que empeoran respecto a la versión anterior.",
        mock: "control",
      },
      {
        number: "35",
        title: "Valoración profesional",
        description: "Útil o no útil, con comentario para revisión.",
        detail:
          "Cada profesional marca una respuesta como útil o no útil y añade un comentario, que llega al equipo editorial para su revisión.",
        mock: "rating",
      },
      {
        number: "36",
        title: "Marca y dominio propios",
        description: "Acceso con el diseño de la organización.",
        detail:
          "La plataforma se presenta con el logotipo, los colores y el dominio de la organización.",
        mock: "brand",
      },
    ],
  },
];

export const evidenceGroup = platformFeatureGroups[0]!;
export const consultationGroup = platformFeatureGroups[1]!;
export const formatsGroup = platformFeatureGroups[2]!;
export const workspaceGroup = platformFeatureGroups[3]!;
export const governanceGroup = platformFeatureGroups[4]!;

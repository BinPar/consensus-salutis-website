import source from "../_data/team-sol61-source.json";

export const teamSol61Areas = [
  "Dirección",
  "Ingeniería",
  "Análisis",
  "Personas",
] as const;
export type TeamSol61Area = (typeof teamSol61Areas)[number];
export type TeamSol61Member = {
  slug: string;
  name: string;
  role: string;
  originalRole: string;
  joined: string | null;
  sourceUrl: string;
  contactHref: string;
  area: TeamSol61Area;
  portrait: number;
  intro: string;
  paragraphs: string[];
  focus: string;
};

// Professional adaptations of the public biographies in the local source snapshot.
// Conceptual photographs illustrate the prototype; they do not identify these people.
const editorial: Record<
  string,
  { intro: string; paragraphs: string[]; focus: string }
> = {
  "ignacio-ferro": {
    intro: "La ilusión de descubrir lo que podemos construir juntos.",
    paragraphs: [
      "Ignacio mira la trayectoria de BinPar a través de los proyectos en los que el equipo ha ayudado a otras personas y organizaciones.",
      "El crecimiento del equipo y las posibilidades que quedan por descubrir son el centro de su relato. Una forma de entender el futuro desde lo que se construye en compañía.",
    ],
    focus: "Equipo, proyectos y nuevas posibilidades.",
  },
  "cristian-alvarez": {
    intro: "Hacer que personas, procesos y objetivos avancen juntos.",
    paragraphs: [
      "Cristian participa en la definición estratégica de BinPar, buscando el mejor rendimiento y una coordinación eficaz.",
      "Organiza equipos y trabajo, diseña y evalúa procesos y operaciones. También negocia con otras organizaciones para encontrar acuerdos beneficiosos y trabajar como un solo equipo.",
    ],
    focus: "Estrategia, coordinación y operaciones.",
  },
  "marcos-gonzalez": {
    intro: "Entender cada pieza. Encontrar la siguiente posibilidad.",
    paragraphs: [
      "La investigación y la evolución tecnológica acompañan la trayectoria de Marcos en BinPar.",
      "Se ocupa de integrar tecnologías y desarrollar infraestructuras, resolver problemas y mejorar los flujos de datos. Mantenerse al día le permite buscar un mayor rendimiento en cada componente.",
    ],
    focus: "Integración, infraestructura e investigación tecnológica.",
  },
  "isabel-ferro": {
    intro: "Cuidar los recursos que hacen posible seguir avanzando.",
    paragraphs: [
      "Isabel describe su trabajo como un seguimiento constante de los recursos que permiten a BinPar sostener su actividad y alcanzar sus objetivos.",
      "Su atención también está en las personas: que el equipo disponga de lo que necesita y pueda trabajar en un entorno cómodo y seguro.",
    ],
    focus: "Recursos y cuidado del equipo.",
  },
  "alberto-blanco": {
    intro: "Crecer entre la arquitectura y el desarrollo de producto.",
    paragraphs: [
      "Alberto llegó a BinPar para trabajar en proyectos de Unity y después orientó su actividad al desarrollo full stack.",
      "En su biografía destaca la supervisión de Read Garden y un aprendizaje continuo que le permite colaborar tanto en infraestructura como en arquitectura de proyectos.",
    ],
    focus: "Read Garden, infraestructura y arquitectura.",
  },
  "nicolas-arianoutsos": {
    intro: "Acompañar la evolución digital, cuidando lo que ya funciona.",
    paragraphs: [
      "Nicolás dedica su trabajo a los productos y sistemas de Editorial Médica Panamericana.",
      "Conecta sistemas, cuida los productos existentes y nuevos, realiza mantenimiento y ofrece soporte. Su aportación acompaña la transformación digital de la organización.",
    ],
    focus: "Integración, mantenimiento y soporte.",
  },
  "beatriz-ortega": {
    intro: "Mejorar las herramientas con las que otras personas aprenden.",
    paragraphs: [
      "Beatriz trabaja en las plataformas académicas de Editorial Médica Panamericana, dentro del entorno JavaScript.",
      "Su actividad incluye monitorizar las herramientas de enseñanza, resolver incidencias e incorporar mejoras para el aprendizaje. También verifica el funcionamiento de sistemas .NET.",
    ],
    focus: "Plataformas académicas y mejora continua.",
  },
  "carolina-carcamo": {
    intro: "Encontrar talento. Acompañar sus primeros pasos.",
    paragraphs: [
      "Carolina cuenta la historia del equipo para conectar con nuevas personas que puedan incorporarse a BinPar.",
      "Su proceso incluye revisar trabajo técnico, preparar pruebas y entrevistas relacionadas con el entorno del equipo y acompañar de cerca las primeras etapas de cada incorporación.",
    ],
    focus: "Selección y acompañamiento de nuevas incorporaciones.",
  },
  "pablo-emilio": {
    intro: "Crear nuevos componentes y hacer mejores los que ya existen.",
    paragraphs: [
      "Pablo forma parte de un equipo que colabora a distancia. Su trabajo combina el desarrollo de componentes nuevos con la mejora de los existentes.",
      "En su biografía menciona Next.js, Nest.js y Postgres, junto con el interés por seguir explorando nuevas tecnologías.",
    ],
    focus: "Componentes, Next.js, Nest.js y Postgres.",
  },
  "adrian-rodriguez": {
    intro: "Entender lo que necesitas. Cuidar cada detalle al construirlo.",
    paragraphs: [
      "Tras varios años trabajando como autónomo en proyectos diversos, Adrián se incorpora a BinPar como especialista en Front End.",
      "Esa experiencia le ha dado una perspectiva multidisciplinar, capacidad de adaptación y una manera resolutiva de abordar el trabajo.",
      "Su enfoque parte de entender las necesidades del cliente y resolverlas con organización, atención al detalle e implicación en cada proyecto.",
    ],
    focus: "Necesidades del cliente, organización y atención al detalle.",
  },
  "fabian-padilla": {
    intro: "Transformar ideas en realidad y aprender en el proceso.",
    paragraphs: [
      "Fabian se incorpora a BinPar con el propósito de convertir ideas en soluciones, aportar mejoras y apoyar al equipo ante nuevos desafíos.",
      "En su relato destaca la curiosidad por las herramientas del equipo y el interés de sus compañeros por seguir avanzando. Aprender nuevas habilidades es parte central de su motivación.",
    ],
    focus: "Desarrollo, colaboración y aprendizaje.",
  },
  "jeronimo-ekerdt": {
    intro: "La curiosidad como punto de partida para construir.",
    paragraphs: [
      "Jeronimo describe su incorporación a BinPar desde el deseo de descubrir y ampliar sus conocimientos.",
      "Le interesan tanto la actualización de sistemas existentes como la creación de otros nuevos y la colaboración con otros equipos. Su relato pone en primer plano el aprendizaje compartido.",
    ],
    focus: "Sistemas nuevos, evolución y trabajo compartido.",
  },
  "tihomir-nikolaev": {
    intro: "Conectar lo que ves con todo lo que lo hace posible.",
    paragraphs: [
      "Tihomir trabaja entre las interfaces reactivas y la lógica que las sostiene. Sincroniza módulos, despliega rutas y construye sistemas que evolucionan.",
      "La depuración y la escalabilidad forman parte de su visión del desarrollo. En su relato, lo que perdura es aquello que el equipo crea en conjunto.",
    ],
    focus: "Interfaces, lógica y evolución de sistemas.",
  },
  "jimmy-montano": {
    intro: "Aprender sin límites y abrir camino a nuevos retos.",
    paragraphs: [
      "Jimmy presenta su incorporación a BinPar como una oportunidad de aprendizaje y de afrontar nuevos desafíos.",
      "La curiosidad y la exploración de nuevas posibilidades marcan su motivación para contribuir al equipo.",
    ],
    focus: "Curiosidad, aprendizaje y nuevos desafíos.",
  },
  "yaiza-vallejo": {
    intro: "Rigor e imaginación, de la API a la experiencia.",
    paragraphs: [
      "Yaiza llega a BinPar después de varios años trabajando en desarrollo full stack.",
      "Ha participado en proyectos con el stack MERN, APIs y arquitecturas limpias. Aporta esa experiencia junto con la curiosidad por seguir aprendiendo y una combinación de rigor e imaginación.",
    ],
    focus: "MERN, APIs y arquitecturas limpias.",
  },
  "guillermo-hernandez": {
    intro: "Sistemas que resisten. Datos que siguen su curso.",
    paragraphs: [
      "Guillermo trabaja en la construcción de sistemas digitales y la supervisión de sus flujos de datos.",
      "Colabora con el equipo para resolver errores y mantener el funcionamiento de los sistemas. Fuera del teclado, encuentra en el pádel una forma de recargar energía.",
    ],
    focus: "Sistemas digitales y flujos de datos.",
  },
};

export const teamSol61Members: TeamSol61Member[] = source.members.map(
  (member, portrait) => {
    const copy = editorial[member.slug];
    if (!copy) throw new Error(`Missing team biography: ${member.slug}`);
    const area: TeamSol61Area = ["CEO", "COO", "CFO", "CTO"].includes(
      member.role,
    )
      ? "Dirección"
      : member.role.includes("Analyst")
        ? "Análisis"
        : member.role === "Recruiter"
          ? "Personas"
          : "Ingeniería";
    return {
      slug: member.slug,
      name: member.name,
      role:
        member.role === "Tech Ninja"
          ? "Tecnología e infraestructura"
          : member.role,
      originalRole: member.role,
      joined: member.joined,
      sourceUrl: member.sourceUrl,
      contactHref: `https://www.binpar.com/api/card?member=${member.slug}&locale=es`,
      area,
      portrait,
      ...copy,
    };
  },
);

export const teamSol61DefaultMember = "adrian-rodriguez";
export const teamSol61SourceDate = source.retrievedAt;
export function getTeamSol61Member(slug: string | null | undefined) {
  return (
    teamSol61Members.find((member) => member.slug === slug) ??
    teamSol61Members.find((member) => member.slug === teamSol61DefaultMember)!
  );
}
export function teamSol61Joined(member: TeamSol61Member) {
  if (!member.joined) return null;
  return new Intl.DateTimeFormat("es-ES", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(member.joined));
}
export const teamSol61AreaCopy: Record<
  TeamSol61Area,
  { number: string; title: string; description: string; scene: string }
> = {
  Dirección: {
    number: "01",
    title: "Una visión compartida.",
    description:
      "Personas, recursos y decisiones para avanzar con una dirección común.",
    scene: "direction",
  },
  Ingeniería: {
    number: "02",
    title: "Pensar. Construir. Mejorar.",
    description:
      "Interfaces, arquitectura e infraestructura. La atención al detalle, en cada capa.",
    scene: "engineering",
  },
  Análisis: {
    number: "03",
    title: "Comprender para resolver.",
    description:
      "Conectar las necesidades de las personas con la evolución de sus herramientas.",
    scene: "analysis",
  },
  Personas: {
    number: "04",
    title: "El talento también se cuida.",
    description:
      "Encontrar nuevas capacidades y acompañar a quienes se incorporan al equipo.",
    scene: "people",
  },
};

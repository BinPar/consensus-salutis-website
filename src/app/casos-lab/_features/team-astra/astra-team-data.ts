import source from "./_data/astra-team-source.json";

export const teamAreas = [
  "Todas",
  "Dirección",
  "Tecnología",
  "Análisis",
  "Personas",
] as const;
export type TeamArea = (typeof teamAreas)[number];

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  joined: string | null;
  sourceUrl: string;
  area: Exclude<TeamArea, "Todas">;
  portrait: number;
  intro: string;
  paragraphs: string[];
  focus: string;
};

// Editorial adaptations of the public biographies, captured in the adjacent
// source snapshot. Roles and dates are preserved; no credentials are inferred.
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

export const teamMembers: TeamMember[] = source.members.map(
  (member, portrait) => {
    const copy = editorial[member.slug];
    if (!copy) throw new Error(`Missing Team Astra biography: ${member.slug}`);
    const area = ["CEO", "COO", "CFO"].includes(member.role)
      ? "Dirección"
      : member.role.includes("Analyst")
        ? "Análisis"
        : member.role === "Recruiter"
          ? "Personas"
          : "Tecnología";
    return { ...member, ...copy, area, portrait };
  },
);

export function joinedYear(member: TeamMember) {
  return member.joined?.slice(0, 4) ?? null;
}

export function memberHref(direction: string, slug?: string) {
  const params = new URLSearchParams({ lab: "team", teamVariant: direction });
  if (slug) params.set("member", slug);
  return `/casos-lab?${params.toString()}#team-preview`;
}

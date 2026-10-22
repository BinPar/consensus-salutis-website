export type TeamMember = Readonly<{
  slug: string;
  name: string;
  role: string;
}>;

export const teamMembers: readonly TeamMember[] = [
  {
    slug: "ignacio-ferro",
    name: "Ignacio Ferro Picón",
    role: "CEO",
  },
  {
    slug: "cristian-alvarez",
    name: "Cristian Álvarez",
    role: "COO",
  },
  {
    slug: "marcos-gonzalez",
    name: "Marcos González",
    role: "Tech Ninja",
  },
  {
    slug: "isabel-ferro",
    name: "Isabel Ferro",
    role: "CFO",
  },
  {
    slug: "alberto-blanco",
    name: "Alberto Blanco",
    role: "CTO",
  },
  {
    slug: "nicolas-arianoutsos",
    name: "Nicolás Arianoutsos",
    role: "Senior Analyst",
  },
  {
    slug: "beatriz-ortega",
    name: "Beatriz Ortega",
    role: "Analyst",
  },
  {
    slug: "carolina-carcamo",
    name: "Carolina Cárcamo",
    role: "Recruiter",
  },
  {
    slug: "pablo-emilio",
    name: "Pablo Emilio",
    role: "Analyst",
  },
  {
    slug: "adrian-rodriguez",
    name: "Adrián Rodríguez",
    role: "Front End",
  },
  {
    slug: "fabian-padilla",
    name: "Fabian Padilla",
    role: "Full Stack",
  },
  {
    slug: "jeronimo-ekerdt",
    name: "Jeronimo Ekerdt",
    role: "Full Stack",
  },
  {
    slug: "jimmy-montano",
    name: "Jimmy Montaño",
    role: "Full Stack",
  },
  {
    slug: "yaiza-vallejo",
    name: "Yaiza Vallejo",
    role: "Full Stack",
  },
  {
    slug: "guillermo-hernandez",
    name: "Guillermo Hernández",
    role: "Full Stack",
  },
];

const galleryOrder = [
  "ignacio-ferro",
  "cristian-alvarez",
  "marcos-gonzalez",
  "alberto-blanco",
  "isabel-ferro",
  "nicolas-arianoutsos",
  "beatriz-ortega",
  "adrian-rodriguez",
  "carolina-carcamo",
  "pablo-emilio",
  "jeronimo-ekerdt",
  "fabian-padilla",
  "jimmy-montano",
  "yaiza-vallejo",
  "guillermo-hernandez",
];

export const galleryMembers = galleryOrder.map((slug) => {
  const member = teamMembers.find((person) => person.slug === slug);
  if (!member) throw new Error(`Unknown team member: ${slug}`);
  return member;
});

export const teamCeo = teamMembers.find(
  (person) => person.slug === "ignacio-ferro",
)!;

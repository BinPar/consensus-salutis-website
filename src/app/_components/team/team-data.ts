export type TeamMember = Readonly<{
  slug: string;
  name: string;
  role: string;
}>;

export const teamMembers: readonly TeamMember[] = [
  {
    slug: "ignacio-ferro",
    name: "Ignacio Ferro",
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
    role: "Chief Architect",
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
    role: "Full-Stack Developer",
  },
  {
    slug: "beatriz-ortega",
    name: "Beatriz Ortega",
    role: "Full-Stack Developer",
  },
  {
    slug: "carolina-carcamo",
    name: "Carolina Cárcamo",
    role: "Recruiter",
  },
  {
    slug: "pablo-emilio",
    name: "Pablo Emilio Pupo",
    role: "Full-Stack Developer",
  },
  {
    slug: "adrian-rodriguez",
    name: "Adrián Rodríguez",
    role: "Design Lead",
  },
  {
    slug: "fabian-padilla",
    name: "Fabián Padilla",
    role: "Full-Stack Developer",
  },
  {
    slug: "jeronimo-ekerdt",
    name: "Jerónimo Ekerdt",
    role: "Full-Stack Developer",
  },
  {
    slug: "jimmy-montano",
    name: "Jimmy Montaño",
    role: "Full-Stack Developer",
  },
  {
    slug: "yaiza-vallejo",
    name: "Yaiza Vallejo",
    role: "Product Lead",
  },
  {
    slug: "guillermo-hernandez",
    name: "Guillermo Hernández",
    role: "Full-Stack Developer",
  },
];

const galleryOrder = [
  "ignacio-ferro",
  "cristian-alvarez",
  "marcos-gonzalez",
  "alberto-blanco",
  "isabel-ferro",
  "yaiza-vallejo",
  "guillermo-hernandez",
  "adrian-rodriguez",
  "fabian-padilla",
  "jimmy-montano",
  "beatriz-ortega",
  "pablo-emilio",
  "jeronimo-ekerdt",
  "carolina-carcamo",
  "nicolas-arianoutsos",
];

export const galleryMembers = galleryOrder.map((slug) => {
  const member = teamMembers.find((person) => person.slug === slug);
  if (!member) throw new Error(`Unknown team member: ${slug}`);
  return member;
});

export const teamCeo = teamMembers.find(
  (person) => person.slug === "ignacio-ferro",
)!;

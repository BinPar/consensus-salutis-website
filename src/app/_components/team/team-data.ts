// El cargo de cada persona está en `messages/<idioma>/team.json`
// (`members.<slug>.role`); aquí solo quedan el slug y el nombre propio.
const members = [
  {
    slug: "ignacio-ferro",
    name: "Ignacio Ferro",
  },
  {
    slug: "cristian-alvarez",
    name: "Cristian Álvarez",
  },
  {
    slug: "marcos-gonzalez",
    name: "Marcos González",
  },
  {
    slug: "isabel-ferro",
    name: "Isabel Ferro",
  },
  {
    slug: "alberto-blanco",
    name: "Alberto Blanco",
  },
  {
    slug: "nicolas-arianoutsos",
    name: "Nicolás Arianoutsos",
  },
  {
    slug: "beatriz-ortega",
    name: "Beatriz Ortega",
  },
  {
    slug: "carolina-carcamo",
    name: "Carolina Cárcamo",
  },
  {
    slug: "pablo-emilio",
    name: "Pablo Emilio Pupo",
  },
  {
    slug: "adrian-rodriguez",
    name: "Adrián Rodríguez",
  },
  {
    slug: "fabian-padilla",
    name: "Fabián Padilla",
  },
  {
    slug: "jeronimo-ekerdt",
    name: "Jerónimo Ekerdt",
  },
  {
    slug: "jimmy-montano",
    name: "Jimmy Montaño",
  },
  {
    slug: "yaiza-vallejo",
    name: "Yaiza Vallejo",
  },
  {
    slug: "guillermo-hernandez",
    name: "Guillermo Hernández",
  },
] as const;

export type TeamMemberSlug = (typeof members)[number]["slug"];

export type TeamMember = Readonly<{
  slug: TeamMemberSlug;
  name: string;
}>;

export const teamMembers: readonly TeamMember[] = members;

const galleryOrder: readonly TeamMemberSlug[] = [
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

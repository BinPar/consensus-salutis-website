import Image from "next/image";
import type { TeamMember } from "./team-data";

const framing: Readonly<Record<string, string>> = {
  "cristian-alvarez": "[transform:scale(1.12)] origin-[50%_24%]",
  "marcos-gonzalez": "[transform:scale(1.22)] origin-[50%_24%]",
  "jeronimo-ekerdt": "[transform:scale(1.22)] origin-[50%_25%]",
  "yaiza-vallejo": "[transform:scale(1.15)] origin-[50%_42%]",
  "carolina-carcamo": "[transform:scale(1.08)] origin-[50%_15%]",
};

export function TeamPortrait({
  person,
  sizes = "(max-width: 639px) 50vw, (max-width: 1023px) 33vw, 400px",
  priority = false,
  decorative = false,
  orbit = false,
}: {
  person: TeamMember;
  sizes?: string;
  priority?: boolean;
  decorative?: boolean;
  orbit?: boolean;
}) {
  return (
    <Image
      src={`/images/team/${person.slug}.jpg`}
      alt={decorative ? "" : person.name}
      width={1254}
      height={1254}
      priority={priority}
      sizes={sizes}
      data-team-portrait={person.slug}
      className={`absolute inset-0 h-full w-full object-cover saturate-75 ${framing[person.slug] ?? ""} ${orbit && person.slug === "fabian-padilla" ? "origin-[50%_30%] [transform:scale(1.08)]" : ""}`}
    />
  );
}

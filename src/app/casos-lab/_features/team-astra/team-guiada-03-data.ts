import { teamMembers } from "./astra-team-data";

export const guided03Members = teamMembers.filter(
  (member) => member.slug !== "tihomir-nikolaev",
);

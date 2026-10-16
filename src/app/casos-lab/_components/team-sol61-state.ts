import {
  teamSol61Directions,
  type TeamSol61Direction,
} from "./team-sol61-directions";
import { getTeamSol61Member, teamSol61DefaultMember } from "./team-sol61-data";

export type TeamSol61View = "team" | "profile";
export type TeamSol61State = {
  direction: TeamSol61Direction;
  view: TeamSol61View;
  member: string;
};

export function parseTeamSol61State(params: URLSearchParams): TeamSol61State {
  return {
    direction:
      teamSol61Directions.find(
        (item) => item.id === params.get("teamSol61Variant"),
      )?.id ?? "editorial",
    view: params.get("teamSol61View") === "profile" ? "profile" : "team",
    member: getTeamSol61Member(params.get("teamSol61Member")).slug,
  };
}

export function teamSol61Url(url: URL, patch: Partial<TeamSol61State>) {
  const next = new URL(url);
  const state = { ...parseTeamSol61State(next.searchParams), ...patch };
  next.searchParams.set("lab", "team-sol6-1");
  next.searchParams.set("teamSol61Variant", state.direction);
  next.searchParams.set("teamSol61View", state.view);
  next.searchParams.set(
    "teamSol61Member",
    getTeamSol61Member(state.member).slug,
  );
  next.hash = "team-sol6-1-preview";
  return next;
}

export function teamSol61Href(
  direction: TeamSol61Direction,
  view: TeamSol61View,
  member = teamSol61DefaultMember,
) {
  const url = teamSol61Url(new URL("https://lab.local/casos-lab"), {
    direction,
    view,
    member,
  });
  return `${url.pathname}${url.search}${url.hash}`;
}

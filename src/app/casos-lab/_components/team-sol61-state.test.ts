import { describe, expect, it } from "vitest";
import { teamSol61Members } from "./team-sol61-data";
import { teamSol61Directions } from "./team-sol61-directions";
import {
  parseTeamSol61State,
  teamSol61Href,
  teamSol61Url,
} from "./team-sol61-state";

describe("Team sol6.1 navigation", () => {
  it("opens a stable default and keeps old Base links usable", () => {
    for (const variant of [undefined, "base", "missing"]) {
      const params = new URLSearchParams();
      if (variant) params.set("teamSol61Variant", variant);
      expect(parseTeamSol61State(params)).toEqual({
        direction: "editorial",
        view: "team",
        member: "adrian-rodriguez",
      });
    }
  });

  it("falls back safely for an unavailable person or view", () => {
    expect(
      parseTeamSol61State(
        new URLSearchParams({
          teamSol61Variant: "focus",
          teamSol61View: "unknown",
          teamSol61Member: "not-a-member",
        }),
      ),
    ).toEqual({ direction: "focus", view: "team", member: "adrian-rodriguez" });
  });

  it("can link directly to every person in each of the ten designs", () => {
    for (const { id: direction } of teamSol61Directions) {
      for (const view of ["team", "profile"] as const) {
        for (const { slug: member } of teamSol61Members) {
          const url = new URL(
            teamSol61Href(direction, view, member),
            "https://example.com",
          );
          expect(parseTeamSol61State(url.searchParams)).toEqual({
            direction,
            view,
            member,
          });
          expect(url.searchParams.get("lab")).toBe("team-sol6-1");
          expect(url.hash).toBe("#team-sol6-1-preview");
        }
      }
    }
  });

  it("preserves the selected person when changing design", () => {
    const original = new URL(
      "https://example.com/casos-lab?lab=team-sol6-1&teamSol61View=profile&teamSol61Member=yaiza-vallejo&teamVariant=base",
    );
    const next = teamSol61Url(original, { direction: "weave" });
    expect(parseTeamSol61State(next.searchParams)).toEqual({
      direction: "weave",
      view: "profile",
      member: "yaiza-vallejo",
    });
    expect(next.searchParams.get("teamVariant")).toBe("base");
    expect(original.searchParams.has("teamSol61Variant")).toBe(false);
  });

  it("returns to the directory without losing the selected person", () => {
    const original = new URL(
      "https://example.com/casos-lab?teamSol61Variant=index&teamSol61View=profile&teamSol61Member=carolina-carcamo",
    );
    expect(
      parseTeamSol61State(
        teamSol61Url(original, { view: "team" }).searchParams,
      ),
    ).toEqual({ direction: "index", view: "team", member: "carolina-carcamo" });
  });

  it("includes sixteen unique, fully linked biographies from BinPar", () => {
    expect(teamSol61Members).toHaveLength(16);
    expect(new Set(teamSol61Members.map((member) => member.slug)).size).toBe(
      16,
    );
    for (const member of teamSol61Members) {
      expect(member.paragraphs.length).toBeGreaterThan(0);
      expect(member.sourceUrl).toBe(
        `https://www.binpar.com/team/${member.slug}`,
      );
      expect(new URL(member.contactHref).searchParams.get("member")).toBe(
        member.slug,
      );
    }
  });
});

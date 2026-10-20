import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  galleryMembers,
  teamCeo,
  teamMembers,
} from "~/app/_components/team/team-data";

const root = process.cwd();
const components = path.join(root, "src/app/_components/team");

describe("production team page", () => {
  it("has an independent photograph for every published member", () => {
    expect(new Set(teamMembers.map((member) => member.slug)).size).toBe(
      teamMembers.length,
    );
    expect(teamCeo.slug).toBe("ignacio-ferro");
    expect(galleryMembers.map((member) => member.slug).sort()).toEqual(
      teamMembers.map((member) => member.slug).sort(),
    );
    for (const member of teamMembers) {
      const image = fs.readFileSync(
        path.join(root, "public/images/team", `${member.slug}.jpg`),
      );
      expect(image.subarray(0, 3).toString("hex"), member.slug).toBe("ffd8ff");
    }
  });

  it("does not depend on laboratory code, assets or component stylesheets", () => {
    const files = fs.readdirSync(components);
    expect(files.some((file) => file.endsWith(".css"))).toBe(false);
    for (const file of files) {
      const source = fs.readFileSync(path.join(components, file), "utf8");
      expect(source, file).not.toMatch(
        /casos-lab|\/lab\/|data-visual-lab|lab-toolbar|\.css["']/,
      );
      expect(source, file).not.toMatch(/<style\b|@apply\b/);
    }
  });
});

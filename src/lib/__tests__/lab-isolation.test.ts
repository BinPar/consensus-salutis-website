import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import postcss from "postcss";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const source = path.join(root, "src");
const lab = path.join(source, "app/casos-lab");
const self = path.join(source, "lib/__tests__/lab-isolation.test.ts");
const marker = ":where([data-visual-lab])";
const inside = (file: string, directory: string) =>
  file === directory || file.startsWith(`${directory}${path.sep}`);

function walk(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const files = walk(source);
const sourceFiles = files.filter((file) => /\.[cm]?[jt]sx?$/.test(file));
const labFiles = files.filter(
  (file) =>
    inside(file, lab) && !file.includes(`${path.sep}_review${path.sep}`),
);
const config = ts.readConfigFile(path.join(root, "tsconfig.json"), (file) =>
  ts.sys.readFile(file),
);
const options = ts.parseJsonConfigFileContent(
  config.config,
  ts.sys,
  root,
).options;

function dependencyViolations(file: string, text: string) {
  const violations: string[] = [];
  const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  function check(expression: ts.Expression) {
    const spec = ts.isStringLiteralLike(expression)
      ? expression.text
      : undefined;
    const resolved = spec
      ? ts.resolveModuleName(spec, file, options, ts.sys).resolvedModule
          ?.resolvedFileName
      : undefined;
    if (
      (resolved && inside(resolved, lab)) ||
      /(?:^|\/)casos-lab(?:\/|["'`]|$)/.test(spec ?? expression.getText(ast))
    ) {
      violations.push(
        `${path.relative(root, file)}: ${spec ?? expression.getText(ast)}`,
      );
    }
  }
  function visit(node: ts.Node) {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier
    )
      check(node.moduleSpecifier);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) &&
          node.expression.text === "require")) &&
      node.arguments[0]
    )
      check(node.arguments[0]);
    if (
      ts.isImportTypeNode(node) &&
      ts.isLiteralTypeNode(node.argument) &&
      ts.isStringLiteral(node.argument.literal)
    )
      check(node.argument.literal);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  return violations;
}

function cssViolations(css: string) {
  const violations: string[] = [];
  const parsed = postcss.parse(css.replace(/\$\{[^}]+\}/g, "1"));
  parsed.walkRules((rule) => {
    let parent: typeof rule.parent | postcss.Document = rule.parent;
    while (parent) {
      if (parent.type === "atrule" && parent.name.endsWith("keyframes")) return;
      parent = parent.parent;
    }
    for (const selector of rule.selectors)
      if (!selector.replace(/\s+/g, " ").startsWith(`${marker} `))
        violations.push(selector);
  });
  parsed.walkAtRules(/keyframes$/, (rule) => {
    if (!rule.params.startsWith("visual-lab-"))
      violations.push(`@keyframes ${rule.params}`);
  });
  return violations;
}

// These checks live outside the laboratory and also pass after its removal.
describe("laboratory boundary", () => {
  it("keeps production independent of experimental imports, re-exports and dynamic imports", () => {
    const violations = sourceFiles
      .filter((file) => !inside(file, lab))
      .flatMap((file) =>
        dependencyViolations(file, fs.readFileSync(file, "utf8")),
      );
    expect(violations).toEqual([]);
  });

  it.each([
    'import { Demo } from "~/app/casos-lab/page";',
    'export { Demo } from "../casos-lab/page";',
    'const demo = import("~/app/casos-lab/page");',
    'const demo = require("../casos-lab/page");',
    'type Demo = import("~/app/casos-lab/page").Demo;',
  ])("rejects a reverse dependency: %s", (text) => {
    expect(
      dependencyViolations(
        path.join(source, "app/_components/example.tsx"),
        text,
      ),
    ).toHaveLength(1);
  });

  it("permits the laboratory to consume ordinary shared modules", () => {
    expect(
      dependencyViolations(
        path.join(source, "app/_components/example.tsx"),
        'import { ThemeToggle } from "~/app/_components/theme-toggle";',
      ),
    ).toEqual([]);
  });

  it("keeps laboratory assets out of production source and styles", () => {
    const violations = files
      .filter(
        (file) =>
          !inside(file, lab) &&
          file !== self &&
          /\.(?:tsx?|jsx?|css|json|mdx)$/.test(file),
      )
      .filter((file) =>
        /["'`(]\/lab\/|\/img\/team-astra\//.test(fs.readFileSync(file, "utf8")),
      );
    expect(violations.map((file) => path.relative(root, file))).toEqual([]);
  });

  it("scopes every experimental CSS selector, including inline global styles", () => {
    const violations: string[] = [];
    for (const file of labFiles) {
      const text = fs.readFileSync(file, "utf8");
      const sheets = file.endsWith(".css")
        ? [text]
        : [
            ...text.matchAll(/<style jsx global>\{`([\s\S]*?)`\}<\/style>/g),
          ].map((match) => match[1]!);
      for (const css of sheets)
        violations.push(
          ...cssViolations(css).map(
            (violation) => `${path.relative(root, file)}: ${violation}`,
          ),
        );
    }
    expect(violations).toEqual([]);
  });

  it("detects a global selector or unnamespaced animation without rejecting keyframe steps", () => {
    expect(cssViolations(".home-cover { color: red }")).toEqual([
      ".home-cover",
    ]);
    expect(
      cssViolations(
        "@keyframes pulse { from { opacity: 0 } to { opacity: 1 } }",
      ),
    ).toEqual(["@keyframes pulse"]);
    expect(
      cssViolations(
        `${marker} :is(.dark .demo) { color: white } @keyframes visual-lab-pulse { to { opacity: 1 } }`,
      ),
    ).toEqual([]);
  });

  it("does not embed the real submitting form or panel in the laboratory", () => {
    const violations: string[] = [];
    for (const file of labFiles.filter((file) => /\.tsx?$/.test(file))) {
      const text = fs.readFileSync(file, "utf8");
      if (
        /from\s+["']~\/app\/_components\/contact-form["']/.test(text) ||
        /<ContactPanel\b/.test(text) ||
        /\bfetch\s*\(/.test(text)
      )
        violations.push(path.relative(root, file));
    }
    expect(violations).toEqual([]);
  });

  it("keeps experimental assets and review material inside their removal roots", () => {
    expect(fs.existsSync(path.join(root, "public/img/team-astra"))).toBe(false);
    expect(fs.existsSync(path.join(root, "design/team-astra"))).toBe(false);
    expect(fs.existsSync(path.join(root, "design/team-sol61"))).toBe(false);
  });
});

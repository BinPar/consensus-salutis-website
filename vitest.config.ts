import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    // Las primitivas de #2 son código de servidor: `node:crypto`, sin DOM.
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

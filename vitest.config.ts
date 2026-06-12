import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/sim/**", "src/content/**"],
      thresholds: { lines: 90, functions: 90, branches: 70 },
      reporter: ["text", "json-summary"],
    },
    testTimeout: 120_000,
  },
});

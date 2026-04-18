import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Default is node (most code here is server-side).
    // React component tests opt in via `// @vitest-environment jsdom` at the top.
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    css: false,
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/.next/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});

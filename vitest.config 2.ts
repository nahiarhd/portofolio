import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    // Tests must pass on a clean clone with no database, so CI is green from
    // the first commit. Anything needing Postgres belongs in e2e.
    include: ["src/**/*.test.{ts,tsx}"],
  },
});

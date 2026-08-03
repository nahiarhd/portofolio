import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: migrations read the connection string from here, not from the
// datasource block in schema.prisma.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});

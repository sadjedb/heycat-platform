import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/*
 * Prisma 7 reads the connection URL here rather than from schema.prisma, and it
 * does not load .env on its own — hence the dotenv import above. The runtime
 * client is built separately in src/lib/db.ts against the same URL.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "node --experimental-strip-types prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

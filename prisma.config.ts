import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DIRECT_URL for local migrations (bypasses pooler), fallback to DATABASE_URL on Vercel
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});

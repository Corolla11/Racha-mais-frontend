import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("postgresql://postgres:10332007mi@localhost:5432/racha_mais"),
    shadowDatabaseUrl: env(
      "postgresql://postgres:10332007mi@localhost:5432/racha_mais_shadow",
    ),
  },
});

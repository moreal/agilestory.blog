import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql", // 'mysql' | 'sqlite' | 'turso'
  schema: "./shared/schema.ts",
  dbCredentials: {
    url: Deno.env.get("DATABASE_URL") ?? "",
  },
});

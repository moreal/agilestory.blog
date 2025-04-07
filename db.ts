import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";
import postgresJs from "postgres";
import { neon } from "@neon/serverless";
import "@std/dotenv/load";

const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (DATABASE_URL == null) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

function determineDatabase(databaseUrl: string) {
  const DATABASE_DRIVER = Deno.env.get("DATABASE_DRIVER");
  if (DATABASE_DRIVER === "neon-http") {
    return drizzleNeonHttp({
      schema,
      client: neon(databaseUrl),
    });
  }

  return drizzlePostgresJs({
    schema,
    client: postgresJs(databaseUrl),
  });
}

export const db = determineDatabase(DATABASE_URL);
export type Database = typeof db;

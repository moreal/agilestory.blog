import { drizzle as drizzlePostgresJs } from "drizzle-orm/postgres-js";
import { drizzle as drizzleNeonHttp } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";
import postgresJs from "postgres";
import { neon } from "@neondatabase/serverless";
import "@std/dotenv/load";

// Interface for DatabaseDriver implementations
export interface DatabaseDriverFactory {
  createConnection(
    url: string,
  ): ReturnType<typeof drizzlePostgresJs> | ReturnType<typeof drizzleNeonHttp>;
}

// Implementation for PostgresJS driver
class PostgresJsDriverFactory implements DatabaseDriverFactory {
  createConnection(url: string) {
    return drizzlePostgresJs({
      schema,
      client: postgresJs(url),
    });
  }
}

// Implementation for Neon HTTP driver
class NeonHttpDriverFactory implements DatabaseDriverFactory {
  createConnection(url: string) {
    return drizzleNeonHttp({
      schema,
      client: neon(url),
    });
  }
}

// Registry of available database drivers
const driverRegistry: Record<string, DatabaseDriverFactory> = {
  "postgres-js": new PostgresJsDriverFactory(),
  "neon-http": new NeonHttpDriverFactory(),
};

/**
 * Get the appropriate database driver based on environment configuration
 * To add a new driver, just register it in the driverRegistry
 */
function getDatabaseDriver(): DatabaseDriverFactory {
  const DATABASE_DRIVER = Deno.env.get("DATABASE_DRIVER") || "postgres-js";
  const driver = driverRegistry[DATABASE_DRIVER];

  if (!driver) {
    throw new Error(
      `Unsupported database driver: ${DATABASE_DRIVER}. Available drivers: ${
        Object.keys(driverRegistry).join(", ")
      }`,
    );
  }

  return driver;
}

// Get the database URL from environment variables
const DATABASE_URL = Deno.env.get("DATABASE_URL");
if (DATABASE_URL == null) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

// Initialize the database connection
export const db = getDatabaseDriver().createConnection(DATABASE_URL);
export type Database = typeof db;

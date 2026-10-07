import { getDatabase, MissingDatabaseConnectionError } from "@netlify/database";
import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "./schema.js";

function createDatabase() {
  let client: ReturnType<typeof getDatabase>;
  try {
    client = getDatabase();
  } catch (error) {
    if (!(error instanceof MissingDatabaseConnectionError)) throw error;
    client = getDatabase({
      connectionString:
        process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL,
    });
  }
  return drizzle({ client, schema });
}

let database: ReturnType<typeof createDatabase> | undefined;

export function getDb() {
  return (database ??= createDatabase());
}

export { schema };

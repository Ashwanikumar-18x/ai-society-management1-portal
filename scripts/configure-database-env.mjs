import {
  getConnectionString,
  MissingDatabaseConnectionError,
} from "@netlify/database";

export function configureDatabaseEnvironment(env, platformDatabaseUrl) {
  const databaseUrl =
    platformDatabaseUrl?.trim() ||
    env.NETLIFY_DB_URL?.trim() ||
    env.NETLIFY_DATABASE_URL?.trim() ||
    env.DATABASE_URL?.trim();
  if (databaseUrl) env.DATABASE_URL = databaseUrl;
}

let platformDatabaseUrl;
try {
  platformDatabaseUrl = getConnectionString();
} catch (error) {
  if (!(error instanceof MissingDatabaseConnectionError)) throw error;
}

configureDatabaseEnvironment(process.env, platformDatabaseUrl);

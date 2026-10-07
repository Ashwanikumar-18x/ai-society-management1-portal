import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./netlify/database/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.NETLIFY_DATABASE_URL_UNPOOLED ||
      process.env.DATABASE_URL_UNPOOLED ||
      process.env.NETLIFY_DB_URL ||
      process.env.NETLIFY_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "",
  },
});

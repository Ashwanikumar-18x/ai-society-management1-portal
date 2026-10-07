import { describe, expect, it } from "vitest";
import { configureDatabaseEnvironment } from "./configure-database-env.mjs";

describe("framework database compatibility", () => {
  it("uses the SDK runtime connection when it is supplied", () => {
    const env = { DATABASE_URL: "postgresql://database.example.invalid/legacy" };
    configureDatabaseEnvironment(
      env,
      "postgresql://database.example.invalid/runtime",
    );
    expect(env.DATABASE_URL).toBe("postgresql://database.example.invalid/runtime");
  });

  it("aliases the platform database for framework connections", () => {
    const env = {
      NETLIFY_DB_URL: "postgresql://database.example.invalid/preview",
      NETLIFY_DATABASE_URL: "postgresql://database.example.invalid/legacy",
      DATABASE_URL: "postgresql://database.example.invalid/production",
    };
    configureDatabaseEnvironment(env);
    expect(env.DATABASE_URL).toBe(env.NETLIFY_DB_URL);
  });

  it("supports the legacy Netlify database alias", () => {
    const env: Record<string, string> = {
      NETLIFY_DATABASE_URL: "postgresql://database.example.invalid/app",
    };
    configureDatabaseEnvironment(env);
    expect(env.DATABASE_URL).toBe(env.NETLIFY_DATABASE_URL);
  });

  it("leaves local development and explicit database URLs unchanged", () => {
    const env = { DATABASE_URL: "pglite:./data/pglite" };
    configureDatabaseEnvironment(env);
    expect(env.DATABASE_URL).toBe("pglite:./data/pglite");
    const emptyEnv = {};
    configureDatabaseEnvironment(emptyEnv);
    expect(emptyEnv).toEqual({});
  });
});

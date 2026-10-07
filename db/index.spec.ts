import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MissingDatabaseConnectionError } from "@netlify/database";

const mocks = vi.hoisted(() => ({
  getDatabase: vi.fn(),
  drizzle: vi.fn(),
}));

vi.mock("@netlify/database", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@netlify/database")>()),
  getDatabase: mocks.getDatabase,
}));
vi.mock("drizzle-orm/netlify-db", () => ({ drizzle: mocks.drizzle }));

describe("managed database client", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();
  });

  afterEach(() => vi.unstubAllEnvs());

  it("opens no connection on import and reuses the initialized client", async () => {
    const client = {};
    const database = {};
    mocks.getDatabase.mockReturnValue(client);
    mocks.drizzle.mockReturnValue(database);
    const { getDb } = await import("./index.js");
    expect(mocks.getDatabase).not.toHaveBeenCalled();
    expect(getDb()).toBe(database);
    expect(getDb()).toBe(database);
    expect(mocks.getDatabase).toHaveBeenCalledExactlyOnceWith();
    expect(mocks.drizzle).toHaveBeenCalledExactlyOnceWith({
      client,
      schema: expect.any(Object),
    });
  });

  it("falls back to legacy URLs only when the SDK connection is missing", async () => {
    vi.stubEnv("NETLIFY_DATABASE_URL", "postgresql://database.example.invalid/app");
    mocks.getDatabase
      .mockImplementationOnce(() => {
        throw new MissingDatabaseConnectionError();
      })
      .mockReturnValueOnce({});
    const { getDb } = await import("./index.js");
    getDb();
    expect(mocks.getDatabase).toHaveBeenNthCalledWith(2, {
      connectionString: "postgresql://database.example.invalid/app",
    });
  });

  it("does not hide SDK failures behind a fallback database", async () => {
    mocks.getDatabase.mockImplementation(() => {
      throw new Error("Database unavailable");
    });
    const { getDb } = await import("./index.js");
    expect(getDb).toThrow("Database unavailable");
    expect(mocks.getDatabase).toHaveBeenCalledTimes(1);
  });
});

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  deploymentConfigurationErrors,
  deploymentConfigurationReport,
} from "./check-deployment-env.mjs";

const configuredEnvironment = {
  BETTER_AUTH_SECRET: "<placeholder-auth-secret-not-a-real-secret>",
  NETLIFY_DATABASE_URL: "postgresql://database.example.invalid/app",
};

describe("deployment configuration", () => {
  it("reports both missing settings", () => {
    const errors = deploymentConfigurationErrors({});
    expect(errors).toHaveLength(2);
    expect(errors.join("\n")).toContain("BETTER_AUTH_SECRET");
    expect(errors.join("\n")).toContain("NETLIFY_DATABASE_URL");
  });

  it("accepts the managed Netlify database URL", () => {
    expect(deploymentConfigurationErrors(configuredEnvironment)).toEqual([]);
    expect(
      deploymentConfigurationErrors({
        BETTER_AUTH_SECRET: configuredEnvironment.BETTER_AUTH_SECRET,
        NETLIFY_DB_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      }),
    ).toEqual([]);
  });

  it("accepts DATABASE_URL as a fallback", () => {
    expect(
      deploymentConfigurationErrors({
        BETTER_AUTH_SECRET: configuredEnvironment.BETTER_AUTH_SECRET,
        DATABASE_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      }),
    ).toEqual([]);
  });

  it("rejects short authentication secrets", () => {
    expect(
      deploymentConfigurationErrors({
        ...configuredEnvironment,
        BETTER_AUTH_SECRET: "<placeholder>",
      }),
    ).toHaveLength(1);
  });

  it.each([
    "pglite:./data/pglite",
    "unset",
    "<masked-connection-string>",
    "https://database.example.invalid/app",
    "postgresql://localhost/app",
    "postgresql://127.0.0.1/app",
    "postgresql://[::1]/app",
  ])("rejects an unusable production database: %s", (databaseUrl) => {
    expect(
      deploymentConfigurationErrors({
        ...configuredEnvironment,
        NETLIFY_DATABASE_URL: databaseUrl,
      }),
    ).toHaveLength(1);
  });

  it("validates the Netlify URL that the build command prioritizes", () => {
    expect(
      deploymentConfigurationErrors({
        ...configuredEnvironment,
        NETLIFY_DATABASE_URL: "<masked-connection-string>",
        DATABASE_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      }),
    ).toHaveLength(1);
    expect(
      deploymentConfigurationErrors({
        ...configuredEnvironment,
        NETLIFY_DB_URL: "<masked-connection-string>",
      }),
    ).toHaveLength(1);
  });

  it("does not include configured values in error messages", () => {
    const errors = deploymentConfigurationErrors({
      BETTER_AUTH_SECRET: "<placeholder>",
      NETLIFY_DATABASE_URL: "<masked-connection-string>",
    });
    expect(errors.join("\n")).not.toContain("<placeholder>");
    expect(errors.join("\n")).not.toContain("<masked-connection-string>");
  });
});

describe("deployment context validation", () => {
  it.each(["deploy-preview", "branch-deploy"])(
    "warns instead of blocking %s when only the auth secret is missing",
    (context) => {
      const report = deploymentConfigurationReport({
        CONTEXT: context,
        NODE_ENV: "production",
        NETLIFY_DB_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      });
      expect(report.errors).toEqual([]);
      expect(report.warnings).toHaveLength(1);
      expect(report.warnings[0]).toContain("BETTER_AUTH_SECRET");
    },
  );

  it.each(["production", "dev", undefined])(
    "keeps authentication mandatory for context %s",
    (context) => {
      const report = deploymentConfigurationReport({
        CONTEXT: context,
        NETLIFY_DB_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      });
      expect(report.errors).toHaveLength(1);
      expect(report.warnings).toEqual([]);
    },
  );

  it("keeps persistent database validation mandatory in previews", () => {
    const report = deploymentConfigurationReport({ CONTEXT: "deploy-preview" });
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0]).toContain("persistent PostgreSQL");
    expect(report.warnings).toHaveLength(1);
  });

  it("does not allow a weak configured secret in previews", () => {
    const report = deploymentConfigurationReport({
      ...configuredEnvironment,
      CONTEXT: "deploy-preview",
      BETTER_AUTH_SECRET: "<placeholder>",
    });
    expect(report.errors).toHaveLength(1);
    expect(report.warnings).toEqual([]);
  });

  it("forces strict validation for release migrations even in a preview context", () => {
    const report = deploymentConfigurationReport(
      {
        CONTEXT: "deploy-preview",
        NETLIFY_DB_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
      },
      { production: true },
    );
    expect(report.errors).toHaveLength(1);
    expect(report.warnings).toEqual([]);
  });

  it.each([
    { context: "deploy-preview", args: [], expectedStatus: 0 },
    { context: "branch-deploy", args: [], expectedStatus: 0 },
    { context: "production", args: [], expectedStatus: 1 },
    { context: "deploy-preview", args: ["--production"], expectedStatus: 1 },
  ])("returns the correct CLI status for $context with $args", ({ context, args, expectedStatus }) => {
    const result = spawnSync(
      process.execPath,
      [fileURLToPath(new URL("./check-deployment-env.mjs", import.meta.url)), ...args],
      {
        env: {
          CONTEXT: context,
          NODE_ENV: "production",
          NETLIFY_DB_URL: configuredEnvironment.NETLIFY_DATABASE_URL,
        },
        encoding: "utf8",
      },
    );
    expect(result.status).toBe(expectedStatus);
    expect(result.stderr).toContain("BETTER_AUTH_SECRET");
    expect(result.stdout + result.stderr).not.toContain(
      configuredEnvironment.NETLIFY_DATABASE_URL,
    );
  });
});

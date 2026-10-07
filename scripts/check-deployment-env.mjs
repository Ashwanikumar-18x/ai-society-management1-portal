import { realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";

export function deploymentConfigurationErrors(
  env,
  { requireAuthSecret = true } = {},
) {
  const errors = [];
  const authSecret = env.BETTER_AUTH_SECRET?.trim();
  if (
    (!authSecret && requireAuthSecret) ||
    (authSecret && authSecret.length < 32)
  ) {
    errors.push(
      "Set BETTER_AUTH_SECRET to a securely generated value of at least 32 characters in Netlify environment settings, scoped to Builds and Functions for this deploy context.",
    );
  }

  const databaseUrl =
    env.NETLIFY_DB_URL?.trim() ||
    env.NETLIFY_DATABASE_URL?.trim() ||
    env.DATABASE_URL?.trim();
  let persistentDatabase = false;
  try {
    const parsed = new URL(databaseUrl);
    persistentDatabase =
      ["postgres:", "postgresql:"].includes(parsed.protocol) &&
      Boolean(parsed.hostname) &&
      !["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
  } catch {}
  if (!persistentDatabase) {
    errors.push(
      "A persistent PostgreSQL URL is required in NETLIFY_DB_URL, NETLIFY_DATABASE_URL, or DATABASE_URL. Netlify provisions the managed database when deploying with @netlify/database installed. If provisioning has not completed, enable Netlify Database in the site dashboard. Do not use local PGlite or masked values for deployment.",
    );
  }

  return errors;
}

export function deploymentConfigurationReport(env, { production = false } = {}) {
  const requireAuthSecret =
    production || !["deploy-preview", "branch-deploy"].includes(env.CONTEXT);
  const errors = deploymentConfigurationErrors(env, { requireAuthSecret });
  const warnings = requireAuthSecret
    ? []
    : deploymentConfigurationErrors(env).filter(
        (issue) => !errors.includes(issue),
      );
  return { errors, warnings };
}

const entry = process.argv[1];
if (entry && realpathSync(entry) === fileURLToPath(import.meta.url)) {
  const { errors, warnings } = deploymentConfigurationReport(process.env, {
    production: process.argv.includes("--production"),
  });
  if (warnings.length > 0) {
    console.warn(
      "Preview configuration warnings (authentication remains unavailable until configured):",
    );
    for (const warning of warnings) console.warn(`- ${warning}`);
  }
  if (errors.length > 0) {
    console.error("Deployment configuration is incomplete:");
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
  } else {
    console.log(
      warnings.length > 0
        ? "Preview build checks passed with configuration warnings."
        : "Deployment configuration checks passed.",
    );
  }
}

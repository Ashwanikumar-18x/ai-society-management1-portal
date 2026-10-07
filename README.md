# Chat

The minimal agent-native starter app — a clean, ChatGPT-style shell with chat at
the center, durable threads, standard app navigation, auth, live sync, and
actions. Start here when you want a real browser app to build on without
committing to a domain template.

**Live app: [chat.agent-native.com](https://chat.agent-native.com?utm_source=github&utm_medium=referral&utm_content=chat-readme)**

Chat is the basic agent-native app starting point. It gives you the app-agent
loop wired end to end and one example action, so you can add your own UI, data,
and actions on top.

## Features

- ChatGPT-style shell with a threads list and durable chat history.
- Auth, live sync, and application state wired out of the box.
- The action surface the agent and UI share, plus one example action to copy.
- A minimal, brandable base for any domain app.

## Develop locally

Scaffold your own copy and run it:

```bash
npx --yes @agent-native/core@latest create my-app --standalone --template chat
cd my-app
corepack enable
pnpm install
pnpm dev
```

Full docs: [agent-native.com/docs/template-chat](https://agent-native.com/docs/template-chat?utm_source=github&utm_medium=referral&utm_content=chat-readme).

## Deploy on Netlify

The app includes `@netlify/database`, which enables automatic provisioning of
the site's managed PostgreSQL database during deployment. Netlify supplies
`NETLIFY_DB_URL` to the build and deployed functions. A startup compatibility
adapter exposes that URL as `DATABASE_URL` for Agent-Native, which uses
that database for authentication, threads, and application state; app-owned
tables use the Netlify Drizzle adapter in `db/index.ts`.

Before deploying, add `BETTER_AUTH_SECRET` in **Site configuration → Environment
variables**. Use a securely generated random secret of at least 32 characters,
with the **Production** context and both **Builds** and **Functions** scopes.
Generate and save the value privately; never commit it, paste it into chat, or
include it in build logs. Keep the same secret across subsequent deploys.
Configure separate secrets for other deploy contexts that you use.

If database provisioning has not completed, enable Netlify Database in the
site dashboard. An explicitly configured `DATABASE_URL` also works, but it must
point to this site's persistent Netlify PostgreSQL database and be available to
both Builds and Functions. An unpooled URL alone is not sufficient for runtime
connections. The older `NETLIFY_DATABASE_URL` alias remains supported. The
platform-provided `NETLIFY_DB_URL` takes precedence so preview builds and
functions use their own database branch. Do not use a local PGlite database or
a masked connection string.

`pnpm deploy:check` validates these settings without displaying their values.
Netlify runs this check before building. Production deploys fail early when
required settings are missing. Deploy previews and branch deploys still require
a persistent database, but report a missing authentication secret as a warning
so a Production-only secret does not block preview compilation. A configured
secret that is too short fails validation in every context. Preview
authentication remains unavailable until a separate secret is configured for
that context; no authentication bypass or fallback secret is used.
`pnpm migrate:production` explicitly enforces the strict production check,
regardless of the surrounding deploy context.
Once the settings are available, trigger a new production deploy. The deploy
runs the existing Agent-Native release migrations against the persistent
database; authentication is not disabled and no temporary secret is generated.

Define app tables in `db/schema.ts` and run
`pnpm db:generate --name <descriptive_name>` after schema changes. Commit the
generated files in `netlify/database/migrations`; Netlify applies them during
deployment, so the build does not run a second app migration command. The
starter currently has no app-owned tables and needs no app schema migration.
Framework-owned tables remain managed by `pnpm migrate:production`.

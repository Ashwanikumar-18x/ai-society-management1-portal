# Data layer — start here

This file plus `drizzle/crud-action-example.ts` is all you need to add a table
and wire CRUD. You do **not** need the `storing-data`, `actions`, or
`agent-native-docs` skills for standard CRUD, and you do **not** need to search
`node_modules` or read any `dist/*.d.ts` to discover the API — the pattern is
already stubbed in the files below.

## The files are already here

| What | Path | State |
| --- | --- | --- |
| App tables | `db/schema.ts` | Empty — add tables here |
| DB client | `server/db.ts` → `getDb()`, `schema` | Netlify Drizzle adapter, already enabled |
| CRUD pattern | `drizzle/crud-action-example.ts` | Copy into `actions/<name>.ts` |
| Migrate | `pnpm db:generate --name <descriptive_name>` → deploy | Netlify applies `netlify/database/migrations` |
| Actions | `actions/<name>.ts` | You create these |

Open `db/schema.ts` and edit it in place. `drizzle/schema.ts` is a compatibility
re-export, not a second schema. Do **not**
`find` / `cat` over `node_modules/@agent-native` or `drizzle-orm`, and do **not**
read `dist/*.d.ts` — everything you need is in the two stub files.

## Add app data

`drizzle-orm`, `drizzle-kit`, `drizzle.config.ts`, and the `pnpm db:generate` /
`pnpm db:migrate` scripts already ship — do not re-add them.

1. Add a table to `db/schema.ts` using `drizzle-orm/pg-core`.
2. Use `getDb()` and `schema` from `server/db.ts` in your actions.
3. Run `pnpm db:generate --name <descriptive_name>` and commit the generated
   migration in `netlify/database/migrations`. Netlify applies it at deployment.
   Use `netlify db status` to inspect migration state. Keep applied migrations
   immutable and roll forward with new migrations.
4. Copy the CRUD pattern from `drizzle/crud-action-example.ts` into
   `actions/<name>.ts`. **One action per file, default-exported** — the four
   `export const ...Example` blocks in that reference each become their own
   `actions/<name>.ts` (e.g. `listNotesExample` → `actions/list-notes.ts` with
   `export default`); the kebab-case filename is the action name. Don't paste
   them into one file as named exports.

## After a batch of schema/action edits

One smoke path (create + list), then one `pnpm typecheck`. See
`self-modifying-code`.

---
name: db-sync
description: Sync Prisma schema with migration and regenerate client
allowed-tools:
  - Bash(npx prisma generate:*)
  - Bash(npx prisma db push:*)
  - Bash(npx prisma migrate:*)
  - Bash(pnpm prisma:*)
user-invocable: true
---

# Database Sync

Sync Prisma schema changes via migration and regenerate the client.

## Default Behavior

When invoked without arguments, run a migration with an auto-generated name:

```bash
npx prisma migrate dev --name sync
```

This creates a tracked migration and regenerates the Prisma client.

## Common Operations

**Create a named migration** (preferred for feature work):

```bash
npx prisma migrate dev --name <descriptive_name>
```

**Regenerate Prisma client only** (no schema changes, just re-sync):

```bash
npx prisma generate
```

## Notes

- Always use `prisma migrate dev` for schema changes — this creates tracked migrations in `prisma/migrations/`
- Do NOT use `db push` — it skips migration history and can cause drift
- Do NOT write raw SQL files in `sql/` — use Prisma migrations instead
- After pulling schema changes from another branch, run `npx prisma migrate dev` to apply
- Migration names should be descriptive: `add_community_votes`, `extend_user_referrals`, etc.

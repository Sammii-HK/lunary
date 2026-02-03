---
name: db-sync
description: Sync Prisma schema and generate client
allowed-tools:
  - Bash(npx prisma generate:*)
  - Bash(npx prisma db push:*)
  - Bash(npx prisma migrate:*)
  - Bash(pnpm prisma:*)
user-invocable: true
---

# Database Sync

Sync Prisma schema changes and regenerate the client.

## Common Operations

**Regenerate Prisma client** (after schema changes):

```bash
npx prisma generate
```

**Push schema to database** (development only, no migration):

```bash
npx prisma db push
```

**Create a migration** (for production-ready changes):

```bash
npx prisma migrate dev --name <migration_name>
```

## Default Behavior

When invoked without arguments, run:

```bash
npx prisma generate
```

This regenerates the Prisma client to match the current schema.

## Notes

- Always run `prisma generate` after pulling schema changes
- Use `db push` for quick prototyping
- Use `migrate dev` for changes that need to be tracked

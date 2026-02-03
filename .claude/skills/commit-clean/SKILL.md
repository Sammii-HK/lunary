---
name: commit-clean
description: Lint, type-check, and commit changes
allowed-tools:
  - Bash(pnpm lint:*)
  - Bash(pnpm exec tsc:*)
  - Bash(npx tsc:*)
  - Bash(git status:*)
  - Bash(git diff:*)
  - Bash(git log:*)
  - Bash(git add:*)
  - Bash(git commit:*)
user-invocable: true
---

# Commit Clean

Run linting and TypeScript checks before committing changes.

## Steps

1. **Lint**: Run `pnpm lint` to fix linting issues
2. **TypeScript Check**: Run `pnpm exec tsc --noEmit` to verify no type errors
3. **Commit**: If both pass, follow the standard git commit workflow:
   - Check `git status` and `git diff` to see changes
   - Check `git log` for commit message style
   - Stage relevant files with `git add`
   - Create a commit with a descriptive message

## Important

- If lint fails with unfixable errors, stop and report them
- If TypeScript check fails, stop and report the type errors
- Only proceed to commit if both checks pass
- Follow the repository's commit message conventions

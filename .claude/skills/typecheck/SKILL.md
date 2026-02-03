---
name: typecheck
description: Run TypeScript type checking on the codebase
allowed-tools:
  - Bash(pnpm tsc:*)
  - Bash(pnpm exec tsc:*)
  - Bash(npx tsc:*)
user-invocable: true
---

# TypeScript Check

Run the TypeScript compiler to check for type errors without emitting files.

## Usage

When invoked, run:

```bash
pnpm exec tsc --noEmit
```

This will check all TypeScript files for type errors without producing output files.

Report any type errors found with their file paths and line numbers.

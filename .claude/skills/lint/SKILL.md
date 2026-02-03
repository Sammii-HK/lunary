---
name: lint
description: Run ESLint with auto-fix on the codebase
allowed-tools:
  - Bash(pnpm lint:*)
user-invocable: true
---

# Lint

Run ESLint to check and auto-fix linting issues across the codebase.

## Usage

When invoked, run:

```bash
pnpm lint
```

This will run ESLint with the `--fix` flag to automatically fix fixable issues.

If there are unfixable issues, report them to the user with file paths and line numbers.

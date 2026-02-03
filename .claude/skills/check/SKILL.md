---
name: check
description: Run quick quality checks (lint + unit tests)
allowed-tools:
  - Bash(pnpm check:*)
  - Bash(pnpm lint:*)
  - Bash(pnpm test:*)
user-invocable: true
---

# Quick Check

Run the quick quality check script which includes linting and unit tests.

## Usage

When invoked, run:

```bash
pnpm check:quick
```

This runs:

1. `pnpm lint` - ESLint with auto-fix
2. `pnpm test` - Jest unit tests

Report any failures with details so the user can address them.

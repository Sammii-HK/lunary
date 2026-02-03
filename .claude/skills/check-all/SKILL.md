---
name: check-all
description: Run full quality checks (lint + tests + e2e smoke + build)
allowed-tools:
  - Bash(pnpm check:*)
  - Bash(pnpm lint:*)
  - Bash(pnpm test:*)
  - Bash(pnpm build:*)
user-invocable: true
---

# Full Check

Run the comprehensive quality check script which includes linting, tests, e2e smoke tests, and a production build.

## Usage

When invoked, run:

```bash
pnpm check:all
```

This runs:

1. `pnpm lint` - ESLint with auto-fix
2. `pnpm test` - Jest unit tests
3. `pnpm test:e2e:smoke` - Playwright smoke tests
4. `pnpm build` - Next.js production build

This is a thorough check suitable for pre-commit or pre-PR validation.

Report any failures with details so the user can address them.

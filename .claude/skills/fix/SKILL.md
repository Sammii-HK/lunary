---
name: fix
description: Run Prettier and ESLint to format and fix code
allowed-tools:
  - Bash(pnpm lint:*)
  - Bash(pnpm exec prettier:*)
  - Bash(npx prettier:*)
  - Bash(npx eslint:*)
user-invocable: true
---

# Fix Code Style

Run Prettier and ESLint to automatically format and fix code issues.

## Steps

1. **Run ESLint with auto-fix**:

   ```bash
   pnpm lint
   ```

2. **Run Prettier** (if needed for non-JS/TS files):
   ```bash
   pnpm exec prettier --write "**/*.{json,css,md,yml,yaml}"
   ```

## For Specific Files

If user specifies a file or pattern:

```bash
pnpm exec prettier --write <path>
npx eslint --fix <path>
```

## Notes

- ESLint handles .ts/.tsx/.js/.jsx files
- Prettier handles JSON, CSS, Markdown, YAML
- Both are run by lint-staged on commit automatically

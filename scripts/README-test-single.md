# Quick Test Runner Script

Run a single Playwright test file for quick debugging and iteration.

## Usage

```bash
# Run a specific test file (short form)
yarn test:single 06-grimoire

# Run a specific test file (full path)
yarn test:single e2e/journeys/06-grimoire.spec.ts

# Run a specific test by name within a file
yarn test:single 06-grimoire --grep "should display grimoire"

# Run with additional Playwright options
yarn test:single 06-grimoire --headed  # Run in headed mode
yarn test:single 06-grimoire --debug   # Run in debug mode
yarn test:single 06-grimoire --grep "spells" --retries=3
```

## Examples

```bash
# Quick test of grimoire navigation
yarn test:single 06-grimoire

# Test only the spells section
yarn test:single 06-grimoire --grep "spells"

# Debug authentication issues
yarn test:single 01-authentication --debug

# Test shop page in headed mode (see browser)
yarn test:single 07-shop --headed
```

## Available Test Files

- `00-smoke` - Quick smoke tests
- `01-authentication` - Auth flow tests
- `02-birth-chart` - Birth chart tests
- `03-subscription` - Pricing/subscription tests
- `04-horoscope` - Horoscope tests
- `05-tarot` - Tarot reading tests
- `06-grimoire` - Grimoire navigation tests
- `07-shop` - Shop page tests
- `08-profile` - Profile page tests
- `09-admin` - Admin dashboard tests
- `10-complete-user-flow` - End-to-end user journey
- `11-newsletter` - Newsletter tests
- `12-pwa` - PWA tests
- `13-blog` - Blog tests
- `14-mobile` - Mobile responsive tests
- `15-accessibility` - A11y tests
- `16-performance` - Performance tests
- `17-error-handling` - Error handling tests

## Tips

- Use `--grep` to run only specific tests within a file
- Use `--headed` to see the browser (useful for debugging)
- Use `--debug` to step through tests interactively
- Use `--retries=N` to retry failed tests automatically
- The script automatically finds test files, so you can use short names like `06-grimoire` instead of full paths

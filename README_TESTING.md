# Testing Guide

This project includes comprehensive test suites covering unit tests, integration tests, and end-to-end tests using Playwright.

## Test Structure

```
├── __tests__/
│   ├── unit/              # Unit tests for utilities and components
│   └── integration/       # Integration tests for API routes
├── e2e/
│   ├── fixtures/          # Test fixtures and helpers
│   ├── journeys/          # E2E tests organized by user journey
│   └── utils/             # E2E utility functions
├── jest.config.js         # Jest configuration
├── jest.setup.js          # Jest setup file
└── playwright.config.ts   # Playwright configuration
```

## Running Tests

### Unit & Integration Tests (Jest)

```bash
# Run all tests
yarn test

# Run in watch mode
yarn test:watch

# Run with coverage
yarn test:coverage

# Run only unit tests
yarn test:unit

# Run only integration tests
yarn test:integration
```

### End-to-End Tests (Playwright)

```bash
# Run all E2E tests
yarn test:e2e

# Run with UI mode (interactive)
yarn test:e2e:ui

# Run in headed mode (see browser)
yarn test:e2e:headed

# Debug mode
yarn test:e2e:debug

# Run all tests (unit + e2e)
yarn test:all
```

## User Journeys Covered

### 1. Authentication Journey (`01-authentication.spec.ts`)

- Sign up new users
- Sign in existing users
- Handle invalid credentials
- Sign out functionality
- Auth redirects

### 2. Birth Chart Journey (`02-birth-chart.spec.ts`)

- Navigate to birth chart page
- Submit birth data
- Display birth chart visualization
- Show planetary positions
- Display houses information

### 3. Subscription Journey (`03-subscription.spec.ts`)

- Display pricing page
- Show all pricing plans
- Highlight popular plan
- Navigate to checkout
- Display free trial information

### 4. Horoscope Journey (`04-horoscope.spec.ts`)

- Navigate to horoscope page
- Display daily horoscope
- Show personalized horoscope
- Display transit information
- Date selector functionality

### 5. Tarot Journey (`05-tarot.spec.ts`)

- Navigate to tarot page
- Display tarot card
- Show card interpretation
- Draw new card
- Personalized tarot readings

### 6. Grimoire Journey (`06-grimoire.spec.ts`)

- Navigate to grimoire
- Browse sections (Moon, Crystals, Spells, Tarot)
- Search crystals
- View crystal database

### 7. Shop Journey (`07-shop.spec.ts`)

- Navigate to shop
- Display products
- View product details
- Navigate to checkout

### 8. Profile Journey (`08-profile.spec.ts`)

- Navigate to profile
- View user information
- Check subscription status
- Manage subscription

### 9. Admin Journey (`09-admin.spec.ts`)

- Access admin dashboard
- View analytics
- Manage social media posts
- Blog management
- Shop management
- Admin access control

### 10. Complete User Flow (`10-complete-user-flow.spec.ts`)

- Full onboarding flow
- Feature exploration
- Complete user journey for video walkthroughs

### 11. Newsletter Journey (`11-newsletter.spec.ts`)

- Subscribe to newsletter
- Verify subscription
- Unsubscribe

### 12. PWA Journey (`12-pwa.spec.ts`)

- Service worker registration
- PWA install prompt
- Manifest.json
- Offline functionality

### 13. Blog Journey (`13-blog.spec.ts`)

- Navigate to blog
- View blog posts
- Read individual posts

## Test Fixtures

### Authentication Fixtures

- `authenticatedPage`: Pre-authenticated page fixture
- `adminPage`: Pre-authenticated admin page fixture

### Test Data

- `testUserData`: Standard test user data
- `testBirthData`: Test birth chart data
- `mockStripeData`: Mock Stripe data

## Writing Tests

### Unit Tests

```typescript
import { functionToTest } from '@/utils/example';

describe('Example Utility', () => {
  it('should do something', () => {
    const result = functionToTest();
    expect(result).toBe(expected);
  });
});
```

### Integration Tests

```typescript
describe('API Route', () => {
  it('should handle request', async () => {
    const response = await fetch('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

### E2E Tests

```typescript
import { test, expect } from '../fixtures/auth';

test('user journey', async ({ page }) => {
  await page.goto('/page');
  await expect(page.locator('text=Expected')).toBeVisible();
});
```

## CI/CD Integration

Tests are configured to run in CI environments:

- Jest tests run automatically
- Playwright tests run with retries in CI
- Coverage thresholds enforced
- Test results reported

## Troubleshooting

### E2E Tests Hanging or Failing to Start

If e2e tests hang or fail to start, it's usually due to port conflicts:

**Symptoms:**

- Tests hang waiting for server
- Error: "Wrong app detected on port 3000"
- Tests timeout during global setup

**Solutions:**

1. **Check what's running on port 3000:**

   ```bash
   lsof -i:3000
   ```

2. **Kill processes on port 3000 manually:**

   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

   Or use the helper script:

   ```bash
   ./scripts/cleanup-port-3000.sh
   ```

3. **Kill any hanging Playwright processes:**

   ```bash
   pkill -9 -f "playwright test"
   ```

4. **Verify Playwright config:**
   - Check `playwright.config.ts` has `reuseExistingServer: false`
   - The webServer command should automatically kill processes on port 3000
   - If issues persist, manually kill processes before running tests

**Common Causes:**

- Another Next.js app running on port 3000
- Previous test run didn't clean up properly
- Development server left running from manual start

**Prevention:**

- Always let Playwright start its own server (don't run `npm run dev` before tests)
- Use the cleanup script if you've manually started a dev server
- Check for hanging processes before running tests in CI

## Video Walkthrough Support

The E2E test suite is designed to support video walkthrough recording:

- Complete user flows in `10-complete-user-flow.spec.ts`
- Step-by-step test organization
- Clear test descriptions
- Headed mode for recording: `yarn test:e2e:headed`

## Coverage Goals

- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Environment Variables for Testing

```env
PLAYWRIGHT_TEST_BASE_URL=http://localhost:3000
ADMIN_EMAIL=admin@lunary.app
ADMIN_PASSWORD=admin123
```

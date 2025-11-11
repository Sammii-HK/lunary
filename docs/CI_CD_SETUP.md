# CI/CD Pipeline Setup Guide

This project uses GitHub Actions for continuous integration and deployment.

## Workflows

### 1. CI/CD Pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` or `develop` branches. Includes:

- **Lint & Type Check**: ESLint and TypeScript type checking
- **Unit & Integration Tests**: Jest tests with coverage reporting
- **Build**: Production build verification
- **E2E Tests**: Playwright end-to-end tests
- **Test Summary**: Aggregated test results

### 2. Test Suite (`.github/workflows/test.yml`)

Simplified workflow for running tests only. Includes:

- **Unit Tests**: Jest tests with coverage
- **E2E Tests**: Playwright tests

## Required GitHub Secrets

To run E2E tests in CI, you need to set up the following secrets in your GitHub repository:

### Required Secrets

1. **TEST_EMAIL** (or TEST_USER_EMAIL)

   - Email address for test user authentication
   - Example: `test@test.lunary.app`

2. **TEST_PASSWORD** (or TEST_USER_PASSWORD)
   - Password for test user
   - Example: `TestPassword123!`

### Optional Secrets

3. **ADMIN_EMAIL**

   - Admin user email for admin tests
   - Default: `admin@lunary.app`

4. **ADMIN_PASSWORD**

   - Admin user password
   - Default: `admin123`

5. **PLAYWRIGHT_TEST_BASE_URL**
   - Base URL for Playwright tests (if different from localhost:3000)
   - Default: `http://localhost:3000`

## Setting Up Secrets

📖 **Detailed Guide**: See [GitHub Secrets Setup Guide](./GITHUB_SECRETS_SETUP.md) for step-by-step instructions with screenshots.

### Quick Steps:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add each secret with the name and value

### Required Secrets:

- `TEST_EMAIL` - Test user email (e.g., `test@test.lunary.app`)
- `TEST_PASSWORD` - Test user password (e.g., `TestPassword123!`)

### Optional Secrets:

- `ADMIN_EMAIL` - Admin user email (defaults to `admin@lunary.app`)
- `ADMIN_PASSWORD` - Admin user password (defaults to `admin123`)
- `PLAYWRIGHT_TEST_BASE_URL` - Custom test URL (defaults to `http://localhost:3000`)

**Note**: You can use either `TEST_EMAIL`/`TEST_PASSWORD` or `TEST_USER_EMAIL`/`TEST_USER_PASSWORD` - both naming conventions are supported.

## Workflow Features

### Automatic Test Execution

- Runs on every push to `main` or `develop`
- Runs on every pull request targeting `main` or `develop`
- Can be manually triggered via `workflow_dispatch`

### Artifacts

The workflows automatically upload:

- **Playwright Reports**: HTML test reports (30 days retention)
- **Test Results**: JSON test results (7 days retention)
- **Playwright Traces**: Debug traces for failed tests (7 days retention)
- **Coverage Reports**: Code coverage data (7 days retention)
- **Build Artifacts**: Production build output (1 day retention)

### Test Retries

- E2E tests automatically retry up to 2 times on failure (in CI)
- Helps handle flaky tests and transient network issues

### Timeouts

- E2E tests have a 30-minute timeout
- Individual tests have a 60-second timeout
- Prevents hanging builds

## Local Testing

Before pushing, you can run tests locally:

```bash
# Run all tests
yarn test:e2e

# Run a single test file
yarn test:single 06-grimoire

# Run tests in headed mode (see browser)
yarn test:e2e:headed

# Run tests in debug mode
yarn test:e2e:debug
```

## Troubleshooting

### Tests Fail in CI but Pass Locally

1. Check that all required secrets are set
2. Verify environment variables match your local `.env.local`
3. Check the Playwright report artifact for detailed error messages
4. Review test traces for failed tests

### E2E Tests Timeout

1. Check server startup logs in the workflow output
2. Verify the test database is accessible
3. Increase timeout in `playwright.config.ts` if needed
4. Check for network issues or slow API responses

### Missing Secrets Error

If you see errors about missing environment variables:

1. Go to repository Settings → Secrets
2. Add the missing secrets
3. Re-run the workflow

## Best Practices

1. **Always run tests locally before pushing**
2. **Keep test credentials secure** - never commit them to the repository
3. **Use descriptive test names** - makes debugging easier
4. **Review test artifacts** - HTML reports show exactly what happened
5. **Fix flaky tests** - don't rely on retries for known issues

## Workflow Status Badge

Add this to your README.md to show CI status:

```markdown
![CI/CD](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI%2FCD%20Pipeline/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual GitHub username and repository name.

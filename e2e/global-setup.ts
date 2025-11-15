import { chromium, FullConfig } from '@playwright/test';
import { TEST_USERS, ensureTestUser } from './fixtures/test-users';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  const isCI = !!process.env.CI;
  // Check if webServer is configured to start automatically (reuseExistingServer: false means it will start)
  // webServer config is at root level, not in projects[0].use
  const webServerConfig = (config as any).webServer;
  const webServerWillStart =
    webServerConfig && webServerConfig.reuseExistingServer === false;

  if (!isCI) {
    console.log('\n🔧 Playwright Global Setup');
    console.log(`📍 Base URL: ${baseURL}`);
    console.log('🌐 Checking server availability...\n');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let retries = 0;
  // If webServer will start automatically and wrong app detected, wait shorter time
  // Otherwise use full timeout for manual server startup
  const maxRetries = webServerWillStart ? 10 : 30; // 10 retries = ~20 seconds if webServer starts, 30 = ~60 seconds otherwise
  const retryDelay = 2000; // 2 seconds between retries
  let wrongAppDetected = false;

  while (retries < maxRetries) {
    try {
      // Test homepage first
      const homeResponse = await page.goto(baseURL, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      const homeStatus = homeResponse?.status();

      if (homeStatus === 200) {
        // Wait for React hydration
        await page.waitForTimeout(2000);

        // Verify it's the correct app by checking page title (more reliable than body text)
        const pageTitle = await page.title();
        const bodyText = await page.locator('body').textContent();
        const isLunary =
          pageTitle?.includes('Lunary') ||
          pageTitle?.includes('lunary') ||
          bodyText?.includes('Lunary') ||
          bodyText?.includes('lunary');

        if (!isLunary) {
          wrongAppDetected = true;
          if (!isCI) {
            console.log(
              `⚠️  Wrong app detected on port 3000 (title: "${pageTitle}"), waiting for correct server... (attempt ${retries + 1}/${maxRetries})`,
            );
            if (webServerWillStart) {
              console.log(
                '   ℹ️  WebServer will start automatically - waiting for it to replace the wrong app...',
              );
            }
          }
          retries++;
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }

        // Also test that auth route is available
        const authResponse = await page.goto(`${baseURL}/auth`, {
          waitUntil: 'domcontentloaded',
          timeout: 10000,
        });

        const authStatus = authResponse?.status();

        if (authStatus === 200) {
          if (!isCI) {
            console.log(
              `✅ Server is ready (Home: HTTP ${homeStatus}, Auth: HTTP ${authStatus})`,
            );
          }

          // Create test user if TEST_EMAIL is set
          const hasTestEmail = !!(
            process.env.TEST_USER_EMAIL || process.env.TEST_EMAIL
          );
          if (hasTestEmail) {
            const testUser = TEST_USERS.regular;
            if (!isCI) {
              console.log(`👤 Ensuring test user exists: ${testUser.email}`);
            }

            try {
              // Use the same ensureTestUser function that tests use - ensures consistency
              if (!isCI) {
                console.log(
                  `   → Creating/verifying test user: ${testUser.email}`,
                );
              }

              const userCreated = await ensureTestUser(page, testUser);

              if (userCreated) {
                if (!isCI) {
                  console.log(`   ✅ Test user ready: ${testUser.email}`);
                } else {
                  console.log(`   ✅ Test user ready`);
                }
              } else {
                console.error(
                  `   ❌ Test user creation failed for: ${testUser.email}`,
                );
                // Don't throw - tests will try to create user if needed
              }
            } catch (error) {
              // Always log errors in CI for debugging
              console.error(`   ❌ Failed to create test user:`, error);
              if (!isCI) {
                console.warn(`   ⚠️  Could not create test user:`, error);
              }
              // Continue anyway - tests will handle auth
            }
          }

          if (!isCI) {
            console.log(`✅ Application is ready for testing\n`);
          }
          await browser.close();
          return;
        } else {
          if (!isCI) {
            console.log(
              `⚠️  Auth route returned HTTP ${authStatus}, retrying... (attempt ${retries + 1}/${maxRetries})`,
            );
          }
        }
      } else {
        if (!isCI) {
          console.log(
            `⚠️  Homepage returned HTTP ${homeStatus}, retrying... (attempt ${retries + 1}/${maxRetries})`,
          );
        }
      }
    } catch (error) {
      // Continue retrying on errors
    }

    retries++;
    if (retries < maxRetries) {
      if (!isCI) {
        console.log(
          `⏳ Attempt ${retries}/${maxRetries}: Waiting ${retryDelay}ms for server to be ready...`,
        );
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } else {
      if (!isCI) {
        console.log(
          `⚠️  Server health check failed after ${maxRetries} attempts`,
        );
        if (wrongAppDetected) {
          console.error(
            '\n❌ ERROR: Wrong application detected on port 3000 and server never became ready.',
          );
          console.error(
            '   This usually means:\n' +
              '   1. Another app is running on port 3000 (check with: lsof -i:3000)\n' +
              '   2. The webServer failed to start (check Playwright output above)\n' +
              '   3. The server started but is not responding correctly\n',
          );
          console.error(
            '   Solution: Kill the process on port 3000 manually:\n' +
              '   lsof -ti:3000 | xargs kill -9\n',
          );
        } else {
          console.log(
            '⚠️  Tests will proceed but may fail if server is not running\n',
          );
        }
      }
      // In CI, throw error to fail fast
      if (isCI && wrongAppDetected) {
        await browser.close();
        throw new Error(
          'Server health check failed: Wrong application detected on port 3000',
        );
      }
    }
  }

  await browser.close();
}

export default globalSetup;

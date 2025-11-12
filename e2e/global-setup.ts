import { chromium, FullConfig } from '@playwright/test';
import { TEST_USERS, ensureTestUser } from './fixtures/test-users';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  const isCI = !!process.env.CI;

  if (!isCI) {
    console.log('\n🔧 Playwright Global Setup');
    console.log(`📍 Base URL: ${baseURL}`);
    console.log('🌐 Checking server availability...\n');
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let retries = 0;
  const maxRetries = 15; // 15 retries = ~45 seconds max (reduced from 60)
  const retryDelay = 2000; // 2 seconds between retries (reduced from 3)

  while (retries < maxRetries) {
    try {
      // Test homepage first
      const homeResponse = await page.goto(baseURL, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      const homeStatus = homeResponse?.status();

      if (homeStatus === 200) {
        // Verify it's the correct app by checking page content
        const bodyText = await page.locator('body').textContent();
        const isLunary =
          bodyText?.includes('Lunary') || bodyText?.includes('lunary');

        if (!isLunary) {
          if (!isCI) {
            console.log(
              `⚠️  Wrong app detected on port 3000, waiting for correct server... (attempt ${retries + 1}/${maxRetries})`,
            );
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
        console.log(
          '⚠️  Tests will proceed but may fail if server is not running\n',
        );
      }
    }
  }

  await browser.close();
}

export default globalSetup;

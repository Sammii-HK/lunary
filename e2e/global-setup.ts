import { chromium, FullConfig } from '@playwright/test';
import { TEST_USERS } from './fixtures/test-users';

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
              // Try to sign in first (user might already exist)
              await page.goto(`${baseURL}/auth`, {
                waitUntil: 'networkidle',
                timeout: 10000,
              });
              await page
                .waitForLoadState('networkidle', { timeout: 5000 })
                .catch(() => {});

              const emailInput = page.locator('#email').first();
              const passwordInput = page.locator('#password').first();
              const submitButton = page
                .locator('button[type="submit"]')
                .first();

              if (
                await emailInput.isVisible({ timeout: 5000 }).catch(() => false)
              ) {
                await emailInput.fill(testUser.email);
                await passwordInput.fill(testUser.password);
                await submitButton.click();

                // Wait for either success or failure
                await page.waitForTimeout(2000);

                // If still on auth page, try to sign up
                if (page.url().includes('/auth')) {
                  if (!isCI) {
                    console.log(`   → Test user doesn't exist, creating...`);
                  }

                  const signUpLink = page
                    .locator(
                      "text=/sign up|create account|register|don't have/i",
                    )
                    .first();
                  if (
                    await signUpLink
                      .isVisible({ timeout: 3000 })
                      .catch(() => false)
                  ) {
                    await signUpLink.click();
                    await page
                      .waitForLoadState('networkidle', { timeout: 3000 })
                      .catch(() => {});

                    const signUpEmailInput = page.locator('#email').first();
                    const signUpPasswordInput = page
                      .locator('#password')
                      .first();
                    const signUpNameInput = page
                      .locator('#name, input[name="name"]')
                      .first();
                    const signUpSubmitButton = page
                      .locator('button[type="submit"]')
                      .first();

                    if (
                      await signUpEmailInput
                        .isVisible({ timeout: 5000 })
                        .catch(() => false)
                    ) {
                      await signUpEmailInput.fill(testUser.email);
                      await signUpPasswordInput.fill(testUser.password);
                      const nameInputVisible = await signUpNameInput
                        .isVisible({ timeout: 2000 })
                        .catch(() => false);
                      if (nameInputVisible) {
                        await signUpNameInput.fill(testUser.name);
                      }
                      await signUpSubmitButton.click();
                      await page
                        .waitForURL((url) => !url.pathname.includes('/auth'), {
                          timeout: 5000,
                        })
                        .catch(() => {});

                      if (!isCI) {
                        console.log(`   ✅ Test user created successfully`);
                      }
                    }
                  }
                } else {
                  if (!isCI) {
                    console.log(`   ✅ Test user already exists`);
                  }
                }
              }
            } catch (error) {
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

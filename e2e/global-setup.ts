import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';

  console.log('\n🔧 Playwright Global Setup');
  console.log(`📍 Base URL: ${baseURL}`);
  console.log('🌐 Checking server availability...\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  let retries = 0;
  const maxRetries = 20; // 20 retries = ~60 seconds max
  const retryDelay = 3000; // 3 seconds between retries

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
          console.log(
            `⚠️  Wrong app detected on port 3000, waiting for correct server... (attempt ${retries + 1}/${maxRetries})`,
          );
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
          console.log(
            `✅ Server is ready (Home: HTTP ${homeStatus}, Auth: HTTP ${authStatus})`,
          );
          console.log(`✅ Application is ready for testing\n`);
          await browser.close();
          return;
        } else {
          console.log(
            `⚠️  Auth route returned HTTP ${authStatus}, retrying... (attempt ${retries + 1}/${maxRetries})`,
          );
        }
      } else {
        console.log(
          `⚠️  Homepage returned HTTP ${homeStatus}, retrying... (attempt ${retries + 1}/${maxRetries})`,
        );
      }
    } catch (error) {
      // Continue retrying on errors
    }

    retries++;
    if (retries < maxRetries) {
      console.log(
        `⏳ Attempt ${retries}/${maxRetries}: Waiting ${retryDelay}ms for server to be ready...`,
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } else {
      console.log(
        `⚠️  Server health check failed after ${maxRetries} attempts`,
      );
      console.log(
        '⚠️  Tests will proceed but may fail if server is not running\n',
      );
    }
  }

  await browser.close();
}

export default globalSetup;

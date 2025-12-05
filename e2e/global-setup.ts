import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:3000';
  const isCI = !!process.env.CI;
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
  const maxRetries = webServerWillStart ? 10 : 30;
  const retryDelay = 2000;
  let wrongAppDetected = false;

  while (retries < maxRetries) {
    try {
      const homeResponse = await page.goto(baseURL, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      const homeStatus = homeResponse?.status();

      if (homeStatus === 200) {
        await page.waitForTimeout(2000);

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
          }
          retries++;
          if (retries < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }
        }

        if (!isCI) {
          console.log(`✅ Server is ready (HTTP ${homeStatus})`);
          console.log(`✅ Application is ready for testing\n`);
        }
        await browser.close();
        return;
      } else {
        if (!isCI) {
          console.log(
            `⚠️  Homepage returned HTTP ${homeStatus}, retrying... (attempt ${retries + 1}/${maxRetries})`,
          );
        }
      }
    } catch {
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
          console.error('\n❌ ERROR: Wrong application detected on port 3000.');
          console.error(
            '   Solution: Kill the process on port 3000:\n' +
              '   lsof -ti:3000 | xargs kill -9\n',
          );
        }
      }
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

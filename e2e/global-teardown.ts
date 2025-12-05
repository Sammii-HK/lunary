import { FullConfig } from '@playwright/test';
import { cleanupSharedContext } from './fixtures/optimized-context';

async function globalTeardown(config: FullConfig) {
  const isCI = !!process.env.CI;

  // Cleanup shared contexts
  await cleanupSharedContext();

  if (!isCI) {
    console.log('\n🧹 Playwright Global Teardown');
    console.log('✅ Test suite completed\n');
  }

  // Test user cleanup is handled by the database fixture if needed
  // Global teardown is mainly for logging/cleanup
}

export default globalTeardown;

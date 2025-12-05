import { Page } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  name: string;
}

export const TEST_USERS = {
  regular: {
    email: 'test@test.lunary.app',
    password: 'TestPassword123!',
    name: 'Test User',
  },
  admin: {
    email: 'admin@lunary.app',
    password: 'admin123',
    name: 'Admin User',
  },
};

export async function ensureTestUser(
  page: Page,
  user: TestUser,
): Promise<boolean> {
  await page.goto('http://localhost:3000/', {
    waitUntil: 'domcontentloaded',
  });
  return true;
}

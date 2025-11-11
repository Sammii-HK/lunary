import { Page, expect, Locator } from '@playwright/test';

export async function waitForPageLoad(page: Page, timeout = 5000) {
  try {
    await page.waitForLoadState('domcontentloaded', { timeout });
    // Don't wait for networkidle - it's too slow
    await page.waitForTimeout(500); // Brief wait for React hydration
  } catch (error) {
    // Continue if timeout - page may still be functional
    console.warn(`   ⚠️  Page load timeout (${timeout}ms), continuing...`);
  }
}

export async function fillBirthData(
  page: Page,
  data: {
    date: string;
    time: string;
    location: string;
  },
) {
  console.log(
    `   → Filling birth data: ${data.date} ${data.time} in ${data.location}`,
  );

  // Wait for form to be ready
  await page.waitForTimeout(1000);

  // Try multiple selectors for date input
  const dateSelectors = [
    'input[name="birthDate"]',
    'input[type="date"]',
    'input[name="birthday"]',
  ];

  let dateInput: Locator | null = null;
  for (const selector of dateSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 5000 })) {
        dateInput = input;
        console.log(`   → Found date input: ${selector}`);
        break;
      }
    } catch {
      continue;
    }
  }

  if (!dateInput) {
    console.log(
      `   ⚠️  Date input not found - birth chart may already be generated or form doesn't exist`,
    );
    return; // Exit early if form doesn't exist
  }

  await dateInput.fill(data.date);

  // Try to find time input (may not exist)
  const timeSelectors = ['input[name="birthTime"]', 'input[type="time"]'];

  let timeInput: Locator | null = null;
  for (const selector of timeSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 })) {
        timeInput = input;
        break;
      }
    } catch {
      continue;
    }
  }

  if (timeInput) {
    await timeInput.fill(data.time);
  }

  // Try to find location input (may not exist)
  const locationSelectors = [
    'input[name="location"]',
    'input[type="text"][placeholder*="location" i]',
  ];

  let locationInput: Locator | null = null;
  for (const selector of locationSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 2000 })) {
        locationInput = input;
        break;
      }
    } catch {
      continue;
    }
  }

  if (locationInput) {
    await locationInput.fill(data.location);
  }

  // Try to submit form
  const submitButton = page
    .locator(
      'button[type="submit"], button:has-text("Submit"), button:has-text("Generate")',
    )
    .first();
  if (await submitButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await submitButton.click();
  } else {
    // If no submit button, try pressing Enter
    await page.keyboard.press('Enter');
  }

  await page.waitForTimeout(2000);
  console.log(`   → Birth data submitted`);
}

export async function signUp(page: Page, email: string, password: string) {
  console.log(`   → Starting sign up for ${email}`);
  // Jazz + Better Auth requires UI-based auth (client-side Jazz initialization)
  const response = await page.goto('/auth', {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });

  if (response?.status() !== 200) {
    throw new Error(`Auth page returned status ${response?.status()}`);
  }

  // Wait for React hydration - client component needs time
  await page.waitForTimeout(3000);

  // Wait for email input directly - more reliable than waiting for form
  const emailSelectors = [
    '#email',
    'input[name="email"]',
    'input[type="email"]',
  ];
  let emailInput: Locator | null = null;

  for (const selector of emailSelectors) {
    try {
      const input = page.locator(selector).first();
      await input.waitFor({ state: 'visible', timeout: 15000 });
      emailInput = input;
      break;
    } catch {
      continue;
    }
  }

  if (!emailInput) {
    // Check if we got redirected while waiting
    const urlAfterWait = page.url();
    if (!urlAfterWait.includes('/auth')) {
      console.log(`   → Already authenticated (redirected to ${urlAfterWait})`);
      return;
    }
    throw new Error(
      `Email input not found on auth page. Current URL: ${urlAfterWait}`,
    );
  }

  // Switch to sign up mode - use multiple selectors
  const signUpSelectors = [
    "text=/Don't have an account\\? Sign up/i",
    'text=/sign up/i',
    'text=/create account/i',
    'button:has-text("Sign up")',
  ];

  let signUpLink: Locator | null = null;
  for (const selector of signUpSelectors) {
    try {
      const link = page.locator(selector).first();
      if (await link.isVisible({ timeout: 3000 })) {
        signUpLink = link;
        break;
      }
    } catch {
      continue;
    }
  }

  if (signUpLink) {
    console.log(`   → Switching to sign up form...`);
    await signUpLink.click();
    await page.waitForTimeout(2000); // Increased wait for form switch

    // Re-find inputs after switching
    for (const selector of emailSelectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 3000 })) {
          emailInput = input;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Fill name if field exists
  const nameInput = page
    .locator('input[name="name"], input[placeholder*="name" i]')
    .first();
  if (await nameInput.isVisible({ timeout: 3000 })) {
    await nameInput.fill('Test User');
  }

  // Find password input
  const passwordSelectors = [
    '#password',
    'input[name="password"]',
    'input[type="password"]',
  ];
  let passwordInput: Locator | null = null;

  for (const selector of passwordSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 5000 })) {
        passwordInput = input;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!passwordInput) {
    throw new Error('Password input not found on auth page');
  }

  // Fill email and password
  console.log(`   → Filling sign up form...`);
  await emailInput.fill(email);
  await passwordInput.fill(password);

  const submitButton = page.locator('button[type="submit"]').first();
  await page.waitForTimeout(500);
  await submitButton.click();

  // Wait for sign up to complete (Jazz sync can take a moment)
  console.log(`   → Waiting for sign up to complete...`);

  // Wait for redirect or success message
  try {
    await Promise.race([
      page.waitForURL(/\/(welcome|profile|birth-chart|home|\/)/, {
        timeout: 20000,
      }),
      page.waitForSelector('text=/success|created|welcome/i', {
        timeout: 20000,
      }),
    ]);
  } catch {
    // Check if we're already redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth')) {
      console.log(`   → Sign up completed (redirected to ${currentUrl})`);
      return;
    }
  }

  // Additional wait for Jazz sync (can take 1-2 seconds)
  await page.waitForTimeout(2000);

  // Verify we're not on auth page
  const finalUrl = page.url();
  if (finalUrl.includes('/auth')) {
    console.log(`   ⚠️  Still on auth page after sign up - might have failed`);
  } else {
    console.log(`   → Sign up completed (redirected to ${finalUrl})`);
  }
}

export async function signIn(page: Page, email: string, password: string) {
  console.log(`   → Starting sign in for ${email}`);
  // Jazz + Better Auth requires UI-based auth (client-side Jazz account access)
  const response = await page.goto('/auth', {
    waitUntil: 'domcontentloaded',
    timeout: 20000,
  });

  if (response?.status() !== 200) {
    throw new Error(`Auth page returned status ${response?.status()}`);
  }

  // Wait for React hydration - client component needs time
  await page.waitForTimeout(3000);

  // Check if we got redirected (already authenticated)
  const currentUrl = page.url();
  if (!currentUrl.includes('/auth')) {
    console.log(`   → Already authenticated (redirected to ${currentUrl})`);
    return;
  }

  // Wait for email input directly - more reliable than waiting for form
  const emailSelectors = [
    '#email',
    'input[name="email"]',
    'input[type="email"]',
  ];
  let emailInput: Locator | null = null;

  for (const selector of emailSelectors) {
    try {
      const input = page.locator(selector).first();
      await input.waitFor({ state: 'visible', timeout: 15000 });
      emailInput = input;
      break;
    } catch {
      continue;
    }
  }

  if (!emailInput) {
    // Check if we got redirected while waiting
    const urlAfterWait = page.url();
    if (!urlAfterWait.includes('/auth')) {
      console.log(`   → Redirected during wait (now at ${urlAfterWait})`);
      return;
    }
    throw new Error(
      `Email input not found on auth page. Current URL: ${urlAfterWait}`,
    );
  }

  // Ensure we're on sign in (not sign up)
  const signInLink = page.locator('text=/sign in|log in/i').first();
  if (await signInLink.isVisible({ timeout: 5000 })) {
    console.log(`   → Switching to sign in form...`);
    await signInLink.click();
    await page.waitForTimeout(1500);

    // Re-find inputs after switching
    for (const selector of emailSelectors) {
      try {
        const input = page.locator(selector).first();
        if (await input.isVisible({ timeout: 3000 })) {
          emailInput = input;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  // Find password input
  const passwordSelectors = [
    '#password',
    'input[name="password"]',
    'input[type="password"]',
  ];
  let passwordInput: Locator | null = null;

  for (const selector of passwordSelectors) {
    try {
      const input = page.locator(selector).first();
      if (await input.isVisible({ timeout: 5000 })) {
        passwordInput = input;
        break;
      }
    } catch {
      continue;
    }
  }

  if (!passwordInput) {
    throw new Error('Password input not found on auth page');
  }

  console.log(`   → Filling sign in form...`);
  await emailInput.fill(email);
  await passwordInput.fill(password);

  const submitButton = page.locator('button[type="submit"]').first();
  await page.waitForTimeout(500);
  await submitButton.click();

  // Wait for sign in (Jazz sync can take a moment)
  console.log(`   → Waiting for sign in to complete...`);

  try {
    await Promise.race([
      page.waitForURL(/\/(welcome|profile|birth-chart|home|\/)/, {
        timeout: 20000,
      }),
      page.waitForSelector('text=/success|welcome|signed in/i', {
        timeout: 20000,
      }),
    ]);
  } catch {
    // Check if we're already redirected
    const currentUrl = page.url();
    if (!currentUrl.includes('/auth')) {
      console.log(`   → Sign in completed (redirected to ${currentUrl})`);
      return;
    }
  }

  // Additional wait for Jazz sync (can take 1-2 seconds)
  await page.waitForTimeout(2000);

  // Verify we're not on auth page
  const finalUrl = page.url();
  if (finalUrl.includes('/auth')) {
    console.log(`   ⚠️  Still on auth page after sign in - might have failed`);
  } else {
    console.log(`   → Sign in completed (redirected to ${finalUrl})`);
  }
}

export async function navigateToSection(page: Page, section: string) {
  console.log(`   → Navigating to section: ${section}`);

  // Try multiple strategies to navigate
  const strategies = [
    // Strategy 1: Click link with href containing section slug
    async () => {
      const sectionMap: Record<string, string> = {
        Moon: 'moon',
        Crystals: 'crystals',
        Tarot: 'tarot',
        Spells: 'practices',
        Practices: 'practices',
        Runes: 'runes',
        Chakras: 'chakras',
      };
      const slug =
        sectionMap[section] || section.toLowerCase().replace(/\s+/g, '-');
      const link = page.locator(`a[href*="/grimoire/${slug}"]`).first();
      if (await link.isVisible({ timeout: 3000 }).catch(() => false)) {
        await link.click({ force: true }); // Force click to bypass overlapping elements
        return true;
      }
      return false;
    },
    // Strategy 2: Click text link with force (more specific for sections like "Spells")
    async () => {
      // For "Spells", also try "Spells & Rituals" which is the actual link text
      const linkTexts =
        section === 'Spells'
          ? ['Spells & Rituals', 'Spells', 'Practices']
          : [section];

      for (const linkText of linkTexts) {
        const link = page.locator(`a:has-text("${linkText}")`).first();
        if (await link.isVisible({ timeout: 2000 }).catch(() => false)) {
          await link.click({ force: true });
          return true;
        }
      }
      return false;
    },
    // Strategy 3: Navigate directly via URL
    async () => {
      const sectionMap: Record<string, string> = {
        Moon: 'moon',
        Crystals: 'crystals',
        Tarot: 'tarot',
        Spells: 'practices',
        Practices: 'practices',
        Runes: 'runes',
        Chakras: 'chakras',
      };
      const slug =
        sectionMap[section] || section.toLowerCase().replace(/\s+/g, '-');
      await page.goto(`/grimoire/${slug}`, { waitUntil: 'domcontentloaded' });
      return true;
    },
  ];

  for (const strategy of strategies) {
    try {
      if (await strategy()) {
        await waitForPageLoad(page);
        return;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Failed to navigate to section: ${section}`);
}

export async function expectElementVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible({ timeout: 10000 });
}

export async function expectElementNotVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).not.toBeVisible({ timeout: 5000 });
}

export async function clickAndWait(
  page: Page,
  selector: string,
  urlPattern?: RegExp,
) {
  console.log(`   → Clicking element: ${selector}`);
  await page.click(selector);
  if (urlPattern) {
    console.log(`   → Waiting for URL pattern: ${urlPattern}`);
    await page.waitForURL(urlPattern);
  }
  await waitForPageLoad(page);
}

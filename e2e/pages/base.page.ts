import type { Page } from '@playwright/test';

/**
 * Base Page Object Model
 *
 * All page objects extend this class for shared navigation,
 * scroll, and selector helpers.
 */
export class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navigate to a path and wait for hydration */
  async goto(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.waitForHydration();
  }

  /** Smooth scroll down by distance in pixels */
  async scrollDown(distance: number) {
    await this.page.evaluate(async (d) => {
      const el =
        document.querySelector<HTMLElement>(
          'div[class*="overflow-y-auto"], div[class*="overflow-auto"]',
        ) ?? window;

      const steps = Math.ceil(d / 80);
      const stepDist = d / steps;

      for (let i = 0; i < steps; i++) {
        if (el instanceof HTMLElement) {
          el.scrollBy({ top: stepDist, behavior: 'smooth' });
        } else {
          window.scrollBy({ top: stepDist, behavior: 'smooth' });
        }
        await new Promise((r) => setTimeout(r, 120));
      }
    }, distance);
    await this.page.waitForTimeout(400);
  }

  /** Smooth scroll up by distance in pixels */
  async scrollUp(distance: number) {
    await this.scrollDown(-Math.abs(distance));
  }

  /** Wait for React hydration to complete */
  async waitForHydration(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  /** Dismiss any open modals via Escape + optional backdrop click */
  async dismissModals() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    try {
      await this.page.click(
        '.fixed.inset-0.bg-black, [class*="backdrop"], [class*="overlay"]',
        { timeout: 1000 },
      );
    } catch {
      // No backdrop found
    }
    await this.page.waitForTimeout(300);
  }

  /** Shorthand for data-testid selector */
  sel(testId: string): string {
    return `[data-testid="${testId}"]`;
  }

  /** Check if an element with the given testid is visible */
  async isVisible(testId: string): Promise<boolean> {
    return this.page.locator(this.sel(testId)).isVisible();
  }

  /** Click an element by testid */
  async clickTestId(testId: string, options?: { force?: boolean }) {
    await this.page.click(this.sel(testId), options);
    await this.page.waitForTimeout(300);
  }

  /** Scroll to an element by testid */
  async scrollToTestId(testId: string) {
    await this.page.locator(this.sel(testId)).scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(400);
  }
}

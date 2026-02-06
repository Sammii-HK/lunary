import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Crystals Page Object Model — /grimoire/crystals
 */
export class CrystalsPage extends BasePage {
  readonly crystalCategories = this.sel('crystal-categories');
  readonly crystalCard = this.sel('crystal-card');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/grimoire/crystals');
  }

  async scrollCrystalList() {
    await this.scrollToTestId('crystal-categories');
    await this.scrollDown(400);
  }

  async clickCrystal(slug: string) {
    await this.page.click(`[data-crystal-slug="${slug}"]`);
    await this.page.waitForTimeout(500);
  }

  async scrollCrystalDetail() {
    await this.scrollDown(300);
  }
}

import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Grimoire Main Page Object Model — /grimoire
 */
export class GrimoirePage extends BasePage {
  readonly grimoirePage = this.sel('grimoire-page');
  readonly grimoireSearch = this.sel('grimoire-search');
  readonly grimoireCategories = this.sel('grimoire-categories');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/grimoire');
  }

  async search(query: string) {
    await this.page.fill(this.grimoireSearch, query);
    await this.page.waitForTimeout(500);
  }

  async scrollCategories() {
    await this.scrollToTestId('grimoire-categories');
    await this.scrollDown(400);
  }
}

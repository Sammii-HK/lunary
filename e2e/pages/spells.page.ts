import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Spells Page Object Model — /grimoire/spells
 */
export class SpellsPage extends BasePage {
  readonly spellsPage = this.sel('spells-page');
  readonly spellFilters = this.sel('spell-filters');
  readonly spellList = this.sel('spell-list');
  readonly spellCard = this.sel('spell-card');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/grimoire/spells');
  }

  async openFilters() {
    await this.page.click(this.spellFilters);
    await this.page.waitForTimeout(300);
  }

  async scrollSpellList() {
    await this.scrollToTestId('spell-list');
    await this.scrollDown(300);
  }

  async clickSpell(index = 0) {
    const spells = this.page.locator(this.spellCard);
    await spells.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async scrollSpellDetail() {
    await this.scrollDown(400);
  }
}

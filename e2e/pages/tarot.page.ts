import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Tarot Page Object Model — /tarot
 */
export class TarotPage extends BasePage {
  readonly patternSection = this.sel('pattern-analysis-section');
  readonly timeframeSelector = this.sel('pattern-timeframe-selector');
  readonly pattern7days = this.sel('pattern-7days');
  readonly pattern30days = this.sel('pattern-30days');
  readonly pattern90days = this.sel('pattern-90days');
  readonly pattern180days = this.sel('pattern-180days');
  readonly ritualsSection = this.sel('rituals-prompts-section');
  readonly spreadsSection = this.sel('tarot-spreads-section');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/tarot');
  }

  async scrollToPatterns() {
    await this.scrollToTestId('pattern-analysis-section');
  }

  async selectTimeframe(days: number) {
    await this.page.click(this.sel(`pattern-${days}days`));
    await this.page.waitForTimeout(500);
  }

  async scrollToRituals() {
    await this.scrollToTestId('rituals-prompts-section');
  }

  async scrollToSpreads() {
    await this.scrollToTestId('tarot-spreads-section');
  }

  async selectSpread(name: string) {
    await this.page.click(`button:has-text("${name}")`);
    await this.page.waitForTimeout(500);
  }
}

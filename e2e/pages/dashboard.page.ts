import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object Model — /app
 */
export class DashboardPage extends BasePage {
  readonly moonPhaseCard = this.sel('moon-phase-card');
  readonly skyNowWidget = this.sel('sky-now-widget');
  readonly skyNowExpand = this.sel('sky-now-expand');
  readonly planetItem = this.sel('planet-item');
  readonly transitCard = this.sel('transit-card');
  readonly tarotDailyCard = this.sel('tarot-daily-card');
  readonly crystalCard = this.sel('crystal-card');
  readonly crystalModal = this.sel('crystal-modal');
  readonly journalPrompt = this.sel('journal-prompt');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/app');
  }

  async expandSkyNow() {
    await this.page.click(this.skyNowWidget);
    await this.page.waitForTimeout(500);
  }

  async scrollToTransits() {
    await this.scrollToTestId('transit-card');
  }

  async scrollToTarotCard() {
    await this.scrollToTestId('tarot-daily-card');
  }

  async scrollToCrystal() {
    await this.scrollToTestId('crystal-card');
  }

  async openCrystalModal() {
    await this.page.click(this.crystalCard);
    await this.page.waitForTimeout(500);
  }
}

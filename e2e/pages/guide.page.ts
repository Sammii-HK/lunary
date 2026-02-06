import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Guide Page Object Model — /guide
 */
export class GuidePage extends BasePage {
  readonly astralGuide = this.sel('astral-guide');
  readonly guideMessages = this.sel('guide-messages');
  readonly guideInput = this.sel('guide-input');
  readonly guideSubmit = this.sel('guide-submit');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/guide');
  }

  async typeQuestion(text: string) {
    await this.page.fill(this.guideInput, text);
    await this.page.waitForTimeout(300);
  }

  async submit() {
    await this.page.click(this.guideSubmit);
    await this.page.waitForTimeout(500);
  }

  async waitForResponse(timeout = 10000) {
    await this.page.waitForSelector('.prose, [class*="message"]', { timeout });
  }

  async scrollThroughResponse() {
    await this.scrollDown(300);
  }
}

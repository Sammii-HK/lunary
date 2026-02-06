import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Horoscope Page Object Model — /horoscope
 */
export class HoroscopePage extends BasePage {
  readonly numerologySection = this.sel('numerology-section');
  readonly numerologyDay = this.sel('numerology-day');
  readonly numerologyMonth = this.sel('numerology-month');
  readonly transitWisdomSection = this.sel('transit-wisdom-section');
  readonly todaysAspectsSection = this.sel('today-aspects-section');
  readonly upcomingTransitsSection = this.sel('personal-transits-section');
  readonly ritualSection = this.sel('ritual-section');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/horoscope');
  }

  async scrollToNumerology() {
    await this.scrollToTestId('numerology-section');
  }

  async openNumerologyDay() {
    await this.page.click(this.numerologyDay);
    await this.page.waitForTimeout(500);
  }

  async closeNumerologyModal() {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
  }

  async scrollToTransitWisdom() {
    await this.scrollToTestId('transit-wisdom-section');
  }

  async scrollToAspects() {
    await this.scrollToTestId('today-aspects-section');
  }

  async scrollToUpcomingTransits() {
    await this.scrollToTestId('personal-transits-section');
  }

  async scrollToRituals() {
    await this.scrollToTestId('ritual-section');
  }
}

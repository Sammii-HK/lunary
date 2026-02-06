import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Profile Page Object Model — /profile
 */
export class ProfilePage extends BasePage {
  readonly profilePage = this.sel('profile-page');
  readonly profileTabs = this.sel('profile-tabs');
  readonly cosmicProfileGrid = this.sel('cosmic-profile-grid');
  readonly circleSection = this.sel('circle-section');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/profile');
  }

  async switchToCircle() {
    await this.page.click('button:has-text("Circle"), [data-tab="circle"]');
    await this.page.waitForTimeout(500);
  }

  async clickFriend(index = 0) {
    const friends = this.page.locator('[data-testid="friend-card"]');
    await friends.nth(index).click();
    await this.page.waitForTimeout(500);
  }

  async scrollToLifeThemes() {
    await this.scrollDown(400);
  }

  async scrollToMonthlyInsights() {
    await this.scrollDown(300);
  }
}

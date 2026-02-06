import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Friend Profile Page Object Model — /profile/friends/[id]
 *
 * Uses the 31 existing data-testids from the friend profile component.
 */
export class FriendProfilePage extends BasePage {
  readonly friendProfilePage = this.sel('friend-profile-page');
  readonly backToCircle = this.sel('back-to-circle');
  readonly friendProfileHeader = this.sel('friend-profile-header');
  readonly compatibilityScore = this.sel('compatibility-score');
  readonly friendProfileTabs = this.sel('friend-profile-tabs');
  readonly tabOverview = this.sel('tab-overview');
  readonly tabSynastry = this.sel('tab-synastry');
  readonly tabChart = this.sel('tab-chart');
  readonly tabTiming = this.sel('tab-timing');
  readonly synastryAspectsSection = this.sel('synastry-aspects-section');
  readonly timingWindows = this.sel('timing-windows');

  constructor(page: Page) {
    super(page);
  }

  async switchToTab(tab: 'overview' | 'synastry' | 'chart' | 'timing') {
    await this.clickTestId(`tab-${tab}`);
  }

  async scrollToAspects() {
    await this.scrollToTestId('synastry-aspects-section');
  }

  async scrollToTiming() {
    await this.scrollToTestId('timing-windows');
  }
}

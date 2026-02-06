import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Birth Chart Page Object Model — /birth-chart
 */
export class BirthChartPage extends BasePage {
  readonly birthChartPage = this.sel('birth-chart-page');
  readonly chartVisualization = this.sel('chart-visualization');
  readonly planetsList = this.sel('planets-list');
  readonly aspectsList = this.sel('aspects-list');
  readonly housesList = this.sel('houses-list');

  constructor(page: Page) {
    super(page);
  }

  async goto() {
    await super.goto('/birth-chart');
  }

  async scrollPlanetList() {
    await this.scrollToTestId('planets-list');
    await this.scrollDown(300);
  }

  async scrollAspectsList() {
    await this.scrollToTestId('aspects-list');
    await this.scrollDown(250);
  }

  async scrollHousesList() {
    await this.scrollToTestId('houses-list');
    await this.scrollDown(250);
  }
}

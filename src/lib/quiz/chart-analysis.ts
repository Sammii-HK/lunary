import type { HouseNumber } from './types';

export type HouseNature = 'angular' | 'succedent' | 'cadent';

const ANGULAR: Set<HouseNumber> = new Set([1, 4, 7, 10]);
const SUCCEDENT: Set<HouseNumber> = new Set([2, 5, 8, 11]);

export function getHouseNature(n: HouseNumber): HouseNature {
  if (ANGULAR.has(n)) return 'angular';
  if (SUCCEDENT.has(n)) return 'succedent';
  return 'cadent';
}

export function describeHouseNature(nature: HouseNature): string {
  switch (nature) {
    case 'angular':
      return 'an angular house, these are the loud houses of the chart. Planets placed here act visibly, on the outside world.';
    case 'succedent':
      return 'a succedent house, planets here build, accumulate, and consolidate. Steady rather than loud.';
    case 'cadent':
      return 'a cadent house, planets here work in processing, learning, transition. Often behind the scenes.';
  }
}

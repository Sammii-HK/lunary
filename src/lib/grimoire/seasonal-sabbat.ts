import { getSeasonalSabbat } from './data-accessor';

/**
 * A sabbat is considered "seasonally relevant" (spells and other content
 * locked to it can surface in general queries) when it is active
 * (within ±7 days of its date) or recently passed (within the last 21
 * days). Upcoming sabbats do NOT count — content for an upcoming sabbat
 * is for the sabbat energy once it arrives, not for random queries weeks
 * before it.
 *
 * Prevents the class of bugs where sabbat-locked content leaks into
 * general moon-phase / daily / weekly surfaces out of season (e.g. a
 * Samhain ancestor ritual appearing during an April new moon).
 */
export function isSabbatSeasonallyRelevant(
  sabbatName: string,
  now: Date = new Date(),
): boolean {
  const seasonal = getSeasonalSabbat(now);
  if (!seasonal) return false;
  // Only count as relevant if it's active or recently passed (daysOffset <= 0)
  if (seasonal.daysOffset > 0) return false;
  return seasonal.sabbat.name.toLowerCase() === sabbatName.toLowerCase();
}

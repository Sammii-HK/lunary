/**
 * Get Personalized Tarot Card
 *
 * Keeps the Astral Guide's daily card aligned with the dashboard/widget card.
 */

import type { BirthChartPlacement } from '@/context/UserContext';
import { getTarotCard } from '../../../utils/tarot/tarot';

type PersonalizedTarotCard = ReturnType<typeof getTarotCard>;

function normalizeDateString(currentDate: string): string {
  return currentDate?.slice(0, 10) || new Date().toISOString().slice(0, 10);
}

/**
 * Get personalized daily tarot card
 *
 * The dashboard, widget sync, cron, and Astral Guide must use the same seed.
 * Birth-chart and moon arguments stay in the signature for existing callers,
 * but today's actual user-facing card is keyed by local date + profile.
 */
export function getPersonalizedTarotCard(
  currentDate: string,
  _birthChart: BirthChartPlacement[] | undefined,
  _moonSign: string | undefined,
  _moonPhase: string | undefined,
  _moonIllumination: number,
  userName?: string,
  userBirthday?: string,
): PersonalizedTarotCard {
  const dateStr = normalizeDateString(currentDate);
  return getTarotCard(`daily-${dateStr}`, userName, userBirthday);
}

/**
 * Demo mode constants - Single Source of Truth
 * Used by demo iframe and marketing pages
 */

import type { UserData } from '@/context/UserContext';
import referenceChartData from '@/lib/reference-chart-data.json';

/**
 * Demo persona user data
 * Represents Celeste's account with full Lunary+ Pro Annual access
 */
export const DEMO_USER_DATA: UserData = {
  id: 'celeste-demo',
  email: 'celeste@lunary.app',
  name: referenceChartData.persona.name,
  birthday: referenceChartData.persona.birthDate,
  birthChart: referenceChartData.planets as any,
  hasBirthChart: true,
  hasPersonalCard: true,
  isPaid: true,
  subscriptionStatus: 'trial',
  subscriptionPlan: 'lunary_plus_ai_annual',
  location: {
    latitude: 51.5074,
    longitude: -0.1278,
    city: 'London',
    country: 'UK',
    timezone: 'Europe/London',
    birthTime: referenceChartData.persona.birthTime,
    birthLocation: referenceChartData.persona.birthLocation,
    birthTimezone: referenceChartData.persona.birthTimezone,
  },
  personalCard: {
    name: 'The Star',
    keywords: ['Hope', 'Inspiration', 'Serenity'],
    information:
      'The Star brings renewed hope and spiritual insight. A time of healing and inspiration.',
    calculatedDate: new Date().toISOString(),
    reason: 'Aligned with your cosmic journey',
  },
};

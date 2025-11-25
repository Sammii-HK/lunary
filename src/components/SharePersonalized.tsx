'use client';

import { SocialShareButtons } from './SocialShareButtons';
import {
  generateStreakShareContent,
  generateMonthlyInsightsShareContent,
  generateHoroscopeShareContent,
  generateTransitShareContent,
} from '@/lib/share/content-generator';

interface SharePersonalizedProps {
  type: 'streak' | 'monthly-insights' | 'horoscope' | 'transit';
  data: {
    streak?: number;
    longestStreak?: number;
    month?: string;
    frequentCards?: Array<{ name: string; count: number }>;
    journalCount?: number;
    sign?: string;
    insight?: string;
    transit?: string;
    meaning?: string;
  };
}

export function SharePersonalized({ type, data }: SharePersonalizedProps) {
  let shareContent;

  switch (type) {
    case 'streak':
      if (data.streak !== undefined) {
        shareContent = generateStreakShareContent(
          data.streak,
          data.longestStreak || data.streak,
        );
      }
      break;
    case 'monthly-insights':
      if (data.month && data.frequentCards) {
        shareContent = generateMonthlyInsightsShareContent(
          data.month,
          data.frequentCards,
          data.journalCount || 0,
        );
      }
      break;
    case 'horoscope':
      if (data.sign && data.insight) {
        shareContent = generateHoroscopeShareContent(data.sign, data.insight);
      }
      break;
    case 'transit':
      if (data.transit && data.meaning) {
        shareContent = generateTransitShareContent(data.transit, data.meaning);
      }
      break;
  }

  if (!shareContent) {
    return null;
  }

  return (
    <SocialShareButtons
      url={shareContent.url}
      title={shareContent.title}
      description={shareContent.description}
      imageUrl={shareContent.imageUrl}
    />
  );
}

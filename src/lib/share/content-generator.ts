export interface ShareContent {
  title: string;
  description: string;
  imageUrl?: string;
  url: string;
}

export function generateStreakShareContent(
  streak: number,
  longestStreak: number,
): ShareContent {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const url = `${baseUrl}/profile`;

  if (streak === longestStreak && streak > 0) {
    return {
      title: `🔥 ${streak}-Day Streak!`,
      description: `I've maintained a ${streak}-day streak on Lunary! Join me on my cosmic journey.`,
      url,
    };
  }

  return {
    title: `🔥 ${streak}-Day Streak`,
    description: `I'm on a ${streak}-day streak on Lunary! Tracking my cosmic journey daily.`,
    url,
  };
}

export function generateMonthlyInsightsShareContent(
  month: string,
  frequentCards: Array<{ name: string; count: number }>,
  journalCount: number,
): ShareContent {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const url = `${baseUrl}/profile`;

  const cardNames = frequentCards
    .slice(0, 3)
    .map((c) => c.name)
    .join(', ');
  const insights = [];

  if (frequentCards.length > 0) {
    insights.push(`Most frequent cards: ${cardNames}`);
  }
  if (journalCount > 0) {
    insights.push(
      `${journalCount} journal entr${journalCount !== 1 ? 'ies' : 'y'}`,
    );
  }

  return {
    title: `${month} Cosmic Insights`,
    description: `My ${month} cosmic journey: ${insights.join(' • ')}`,
    url,
  };
}

export function generateHoroscopeShareContent(
  sign: string,
  insight: string,
): ShareContent {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const url = `${baseUrl}/horoscope`;

  return {
    title: `${sign} Horoscope`,
    description: insight,
    url,
  };
}

export function generateTransitShareContent(
  transit: string,
  meaning: string,
): ShareContent {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lunary.app';
  const url = `${baseUrl}/cosmic`;

  return {
    title: transit,
    description: meaning,
    url,
  };
}

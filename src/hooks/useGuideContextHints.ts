'use client';

import { useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useMoonData } from '@/context/AstronomyContext';
import { useSubscription } from './useSubscription';
import { hasFeatureAccess } from '../../utils/pricing';

export interface GuideContextHint {
  id: string;
  title: string;
  shortText: string;
  suggestedPrompt: string;
  priority: number;
}

type HintLocation = 'tarot' | 'horoscope' | 'profile' | 'journal';

const LOCATION_HINTS: Record<
  HintLocation,
  (ctx: HintContext) => GuideContextHint | null
> = {
  tarot: (ctx) => {
    if (ctx.hasTarotPatterns) {
      return {
        id: 'tarot-patterns',
        title: 'Explore Your Patterns',
        shortText: 'Your recent cards reveal recurring themes.',
        suggestedPrompt:
          'What do my recent tarot patterns mean for my current situation?',
        priority: 2,
      };
    }
    return {
      id: 'tarot-daily',
      title: 'Daily Card Insight',
      shortText: "Get deeper meaning from today's card.",
      suggestedPrompt:
        'Help me understand what my daily card is trying to tell me.',
      priority: 1,
    };
  },
  horoscope: (ctx) => {
    if (ctx.hasTransits) {
      return {
        id: 'transit-guidance',
        title: 'Transit Wisdom',
        shortText: 'Current planetary movements are affecting your chart.',
        suggestedPrompt: "How should I work with today's transits?",
        priority: 2,
      };
    }
    if (ctx.moonPhase) {
      return {
        id: 'moon-guidance',
        title: `${ctx.moonPhase} Guidance`,
        shortText: 'Align your energy with the lunar cycle.',
        suggestedPrompt: `What should I focus on during this ${ctx.moonPhase}?`,
        priority: 1,
      };
    }
    return null;
  },
  profile: (ctx) => {
    if (ctx.hasLifeTheme) {
      return {
        id: 'life-theme',
        title: 'Your Current Theme',
        shortText: 'Patterns are emerging in your journey.',
        suggestedPrompt:
          "Tell me more about the themes you're seeing in my life right now.",
        priority: 3,
      };
    }
    if (ctx.hasBirthChart) {
      return {
        id: 'birth-chart',
        title: 'Chart Insights',
        shortText: 'Discover what your cosmic blueprint reveals.',
        suggestedPrompt:
          'What are the most important things in my birth chart right now?',
        priority: 1,
      };
    }
    return null;
  },
  journal: (ctx) => {
    if (ctx.hasJournalPatterns) {
      return {
        id: 'journal-patterns',
        title: 'Reflection Patterns',
        shortText: 'Your writings reveal deeper themes.',
        suggestedPrompt: 'What patterns do you see in my recent reflections?',
        priority: 2,
      };
    }
    return {
      id: 'journal-prompt',
      title: 'Guided Reflection',
      shortText: "Let me help you explore what's on your mind.",
      suggestedPrompt:
        'Give me a journaling prompt based on my current cosmic energy.',
      priority: 1,
    };
  },
};

interface HintContext {
  moonPhase: string | null;
  hasBirthChart: boolean;
  hasTarotPatterns: boolean;
  hasJournalPatterns: boolean;
  hasTransits: boolean;
  hasLifeTheme: boolean;
  isPremium: boolean;
}

export function useGuideContextHints(
  location: HintLocation,
): GuideContextHint | null {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentMoonPhase } = useMoonData();

  const hasPersonalizedHoroscopeAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );
  const hasTarotPatternsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'tarot_patterns',
  );
  const hasTransitsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_transit_readings',
  );
  const hasCosmicProfileAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'cosmic_profile',
  );
  const hasMonthlyInsightsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'monthly_insights',
  );

  const hint = useMemo(() => {
    const context: HintContext = {
      moonPhase: currentMoonPhase || null,
      hasBirthChart: !!user?.birthChart,
      hasTarotPatterns: hasTarotPatternsAccess,
      hasJournalPatterns: hasMonthlyInsightsAccess,
      hasTransits: hasTransitsAccess && !!user?.birthChart,
      hasLifeTheme: hasCosmicProfileAccess,
      isPremium: hasPersonalizedHoroscopeAccess,
    };

    const hintGenerator = LOCATION_HINTS[location];
    return hintGenerator ? hintGenerator(context) : null;
  }, [
    location,
    currentMoonPhase,
    user?.birthChart,
    hasPersonalizedHoroscopeAccess,
    hasTarotPatternsAccess,
    hasTransitsAccess,
    hasCosmicProfileAccess,
    hasMonthlyInsightsAccess,
  ]);

  return hint;
}

export function useGuideContextHintsMultiple(
  locations: HintLocation[],
): GuideContextHint[] {
  const { user } = useUser();
  const subscription = useSubscription();
  const { currentMoonPhase } = useMoonData();

  const hasPersonalizedHoroscopeAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_horoscope',
  );
  const hasTarotPatternsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'tarot_patterns',
  );
  const hasTransitsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'personalized_transit_readings',
  );
  const hasCosmicProfileAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'cosmic_profile',
  );
  const hasMonthlyInsightsAccess = hasFeatureAccess(
    subscription.status,
    subscription.plan,
    'monthly_insights',
  );

  const hints = useMemo(() => {
    const context: HintContext = {
      moonPhase: currentMoonPhase || null,
      hasBirthChart: !!user?.birthChart,
      hasTarotPatterns: hasTarotPatternsAccess,
      hasJournalPatterns: hasMonthlyInsightsAccess,
      hasTransits: hasTransitsAccess && !!user?.birthChart,
      hasLifeTheme: hasCosmicProfileAccess,
      isPremium: hasPersonalizedHoroscopeAccess,
    };

    const allHints: GuideContextHint[] = [];

    for (const location of locations) {
      const hintGenerator = LOCATION_HINTS[location];
      const hint = hintGenerator ? hintGenerator(context) : null;
      if (hint) {
        allHints.push(hint);
      }
    }

    allHints.sort((a, b) => b.priority - a.priority);
    return allHints.slice(0, 3);
  }, [
    locations,
    currentMoonPhase,
    user?.birthChart,
    hasPersonalizedHoroscopeAccess,
    hasTarotPatternsAccess,
    hasTransitsAccess,
    hasCosmicProfileAccess,
    hasMonthlyInsightsAccess,
  ]);

  return hints;
}

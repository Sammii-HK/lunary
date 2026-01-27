import type { FeatureTour } from './tour-system';

// Helper to check if near new or full moon (within 2 days)
function isNearMoonPhase(): boolean {
  const now = new Date();
  const lunarMonth = 29.53059; // days
  const knownNewMoon = new Date('2000-01-06'); // Reference new moon

  const daysSinceReference = (now.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24);
  const currentLunarDay = daysSinceReference % lunarMonth;

  // Check if within 2 days of new moon (0) or full moon (14.76)
  return (currentLunarDay < 2 || currentLunarDay > lunarMonth - 2) ||
         (Math.abs(currentLunarDay - 14.76) < 2);
}

export const FEATURE_TOURS: FeatureTour[] = [
  // FIRST TIME ONBOARDING (all users)
  {
    id: 'first_time_onboarding',
    name: 'Welcome to Lunary',
    trigger: 'first_visit',
    showOnce: true,
    steps: [
      {
        target: '.dashboard-container',
        title: 'Your Cosmic Dashboard',
        content: 'Every morning, we update this with personalized insights from your birth chart.',
        icon: 'Sparkles',
        placement: 'center',
        action: {
          label: 'Next',
          variant: 'primary',
        },
      },
      {
        target: '[data-nav="guide"]',
        title: 'Astral Guide',
        content: (tier) =>
          tier === 'free'
            ? 'Ask questions about your chart, transits, or practices. Free tier: 3 questions per day.'
            : 'Ask questions about your chart, transits, or practices. Your conversations build context over time.',
        icon: 'MessageCircle',
        placement: 'right',
        action: {
          label: 'Next',
          variant: 'primary',
        },
      },
      {
        target: '[data-nav="tarot"]',
        title: 'Personal Tarot',
        content: (tier) =>
          tier === 'free'
            ? 'Draw your daily tarot card. Free tier: 1 spread per month.'
            : 'Draw personalized tarot cards seeded from your birth chart.',
        icon: 'Sparkles',
        placement: 'right',
        action: {
          label: 'Next',
          variant: 'primary',
        },
      },
      {
        target: '[data-nav="explore"]',
        title: (tier) =>
          tier === 'free' ? 'Explore Features' : 'Your Toolkit',
        content: (tier) =>
          tier === 'free'
            ? 'Access your Book of Shadows journal and discover more features. Upgrade to unlock Collections and more.'
            : 'Access Collections to save insights, your Book of Shadows journal, birth chart, and more.',
        icon: 'FolderOpen',
        placement: 'right',
        action: {
          label: 'Got it',
          variant: 'primary',
        },
      },
    ],
  },

  // COLLECTIONS DISCOVERY (paid users only)
  {
    id: 'collections_discovery',
    name: 'Discover Collections',
    trigger: 'after_chat',
    triggerCondition: (ctx) =>
      ctx.chatCount === 3 &&
      !ctx.hasSeenTour('collections_discovery'),
    excludedTier: ['free'],
    requiredTier: ['lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual'],
    steps: [
      {
        target: '.chat-message:last-child',
        title: 'Save to Collections',
        content: 'Love this response? Save it to Collections and organize in custom folders.',
        icon: 'FolderOpen',
        placement: 'right',
        action: {
          label: 'Show me Collections',
          variant: 'primary',
        },
      },
    ],
  },

  // CHAT LIMIT REACHED (free users)
  {
    id: 'chat_limit_reached',
    name: 'Chat Limit Reached',
    trigger: 'limit_hit',
    requiredTier: ['free'],
    showUpgradePrompt: true,
    steps: [
      {
        target: '.chat-input-container',
        title: 'Daily Limit Reached',
        content: 'You\'ve used all 3 questions today. Upgrade to continue the conversation.',
        icon: 'AlertCircle',
        placement: 'top',
        action: {
          label: 'Upgrade to Lunary+',
          variant: 'primary',
          href: '/pricing',
        },
        secondaryAction: {
          label: 'Try tomorrow',
          onClick: () => {},
        },
      },
    ],
  },

  // TAROT LIMIT REACHED (free users)
  {
    id: 'tarot_limit_reached',
    name: 'Tarot Limit Reached',
    trigger: 'limit_hit',
    requiredTier: ['free'],
    showUpgradePrompt: true,
    steps: [
      {
        target: '.tarot-container',
        title: 'Monthly Spread Used',
        content: 'Free tier includes 1 spread per month. Upgrade for 10 spreads/month or unlimited on Pro Annual.',
        icon: 'AlertCircle',
        placement: 'center',
        action: {
          label: 'View plans',
          variant: 'primary',
          href: '/pricing',
        },
      },
    ],
  },

  // BOOK OF SHADOWS INTRO (paid users after first journal save)
  {
    id: 'book_of_shadows_intro',
    name: 'Book of Shadows',
    trigger: 'milestone',
    triggerCondition: (ctx) =>
      ctx.journalCount === 1 &&
      !ctx.hasSeenTour('book_of_shadows_intro'),
    excludedTier: ['free'],
    steps: [
      {
        target: '[href="/book-of-shadows"]',
        title: 'Your Living Journal',
        content: 'Track patterns, dreams, and cosmic connections over time. All your reflections in one place.',
        icon: 'BookOpen',
        placement: 'right',
        action: {
          label: 'View Book of Shadows',
          variant: 'primary',
          href: '/book-of-shadows',
        },
      },
    ],
  },

  // MOON CIRCLES (paid users, 2 days before new/full moon)
  {
    id: 'moon_circles_unlock',
    name: 'Moon Circle Available',
    trigger: 'milestone',
    triggerCondition: (ctx) =>
      isNearMoonPhase() &&
      !ctx.hasSeenTour('moon_circles_unlock'),
    requiredTier: ['lunary_plus', 'lunary_plus_ai', 'lunary_plus_ai_annual'],
    steps: [
      {
        target: '[href="/moon-circles"]',
        title: 'New Moon Circle',
        content: 'Set intentions aligned with the New Moon energy. Get guidance for this lunar cycle.',
        icon: 'Moon',
        placement: 'right',
        action: {
          label: 'Join this circle',
          variant: 'primary',
          href: '/moon-circles',
        },
      },
    ],
  },

  // WEEKLY REPORT AVAILABLE (all users)
  {
    id: 'weekly_report_available',
    name: 'Weekly Report Available',
    trigger: 'milestone',
    triggerCondition: (ctx) =>
      ctx.daysActive >= 7 &&
      !ctx.hasSeenTour('weekly_report_available'),
    steps: [
      {
        target: '[data-nav="weekly-report"]',
        title: 'Your Weekly Cosmic Report',
        content: 'Review your week\'s patterns, insights, and astrological highlights in one comprehensive report.',
        icon: 'TrendingUp',
        placement: 'right',
        action: {
          label: 'View Report',
          variant: 'primary',
        },
      },
    ],
  },
];

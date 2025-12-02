export type NotificationTier = 'free' | 'paid';
export type NotificationCadence = 'daily' | 'weekly' | 'monthly' | 'event';

export interface NotificationCopy {
  title: string;
  body: string;
}

export interface TieredNotificationCopy {
  free: NotificationCopy;
  paid: NotificationCopy | ((context: PersonalizedContext) => NotificationCopy);
}

export interface PersonalizedContext {
  name?: string;
  tarotCard?: string;
  energyTheme?: string;
  crystal?: string;
  transit?: string;
  moonPhase?: string;
  sunSign?: string;
  risingSign?: string;
}

const DAILY_NOTIFICATIONS: Record<string, TieredNotificationCopy> = {
  insight: {
    free: {
      title: 'Lunary',
      body: '✨ Your Lunary Insight is ready.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.name
        ? `✨ Your Lunary Insight is ready, ${ctx.name}.`
        : '✨ Your Lunary Insight is ready.',
    }),
  },
  tarot: {
    free: {
      title: 'Lunary',
      body: "🃏 Today's tarot pattern is available.",
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.tarotCard
        ? `🃏 Your tarot card today is ${ctx.tarotCard}.`
        : '🃏 Your personal tarot is ready.',
    }),
  },
  moon_phase: {
    free: {
      title: 'Lunary',
      body: "🌙 Today's moon phase is live.",
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.moonPhase
        ? `🌙 The ${ctx.moonPhase} influences your day.`
        : '🌙 Your moon insight is ready.',
    }),
  },
  sky_shift: {
    free: {
      title: 'Lunary',
      body: '🌌 The sky has shifted today.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.transit
        ? `🌌 A new transit is active in your chart.`
        : '🌌 Your chart has a new activation today.',
    }),
  },
  energy_theme: {
    free: {
      title: 'Lunary',
      body: "⚡ Today's energy theme is available.",
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.energyTheme
        ? `⚡ Your energy theme today is ${ctx.energyTheme.toLowerCase()}.`
        : '⚡ Your energy theme has updated.',
    }),
  },
};

const WEEKLY_NOTIFICATIONS: Record<string, TieredNotificationCopy> = {
  monday_week_ahead: {
    free: {
      title: 'Lunary',
      body: '📅 Your Week Ahead is ready.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.name
        ? `📅 Your personal Week Ahead is ready, ${ctx.name}.`
        : '📅 Your personal Week Ahead is ready.',
    }),
  },
  friday_tarot: {
    free: {
      title: 'Lunary',
      body: "🔮 This week's tarot pattern is ready.",
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: '🔮 Your weekly tarot pattern is ready.',
    }),
  },
  sunday_reset: {
    free: {
      title: 'Lunary',
      body: '🌀 Your cosmic reset is available.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.name
        ? `🌀 Your personal cosmic reset is ready, ${ctx.name}.`
        : '🌀 Your personal cosmic reset is ready.',
    }),
  },
};

const MONTHLY_NOTIFICATIONS: Record<string, TieredNotificationCopy> = {
  new_moon: {
    free: {
      title: 'Lunary',
      body: '🌑 The new moon is today.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.name
        ? `🌑 Your new moon insight is ready, ${ctx.name}.`
        : '🌑 Your new moon insight is ready.',
    }),
  },
  full_moon: {
    free: {
      title: 'Lunary',
      body: '🌕 The full moon insight is available.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: '🌕 Your full moon reflection has arrived.',
    }),
  },
};

const EVENT_NOTIFICATIONS: Record<string, TieredNotificationCopy> = {
  transit_change: {
    free: {
      title: 'Lunary',
      body: '💫 A cosmic shift is occurring.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.transit
        ? `💫 A new emotional transit is active for you.`
        : '💫 A new transit is active in your chart.',
    }),
  },
  rising_activation: {
    free: {
      title: 'Lunary',
      body: '⬆️ Rising sign energy is activated.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.risingSign
        ? `⬆️ Your ${ctx.risingSign} rising is activated today.`
        : '⬆️ Your rising sign is activated today.',
    }),
  },
  tarot_alignment: {
    free: {
      title: 'Lunary',
      body: "🎴 Today's tarot has special significance.",
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: "🎴 Today's tarot aligns with your chart.",
    }),
  },
  sun_activation: {
    free: {
      title: 'Lunary',
      body: '☀️ Solar energy is heightened today.',
    },
    paid: (ctx) => ({
      title: 'Lunary',
      body: ctx.sunSign
        ? `☀️ Your ${ctx.sunSign} Sun is activated today.`
        : '☀️ Your Sun sign is activated today.',
    }),
  },
};

export function getNotificationCopy(
  cadence: NotificationCadence,
  type: string,
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  let templates: Record<string, TieredNotificationCopy>;

  switch (cadence) {
    case 'daily':
      templates = DAILY_NOTIFICATIONS;
      break;
    case 'weekly':
      templates = WEEKLY_NOTIFICATIONS;
      break;
    case 'monthly':
      templates = MONTHLY_NOTIFICATIONS;
      break;
    case 'event':
      templates = EVENT_NOTIFICATIONS;
      break;
    default:
      templates = DAILY_NOTIFICATIONS;
  }

  const template = templates[type];
  if (!template) {
    return {
      title: 'Lunary',
      body: '✨ Your Lunary Insight is ready.',
    };
  }

  if (tier === 'free') {
    return template.free;
  }

  const paidTemplate = template.paid;
  if (typeof paidTemplate === 'function') {
    return paidTemplate(context || {});
  }

  return paidTemplate;
}

export function getDailyInsightCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('daily', 'insight', tier, context);
}

export function getDailyTarotCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('daily', 'tarot', tier, context);
}

export function getWeekAheadCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('weekly', 'monday_week_ahead', tier, context);
}

export function getWeeklyTarotCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('weekly', 'friday_tarot', tier, context);
}

export function getCosmicResetCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('weekly', 'sunday_reset', tier, context);
}

export function getNewMoonCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('monthly', 'new_moon', tier, context);
}

export function getFullMoonCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('monthly', 'full_moon', tier, context);
}

export function getTransitChangeCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('event', 'transit_change', tier, context);
}

export function getRisingActivationCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('event', 'rising_activation', tier, context);
}

export function getTarotAlignmentCopy(
  tier: NotificationTier,
  context?: PersonalizedContext,
): NotificationCopy {
  return getNotificationCopy('event', 'tarot_alignment', tier, context);
}

export const UPGRADE_NUDGES = {
  personalizedTarot: 'Personalised tarot available in Lunary+.',
  personalTransits: 'Unlock your personal transits with Lunary+.',
  chartInteraction: "See how today's sky interacts with your chart.",
  personalInsight: 'Your personal Lunary Insight is available with Lunary+.',
  weeklyPersonal: 'Get your personal Week Ahead with Lunary+.',
  moonPersonal: 'Unlock your personal moon insights with Lunary+.',
} as const;

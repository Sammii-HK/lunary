import {
  RitualContext,
  RitualMessage,
  MESSAGE_POOLS,
  COSMIC_RESET_MESSAGES,
} from './message-pools';

export interface WeeklyInsights {
  mainTransits: string[];
  moonPhases: string[];
  energyThemes: string[];
  dominantTheme: string;
}

export interface GetRitualMessageOptions {
  context: RitualContext;
  isPremium: boolean;
  userName?: string;
  weeklyInsights?: WeeklyInsights;
}

export interface RitualMessageResult {
  id: string;
  message: string;
}

export async function getMessagePerformance(
  messageId: string,
): Promise<{ sent: number; opened: number; rate: number }> {
  try {
    const response = await fetch(
      `/api/rituals/track/performance?messageId=${messageId}`,
    );
    if (!response.ok) {
      return { sent: 0, opened: 0, rate: 0 };
    }
    return await response.json();
  } catch {
    return { sent: 0, opened: 0, rate: 0 };
  }
}

function selectMessagePool(
  context: RitualContext,
  isPremium: boolean,
): RitualMessage[] {
  switch (context) {
    case 'cosmic_reset':
      return isPremium ? COSMIC_RESET_MESSAGES : [];
    case 'morning':
      return MESSAGE_POOLS.morning;
    case 'evening':
      return MESSAGE_POOLS.evening;
    case 'new_moon':
      return MESSAGE_POOLS.new_moon;
    case 'full_moon':
      return MESSAGE_POOLS.full_moon;
    default:
      return MESSAGE_POOLS.morning;
  }
}

function pickMessage(pool: RitualMessage[]): RitualMessage {
  if (pool.length === 0) {
    return { id: 'fallback', text: 'Welcome back.' };
  }

  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  const index = dayOfYear % pool.length;
  return pool[index];
}

function personalizeMessage(
  template: string,
  options: {
    userName?: string;
    weeklyInsights?: WeeklyInsights;
  },
): string {
  let result = template;

  if (options.userName) {
    result = result.replace(/\{\{name\}\}/g, options.userName);
  } else {
    result = result.replace(/\{\{name\}\}/g, '');
  }

  if (options.weeklyInsights) {
    const { mainTransits, moonPhases, dominantTheme } = options.weeklyInsights;

    const transitsText =
      mainTransits.length > 0
        ? mainTransits.slice(0, 2).join(' and ')
        : 'subtle shifts';

    const moonText =
      moonPhases.length > 0 ? moonPhases[0] : 'shifting lunar energy';

    const themeText = dominantTheme || 'transformation';

    result = result.replace(/\{\{mainTransits\}\}/g, transitsText);
    result = result.replace(/\{\{moonPhases\}\}/g, moonText);
    result = result.replace(/\{\{dominantTheme\}\}/g, themeText);
  } else {
    result = result.replace(/\{\{mainTransits\}\}/g, 'meaningful patterns');
    result = result.replace(/\{\{moonPhases\}\}/g, 'the lunar cycle');
    result = result.replace(/\{\{dominantTheme\}\}/g, 'reflection');
  }

  return result.trim().replace(/\s+/g, ' ');
}

export function getRitualMessage(
  options: GetRitualMessageOptions,
): RitualMessageResult {
  const { context, isPremium, userName, weeklyInsights } = options;

  const pool = selectMessagePool(context, isPremium);

  if (pool.length === 0) {
    return {
      id: 'fallback',
      message: 'Welcome back.',
    };
  }

  const selected = pickMessage(pool);

  const message = personalizeMessage(selected.text, {
    userName,
    weeklyInsights,
  });

  return {
    id: selected.id,
    message,
  };
}

export function getRitualMessageSync(
  options: GetRitualMessageOptions,
): RitualMessageResult {
  return getRitualMessage(options);
}

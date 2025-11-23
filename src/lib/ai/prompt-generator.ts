import dayjs from 'dayjs';
import { sql } from '@vercel/postgres';
import { buildLunaryContext } from './context';
import { getBirthChart } from './providers';
import { getGlobalCosmicData } from '../cosmic-snapshot/global-cache';

export type PromptType = 'daily' | 'weekly';

export interface AIPrompt {
  id: number;
  promptType: PromptType;
  promptText: string;
  cosmicContext: {
    moonPhase?: string;
    moonSign?: string;
    mainTransit?: string;
    tarotCard?: string;
    lunarEvent?: string;
  };
  generatedAt: string;
  expiresAt: string;
  readAt: string | null;
  isNew: boolean;
}

/**
 * Generates a daily personalized prompt based on current cosmic data
 */
export async function generateDailyPrompt(
  userId: string,
  userName?: string,
  userBirthday?: string,
  timezone: string = 'Europe/London',
  now: Date = new Date(),
): Promise<string | null> {
  try {
    const { context } = await buildLunaryContext({
      userId,
      tz: timezone,
      locale: 'en-GB',
      displayName: userName,
      userBirthday,
      historyLimit: 0,
      includeMood: false,
      now,
    });

    const moonPhase = context.moon?.phase || 'Unknown';
    const moonSign = context.moon?.sign || 'Unknown';
    const moonEmoji = context.moon?.emoji || '🌙';

    // Get main transit
    const mainTransit =
      context.currentTransits && context.currentTransits.length > 0
        ? `${context.currentTransits[0].from} ${context.currentTransits[0].aspect} ${context.currentTransits[0].to}`
        : null;

    // Get today's tarot card
    const tarotCard = context.tarot.daily?.name || context.tarot.personal?.name;

    // Check for lunar events (new moon, full moon, etc.)
    const lunarEvent = getLunarEvent(context.moon);

    // Build personalized prompt
    const parts: string[] = [];

    // Greeting with moon phase
    parts.push(
      `Hello${userName ? ` ${userName}` : ''}! ${moonEmoji} Today's ${moonPhase} Moon in ${moonSign}`,
    );

    // Add lunar event if significant
    if (lunarEvent) {
      parts.push(lunarEvent);
    }

    // Add main transit
    if (mainTransit) {
      parts.push(`The sky shows ${mainTransit}`);
    }

    // Add tarot card
    if (tarotCard) {
      parts.push(`Your card for today: ${tarotCard}`);
    }

    // Add reflective question
    const question = getDailyReflectionQuestion(
      moonPhase,
      moonSign,
      mainTransit,
    );
    parts.push(question);

    return parts.join('. ') + '.';
  } catch (error) {
    console.error('[Prompt Generator] Failed to generate daily prompt:', error);
    return null;
  }
}

/**
 * Generates a weekly personalized prompt based on cosmic overview
 */
export async function generateWeeklyPrompt(
  userId: string,
  userName?: string,
  userBirthday?: string,
  timezone: string = 'Europe/London',
  now: Date = new Date(),
): Promise<string | null> {
  try {
    const { context } = await buildLunaryContext({
      userId,
      tz: timezone,
      locale: 'en-GB',
      displayName: userName,
      userBirthday,
      historyLimit: 0,
      includeMood: true,
      now,
    });

    const weekStart = dayjs(now).startOf('week');
    const weekEnd = dayjs(now).endOf('week');

    // Get weekly tarot card
    const weeklyCard = context.tarot.weekly?.name;

    // Get moon phases for the week
    const moonPhases = await getWeekMoonPhases(
      weekStart.toDate(),
      weekEnd.toDate(),
    );

    // Get key transits for the week
    const keyTransits = context.currentTransits?.slice(0, 3) || [];

    // Build weekly overview prompt
    const parts: string[] = [];

    parts.push(
      `Hello${userName ? ` ${userName}` : ''}! 🌟 Your weekly cosmic overview`,
    );

    // Week dates
    parts.push(
      `This week (${weekStart.format('MMM D')} - ${weekEnd.format('MMM D')})`,
    );

    // Moon phases
    if (moonPhases.length > 0) {
      const phasesText = moonPhases
        .map((p) => `${p.phase} on ${dayjs(p.date).format('MMM D')}`)
        .join(', ');
      parts.push(`Moon phases: ${phasesText}`);
    }

    // Weekly tarot card
    if (weeklyCard) {
      parts.push(`Your weekly card: ${weeklyCard}`);
    }

    // Key transits
    if (keyTransits.length > 0) {
      const transitsText = keyTransits
        .map((t) => `${t.from} ${t.aspect} ${t.to}`)
        .join(', ');
      parts.push(`Key transits: ${transitsText}`);
    }

    // Weekly reflection question
    const question = getWeeklyReflectionQuestion(weeklyCard, keyTransits);
    parts.push(question);

    return parts.join('. ') + '.';
  } catch (error) {
    console.error(
      '[Prompt Generator] Failed to generate weekly prompt:',
      error,
    );
    return null;
  }
}

/**
 * Gets lunar events (new moon, full moon, etc.)
 */
function getLunarEvent(
  moon: { phase: string; sign: string } | null,
): string | null {
  if (!moon) return null;

  const phase = moon.phase.toLowerCase();
  if (phase.includes('new moon')) {
    return `A New Moon in ${moon.sign} invites fresh beginnings`;
  }
  if (phase.includes('full moon')) {
    return `A Full Moon in ${moon.sign} brings culmination and release`;
  }
  if (phase.includes('first quarter')) {
    return `First Quarter Moon in ${moon.sign} calls for action`;
  }
  if (phase.includes('last quarter')) {
    return `Last Quarter Moon in ${moon.sign} invites reflection`;
  }

  return null;
}

/**
 * Gets daily reflection question based on cosmic data
 */
function getDailyReflectionQuestion(
  moonPhase: string,
  moonSign: string,
  mainTransit: string | null,
): string {
  const phase = moonPhase.toLowerCase();
  const questions = [];

  if (phase.includes('new moon')) {
    questions.push(
      'What intention would you like to set for this lunar cycle?',
    );
  } else if (phase.includes('full moon')) {
    questions.push('What are you ready to release or celebrate?');
  } else if (phase.includes('waxing')) {
    questions.push('What are you building or growing toward?');
  } else if (phase.includes('waning')) {
    questions.push('What are you letting go of or completing?');
  } else {
    questions.push('How is the cosmic energy supporting you today?');
  }

  if (mainTransit) {
    questions.push(`How does ${mainTransit} resonate with your current path?`);
  }

  return questions[0] || 'What guidance are you seeking today?';
}

/**
 * Gets weekly reflection question
 */
function getWeeklyReflectionQuestion(
  weeklyCard: string | undefined,
  keyTransits: Array<{ from: string; aspect: string; to: string }>,
): string {
  if (weeklyCard) {
    return `How can ${weeklyCard} guide your week ahead?`;
  }
  if (keyTransits.length > 0) {
    return 'What themes are emerging for you this week?';
  }
  return 'What would you like to explore this week?';
}

/**
 * Gets moon phases for a date range
 */
async function getWeekMoonPhases(
  startDate: Date,
  endDate: Date,
): Promise<Array<{ date: Date; phase: string }>> {
  const phases: Array<{ date: Date; phase: string }> = [];
  const current = dayjs(startDate);
  const end = dayjs(endDate);

  while (current.isBefore(end) || current.isSame(end)) {
    try {
      const globalData = await getGlobalCosmicData(current.toDate());
      if (globalData?.moonPhase?.isSignificant) {
        phases.push({
          date: current.toDate(),
          phase: globalData.moonPhase.name,
        });
      }
    } catch (error) {
      console.error('[Prompt Generator] Failed to get moon phase:', error);
    }
    current.add(1, 'day');

    // Limit iterations to prevent infinite loops
    if (phases.length > 10) break;
  }

  return phases;
}

/**
 * Saves a prompt to the database
 */
export async function savePrompt(
  userId: string,
  promptType: PromptType,
  promptText: string,
  cosmicContext: Record<string, unknown>,
  now: Date = new Date(),
): Promise<number | null> {
  try {
    // Calculate expiration: daily expires at end of day, weekly expires at end of week
    const expiresAt =
      promptType === 'daily'
        ? dayjs(now).endOf('day').toDate()
        : dayjs(now).endOf('week').toDate();

    const result = await sql`
      INSERT INTO ai_prompts (user_id, prompt_type, prompt_text, cosmic_context, generated_at, expires_at)
      VALUES (
        ${userId},
        ${promptType},
        ${promptText},
        ${JSON.stringify(cosmicContext)}::jsonb,
        ${now.toISOString()},
        ${expiresAt.toISOString()}
      )
      ON CONFLICT (user_id, prompt_type, generated_at) DO UPDATE
      SET prompt_text = EXCLUDED.prompt_text,
          cosmic_context = EXCLUDED.cosmic_context,
          updated_at = NOW()
      RETURNING id
    `;

    return result.rows[0]?.id || null;
  } catch (error) {
    console.error('[Prompt Generator] Failed to save prompt:', error);
    return null;
  }
}

/**
 * Fetches unread prompts for a user
 */
export async function getUnreadPrompts(
  userId: string,
  promptType?: PromptType,
): Promise<AIPrompt[]> {
  try {
    let query;
    if (promptType) {
      query = sql`
        SELECT 
          id,
          prompt_type,
          prompt_text,
          cosmic_context,
          generated_at,
          expires_at,
          read_at
        FROM ai_prompts
        WHERE user_id = ${userId}
          AND prompt_type = ${promptType}
          AND read_at IS NULL
          AND expires_at > NOW()
        ORDER BY generated_at DESC
        LIMIT 10
      `;
    } else {
      query = sql`
        SELECT 
          id,
          prompt_type,
          prompt_text,
          cosmic_context,
          generated_at,
          expires_at,
          read_at
        FROM ai_prompts
        WHERE user_id = ${userId}
          AND read_at IS NULL
          AND expires_at > NOW()
        ORDER BY generated_at DESC
        LIMIT 10
      `;
    }

    const result = await query;

    return result.rows.map((row) => ({
      id: row.id,
      promptType: row.prompt_type as PromptType,
      promptText: row.prompt_text,
      cosmicContext: row.cosmic_context || {},
      generatedAt: row.generated_at,
      expiresAt: row.expires_at,
      readAt: row.read_at,
      isNew: true,
    }));
  } catch (error) {
    console.error('[Prompt Generator] Failed to fetch prompts:', error);
    return [];
  }
}

/**
 * Marks a prompt as read
 */
export async function markPromptAsRead(
  userId: string,
  promptId: number,
): Promise<boolean> {
  try {
    const result = await sql`
      UPDATE ai_prompts
      SET read_at = NOW(),
          updated_at = NOW()
      WHERE id = ${promptId}
        AND user_id = ${userId}
        AND read_at IS NULL
      RETURNING id
    `;

    return result.rows.length > 0;
  } catch (error) {
    console.error('[Prompt Generator] Failed to mark prompt as read:', error);
    return false;
  }
}

/**
 * Gets or generates a daily prompt for a user
 */
export async function getOrGenerateDailyPrompt(
  userId: string,
  userName?: string,
  userBirthday?: string,
  timezone: string = 'Europe/London',
  now: Date = new Date(),
): Promise<AIPrompt | null> {
  try {
    // Check if there's already a prompt for today
    const todayStart = dayjs(now).startOf('day');
    const todayEnd = dayjs(now).endOf('day');

    const existing = await sql`
      SELECT 
        id,
        prompt_type,
        prompt_text,
        cosmic_context,
        generated_at,
        expires_at,
        read_at
      FROM ai_prompts
      WHERE user_id = ${userId}
        AND prompt_type = 'daily'
        AND generated_at >= ${todayStart.toISOString()}
        AND generated_at <= ${todayEnd.toISOString()}
      ORDER BY generated_at DESC
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return {
        id: row.id,
        promptType: 'daily',
        promptText: row.prompt_text,
        cosmicContext: row.cosmic_context || {},
        generatedAt: row.generated_at,
        expiresAt: row.expires_at,
        readAt: row.read_at,
        isNew: !row.read_at,
      };
    }

    // Generate new prompt
    const promptText = await generateDailyPrompt(
      userId,
      userName,
      userBirthday,
      timezone,
      now,
    );

    if (!promptText) {
      return null;
    }

    // Get cosmic context
    const { context } = await buildLunaryContext({
      userId,
      tz: timezone,
      locale: 'en-GB',
      displayName: userName,
      userBirthday,
      historyLimit: 0,
      includeMood: false,
      now,
    });

    const cosmicContext = {
      moonPhase: context.moon?.phase,
      moonSign: context.moon?.sign,
      mainTransit:
        context.currentTransits && context.currentTransits.length > 0
          ? `${context.currentTransits[0].from} ${context.currentTransits[0].aspect} ${context.currentTransits[0].to}`
          : null,
      tarotCard: context.tarot.daily?.name || context.tarot.personal?.name,
    };

    const promptId = await savePrompt(
      userId,
      'daily',
      promptText,
      cosmicContext,
      now,
    );

    if (!promptId) {
      return null;
    }

    return {
      id: promptId,
      promptType: 'daily',
      promptText,
      cosmicContext,
      generatedAt: now.toISOString(),
      expiresAt: dayjs(now).endOf('day').toISOString(),
      readAt: null,
      isNew: true,
    };
  } catch (error) {
    console.error(
      '[Prompt Generator] Failed to get or generate daily prompt:',
      error,
    );
    return null;
  }
}

/**
 * Gets or generates a weekly prompt for a user
 */
export async function getOrGenerateWeeklyPrompt(
  userId: string,
  userName?: string,
  userBirthday?: string,
  timezone: string = 'Europe/London',
  now: Date = new Date(),
): Promise<AIPrompt | null> {
  try {
    // Check if there's already a prompt for this week
    const weekStart = dayjs(now).startOf('week');
    const weekEnd = dayjs(now).endOf('week');

    const existing = await sql`
      SELECT 
        id,
        prompt_type,
        prompt_text,
        cosmic_context,
        generated_at,
        expires_at,
        read_at
      FROM ai_prompts
      WHERE user_id = ${userId}
        AND prompt_type = 'weekly'
        AND generated_at >= ${weekStart.toISOString()}
        AND generated_at <= ${weekEnd.toISOString()}
      ORDER BY generated_at DESC
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      const row = existing.rows[0];
      return {
        id: row.id,
        promptType: 'weekly',
        promptText: row.prompt_text,
        cosmicContext: row.cosmic_context || {},
        generatedAt: row.generated_at,
        expiresAt: row.expires_at,
        readAt: row.read_at,
        isNew: !row.read_at,
      };
    }

    // Generate new prompt
    const promptText = await generateWeeklyPrompt(
      userId,
      userName,
      userBirthday,
      timezone,
      now,
    );

    if (!promptText) {
      return null;
    }

    // Get cosmic context
    const { context } = await buildLunaryContext({
      userId,
      tz: timezone,
      locale: 'en-GB',
      displayName: userName,
      userBirthday,
      historyLimit: 0,
      includeMood: true,
      now,
    });

    const cosmicContext = {
      moonPhases: context.moon ? [context.moon.phase] : [],
      weeklyCard: context.tarot.weekly?.name,
      keyTransits: context.currentTransits?.slice(0, 3).map((t) => ({
        from: t.from,
        aspect: t.aspect,
        to: t.to,
      })),
    };

    const promptId = await savePrompt(
      userId,
      'weekly',
      promptText,
      cosmicContext,
      now,
    );

    if (!promptId) {
      return null;
    }

    return {
      id: promptId,
      promptType: 'weekly',
      promptText,
      cosmicContext,
      generatedAt: now.toISOString(),
      expiresAt: weekEnd.toISOString(),
      readAt: null,
      isNew: true,
    };
  } catch (error) {
    console.error(
      '[Prompt Generator] Failed to get or generate weekly prompt:',
      error,
    );
    return null;
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';
import {
  getUsagePatterns,
  getTrendComparison,
  getMostActiveDay,
} from '@/lib/insights/usage-patterns';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    // Normalize plan type to ensure correct feature access
    const planType = normalizePlanType(subscription?.plan_type);
    const hasAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'monthly_insights',
    );

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Monthly insights feature requires Lunary+ subscription',
          upgradeRequired: true,
        },
        { status: 403 },
      );
    }

    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check for cached insights first
    const cachedResult = await sql`
      SELECT insights, updated_at
      FROM monthly_insights
      WHERE user_id = ${userId}
      AND month = ${month}
      AND year = ${year}
      LIMIT 1
    `;

    // If cached and updated within last 24 hours, return cached data
    if (cachedResult.rows.length > 0) {
      const cached = cachedResult.rows[0];
      const updatedAt = new Date(cached.updated_at);
      const hoursSinceUpdate =
        (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceUpdate < 24) {
        return NextResponse.json({
          insight: {
            ...cached.insights,
            month,
            year,
          },
        });
      }
    }

    // Get frequent tarot cards from last 30 days
    // Cards is a JSONB array, so we need to unnest it first
    const tarotResult = await sql`
      SELECT 
        card_data->'card'->>'name' as card_name,
        COUNT(*) as count
      FROM tarot_readings,
      jsonb_array_elements(cards) as card_data
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND archived_at IS NULL
      AND card_data->'card'->>'name' IS NOT NULL
      GROUP BY card_data->'card'->>'name'
      ORDER BY count DESC
      LIMIT 5
    `;

    const frequentCards = tarotResult.rows
      .map((row) => ({
        name: row.card_name,
        count: parseInt(row.count),
      }))
      .filter((card) => card.name); // Filter out any null/undefined names

    // Get mood trends from cosmic snapshots
    const moodResult = await sql`
      SELECT snapshot_data->'mood'->'last7d' as mood_data
      FROM cosmic_snapshots
      WHERE user_id = ${userId}
      AND snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
      AND snapshot_data->'mood' IS NOT NULL
      ORDER BY snapshot_date DESC
      LIMIT 30
    `;

    const moodTags: Map<string, number> = new Map();
    moodResult.rows.forEach((row) => {
      if (row.mood_data && Array.isArray(row.mood_data)) {
        row.mood_data.forEach((entry: any) => {
          if (entry?.tag) {
            moodTags.set(entry.tag, (moodTags.get(entry.tag) || 0) + 1);
          }
        });
      }
    });

    const topMoodTags = Array.from(moodTags.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);

    let moodTrend: string | null = null;
    if (topMoodTags.length > 0) {
      const moodDescriptions: Record<string, string> = {
        balanced: 'Balanced and centered',
        reflective: 'Reflective and introspective',
        energetic: 'Energetic and active',
        calm: 'Calm and peaceful',
        creative: 'Creative and inspired',
        focused: 'Focused and determined',
        uncertain: 'Navigating uncertainty',
        grateful: 'Grateful and appreciative',
      };

      const primaryMood = topMoodTags[0];
      moodTrend = moodDescriptions[primaryMood] || `Mostly ${primaryMood}`;
      if (topMoodTags.length > 1) {
        moodTrend += ` with moments of ${topMoodTags.slice(1).join(' and ')}`;
      }
    }

    // Get themes from recent tarot readings
    const themesResult = await sql`
      SELECT DISTINCT tags
      FROM tarot_readings
      WHERE user_id = ${userId}
      AND created_at >= NOW() - INTERVAL '30 days'
      AND archived_at IS NULL
      AND tags IS NOT NULL
      LIMIT 5
    `;

    const themes: string[] = [];
    themesResult.rows.forEach((row) => {
      if (row.tags && Array.isArray(row.tags)) {
        themes.push(...row.tags);
      }
    });

    // Get journal entry themes from collections
    const journalResult = await sql`
      SELECT tags, title, description
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'journal'
      AND created_at >= NOW() - INTERVAL '30 days'
      ORDER BY created_at DESC
      LIMIT 20
    `;

    const journalThemes: string[] = [];
    const journalTitles: string[] = [];
    journalResult.rows.forEach((row) => {
      if (row.tags && Array.isArray(row.tags)) {
        journalThemes.push(...row.tags);
      }
      if (row.title) {
        journalTitles.push(row.title);
      }
    });

    // Get transit impacts from cosmic snapshots
    const transitResult = await sql`
      SELECT snapshot_data->'currentTransits' as transits
      FROM cosmic_snapshots
      WHERE user_id = ${userId}
      AND snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
      AND snapshot_data->'currentTransits' IS NOT NULL
      ORDER BY snapshot_date DESC
      LIMIT 30
    `;

    const transitTypes: Map<string, number> = new Map();
    transitResult.rows.forEach((row) => {
      if (row.transits && Array.isArray(row.transits)) {
        row.transits.forEach((transit: any) => {
          const aspect = transit.aspect || 'unknown';
          transitTypes.set(aspect, (transitTypes.get(aspect) || 0) + 1);
        });
      }
    });

    const transitImpacts = Array.from(transitTypes.entries())
      .map(([aspect, count]) => ({ aspect, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Generate personalized monthly summary
    const totalReadings = frequentCards.reduce(
      (sum, card) => sum + card.count,
      0,
    );
    const uniqueThemes = [...new Set(themes)];
    const uniqueJournalThemes = [...new Set(journalThemes)];

    let summaryParts: string[] = [];

    if (totalReadings > 0) {
      summaryParts.push(
        `You pulled ${totalReadings} tarot card${totalReadings !== 1 ? 's' : ''}`,
      );
      if (frequentCards.length > 0) {
        summaryParts.push(
          `with ${frequentCards[0].name} appearing most frequently`,
        );
      }
    }

    if (journalTitles.length > 0) {
      summaryParts.push(
        `You wrote ${journalTitles.length} journal entr${journalTitles.length !== 1 ? 'ies' : 'y'}`,
      );
      if (uniqueJournalThemes.length > 0) {
        summaryParts.push(
          `exploring themes like ${uniqueJournalThemes.slice(0, 2).join(' and ')}`,
        );
      }
    }

    if (transitImpacts.length > 0) {
      summaryParts.push(
        `The cosmos brought ${transitImpacts[0].aspect} aspects most often`,
      );
    }

    if (moodTrend) {
      summaryParts.push(
        `Your overall mood trend was ${moodTrend.toLowerCase()}`,
      );
    }

    const summary =
      summaryParts.length > 0
        ? `Your Cosmic Month in Review: ${summaryParts.join('. ')}.`
        : `This month marks the beginning of your cosmic journey. Start pulling cards and journaling to see your patterns emerge.`;

    // Get usage patterns and trends
    const usagePatterns = await getUsagePatterns(userId, month, year);
    const tarotTrend = await getTrendComparison(userId, month, year, 'tarot');
    const journalTrend = await getTrendComparison(
      userId,
      month,
      year,
      'journal',
    );
    const aiTrend = await getTrendComparison(userId, month, year, 'ai');
    const ritualTrend = await getTrendComparison(
      userId,
      month,
      year,
      'rituals',
    );
    const mostActiveDay = await getMostActiveDay(userId, month, year);

    const insight = {
      month,
      year,
      frequentCards,
      moodTrend: moodTrend || null,
      themes: uniqueThemes.slice(0, 5),
      journalThemes: uniqueJournalThemes.slice(0, 5),
      journalCount: journalTitles.length,
      transitImpacts,
      summary,
      usagePatterns,
      trends: {
        tarot: tarotTrend,
        journal: journalTrend,
        ai: aiTrend,
        rituals: ritualTrend,
      },
      mostActiveDay,
    };

    // Cache the insights in database
    try {
      await sql`
        INSERT INTO monthly_insights (user_id, month, year, insights, updated_at)
        VALUES (${userId}, ${month}, ${year}, ${JSON.stringify(insight)}::jsonb, NOW())
        ON CONFLICT (user_id, month, year)
        DO UPDATE SET
          insights = ${JSON.stringify(insight)}::jsonb,
          updated_at = NOW()
      `;
    } catch (error) {
      console.error('[Monthly Insights] Failed to cache insights:', error);
      // Continue even if caching fails
    }

    return NextResponse.json({ insight });
  } catch (error) {
    console.error('[Monthly Insights] Error:', error);
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to access monthly insights' },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch monthly insights' },
      { status: 500 },
    );
  }
}

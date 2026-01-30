/**
 * Cosmic Patterns API
 * GET /api/patterns/cosmic - Retrieve user's cosmic patterns
 * Supports tiered access (free vs premium patterns)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';
import { detectCosmicPatterns } from '@/lib/patterns/core/detector';
import {
  getCosmicPatterns,
  saveCosmicPatterns,
  hasValidPatterns,
  canRefreshPatterns,
} from '@/lib/patterns/storage/secure-storage';
import type { CosmicPatternsResponse } from '@/lib/patterns/types';

export async function GET(request: NextRequest) {
  const startTime = performance.now();

  try {
    const user = await requireUser(request);

    // Get user's subscription tier
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscription = subscriptionResult.rows[0];
    const rawStatus = subscription?.status || 'free';
    const subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    const planType = normalizePlanType(subscription?.plan_type);

    // Determine user's pattern access tier
    const hasAdvancedAccess = hasFeatureAccess(
      subscriptionStatus,
      planType,
      'advanced_cosmic_patterns',
    );
    const userTier = hasAdvancedAccess ? 'premium' : 'free';

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') as 'tarot' | 'emotion' | null;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const refresh = searchParams.get('refresh') === 'true';

    // Check if patterns exist and are valid
    const patternsExist = await hasValidPatterns(user.id);

    let shouldRegenerate = !patternsExist || refresh;

    // Rate limit refresh requests
    if (refresh && patternsExist) {
      const canRefresh = await canRefreshPatterns(user.id);
      if (!canRefresh) {
        return NextResponse.json(
          {
            success: false,
            error: 'Pattern refresh rate limited. Try again in 24 hours.',
          },
          { status: 429 },
        );
      }
    }

    let patterns;

    if (shouldRegenerate) {
      // Detect new patterns
      console.log(`Generating cosmic patterns for user ${user.id}`);

      const detectionResult = await detectCosmicPatterns(user.id, {
        userTier,
        category: category || undefined,
      });

      patterns = detectionResult.patterns;

      // Save patterns to database (encrypted)
      if (patterns.length > 0) {
        await saveCosmicPatterns(user.id, patterns);
      }

      console.log(
        `Generated ${patterns.length} patterns in ${(performance.now() - startTime).toFixed(0)}ms`,
      );
    } else {
      // Retrieve existing patterns from cache
      patterns = await getCosmicPatterns(user.id, userTier);

      // Filter by category if specified
      if (category) {
        patterns = patterns.filter((p) =>
          p.type.startsWith(category === 'tarot' ? 'tarot_' : 'emotion_'),
        );
      }

      console.log(`Retrieved ${patterns.length} cached patterns`);
    }

    // Apply limit
    const limitedPatterns = patterns.slice(0, limit);

    // Count locked patterns (premium patterns for free users)
    const allPatternsCount = patterns.length;
    const accessibleCount = limitedPatterns.length;
    const lockedCount =
      userTier === 'free' ? Math.max(0, allPatternsCount * 2) : 0; // Estimate

    // Get last update time
    const lastGeneration = await sql`
      SELECT MAX(generated_at) as last_updated
      FROM journal_patterns
      WHERE user_id = ${user.id}
        AND (pattern_type LIKE 'tarot_%' OR pattern_type LIKE 'emotion_%')
    `;
    const lastUpdated =
      lastGeneration.rows[0]?.last_updated || new Date().toISOString();

    const response: CosmicPatternsResponse = {
      success: true,
      patterns: limitedPatterns,
      meta: {
        totalPatterns: accessibleCount,
        userTier,
        premiumPatternsLocked: lockedCount,
        analysisWindow: 90,
        lastUpdated,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching cosmic patterns:', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch cosmic patterns',
      },
      { status: 500 },
    );
  }
}

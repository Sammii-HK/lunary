import {
  analyzeJournalPatterns,
  getPatterns,
} from '@/lib/journal/pattern-analyzer';
import { DailyThreadModule } from './types';

/**
 * Generate a pattern insight module showing recurring themes or cards
 */
export async function generatePatternModule(
  userId: string,
  date: Date,
): Promise<DailyThreadModule | null> {
  try {
    // Get cached patterns or analyze fresh
    let patterns = await getPatterns(userId);

    // If no cached patterns, analyze fresh (but this might be slow, so prefer cached)
    if (patterns.length === 0) {
      const analysis = await analyzeJournalPatterns(userId, 30);
      patterns = analysis.patterns;
    }

    if (patterns.length === 0) {
      return null;
    }

    // Get the highest confidence pattern
    const topPattern = patterns[0];

    // Build insight based on pattern type
    let insight = '';
    let question = '';
    let suggestedAction = '';

    if (topPattern.type === 'recurring_card') {
      const cardName = (topPattern.data as any).cardName;
      const count = (topPattern.data as any).count;
      insight = `You've encountered ${cardName} ${count} times this month.`;
      question = `What might ${cardName} be inviting you to explore or transform?`;
      suggestedAction = 'Reflect on this pattern in your journal';
    } else if (topPattern.type === 'theme') {
      const theme = (topPattern.data as any).theme;
      const count = (topPattern.data as any).count;
      insight = `Themes of ${theme} appear in ${count} of your recent reflections.`;
      question = `How is this ${theme} energy showing up in your life right now?`;
      suggestedAction = 'Explore this theme in your journal';
    } else if (topPattern.type === 'mood_transit') {
      const mood = (topPattern.data as any).mood;
      const count = (topPattern.data as any).count;
      insight = `You've been feeling ${mood} in ${count} of your recent reflections.`;
      question = `What does this ${mood} energy want you to notice?`;
      suggestedAction = 'Reflect on this mood pattern';
    } else if (topPattern.type === 'season_correlation') {
      const season = (topPattern.data as any).season;
      const theme = (topPattern.data as any).theme;
      insight = `${theme.charAt(0).toUpperCase() + theme.slice(1)} themes appear during ${season} season in your reflections.`;
      question = `How might this seasonal pattern be relevant now?`;
      suggestedAction = 'Explore this seasonal connection';
    } else {
      // Generic pattern
      insight = topPattern.description;
      question = 'What does this pattern invite you to explore?';
      suggestedAction = 'Reflect on this pattern';
    }

    // Ensure insight is not too long
    if (insight.length > 150) {
      insight = insight.substring(0, 150).trim() + '...';
    }

    const moduleId = `pattern-${new Date(date).toISOString().split('T')[0]}`;

    return {
      id: moduleId,
      type: 'pattern',
      level: 2, // Level 2-3 only
      title: 'Pattern insight',
      body: insight,
      meta: {
        insight,
        question,
        suggestedAction,
      },
      actions: [
        {
          label: 'See details',
          intent: 'view',
          href: '/patterns',
        },
        {
          label: 'Start journal',
          intent: 'journal',
          payload: {
            prompt: question,
          },
        },
      ],
      priority: 80,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Daily Thread] Error generating pattern module:', error);
    return null;
  }
}

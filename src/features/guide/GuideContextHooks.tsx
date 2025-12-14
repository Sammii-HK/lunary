'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getMoonPhase,
  type MoonPhaseLabels,
} from '../../../utils/moon/moonPhases';
import { useSubscription } from '@/hooks/useSubscription';
import {
  type GuideHint,
  buildGuidePromptFromContext,
  type PromptContext,
} from './promptBuilder';

interface JournalPattern {
  type: string;
  title: string;
  description: string;
  confidence: number;
}

interface TarotTrends {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
  suitPatterns: Array<{ suit: string; count: number }>;
}

interface GuideContextData {
  moonPhase: MoonPhaseLabels;
  tarotThemes: string[];
  dominantSuit: string | null;
  journalPatterns: JournalPattern[];
  recentMoods: string[];
  isLoading: boolean;
}

export function useGuideContext(): GuideContextData {
  const [journalPatterns, setJournalPatterns] = useState<JournalPattern[]>([]);
  const [recentMoods, setRecentMoods] = useState<string[]>([]);
  const [tarotThemes, setTarotThemes] = useState<string[]>([]);
  const [dominantSuit, setDominantSuit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const moonPhase = useMemo(() => getMoonPhase(new Date()), []);

  useEffect(() => {
    const fetchContextData = async () => {
      setIsLoading(true);

      try {
        const [patternsRes, journalRes] = await Promise.all([
          fetch('/api/journal/patterns', { credentials: 'include' }).catch(
            () => null,
          ),
          fetch('/api/journal?limit=10', { credentials: 'include' }).catch(
            () => null,
          ),
        ]);

        if (patternsRes?.ok) {
          const patternsData = await patternsRes.json();
          setJournalPatterns(patternsData.patterns || []);

          const themePatterns = (patternsData.patterns || [])
            .filter((p: JournalPattern) => p.type === 'theme')
            .map((p: JournalPattern) =>
              p.title.replace(' themes recurring', ''),
            );
          if (themePatterns.length > 0) {
            setTarotThemes(themePatterns);
          }
        }

        if (journalRes?.ok) {
          const journalData = await journalRes.json();
          const entries = journalData.entries || [];
          const moods: string[] = [];
          entries.forEach((entry: { moodTags?: string[] }) => {
            if (entry.moodTags) {
              moods.push(...entry.moodTags);
            }
          });
          const moodCounts: Record<string, number> = {};
          moods.forEach((mood) => {
            moodCounts[mood] = (moodCounts[mood] || 0) + 1;
          });
          const sortedMoods = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([mood]) => mood);
          setRecentMoods(sortedMoods.slice(0, 5));
        }
      } catch (error) {
        console.error('[GuideContext] Failed to fetch context data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContextData();
  }, []);

  return {
    moonPhase,
    tarotThemes,
    dominantSuit,
    journalPatterns,
    recentMoods,
    isLoading,
  };
}

export function useGuideContextHints(): {
  hints: GuideHint[];
  isLoading: boolean;
  primaryHint: GuideHint | null;
} {
  const { isSubscribed } = useSubscription();
  const context = useGuideContext();

  const hints = useMemo(() => {
    const generatedHints: GuideHint[] = [];

    if (context.journalPatterns.length > 0) {
      const topPattern = context.journalPatterns[0];
      generatedHints.push({
        id: `pattern-${topPattern.type}`,
        title: topPattern.title,
        shortText: isSubscribed
          ? topPattern.description
          : topPattern.title.includes('recurring')
            ? 'A theme keeps appearing in your reflections.'
            : 'The Astral Guide can help you understand this pattern.',
        suggestedAction: 'ask_guide',
        promptTemplate: `I noticed a pattern in my reflections: "${topPattern.title}". ${topPattern.description} What does this reveal about my current journey?`,
      });
    }

    if (context.tarotThemes.length > 0) {
      const theme = context.tarotThemes[0];
      generatedHints.push({
        id: `tarot-theme-${theme.toLowerCase()}`,
        title: `${theme} energy is present`,
        shortText: isSubscribed
          ? `Your tarot readings have been reflecting ${theme.toLowerCase()} themes. Let's explore what this means for you.`
          : 'Your tarot patterns reveal an emerging theme.',
        suggestedAction: 'ask_guide',
        promptTemplate: `My tarot patterns show strong ${theme.toLowerCase()} themes. What is this energy inviting me to explore or transform?`,
      });
    }

    if (context.dominantSuit) {
      generatedHints.push({
        id: `suit-${context.dominantSuit.toLowerCase()}`,
        title: `${context.dominantSuit} cards are calling`,
        shortText: isSubscribed
          ? `${context.dominantSuit} energy is prominent in your readings. This points to ${getSuitMeaning(context.dominantSuit)}.`
          : `${context.dominantSuit} energy is speaking to you.`,
        suggestedAction: 'ask_guide',
        promptTemplate: `I keep drawing ${context.dominantSuit} cards. What aspects of ${getSuitMeaning(context.dominantSuit)} need my attention right now?`,
      });
    }

    const moonHint = getMoonPhaseHint(context.moonPhase, isSubscribed);
    if (moonHint) {
      generatedHints.push(moonHint);
    }

    if (context.recentMoods.length > 0) {
      const primaryMood = context.recentMoods[0];
      generatedHints.push({
        id: `mood-${primaryMood.toLowerCase()}`,
        title: `Feeling ${primaryMood}`,
        shortText: isSubscribed
          ? `Your recent reflections carry ${primaryMood} energy. The Astral Guide can help you work with this.`
          : 'Your emotional patterns reveal something meaningful.',
        suggestedAction: 'ask_guide',
        promptTemplate: `I've been feeling ${primaryMood} lately. What do my cosmic patterns suggest about this emotional state?`,
      });
    }

    return generatedHints;
  }, [context, isSubscribed]);

  const primaryHint = hints.length > 0 ? hints[0] : null;

  return {
    hints,
    isLoading: context.isLoading,
    primaryHint,
  };
}

function getSuitMeaning(suit: string): string {
  const meanings: Record<string, string> = {
    Cups: 'emotions, relationships, and intuition',
    Wands: 'creativity, passion, and motivation',
    Swords: 'thoughts, communication, and decisions',
    Pentacles: 'material matters, work, and health',
    'Major Arcana': 'significant life lessons and soul growth',
  };
  return meanings[suit] || 'your inner world';
}

function getMoonPhaseHint(
  moonPhase: MoonPhaseLabels,
  isSubscribed: boolean,
): GuideHint | null {
  const hints: Record<
    MoonPhaseLabels,
    { title: string; short: string; full: string; prompt: string }
  > = {
    'New Moon': {
      title: 'New Moon intentions',
      short: 'A time for setting intentions.',
      full: 'The New Moon invites you to plant seeds of intention. What dreams are ready to be set in motion?',
      prompt:
        "It's a New Moon. Help me set meaningful intentions aligned with my current cosmic patterns.",
    },
    'Waxing Crescent': {
      title: 'Nurturing new beginnings',
      short: 'Your intentions are taking root.',
      full: 'The Waxing Crescent encourages small, consistent steps toward your goals.',
      prompt:
        'During this Waxing Crescent, what small steps should I take toward my intentions?',
    },
    'First Quarter': {
      title: 'Time for decisive action',
      short: 'Challenges may arise - stay committed.',
      full: 'The First Quarter asks you to take decisive action despite any obstacles.',
      prompt:
        'At this First Quarter moon, what challenges should I anticipate and how can I overcome them?',
    },
    'Waxing Gibbous': {
      title: 'Refine and adjust',
      short: 'Fine-tune your approach.',
      full: 'The Waxing Gibbous is a time for refinement and building momentum.',
      prompt:
        'As the moon approaches fullness, how can I refine my efforts for maximum impact?',
    },
    'Full Moon': {
      title: 'Illumination and celebration',
      short: 'What has come to fruition?',
      full: 'The Full Moon illuminates what has been growing. Time to celebrate and release.',
      prompt:
        'Under this Full Moon, what is being illuminated for me? What can I celebrate or release?',
    },
    'Waning Gibbous': {
      title: 'Gratitude and integration',
      short: 'Honor what you have learned.',
      full: 'The Waning Gibbous invites gratitude and sharing your wisdom.',
      prompt:
        'During this Waning Gibbous phase, what lessons am I integrating and what gratitude can I express?',
    },
    'Last Quarter': {
      title: 'Release and let go',
      short: 'Time to release what no longer serves.',
      full: 'The Last Quarter supports releasing old patterns and clearing space.',
      prompt:
        'At this Last Quarter moon, what am I ready to release that no longer serves my highest good?',
    },
    'Waning Crescent': {
      title: 'Rest and dream',
      short: 'Honor the need for rest.',
      full: 'The Waning Crescent asks you to rest, dream, and prepare for the next cycle.',
      prompt:
        'During this Waning Crescent, how can I best rest and prepare for the new cycle ahead?',
    },
  };

  const data = hints[moonPhase];
  if (!data) return null;

  return {
    id: `moon-${moonPhase.toLowerCase().replace(' ', '-')}`,
    title: data.title,
    shortText: isSubscribed ? data.full : data.short,
    suggestedAction: 'ask_guide',
    promptTemplate: data.prompt,
  };
}

export function useGuidePromptBuilder() {
  const context = useGuideContext();

  const buildPrompt = useMemo(() => {
    const promptContext: PromptContext = {
      tarotThemes: context.tarotThemes,
      moonPhase: context.moonPhase,
      recentMoods: context.recentMoods,
      dominantSuit: context.dominantSuit || undefined,
    };

    return buildGuidePromptFromContext(promptContext);
  }, [context]);

  return { prompt: buildPrompt, context };
}

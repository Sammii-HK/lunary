'use client';

import { useState, useMemo } from 'react';
import { Feather, Save, Check } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface TarotReflectionPromptsProps {
  period: number | 'year-over-year';
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number; reading?: string }>;
  suitPatterns: Array<{
    suit: string;
    count: number;
    reading?: string;
    cards?: Array<{ name: string; count: number }>;
  }>;
  className?: string;
}

interface ReflectionPrompt {
  id: string;
  text: string;
  tags: string[];
}

const THEME_PROMPTS: Record<string, string[]> = {
  healing: [
    'What part of myself is asking to be healed right now?',
    'How can I offer myself more compassion during this healing process?',
    'What old wounds are surfacing for attention, and what do they need from me?',
  ],
  action: [
    'What bold action have I been avoiding, and what would it take to begin?',
    'Where in my life am I holding back when I could be stepping forward?',
    'What fears are disguising themselves as reasons to wait?',
  ],
  truth: [
    'What truth am I finally ready to acknowledge?',
    'Where have I been telling myself comforting lies instead of facing reality?',
    'How does it feel to stand in my truth, even when it is uncomfortable?',
  ],
  stability: [
    'What foundations am I building that will support my future self?',
    'Where do I need more structure or routine in my life?',
    'How can I balance ambition with the patience required for lasting results?',
  ],
  transformation: [
    'What version of myself am I being called to release?',
    'What is emerging from the ashes of what I have let go?',
    'How can I trust the process of becoming, even when it feels disorienting?',
  ],
  intuition: [
    'What is my intuition trying to tell me that my logical mind keeps dismissing?',
    'How can I create more space for inner knowing in my daily life?',
    'What dreams or synchronicities have felt significant lately?',
  ],
  creativity: [
    'What creative expression is waiting to flow through me?',
    'Where am I judging my creative impulses instead of following them?',
    'How would I create differently if I knew no one would ever see it?',
  ],
  growth: [
    'In what ways have I grown that I have not yet acknowledged?',
    'What discomfort am I willing to embrace in service of my expansion?',
    'What old beliefs about myself are no longer true?',
  ],
  release: [
    'What am I holding onto that is holding me back?',
    'How would my life change if I truly let go of what no longer serves me?',
    'What would I do with the space that release creates?',
  ],
  connection: [
    'What relationships in my life deserve more of my presence?',
    'How do I show up differently in my close relationships versus with strangers?',
    'What boundaries would actually strengthen my connections?',
  ],
};

const SUIT_PROMPTS: Record<string, string[]> = {
  Cups: [
    'What emotions am I currently navigating, and how can I honor them?',
    'How am I nurturing my relationships and emotional well-being?',
  ],
  Wands: [
    'What passion or project deserves more of my energy right now?',
    'How am I channeling my creative fire, and where might it be scattered?',
  ],
  Swords: [
    'What mental patterns are creating suffering, and how can I shift them?',
    'What decision have I been avoiding that clarity would help me make?',
  ],
  Pentacles: [
    'How am I caring for my body, finances, and physical environment?',
    'What practical steps can I take toward the life I am building?',
  ],
};

const CARD_PROMPTS: Record<string, string> = {
  'The Fool': 'Where am I being called to take a leap of faith?',
  'The Magician':
    'What tools and resources do I already possess to manifest my desires?',
  'The High Priestess': 'What inner wisdom is waiting to be accessed?',
  'The Empress': 'How can I nurture creativity and abundance in my life?',
  'The Emperor': 'Where do I need more structure or where am I too rigid?',
  'The Lovers': 'What choice am I facing about values or relationships?',
  'The Chariot': 'What goal requires my focused willpower right now?',
  Strength: 'How can I approach challenges with patience and inner strength?',
  'The Hermit': 'What solitude and reflection might reveal to me?',
  'Wheel of Fortune': 'How am I flowing with the cycles of change in my life?',
  Justice: 'Where in my life is balance needed?',
  'The Hanged Man': 'What new perspective would shift everything?',
  Death: 'What transformation is asking for my surrender?',
  Temperance: 'How can I find middle ground in areas of extremes?',
  'The Devil': 'What attachments or patterns are keeping me bound?',
  'The Tower':
    'What structures in my life need to crumble for something new to emerge?',
  'The Star': 'What hope is guiding me through difficult times?',
  'The Moon': 'What fears or illusions am I ready to move through?',
  'The Sun': 'What brings me genuine joy and how can I invite more of it?',
  Judgement: 'What calling am I being asked to answer?',
  'The World': 'What cycle is completing, and what is ready to begin?',
};

function generatePrompts(
  themes: string[],
  frequentCards: Array<{ name: string }>,
  suitPatterns: Array<{ suit: string }>,
  period: number | 'year-over-year',
): ReflectionPrompt[] {
  const prompts: ReflectionPrompt[] = [];
  const periodLabel = typeof period === 'number' ? `${period}-day` : 'year';

  themes.slice(0, 2).forEach((theme) => {
    const themePrompts = THEME_PROMPTS[theme.toLowerCase()];
    if (themePrompts) {
      themePrompts.forEach((text, i) => {
        prompts.push({
          id: `theme-${theme}-${i}`,
          text,
          tags: ['Tarot Reflection', periodLabel, theme],
        });
      });
    }
  });

  frequentCards.slice(0, 2).forEach((card) => {
    const cardPrompt = CARD_PROMPTS[card.name];
    if (cardPrompt) {
      prompts.push({
        id: `card-${card.name}`,
        text: cardPrompt,
        tags: ['Tarot Reflection', periodLabel, card.name],
      });
    }
  });

  suitPatterns.slice(0, 1).forEach((pattern) => {
    const suitPrompts = SUIT_PROMPTS[pattern.suit];
    if (suitPrompts) {
      suitPrompts.forEach((text, i) => {
        if (!prompts.some((p) => p.text === text)) {
          prompts.push({
            id: `suit-${pattern.suit}-${i}`,
            text,
            tags: ['Tarot Reflection', periodLabel, pattern.suit],
          });
        }
      });
    }
  });

  return prompts.slice(0, 5);
}

export function TarotReflectionPrompts({
  period,
  dominantThemes,
  frequentCards,
  suitPatterns,
  className = '',
}: TarotReflectionPromptsProps) {
  const { isSubscribed } = useSubscription();
  const [savingPrompt, setSavingPrompt] = useState<string | null>(null);
  const [savedPrompts, setSavedPrompts] = useState<Set<string>>(new Set());

  const prompts = useMemo(
    () => generatePrompts(dominantThemes, frequentCards, suitPatterns, period),
    [dominantThemes, frequentCards, suitPatterns, period],
  );

  const displayPrompts = isSubscribed ? prompts : prompts.slice(0, 1);

  const handleSaveToJournal = async (prompt: ReflectionPrompt) => {
    if (savingPrompt) return;

    setSavingPrompt(prompt.id);

    try {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: `Reflection: ${prompt.text.slice(0, 40)}...`,
          description: prompt.text,
          category: 'journal',
          content: {
            text: prompt.text,
            type: 'reflection_prompt',
            source: 'tarot_patterns',
          },
          tags: prompt.tags,
        }),
      });

      if (response.ok) {
        setSavedPrompts((prev) => new Set([...prev, prompt.id]));
      }
    } catch (error) {
      console.error('[TarotReflectionPrompts] Failed to save:', error);
    } finally {
      setSavingPrompt(null);
    }
  };

  if (prompts.length === 0) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Feather className='w-4 h-4 text-lunary-primary-400' />
        <h3 className='text-sm font-medium text-zinc-100'>
          Reflection Prompts
        </h3>
      </div>

      <div className='space-y-3'>
        {displayPrompts.map((prompt) => {
          const isSaved = savedPrompts.has(prompt.id);
          const isSaving = savingPrompt === prompt.id;

          return (
            <div
              key={prompt.id}
              className='p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/30'
            >
              <p className='text-sm text-zinc-200 italic mb-2'>{prompt.text}</p>

              {isSubscribed && (
                <div className='flex items-center justify-between'>
                  <div className='flex flex-wrap gap-1'>
                    {prompt.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className='text-[10px] px-2 py-0.5 rounded-full bg-zinc-700/50 text-zinc-400'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSaveToJournal(prompt)}
                    disabled={isSaving || isSaved}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      isSaved
                        ? 'bg-lunary-success-900/30 text-lunary-success-300 border border-lunary-success-700/30'
                        : 'bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-700/30 hover:bg-lunary-primary-900/50'
                    } disabled:opacity-50`}
                  >
                    {isSaved ? (
                      <>
                        <Check className='w-3 h-3' />
                        Saved
                      </>
                    ) : isSaving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Save className='w-3 h-3' />
                        Save to Journal
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubscribed && prompts.length > 1 && (
        <div className='mt-3 pt-3 border-t border-zinc-800/50'>
          <p className='text-xs text-zinc-400'>
            <a
              href='/pricing'
              className='text-lunary-primary-400 hover:text-lunary-primary-300'
            >
              Upgrade to Lunary+
            </a>{' '}
            for {prompts.length - 1} more reflection prompts with journal
            saving.
          </p>
        </div>
      )}
    </div>
  );
}

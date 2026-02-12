'use client';

import { Calendar, BookOpen } from 'lucide-react';
import { getCurrentWeeklyTheme } from '@/lib/community/saturn-return';

interface WeeklyThemeCardProps {
  metadata: { weekly_themes?: string[] } | null;
}

const THEME_PROMPTS: Record<string, string> = {
  'Structure & Boundaries':
    'Where in your life do you need firmer boundaries? What structure would support your growth?',
  'Career & Purpose':
    'What does meaningful work look like for you? Are you on the path you want to be on?',
  'Relationships & Commitment':
    'Which relationships are you choosing to invest in? What commitments feel aligned?',
  'Health & Discipline':
    'How is your body asking for attention? What daily habits would serve your wellbeing?',
  'Identity & Authenticity':
    'Who are you becoming? What masks are you ready to set down?',
  'Legacy & Responsibility':
    'What do you want to build that outlasts this moment? What responsibility calls to you?',
  'Integration & Wisdom':
    'What lessons from this Saturn Return are becoming clear? How have you grown?',
};

export function WeeklyThemeCard({ metadata }: WeeklyThemeCardProps) {
  const themeData = getCurrentWeeklyTheme(metadata);
  if (!themeData) return null;

  const prompt =
    THEME_PROMPTS[themeData.theme] ?? 'Reflect on this theme in your journal.';

  return (
    <div className='rounded-xl border border-lunary-primary-800/40 bg-gradient-to-br from-lunary-primary-950/40 to-zinc-900 p-4 space-y-3'>
      <div className='flex items-center gap-2'>
        <Calendar className='w-4 h-4 text-lunary-primary-400' />
        <span className='text-xs font-medium text-lunary-primary-300 uppercase tracking-wide'>
          This Week&apos;s Theme
        </span>
      </div>

      <h3 className='text-base font-semibold text-zinc-100'>
        {themeData.theme}
      </h3>

      <div className='rounded-lg bg-lunary-primary-900/20 border border-lunary-primary-800/30 p-3'>
        <div className='flex items-center gap-1.5 mb-1.5'>
          <BookOpen className='w-3.5 h-3.5 text-lunary-primary-400' />
          <span className='text-[10px] font-medium text-lunary-primary-300 uppercase tracking-wide'>
            Journal Prompt
          </span>
        </div>
        <p className='text-xs text-zinc-300 italic'>{prompt}</p>
      </div>
    </div>
  );
}

// Weekly Numerology component
// Displays universal week number meaning and cosmic connections

'use client';

import { useMemo } from 'react';
import { Hash } from 'lucide-react';

interface WeeklyNumerologyProps {
  weekStart: Date;
  variant?: 'full' | 'compact';
}

// Numerology meanings for numbers 1-9
const numberMeanings: Record<
  number,
  {
    name: string;
    theme: string;
    energy: string;
    guidance: string;
    keywords: string[];
    bestFor: string[];
    avoid: string[];
  }
> = {
  1: {
    name: 'The Pioneer',
    theme: 'New Beginnings & Independence',
    energy:
      'This is a week of fresh starts and bold initiatives. The number 1 brings pioneering energy that supports launching new projects, asserting yourself, and taking the lead.',
    guidance:
      'Trust your instincts and take action on ideas you have been holding back. This is your week to initiate.',
    keywords: [
      'leadership',
      'independence',
      'new starts',
      'ambition',
      'courage',
    ],
    bestFor: [
      'Starting new projects',
      'Job interviews',
      'First dates',
      'Setting intentions',
    ],
    avoid: ['Following the crowd', 'Procrastination', 'Self-doubt'],
  },
  2: {
    name: 'The Diplomat',
    theme: 'Partnership & Balance',
    energy:
      'A week focused on relationships, cooperation, and finding balance. The number 2 emphasizes diplomacy, patience, and working harmoniously with others.',
    guidance:
      'Focus on collaboration rather than competition. Listen as much as you speak, and seek win-win solutions.',
    keywords: [
      'partnership',
      'balance',
      'patience',
      'cooperation',
      'intuition',
    ],
    bestFor: [
      'Relationship talks',
      'Negotiations',
      'Team projects',
      'Mediation',
    ],
    avoid: ['Being overly passive', 'Codependency', 'Avoiding decisions'],
  },
  3: {
    name: 'The Creator',
    theme: 'Expression & Joy',
    energy:
      'Creative energy flows freely this week. The number 3 brings optimism, self-expression, and social connection. Art, communication, and joy are highlighted.',
    guidance:
      'Express yourself freely through art, words, or action. Connect with others and let your natural charm shine.',
    keywords: ['creativity', 'expression', 'joy', 'communication', 'optimism'],
    bestFor: [
      'Creative projects',
      'Social events',
      'Public speaking',
      'Writing',
    ],
    avoid: ['Suppressing feelings', 'Isolation', 'Negative self-talk'],
  },
  4: {
    name: 'The Builder',
    theme: 'Foundation & Structure',
    energy:
      'A week for building solid foundations and getting organized. The number 4 brings practical energy focused on discipline, hard work, and creating lasting structures.',
    guidance:
      'Focus on the fundamentals. Build systems, organize your space, and commit to the work required for long-term success.',
    keywords: [
      'stability',
      'discipline',
      'hard work',
      'organization',
      'loyalty',
    ],
    bestFor: [
      'Planning',
      'Home improvements',
      'Financial organization',
      'Routine building',
    ],
    avoid: ['Cutting corners', 'Rigidity', 'Overwork without rest'],
  },
  5: {
    name: 'The Adventurer',
    theme: 'Change & Freedom',
    energy:
      'Expect the unexpected this week. The number 5 brings dynamic energy of change, adventure, and breaking free from limitations. Flexibility is key.',
    guidance:
      'Embrace change rather than resist it. Say yes to new experiences and be willing to adapt your plans.',
    keywords: ['change', 'freedom', 'adventure', 'versatility', 'curiosity'],
    bestFor: ['Travel', 'Learning new skills', 'Networking', 'Taking risks'],
    avoid: ['Resisting change', 'Overindulgence', 'Scattered energy'],
  },
  6: {
    name: 'The Nurturer',
    theme: 'Love & Responsibility',
    energy:
      'A week centered on home, family, and nurturing connections. The number 6 brings harmonious energy focused on love, responsibility, and creating beauty.',
    guidance:
      'Tend to your relationships and domestic matters. Create harmony in your environment and care for those you love.',
    keywords: ['love', 'family', 'harmony', 'responsibility', 'beauty'],
    bestFor: [
      'Family gatherings',
      'Home decorating',
      'Relationship healing',
      'Self-care',
    ],
    avoid: ['Martyrdom', 'Perfectionism', 'Neglecting yourself'],
  },
  7: {
    name: 'The Seeker',
    theme: 'Reflection & Wisdom',
    energy:
      'A contemplative week for going within. The number 7 brings spiritual and intellectual energy, perfect for study, meditation, and seeking deeper truths.',
    guidance:
      'Take time for solitude and reflection. Trust your intuition and explore questions that fascinate you.',
    keywords: ['spirituality', 'analysis', 'intuition', 'wisdom', 'solitude'],
    bestFor: ['Meditation', 'Research', 'Therapy', 'Spiritual practices'],
    avoid: ['Overthinking', 'Isolation to an extreme', 'Skepticism'],
  },
  8: {
    name: 'The Powerhouse',
    theme: 'Abundance & Achievement',
    energy:
      'A powerful week for manifestation and material success. The number 8 brings ambitious energy focused on achievement, abundance, and wielding personal power wisely.',
    guidance:
      'Step into your power and go after what you want. Focus on financial matters and career advancement.',
    keywords: ['abundance', 'power', 'achievement', 'karma', 'authority'],
    bestFor: [
      'Business deals',
      'Salary negotiations',
      'Investments',
      'Career moves',
    ],
    avoid: ['Greed', 'Power struggles', 'Ignoring ethics'],
  },
  9: {
    name: 'The Humanitarian',
    theme: 'Completion & Service',
    energy:
      'A week of endings and humanitarian focus. The number 9 brings energy of completion, compassion, and seeing the bigger picture. Release what no longer serves.',
    guidance:
      'Let go of what is ending and trust the cycle. Focus on how you can serve others and contribute to something larger.',
    keywords: [
      'completion',
      'compassion',
      'wisdom',
      'release',
      'humanitarianism',
    ],
    bestFor: [
      'Finishing projects',
      'Charity work',
      'Forgiveness',
      'Closing chapters',
    ],
    avoid: ['Clinging to the past', 'Bitterness', 'Avoiding endings'],
  },
};

// Calculate universal week number (reduce to single digit 1-9)
function calculateUniversalWeekNumber(date: Date): number {
  const day = date.getDate();
  const month = date.getMonth() + 1; // JavaScript months are 0-indexed
  const year = date.getFullYear();

  // Add all digits: day + month + year
  let sum = day + month;

  // Add year digits
  const yearStr = year.toString();
  for (const digit of yearStr) {
    sum += parseInt(digit, 10);
  }

  // Reduce to single digit (1-9)
  while (sum > 9) {
    let newSum = 0;
    const sumStr = sum.toString();
    for (const digit of sumStr) {
      newSum += parseInt(digit, 10);
    }
    sum = newSum;
  }

  return sum || 9; // 0 becomes 9
}

export function WeeklyNumerology({
  weekStart,
  variant = 'full',
}: WeeklyNumerologyProps) {
  const universalNumber = useMemo(
    () => calculateUniversalWeekNumber(weekStart),
    [weekStart],
  );

  const meaning = numberMeanings[universalNumber];

  if (!meaning) return null;

  if (variant === 'compact') {
    return (
      <div className='rounded-lg border border-amber-700/20 bg-amber-950/10 p-3'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-8 h-8 rounded-full bg-amber-600/20 flex items-center justify-center'>
            <span className='text-lg font-bold text-amber-400'>
              {universalNumber}
            </span>
          </div>
          <div>
            <span className='text-xs font-medium text-amber-300'>
              Universal Week
            </span>
            <p className='text-sm text-zinc-300'>{meaning.name}</p>
          </div>
        </div>
        <p className='text-xs text-zinc-400'>{meaning.theme}</p>
      </div>
    );
  }

  // Full variant
  return (
    <section className='space-y-4'>
      <h2 className='text-2xl font-bold flex items-center gap-2'>
        <Hash className='h-6 w-6 text-amber-400' />
        Weekly Numerology
      </h2>

      <div className='rounded-xl border border-amber-700/30 bg-gradient-to-br from-amber-950/20 to-zinc-900 p-6'>
        {/* Header with number */}
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30'>
            <span className='text-3xl font-bold text-zinc-900'>
              {universalNumber}
            </span>
          </div>
          <div>
            <h3 className='text-xl font-bold text-amber-300'>{meaning.name}</h3>
            <p className='text-sm text-zinc-400'>{meaning.theme}</p>
          </div>
        </div>

        {/* Keywords */}
        <div className='flex flex-wrap gap-2 mb-4'>
          {meaning.keywords.map((keyword) => (
            <span
              key={keyword}
              className='px-2 py-1 text-xs rounded-full bg-amber-900/30 text-amber-300 border border-amber-700/30'
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* Energy description */}
        <p className='text-sm text-zinc-300 leading-relaxed mb-4'>
          {meaning.energy}
        </p>

        {/* Guidance */}
        <blockquote className='border-l-2 border-amber-500 pl-4 py-2 mb-4'>
          <p className='text-sm italic text-amber-200'>{meaning.guidance}</p>
        </blockquote>

        {/* Best for / Avoid */}
        <div className='grid md:grid-cols-2 gap-4 text-sm'>
          <div>
            <h4 className='font-medium text-emerald-400 mb-2'>
              Best For This Week
            </h4>
            <ul className='space-y-1'>
              {meaning.bestFor.map((item) => (
                <li
                  key={item}
                  className='text-zinc-400 flex items-center gap-2'
                >
                  <span className='text-emerald-500'>+</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className='font-medium text-rose-400 mb-2'>Watch Out For</h4>
            <ul className='space-y-1'>
              {meaning.avoid.map((item) => (
                <li
                  key={item}
                  className='text-zinc-400 flex items-center gap-2'
                >
                  <span className='text-rose-500'>-</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

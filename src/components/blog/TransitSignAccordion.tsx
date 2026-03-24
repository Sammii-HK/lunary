'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const ZODIAC_SIGNS = [
  { key: 'aries', label: 'Aries', glyph: '\u2648' },
  { key: 'taurus', label: 'Taurus', glyph: '\u2649' },
  { key: 'gemini', label: 'Gemini', glyph: '\u264A' },
  { key: 'cancer', label: 'Cancer', glyph: '\u264B' },
  { key: 'leo', label: 'Leo', glyph: '\u264C' },
  { key: 'virgo', label: 'Virgo', glyph: '\u264D' },
  { key: 'libra', label: 'Libra', glyph: '\u264E' },
  { key: 'scorpio', label: 'Scorpio', glyph: '\u264F' },
  { key: 'sagittarius', label: 'Sagittarius', glyph: '\u2650' },
  { key: 'capricorn', label: 'Capricorn', glyph: '\u2651' },
  { key: 'aquarius', label: 'Aquarius', glyph: '\u2652' },
  { key: 'pisces', label: 'Pisces', glyph: '\u2653' },
] as const;

interface TransitSignAccordionProps {
  breakdowns: Record<string, string>;
}

export function TransitSignAccordion({
  breakdowns,
}: TransitSignAccordionProps) {
  const [openSigns, setOpenSigns] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setOpenSigns((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  return (
    <div className='space-y-2'>
      {ZODIAC_SIGNS.map(({ key, label, glyph }) => {
        const content = breakdowns[key];
        if (!content) return null;

        const isOpen = openSigns.has(key);

        return (
          <div
            key={key}
            className='border border-lunary-primary-800/50 rounded-lg overflow-hidden'
          >
            <button
              onClick={() => toggle(key)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3',
                'text-left hover:bg-lunary-primary-900/30 transition-colors',
                isOpen && 'bg-lunary-primary-900/20',
              )}
            >
              <span className='flex items-center gap-2'>
                <span className='text-lg text-lunary-accent-400'>{glyph}</span>
                <span className='font-medium text-lunary-primary-200'>
                  {label}
                </span>
              </span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-lunary-primary-400 transition-transform',
                  isOpen && 'rotate-180',
                )}
              />
            </button>
            {isOpen && (
              <div className='px-4 pb-4 text-lunary-primary-300/90 leading-relaxed'>
                {content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

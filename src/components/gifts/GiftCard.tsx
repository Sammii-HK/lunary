'use client';

import { Sparkles, Heart, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GiftCardProps {
  giftType: string;
  content: {
    cardName?: string;
    keywords?: string[];
    message?: string;
    suit?: string;
    affirmation?: string;
    recipientSign?: string;
  };
  senderName: string;
  personalMessage?: string | null;
}

const GIFT_TYPE_CONFIG: Record<
  string,
  { icon: typeof Sparkles; label: string; gradient: string }
> = {
  tarot_pull: {
    icon: Sparkles,
    label: 'Tarot Pull',
    gradient: 'from-indigo-500 to-purple-600',
  },
  cosmic_encouragement: {
    icon: Heart,
    label: 'Cosmic Encouragement',
    gradient: 'from-pink-500 to-rose-600',
  },
};

export function GiftCard({
  giftType,
  content,
  senderName,
  personalMessage,
}: GiftCardProps) {
  const config = GIFT_TYPE_CONFIG[giftType] || {
    icon: Star,
    label: 'Cosmic Gift',
    gradient: 'from-lunary-primary-500 to-lunary-accent',
  };
  const Icon = config.icon;

  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/80 overflow-hidden'>
      {/* Header */}
      <div
        className={cn(
          'bg-gradient-to-r p-4 flex items-center gap-3',
          config.gradient,
        )}
      >
        <div className='w-10 h-10 rounded-full bg-white/20 flex items-center justify-center'>
          <Icon className='w-5 h-5 text-white' />
        </div>
        <div>
          <p className='text-sm font-medium text-white'>{config.label}</p>
          <p className='text-xs text-white/70'>From {senderName}</p>
        </div>
      </div>

      {/* Content */}
      <div className='p-5'>
        {giftType === 'tarot_pull' && content.cardName && (
          <div className='space-y-3'>
            <div className='text-center'>
              <p className='text-xs uppercase tracking-widest text-zinc-500 mb-1'>
                {content.suit}
              </p>
              <p className='text-lg font-bold text-white'>{content.cardName}</p>
            </div>
            {content.keywords && content.keywords.length > 0 && (
              <div className='flex flex-wrap justify-center gap-1.5'>
                {content.keywords.map((kw) => (
                  <span
                    key={kw}
                    className='px-2 py-0.5 text-xs rounded-full bg-indigo-900/40 text-indigo-300'
                  >
                    {kw}
                  </span>
                ))}
              </div>
            )}
            {content.message && (
              <p className='text-sm text-zinc-300 text-center leading-relaxed'>
                {content.message}
              </p>
            )}
          </div>
        )}

        {giftType === 'cosmic_encouragement' && content.affirmation && (
          <div className='space-y-3 text-center'>
            {content.recipientSign && (
              <p className='text-xs uppercase tracking-widest text-pink-400'>
                For {content.recipientSign}
              </p>
            )}
            <p className='text-base text-white leading-relaxed italic'>
              &ldquo;{content.affirmation}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Personal message */}
      {personalMessage && (
        <div className='px-5 pb-5'>
          <div className='rounded-lg bg-zinc-800/50 p-3 border border-zinc-700/50'>
            <p className='text-xs text-zinc-500 mb-1'>Personal message</p>
            <p className='text-sm text-zinc-300'>{personalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

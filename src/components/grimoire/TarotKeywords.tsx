import { cn } from '@/lib/utils';

interface TarotKeywordsProps {
  /** Upright/positive keywords for the card */
  uprightKeywords: string[];
  /** Reversed/shadow keywords for the card */
  reversedKeywords: string[];
  /** Optional custom class name */
  className?: string;
}

/**
 * Displays tarot card keywords in two sections:
 * - Upright keywords (emerald pills)
 * - Reversed keywords (amber pills)
 *
 * Designed for placement after TL;DR section on tarot card pages.
 */
export function TarotKeywords({
  uprightKeywords,
  reversedKeywords,
  className,
}: TarotKeywordsProps) {
  return (
    <section className={cn('mb-8', className)}>
      <h2 className='text-lg font-medium text-zinc-100 mb-4'>Quick Keywords</h2>

      <div className='space-y-4'>
        {/* Upright Keywords */}
        <div>
          <div className='text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2'>
            Upright
          </div>
          <div className='flex flex-wrap gap-2'>
            {uprightKeywords.map((keyword) => (
              <span
                key={`upright-${keyword}`}
                className='px-3 py-1 rounded-full border border-emerald-700 text-[11px] text-emerald-300 bg-emerald-950/30'
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Reversed Keywords */}
        <div>
          <div className='text-xs uppercase tracking-[0.4em] text-zinc-500 mb-2'>
            Reversed
          </div>
          <div className='flex flex-wrap gap-2'>
            {reversedKeywords.map((keyword) => (
              <span
                key={`reversed-${keyword}`}
                className='px-3 py-1 rounded-full border border-amber-700 text-[11px] text-amber-300 bg-amber-950/30'
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { MoonPhaseIcon } from '@/components/MoonPhaseIcon';
import { MonthlyMoonPhaseKey } from '../../utils/moon/monthlyPhases';

type MoonPhaseHeroProps = {
  phaseKey: MonthlyMoonPhaseKey;
  displayName: string;
  phaseName: string;
  keywords: string[];
  heroMessage?: string;
};

export function MoonPhaseHero({
  phaseKey,
  displayName,
  phaseName,
  keywords,
  heroMessage,
}: MoonPhaseHeroProps) {
  const highlightKeywords =
    keywords.length > 0
      ? keywords
          .slice(0, 2)
          .map((keyword) => keyword.toLowerCase())
          .join(' and ')
      : 'lunar energy';

  const heroText =
    heroMessage ??
    `Align rituals with the ${phaseName.toLowerCase()} energy by focusing on ${highlightKeywords}.`;

  return (
    <div className='mb-10 flex flex-wrap items-center gap-4 border-b border-zinc-800/60 pb-6'>
      <div className='rounded-3xl border border-zinc-800/50 bg-zinc-900/60 p-3'>
        <MoonPhaseIcon phase={phaseKey} size={64} priority />
      </div>
      <div className='flex-1 min-w-0 space-y-1'>
        <p className='text-xs uppercase tracking-[0.4em] text-lunary-primary-400'>
          {displayName}
        </p>
        <p className='text-sm text-zinc-400'>{keywords.join(' • ')}</p>
        <p className='text-base text-zinc-200 max-w-2xl'>{heroText}</p>
      </div>
    </div>
  );
}

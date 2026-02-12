'use client';

interface CompatibilityResultProps {
  score: number;
  aspects: Array<{
    planet1: string;
    planet2: string;
    aspectType: string;
    isHarmonious: boolean;
  }>;
  elementBalance?: Record<string, number>;
  summary?: string;
  inviterName: string;
}

export function CompatibilityResult({
  score,
  aspects,
  elementBalance,
  summary,
  inviterName,
}: CompatibilityResultProps) {
  const scoreColor =
    score >= 80
      ? 'text-lunary-success'
      : score >= 60
        ? 'text-lunary-primary-400'
        : score >= 40
          ? 'text-amber-400'
          : 'text-zinc-400';

  const scoreLabel =
    score >= 80
      ? 'Cosmic Soulmates'
      : score >= 60
        ? 'Strong Connection'
        : score >= 40
          ? 'Growing Bond'
          : 'Different Rhythms';

  return (
    <div className='space-y-6'>
      {/* Score circle */}
      <div className='text-center'>
        <div className='relative mx-auto w-32 h-32 mb-4'>
          <svg className='w-full h-full -rotate-90' viewBox='0 0 100 100'>
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='6'
              className='text-zinc-800'
            />
            <circle
              cx='50'
              cy='50'
              r='45'
              fill='none'
              stroke='currentColor'
              strokeWidth='6'
              strokeDasharray={`${(score / 100) * 283} 283`}
              strokeLinecap='round'
              className={scoreColor}
            />
          </svg>
          <div className='absolute inset-0 flex flex-col items-center justify-center'>
            <span className={`text-3xl font-bold ${scoreColor}`}>{score}</span>
            <span className='text-[10px] text-zinc-400 uppercase tracking-wide'>
              score
            </span>
          </div>
        </div>

        <h2 className='text-lg font-semibold text-white'>{scoreLabel}</h2>
        <p className='text-sm text-zinc-400'>with {inviterName}</p>
      </div>

      {/* Summary */}
      {summary && (
        <div className='p-4 rounded-lg bg-zinc-900/50 border border-zinc-800'>
          <p className='text-sm text-zinc-300 leading-relaxed'>{summary}</p>
        </div>
      )}

      {/* Top aspects */}
      {aspects.length > 0 && (
        <div>
          <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
            Key Aspects
          </h3>
          <div className='space-y-2'>
            {aspects.slice(0, 5).map((aspect, i) => (
              <div
                key={i}
                className='flex items-center gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50'
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    aspect.isHarmonious ? 'bg-lunary-success' : 'bg-amber-400'
                  }`}
                />
                <span className='text-sm text-zinc-300'>
                  {aspect.planet1} {aspect.aspectType} {aspect.planet2}
                </span>
                <span
                  className={`text-xs ml-auto ${
                    aspect.isHarmonious
                      ? 'text-lunary-success'
                      : 'text-amber-400'
                  }`}
                >
                  {aspect.isHarmonious ? 'Harmonious' : 'Dynamic'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Element balance */}
      {elementBalance && Object.keys(elementBalance).length > 0 && (
        <div>
          <h3 className='text-xs font-medium text-zinc-400 uppercase tracking-wide mb-3'>
            Element Balance
          </h3>
          <div className='grid grid-cols-2 gap-2'>
            {Object.entries(elementBalance).map(([element, value]) => (
              <div
                key={element}
                className='flex items-center gap-2 p-2 rounded-lg bg-zinc-900/30 border border-zinc-800/50'
              >
                <span className='text-xs text-zinc-400 capitalize w-12'>
                  {element}
                </span>
                <div className='flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-lunary-primary-500 rounded-full transition-all'
                    style={{ width: `${Math.min(value * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

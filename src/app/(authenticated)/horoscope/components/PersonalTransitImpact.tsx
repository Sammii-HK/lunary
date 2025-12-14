import { PersonalTransitImpact } from '../../../../../utils/astrology/personalTransits';

interface PersonalTransitImpactProps {
  impact: PersonalTransitImpact;
}

export function PersonalTransitImpactCard({
  impact,
}: PersonalTransitImpactProps) {
  const impactBorderColor =
    impact.significance === 'high'
      ? 'border-lunary-error-700'
      : impact.significance === 'medium'
        ? 'border-lunary-secondary-700'
        : 'border-lunary-primary-700';

  return (
    <div
      className={`rounded-lg border-l-2 border-opacity-50 ${impactBorderColor} bg-lunary-bg p-4`}
    >
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-zinc-100 text-sm mb-1'>
            {impact.planet} {impact.event}
          </h4>
          <p className='text-xs text-zinc-400'>
            {impact.date.format('MMM DD')} • {impact.type.replace('_', ' ')}
            {impact.house &&
              ` • ${impact.house}${getOrdinalSuffix(impact.house)} house`}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            impact.significance === 'high'
              ? 'bg-lunary-error-950 text-lunary-error-400 border border-lunary-error-800'
              : impact.significance === 'medium'
                ? 'bg-lunary-secondary-950 text-lunary-secondary-300 border border-lunary-secondary-800'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
          }`}
        >
          {impact.significance}
        </span>
      </div>
      <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
        {impact.description}
      </p>
      <div className='mt-2 pt-2 border-t border-zinc-700/50 space-y-2'>
        <p className='text-xs text-zinc-400 leading-relaxed'>
          <span className='font-medium text-zinc-300'>Personal Impact:</span>{' '}
          {impact.personalImpact}
        </p>
        {impact.actionableGuidance && (
          <div className='bg-zinc-800/50 border border-zinc-700/50 rounded p-2'>
            <p className='text-xs text-zinc-300 leading-relaxed'>
              <span className='font-medium text-zinc-200'>What to do:</span>{' '}
              {impact.actionableGuidance}
            </p>
          </div>
        )}
        {impact.aspectToNatal && (
          <p className='text-xs text-zinc-400'>
            <span className='font-medium text-zinc-300'>Aspect:</span> Transit
            at{' '}
            {impact.aspectToNatal.transitDegree ||
              impact.aspectToNatal.transitSign}{' '}
            {impact.aspectToNatal.aspectType} your natal{' '}
            {impact.aspectToNatal.natalPlanet} at{' '}
            {impact.aspectToNatal.natalDegree || impact.aspectToNatal.natalSign}
          </p>
        )}
      </div>
    </div>
  );
}

function getOrdinalSuffix(n: number): string {
  if (n >= 11 && n <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

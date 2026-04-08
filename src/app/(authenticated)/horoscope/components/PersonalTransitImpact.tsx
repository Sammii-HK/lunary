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
      className={`rounded-lg border-l-2 border-opacity-50 ${impactBorderColor} bg-surface-elevated p-4`}
    >
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-content-primary text-sm mb-1'>
            {impact.planet} {impact.event}
          </h4>
          <p className='text-xs text-content-muted'>
            {impact.date.format('MMM DD')} • {impact.type.replace('_', ' ')}
            {impact.house &&
              ` • ${impact.house}${getOrdinalSuffix(impact.house)} house`}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            impact.significance === 'high'
              ? 'bg-layer-deep text-lunary-error-400 border border-lunary-error-800'
              : impact.significance === 'medium'
                ? 'bg-layer-deep text-content-brand-secondary border border-lunary-secondary-800'
                : 'bg-surface-elevated text-content-muted border border-stroke-default'
          }`}
        >
          {impact.significance}
        </span>
      </div>
      <p className='text-sm text-content-secondary leading-relaxed mb-2'>
        {impact.description}
      </p>
      <div className='mt-2 pt-2 border-t border-stroke-default/50 space-y-2'>
        <p className='text-xs text-content-muted leading-relaxed'>
          <span className='font-medium text-content-secondary'>
            Personal Impact:
          </span>{' '}
          {impact.personalImpact}
        </p>
        {impact.actionableGuidance && (
          <div className='bg-surface-card/50 border border-stroke-default/50 rounded p-2'>
            <p className='text-xs text-content-secondary leading-relaxed'>
              <span className='font-medium text-content-primary'>
                What to do:
              </span>{' '}
              {impact.actionableGuidance}
            </p>
          </div>
        )}
        {impact.aspectToNatal && (
          <p className='text-xs text-content-muted'>
            <span className='font-medium text-content-secondary'>Aspect:</span>{' '}
            Transit at{' '}
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

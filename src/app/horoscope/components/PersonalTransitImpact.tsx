import { PersonalTransitImpact } from '../../../../utils/astrology/personalTransits';

interface PersonalTransitImpactProps {
  impact: PersonalTransitImpact;
}

export function PersonalTransitImpactCard({
  impact,
}: PersonalTransitImpactProps) {
  return (
    <div className='rounded-lg border-l-4 border-indigo-500/50 bg-zinc-800/50 p-4'>
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
              ? 'bg-red-500/20 text-red-300/90 border border-red-500/30'
              : impact.significance === 'medium'
                ? 'bg-amber-500/20 text-amber-300/90 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300/90 border border-blue-500/30'
          }`}
        >
          {impact.significance}
        </span>
      </div>
      <p className='text-sm text-zinc-300 leading-relaxed mb-2'>
        {impact.description}
      </p>
      <div className='mt-2 pt-2 border-t border-indigo-500/20'>
        <p className='text-xs text-indigo-300/90 leading-relaxed'>
          <span className='font-medium text-indigo-200'>Personal Impact:</span>{' '}
          {impact.personalImpact}
        </p>
        {impact.aspectToNatal && (
          <p className='text-xs text-purple-300/80 mt-1'>
            <span className='font-medium text-purple-200'>Aspect:</span>{' '}
            {impact.aspectToNatal.aspectType} your natal{' '}
            {impact.aspectToNatal.natalPlanet}
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

import { TransitEvent } from '../../../../utils/astrology/transitCalendar';

interface TransitCardProps {
  transit: TransitEvent;
}

export function TransitCard({ transit }: TransitCardProps) {
  return (
    <div className='rounded-lg border-l-4 border-lunary-secondary-600 bg-zinc-800/50 p-4'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-zinc-100 text-sm mb-1'>
            {transit.planet} {transit.event}
          </h4>
          <p className='text-xs text-zinc-400'>
            {transit.date.format('MMM DD')} • {transit.type.replace('_', ' ')}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            transit.significance === 'high'
              ? 'bg-lunary-error-900 text-lunary-error-300/90 border border-lunary-error-700'
              : transit.significance === 'medium'
                ? 'bg-lunary-accent-900 text-lunary-accent-300 border border-lunary-accent-700'
                : 'bg-lunary-secondary-900 text-lunary-secondary-300 border border-lunary-secondary-700'
          }`}
        >
          {transit.significance}
        </span>
      </div>
      <p className='text-sm text-zinc-300 leading-relaxed'>
        {transit.description}
      </p>
    </div>
  );
}

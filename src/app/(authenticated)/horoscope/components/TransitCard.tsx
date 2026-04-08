import { TransitEvent } from '../../../../../utils/astrology/transitCalendar';

interface TransitCardProps {
  transit: TransitEvent;
}

export function TransitCard({ transit }: TransitCardProps) {
  return (
    <div className='rounded-lg bg-surface-card/50 p-4'>
      <div className='flex justify-between items-start mb-2'>
        <div>
          <h4 className='font-medium text-content-primary text-sm mb-1'>
            {transit.planet} {transit.event}
          </h4>
          <p className='text-xs text-content-muted'>
            {transit.date.format('MMM DD')} • {transit.type.replace('_', ' ')}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            transit.significance === 'high'
              ? 'bg-layer-base text-lunary-error-300/90 border border-lunary-error-700'
              : transit.significance === 'medium'
                ? 'bg-layer-base text-content-brand-accent border border-lunary-accent-700'
                : 'bg-layer-base text-content-brand-secondary border border-lunary-secondary-700'
          }`}
        >
          {transit.significance}
        </span>
      </div>
      <p className='text-sm text-content-secondary leading-relaxed'>
        {transit.description}
      </p>
    </div>
  );
}

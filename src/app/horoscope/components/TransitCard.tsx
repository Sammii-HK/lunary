import { TransitEvent } from '../../../../utils/astrology/transitCalendar';

interface TransitCardProps {
  transit: TransitEvent;
}

export function TransitCard({ transit }: TransitCardProps) {
  return (
    <div className='rounded-lg border-l-4 border-indigo-500/50 bg-zinc-800/50 p-4'>
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
              ? 'bg-red-500/20 text-red-300/90 border border-red-500/30'
              : transit.significance === 'medium'
                ? 'bg-amber-500/20 text-amber-300/90 border border-amber-500/30'
                : 'bg-blue-500/20 text-blue-300/90 border border-blue-500/30'
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

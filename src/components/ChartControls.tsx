'use client';

import { Button } from '@/components/ui/button';

interface ChartControlsProps {
  showAspects: boolean;
  onToggleAspects: () => void;
  aspectFilter: 'all' | 'harmonious' | 'challenging';
  onAspectFilterChange: (filter: 'all' | 'harmonious' | 'challenging') => void;
  showAsteroids: boolean;
  onToggleAsteroids: () => void;
  clockwise?: boolean;
  onToggleClockwise?: () => void;
}

export function ChartControls({
  showAspects,
  onToggleAspects,
  aspectFilter,
  onAspectFilterChange,
  showAsteroids,
  onToggleAsteroids,
  clockwise = false,
  onToggleClockwise,
}: ChartControlsProps) {
  return (
    <div className='flex flex-col items-center gap-2'>
      <div className='flex flex-wrap gap-2 items-center justify-center'>
        <Button onClick={onToggleAspects} variant='lunary-soft' size='sm'>
          {showAspects ? 'Hide Aspects' : 'Show Aspects'}
        </Button>
        <Button onClick={onToggleAsteroids} variant='lunary-soft' size='sm'>
          {showAsteroids ? 'Hide Asteroids' : 'Show Asteroids'}
        </Button>
        {onToggleClockwise && (
          <Button onClick={onToggleClockwise} variant='lunary-soft' size='sm'>
            {clockwise ? 'Counter-Clockwise' : 'Clockwise'}
          </Button>
        )}
      </div>
      {showAspects && (
        <div className='flex gap-2 items-center'>
          <span className='text-xs text-zinc-500'>Filter:</span>
          <Button
            onClick={() => onAspectFilterChange('all')}
            variant={aspectFilter === 'all' ? 'lunary-soft' : 'ghost'}
            size='xs'
          >
            All
          </Button>
          <Button
            onClick={() => onAspectFilterChange('harmonious')}
            variant={aspectFilter === 'harmonious' ? 'lunary-soft' : 'ghost'}
            size='xs'
          >
            Harmonious
          </Button>
          <Button
            onClick={() => onAspectFilterChange('challenging')}
            variant={aspectFilter === 'challenging' ? 'lunary-soft' : 'ghost'}
            size='xs'
          >
            Challenging
          </Button>
        </div>
      )}
    </div>
  );
}

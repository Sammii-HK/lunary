/**
 * Toggle between Natal and Secondary Progression chart views
 */

interface ChartModeToggleProps {
  mode: 'natal' | 'progressed';
  onModeChange: (mode: 'natal' | 'progressed') => void;
  currentAge?: number;
}

export function ChartModeToggle({
  mode,
  onModeChange,
  currentAge = 0,
}: ChartModeToggleProps) {
  return (
    <div className='flex gap-2'>
      <button
        onClick={() => onModeChange('natal')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          mode === 'natal'
            ? 'bg-lunary-primary text-white'
            : 'bg-surface-elevated text-content-secondary hover:bg-surface-elevated/80'
        }`}
      >
        Natal Chart
      </button>
      <button
        onClick={() => onModeChange('progressed')}
        className={`px-4 py-2 rounded-md font-medium transition-colors ${
          mode === 'progressed'
            ? 'bg-lunary-primary text-white'
            : 'bg-surface-elevated text-content-secondary hover:bg-surface-elevated/80'
        }`}
      >
        Secondary Progressions {currentAge > 0 && `(Age ${currentAge})`}
      </button>
    </div>
  );
}

'use client';

export interface ShareCustomizationProps {
  showName?: boolean;
  onShowNameChange?: (show: boolean) => void;
  showPersonalizedBadge?: boolean;
  onShowPersonalizedBadgeChange?: (show: boolean) => void;
}

export function ShareCustomization({
  showName,
  onShowNameChange,
  showPersonalizedBadge,
  onShowPersonalizedBadgeChange,
}: ShareCustomizationProps) {
  const hasOptions = onShowNameChange || onShowPersonalizedBadgeChange;

  if (!hasOptions) return null;

  return (
    <div className='flex flex-col gap-2 pt-2 border-t border-zinc-800'>
      <p className='text-xs text-zinc-400 uppercase tracking-wider'>Options</p>
      <div className='flex flex-col gap-2'>
        {onShowNameChange && (
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={showName}
              onChange={(e) => onShowNameChange(e.target.checked)}
              className='w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-lunary-primary-600 focus:ring-lunary-primary-600 focus:ring-offset-0'
            />
            <span className='text-sm text-zinc-300'>Show my name</span>
          </label>
        )}
        {onShowPersonalizedBadgeChange && (
          <label className='flex items-center gap-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={showPersonalizedBadge}
              onChange={(e) => onShowPersonalizedBadgeChange(e.target.checked)}
              className='w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-lunary-primary-600 focus:ring-lunary-primary-600 focus:ring-offset-0'
            />
            <span className='text-sm text-zinc-300'>
              Show personalized badge
            </span>
          </label>
        )}
      </div>
    </div>
  );
}

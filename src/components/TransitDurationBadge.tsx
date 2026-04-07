interface TransitDurationBadgeProps {
  duration?: {
    totalDays: number;
    remainingDays: number;
    displayText: string;
  };
  className?: string;
}

/**
 * Display transit duration with keyword-style badge
 * Styled to match tarot keyword badges (rounded-md, outline)
 */
export function TransitDurationBadge({
  duration,
  className,
}: TransitDurationBadgeProps) {
  if (!duration) return null;

  const { totalDays, remainingDays, displayText } = duration;
  const daysSinceEntered = totalDays - remainingDays;

  // Proportional thresholds capped for slow planets
  // Moon (2.3d): green first ~5h, pink last ~8h
  // Sun (30d): green first ~3d, pink last ~4.5d
  // Jupiter (365d): green first 7d, pink last 14d
  const newThreshold = Math.min(totalDays * 0.1, 7);
  const endingThreshold = Math.min(totalDays * 0.15, 14);
  const midThreshold = Math.min(totalDays * 0.5, 60);

  // Use semantic CSS classes that flip between dark/light mode
  let colorClasses =
    'bg-surface-elevated border-stroke-subtle text-content-muted';

  if (daysSinceEntered < newThreshold) {
    colorClasses = 'duration-new';
  } else if (remainingDays < endingThreshold) {
    colorClasses = 'duration-ending';
  } else if (remainingDays < midThreshold) {
    colorClasses =
      'bg-layer-base/50 border-stroke-default/30 text-content-secondary';
  }

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border ${colorClasses} ${className ?? ''}`}
    >
      {displayText}
    </span>
  );
}

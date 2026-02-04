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
  const elapsed = daysSinceEntered / totalDays;
  const remaining = remainingDays / totalDays;

  // Proportional thresholds capped for slow planets
  // Moon (2.3d): green first ~5h, pink last ~8h
  // Sun (30d): green first ~3d, pink last ~4.5d
  // Jupiter (365d): green first 7d, pink last 14d
  const newThreshold = Math.min(totalDays * 0.1, 7);
  const endingThreshold = Math.min(totalDays * 0.15, 14);
  const midThreshold = Math.min(totalDays * 0.5, 60);

  let colorClasses = 'bg-zinc-900 border-zinc-800 text-zinc-400';

  if (daysSinceEntered < newThreshold) {
    // Newly entered → aurora green
    colorClasses = 'bg-emerald-950/50 border-emerald-800/40 text-emerald-400';
  } else if (remainingDays < endingThreshold) {
    // Ending soon → cosmic rose
    colorClasses = 'bg-pink-950/50 border-pink-800/40 text-pink-400';
  } else if (remainingDays < midThreshold) {
    // Medium term → primary
    colorClasses =
      'bg-lunary-primary-900/50 border-lunary-primary-700/30 text-lunary-primary-200';
  }

  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border ${colorClasses} ${className ?? ''}`}
    >
      {displayText}
    </span>
  );
}

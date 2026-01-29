import { Badge } from '@/components/ui/badge';

interface TransitDurationBadgeProps {
  duration?: {
    totalDays: number;
    remainingDays: number;
    displayText: string;
  };
  className?: string;
}

/**
 * Display transit duration with color-coded urgency
 * - Aurora green (#6B9B7A): Newly entered < 3 days
 * - Default blue: < 30 days remaining
 * - Cosmic rose (#EE789E): Ending soon < 7 days
 * - Secondary gray: Long term > 30 days
 */
export function TransitDurationBadge({
  duration,
  className,
}: TransitDurationBadgeProps) {
  if (!duration) return null;

  const { totalDays, remainingDays, displayText } = duration;

  // Calculate days since entered sign
  const daysSinceEntered = totalDays - remainingDays;

  // Determine variant based on timing
  let variant: 'aurora' | 'default' | 'cosmic-rose' | 'secondary' = 'secondary';

  if (daysSinceEntered < 3) {
    // Newly entered (< 3 days in sign) → Aurora green
    variant = 'aurora';
  } else if (remainingDays < 7) {
    // Ending soon (< 7 days left) → Cosmic rose (soft pink)
    variant = 'cosmic-rose';
  } else if (remainingDays < 30) {
    // Medium term (< 30 days) → Default blue
    variant = 'default';
  }
  // else: Long term (> 30 days) → Secondary gray (default)

  return (
    <Badge variant={variant} className={className}>
      {displayText}
    </Badge>
  );
}

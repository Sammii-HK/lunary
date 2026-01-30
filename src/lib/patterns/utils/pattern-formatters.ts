/**
 * Reusable formatting utilities for pattern data
 */

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatConfidence(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

export function getTrendIndicator(
  current: number,
  previous: number,
): 'up' | 'down' | 'stable' {
  if (previous === 0) return 'stable';

  const change = ((current - previous) / previous) * 100;
  if (change > 10) return 'up';
  if (change < -10) return 'down';
  return 'stable';
}

export function getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    case 'stable':
      return '→';
  }
}

export function getTrendColor(trend: 'up' | 'down' | 'stable'): string {
  switch (trend) {
    case 'up':
      return 'text-lunary-success';
    case 'down':
      return 'text-lunary-rose';
    case 'stable':
      return 'text-zinc-500';
  }
}

export function calculateStrength(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

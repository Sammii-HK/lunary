/**
 * Text formatting utilities
 */

/**
 * Format a list of items with proper grammar (Oxford comma)
 */
export const formatList = (items: string[], max = 3): string => {
  const values = items.filter(Boolean).slice(0, max);
  if (values.length === 0) return '';
  if (values.length === 1) return values[0];
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
};

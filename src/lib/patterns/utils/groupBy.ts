/**
 * Generic groupBy utility for pattern detection
 * Reusable across all detector types
 */

/**
 * Group array items by a key function
 * @param items Array of items to group
 * @param keyFn Function that extracts the grouping key from each item
 * @returns Record of grouped items
 */
export function groupBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K | undefined,
): Record<K, T[]> {
  const groups = {} as Record<K, T[]>;

  for (const item of items) {
    const key = keyFn(item);
    if (key === undefined || key === null) {
      continue; // Skip items without a valid key
    }

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
  }

  return groups;
}

/**
 * Group items by multiple keys simultaneously
 * Returns a nested map structure
 */
export function groupByMultiple<T>(
  items: T[],
  ...keyFns: Array<(item: T) => string | undefined>
): Map<string, T[]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const keys = keyFns.map((fn) => fn(item)).filter((k) => k !== undefined);
    if (keys.length === 0) continue;

    const compositeKey = keys.join('::');
    const existing = groups.get(compositeKey) || [];
    groups.set(compositeKey, [...existing, item]);
  }

  return groups;
}

/**
 * Count occurrences by key
 * Shorthand for groupBy + map to length
 */
export function countBy<T, K extends string | number>(
  items: T[],
  keyFn: (item: T) => K | undefined,
): Record<K, number> {
  const groups = groupBy(items, keyFn);
  const counts = {} as Record<K, number>;

  for (const [key, items] of Object.entries(groups)) {
    counts[key as K] = items.length;
  }

  return counts;
}

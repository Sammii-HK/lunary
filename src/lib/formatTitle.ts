/**
 * Format a page title by removing any existing "Lunary" suffixes
 * This ensures the layout's title.template can append " | Lunary" without duplication
 *
 * @param title - The page title
 * @returns Cleaned title without Lunary suffix
 *
 * @example
 * formatTitle('Virgo Horoscope | Lunary') // => 'Virgo Horoscope'
 * formatTitle('Virgo Horoscope - Lunary') // => 'Virgo Horoscope'
 * formatTitle('Virgo Horoscope') // => 'Virgo Horoscope'
 */
export function formatTitle(title: string | undefined): string | undefined {
  if (!title) return title;

  // Remove " | Lunary" or " - Lunary" from the end
  return title
    .replace(/\s*\|\s*Lunary\s*$/i, '')
    .replace(/\s*-\s*Lunary\s*$/i, '')
    .trim();
}

/**
 * Format metadata object to ensure title doesn't have Lunary suffix
 * Use this in generateMetadata functions
 *
 * @example
 * return formatMetadata({
 *   title: 'My Page | Lunary', // Will be cleaned to 'My Page'
 *   description: '...',
 * });
 */
export function formatMetadata<
  T extends { title?: string | { default: string } },
>(metadata: T): T {
  if (typeof metadata.title === 'string') {
    return {
      ...metadata,
      title: formatTitle(metadata.title),
    };
  }

  if (
    metadata.title &&
    typeof metadata.title === 'object' &&
    'default' in metadata.title
  ) {
    return {
      ...metadata,
      title: {
        ...metadata.title,
        default: formatTitle(metadata.title.default) ?? metadata.title.default,
      },
    };
  }

  return metadata;
}

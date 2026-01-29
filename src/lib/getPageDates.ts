import { execSync } from 'child_process';
import { existsSync } from 'fs';

/**
 * Convert a canonical URL to a file path in the app directory
 * Uses Next.js app router conventions
 *
 * @example
 * urlToFilePath('/grimoire/horoscopes/virgo/2026/february')
 * // => './src/app/grimoire/horoscopes/[sign]/[year]/[month]/page.tsx'
 */
function urlToFilePath(url: string): string | null {
  try {
    // Remove domain if present
    const pathname = url.replace(/^https?:\/\/[^/]+/, '');

    // Remove leading/trailing slashes
    const cleanPath = pathname.replace(/^\/+|\/+$/g, '');

    // Common patterns in grimoire
    const patterns = [
      // Horoscopes
      {
        regex: /^grimoire\/horoscopes\/([^/]+)\/(\d{4})\/([^/]+)$/,
        file: 'grimoire/horoscopes/[sign]/[year]/[month]/page.tsx',
      },
      {
        regex: /^grimoire\/horoscopes\/([^/]+)\/(\d{4})$/,
        file: 'grimoire/horoscopes/[sign]/[year]/page.tsx',
      },
      {
        regex: /^grimoire\/horoscopes$/,
        file: 'grimoire/horoscopes/page.tsx',
      },

      // Houses
      {
        regex: /^grimoire\/houses\/overview\/([^/]+)$/,
        file: 'grimoire/houses/overview/[house]/page.tsx',
      },

      // Modern Witchcraft
      {
        regex: /^grimoire\/modern-witchcraft\/witch-types\/([^/]+)$/,
        file: 'grimoire/modern-witchcraft/witch-types/[type]/page.tsx',
      },

      // Mirror/Double Hours
      {
        regex: /^grimoire\/mirror-hours\/([^/]+)$/,
        file: 'grimoire/mirror-hours/[time]/page.tsx',
      },
      {
        regex: /^grimoire\/double-hours\/([^/]+)$/,
        file: 'grimoire/double-hours/[time]/page.tsx',
      },

      // Generic pattern: match any single dynamic segment
      {
        regex: /^grimoire\/([^/]+)\/([^/]+)$/,
        file: (path: string) => {
          const parts = path.split('/');
          return `grimoire/${parts[1]}/[slug]/page.tsx`;
        },
      },

      // Generic pattern: static page
      {
        regex: /^grimoire\/([^/]+)$/,
        file: (path: string) => {
          const parts = path.split('/');
          return `grimoire/${parts[1]}/page.tsx`;
        },
      },
    ];

    for (const pattern of patterns) {
      if (pattern.regex.test(cleanPath)) {
        const file =
          typeof pattern.file === 'function'
            ? pattern.file(cleanPath)
            : pattern.file;
        return `./src/app/${file}`;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get the first commit date (creation date) of a file
 */
function getFileCreationDate(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) {
      return null;
    }

    // Get first commit date for this file (oldest commit)
    const gitCommand = `git log --follow --format="%ai" --reverse -- "${filePath}" | head -1`;
    const output = execSync(gitCommand, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (output) {
      // Extract date part (YYYY-MM-DD)
      return output.split(' ')[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get the last commit date (modified date) of a file
 */
function getFileModifiedDate(filePath: string): string | null {
  try {
    if (!existsSync(filePath)) {
      return null;
    }

    // Get last commit date for this file
    const gitCommand = `git log -1 --format="%ai" -- "${filePath}"`;
    const output = execSync(gitCommand, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();

    if (output) {
      // Extract date part (YYYY-MM-DD)
      return output.split(' ')[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Automatically get page dates from canonical URL
 * Uses git history to determine creation and modification dates
 *
 * @param canonicalUrl - The canonical URL of the page
 * @returns Object with datePublished and dateModified, or nulls if not found
 *
 * @example
 * getPageDatesFromUrl('/grimoire/horoscopes/virgo/2026/february')
 * // => { datePublished: '2025-01-15', dateModified: '2026-01-29' }
 */
export function getPageDatesFromUrl(canonicalUrl: string): {
  datePublished: string | null;
  dateModified: string | null;
} {
  const filePath = urlToFilePath(canonicalUrl);

  if (!filePath) {
    return { datePublished: null, dateModified: null };
  }

  const datePublished = getFileCreationDate(filePath);
  const dateModified = getFileModifiedDate(filePath);

  return { datePublished, dateModified };
}

/**
 * Get smart defaults for page dates
 * Priority: provided > git history > current date
 */
export function getSmartPageDates(
  canonicalUrl: string,
  providedPublished?: string,
  providedModified?: string,
): {
  datePublished: string;
  dateModified: string;
} {
  const currentDate = new Date().toISOString().split('T')[0];

  // Try to get dates from git history
  const gitDates = getPageDatesFromUrl(canonicalUrl);

  // Use priority: provided > git > current date
  const datePublished =
    providedPublished || gitDates.datePublished || currentDate;
  const dateModified =
    providedModified || gitDates.dateModified || datePublished || currentDate;

  return { datePublished, dateModified };
}

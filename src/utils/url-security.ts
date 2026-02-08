/**
 * URL Security Utilities
 *
 * Validates and sanitizes URLs to prevent SSRF and XSS attacks
 */

/**
 * Validates that a URL is safe for use in image src attributes.
 * Only allows relative URLs starting with /api/ to prevent SSRF.
 *
 * @param url - The URL to validate
 * @returns The validated URL or a safe fallback
 */
export function sanitizeImageUrl(url: string): string {
  try {
    // Parse as URL to check structure
    const parsed = new URL(url, 'https://example.com');

    // Only allow relative URLs starting with /api/
    if (parsed.origin === 'https://example.com' && url.startsWith('/api/')) {
      return url;
    }

    // If it's an absolute URL to our own domain, allow it
    if (
      process.env.NEXT_PUBLIC_BASE_URL &&
      parsed.origin === process.env.NEXT_PUBLIC_BASE_URL &&
      parsed.pathname.startsWith('/api/')
    ) {
      return url;
    }

    console.warn('Unsafe image URL blocked:', url);
    return '/api/og/fallback'; // Safe fallback
  } catch {
    console.warn('Invalid image URL blocked:', url);
    return '/api/og/fallback';
  }
}

/**
 * Validates that a URL is a safe relative API endpoint.
 * More strict than sanitizeImageUrl - only allows /api/ paths.
 *
 * @param url - The URL to validate
 * @returns true if the URL is safe
 */
export function isValidApiUrl(url: string): boolean {
  return (
    url.startsWith('/api/') &&
    !url.includes('..') &&
    !url.includes('//') &&
    !/[<>"']/.test(url)
  );
}

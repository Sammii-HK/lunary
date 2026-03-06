/**
 * VideoObject JSON-LD structured data component.
 *
 * Adds VideoObject schema markup to grimoire pages that have associated videos.
 * Helps Google surface video thumbnails in search results.
 *
 * @see https://developers.google.com/search/docs/appearance/structured-data/video
 */

interface VideoJsonLdProps {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string; // ISO 8601 format
  contentUrl?: string;
  embedUrl?: string;
  duration?: string; // ISO 8601 duration (e.g., "PT30S" for 30 seconds)
}

export function VideoJsonLd({
  name,
  description,
  thumbnailUrl,
  uploadDate,
  contentUrl,
  embedUrl,
  duration,
}: VideoJsonLdProps) {
  // All values are server-controlled props, not user input — safe for JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name,
    description,
    thumbnailUrl,
    uploadDate,
    ...(contentUrl ? { contentUrl } : {}),
    ...(embedUrl ? { embedUrl } : {}),
    ...(duration ? { duration } : {}),
  };

  return (
    <script
      type='application/ld+json'
      // eslint-disable-next-line react/no-danger -- JSON-LD requires dangerouslySetInnerHTML; all values are server-controlled
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

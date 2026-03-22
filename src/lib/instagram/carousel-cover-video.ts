import { getImageBaseUrl } from '@/lib/urls';

const CONTENT_CREATOR_URL =
  process.env.CONTENT_CREATOR_URL ?? 'https://content.sammii.dev';

export interface CarouselCoverVideoResult {
  url: string;
  postId: string;
}

/**
 * Generate an animated carousel cover video by calling the Content Creator service.
 *
 * Takes an existing Lunary OG image URL and renders twinkling stars over it.
 * Returns an MP4 URL ready to use as the first slide in an Instagram carousel.
 *
 * Usage in your carousel cron:
 *
 *   const cover = await generateCarouselCoverVideo({
 *     slug: 'zodiac/aries',
 *     slideParams: { sign: 'aries', category: 'zodiac' },
 *     seed: `carousel-${dateKey}-zodiac-aries`,
 *   });
 *
 *   // cover.url → MP4 with animated stars over the OG zodiac image
 *   // Use as imageUrls[0] in your carousel post
 */
export async function generateCarouselCoverVideo({
  slug,
  slideParams = {},
  seed,
  durationSecs = 5,
}: {
  /** Grimoire slug — used to build the OG image URL (e.g. 'zodiac/aries') */
  slug: string;
  /** Extra query params passed to the carousel OG route */
  slideParams?: Record<string, string>;
  /** Unique seed for star positions — use content + date so same content = same stars */
  seed: string;
  durationSecs?: number;
}): Promise<CarouselCoverVideoResult> {
  const baseUrl = getImageBaseUrl();

  // Build the OG image URL for the cover slide
  const params = new URLSearchParams({ slug, slide: 'cover', ...slideParams });
  const backgroundImageUrl = `${baseUrl}/api/og/instagram/carousel?${params.toString()}`;

  const res = await fetch(`${CONTENT_CREATOR_URL}/api/carousel/cover-video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      // heading/subheading not needed — backgroundImageUrl already has the text baked in
      heading: slug,
      styleId: 'cosmic',
      seed,
      backgroundImageUrl,
      durationSecs,
    }),
    signal: AbortSignal.timeout(120_000), // 2 min — Remotion render can take a moment
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`carousel-cover-video failed (${res.status}): ${body}`);
  }

  return res.json() as Promise<CarouselCoverVideoResult>;
}

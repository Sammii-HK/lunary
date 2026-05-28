import { NextRequest, NextResponse } from 'next/server';

/**
 * Per-platform link-in-bio redirect.
 *
 * Each social platform points its bio at lunary.app/links/{slug}. Rather than
 * dropping the visitor on the generic /links menu, we redirect them straight
 * to the destination most likely to convert for that audience, carrying a
 * source-stamped UTM so we can attribute downstream signups.
 *
 * Unknown slugs fall back to the /links menu so old bio URLs keep working.
 */

type Destination = {
  path: string;
  campaign: string;
};

const PLATFORM_DESTINATIONS: Record<string, Destination> = {
  ig: {
    path: '/quiz/beyond-your-sun-sign/chart-ruler',
    campaign: 'ig_bio_quiz',
  },
  instagram: {
    path: '/quiz/beyond-your-sun-sign/chart-ruler',
    campaign: 'ig_bio_quiz',
  },
  tt: { path: '/grimoire/astrology/sky-now', campaign: 'tt_bio_sky_now' },
  tiktok: { path: '/grimoire/astrology/sky-now', campaign: 'tt_bio_sky_now' },
  yt: { path: '/birth-chart', campaign: 'yt_bio_birth_chart' },
  youtube: { path: '/birth-chart', campaign: 'yt_bio_birth_chart' },
  threads: { path: '/grimoire', campaign: 'threads_bio_grimoire' },
  x: { path: '/building-lunary', campaign: 'x_bio_building' },
  twitter: { path: '/building-lunary', campaign: 'x_bio_building' },
  bsky: { path: '/grimoire', campaign: 'bsky_bio_grimoire' },
  bluesky: { path: '/grimoire', campaign: 'bsky_bio_grimoire' },
  pinterest: { path: '/birth-chart', campaign: 'pin_bio_birth_chart' },
  pin: { path: '/birth-chart', campaign: 'pin_bio_birth_chart' },
  reddit: { path: '/grimoire', campaign: 'reddit_bio_grimoire' },
  mastodon: { path: '/grimoire', campaign: 'mastodon_bio_grimoire' },
  podcast: { path: '/podcast', campaign: 'podcast_bio' },
  substack: { path: '/grimoire', campaign: 'substack_bio_grimoire' },
  // Persona slugs (Studio Sammii) — each persona's bio/CTA routes to its best cold destination.
  stardust: { path: '/grimoire/astrology/sky-now', campaign: 'stardust_sky' },
  solopreneur: { path: '/building-lunary', campaign: 'solopreneur_build' },
  seer: { path: '/grimoire/tarot', campaign: 'seer_tarot' },
  sparkle: { path: '/birth-chart', campaign: 'sparkle_chart' },
  // Content slugs — for posts/replies pointing at a specific page (cold-safe routes only).
  'sky-now': { path: '/grimoire/astrology/sky-now', campaign: 'content_sky_now' },
  transits: { path: '/transits', campaign: 'content_transits' },
  'birth-chart': { path: '/birth-chart', campaign: 'content_birth_chart' },
  'build-log': { path: '/building-lunary', campaign: 'content_build_log' },
  'daily-tarot': { path: '/grimoire/tarot', campaign: 'content_daily_tarot' },
  pricing: { path: '/building-lunary', campaign: 'content_pricing_to_build' },
};
// Notes on destinations intentionally NOT in this map:
//   - discord: dead channel, audience mismatch — falls back to /links menu
//   - community: in-app destination, requires auth, not a cold landing

function normaliseSlug(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, '');
}

function buildDestinationUrl(
  req: NextRequest,
  dest: Destination,
  slug: string,
): string {
  const url = new URL(dest.path, req.nextUrl.origin);
  url.searchParams.set('utm_source', slug);
  url.searchParams.set('utm_medium', 'social_bio');
  url.searchParams.set('utm_campaign', dest.campaign);
  url.searchParams.set('utm_content', `links_${slug}`);

  for (const [key, value] of req.nextUrl.searchParams) {
    if (!url.searchParams.has(key)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
): Promise<Response> {
  const { platform } = await params;
  const slug = normaliseSlug(platform);
  const dest = PLATFORM_DESTINATIONS[slug];

  if (!dest) {
    return NextResponse.redirect(new URL('/links', req.nextUrl.origin), 307);
  }

  return NextResponse.redirect(buildDestinationUrl(req, dest, slug), 307);
}

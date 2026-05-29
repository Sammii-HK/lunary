/**
 * Public cosmic identity profile — `/me/[handle]`.
 *
 * Linktree-style public page. Server-rendered, no auth, indexed by Google.
 * Pulls Big Three from `user_profiles.birth_chart`, the user's current top
 * transit hit via `findNextHit`, and the top 3 transits of the current
 * year via the existing year-in-stars compute pipeline (which uses
 * `byPersonalImpact` under the hood).
 *
 * Privacy: the page only renders when the profile owner has given explicit
 * consent (`user.profile_is_public = true`). If the handle is unknown, does
 * not match a `user.public_handle`, or the owner has NOT opted in, we 404 and
 * the page is marked `noindex` so nothing is crawled without consent.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { sql } from '@vercel/postgres';

import { CosmicIdentityCard } from '@/components/cosmic-identity/CosmicIdentityCard';
import { getUserSigns } from '@/lib/community/get-user-signs';
import { findNextHit } from '@/lib/live-transits/find-next';
import { computeYearInStars } from '@/lib/year-in-stars/compute';
import type { RankableTransit } from '@/lib/transits/personal-impact-rank';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
// Surface the page to crawlers and let them re-index when handles change.
export const revalidate = 600;

// Same allow-list the API claim route uses — kept inline so this page is
// self-contained and doesn't pull in client deps.
const HANDLE_REGEX = /^[a-z0-9-]{3,30}$/;

interface PageParams {
  params: Promise<{ handle: string }>;
}

interface UserRow {
  id: string;
  name: string | null;
  profile_is_public: boolean | null;
}

interface ProfileRow {
  birth_chart: unknown;
  personal_card: Record<string, unknown> | null;
}

interface CosmicVibeStored {
  vibe?: {
    archetype?: string;
  };
}

async function loadByHandle(handle: string): Promise<{
  user: UserRow;
  profile: ProfileRow | null;
  referralCode: string | null;
} | null> {
  const userRes = await sql<UserRow>`
    SELECT id, name, profile_is_public FROM "user"
    WHERE public_handle = ${handle}
    LIMIT 1
  `;
  const user = userRes.rows[0];
  if (!user) return null;
  // Explicit-consent gate: never expose a profile the owner has not opted in
  // to publish. Treated exactly like an unknown handle (404 + noindex).
  if (user.profile_is_public !== true) return null;

  const profileRes = await sql<ProfileRow>`
    SELECT birth_chart, personal_card FROM user_profiles
    WHERE user_id = ${user.id}
    LIMIT 1
  `;

  // The profile owner's referral code, so the free-chart CTA below can
  // attribute any signup back to the person whose page is being viewed.
  let referralCode: string | null = null;
  try {
    const refRes = await sql<{ code: string }>`
      SELECT code FROM referral_codes
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    referralCode = refRes.rows[0]?.code ?? null;
  } catch {
    referralCode = null;
  }

  return { user, profile: profileRes.rows[0] ?? null, referralCode };
}

async function fetchYearTransitsForYear(
  year: number,
): Promise<RankableTransit[]> {
  try {
    const result = await sql<{ forecast: unknown }>`
      SELECT forecast FROM yearly_forecasts WHERE year = ${year} LIMIT 1
    `;
    const forecast = result.rows[0]?.forecast as
      | {
          keyAspects?: Array<{
            date: string;
            aspect: string;
            planets: string[];
          }>;
          eclipses?: Array<{ date: string; type: string; sign: string }>;
          retrogrades?: Array<{ planet: string; startDate: string }>;
        }
      | undefined;
    if (!forecast) return [];

    const out: RankableTransit[] = [];
    for (const a of forecast.keyAspects ?? []) {
      const [transitPlanet, natalPlanet] = a.planets ?? [];
      if (!transitPlanet) continue;
      out.push({
        transitPlanet,
        natalPlanet,
        aspectType: a.aspect,
        transitLongitude: 0,
        date: new Date(a.date),
        type: 'aspect',
      });
    }
    for (const e of forecast.eclipses ?? []) {
      out.push({
        transitPlanet: e.type === 'solar' ? 'Sun' : 'Moon',
        transitLongitude: 0,
        date: new Date(e.date),
        type: 'eclipse',
      });
    }
    for (const r of forecast.retrogrades ?? []) {
      out.push({
        transitPlanet: r.planet,
        transitLongitude: 0,
        date: new Date(r.startDate),
        type: 'retrograde',
      });
    }
    return out;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { handle: rawHandle } = await params;
  const handle = String(rawHandle || '').toLowerCase();
  // Default to noindex. Only a consented, public profile (below) flips this on,
  // so an unknown / private handle is never surfaced to crawlers.
  const noindex = { index: false, follow: false } as const;
  if (!HANDLE_REGEX.test(handle)) {
    return { title: 'Cosmic identity | Lunary', robots: noindex };
  }
  const data = await loadByHandle(handle);
  if (!data) return { title: 'Cosmic identity | Lunary', robots: noindex };

  const { user, profile } = data;
  const chart = Array.isArray(profile?.birth_chart)
    ? (profile?.birth_chart as BirthChartData[])
    : [];
  const { sunSign, moonSign, risingSign } = getUserSigns(
    chart as Parameters<typeof getUserSigns>[0],
  );
  const placements = [
    sunSign && `${sunSign} Sun`,
    moonSign && `${moonSign} Moon`,
    risingSign && `${risingSign} Rising`,
  ]
    .filter(Boolean)
    .join(' \u00b7 ');

  const title = `${user.name || handle} \u00b7 Cosmic identity | Lunary`;
  const description = placements
    ? `${user.name || `@${handle}`}'s cosmic identity: ${placements}.`
    : `${user.name || `@${handle}`}'s cosmic identity on Lunary.`;

  // Allow-listed handle is safe to embed in OG URL (already passed regex).
  const ogUrl = `/api/og/cosmic-identity?handle=${encodeURIComponent(handle)}`;

  return {
    title,
    description,
    // Reached only for a consented public profile (loadByHandle gates on
    // profile_is_public), so indexing here is intentional opt-in.
    robots: { index: true, follow: true },
    alternates: { canonical: `/me/${handle}` },
    openGraph: {
      title,
      description,
      url: `/me/${handle}`,
      type: 'profile',
      images: [{ url: ogUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
  };
}

export default async function CosmicIdentityPublicPage({ params }: PageParams) {
  const { handle: rawHandle } = await params;
  const handle = String(rawHandle || '').toLowerCase();
  if (!HANDLE_REGEX.test(handle)) notFound();

  const data = await loadByHandle(handle);
  if (!data) notFound();

  const { user, profile, referralCode } = data;

  // Free-chart CTA carrying the owner's referral code so a visitor who lands
  // on a friend's profile is one click from their own free chart, attributed.
  const freeChartHref = referralCode
    ? `/birth-chart?ref=${encodeURIComponent(referralCode)}`
    : '/birth-chart';

  // ---- Big Three -------------------------------------------------------
  const chart: BirthChartData[] = Array.isArray(profile?.birth_chart)
    ? (profile!.birth_chart as BirthChartData[])
    : [];
  const { sunSign, moonSign, risingSign } = getUserSigns(
    chart as Parameters<typeof getUserSigns>[0],
  );
  const bigThree = [
    { placement: 'Sun' as const, sign: sunSign },
    { placement: 'Moon' as const, sign: moonSign },
    { placement: 'Rising' as const, sign: risingSign },
  ];

  // ---- This-week vibe (top transit hitting them) ----------------------
  let vibeHeadline: string | null = null;
  if (chart.length > 0) {
    try {
      const hit = findNextHit({ natalChart: chart, withinDays: 7 });
      if (hit) {
        vibeHeadline = `${hit.transitPlanet} ${hit.aspect.toLowerCase()} your ${hit.natalPlanet} \u2014 in ${hit.daysUntil}d.`;
      }
    } catch {
      vibeHeadline = null;
    }
  }

  // Cosmic-vibe quiz archetype, if user completed it
  const personalCard = profile?.personal_card ?? null;
  const cosmicVibeStored = (personalCard as Record<string, unknown> | null)
    ?.cosmicVibe as CosmicVibeStored | undefined;
  const archetype = cosmicVibeStored?.vibe?.archetype || null;

  // ---- Top 3 transits this year ---------------------------------------
  const year = new Date().getUTCFullYear();
  const yearTransits = await fetchYearTransitsForYear(year);
  let topTransits: Array<{ label: string; date: string; score: number }> = [];
  if (chart.length > 0 && yearTransits.length > 0) {
    try {
      const result = computeYearInStars({
        year,
        journalEntries: [],
        transits: yearTransits,
        natalChart: chart,
      });
      topTransits = result.topTransits.slice(0, 3).map((t) => ({
        label: t.label,
        date: t.date,
        score: t.score,
      }));
    } catch {
      topTransits = [];
    }
  }

  return (
    <main className='min-h-screen bg-surface-base px-4 py-12 sm:py-16'>
      <div className='mx-auto w-full max-w-xl'>
        <CosmicIdentityCard
          handle={handle}
          displayName={user.name}
          bigThree={bigThree}
          vibe={
            vibeHeadline
              ? { headline: vibeHeadline, archetype }
              : archetype
                ? { headline: `\u2728 ${archetype}`, archetype }
                : null
          }
          topTransits={topTransits}
        />
        <div className='mt-8 rounded-xl border border-lunary-primary-700 bg-gradient-to-r from-layer-base/30 to-lunary-highlight-900/30 p-5 text-center'>
          <p className='text-sm text-content-secondary'>
            Want your own cosmic identity? Read your real birth chart free.
          </p>
          <Link
            href={freeChartHref}
            className='mt-3 inline-block rounded-lg bg-lunary-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-lunary-primary-400'
          >
            Get your free birth chart
          </Link>
        </div>
        <p className='mt-6 text-center text-xs text-content-muted'>
          Powered by{' '}
          <Link
            href={freeChartHref}
            className='text-content-brand underline-offset-2 hover:underline'
          >
            Lunary
          </Link>
          {' \u00b7 your daily astrology companion'}
        </p>
      </div>
    </main>
  );
}

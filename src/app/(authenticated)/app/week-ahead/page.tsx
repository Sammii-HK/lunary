/**
 * Week Ahead — Lunary's Sunday-evening personalised digest.
 *
 * Server component. Loads the user's natal chart, computes the current
 * Sunday → Saturday week range in their timezone, builds the WeeklyPage,
 * and renders the magazine-style view.
 */

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';

import { auth } from '@/lib/auth';
import { Heading } from '@/components/ui/Heading';
import { WeeklyPageView } from '@/components/weekly-pages/WeeklyPageView';
import { buildWeeklyPage, getCurrentWeekRange } from '@/lib/weekly-pages/build';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Week Ahead | Lunary',
  description:
    'Your personalised Sunday-evening digest — top transits, moon journey, ritual, and a poetic summary of the week to come.',
};

export default async function WeekAheadPage() {
  const headersList = await headers();
  const session = await auth.api
    .getSession({ headers: headersList })
    .catch(() => null);

  if (!session?.user?.id) {
    redirect('/login?next=/app/week-ahead');
  }

  const userId = session.user.id;
  const userName = session.user.name ?? '';
  const firstName = userName.trim().split(' ')[0] || undefined;

  const profileResult = await sql`
    SELECT birth_chart, timezone FROM user_profiles WHERE user_id = ${userId} LIMIT 1
  `;

  const natalChart = (profileResult.rows[0]?.birth_chart ??
    []) as BirthChartData[];
  const timezone =
    (profileResult.rows[0]?.timezone as string | undefined) ?? undefined;

  if (!Array.isArray(natalChart) || natalChart.length === 0) {
    return (
      <main className='mx-auto w-full max-w-2xl px-4 py-10'>
        <Heading as='h1' variant='h1'>
          Week Ahead
        </Heading>
        <p className='mt-3 text-sm text-content-secondary'>
          Add your birth details first — the week-ahead digest reads transits
          against your natal chart, so we need somewhere to anchor the maths.
        </p>
      </main>
    );
  }

  const { weekStart, weekEnd } = getCurrentWeekRange(new Date(), timezone);
  const page = buildWeeklyPage({ natalChart, weekStart, weekEnd });

  // OG share link — the route validates everything against an allow-list.
  const params = new URLSearchParams({
    weekStart: page.weekStart,
    headline: page.headline,
    topAspect: page.topTransits[0]?.oneLiner ?? '',
    phase: page.moonJourney.dominantPhase.name,
    handle: firstName ?? '',
  });
  const ogImageHref = `/api/og/weekly-page?${params.toString()}`;

  return (
    <WeeklyPageView
      page={page}
      ogImageHref={ogImageHref}
      firstName={firstName}
    />
  );
}

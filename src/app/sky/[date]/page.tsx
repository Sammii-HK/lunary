import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import {
  getRealPlanetaryPositions,
  getDegreeInSign,
  getMinutesInDegree,
  getZodiacSign,
} from '@utils/astrology/astronomical-data';
import {
  isIsoDate,
  isNamedSlug,
  namedSlugRequiresSession,
  resolveNamedSlug,
} from '@/lib/sky-deeplinks/named-slugs';
import { DaySkyView } from '@/components/sky/DaySkyView';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

export const runtime = 'nodejs';
// Server-render once, cache for 24h — historical sky data is immutable.
export const revalidate = 86_400;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

const PLANET_NAMES: Array<{ key: string; display: string }> = [
  { key: 'Sun', display: 'Sun' },
  { key: 'Moon', display: 'Moon' },
  { key: 'Mercury', display: 'Mercury' },
  { key: 'Venus', display: 'Venus' },
  { key: 'Mars', display: 'Mars' },
  { key: 'Jupiter', display: 'Jupiter' },
  { key: 'Saturn', display: 'Saturn' },
  { key: 'Uranus', display: 'Uranus' },
  { key: 'Neptune', display: 'Neptune' },
  { key: 'Pluto', display: 'Pluto' },
];

const NAMED_SLUG_LABELS: Record<string, string> = {
  today: 'Today',
  'the-day-i-was-born': 'The day you were born',
  'the-eclipse': 'The most recent eclipse',
  'the-equinox': 'The nearest equinox',
  'the-solstice': 'The nearest solstice',
};

type Params = Promise<{ date: string }>;

interface SkyPageProps {
  params: Params;
}

/**
 * Best-effort lookup of the current user's birthday for the
 * `the-day-i-was-born` slug. Returns null when no session.
 */
async function getSessionUserBirthday(): Promise<{
  hasSession: boolean;
  birthday: string | null;
}> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
    const sessionResponse = await auth.api.getSession({
      headers: new Headers({ cookie: cookieHeader }),
    });
    const user = sessionResponse?.user as
      | {
          id?: string;
          birthday?: string | null;
          birthDate?: string | null;
        }
      | undefined;
    if (!user?.id) return { hasSession: false, birthday: null };
    const raw = user.birthday ?? user.birthDate ?? null;
    return { hasSession: true, birthday: raw };
  } catch {
    return { hasSession: false, birthday: null };
  }
}

/** Convert getRealPlanetaryPositions output to BirthChartData[]. */
function buildPlacements(date: Date): BirthChartData[] {
  const positions = getRealPlanetaryPositions(date) as Record<
    string,
    {
      longitude: number;
      sign?: string;
      degree?: number;
      minutes?: number;
      retrograde?: boolean;
    }
  >;
  const placements: BirthChartData[] = [];
  for (const { key, display } of PLANET_NAMES) {
    const pos = positions[key];
    if (!pos || !Number.isFinite(pos.longitude)) continue;
    const longitude = ((pos.longitude % 360) + 360) % 360;
    const sign = pos.sign ?? getZodiacSign(longitude);
    const degree = pos.degree ?? getDegreeInSign(longitude);
    const minutes = pos.minutes ?? getMinutesInDegree(longitude);
    placements.push({
      body: display,
      sign,
      degree,
      minute: minutes,
      eclipticLongitude: longitude,
      retrograde: Boolean(pos.retrograde),
    });
  }
  return placements;
}

function formatLongDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[(m - 1 + 12) % 12]} ${d}, ${y}`;
}

/**
 * Resolve the URL `[date]` segment to a real ISO date.
 *
 * Returns:
 *  - `{ kind: 'iso', date }` when the segment is a YYYY-MM-DD or a slug we
 *    were able to resolve.
 *  - `{ kind: 'redirect', url }` when the slug requires a session and we
 *    don't have one (anonymous visitor on `the-day-i-was-born`).
 *  - `{ kind: 'notFound' }` when the segment is invalid.
 */
async function resolveSegment(
  raw: string,
): Promise<
  | { kind: 'iso'; date: string; slug?: string; contextLabel?: string }
  | { kind: 'redirect'; url: string }
  | { kind: 'notFound' }
> {
  if (isIsoDate(raw)) {
    return { kind: 'iso', date: raw };
  }
  if (!isNamedSlug(raw)) {
    return { kind: 'notFound' };
  }

  // Anonymous-vs-session handling: `the-day-i-was-born` is the only slug
  // that needs the user. Without a session → redirect to /auth, NOT 404.
  if (namedSlugRequiresSession(raw)) {
    const { hasSession, birthday } = await getSessionUserBirthday();
    if (!hasSession || !birthday) {
      return {
        kind: 'redirect',
        url: `/auth?next=${encodeURIComponent(`/sky/${raw}`)}`,
      };
    }
    const resolved = resolveNamedSlug(raw, { userBirthday: birthday });
    if (!resolved) return { kind: 'notFound' };
    return {
      kind: 'iso',
      date: resolved,
      slug: raw,
      contextLabel: NAMED_SLUG_LABELS[raw],
    };
  }

  const resolved = resolveNamedSlug(raw);
  if (!resolved) return { kind: 'notFound' };
  return {
    kind: 'iso',
    date: resolved,
    slug: raw,
    contextLabel: NAMED_SLUG_LABELS[raw],
  };
}

export async function generateMetadata({
  params,
}: SkyPageProps): Promise<Metadata> {
  const { date: raw } = await params;
  const result = await resolveSegment(raw);
  if (result.kind !== 'iso') {
    return {
      title: 'The sky on that day | Lunary',
      robots: { index: false, follow: false },
    };
  }
  const human = formatLongDate(result.date);
  const title = `The sky on ${human} — what the planets were doing`;
  const description = `See where the Sun, Moon, and planets stood on ${human}. A real astronomical chart of the day, plus a poetic interpretation of what the sky was saying.`;
  const canonical = `${APP_URL}/sky/${raw}`;
  const ogUrl = `${APP_URL}/api/og/day-in-sky?date=${result.date}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Lunary',
      type: 'article',
      images: [
        {
          url: ogUrl,
          width: 1200,
          height: 630,
          alt: `The sky on ${human}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogUrl],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function SkyByDatePage({ params }: SkyPageProps) {
  const { date: raw } = await params;
  const result = await resolveSegment(raw);

  if (result.kind === 'redirect') {
    redirect(result.url);
  }
  if (result.kind === 'notFound') {
    notFound();
  }

  // Range guard: refuse absurd dates (astronomy-engine breaks pre-1800/post-2200).
  const dateObj = new Date(`${result.date}T12:00:00Z`);
  if (Number.isNaN(dateObj.getTime())) notFound();
  const year = dateObj.getUTCFullYear();
  if (year < 1800 || year > 2200) notFound();

  let placements: BirthChartData[] = [];
  try {
    placements = buildPlacements(dateObj);
  } catch {
    // Astronomy-engine threw — surface as 404 rather than a crashed page.
    notFound();
  }

  if (placements.length === 0) notFound();

  return (
    <main className='min-h-screen bg-surface-base text-content-primary'>
      <DaySkyView
        date={result.date}
        placements={placements}
        contextLabel={result.contextLabel}
        fromNamedSlug={Boolean(result.slug)}
      />
    </main>
  );
}

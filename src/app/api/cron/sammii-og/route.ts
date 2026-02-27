import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Sammii sparkle account set on Spellcast (@sammiisparkle)
const SAMMII_SPARKLE_ACCOUNT_SET_ID = '89cf0e70-7bd1-48c2-bd8a-39ce54357d12';
const SAMMII_SPARKLE_IG_ID = '8ae5e498-b683-4c0e-96fc-e3db38aac65b';
const SAMMII_SPARKLE_THREADS_ID = 'beb8c6ad-adff-4f7b-886b-283044680f50';

// Sammii's birth chart — static, doesn't change
const SAMMII = {
  name: 'Sammii',
  sun: 'Capricorn',
  moon: 'Taurus',
  rising: 'Scorpio',
  birthday: '1994-01-20',
  lifePath: 8, // 20+1+1994 → 2+0+1+1+9+9+4 = 26 → 8
  soulUrge: 3,
  expression: 5,
  dominantElement: 'Earth',
  dominantModality: 'Cardinal',
};

// Cadence — one from each tier posted on the right days
const DAILY_TYPES = [
  'horoscope',
  'daily-insight',
  'cosmic-state',
  'sky-now',
] as const;
const WEEKLY_TYPES = ['zodiac-season', 'numerology', 'streak'] as const;
const MONTHLY_TYPES = ['big-three', 'birth-chart'] as const;

const OG_LABELS: Record<string, string> = {
  horoscope: 'Daily Horoscope',
  'daily-insight': 'Daily Insight',
  'cosmic-state': 'Cosmic State',
  'sky-now': 'Sky Now',
  'zodiac-season': 'Zodiac Season',
  numerology: 'Numerology',
  streak: 'Streak',
  'big-three': 'Big Three',
  'birth-chart': 'Birth Chart',
};

async function uploadToSpellcast(
  imageBuffer: Buffer,
  filename: string,
): Promise<string> {
  const spellcastUrl = process.env.SPELLCAST_API_URL;
  const spellcastKey = process.env.SPELLCAST_API_KEY;
  if (!spellcastUrl || !spellcastKey)
    throw new Error('Spellcast env vars not configured');

  const formData = new FormData();
  formData.append(
    'file',
    new Blob([imageBuffer.buffer as ArrayBuffer], { type: 'image/png' }),
    filename,
  );

  const res = await fetch(`${spellcastUrl}/api/media/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${spellcastKey}` },
    body: formData,
  });
  if (!res.ok)
    throw new Error(
      `Spellcast upload failed (${res.status}): ${await res.text().catch(() => '')}`,
    );
  const data = (await res.json()) as { url?: string; path?: string };
  return data.url ?? data.path ?? '';
}

async function generateCaption(prompt: string): Promise<string> {
  const spellcastUrl = process.env.SPELLCAST_API_URL;
  const spellcastKey = process.env.SPELLCAST_API_KEY;
  try {
    const res = await fetch(`${spellcastUrl}/api/ai/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${spellcastKey}`,
      },
      body: JSON.stringify({ action: 'write', prompt }),
    });
    if (!res.ok) return '';
    const data = (await res.json()) as { content?: string; text?: string };
    return (data.content ?? data.text ?? '')
      .trim()
      .replace(/^["'"']|["'"']$/g, '')
      .trim();
  } catch {
    return '';
  }
}

async function createPost(params: {
  content: string;
  mediaUrl: string;
  postType: 'story' | 'post';
  accountId: string;
  scheduledFor: string;
}): Promise<{ id: string }> {
  const spellcastUrl = process.env.SPELLCAST_API_URL;
  const spellcastKey = process.env.SPELLCAST_API_KEY;
  const res = await fetch(`${spellcastUrl}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${spellcastKey}`,
    },
    body: JSON.stringify({
      content: params.content,
      mediaUrls: [params.mediaUrl],
      accountSetId: SAMMII_SPARKLE_ACCOUNT_SET_ID,
      scheduledFor: params.scheduledFor,
      platformSettings: {},
      postType: params.postType,
      selectedAccountIds: [params.accountId],
    }),
  });
  if (!res.ok)
    throw new Error(
      `Create post failed (${res.status}): ${await res.text().catch(() => '')}`,
    );
  return res.json() as Promise<{ id: string }>;
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  // Auth
  const isVercelCron = request.headers.get('x-vercel-cron') === '1';
  const authHeader = request.headers.get('authorization');
  if (
    !isVercelCron &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const spellcastUrl = process.env.SPELLCAST_API_URL;
  const spellcastKey = process.env.SPELLCAST_API_KEY;
  if (!spellcastUrl || !spellcastKey) {
    return NextResponse.json(
      { error: 'Spellcast env vars not configured' },
      { status: 500 },
    );
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getUTCFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  const dayOfWeek = now.getUTCDay(); // 0=Sun 1=Mon
  const dayOfMonth = now.getUTCDate();
  const monthIndex = now.getUTCMonth();

  // Decide what to post today
  const typesToPost: string[] = [];
  typesToPost.push(DAILY_TYPES[dayOfYear % DAILY_TYPES.length]);
  if (dayOfWeek === 1)
    typesToPost.push(
      WEEKLY_TYPES[Math.floor(dayOfYear / 7) % WEEKLY_TYPES.length],
    );
  if (dayOfMonth === 1)
    typesToPost.push(MONTHLY_TYPES[monthIndex % MONTHLY_TYPES.length]);

  // Fetch cosmic data (updated at 6 AM UTC by update-global-cosmic-data cron)
  let moonPhaseName = 'Waning Crescent';
  let zodiacSeason = SAMMII.sun;
  let transitHeadline = 'Celestial energies shift';
  let transitDesc = 'A powerful moment for reflection and growth.';
  const planets: Record<string, { sign: string; retrograde: boolean }> = {
    Sun: { sign: SAMMII.sun, retrograde: false },
    Moon: { sign: SAMMII.moon, retrograde: false },
    Mercury: { sign: 'Aquarius', retrograde: false },
    Venus: { sign: 'Pisces', retrograde: false },
    Mars: { sign: 'Cancer', retrograde: false },
    Jupiter: { sign: 'Gemini', retrograde: false },
    Saturn: { sign: 'Pisces', retrograde: false },
    Uranus: { sign: 'Taurus', retrograde: true },
    Neptune: { sign: 'Pisces', retrograde: false },
    Pluto: { sign: 'Aquarius', retrograde: false },
  };

  try {
    const cosmicRes = await fetch('https://lunary.app/api/cosmic/global');
    if (cosmicRes.ok) {
      const cosmic = (await cosmicRes.json()) as {
        moonPhase?: { name?: string };
        planetaryPositions?: Record<
          string,
          { sign?: string; retrograde?: boolean }
        >;
        generalTransits?: Array<{ name?: string; energy?: string }>;
      };
      if (cosmic.moonPhase?.name) moonPhaseName = cosmic.moonPhase.name;
      if (cosmic.planetaryPositions) {
        for (const [planet, pos] of Object.entries(cosmic.planetaryPositions)) {
          if (pos.sign)
            planets[planet] = {
              sign: pos.sign,
              retrograde: pos.retrograde ?? false,
            };
        }
        if (planets.Sun?.sign) zodiacSeason = planets.Sun.sign;
      }
      if (cosmic.generalTransits?.[0]) {
        const t = cosmic.generalTransits[0];
        transitHeadline = t.name ?? transitHeadline;
        transitDesc = t.energy ?? transitDesc;
      }
    }
  } catch {
    /* use defaults */
  }

  const {
    sun,
    moon,
    rising,
    name,
    lifePath,
    soulUrge,
    expression,
    dominantElement,
    dominantModality,
    birthday,
  } = SAMMII;
  const p = (v: string) => encodeURIComponent(v);
  const baseUrl = 'https://lunary.app';

  // Schedule all posts at noon UTC today
  const scheduledFor = new Date(now);
  scheduledFor.setUTCHours(12, 0, 0, 0);
  const scheduledForStr = scheduledFor.toISOString();

  const results: Record<string, unknown> = {};

  for (const ogType of typesToPost) {
    try {
      // Build OG URL
      let ogPath: string;
      switch (ogType) {
        case 'horoscope': {
          const headline = `${sun} season energy supports your path, ${name}`;
          const overview = `Today's ${moonPhaseName} moon activates your ${sun} Sun. Trust your ${moon} Moon instincts for emotional clarity.`;
          ogPath = `/api/og/share/horoscope?format=story&name=${p(name)}&sunSign=${sun}&headline=${p(headline)}&overview=${p(overview)}&numerologyNumber=${lifePath}&date=${dateStr}`;
          break;
        }
        case 'daily-insight':
          ogPath = `/api/og/daily-insight?format=story&name=${p(name)}&personalized=true&insight=${p(`Today brings ${dominantElement.toLowerCase()} energy for ${sun}. Lean into your ${moon} Moon for emotional guidance.`)}`;
          break;
        case 'cosmic-state': {
          const cosmicInsight = `Today's cosmic energies align with ${zodiacSeason} season under a ${moonPhaseName} moon.`;
          ogPath = `/api/og/share/cosmic-state?format=story&name=${p(name)}&moonPhase=${p(moonPhaseName)}&zodiacSeason=${zodiacSeason}&insight=${p(cosmicInsight)}&transitHeadline=${p(transitHeadline)}&transitDesc=${p(transitDesc)}`;
          break;
        }
        case 'sky-now':
          ogPath = `/api/og/share/sky-now?format=story&name=${p(name)}&positions=${p(JSON.stringify(planets))}&date=${dateStr}`;
          break;
        case 'zodiac-season': {
          const zodiacEl = ['Aries', 'Leo', 'Sagittarius'].includes(
            zodiacSeason,
          )
            ? 'Fire'
            : ['Taurus', 'Virgo', 'Capricorn'].includes(zodiacSeason)
              ? 'Earth'
              : ['Gemini', 'Libra', 'Aquarius'].includes(zodiacSeason)
                ? 'Air'
                : 'Water';
          const zodiacMod = ['Aries', 'Cancer', 'Libra', 'Capricorn'].includes(
            zodiacSeason,
          )
            ? 'Cardinal'
            : ['Taurus', 'Leo', 'Scorpio', 'Aquarius'].includes(zodiacSeason)
              ? 'Fixed'
              : 'Mutable';
          ogPath = `/api/og/share/zodiac-season?format=story&name=${p(name)}&sign=${zodiacSeason}&element=${zodiacEl}&modality=${zodiacMod}&themes=${p('Intuition,Depth,Transformation')}`;
          break;
        }
        case 'numerology':
          ogPath = `/api/og/share/numerology?format=story&name=${p(name)}&birthDate=${birthday}&lifePath=${lifePath}&soulUrge=${soulUrge}&expression=${expression}&lifePathMeaning=${p('The Seeker — wisdom and introspection')}&soulUrgeMeaning=${p('The Creative — self-expression and joy')}&expressionMeaning=${p('The Explorer — freedom and change')}`;
          break;
        case 'streak':
          ogPath = `/api/og/share/streak?format=story&streakDays=30&totalReadings=142&totalEntries=67&totalRituals=30&userName=${p(name)}`;
          break;
        case 'big-three':
          ogPath = `/api/og/share/big-three?format=story&name=${p(name)}&sun=${sun}&moon=${moon}&rising=${rising}`;
          break;
        case 'birth-chart': {
          const insight = `${dominantElement} energy dominates with ${dominantModality} expression. Sun in ${sun}, Moon in ${moon}, ${rising} rising.`;
          ogPath = `/api/og/share/birth-chart?format=story&name=${p(name)}&sun=${sun}&moon=${moon}&rising=${rising}&element=${dominantElement}&modality=${dominantModality}&insight=${p(insight)}`;
          break;
        }
        default:
          results[ogType] = { error: `Unknown type: ${ogType}` };
          continue;
      }

      // Fetch OG image
      const imageRes = await fetch(`${baseUrl}${ogPath}`);
      if (!imageRes.ok)
        throw new Error(
          `OG fetch failed (${imageRes.status}): ${baseUrl}${ogPath}`,
        );
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

      // Upload to Spellcast
      const mediaUrl = await uploadToSpellcast(
        imageBuffer,
        `sammii-${ogType}-${dateStr}.png`,
      );

      // Generate Threads caption
      const label = OG_LABELS[ogType] ?? ogType;
      const threadsCaption =
        (await generateCaption(
          `Write a 1-3 line Threads caption for Sammii sharing her personal ${label} from Lunary (${dateStr}). ` +
            `Sun in ${sun}, Moon in ${moon}, ${rising} rising. Punchy, personal, under 200 chars. No hashtags. Sentence case, UK English.`,
        )) || `${label} for ${dateStr}`;

      // Create Instagram Story (no text — image is the content)
      const igPost = await createPost({
        content: '',
        mediaUrl,
        postType: 'story',
        accountId: SAMMII_SPARKLE_IG_ID,
        scheduledFor: scheduledForStr,
      });

      // Create Threads post
      const threadsPost = await createPost({
        content: threadsCaption,
        mediaUrl,
        postType: 'post',
        accountId: SAMMII_SPARKLE_THREADS_ID,
        scheduledFor: scheduledForStr,
      });

      results[ogType] = {
        ig_story_id: igPost.id,
        threads_post_id: threadsPost.id,
        threads_caption: threadsCaption,
        media_url: mediaUrl,
      };
    } catch (err) {
      results[ogType] = {
        error: err instanceof Error ? err.message : 'Unknown error',
      };
    }
  }

  return NextResponse.json({
    success: true,
    date: dateStr,
    types_posted: typesToPost,
    results,
    duration_ms: Date.now() - startTime,
  });
}

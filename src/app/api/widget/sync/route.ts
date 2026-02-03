import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sql } from '@vercel/postgres';
import { calculatePersonalYear, reduceToDigit } from '@/lib/numerology';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import { decrypt } from '@/lib/encryption';
import { normalizeIsoDateOnly } from '@/lib/date-only';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get current cosmic data (available to all)
    const cosmicData = await getGlobalCosmicData();

    if (!cosmicData) {
      return NextResponse.json(
        { error: 'Cosmic data unavailable' },
        { status: 503 },
      );
    }

    // Try to get user-specific data
    const headersList = await headers();
    const session = await auth.api.getSession({ headers: headersList });
    let personalData = null;
    let horoscopeData = null;
    let todayCard = null;

    if (session?.user?.id) {
      // Get user profile for birthday and name (both are encrypted)
      const userProfile = await prisma.user_profiles.findUnique({
        where: { user_id: session.user.id },
        select: { birthday: true, name: true },
      });

      // Decrypt sensitive fields (same as /api/profile)
      const decryptedName = userProfile?.name
        ? decrypt(userProfile.name)
        : null;
      const decryptedBirthday = userProfile?.birthday
        ? normalizeIsoDateOnly(decrypt(userProfile.birthday))
        : null;

      if (decryptedBirthday) {
        // Calculate personal day number using decrypted birthday
        const today = new Date();
        const personalYear = calculatePersonalYear(
          decryptedBirthday,
          today.getFullYear(),
        );
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();

        const daySum =
          personalYear.result +
          reduceToDigit(currentMonth, false) +
          reduceToDigit(currentDay, false);
        const dayNumber = reduceToDigit(daySum, false);
        const dayTheme = getPersonalDayTheme(dayNumber);

        personalData = {
          personalDayNumber: dayNumber,
          dayTheme: dayTheme,
        };

        // Try to get today's horoscope directly from database
        try {
          // Use raw SQL like horoscope/daily/route.ts does (known working)
          const today = new Date();
          const dateStr = today.toISOString().split('T')[0];

          const result = await sql`
            SELECT horoscope_data
            FROM daily_horoscopes
            WHERE user_id = ${session.user.id} AND horoscope_date = ${dateStr}
            LIMIT 1
          `;

          if (result.rows.length > 0 && result.rows[0].horoscope_data) {
            const horoscope = result.rows[0].horoscope_data as {
              headline?: string;
              overview?: string;
              dailyGuidance?: string;
            };
            horoscopeData = {
              headline: horoscope.headline || 'Your cosmic guidance awaits',
              guidance: horoscope.overview || horoscope.dailyGuidance || '',
            };
          } else {
            // Generate a simple fallback based on moon phase and day number
            const moonPhase = cosmicData.moonPhase.name.toLowerCase();
            const dayNum = personalData?.personalDayNumber || 1;
            horoscopeData = {
              headline: getSimpleHeadline(moonPhase, dayNum),
              guidance: getSimpleGuidance(moonPhase, dayNum),
            };
          }
        } catch (e) {
          // Horoscope fetch failed, use fallback
          console.error('[Widget API] Horoscope fetch error:', e);
          const moonPhase = cosmicData.moonPhase.name.toLowerCase();
          const dayNum = personalData?.personalDayNumber || 1;
          horoscopeData = {
            headline: getSimpleHeadline(moonPhase, dayNum),
            guidance: getSimpleGuidance(moonPhase, dayNum),
          };
        }
      } else {
        // No birthday - generate generic horoscope based on moon phase
        const moonPhase = cosmicData.moonPhase.name.toLowerCase();
        horoscopeData = {
          headline: getSimpleHeadline(moonPhase, 1),
          guidance: getSimpleGuidance(moonPhase, 1),
        };
      }

      // Get today's tarot card from DB, or generate and save if missing
      const today = dayjs();
      const dateStr = today.format('YYYY-MM-DD');
      const todayStart = new Date(dateStr);

      let cardReading = await prisma.tarot_readings.findFirst({
        where: {
          user_id: session.user.id,
          spread_slug: 'daily-tarot',
          created_at: { gte: todayStart },
        },
        select: { cards: true },
        orderBy: { created_at: 'desc' },
      });

      // If no card for today, generate and save using same logic as DailyCardPreview
      if (!cardReading) {
        // Use decrypted values (same as PWA's UserContext)
        const userName = decryptedName;
        const userBirthday = decryptedBirthday;

        let card;
        let isPersonalized = false;

        if (userName && userBirthday) {
          // Personalized card - matches DailyCardPreview.tsx line 71
          card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
          isPersonalized = true;
        } else {
          // General card - matches DailyCardPreview.tsx line 65-67
          const dayOfYearNum = today.dayOfYear();
          const generalSeed = `cosmic-${dateStr}-${dayOfYearNum}-energy`;
          card = getTarotCard(generalSeed);
        }

        if (card) {
          // Save to DB
          await prisma.tarot_readings.create({
            data: {
              user_id: session.user.id,
              spread_slug: 'daily-tarot',
              spread_name: 'Daily Tarot',
              cards: [
                {
                  card: {
                    name: card.name,
                    suit: card.suit,
                    arcana: card.arcana,
                    keywords: card.keywords,
                    information: card.information,
                  },
                  isPersonalized,
                  generatedAt: new Date().toISOString(),
                },
              ],
              created_at: todayStart,
            },
          });

          todayCard = {
            name: card.name,
            briefMeaning:
              card.keywords?.slice(0, 3).join(', ') || 'Guidance awaits',
          };
        }
      } else if (cardReading.cards) {
        const cardsArray = cardReading.cards as Array<{
          card: { name: string; keywords?: string[]; information?: string };
        }>;
        const firstCard = cardsArray?.[0]?.card;
        if (firstCard) {
          todayCard = {
            name: firstCard.name,
            briefMeaning:
              firstCard.keywords?.slice(0, 3).join(', ') || 'Guidance awaits',
          };
        }
      }
    }

    // Build widget data response
    const widgetData = {
      moon: {
        phase: cosmicData.moonPhase.name,
        sign: getMoonSign(cosmicData),
        illumination: cosmicData.moonPhase.illumination,
        nextPhase: getNextPhase(cosmicData.moonPhase.name),
        nextPhaseIn: null,
      },
      todayCard: todayCard,
      personalDayNumber: personalData?.personalDayNumber || 1,
      dayTheme: personalData?.dayTheme || 'New Beginnings',
      currentTransit: getTopTransit(cosmicData),
      planets: formatPlanets(cosmicData.planetaryPositions),
      horoscope: horoscopeData || {
        headline: getSimpleHeadline(cosmicData.moonPhase.name.toLowerCase(), 1),
        guidance: getSimpleGuidance(cosmicData.moonPhase.name.toLowerCase(), 1),
      },
    };

    return NextResponse.json(widgetData);
  } catch (error) {
    console.error('[Widget API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch widget data' },
      { status: 500 },
    );
  }
}

function getMoonSign(
  cosmicData: NonNullable<Awaited<ReturnType<typeof getGlobalCosmicData>>>,
): string {
  const moonPosition = cosmicData.planetaryPositions['Moon'];
  return moonPosition?.sign || 'Unknown';
}

function getNextPhase(currentPhase: string): string {
  const phases = [
    'New Moon',
    'Waxing Crescent',
    'First Quarter',
    'Waxing Gibbous',
    'Full Moon',
    'Waning Gibbous',
    'Last Quarter',
    'Waning Crescent',
  ];

  const currentIndex = phases.findIndex(
    (p) => p.toLowerCase() === currentPhase.toLowerCase(),
  );

  if (currentIndex === -1) return 'Full Moon';

  const nextIndex = (currentIndex + 1) % phases.length;
  return phases[nextIndex];
}

function getTopTransit(
  cosmicData: NonNullable<Awaited<ReturnType<typeof getGlobalCosmicData>>>,
): {
  planet: string;
  aspect: string;
  natalPoint: string;
  briefMeaning: string;
} | null {
  const transits = cosmicData.generalTransits;
  if (!transits || transits.length === 0) return null;

  // Prefer actual planetary aspects (conjunction, trine, etc.) over ingress/retrograde
  const planetaryAspects = [
    'conjunction',
    'opposition',
    'trine',
    'square',
    'sextile',
  ];
  const sortedTransits = [...transits].sort((a, b) => {
    const aIsPlanetary = planetaryAspects.includes(a.aspect?.toLowerCase());
    const bIsPlanetary = planetaryAspects.includes(b.aspect?.toLowerCase());
    if (aIsPlanetary && !bIsPlanetary) return -1;
    if (!aIsPlanetary && bIsPlanetary) return 1;
    return (b.priority || 0) - (a.priority || 0);
  });

  const topTransit = sortedTransits[0];
  if (!topTransit) return null;

  const aspect = topTransit.aspect || 'conjunction';

  // planetA/planetB can be strings OR objects depending on transit type
  // Aspects: strings like "Sun", "Venus"
  // Ingress/Retrograde: objects like { name: "Mercury", constellation: "Aquarius" }
  const getPlanetName = (planet: unknown): string => {
    if (typeof planet === 'string') return planet;
    if (planet && typeof planet === 'object' && 'name' in planet) {
      return (planet as { name: string }).name;
    }
    return 'Moon';
  };

  const planetA = getPlanetName(topTransit.planetA);

  // For planetary aspects, show planet B
  // For other events (retrograde, ingress), show appropriate text
  let natalPoint: string;
  if (topTransit.planetB) {
    natalPoint = getPlanetName(topTransit.planetB);
  } else if (aspect === 'retrograde') {
    natalPoint = 'Rx';
  } else if (aspect === 'ingress') {
    const constellation =
      typeof topTransit.planetA === 'object'
        ? (topTransit.planetA as { constellation?: string }).constellation
        : null;
    natalPoint = constellation || 'sign';
  } else {
    natalPoint = '';
  }

  return {
    planet: planetA,
    aspect: aspect,
    natalPoint: natalPoint,
    briefMeaning: topTransit.energy || 'Cosmic energy flows',
  };
}

function formatPlanets(
  positions: NonNullable<
    Awaited<ReturnType<typeof getGlobalCosmicData>>
  >['planetaryPositions'],
): Array<{
  planet: string;
  sign: string;
  degree: number;
  retrograde: boolean;
}> {
  const planetOrder = [
    'Sun',
    'Moon',
    'Mercury',
    'Venus',
    'Mars',
    'Jupiter',
    'Saturn',
    'Uranus',
    'Neptune',
    'Pluto',
  ];

  return planetOrder
    .filter((planet) => positions[planet])
    .map((planet) => ({
      planet,
      sign: positions[planet].sign,
      degree: Math.floor(positions[planet].degree || 0),
      retrograde: positions[planet].retrograde || false,
    }));
}

function extractBriefMeaning(interpretation: string | null): string {
  if (!interpretation) return 'Guidance awaits';

  const firstSentence = interpretation.split(/[.!?]/)[0];
  if (firstSentence.length <= 50) return firstSentence;

  return firstSentence.slice(0, 47) + '...';
}

function getPersonalDayTheme(dayNumber: number): string {
  const themes: Record<number, string> = {
    1: 'New Beginnings',
    2: 'Partnership',
    3: 'Expression',
    4: 'Foundation',
    5: 'Change',
    6: 'Harmony',
    7: 'Reflection',
    8: 'Abundance',
    9: 'Completion',
  };
  return themes[dayNumber] || 'Discovery';
}

function getSimpleHeadline(moonPhase: string, dayNumber: number): string {
  const moonHeadlines: Record<string, string[]> = {
    'new moon': [
      'Fresh Starts Await',
      'Set Your Intentions',
      'Plant New Seeds',
    ],
    'waxing crescent': [
      'Building Momentum',
      'Trust the Process',
      'Small Steps Forward',
    ],
    'first quarter': [
      'Take Bold Action',
      'Overcome Challenges',
      'Push Through',
    ],
    'waxing gibbous': ['Refine Your Path', 'Stay Focused', 'Almost There'],
    'full moon': [
      'Embrace Illumination',
      'Celebrate Progress',
      'Release What No Longer Serves',
    ],
    'waning gibbous': ['Share Your Wisdom', 'Practice Gratitude', 'Give Back'],
    'last quarter': ['Let Go Gracefully', 'Forgive and Release', 'Make Space'],
    'waning crescent': [
      'Rest and Reflect',
      'Honor Your Journey',
      'Prepare for Renewal',
    ],
  };

  const dayHeadlines: Record<number, string[]> = {
    1: ['Lead with Confidence', 'Your Day to Shine'],
    2: ['Seek Balance', 'Connect Deeply'],
    3: ['Express Yourself', 'Create Freely'],
    4: ['Build Strong Foundations', 'Stay Grounded'],
    5: ['Embrace Adventure', 'Welcome Change'],
    6: ['Nurture Relationships', 'Spread Love'],
    7: ['Trust Your Intuition', 'Seek Inner Wisdom'],
    8: ['Manifest Abundance', 'Step Into Power'],
    9: ['Complete What You Started', 'Let Go with Grace'],
  };

  // Combine moon phase and day number for variety
  const moonOptions = moonHeadlines[moonPhase] || moonHeadlines['full moon'];
  const dayOptions = dayHeadlines[dayNumber] || dayHeadlines[1];

  // Use day number to pick which headline style to use
  const useMoon = dayNumber % 2 === 0;
  const options = useMoon ? moonOptions : dayOptions;
  const index = (dayNumber - 1) % options.length;

  return options[index];
}

function getSimpleGuidance(moonPhase: string, dayNumber: number): string {
  const moonGuidance: Record<string, string> = {
    'new moon':
      'The dark sky invites you to dream. What seeds will you plant today?',
    'waxing crescent':
      'Your intentions are taking root. Nurture them with patience and care.',
    'first quarter':
      'Challenges are opportunities in disguise. Take decisive action.',
    'waxing gibbous':
      'Fine-tune your approach. Small adjustments lead to big results.',
    'full moon':
      "The cosmos illuminates your path. Celebrate how far you've come.",
    'waning gibbous':
      'Share your gifts with others. Gratitude multiplies blessings.',
    'last quarter': 'Release what weighs you down. Forgiveness sets you free.',
    'waning crescent':
      'Rest is productive too. Honor your need for quiet reflection.',
  };

  const dayGuidance: Record<number, string> = {
    1: 'Today favors independence and new initiatives. Trust your vision.',
    2: 'Partnerships and cooperation bring success. Listen as much as you speak.',
    3: 'Creative expression flows naturally. Share your unique perspective.',
    4: 'Focus on practical matters. Steady effort builds lasting results.',
    5: 'Adventure calls to you. Embrace unexpected opportunities.',
    6: 'Love and harmony surround you. Nurture your closest bonds.',
    7: 'Your intuition is heightened. Take time for meditation and reflection.',
    8: 'Material and spiritual abundance align. Step confidently toward your goals.',
    9: 'Completion and wisdom mark this day. Tie up loose ends with grace.',
  };

  const moon = moonGuidance[moonPhase] || moonGuidance['full moon'];
  const day = dayGuidance[dayNumber] || dayGuidance[1];

  // Alternate based on day number
  return dayNumber % 2 === 0 ? moon : day;
}

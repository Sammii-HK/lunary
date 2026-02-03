import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
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
          const todayStr = dayjs().format('YYYY-MM-DD');
          const cachedHoroscope = await prisma.daily_horoscopes.findFirst({
            where: {
              user_id: session.user.id,
              horoscope_date: todayStr,
            },
            select: { horoscope_data: true },
          });

          if (cachedHoroscope?.horoscope_data) {
            const horoscope = cachedHoroscope.horoscope_data as {
              headline?: string;
              overview?: string;
              dailyGuidance?: string;
            };
            horoscopeData = {
              headline: horoscope.headline || 'Your cosmic guidance awaits',
              guidance: horoscope.overview || horoscope.dailyGuidance || '',
            };
          }
        } catch {
          // Horoscope fetch failed, use fallback
        }
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
        headline: 'Open Lunary for insights',
        guidance: 'Tap to see your personalized cosmic guidance',
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

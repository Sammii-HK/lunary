import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import dayjs from 'dayjs';
import { requireUser } from '@/lib/ai/auth';
import { hasFeatureAccess } from '../../../../../../utils/pricing';
import { getRealPlanetaryPositions } from '../../../../../../utils/astrology/astronomical-data';
import type { BirthChartData } from '../../../../../../utils/astrology/birthChart';

type TimingWindow = {
  date: string;
  dateFormatted: string;
  quality: 'great' | 'good' | 'neutral';
  reason: string;
  transitingPlanet: string;
  aspectType: string;
  affectedPlanets: string[];
};

type CosmicEvent = {
  date: string;
  dateFormatted: string;
  event: string;
  impact: string;
  type: 'lunar_phase' | 'planet_transit' | 'retrograde';
};

const ASPECT_DEFINITIONS = [
  { name: 'conjunction', angle: 0, orb: 8, isHarmonious: true },
  { name: 'trine', angle: 120, orb: 8, isHarmonious: true },
  { name: 'sextile', angle: 60, orb: 6, isHarmonious: true },
  { name: 'opposition', angle: 180, orb: 8, isHarmonious: false },
  { name: 'square', angle: 90, orb: 6, isHarmonious: false },
];

const RELATIONSHIP_PLANETS = ['Sun', 'Moon', 'Venus', 'Mars', 'Mercury'];

const PLANET_ENERGY: Record<string, string> = {
  Sun: 'vitality and authentic expression',
  Moon: 'emotional connection',
  Mercury: 'communication',
  Venus: 'love and harmony',
  Mars: 'passion and action',
  Jupiter: 'expansion and growth',
  Saturn: 'commitment and structure',
};

/**
 * Calculate aspect between two planetary positions
 */
function findAspect(
  transitLongitude: number,
  natalLongitude: number,
): { aspectType: string; isHarmonious: boolean; orb: number } | null {
  for (const aspect of ASPECT_DEFINITIONS) {
    let diff = Math.abs(transitLongitude - natalLongitude);
    if (diff > 180) diff = 360 - diff;

    const orbDiff = Math.abs(diff - aspect.angle);
    if (orbDiff <= aspect.orb) {
      return {
        aspectType: aspect.name,
        isHarmonious: aspect.isHarmonious,
        orb: orbDiff,
      };
    }
  }
  return null;
}

/**
 * Get upcoming timing windows for relationship connection
 */
function calculateRelationshipTiming(
  userBirthChart: BirthChartData[],
  friendBirthChart: BirthChartData[],
  days: number = 30,
): TimingWindow[] {
  const timingWindows: TimingWindow[] = [];
  const today = dayjs();

  // Get relevant natal positions for both people
  const userVenus = userBirthChart.find((p) => p.body === 'Venus');
  const userMoon = userBirthChart.find((p) => p.body === 'Moon');
  const userSun = userBirthChart.find((p) => p.body === 'Sun');
  const userMercury = userBirthChart.find((p) => p.body === 'Mercury');

  const friendVenus = friendBirthChart.find((p) => p.body === 'Venus');
  const friendMoon = friendBirthChart.find((p) => p.body === 'Moon');
  const friendSun = friendBirthChart.find((p) => p.body === 'Sun');
  const friendMercury = friendBirthChart.find((p) => p.body === 'Mercury');

  // Check transits for each day
  for (let i = 0; i < days; i++) {
    const date = today.add(i, 'day');
    const positions = getRealPlanetaryPositions(date.toDate());

    // Check Venus transits (most important for relationships)
    const transitVenus = positions['Venus'];
    if (transitVenus && userVenus && friendVenus) {
      // Check if transiting Venus aspects both people's Venus
      const userAspect = findAspect(
        transitVenus.longitude,
        userVenus.eclipticLongitude,
      );
      const friendAspect = findAspect(
        transitVenus.longitude,
        friendVenus.eclipticLongitude,
      );

      if (userAspect?.isHarmonious && friendAspect?.isHarmonious) {
        timingWindows.push({
          date: date.format('YYYY-MM-DD'),
          dateFormatted: date.format('MMM D'),
          quality: 'great',
          reason: `Venus harmonizes with both your Venuses - perfect for deepening connection`,
          transitingPlanet: 'Venus',
          aspectType: `${userAspect.aspectType}/${friendAspect.aspectType}`,
          affectedPlanets: ['Venus', 'Venus'],
        });
        continue; // Skip to next day after finding a great window
      }

      // Check Venus to Moon (emotional connection)
      if (userMoon && friendMoon) {
        const userMoonAspect = findAspect(
          transitVenus.longitude,
          userMoon.eclipticLongitude,
        );
        const friendMoonAspect = findAspect(
          transitVenus.longitude,
          friendMoon.eclipticLongitude,
        );

        if (userMoonAspect?.isHarmonious && friendMoonAspect?.isHarmonious) {
          timingWindows.push({
            date: date.format('YYYY-MM-DD'),
            dateFormatted: date.format('MMM D'),
            quality: 'great',
            reason: `Venus touches both your Moons - ideal for emotional sharing`,
            transitingPlanet: 'Venus',
            aspectType: `${userMoonAspect.aspectType}/${friendMoonAspect.aspectType}`,
            affectedPlanets: ['Moon', 'Moon'],
          });
          continue;
        }
      }
    }

    // Check Mercury transits (for communication)
    const transitMercury = positions['Mercury'];
    if (transitMercury && userMercury && friendMercury) {
      const userAspect = findAspect(
        transitMercury.longitude,
        userMercury.eclipticLongitude,
      );
      const friendAspect = findAspect(
        transitMercury.longitude,
        friendMercury.eclipticLongitude,
      );

      if (userAspect?.isHarmonious && friendAspect?.isHarmonious) {
        timingWindows.push({
          date: date.format('YYYY-MM-DD'),
          dateFormatted: date.format('MMM D'),
          quality: 'good',
          reason: `Mercury trine creates easy communication between you`,
          transitingPlanet: 'Mercury',
          aspectType: `${userAspect.aspectType}/${friendAspect.aspectType}`,
          affectedPlanets: ['Mercury', 'Mercury'],
        });
        continue;
      }
    }

    // Check Moon transits (daily emotional weather)
    const transitMoon = positions['Moon'];
    if (transitMoon && userVenus && friendVenus) {
      const userAspect = findAspect(
        transitMoon.longitude,
        userVenus.eclipticLongitude,
      );
      const friendAspect = findAspect(
        transitMoon.longitude,
        friendVenus.eclipticLongitude,
      );

      if (userAspect?.isHarmonious && friendAspect?.isHarmonious) {
        timingWindows.push({
          date: date.format('YYYY-MM-DD'),
          dateFormatted: date.format('MMM D'),
          quality: 'good',
          reason: `Moon touches both your Venuses - emotionally supportive day`,
          transitingPlanet: 'Moon',
          aspectType: `${userAspect.aspectType}/${friendAspect.aspectType}`,
          affectedPlanets: ['Venus', 'Venus'],
        });
      }
    }
  }

  // Sort by quality and date, return top windows
  return timingWindows
    .sort((a, b) => {
      if (a.quality === 'great' && b.quality !== 'great') return -1;
      if (b.quality === 'great' && a.quality !== 'great') return 1;
      return dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
    })
    .slice(0, 10);
}

/**
 * Get shared cosmic events affecting both charts
 */
function getSharedCosmicEvents(
  userBirthChart: BirthChartData[],
  friendBirthChart: BirthChartData[],
  days: number = 30,
): CosmicEvent[] {
  const events: CosmicEvent[] = [];
  const today = dayjs();

  // Simplified lunar phase calculation
  const lunarMonth = 29.53;
  const knownNewMoon = dayjs('2024-01-11');

  for (let i = 0; i < days; i++) {
    const date = today.add(i, 'day');
    const daysSinceNew = date.diff(knownNewMoon, 'day');
    const phase = (daysSinceNew % lunarMonth) / lunarMonth;

    // Check for significant lunar phases
    if (Math.abs(phase - 0) < 0.02 || Math.abs(phase - 1) < 0.02) {
      // Get sign of new moon from positions
      const positions = getRealPlanetaryPositions(date.toDate());
      const moonSign = positions['Moon']?.sign || 'a new sign';

      // Find house placements for both users
      const userAscendant = userBirthChart.find((p) => p.body === 'Ascendant');
      const friendAscendant = friendBirthChart.find(
        (p) => p.body === 'Ascendant',
      );

      let impact = `A powerful time for setting shared intentions`;
      if (userAscendant && friendAscendant) {
        const userHouse =
          (Math.floor(positions['Moon']?.longitude / 30) -
            Math.floor(userAscendant.eclipticLongitude / 30) +
            12) %
          12;
        const friendHouse =
          (Math.floor(positions['Moon']?.longitude / 30) -
            Math.floor(friendAscendant.eclipticLongitude / 30) +
            12) %
          12;
        impact = `Activates your ${userHouse + 1}th and their ${friendHouse + 1}th houses - great for new beginnings together`;
      }

      events.push({
        date: date.format('YYYY-MM-DD'),
        dateFormatted: date.format('MMM D'),
        event: `New Moon in ${moonSign}`,
        impact,
        type: 'lunar_phase',
      });
    } else if (Math.abs(phase - 0.5) < 0.02) {
      const positions = getRealPlanetaryPositions(date.toDate());
      const moonSign = positions['Moon']?.sign || 'a sign';

      events.push({
        date: date.format('YYYY-MM-DD'),
        dateFormatted: date.format('MMM D'),
        event: `Full Moon in ${moonSign}`,
        impact: `Illuminates emotions and brings clarity to your connection`,
        type: 'lunar_phase',
      });
    }
  }

  return events.slice(0, 5);
}

/**
 * GET /api/friends/[id]/timing
 * Get relationship timing and cosmic events
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request);
    const { id } = await params;

    // Check subscription access
    const subscriptionResult = await sql`
      SELECT status FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const subscriptionStatus = subscriptionResult.rows[0]?.status || 'free';

    if (
      !hasFeatureAccess(subscriptionStatus, user.plan, 'friend_connections')
    ) {
      return NextResponse.json(
        {
          error: 'Relationship timing requires a Lunary+ subscription',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    // Get friend connection
    const connectionResult = await sql`
      SELECT friend_id FROM friend_connections
      WHERE id = ${id}::uuid AND user_id = ${user.id}
    `;

    if (connectionResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Friend connection not found' },
        { status: 404 },
      );
    }

    const friendId = connectionResult.rows[0].friend_id;

    // Get both birth charts
    const [userProfileResult, friendProfileResult] = await Promise.all([
      sql`SELECT birth_chart FROM user_profiles WHERE user_id = ${user.id}`,
      sql`SELECT birth_chart FROM user_profiles WHERE user_id = ${friendId}`,
    ]);

    const userBirthChart = userProfileResult.rows[0]?.birth_chart as
      | BirthChartData[]
      | null;
    const friendBirthChart = friendProfileResult.rows[0]?.birth_chart as
      | BirthChartData[]
      | null;

    if (!userBirthChart || !friendBirthChart) {
      return NextResponse.json({
        timingWindows: [],
        sharedEvents: [],
        message:
          'Both you and your friend need complete birth charts for timing analysis',
      });
    }

    // Calculate timing windows and shared events
    const timingWindows = calculateRelationshipTiming(
      userBirthChart,
      friendBirthChart,
    );
    const sharedEvents = getSharedCosmicEvents(
      userBirthChart,
      friendBirthChart,
    );

    return NextResponse.json({
      timingWindows,
      sharedEvents,
    });
  } catch (error) {
    console.error('[Friends] Error calculating relationship timing:', error);
    return NextResponse.json(
      { error: 'Failed to calculate relationship timing' },
      { status: 500 },
    );
  }
}

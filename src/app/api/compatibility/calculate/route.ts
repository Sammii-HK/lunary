import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { kvGet } from '@/lib/cloudflare/kv';
import { calculateSynastry } from '@/lib/astrology/synastry';
import { getRealPlanetaryPositions } from '@utils/astrology/astronomical-data';
import type { CompatInviteData } from '@/app/api/compatibility/invite/route';

/**
 * POST /api/compatibility/calculate
 * Auth required. Calculate synastry between inviter and the signed-up user.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Sign up to see your compatibility results' },
        { status: 401 },
      );
    }

    let payload: {
      inviteCode: string;
      birthDate: string;
      birthTime?: string;
      birthLocation?: { lat: number; lon: number; name: string };
    };

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const { inviteCode, birthDate, birthTime, birthLocation } = payload;

    if (!inviteCode || !birthDate) {
      return NextResponse.json(
        { error: 'Missing invite code or birth date' },
        { status: 400 },
      );
    }

    // Fetch invite data
    const raw = await kvGet(`compat-invite:${inviteCode}`);
    if (!raw) {
      return NextResponse.json(
        { error: 'Invite not found or expired' },
        { status: 404 },
      );
    }

    const inviteData = JSON.parse(raw) as CompatInviteData;

    // Calculate Person B's planetary positions from their birth data
    const birthDateTime = birthTime
      ? new Date(`${birthDate}T${birthTime}`)
      : new Date(birthDate);

    let personBChart: Record<string, { longitude: number }>;
    try {
      const positions = getRealPlanetaryPositions(birthDateTime);
      personBChart = {} as Record<string, { longitude: number }>;
      for (const [planet, data] of Object.entries(positions)) {
        personBChart[planet] = {
          longitude:
            typeof data === 'object' && data !== null && 'longitude' in data
              ? (data as { longitude: number }).longitude
              : 0,
        };
      }
    } catch {
      return NextResponse.json(
        { error: 'Failed to calculate chart positions' },
        { status: 500 },
      );
    }

    // Get Person A's chart from invite data
    const personAChart = inviteData.inviterChart;
    if (!personAChart) {
      return NextResponse.json(
        { error: 'Inviter chart data not available' },
        { status: 400 },
      );
    }

    // Calculate synastry
    const result = calculateSynastry(personAChart, personBChart);

    return NextResponse.json({
      score: result.score,
      aspects: result.aspects?.slice(0, 10) || [],
      elementBalance: result.elementBalance,
      modalityBalance: result.modalityBalance,
      summary: result.summary,
      inviterName: inviteData.inviterName,
      inviterSign: inviteData.inviterSign,
    });
  } catch (error) {
    console.error('[Compatibility/calculate] POST failed:', error);
    return NextResponse.json(
      { error: 'Failed to calculate compatibility' },
      { status: 500 },
    );
  }
}

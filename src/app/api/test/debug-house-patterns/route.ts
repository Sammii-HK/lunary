import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/astronomical-data';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface HouseDiagnostics {
  totalEntries: number;
  birthChartFound: boolean;
  ascendantFound: boolean;
  ascendantSignNumber?: string;
  ascendantDegree?: number;
  successfulProcessing: number;
  failedProcessing: number;
  totalKeywordMatches: number;
  houseActivations: Record<number, number>;
  sampleMatches: Array<{ house: number; keyword: string; text: string }>;
  sampleEntries: Array<{ text: string; length: number }>;
  errors: string[];
}

export async function GET() {
  try {
    const testUserId = 'test-pattern-user-001';
    const daysBack = 30;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Fetch journal entries
    const result = await sql`
      SELECT
        id,
        content,
        created_at
      FROM collections
      WHERE user_id = ${testUserId}
      AND category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
      ORDER BY created_at DESC
    `;

    const entries = result.rows.map((row) => ({
      id: row.id,
      text:
        typeof row.content === 'string'
          ? JSON.parse(row.content).text
          : row.content.text,
      createdAt: row.created_at,
    }));

    const diagnostics: HouseDiagnostics = {
      totalEntries: entries.length,
      birthChartFound: false,
      ascendantFound: false,
      successfulProcessing: 0,
      failedProcessing: 0,
      totalKeywordMatches: 0,
      houseActivations: {},
      sampleMatches: [],
      sampleEntries: entries
        .slice(0, 3)
        .map((e) => ({ text: e.text, length: e.text.length })),
      errors: [],
    };

    // Get birth chart
    let birthChart: BirthChartData[] = [];
    try {
      const birthChartResult = await sql`
        SELECT birth_chart FROM user_profiles WHERE user_id = ${testUserId} LIMIT 1
      `;
      if (birthChartResult.rows.length > 0) {
        birthChart = birthChartResult.rows[0].birth_chart as BirthChartData[];
        diagnostics.birthChartFound = true;
      }
    } catch (error) {
      diagnostics.errors.push(
        `Birth chart fetch error: ${error instanceof Error ? error.message : String(error)}`,
      );
      return NextResponse.json({ success: true, testUserId, diagnostics });
    }

    if (birthChart.length === 0) {
      diagnostics.errors.push('No birth chart found');
      return NextResponse.json({ success: true, testUserId, diagnostics });
    }

    // Get ascendant
    const ascendant = birthChart.find((p) => p.body === 'Ascendant');
    if (!ascendant || !ascendant.eclipticLongitude) {
      diagnostics.errors.push('No Ascendant found in birth chart');
      return NextResponse.json({ success: true, testUserId, diagnostics });
    }

    diagnostics.ascendantFound = true;
    diagnostics.ascendantSignNumber = ascendant.sign;
    diagnostics.ascendantDegree = ascendant.eclipticLongitude;

    const ascendantSignNumberNumber = Math.floor(
      (((ascendant.eclipticLongitude % 360) + 360) % 360) / 30,
    );

    // House theme keywords
    const houseThemes: Record<number, string[]> = {
      1: [
        'self',
        'identity',
        'appearance',
        'personality',
        'me',
        'myself',
        'I am',
      ],
      2: ['money', 'value', 'worth', 'finances', 'resources', 'security'],
      3: [
        'communication',
        'learn',
        'study',
        'sibling',
        'neighbor',
        'message',
        'talk',
      ],
      4: ['home', 'family', 'mother', 'roots', 'past', 'private', 'foundation'],
      5: [
        'creative',
        'romance',
        'fun',
        'children',
        'joy',
        'express',
        'pleasure',
      ],
      6: ['health', 'work', 'routine', 'service', 'daily', 'habit', 'wellness'],
      7: [
        'relationship',
        'partner',
        'marriage',
        'other',
        'commitment',
        'cooperation',
      ],
      8: [
        'transform',
        'deep',
        'intimate',
        'shared',
        'death',
        'rebirth',
        'power',
      ],
      9: [
        'travel',
        'philosophy',
        'belief',
        'meaning',
        'expand',
        'higher',
        'adventure',
      ],
      10: [
        'career',
        'reputation',
        'public',
        'achievement',
        'success',
        'status',
        'goal',
      ],
      11: [
        'friend',
        'community',
        'group',
        'future',
        'hope',
        'network',
        'social',
      ],
      12: [
        'spiritual',
        'dream',
        'unconscious',
        'hidden',
        'solitude',
        'meditation',
      ],
    };

    // Process entries - TEST FIRST ENTRY IN DETAIL
    const firstEntry = entries[0];
    if (firstEntry) {
      const lowerText = firstEntry.text.toLowerCase();
      const entryDate = new Date(firstEntry.createdAt);

      try {
        const transits = await getRealPlanetaryPositions(entryDate);

        diagnostics.errors.push(`First entry text: "${lowerText}"`);
        diagnostics.errors.push(
          `Ascendant at ${diagnostics.ascendantDegree}° (sign ${ascendantSignNumber})`,
        );

        // Show which house each planet is transiting
        for (const planet of ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn']) {
          const transitingPlanet = transits[planet];
          if (!transitingPlanet || !transitingPlanet.eclipticLongitude)
            continue;

          const planetSign = Math.floor(
            (((transitingPlanet.eclipticLongitude % 360) + 360) % 360) / 30,
          );
          const house = ((planetSign - ascendantSignNumber + 12) % 12) + 1;

          diagnostics.errors.push(
            `${planet} at ${transitingPlanet.eclipticLongitude.toFixed(1)}° in ${transitingPlanet.sign} → House ${house}`,
          );
        }

        // Text contains "friend" and "community" (House 11 keywords)
        diagnostics.errors.push(
          'Text contains House 11 keywords: friend, community',
        );
      } catch (error) {
        diagnostics.errors.push(`Transit fetch error: ${error}`);
      }
    }

    // Process entries
    for (const entry of entries) {
      const entryDate = new Date(entry.createdAt);
      const lowerText = entry.text.toLowerCase();

      try {
        const transits = await getRealPlanetaryPositions(entryDate);

        // Calculate which houses were activated by major transits
        for (const planet of ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn']) {
          const transitingPlanet = transits[planet];
          if (!transitingPlanet || !transitingPlanet.eclipticLongitude)
            continue;

          const planetSign = Math.floor(
            (((transitingPlanet.eclipticLongitude % 360) + 360) % 360) / 30,
          );
          const house = ((planetSign - ascendantSignNumber + 12) % 12) + 1;

          // Check if journal entry mentions themes related to this house
          const houseKeywords = houseThemes[house] || [];
          for (const keyword of houseKeywords) {
            if (lowerText.includes(keyword)) {
              diagnostics.houseActivations[house] =
                (diagnostics.houseActivations[house] || 0) + 1;
              diagnostics.totalKeywordMatches++;

              // Save first 5 matches as samples
              if (diagnostics.sampleMatches.length < 5) {
                diagnostics.sampleMatches.push({
                  house,
                  keyword,
                  text: entry.text.substring(0, 100) + '...',
                });
              }
              break;
            }
          }
        }
        diagnostics.successfulProcessing++;
      } catch (error) {
        diagnostics.failedProcessing++;
        diagnostics.errors.push(
          `Entry ${entry.createdAt}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    return NextResponse.json({
      success: true,
      testUserId,
      diagnostics,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

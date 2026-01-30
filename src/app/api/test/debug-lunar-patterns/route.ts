import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
} from '../../../../../utils/astrology/astronomical-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface DiagnosticInfo {
  totalEntries: number;
  successfulMoonDataFetches: number;
  failedMoonDataFetches: number;
  lunarCombinations: Record<string, { count: number; moods: string[] }>;
  errors: string[];
  sampleEntry?: {
    date: string;
    moonPhase: string;
    moonSign: string;
    moodTags: string[];
  };
}

export async function GET() {
  try {
    const testUserId = 'test-pattern-user-001';
    const daysBack = 30;

    //Calculate date cutoff in JavaScript
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
      moodTags:
        typeof row.content === 'string'
          ? JSON.parse(row.content).moodTags || []
          : row.content.moodTags || [],
      cardReferences:
        typeof row.content === 'string'
          ? JSON.parse(row.content).cardReferences || []
          : row.content.cardReferences || [],
      createdAt: row.created_at,
    }));

    const diagnostics: DiagnosticInfo = {
      totalEntries: entries.length,
      successfulMoonDataFetches: 0,
      failedMoonDataFetches: 0,
      lunarCombinations: {},
      errors: [],
    };

    // Try to fetch moon data for each entry
    for (const entry of entries) {
      const entryDate = new Date(entry.createdAt);

      try {
        const moonData = await getAccurateMoonPhase(entryDate);
        const planetaryData = await getRealPlanetaryPositions(entryDate);
        const moonSign = planetaryData.Moon?.sign || 'Unknown';
        const lunarKey = `${moonData.name}_${moonSign}`;

        if (!diagnostics.lunarCombinations[lunarKey]) {
          diagnostics.lunarCombinations[lunarKey] = { count: 0, moods: [] };
        }

        diagnostics.lunarCombinations[lunarKey].count++;
        diagnostics.lunarCombinations[lunarKey].moods.push(...entry.moodTags);
        diagnostics.successfulMoonDataFetches++;

        // Save first successful entry as sample
        if (!diagnostics.sampleEntry) {
          diagnostics.sampleEntry = {
            date: entryDate.toISOString(),
            moonPhase: moonData.name,
            moonSign,
            moodTags: entry.moodTags,
          };
        }
      } catch (error) {
        diagnostics.failedMoonDataFetches++;
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

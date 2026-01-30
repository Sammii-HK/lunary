import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET() {
  try {
    const testUserId = 'test-pattern-user-001';
    console.log('Creating test data for:', testUserId);

    // Step 1: Ensure user exists
    await sql`
      INSERT INTO "user" (id, name, email)
      VALUES (${testUserId}, 'Pattern Test User', 'pattern-test@example.com')
      ON CONFLICT (id) DO NOTHING
    `;
    console.log('✓ User created/verified');

    // Step 2: Create profile with birth chart
    const birthChart = [
      { body: 'Sun', sign: 'Gemini', degree: 23.5, eclipticLongitude: 83.5 },
      {
        body: 'Moon',
        sign: 'Pisces',
        degree: 12.3,
        eclipticLongitude: 342.3,
      },
      {
        body: 'Ascendant',
        sign: 'Libra',
        degree: 15.0,
        eclipticLongitude: 195.0,
      },
    ];

    const location = {
      latitude: 51.5074,
      longitude: -0.1278,
      birthTime: '14:30',
      timezone: 'Europe/London',
    };

    await sql`
      INSERT INTO user_profiles (user_id, name, birthday, location, birth_chart)
      VALUES (
        ${testUserId},
        'Pattern Test User',
        '1990-06-15',
        ${JSON.stringify(location)},
        ${JSON.stringify(birthChart)}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        birth_chart = EXCLUDED.birth_chart,
        birthday = EXCLUDED.birthday,
        location = EXCLUDED.location
    `;
    console.log('✓ Profile created');

    // Step 3: Delete old entries
    await sql`
      DELETE FROM collections
      WHERE user_id = ${testUserId} AND category = 'journal'
    `;
    console.log('✓ Old entries cleared');

    // Step 4: Insert journal entries
    const entries = [
      {
        text: 'Had a deep conversation with my partner today about our future together. Feeling reflective about where we are heading.',
        mood: 'reflective',
        moonPhase: 'New Moon',
        daysAgo: 30,
      },
      {
        text: 'Thinking about my relationships and how I show up for others. Energized about commitment right now.',
        mood: 'energized',
        moonPhase: 'Waxing Crescent',
        daysAgo: 27,
      },
      {
        text: 'Big meeting at work today about the new project. Feeling hopeful about taking on more responsibility.',
        mood: 'hopeful',
        moonPhase: 'First Quarter',
        daysAgo: 25,
      },
      {
        text: 'My partner and I are navigating some challenges. Feeling anxious but hopeful we will work through this together.',
        mood: 'anxious',
        moonPhase: 'Waxing Gibbous',
        daysAgo: 23,
      },
      {
        text: 'Spent time journaling about who I am becoming. Feeling reflective about this journey of self-discovery.',
        mood: 'reflective',
        moonPhase: 'Full Moon',
        daysAgo: 21,
      },
      {
        text: 'Reflecting on my career goals and where I want to be in five years. Inspired about the path ahead.',
        mood: 'inspired',
        moonPhase: 'Waning Gibbous',
        daysAgo: 19,
      },
      {
        text: 'Looking in the mirror and really seeing myself today. Peaceful energy around my identity and how I show up.',
        mood: 'peaceful',
        moonPhase: 'Last Quarter',
        daysAgo: 17,
      },
      {
        text: 'Reorganizing my space today bringing up feelings about home and family. Reflective about my roots.',
        mood: 'reflective',
        moonPhase: 'Waning Crescent',
        daysAgo: 15,
      },
      {
        text: 'Painted for hours today and lost track of time. Feeling joyful and so alive in my creative flow.',
        mood: 'joyful',
        moonPhase: 'New Moon',
        daysAgo: 13,
      },
      {
        text: 'Thinking about the people in my life and who truly sees me. Grateful about my relationships.',
        mood: 'grateful',
        moonPhase: 'Waxing Crescent',
        daysAgo: 11,
      },
      {
        text: 'Had a breakthrough moment at work today. Feeling energized and ready to step into my power.',
        mood: 'energized',
        moonPhase: 'First Quarter',
        daysAgo: 9,
      },
      {
        text: 'Deep meditation session this morning. Feeling reflective and connected to something greater.',
        mood: 'reflective',
        moonPhase: 'Waxing Gibbous',
        daysAgo: 7,
      },
      {
        text: 'My partner mentioned something that really resonated with me. Feeling hopeful about our partnership.',
        mood: 'hopeful',
        moonPhase: 'Full Moon',
        daysAgo: 5,
      },
      {
        text: 'Called my mom today and we talked about childhood memories. Feeling peaceful about where I come from.',
        mood: 'peaceful',
        moonPhase: 'Waning Gibbous',
        daysAgo: 3,
      },
      {
        text: 'Met up with friends today and realized how much I value community. Feeling grateful and supported.',
        mood: 'grateful',
        moonPhase: 'Last Quarter',
        daysAgo: 1,
      },
    ];

    let inserted = 0;
    for (const entry of entries) {
      const entryDate = new Date();
      entryDate.setDate(entryDate.getDate() - entry.daysAgo);

      const content = {
        text: entry.text,
        moodTags: [entry.mood],
        moonPhase: entry.moonPhase,
        cardReferences: [],
        source: 'test-data',
        transitHighlight: null,
      };

      await sql`
        INSERT INTO collections (user_id, category, title, content, created_at)
        VALUES (
          ${testUserId},
          'journal',
          ${'Journal Entry - ' + entry.daysAgo + ' days ago'},
          ${JSON.stringify(content)},
          ${entryDate.toISOString()}
        )
      `;
      inserted++;
    }

    console.log(`✓ Inserted ${inserted} journal entries`);

    return NextResponse.json({
      success: true,
      message: 'Test data created successfully!',
      testUserId,
      entriesCreated: inserted,
      nextSteps: [
        'Run pattern analysis: curl -X GET "http://localhost:3000/api/cron/journal-patterns" -H "Authorization: Bearer $CRON_SECRET"',
        'Patterns should be detected: moon patterns, mood patterns, relationship themes',
      ],
    });
  } catch (error) {
    console.error('Error creating test data:', error);
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

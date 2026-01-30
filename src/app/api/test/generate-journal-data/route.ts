import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getAccurateMoonPhase } from '../../../../../utils/astrology/astronomical-data';
import { getRealPlanetaryPositions } from '../../../../../utils/astrology/astronomical-data';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const MOOD_OPTIONS = [
  'reflective',
  'energized',
  'peaceful',
  'anxious',
  'inspired',
  'grateful',
  'frustrated',
  'hopeful',
  'confused',
  'creative',
  'tired',
  'joyful',
];

const JOURNAL_TEMPLATES = {
  relationships: [
    "Had a deep conversation with my partner today about our future together. Feeling {mood} about where we're heading.",
    'Thinking about my relationships and how I show up for others. {mood} energy around commitment right now.',
    "My partner and I are navigating some challenges. Feeling {mood} but hopeful we'll work through this together.",
  ],
  career: [
    'Big meeting at work today about the new project. Feeling {mood} about taking on more responsibility.',
    'Reflecting on my career goals and where I want to be in five years. {mood} about the path ahead.',
    'Had a breakthrough moment at work today. Feeling {mood} and ready to step into my power.',
  ],
  self: [
    "Spent time journaling about who I'm becoming. Feeling {mood} about this journey of self-discovery.",
    'Looking in the mirror and really seeing myself today. {mood} energy around my identity and how I show up.',
    'Meditation this morning brought up a lot about my sense of self. Feeling {mood} but clear.',
  ],
  home: [
    "Reorganizing my space today and it's bringing up feelings about home and family. {mood} about my roots.",
    'Called my mom today and we talked about childhood memories. Feeling {mood} about where I come from.',
    'Working on making my home feel more like a sanctuary. {mood} energy around my foundation.',
  ],
  creativity: [
    'Painted for hours today and lost track of time. Feeling {mood} and so alive in my creative flow.',
    'Had an idea for a new creative project. {mood} about expressing this part of myself.',
    "Noticed I'm drawn to creative activities more lately. Feeling {mood} and inspired.",
  ],
  spirituality: [
    'Deep meditation session this morning. Feeling {mood} and connected to something greater.',
    'Pulled some tarot cards and the messages really resonated. {mood} about my spiritual path.',
    'Dreamed about transformation last night. Waking up feeling {mood} and contemplative.',
  ],
  friends: [
    'Met up with friends today and realized how much I value community. Feeling {mood} and supported.',
    'Thinking about the people in my life and who truly sees me. {mood} about my social connections.',
    'Planning something special with my friend group. Feeling {mood} and grateful for these bonds.',
  ],
};

export async function GET() {
  try {
    console.log('🌙 Starting test journal data generation...');

    // Get or create a test user
    const testUserId = 'test-pattern-user-001';

    // Check if user exists
    const existingUser = await sql`
      SELECT id FROM "user" WHERE id = ${testUserId}
    `;

    if (existingUser.rows.length === 0) {
      console.log('Creating test user...');
      // Create test user
      await sql`
        INSERT INTO "user" (id, name, email)
        VALUES (
          ${testUserId},
          'Pattern Test User',
          'pattern-test@example.com'
        )
        ON CONFLICT (id) DO NOTHING
      `;

      // Create user profile with birth chart
      await sql`
        INSERT INTO user_profiles (
          user_id,
          name,
          birthday,
          location,
          birth_chart
        )
        VALUES (
          ${testUserId},
          'Pattern Test User',
          '1990-06-15',
          ${JSON.stringify({
            latitude: 51.5074,
            longitude: -0.1278,
            birthTime: '14:30',
            timezone: 'Europe/London',
          })}::jsonb,
          ${JSON.stringify([
            {
              body: 'Sun',
              sign: 'Gemini',
              degree: 23.5,
              eclipticLongitude: 83.5,
            },
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
            {
              body: 'Mercury',
              sign: 'Gemini',
              degree: 28.1,
              eclipticLongitude: 88.1,
            },
            {
              body: 'Venus',
              sign: 'Taurus',
              degree: 19.4,
              eclipticLongitude: 49.4,
            },
            {
              body: 'Mars',
              sign: 'Pisces',
              degree: 5.2,
              eclipticLongitude: 335.2,
            },
          ])}::jsonb
        )
        ON CONFLICT (user_id) DO UPDATE SET
          birth_chart = EXCLUDED.birth_chart
      `;

      console.log('✅ Test user created with birth chart');
    } else {
      console.log('✅ Using existing test user');
    }

    // Generate 15 journal entries over the last 30 days (reduced for speed)
    const now = new Date();
    const entries: any[] = [];

    for (let i = 0; i < 15; i++) {
      // Spread entries across 30 days
      const daysAgo = Math.floor((30 / 20) * i);
      const entryDate = new Date(now);
      entryDate.setDate(entryDate.getDate() - daysAgo);

      // Get moon phase and planetary positions for this date
      let moonPhase, transits;
      try {
        moonPhase = await getAccurateMoonPhase(entryDate);
        transits = await getRealPlanetaryPositions(entryDate);
      } catch (error) {
        console.error('Error getting astronomical data:', error);
        // Use defaults if astronomical data fails
        moonPhase = { name: 'Unknown', illumination: 50 };
        transits = { Moon: { sign: 'Aries' }, Mars: { sign: 'Aries' } };
      }

      // Select mood based on moon phase (create pattern!)
      let mood: string;
      if (moonPhase.name === 'New Moon' && transits.Moon?.sign === 'Pisces') {
        mood = 'reflective'; // Pattern: reflective during New Moon in Pisces
      } else if (moonPhase.name === 'Full Moon') {
        mood = i % 2 === 0 ? 'energized' : 'anxious'; // Pattern: varied during Full Moon
      } else if (transits.Mars?.sign === 'Aries') {
        mood = 'energized'; // Pattern: energized when Mars in Aries
      } else {
        mood = MOOD_OPTIONS[i % MOOD_OPTIONS.length];
      }

      // Select journal category (creates house activation patterns)
      const categories = Object.keys(JOURNAL_TEMPLATES);
      let category: keyof typeof JOURNAL_TEMPLATES;

      // Create patterns: more relationship entries, some career entries
      if (i % 3 === 0) {
        category = 'relationships'; // Will trigger 7th house pattern
      } else if (i % 5 === 0) {
        category = 'career'; // Will trigger 10th house pattern
      } else {
        category = categories[
          i % categories.length
        ] as keyof typeof JOURNAL_TEMPLATES;
      }

      const templates = JOURNAL_TEMPLATES[category];
      const template = templates[i % templates.length];
      const text = template.replace('{mood}', mood);

      entries.push({
        date: entryDate,
        mood,
        text,
        moonPhase: moonPhase.name,
        marsSign: transits.Mars?.sign,
      });
    }

    console.log('📝 Generated 20 journal entries');

    // Insert entries into database
    let inserted = 0;
    for (const entry of entries) {
      try {
        await sql`
          INSERT INTO collections (
            user_id,
            category,
            title,
            content,
            created_at
          )
          VALUES (
            ${testUserId},
            'journal',
            ${`Journal Entry - ${entry.date.toISOString().split('T')[0]}`},
            ${JSON.stringify({
              text: entry.text,
              moodTags: [entry.mood],
              moonPhase: entry.moonPhase,
              cardReferences: [],
              source: 'test-data',
              transitHighlight: entry.marsSign
                ? `Mars in ${entry.marsSign}`
                : null,
            })}::jsonb,
            ${entry.date.toISOString()}
          )
        `;
        inserted++;
      } catch (error) {
        console.error('Error inserting entry:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Test journal data generated successfully',
      testUserId,
      entriesInserted: inserted,
      patterns: {
        lunar: 'reflective during New Moon in Pisces',
        transit: 'energized when Mars in Aries',
        house: 'relationships (7th house) and career (10th house) themes',
      },
      nextSteps: [
        `Run pattern analysis: curl -X GET "http://localhost:3000/api/cron/journal-patterns" -H "Authorization: Bearer $CRON_SECRET"`,
        `Check patterns: SELECT * FROM journal_patterns WHERE user_id = '${testUserId}';`,
        `Test in chat with user ID: ${testUserId}`,
      ],
    });
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL not found. Run: vercel env pull .env.local');
  process.exit(1);
}

const themeKeywords = [
  'moon',
  'transit',
  'energy',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'retrograde',
  'new moon',
  'full moon',
  'eclipse',
  'equinox',
  'solstice',
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
  'tarot',
  'star',
  'tower',
  'fool',
  'magician',
  'empress',
  'emperor',
  'lovers',
  'chariot',
  'strength',
  'hermit',
  'wheel',
  'justice',
  'hanged',
  'death',
  'temperance',
  'devil',
  'world',
  'sun',
  'judgement',
  'ritual',
  'intention',
  'reflection',
  'meditation',
  'crystal',
  'chakra',
  'healing',
  'manifestation',
  'gratitude',
  'release',
  'abundance',
];

function extractMeaningfulTitle(content: string): string {
  const cleaned = content.replace(/[*_~`#]/g, '').trim();

  const sentences = cleaned
    .split(/[.!?\n]+/)
    .filter((s) => s.trim().length > 10);
  const firstSentence = sentences[0]?.trim() || cleaned;

  const lowerContent = cleaned.toLowerCase();
  const foundThemes: string[] = [];

  for (const keyword of themeKeywords) {
    if (lowerContent.includes(keyword)) {
      foundThemes.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      if (foundThemes.length >= 2) break;
    }
  }

  if (foundThemes.length > 0) {
    const themePrefix = foundThemes.join(' & ');
    const shortContent =
      firstSentence.length > 40
        ? firstSentence.substring(0, 40).replace(/\s+\S*$/, '') + '...'
        : firstSentence;
    return `${themePrefix}: ${shortContent}`;
  }

  if (firstSentence.length <= 60) {
    return firstSentence;
  }

  return firstSentence.substring(0, 55).replace(/\s+\S*$/, '') + '...';
}

async function fixAIResponseTitles() {
  console.log('Finding collections with AI Response titles...');

  const result = await sql`
    SELECT id, title, content
    FROM collections
    WHERE title LIKE 'AI Response%'
  `;

  console.log(`Found ${result.rows.length} collections to update`);

  let updated = 0;
  let failed = 0;

  for (const row of result.rows) {
    try {
      const content =
        typeof row.content === 'string' ? JSON.parse(row.content) : row.content;

      const text = content?.text || content?.content || '';

      if (!text) {
        console.log(`Skipping ${row.id}: no text content`);
        continue;
      }

      const newTitle = extractMeaningfulTitle(text);

      await sql`
        UPDATE collections
        SET title = ${newTitle}
        WHERE id = ${row.id}
      `;

      console.log(`Updated ${row.id}: "${row.title}" -> "${newTitle}"`);
      updated++;
    } catch (error) {
      console.error(`Failed to update ${row.id}:`, error);
      failed++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

fixAIResponseTitles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Script failed:', err);
    process.exit(1);
  });

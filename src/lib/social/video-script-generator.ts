/**
 * Video Script Generator
 *
 * Generates TikTok (30-45s) and YouTube (3-4min) scripts from weekly themes.
 * Scripts are complete, flowing narratives that can be read naturally.
 */

import OpenAI from 'openai';
import {
  type WeeklyTheme,
  type DailyFacet,
  categoryThemes,
} from './weekly-themes';

// Import data sources
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import chakras from '@/data/chakras.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';

function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  return new OpenAI({ apiKey });
}

// ============================================================================
// TYPES
// ============================================================================

export interface ScriptSection {
  name: string;
  duration: string;
  content: string;
}

export interface TikTokMetadata {
  theme: string; // Uppercase category e.g. "PLANETS"
  title: string; // Facet title e.g. "The Sun"
  series: string; // Series part e.g. "Part 1 of 3"
  summary: string; // Short description from facet focus
}

export interface VideoScript {
  id?: number;
  themeId: string;
  themeName: string;
  facetTitle: string;
  platform: 'tiktok' | 'youtube';
  sections: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  scheduledDate: Date;
  status: 'draft' | 'approved' | 'used';
  createdAt?: Date;
  // TikTok-specific fields
  metadata?: TikTokMetadata;
  coverImageUrl?: string;
  partNumber?: number; // 1, 2, or 3
  writtenPostContent?: string; // Social media post content for this video
}

export interface WeeklyVideoScripts {
  theme: WeeklyTheme;
  tiktokScripts: VideoScript[];
  youtubeScript: VideoScript;
  weekStartDate: Date;
}

// ============================================================================
// DATABASE
// ============================================================================

export async function ensureVideoScriptsTable(): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    CREATE TABLE IF NOT EXISTS video_scripts (
      id SERIAL PRIMARY KEY,
      theme_id TEXT NOT NULL,
      theme_name TEXT NOT NULL,
      facet_title TEXT NOT NULL,
      platform TEXT NOT NULL,
      sections JSONB NOT NULL,
      full_script TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      estimated_duration TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      metadata JSONB,
      cover_image_url TEXT,
      part_number INTEGER,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_platform ON video_scripts(platform)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_status ON video_scripts(status)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_scheduled ON video_scripts(scheduled_date)
  `;

  // Add new columns if they don't exist (for existing tables)
  try {
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS metadata JSONB`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS cover_image_url TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS part_number INTEGER`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS written_post_content TEXT`;
  } catch {
    // Columns may already exist
  }
}

export async function saveVideoScript(script: VideoScript): Promise<number> {
  const { sql } = await import('@vercel/postgres');

  const result = await sql`
    INSERT INTO video_scripts (
      theme_id, theme_name, facet_title, platform, sections,
      full_script, word_count, estimated_duration, scheduled_date, status,
      metadata, cover_image_url, part_number, written_post_content
    )
    VALUES (
      ${script.themeId},
      ${script.themeName},
      ${script.facetTitle},
      ${script.platform},
      ${JSON.stringify(script.sections)},
      ${script.fullScript},
      ${script.wordCount},
      ${script.estimatedDuration},
      ${script.scheduledDate.toISOString()},
      ${script.status},
      ${script.metadata ? JSON.stringify(script.metadata) : null},
      ${script.coverImageUrl || null},
      ${script.partNumber || null},
      ${script.writtenPostContent || null}
    )
    RETURNING id
  `;

  return result.rows[0].id;
}

export async function getVideoScripts(filters?: {
  platform?: string;
  status?: string;
  weekStart?: Date;
}): Promise<VideoScript[]> {
  const { sql } = await import('@vercel/postgres');

  let result;

  if (filters?.weekStart) {
    const weekEnd = new Date(filters.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (filters.platform && filters.status) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE platform = ${filters.platform}
        AND status = ${filters.status}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else if (filters.platform) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE platform = ${filters.platform}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else if (filters.status) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE status = ${filters.status}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    }
  } else {
    result = await sql`
      SELECT * FROM video_scripts
      ORDER BY scheduled_date DESC
      LIMIT 50
    `;
  }

  return result.rows.map((row) => ({
    id: row.id,
    themeId: row.theme_id,
    themeName: row.theme_name,
    facetTitle: row.facet_title,
    platform: row.platform,
    sections: row.sections,
    fullScript: row.full_script,
    wordCount: row.word_count,
    estimatedDuration: row.estimated_duration,
    scheduledDate: new Date(row.scheduled_date),
    status: row.status,
    createdAt: new Date(row.created_at),
    metadata: row.metadata || undefined,
    coverImageUrl: row.cover_image_url || undefined,
    partNumber: row.part_number || undefined,
    writtenPostContent: row.written_post_content || undefined,
  }));
}

export async function updateVideoScriptStatus(
  id: number,
  status: 'draft' | 'approved' | 'used',
): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    UPDATE video_scripts
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateVideoScriptWrittenPost(
  id: number,
  writtenPostContent: string,
): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    UPDATE video_scripts
    SET written_post_content = ${writtenPostContent}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

// ============================================================================
// GRIMOIRE DATA HELPERS
// ============================================================================

function getGrimoireDataForFacet(
  facet: DailyFacet,
): Record<string, any> | null {
  const slug = facet.grimoireSlug;

  // Try zodiac signs
  if (slug.includes('zodiac/')) {
    const sign = slug.split('/').pop();
    if (sign && zodiacSigns[sign as keyof typeof zodiacSigns]) {
      return zodiacSigns[sign as keyof typeof zodiacSigns];
    }
  }

  // Try planets
  if (slug.includes('planets/') || slug.includes('astronomy/')) {
    const planet = slug.split('/').pop();
    if (planet && planetaryBodies[planet as keyof typeof planetaryBodies]) {
      return planetaryBodies[planet as keyof typeof planetaryBodies];
    }
  }

  // Try chakras
  if (slug.includes('chakras/')) {
    const chakra = slug.split('/').pop();
    if (chakra && chakras[chakra as keyof typeof chakras]) {
      return chakras[chakra as keyof typeof chakras];
    }
  }

  // Try crystals
  if (slug.includes('crystals/')) {
    const crystalId = slug.split('/').pop();
    const crystal = (crystals as any[]).find(
      (c) =>
        c.id === crystalId || c.name.toLowerCase() === crystalId?.toLowerCase(),
    );
    if (crystal) return crystal;
  }

  // Try tarot
  if (slug.includes('tarot/')) {
    const cardSlug = slug.split('/').pop();
    if (cardSlug) {
      const cardKey = cardSlug
        .split('-')
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
      const card =
        tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
      if (card) return card;
    }
  }

  // Try sabbats
  if (slug.includes('wheel-of-the-year/')) {
    const sabbatName = slug.split('/').pop();
    const sabbat = (sabbats as any[]).find(
      (s) => s.name.toLowerCase() === sabbatName?.toLowerCase(),
    );
    if (sabbat) return sabbat;
  }

  // Try numerology
  if (slug.includes('numerology') || slug.includes('angel-numbers')) {
    const match = slug.match(/(\d+)/);
    if (match) {
      const num = match[1];
      const angelNum =
        numerology.angelNumbers?.[num as keyof typeof numerology.angelNumbers];
      if (angelNum) return angelNum;
      const lifePath =
        numerology.lifePathNumbers?.[
          num as keyof typeof numerology.lifePathNumbers
        ];
      if (lifePath) return lifePath;
    }
  }

  return null;
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function estimateDuration(wordCount: number): string {
  // Average speaking pace: 130-150 words per minute
  const minutes = wordCount / 140;
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} seconds`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
}

// ============================================================================
// TIKTOK SCRIPT GENERATOR (30-45 seconds, ~70-110 words)
// ============================================================================

export async function generateTikTokScript(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate: Date,
  partNumber: number = 1,
  totalParts: number = 3,
  baseUrl: string = '',
): Promise<VideoScript> {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const grimoireData = getGrimoireDataForFacet(facet);

  // Generate complete, flowing script using AI
  const fullScript = await generateTikTokScriptContent(
    facet,
    theme,
    grimoireData,
    safePartNumber,
    safeTotalParts,
  );

  const wordCount = countWords(fullScript);

  // Parse script into sections for metadata (but keep full script as main content)
  const sections = parseScriptIntoSections(fullScript, 'tiktok');

  // Generate TikTok-specific metadata and cover image
  const metadata = generateTikTokMetadata(
    facet,
    theme,
    safePartNumber,
    safeTotalParts,
  );
  const coverImageUrl = generateCoverImageUrl(
    facet,
    theme,
    safePartNumber,
    baseUrl,
    safeTotalParts,
  );

  return {
    themeId: theme.id,
    themeName: theme.name,
    facetTitle: facet.title,
    platform: 'tiktok',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate,
    status: 'draft',
    metadata,
    coverImageUrl,
    partNumber: safePartNumber,
  };
}

/**
 * Generate complete TikTok script using AI
 * Creates a flowing 30-45 second narrative (70-110 words)
 */
async function generateTikTokScriptContent(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): Promise<string> {
  const openai = getOpenAI();

  // Build context from Grimoire data
  let dataContext = '';
  if (grimoireData) {
    if (grimoireData.description) {
      dataContext += `Description: ${grimoireData.description}\n`;
    }
    if (grimoireData.element) {
      dataContext += `Element: ${grimoireData.element}\n`;
    }
    if (grimoireData.ruler || grimoireData.rulingPlanet) {
      dataContext += `Ruled by: ${grimoireData.ruler || grimoireData.rulingPlanet}\n`;
    }
    if (grimoireData.modality) {
      dataContext += `Modality: ${grimoireData.modality}\n`;
    }
    if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
      dataContext += `Key themes: ${grimoireData.keywords.join(', ')}\n`;
    }
    if (grimoireData.meaning || grimoireData.mysticalProperties) {
      dataContext += `Meaning: ${grimoireData.meaning || grimoireData.mysticalProperties}\n`;
    }
    if (grimoireData.strengths && Array.isArray(grimoireData.strengths)) {
      dataContext += `Strengths: ${grimoireData.strengths.join(', ')}\n`;
    }
    if (grimoireData.affirmation) {
      dataContext += `Affirmation: ${grimoireData.affirmation}\n`;
    }
  }

  const prompt = `Create a complete, flowing TikTok video script (30–45 seconds, 70–110 words) about ${facet.title} as part of a daily educational series.

Series Theme: ${theme.name}
Daily topic: ${facet.title} (focus: ${facet.focus})

This is Part ${partNumber} of ${totalParts} in the series. The script should be:
  - Complete and flowing, written as a calm, authoritative narrative that can be read aloud smoothly
  - Educational and interpretive, not conversational or hype-driven
  - Designed for viewers seeking understanding, not entertainment
  - Part 1 may include brief series context. Parts 2+ must not repeat a full introduction
  - Structured with a strong interpretive opening, clear explanation, and reflective takeaway

Opening requirements:
  - The first sentence must be an interpretive hook that reframes meaning, challenges a common misconception, or explains why this topic matters in real life
  - Do NOT use questions unless they clarify meaning (no generic curiosity bait)
  - Do NOT use “Day”, “Part”, or series framing in the first sentence

Structure requirements:
  - The second sentence must briefly remind viewers of the weekly theme (e.g., "Welcome back to our series on ${theme.name}.")
  - Immediately after, reference the series position once: "Part ${partNumber} of ${totalParts}: ${facet.title}."
  - Clearly explain today’s focus: ${facet.focus}
  - Maintain a calm, grounded, premium tone throughout
  - End with a reflective or interpretive takeaway that encourages understanding, not action

Constraints:
  - Do NOT mention “next week”
  - Do NOT use overt CTAs (no likes, follows, or app promotion)
  - Avoid sensational language or emotional exaggeration

Topic: ${facet.title}
Focus: ${facet.focus}
${dataContext ? `\nGrimoire Data:\n${dataContext}` : ''}

Return ONLY the complete script text. No headings, no markdown, no formatting. The output must read as a single, cohesive spoken narrative.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an educational content creator writing complete, flowing video scripts. Write in a natural, authoritative tone that flows smoothly when read aloud. The script must be complete and coherent - not fragmented or broken up. Make it educational and informative.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    let script = completion.choices[0]?.message?.content || '';
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned empty script');
    }

    script = script.trim();

    script = ensureTikTokHookFirstSentence(script, facet, theme, grimoireData);

    // Ensure series callback is included
    if (!script.includes(`Part ${partNumber}`)) {
      script += `\n\nPart ${partNumber} of ${totalParts}: ${facet.title}.`;
    }

    return script;
  } catch (error) {
    console.error('Failed to generate TikTok script with AI:', error);
    // Fallback to structured script
    return ensureTikTokHookFirstSentence(
      generateTikTokScriptFallback(
        facet,
        theme,
        grimoireData,
        partNumber,
        totalParts,
      ),
      facet,
      theme,
      grimoireData,
    );
  }
}

/**
 * Fallback: Generate structured script if AI fails
 */
function generateTikTokScriptFallback(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  const hook = buildTikTokHook(facet, theme, grimoireData);
  const intro = buildTikTokIntro(facet, theme, grimoireData, partNumber);
  const core = buildTikTokCore(facet, theme, grimoireData);
  const takeaway = buildTikTokTakeaway(
    facet,
    theme,
    grimoireData,
    partNumber,
    totalParts,
  );

  // Join with smooth transitions
  return `${hook} ${intro} ${core} ${takeaway}`;
}

function ensureTikTokHookFirstSentence(
  text: string,
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const firstSentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) return text;

  const firstSentence = firstSentenceMatch[0].trim();
  if (!needsHookRewrite(firstSentence)) {
    return text;
  }

  const rest = trimmed.slice(firstSentenceMatch[0].length).trim();
  const hookSentence = buildTikTokHook(facet, theme, grimoireData);
  return rest ? `${hookSentence} ${rest}` : hookSentence;
}

/**
 * Parse a complete script into sections for metadata
 * This is just for display - the fullScript is the main content
 */
function parseScriptIntoSections(
  script: string,
  type: 'tiktok' | 'youtube',
): ScriptSection[] {
  // For TikTok: simple parsing into hook, intro, core, takeaway
  if (type === 'tiktok') {
    const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const totalWords = countWords(script);
    const wordsPerSecond = 2.5;

    if (sentences.length < 4) {
      return [
        {
          name: 'Complete Script',
          duration: estimateDuration(totalWords),
          content: script,
        },
      ];
    }

    // Roughly divide into sections
    const hookEnd = Math.ceil(sentences.length * 0.1);
    const introEnd = Math.ceil(sentences.length * 0.3);
    const coreEnd = Math.ceil(sentences.length * 0.85);

    const hook = sentences.slice(0, hookEnd).join('. ') + '.';
    const intro = sentences.slice(hookEnd, introEnd).join('. ') + '.';
    const core = sentences.slice(introEnd, coreEnd).join('. ') + '.';
    const takeaway = sentences.slice(coreEnd).join('. ') + '.';

    return [
      { name: 'Hook', duration: '3 seconds', content: hook },
      { name: 'Theme Intro', duration: '6 seconds', content: intro },
      { name: 'Core Content', duration: '20-25 seconds', content: core },
      { name: 'Takeaway', duration: '5 seconds', content: takeaway },
    ];
  }

  // For YouTube: parse by natural breaks
  const paragraphs = script.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const sections: ScriptSection[] = [];
  let currentTime = 0;
  const wordsPerSecond = 2.5;

  for (const para of paragraphs) {
    const wordCount = countWords(para);
    const duration = wordCount / wordsPerSecond;
    sections.push({
      name: 'Section',
      duration: `${Math.round(duration)} seconds`,
      content: para.trim(),
    });
  }

  return sections.length > 0
    ? sections
    : [
        {
          name: 'Complete Script',
          duration: estimateDuration(countWords(script)),
          content: script,
        },
      ];
}

function buildTikTokHook(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  // Strong opening statement - no questions, no "Hey!"
  const category = theme.category;

  if (data?.name && data?.keywords) {
    const keyword = data.keywords[0] || '';
    return `${data.name}. ${keyword}. This defines ${facet.title.toLowerCase()}.`;
  }

  // Fallback based on category
  switch (category) {
    case 'zodiac':
      return `${facet.title}. The foundation of astrological understanding.`;
    case 'tarot':
      return `${facet.title}. A symbolic key to deeper wisdom.`;
    case 'lunar':
      return `${facet.title}. The moon's influence on earthly rhythms.`;
    case 'planetary':
      return `${facet.title}. Celestial forces that shape human experience.`;
    case 'crystals':
      return `${facet.title}. Earth's concentrated energy in mineral form.`;
    case 'numerology':
      return `${facet.title}. Numbers carry vibrational significance.`;
    case 'chakras':
      return `${facet.title}. Energy centers governing mind and body.`;
    case 'sabbat':
      return `${facet.title}. A sacred marker on the wheel of the year.`;
    default:
      return `${facet.title}. Essential knowledge for understanding.`;
  }
}

function buildTikTokIntro(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
): string {
  const themeIntro =
    partNumber === 1
      ? `Welcome to the ${theme.name} series. `
      : `Welcome back to our ${theme.name} series. `;

  if (data?.description) {
    // Take first sentence or two
    const sentences = data.description.split(/[.!?]+/).filter(Boolean);
    const intro = sentences.slice(0, 2).join('. ') + '.';
    const detail = intro.length > 150 ? sentences[0] + '.' : intro;
    return `${themeIntro}${detail}`;
  }

  return `${themeIntro}${facet.focus}`;
}

function buildTikTokCore(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  const points: string[] = [];

  if (data) {
    // Extract key educational points
    if (data.element) {
      points.push(`Element: ${data.element}.`);
    }
    if (data.ruler || data.rulingPlanet) {
      points.push(`Ruled by ${data.ruler || data.rulingPlanet}.`);
    }
    if (data.modality) {
      points.push(`${data.modality} modality.`);
    }
    if (data.keywords && Array.isArray(data.keywords)) {
      points.push(`Key themes: ${data.keywords.slice(0, 3).join(', ')}.`);
    }
    if (data.meaning || data.mysticalProperties) {
      const meaning = data.meaning || data.mysticalProperties;
      const shortened =
        meaning.length > 140 ? meaning.substring(0, 140) + '...' : meaning;
      points.push(shortened);
    }
    if (data.strengths && Array.isArray(data.strengths)) {
      points.push(
        `Strengths include ${data.strengths.slice(0, 2).join(' and ')}.`,
      );
    }
  }

  // Fill with focus content if needed
  if (points.length < 2) {
    points.push(facet.focus);
  }

  const limitedPoints = points.slice(0, 3);
  return limitedPoints.join(' ');
}

function buildTikTokTakeaway(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  // Single memorable insight
  let takeaway = '';

  if (data?.affirmation) {
    takeaway = data.affirmation;
  } else {
    takeaway = facet.shortFormHook;
  }

  // Add specific series callback with part number and facet title
  const seriesLine = `Part ${partNumber} of ${totalParts}: ${facet.title}. This week's theme: ${theme.name}.`;
  return `${takeaway}\n\n${seriesLine}`;
}

/**
 * Generate TikTok overlay metadata for video template
 */
function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  totalParts: number,
): TikTokMetadata {
  // Map category to display theme name
  const themeDisplayMap: Record<string, string> = {
    zodiac: 'ASTROLOGY',
    tarot: 'TAROT',
    lunar: 'LUNAR CYCLES',
    planetary: 'PLANETS',
    crystals: 'CRYSTALS',
    numerology: 'NUMEROLOGY',
    chakras: 'CHAKRAS',
    sabbat: 'WHEEL OF THE YEAR',
  };

  return {
    theme: themeDisplayMap[theme.category] || theme.category.toUpperCase(),
    title: facet.title,
    series: `Part ${partNumber} of ${totalParts}`,
    summary: facet.focus,
  };
}

/**
 * Generate cover image URL for TikTok video
 */
function generateCoverImageUrl(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  baseUrl: string = '',
  totalParts: number,
): string {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(
    `Part ${safePartNumber} of ${safeTotalParts}`,
  );
  const title = encodeURIComponent(facet.title);

  // cover=tiktok triggers larger text sizes for TikTok thumbnail legibility
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=story&cover=tiktok`;
}

/**
 * Generate cover image URL for YouTube thumbnail
 */
function generateYouTubeCoverUrl(
  theme: WeeklyTheme,
  baseUrl: string = '',
): string {
  // Use first facet's slug for the category symbol
  const firstFacet = theme.facets[0];
  const slug =
    firstFacet?.grimoireSlug.split('/').pop() ||
    theme.name.toLowerCase().replace(/\s+/g, '-');
  const title = encodeURIComponent(theme.name);
  const subtitle = encodeURIComponent('Weekly Deep Dive');

  // cover=youtube triggers optimized sizes for YouTube thumbnail (1280x720)
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=landscape&cover=youtube`;
}

// ============================================================================
// YOUTUBE SCRIPT GENERATOR (5-7 minutes, ~800-1000 words)
// ============================================================================

export async function generateYouTubeScript(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  weekStartDate: Date,
  baseUrl: string = '',
): Promise<VideoScript> {
  // Gather all Grimoire data for the week's facets
  const allData = facets.map((f) => ({
    facet: f,
    data: getGrimoireDataForFacet(f),
  }));

  // Generate complete, flowing script using AI
  const fullScript = await generateYouTubeScriptContent(theme, facets, allData);

  const wordCount = countWords(fullScript);

  // Parse script into sections for metadata (but keep full script as main content)
  const sections = parseScriptIntoSections(fullScript, 'youtube');

  // Generate YouTube thumbnail
  const coverImageUrl = generateYouTubeCoverUrl(theme, baseUrl);

  return {
    themeId: theme.id,
    themeName: theme.name,
    facetTitle: `Weekly Deep Dive: ${theme.name}`,
    platform: 'youtube',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate: weekStartDate,
    status: 'draft',
    coverImageUrl,
  };
}

/**
 * Generate complete YouTube script using AI
 * Creates a flowing 3-4 minute narrative (450-650 words)
 */
async function generateYouTubeScriptContent(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): Promise<string> {
  const openai = getOpenAI();

  // Build comprehensive context from all facets
  const facetContexts = allData.map(({ facet, data }, index) => {
    let context = `Day ${index + 1}: ${facet.title}\nFocus: ${facet.focus}\n`;
    if (data) {
      if (data.description) context += `Description: ${data.description}\n`;
      if (data.element) context += `Element: ${data.element}\n`;
      if (data.ruler || data.rulingPlanet) {
        context += `Ruled by: ${data.ruler || data.rulingPlanet}\n`;
      }
      if (data.modality) context += `Modality: ${data.modality}\n`;
      if (data.keywords && Array.isArray(data.keywords)) {
        context += `Key themes: ${data.keywords.join(', ')}\n`;
      }
      if (data.meaning || data.mysticalProperties) {
        context += `Meaning: ${data.meaning || data.mysticalProperties}\n`;
      }
      if (data.mysticalProperties) {
        context += `Mystical properties: ${data.mysticalProperties}\n`;
      }
      if (data.healingPractices && Array.isArray(data.healingPractices)) {
        context += `Healing practices: ${data.healingPractices.join(', ')}\n`;
      }
    }
    return context;
  });

  const prompt = `Create a complete, flowing YouTube video script (3–4 minutes, 450–650 words) for a weekly educational deep dive on ${theme.name}.

The script should be:
- Written as a composed, authoritative narrative that can be read aloud smoothly from start to finish
- Educational and interpretive, not conversational or casual
- Designed for viewers seeking depth, clarity, and understanding
- Structured to flow naturally through: opening context, topic overview, foundational concepts, deeper meaning, practical interpretation, synthesis, and closing reflection
- Smoothly connected throughout, with no abrupt shifts or segmented feeling
- Clear, grounded, and premium in tone

Opening guidance:
- Begin by establishing why this topic matters and what it helps the viewer understand or reframe
- Avoid generic greetings or channel-style introductions
- Do not reference “this video” or the act of watching

Content guidance:
- Build understanding progressively from foundations to deeper insight
- Use explanation and interpretation, not storytelling or anecdotes
- Cover all facets listed below, integrating them naturally rather than treating them as separate sections
- Maintain clarity and pace while staying concise

Closing guidance:
- End with a reflective synthesis that reinforces meaning and understanding
- Do not include CTAs, prompts to like/subscribe, or platform references
- Leave the viewer with a sense of conceptual completion

Theme: ${theme.name}
Category: ${theme.category}
Description: ${theme.description}

Facets to cover:
${facetContexts.join('\n---\n')}

Return ONLY the complete script text. No section headers, no labels, no markdown, no formatting. The output should read as a single, cohesive spoken narrative with a calm, confident delivery.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an educational content creator writing complete, flowing video scripts. Write in a natural, authoritative tone that flows smoothly when read aloud. The script must be complete and coherent - all sections must flow naturally into each other with smooth transitions. Make it educational and informative. Write as a continuous narrative, not fragmented sections.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    let script = completion.choices[0]?.message?.content || '';
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned empty script');
    }

    script = script.trim();

    // Clean up any section markers that might have been added
    script = script
      .replace(/\[.*?\]/g, '') // Remove [Section] markers
      .replace(/\n\n---\n\n/g, '\n\n') // Remove section dividers
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    // Ensure outro is included
    if (
      !script.toLowerCase().includes('lunary') &&
      !script.toLowerCase().includes('until next time')
    ) {
      script += `\n\nFor deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
    }

    const normalizedScript = ensureHookFirstSentence(script, theme);
    return normalizedScript;
  } catch (error) {
    console.error('Failed to generate YouTube script with AI:', error);
    // Fallback to structured script
    return ensureHookFirstSentence(
      generateYouTubeScriptFallback(theme, facets, allData),
      theme,
    );
  }
}

/**
 * Fallback: Generate structured script if AI fails
 */
function generateYouTubeScriptFallback(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const intro = buildYouTubeIntro(theme, allData);
  const overview = buildYouTubeOverview(theme, facets);
  const foundations = buildYouTubeFoundations(theme, allData.slice(0, 3));
  const deeperMeaning = buildYouTubeDeeperMeaning(theme, allData.slice(2, 5));
  const practical = buildYouTubePractical(theme, allData.slice(4, 7));
  const summary = buildYouTubeSummary(theme, facets);
  const outro = buildYouTubeOutro(theme);

  // Join with smooth transitions
  return `${intro}\n\n${overview}\n\n${foundations}\n\n${deeperMeaning}\n\n${practical}\n\n${summary}\n\n${outro}`;
}

function ensureHookFirstSentence(text: string, theme: WeeklyTheme): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const firstSentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) return text;

  const firstSentence = firstSentenceMatch[0].trim();
  if (!needsHookRewrite(firstSentence)) {
    return text;
  }

  const rest = trimmed.slice(firstSentenceMatch[0].length).trim();
  const hookSentence = buildYouTubeHookSentence(theme);
  return rest ? `${hookSentence} ${rest}` : hookSentence;
}

function needsHookRewrite(sentence: string): boolean {
  return /^(welcome|welcome back|today|hello|hi|now|this|let's)/i.test(
    sentence,
  );
}

function buildYouTubeHookSentence(theme: WeeklyTheme): string {
  const snippet =
    theme.description
      ?.split(/[.!?]/)
      .find((segment) => segment.trim().length > 0) || theme.name;
  const normalized = snippet.trim().toLowerCase();
  const base = normalized.length > 0 ? normalized : theme.name.toLowerCase();
  const cleanSubject = base.replace(/^\s+|\s+$/g, '');
  return `Understanding ${cleanSubject} reveals why ${theme.name.toLowerCase()} matters.`;
}

function buildYouTubeIntro(
  theme: WeeklyTheme,
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const category = theme.category;

  const intros: Record<string, string> = {
    zodiac: `The zodiac is more than sun signs and daily horoscopes. It is an ancient system of celestial mapping that has guided human understanding for millennia. Today, we explore ${theme.name}, examining the fundamental principles that form the backbone of astrological practice.`,
    tarot: `The tarot is a symbolic language, a mirror for the psyche, and a tool for contemplation. In this exploration of ${theme.name}, we move beyond fortune-telling into the realm of archetypal wisdom.`,
    lunar: `The moon governs tides, cycles, and the rhythm of life on Earth. Understanding lunar phases means understanding the natural pulse of existence. This week, we examine ${theme.name}.`,
    planetary: `The planets of our solar system have been observed, named, and mythologized across every culture. Their movements correspond to patterns in human experience. Today we explore ${theme.name}.`,
    crystals: `Crystals are concentrated forms of Earth's energy, formed over millions of years under immense pressure. Each carries distinct properties and uses. We explore ${theme.name}.`,
    numerology: `Numbers are not merely quantities. In numerology, they carry vibrational frequencies and symbolic significance. This week's focus: ${theme.name}.`,
    chakras: `The chakra system maps energy centers within the body, each governing specific physical, emotional, and spiritual functions. Our topic: ${theme.name}.`,
    sabbat: `The wheel of the year turns through eight sabbats, marking the seasonal rhythms that our ancestors lived by. Today we honor ${theme.name}.`,
  };

  return (
    intros[category] || `Today we explore ${theme.name}. ${theme.description}`
  );
}

function buildYouTubeOverview(
  theme: WeeklyTheme,
  facets: DailyFacet[],
): string {
  const facetTitles = facets.slice(0, 5).map((f) => f.title);

  return `This deep dive covers several interconnected topics: ${facetTitles.join(', ')}. Each builds upon the last, creating a comprehensive understanding of ${theme.name.toLowerCase()}. We begin with foundational concepts, move into symbolic meaning, and conclude with practical applications you can integrate into your practice or study.`;
}

function buildYouTubeFoundations(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = `${facet.title}: `;
      if (grimoireData.description) {
        para += grimoireData.description.split('.').slice(0, 2).join('.') + '.';
      } else {
        para += facet.focus;
      }

      if (grimoireData.element) {
        para += ` Associated with the ${grimoireData.element} element.`;
      }
      if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
        para += ` Core themes include ${grimoireData.keywords.slice(0, 3).join(', ')}.`;
      }

      paragraphs.push(para);
    } else {
      paragraphs.push(`${facet.title}: ${facet.focus}`);
    }
  }

  return paragraphs.join('\n\n');
}

function buildYouTubeDeeperMeaning(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `Moving beyond surface definitions, we examine the deeper symbolic layers of ${theme.name.toLowerCase()}.`,
  );

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = '';
      if (grimoireData.mysticalProperties) {
        para = grimoireData.mysticalProperties;
      } else if (grimoireData.meaning) {
        para = grimoireData.meaning;
      } else if (grimoireData.symbolism) {
        para = `The symbolism of ${facet.title}: ${grimoireData.symbolism}`;
      } else {
        para = `${facet.title} represents ${facet.focus.toLowerCase()}.`;
      }
      paragraphs.push(para);
    }
  }

  return paragraphs.join('\n\n');
}

function buildYouTubePractical(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `How does this knowledge apply practically? Understanding ${theme.name.toLowerCase()} offers several applications.`,
  );

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      if (grimoireData.transitEffect) {
        paragraphs.push(grimoireData.transitEffect);
      } else if (grimoireData.houseMeaning) {
        paragraphs.push(grimoireData.houseMeaning);
      } else if (grimoireData.healingProperties) {
        paragraphs.push(
          `Healing applications: ${grimoireData.healingProperties}`,
        );
      } else if (grimoireData.usage) {
        paragraphs.push(`Practical usage: ${grimoireData.usage}`);
      } else if (grimoireData.affirmation) {
        paragraphs.push(
          `Practice this affirmation: "${grimoireData.affirmation}"`,
        );
      }
    }
  }

  if (paragraphs.length < 3) {
    paragraphs.push(
      `Integrate this knowledge gradually. Study, observe, and reflect on how these principles manifest in your experience.`,
    );
  }

  return paragraphs.join('\n\n');
}

function buildYouTubeSummary(theme: WeeklyTheme, facets: DailyFacet[]): string {
  const keyPoints = facets
    .slice(0, 4)
    .map((f) => f.title.toLowerCase())
    .join(', ');

  return `To summarize: we have explored ${theme.name.toLowerCase()}, covering ${keyPoints}, and more. Each of these elements interconnects, forming a coherent system of understanding. The key is not memorization, but integration—allowing this knowledge to deepen your perspective over time.`;
}

function buildYouTubeOutro(theme: WeeklyTheme): string {
  return `For deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate all video scripts for a week
 * Returns 7 TikTok scripts (daily) and 1 YouTube script (Sunday)
 */
export async function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
): Promise<WeeklyVideoScripts> {
  // Get the theme for this week
  const theme = categoryThemes[themeIndex % categoryThemes.length];
  const facets = theme.facets;

  // Generate TikTok scripts for every day of the week
  const totalParts = facets.length;
  const tiktokScripts: VideoScript[] = await Promise.all(
    facets.map(async (facet, dayOffset) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + dayOffset);
      const partNumber = dayOffset + 1;
      return await generateTikTokScript(
        facet,
        theme,
        scriptDate,
        partNumber,
        totalParts,
        baseUrl,
      );
    }),
  );

  // Generate YouTube script for Sunday (covers the full week's theme)
  const youtubeDate = new Date(weekStartDate);
  youtubeDate.setDate(youtubeDate.getDate() + 6); // Sunday
  const youtubeScript = await generateYouTubeScript(
    theme,
    facets,
    youtubeDate,
    baseUrl,
  );

  return {
    theme,
    tiktokScripts,
    youtubeScript,
    weekStartDate,
  };
}

/**
 * Generate and save scripts to database
 */
export async function generateAndSaveWeeklyScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = 'https://lunary.app',
): Promise<WeeklyVideoScripts> {
  await ensureVideoScriptsTable();

  const scripts = await generateWeeklyVideoScripts(
    weekStartDate,
    themeIndex,
    baseUrl,
  );

  // Save TikTok scripts
  for (const script of scripts.tiktokScripts) {
    await saveVideoScript(script);
  }

  // Save YouTube script
  await saveVideoScript(scripts.youtubeScript);

  return scripts;
}

/**
 * Video Script Generator
 *
 * Generates TikTok (60-90s) and YouTube (5-7min) scripts from weekly themes.
 * Scripts are educational, informative, and not conversational.
 */

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

// ============================================================================
// TYPES
// ============================================================================

export interface ScriptSection {
  name: string;
  duration: string;
  content: string;
}

export interface TikTokMetadata {
  theme: string; // Uppercase category e.g. "ASTROLOGY"
  title: string; // Facet title with part number e.g. "The Four Elements · 1/3"
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
      metadata, cover_image_url, part_number
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
      ${script.partNumber || null}
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
// TIKTOK SCRIPT GENERATOR (60-90 seconds, ~150-200 words)
// ============================================================================

export function generateTikTokScript(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate: Date,
  partNumber: number = 1,
  baseUrl: string = '',
): VideoScript {
  const grimoireData = getGrimoireDataForFacet(facet);

  // Build sections based on available data
  const sections: ScriptSection[] = [];

  // HOOK (5s, ~15 words)
  const hookContent = buildTikTokHook(facet, theme, grimoireData);
  sections.push({
    name: 'Hook',
    duration: '5 seconds',
    content: hookContent,
  });

  // TOPIC INTRODUCTION (10s, ~25 words)
  const introContent = buildTikTokIntro(facet, theme, grimoireData);
  sections.push({
    name: 'Topic Introduction',
    duration: '10 seconds',
    content: introContent,
  });

  // CORE CONTENT (50-60s, ~100-120 words)
  const coreContent = buildTikTokCore(facet, theme, grimoireData);
  sections.push({
    name: 'Core Content',
    duration: '50-60 seconds',
    content: coreContent,
  });

  // TAKEAWAY (10s, ~25 words) - includes series callback with part number
  const takeawayContent = buildTikTokTakeaway(
    facet,
    theme,
    grimoireData,
    partNumber,
  );
  sections.push({
    name: 'Takeaway',
    duration: '10 seconds',
    content: takeawayContent,
  });

  // Combine into full script
  const fullScript = sections.map((s) => s.content).join('\n\n');
  const wordCount = countWords(fullScript);

  // Generate TikTok-specific metadata and cover image
  const metadata = generateTikTokMetadata(facet, theme, partNumber);
  const coverImageUrl = generateCoverImageUrl(
    facet,
    theme,
    partNumber,
    baseUrl,
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
    partNumber,
  };
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
): string {
  if (data?.description) {
    // Take first sentence or two
    const sentences = data.description.split(/[.!?]+/).filter(Boolean);
    const intro = sentences.slice(0, 2).join('. ') + '.';
    return intro.length > 150 ? sentences[0] + '.' : intro;
  }

  return facet.focus;
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
        meaning.length > 200 ? meaning.substring(0, 200) + '...' : meaning;
      points.push(shortened);
    }
    if (data.strengths && Array.isArray(data.strengths)) {
      points.push(
        `Strengths include ${data.strengths.slice(0, 2).join(' and ')}.`,
      );
    }
  }

  // Fill with focus content if needed
  if (points.length < 3) {
    points.push(facet.focus);
  }

  return points.join(' ');
}

function buildTikTokTakeaway(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
): string {
  // Single memorable insight
  let takeaway = '';

  if (data?.affirmation) {
    takeaway = data.affirmation;
  } else {
    takeaway = facet.shortFormHook;
  }

  // Add specific series callback with part number and facet title
  const seriesLine = `Part ${partNumber} of 3: ${facet.title}. This week's theme: ${theme.name}.`;

  return `${takeaway}\n\n${seriesLine}`;
}

/**
 * Generate TikTok overlay metadata for video template
 */
function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
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
    title: `${facet.title} · ${partNumber}/3`,
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
): string {
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(`Part ${partNumber} of 3`);
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

export function generateYouTubeScript(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  weekStartDate: Date,
  baseUrl: string = '',
): VideoScript {
  const sections: ScriptSection[] = [];

  // Gather all Grimoire data for the week's facets
  const allData = facets.map((f) => ({
    facet: f,
    data: getGrimoireDataForFacet(f),
  }));

  // INTRO HOOK (30s, ~70 words)
  sections.push({
    name: 'Introduction',
    duration: '30 seconds',
    content: buildYouTubeIntro(theme, allData),
  });

  // TOPIC OVERVIEW (45s, ~100 words)
  sections.push({
    name: 'Topic Overview',
    duration: '45 seconds',
    content: buildYouTubeOverview(theme, facets),
  });

  // SECTION 1: FOUNDATIONS (90s, ~200 words)
  sections.push({
    name: 'Section 1: Foundations',
    duration: '90 seconds',
    content: buildYouTubeFoundations(theme, allData.slice(0, 3)),
  });

  // SECTION 2: DEEPER MEANING (90s, ~200 words)
  sections.push({
    name: 'Section 2: Deeper Meaning',
    duration: '90 seconds',
    content: buildYouTubeDeeperMeaning(theme, allData.slice(2, 5)),
  });

  // SECTION 3: PRACTICAL APPLICATION (90s, ~200 words)
  sections.push({
    name: 'Section 3: Practical Application',
    duration: '90 seconds',
    content: buildYouTubePractical(theme, allData.slice(4, 7)),
  });

  // SUMMARY (30s, ~70 words)
  sections.push({
    name: 'Summary',
    duration: '30 seconds',
    content: buildYouTubeSummary(theme, facets),
  });

  // OUTRO (15s, ~35 words)
  sections.push({
    name: 'Outro',
    duration: '15 seconds',
    content: buildYouTubeOutro(theme),
  });

  const fullScript = sections
    .map((s) => `[${s.name}]\n${s.content}`)
    .join('\n\n---\n\n');
  const wordCount = countWords(fullScript);

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
 * Returns 3 TikTok scripts (Mon, Wed, Fri) and 1 YouTube script (Sunday)
 */
export function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
): WeeklyVideoScripts {
  // Get the theme for this week
  const theme = categoryThemes[themeIndex % categoryThemes.length];
  const facets = theme.facets;

  // Generate TikTok scripts for Monday, Wednesday, Friday
  // Part numbers: 1/3, 2/3, 3/3
  const tiktokDays = [0, 2, 4]; // Mon, Wed, Fri (facets 0, 2, 4)
  const tiktokScripts: VideoScript[] = tiktokDays.map((dayOffset, index) => {
    const facet = facets[dayOffset] || facets[0];
    const scriptDate = new Date(weekStartDate);
    scriptDate.setDate(scriptDate.getDate() + dayOffset);
    const partNumber = index + 1; // 1, 2, 3
    return generateTikTokScript(facet, theme, scriptDate, partNumber, baseUrl);
  });

  // Generate YouTube script for Sunday (covers the full week's theme)
  const youtubeDate = new Date(weekStartDate);
  youtubeDate.setDate(youtubeDate.getDate() + 6); // Sunday
  const youtubeScript = generateYouTubeScript(
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

  const scripts = generateWeeklyVideoScripts(
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

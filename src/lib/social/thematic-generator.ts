/**
 * Thematic Content Generator
 *
 * Generates long-form and short-form educational content from weekly themes.
 * Uses real Grimoire data - no AI generation for the core content.
 */

import {
  type WeeklyTheme,
  type SabbatTheme,
  type DailyFacet,
  generateHashtags,
  getWeeklyContentPlan,
  categoryThemes,
} from './weekly-themes';
import {
  searchGrimoireForTopic,
  getGrimoireSnippetBySlug,
} from './grimoire-content';

// Import data sources
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import chakras from '@/data/chakras.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';
import correspondences from '@/data/correspondences.json';

export interface ThematicContent {
  longForm: string;
  shortForm: string;
  hashtags: {
    domain: string;
    topic: string;
    brand: string;
  };
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  date: Date;
}

export interface LongFormContent {
  title: string;
  body: string;
  attribution: string;
}

export interface VideoScriptContext {
  intro?: string;
  overview?: string;
  foundations?: string;
  deeperMeaning?: string;
  practical?: string;
  summary?: string;
  themeName: string;
  facetTitles: string[];
}

/**
 * Platform configuration for hashtag usage
 * All platforms now use exactly 3 hashtags
 */
const platformHashtagConfig: Record<
  string,
  { useHashtags: boolean; count: number }
> = {
  instagram: { useHashtags: true, count: 3 },
  pinterest: { useHashtags: true, count: 3 },
  tiktok: { useHashtags: true, count: 3 },
  facebook: { useHashtags: true, count: 3 },
  linkedin: { useHashtags: true, count: 3 },
  twitter: { useHashtags: true, count: 2 },
  bluesky: { useHashtags: true, count: 3 },
  threads: { useHashtags: false, count: 0 },
  reddit: { useHashtags: true, count: 3 },
};

/**
 * Get rich content data for a facet from Grimoire sources
 */
function getGrimoireDataForFacet(
  facet: DailyFacet,
): Record<string, any> | null {
  const slug = facet.grimoireSlug;
  const normalizedSlug = slug.includes('#') ? slug.replace('#', '/') : slug;

  if (slug.includes('birth-chart/houses')) {
    const housesSnippet =
      getGrimoireSnippetBySlug('houses') ||
      getGrimoireSnippetBySlug('birth-chart/houses');
    if (housesSnippet) {
      const fullContent = housesSnippet.fullContent || {};
      return {
        ...fullContent,
        description: fullContent.description || housesSnippet.summary,
        title: housesSnippet.title,
        keywords: fullContent.keywords || housesSnippet.keyPoints,
      };
    }
  }

  const exactSnippet =
    getGrimoireSnippetBySlug(normalizedSlug) ||
    getGrimoireSnippetBySlug(slug.split('#')[0]);
  if (exactSnippet) {
    const fullContent = exactSnippet.fullContent || {};
    return {
      ...fullContent,
      description: fullContent.description || exactSnippet.summary,
      title: exactSnippet.title,
      keywords: fullContent.keywords || exactSnippet.keyPoints,
    };
  }

  // Try zodiac signs
  if (slug.includes('zodiac/')) {
    const sign = slug.split('/').pop();
    if (sign && zodiacSigns[sign as keyof typeof zodiacSigns]) {
      return zodiacSigns[sign as keyof typeof zodiacSigns];
    }
  }

  // Try planets
  if (slug.includes('planets/')) {
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
        numerology.angelNumbers[num as keyof typeof numerology.angelNumbers];
      if (angelNum) return angelNum;
    }
  }

  // Try correspondences/elements
  if (slug.includes('correspondences/elements')) {
    const elementKey = slug.split('/').pop() || '';
    const elementData =
      correspondences.elements[
        elementKey as keyof typeof correspondences.elements
      ];
    if (elementData) {
      return { ...elementData, name: elementKey };
    }

    const elementEntries = Object.entries(correspondences.elements);
    if (elementEntries.length > 0) {
      const elementDescriptions = elementEntries
        .map(([name, data]) => `${name}: ${data.description}`)
        .join('\n\n');
      return {
        description:
          'The four classical elements are the foundation of astrological and magical correspondences. Each element carries a distinct temperament and set of associations.',
        details: elementDescriptions,
      };
    }
  }

  // Fallback: try Grimoire search
  const snippets = searchGrimoireForTopic(facet.title, 1);
  if (snippets.length > 0 && snippets[0].fullContent) {
    return snippets[0].fullContent;
  }

  return null;
}

/**
 * Generate long-form content based on video script
 * Creates a readable summary that mirrors the video narrative with searchable keywords
 */
export function generateVideoBasedLongFormContent(
  facet: DailyFacet,
  theme: WeeklyTheme | SabbatTheme,
  videoScript: VideoScriptContext,
): LongFormContent {
  const data = getGrimoireDataForFacet(facet);
  let title = facet.title;
  let body = '';

  // Intro: Brief mention of week's theme
  if (videoScript.intro) {
    // Convert spoken language to written form
    const introText = videoScript.intro
      .replace(/Today, we explore/g, 'This week explores')
      .replace(/Today we explore/g, 'This week explores')
      .replace(/we explore/g, 'we explore')
      .replace(/\.$/, '');
    body += `${introText}.\n\n`;
  }

  // Overview: Topics covered
  if (videoScript.overview) {
    const overviewText = videoScript.overview
      .replace(/This deep dive covers/g, 'This exploration covers')
      .replace(/We begin with/g, 'Beginning with')
      .replace(/we begin with/g, 'beginning with');
    body += `${overviewText}\n\n`;
  }

  // Foundations: Core concepts (focus on this facet if mentioned)
  if (videoScript.foundations) {
    // Extract sentences related to this facet's topic
    const facetKeywords = facet.title.toLowerCase().split(' ');
    const foundationSentences = videoScript.foundations
      .split(/[.!?]+/)
      .filter((s) => {
        const lower = s.toLowerCase();
        return facetKeywords.some((kw) => lower.includes(kw));
      });

    if (foundationSentences.length > 0) {
      body += foundationSentences.slice(0, 2).join('. ') + '.\n\n';
    } else if (data?.description) {
      // Fallback to Grimoire data if facet not in foundations
      body += data.description.split('.').slice(0, 2).join('.') + '.\n\n';
    }
  }

  // Deeper Meaning: Symbolic/interpretive layers
  if (videoScript.deeperMeaning) {
    const deeperSentences = videoScript.deeperMeaning
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .slice(0, 2);
    if (deeperSentences.length > 0) {
      body += deeperSentences.join('. ') + '.\n\n';
    }
  } else if (data?.mysticalProperties || data?.meaning) {
    body += (data.mysticalProperties || data.meaning) + '\n\n';
  }

  // Practical Application: How to use/apply
  if (videoScript.practical) {
    const practicalSentences = videoScript.practical
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .slice(0, 2);
    if (practicalSentences.length > 0) {
      body += practicalSentences.join('. ') + '.\n\n';
    }
  } else if (data?.healingPractices && data.healingPractices.length > 0) {
    body +=
      'Practical applications: ' +
      data.healingPractices.slice(0, 3).join(', ') +
      '.\n\n';
  }

  // Summary: Key takeaways
  if (videoScript.summary) {
    const summaryText = videoScript.summary
      .replace(/To summarize:/g, 'In summary,')
      .replace(/we have explored/g, 'this covers');
    body += summaryText + '\n\n';
  }

  // Add searchable keywords from Grimoire data
  const keywords: string[] = [];
  if (data?.keywords && Array.isArray(data.keywords)) {
    keywords.push(...data.keywords.slice(0, 3));
  }
  if (data?.element) keywords.push(data.element);
  if (data?.rulingPlanet || data?.ruler) {
    keywords.push(data.rulingPlanet || data.ruler);
  }

  // Integrate keywords naturally if not already mentioned
  if (
    keywords.length > 0 &&
    !body.toLowerCase().includes(keywords[0].toLowerCase())
  ) {
    body += `Key concepts include ${keywords.slice(0, 2).join(' and ')}.\n\n`;
  }

  // Clean up extra whitespace
  body = body.trim().replace(/\n{3,}/g, '\n\n');

  return {
    title,
    body,
    attribution: "From Lunary's Grimoire",
  };
}

/**
 * Generate long-form educational content (300-500 words)
 * Calm, authoritative, encyclopedic tone
 * Optionally uses video script context if provided
 */
export function generateLongFormContent(
  facet: DailyFacet,
  theme: WeeklyTheme | SabbatTheme,
  videoScript?: VideoScriptContext,
): LongFormContent {
  // Use video script if provided
  if (videoScript) {
    return generateVideoBasedLongFormContent(facet, theme, videoScript);
  }
  const data = getGrimoireDataForFacet(facet);

  let title = facet.title;
  let body = '';

  if (data) {
    // Build structured content from real data

    // Opening definition/explanation
    if (data.description) {
      body += data.description + '\n\n';
    } else if (data.mysticalProperties) {
      body += data.mysticalProperties + '\n\n';
    } else if (data.information) {
      body += data.information + '\n\n';
    }

    // Key attributes section
    const attributes: string[] = [];

    if (data.element) attributes.push(`Element: ${data.element}`);
    if (data.modality) attributes.push(`Modality: ${data.modality}`);
    if (data.rulingPlanet) attributes.push(`Ruler: ${data.rulingPlanet}`);
    if (data.planet) attributes.push(`Planet: ${data.planet}`);
    if (data.symbol) attributes.push(`Symbol: ${data.symbol}`);
    if (data.color) attributes.push(`Color: ${data.color}`);
    if (data.sanskritName) attributes.push(`Sanskrit: ${data.sanskritName}`);
    if (data.location) attributes.push(`Location: ${data.location}`);
    if (data.number !== undefined) attributes.push(`Number: ${data.number}`);
    if (data.zodiacSign) attributes.push(`Sign: ${data.zodiacSign}`);

    if (attributes.length > 0) {
      body += attributes.join('\n') + '\n\n';
    }

    // Deeper interpretation
    if (data.uprightMeaning) {
      body += 'When expressed positively: ' + data.uprightMeaning + '\n\n';
    }

    if (data.reversedMeaning) {
      body +=
        'When blocked or imbalanced: ' +
        data.reversedMeaning.split('.').slice(0, 2).join('.') +
        '.\n\n';
    }

    if (data.spiritualMeaning) {
      body += data.spiritualMeaning + '\n\n';
    }

    if (data.details) {
      body += data.details + '\n\n';
    }

    if (data.loveTrait || data.loveMeaning) {
      body +=
        'In relationships: ' + (data.loveTrait || data.loveMeaning) + '\n\n';
    }

    if (data.careerTrait || data.careerMeaning) {
      body +=
        'In work and purpose: ' +
        (data.careerTrait || data.careerMeaning) +
        '\n\n';
    }

    // Practical application
    if (data.healingPractices && data.healingPractices.length > 0) {
      body +=
        'Practices for balance: ' +
        data.healingPractices.slice(0, 4).join(', ') +
        '.\n\n';
    }

    if (data.traditions && data.traditions.length > 0) {
      body +=
        'Traditional observances: ' +
        data.traditions.slice(0, 3).join(', ') +
        '.\n\n';
    }

    if (data.magicalUses && data.magicalUses.length > 0) {
      body +=
        'Magical applications: ' +
        data.magicalUses.slice(0, 3).join(', ') +
        '.\n\n';
    }

    // Reflective closing
    if (data.affirmation) {
      body += '"' + data.affirmation + '"';
    }
  } else {
    // Fallback: use facet focus as body
    body = facet.focus;
  }

  // Ensure educational depth for sparse facets (glossary entries, etc.)
  if (body.trim().length < 220) {
    const expansions: string[] = [];
    if (facet.focus) {
      expansions.push(facet.focus);
    }
    if (facet.shortFormHook) {
      expansions.push(facet.shortFormHook);
    }
    body = [body, ...expansions].filter(Boolean).join('\n\n');
  }

  // Clean up extra whitespace
  body = body.trim().replace(/\n{3,}/g, '\n\n');

  return {
    title,
    body,
    attribution: "From Lunary's Grimoire",
  };
}

/**
 * Generate short-form content (1-2 sentences)
 * Encyclopedic, stands alone, no questions or CTAs
 */
export function generateShortFormContent(facet: DailyFacet): string {
  // Use the pre-defined short-form hook from the facet
  return facet.shortFormHook;
}

/**
 * Format long-form content for a specific platform
 */
export function formatLongFormForPlatform(
  content: LongFormContent,
  hashtags: { domain: string; topic: string; brand: string },
  platform: string,
): string {
  const config = platformHashtagConfig[platform] || {
    useHashtags: false,
    count: 0,
  };

  const cleanedBody = content.body
    .split('\n')
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.toLowerCase().includes("lunary's grimoire") &&
        !(
          line.toLowerCase().includes('explore') &&
          line.toLowerCase().includes('grimoire')
        ) &&
        !line.toLowerCase().includes('grimoire'),
    )
    .join('\n');

  let formatted = cleanedBody.trim();

  // Add attribution
  formatted += `\n\n${content.attribution}`;

  // Add hashtags if platform supports them
  if (config.useHashtags && config.count > 0) {
    const tags = [hashtags.domain, hashtags.topic, hashtags.brand].slice(
      0,
      config.count,
    );
    formatted += '\n\n' + tags.join(' ');
  }

  return formatted;
}

/**
 * Format short-form content for a specific platform
 * Now includes hashtags (3) for all platforms
 */
export function formatShortFormForPlatform(
  content: string,
  platform: string,
  hashtags?: { domain: string; topic: string; brand: string },
): string {
  const config = platformHashtagConfig[platform] || {
    useHashtags: true,
    count: 3,
  };

  let formatted = content;

  // Add hashtags if platform supports them and hashtags are provided
  if (config.useHashtags && config.count > 0 && hashtags) {
    const tags = [hashtags.domain, hashtags.topic, hashtags.brand].slice(
      0,
      config.count,
    );
    formatted += '\n\n' + tags.join(' ');
  }

  return formatted;
}

/**
 * Generate all content for a single day
 */
export function generateDayContent(
  date: Date,
  theme: WeeklyTheme | SabbatTheme,
  facet: DailyFacet,
  videoScript?: VideoScriptContext,
): ThematicContent {
  const longFormData = generateLongFormContent(facet, theme, videoScript);
  const shortForm = generateShortFormContent(facet);
  const hashtags = generateHashtags(theme, facet);

  return {
    longForm: `${longFormData.title}\n\n${longFormData.body}\n\n${longFormData.attribution}`,
    shortForm,
    hashtags,
    theme,
    facet,
    date,
  };
}

/**
 * Generate content for an entire week
 */
export function generateWeekContent(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
  videoScript?: VideoScriptContext,
  facetOffset: number = 0,
): ThematicContent[] {
  const plan = getWeeklyContentPlan(
    weekStartDate,
    currentThemeIndex,
    facetOffset,
  );

  return plan.map(({ date, theme, facet }) =>
    generateDayContent(date, theme, facet, videoScript),
  );
}

/**
 * Get posts ready for database insertion
 */
export interface ThematicPost {
  content: string;
  platform: string;
  postType: 'educational' | 'closing_ritual';
  topic: string;
  scheduledDate: Date;
  hashtags: string;
  category: string;
  slug: string;
  dayOffset: number;
}

type ClosingRitualStyle = 'long' | 'short';

const CLOSING_RITUAL_HASHTAGS = '#closingritual #sundaypause #lunarbreath';

function getClosingThemeDescriptor(
  themeName?: string,
  shortForm?: boolean,
): string {
  if (!themeName) {
    return shortForm
      ? 'Let the night soften this pause.'
      : 'Let the night keep you steady as you close the week.';
  }

  const normalized = themeName.toLowerCase();
  return shortForm
    ? `Let ${normalized} soften this pause.`
    : `This week's ${normalized} energy invites a slow, conscious ending.`;
}

function buildClosingRitualContent(
  themeName: string | undefined,
  style: ClosingRitualStyle,
): string {
  const descriptor = getClosingThemeDescriptor(themeName, style === 'short');

  if (style === 'long') {
    return `Sunday closing ritual • Pause with the twilight, breathe slowly, and release what no longer serves. ${descriptor} Keep returning to the stars for steadying breath.`;
  }

  return `Sunday closing ritual: breathe slow, release, rest. ${descriptor}`;
}

export function generateThematicPostsForWeek(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
  videoScript?: VideoScriptContext,
  facetOffset: number = 0,
): ThematicPost[] {
  const weekContent = generateWeekContent(
    weekStartDate,
    currentThemeIndex,
    videoScript,
    facetOffset,
  );
  const posts: ThematicPost[] = [];

  // Long-form platforms (educational depth, images)
  const longFormPlatforms = ['linkedin', 'pinterest', 'facebook'];
  // Short-form platforms (1-2 sentences, with hashtags and images)
  const shortFormPlatforms = ['twitter', 'bluesky', 'threads'];

  for (const dayContent of weekContent) {
    // Long-form posts
    for (const platform of longFormPlatforms) {
      const longFormData = generateLongFormContent(
        dayContent.facet,
        dayContent.theme,
      );
      const formattedContent = formatLongFormForPlatform(
        longFormData,
        dayContent.hashtags,
        platform,
      );

      posts.push({
        content: formattedContent,
        platform,
        postType: 'educational',
        topic: dayContent.facet.title,
        scheduledDate: dayContent.date,
        hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
        category: dayContent.theme.category,
        dayOffset:
          dayContent.date.getDay() === 0 ? 6 : dayContent.date.getDay() - 1,
        slug:
          dayContent.facet.grimoireSlug.split('/').pop() ||
          dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
      });
    }

    // Short-form posts (now with hashtags and images)
    for (const platform of shortFormPlatforms) {
      const formattedContent = formatShortFormForPlatform(
        dayContent.shortForm,
        platform,
        dayContent.hashtags,
      );

      posts.push({
        content: formattedContent,
        platform,
        postType: 'educational',
        topic: dayContent.facet.title,
        scheduledDate: dayContent.date,
        hashtags: `${dayContent.hashtags.domain} ${dayContent.hashtags.topic}`,
        category: dayContent.theme.category,
        dayOffset:
          dayContent.date.getDay() === 0 ? 6 : dayContent.date.getDay() - 1,
        slug:
          dayContent.facet.grimoireSlug.split('/').pop() ||
          dayContent.facet.title.toLowerCase().replace(/\s+/g, '-'),
      });
    }
  }

  if (weekContent.length > 0) {
    const closingRitualDate = new Date(weekStartDate);
    closingRitualDate.setDate(closingRitualDate.getDate() + 6);
    closingRitualDate.setHours(20, 0, 0, 0);
    const closingThemeName = weekContent[0]?.theme?.name;
    const closingPlatforms = Array.from(
      new Set([...longFormPlatforms, ...shortFormPlatforms]),
    );

    for (const platform of closingPlatforms) {
      const style: ClosingRitualStyle = longFormPlatforms.includes(platform)
        ? 'long'
        : 'short';
      posts.push({
        content: buildClosingRitualContent(closingThemeName, style),
        platform,
        postType: 'closing_ritual',
        topic: 'closing ritual',
        scheduledDate: new Date(closingRitualDate),
        hashtags: CLOSING_RITUAL_HASHTAGS,
        category: 'ritual',
        dayOffset: 6,
        slug: 'closing-ritual',
      });
    }
  }

  return posts;
}

/**
 * Track theme rotation to prevent repeats
 */
export async function getNextThemeIndex(sql: any): Promise<number> {
  try {
    // Ensure rotation table exists
    await sql`
      CREATE TABLE IF NOT EXISTS content_rotation (
        id SERIAL PRIMARY KEY,
        rotation_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE,
        use_count INTEGER DEFAULT 0,
        UNIQUE(rotation_type, item_id)
      )
    `;

    // Get all theme usage
    const result = await sql`
      SELECT item_id, use_count, last_used_at
      FROM content_rotation
      WHERE rotation_type = 'theme'
      ORDER BY use_count ASC, last_used_at ASC NULLS FIRST
    `;

    // If no records, start with first theme
    if (result.rows.length === 0) {
      return 0;
    }

    // Find themes not yet used
    const usedThemeIds = new Set(result.rows.map((r: any) => r.item_id));
    for (let i = 0; i < categoryThemes.length; i++) {
      if (!usedThemeIds.has(categoryThemes[i].id)) {
        return i;
      }
    }

    // All themes used at least once - find lowest use count
    const lowestUseCount = result.rows[0].use_count;
    const candidateIds = result.rows
      .filter((r: any) => r.use_count === lowestUseCount)
      .map((r: any) => r.item_id);

    // Return index of first candidate
    for (let i = 0; i < categoryThemes.length; i++) {
      if (candidateIds.includes(categoryThemes[i].id)) {
        return i;
      }
    }

    return 0;
  } catch (error) {
    console.warn('Failed to get theme index from rotation table:', error);
    return 0;
  }
}

/**
 * Record theme usage
 */
export async function recordThemeUsage(
  sql: any,
  themeId: string,
): Promise<void> {
  try {
    await sql`
      INSERT INTO content_rotation (rotation_type, item_id, last_used_at, use_count)
      VALUES ('theme', ${themeId}, NOW(), 1)
      ON CONFLICT (rotation_type, item_id)
      DO UPDATE SET
        last_used_at = NOW(),
        use_count = content_rotation.use_count + 1
    `;
  } catch (error) {
    console.warn('Failed to record theme usage:', error);
  }
}

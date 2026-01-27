import {
  getEducationalContent,
  type GrimoireSnippet,
  type TopicSelectionStrategy,
  getGrimoireSnippetBySlug,
} from './grimoire-content';

export interface EducationalPost {
  content: string;
  grimoireSnippet: GrimoireSnippet;
  imageUrl?: string;
}

/**
 * Platform-specific formatting rules
 */
interface PlatformConfig {
  maxChars: number;
  useEmojis: boolean;
  style: 'short' | 'long';
  emojiFrequency: 'none' | 'minimal' | 'moderate';
}

const platformConfigs: Record<string, PlatformConfig> = {
  twitter: {
    maxChars: 280,
    useEmojis: false,
    style: 'short',
    emojiFrequency: 'none',
  },
  bluesky: {
    maxChars: 300,
    useEmojis: false,
    style: 'short',
    emojiFrequency: 'none',
  },
  instagram: {
    maxChars: 2200,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
  facebook: {
    maxChars: 63206,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
  linkedin: {
    maxChars: 3000,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
  pinterest: {
    maxChars: 500,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
  tiktok: {
    maxChars: 2200,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
  reddit: {
    maxChars: 40000,
    useEmojis: false,
    style: 'long',
    emojiFrequency: 'none',
  },
};

/**
 * Sabbat dates (month/day - works for any year)
 */
const sabbatDates: Record<string, { month: number; day: number }> = {
  samhain: { month: 10, day: 31 },
  yule: { month: 12, day: 21 },
  imbolc: { month: 2, day: 1 },
  ostara: { month: 3, day: 20 },
  beltane: { month: 5, day: 1 },
  litha: { month: 6, day: 21 },
  lughnasadh: { month: 8, day: 1 },
  mabon: { month: 9, day: 22 },
};

export interface UpcomingSabbat {
  name: string;
  date: Date;
  daysAway: number;
}

/**
 * Zodiac sign emojis
 */
const zodiacEmojis: Record<string, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

/**
 * Check if today is a sabbat day
 */
function isSabbatDay(sabbatName: string): boolean {
  const today = new Date();
  const sabbat = sabbatDates[sabbatName.toLowerCase()];
  if (!sabbat) return false;
  return (
    today.getMonth() + 1 === sabbat.month && today.getDate() === sabbat.day
  );
}

/**
 * Check if a snippet is a sabbat
 */
function isSabbatContent(snippet: GrimoireSnippet): boolean {
  return (
    snippet.category === 'season' ||
    snippet.slug.includes('sabbat') ||
    snippet.slug.includes('wheel-of-the-year') ||
    Object.keys(sabbatDates).some((s) => snippet.slug.toLowerCase().includes(s))
  );
}

/**
 * Get sabbat name from snippet
 */
function getSabbatName(snippet: GrimoireSnippet): string | null {
  for (const sabbatName of Object.keys(sabbatDates)) {
    if (
      snippet.slug.toLowerCase().includes(sabbatName) ||
      snippet.title.toLowerCase().includes(sabbatName)
    ) {
      return sabbatName;
    }
  }
  return null;
}

/**
 * Get specific zodiac emoji from slug/title
 */
function getZodiacEmoji(slug: string, title: string): string {
  const text = (slug + ' ' + title).toLowerCase();
  for (const [sign, emoji] of Object.entries(zodiacEmojis)) {
    if (text.includes(sign)) {
      return emoji;
    }
  }
  return '♈'; // Default to Aries
}

/**
 * Get emoji for content category (used sparingly on long-form)
 */
function getCategoryEmoji(
  category: string,
  slug: string,
  title: string,
): string {
  // Zodiac - use specific sign emoji
  if (category === 'zodiac') {
    return getZodiacEmoji(slug, title);
  }
  // Runes
  if (slug.includes('rune')) {
    return 'ᚱ';
  }
  // Sabbats
  if (category === 'season' || slug.includes('sabbat')) {
    return '☽';
  }
  // Others - no emoji prefix (keeping content clean)
  return '';
}

/**
 * Build short-form post (Twitter/Bluesky style) - flows directly into content
 */
function buildShortPost(
  snippet: GrimoireSnippet,
  config: PlatformConfig,
): string {
  // Get the main educational content
  let content = '';

  if (snippet.fullContent?.description) {
    // Use the rich description, taking first 1-2 sentences
    const sentences = snippet.fullContent.description
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.length > 10);
    content = sentences.slice(0, 2).join(' ');
  } else if (snippet.keyPoints.length > 0) {
    // Strip any emojis from key points
    content = snippet.keyPoints[0]
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/^[✨💫🌟☆★◉△☽☿🃏💎]/u, '')
      .trim();
  } else if (snippet.summary) {
    content = snippet.summary;
  }

  // Truncate to fit character limit (no link, pure content)
  if (content.length > config.maxChars) {
    content = content.substring(0, config.maxChars - 3) + '...';
  }

  return content;
}

/**
 * Build long-form educational post
 */
function buildLongPost(
  snippet: GrimoireSnippet,
  config: PlatformConfig,
): string {
  const parts: string[] = [];
  const useEmoji = config.useEmojis && config.emojiFrequency !== 'none';
  const softLimit = Math.min(config.maxChars * 0.85, config.maxChars - 40);
  const canAddMore = () => parts.join('').length < softLimit;
  const appendSection = (text?: string) => {
    if (!text || !canAddMore()) return;
    parts.push(text);
    parts.push('');
  };

  // Title - with emoji prefix only for zodiac, runes, sabbats
  if (useEmoji) {
    const emoji = getCategoryEmoji(
      snippet.category,
      snippet.slug,
      snippet.title,
    );
    if (emoji) {
      parts.push(`${emoji} ${snippet.title}`);
    } else {
      parts.push(snippet.title);
    }
  } else {
    parts.push(snippet.title);
  }
  parts.push('');

  // Main educational content - use full description
  if (snippet.fullContent?.description) {
    parts.push(snippet.fullContent.description);
    parts.push('');
  } else if (snippet.summary) {
    parts.push(snippet.summary);
    parts.push('');
  }

  // Additional educational depth based on content type
  const fc = snippet.fullContent;
  const keyPointSource = snippet.keyPoints?.filter(Boolean) || [];
  const keyPoints =
    fc?.keywords && fc.keywords.length > 0
      ? fc.keywords
      : keyPointSource.length > 0
        ? keyPointSource
        : [];

  if (keyPoints.length > 0 && canAddMore()) {
    appendSection(`Key themes: ${keyPoints.slice(0, 4).join(', ')}.`);
  }

  if (fc) {
    // Element/Planet info
    if (fc.element && fc.planet) {
      parts.push(
        `${snippet.title} is a ${fc.element} sign ruled by ${fc.planet}.`,
      );
      parts.push('');
    }

    // Spiritual meaning
    appendSection(fc.spiritualMeaning);

    // Upright meaning (tarot/runes)
    appendSection(
      fc.uprightMeaning ? `When upright: ${fc.uprightMeaning}` : undefined,
    );

    // Reversed meaning (tarot/runes)
    if (fc.reversedMeaning && canAddMore()) {
      appendSection(`When reversed: ${fc.reversedMeaning}`);
    }

    // Metaphysical properties (crystals)
    appendSection(fc.metaphysicalProperties);

    // Historical context
    appendSection(fc.history);

    // Love meaning
    appendSection(
      fc.loveTrait ? `In love and relationships: ${fc.loveTrait}` : undefined,
    );

    // Career meaning
    appendSection(fc.careerTrait ? `In career: ${fc.careerTrait}` : undefined);

    // Healing practices (chakras)
    if (fc.healingPractices && fc.healingPractices.length > 0) {
      appendSection(
        'Healing practices: ' +
          fc.healingPractices.slice(0, 4).join(', ') +
          '.',
      );
    }

    // Traditions (sabbats)
    if (fc.traditions && fc.traditions.length > 0) {
      appendSection(
        'Traditional practices: ' + fc.traditions.slice(0, 3).join(', ') + '.',
      );
    }

    // Magical uses
    if (fc.magicalUses && fc.magicalUses.length > 0 && canAddMore()) {
      appendSection(
        'Magical uses: ' + fc.magicalUses.slice(0, 3).join(', ') + '.',
      );
    }

    if (fc.symbolism && canAddMore()) {
      appendSection(`Symbolism: ${fc.symbolism}`);
    }

    if (fc.colors && fc.colors.length > 0 && canAddMore()) {
      appendSection(`Associated colors: ${fc.colors.slice(0, 4).join(', ')}.`);
    }

    if (fc.herbs && fc.herbs.length > 0 && canAddMore()) {
      appendSection(`Herbs: ${fc.herbs.slice(0, 4).join(', ')}.`);
    }

    if (fc.rituals && fc.rituals.length > 0 && canAddMore()) {
      appendSection(`Rituals: ${fc.rituals.slice(0, 3).join(', ')}.`);
    }

    // Affirmation at the end
    if (fc.affirmation && canAddMore()) {
      parts.push(`"${fc.affirmation}"`);
    }
  }

  let content = parts.join('\n').trim();

  // Trim to limit if exceeded
  if (content.length > config.maxChars) {
    // Remove sections from the end until within limit
    while (parts.length > 4 && parts.join('\n').length > config.maxChars) {
      parts.pop();
    }
    content = parts.join('\n').trim();

    if (content.length > config.maxChars) {
      content = content.substring(0, config.maxChars - 3) + '...';
    }
  }

  return content;
}

/**
 * Condense Grimoire content into platform-appropriate post
 */
function condenseToSocialPost(
  snippet: GrimoireSnippet,
  platform: string,
): string {
  const config = platformConfigs[platform] || platformConfigs.instagram;

  if (config.style === 'short') {
    return buildShortPost(snippet, config);
  }

  return buildLongPost(snippet, config);
}

/**
 * Filter out sabbats unless today is the sabbat day
 */
function filterSabbats(snippets: GrimoireSnippet[]): GrimoireSnippet[] {
  return snippets.filter((snippet) => {
    if (!isSabbatContent(snippet)) return true;

    const sabbatName = getSabbatName(snippet);
    if (!sabbatName) return false;

    return isSabbatDay(sabbatName);
  });
}

/**
 * Generate educational social media post from EXISTING Grimoire content
 */
export async function generateEducationalPost(
  platform: string,
  strategy: TopicSelectionStrategy = 'mixed',
): Promise<EducationalPost | null> {
  try {
    // Get Grimoire content
    let snippets = await getEducationalContent(strategy, 5);

    // Filter out sabbats unless today is the sabbat
    snippets = filterSabbats(snippets);

    if (snippets.length === 0) {
      // Fallback to non-sabbat content
      snippets = await getEducationalContent('trending', 3);
      snippets = filterSabbats(snippets);
    }

    if (snippets.length === 0) return null;

    const snippet = snippets[0];
    const content = condenseToSocialPost(snippet, platform);

    return {
      content,
      grimoireSnippet: snippet,
    };
  } catch (error) {
    console.error('Failed to generate educational post:', error);
    return null;
  }
}

/**
 * Generate educational post for specific topic
 */
export async function generateEducationalPostForTopic(
  topic: string,
  platform: string,
): Promise<EducationalPost | null> {
  try {
    const snippet = getGrimoireSnippetBySlug(topic);
    if (!snippet) {
      return generateEducationalPost(platform, 'random');
    }

    // Check sabbat restriction
    if (isSabbatContent(snippet)) {
      const sabbatName = getSabbatName(snippet);
      if (sabbatName && !isSabbatDay(sabbatName)) {
        // Not the right day for this sabbat
        return generateEducationalPost(platform, 'random');
      }
    }

    const content = condenseToSocialPost(snippet, platform);
    return { content, grimoireSnippet: snippet };
  } catch (error) {
    console.error('Failed to generate educational post for topic:', error);
    return null;
  }
}

/**
 * Generate multiple educational posts
 */
export async function generateEducationalPosts(
  platform: string,
  count: number = 3,
  strategy: TopicSelectionStrategy = 'mixed',
): Promise<EducationalPost[]> {
  try {
    let snippets = await getEducationalContent(strategy, count + 5);
    snippets = filterSabbats(snippets).slice(0, count);

    return snippets.map((snippet) => ({
      content: condenseToSocialPost(snippet, platform),
      grimoireSnippet: snippet,
    }));
  } catch (error) {
    console.error('Failed to generate educational posts:', error);
    return [];
  }
}

/**
 * Check if today is a specific sabbat
 */
export function getTodaysSabbat(): string | null {
  for (const [name] of Object.entries(sabbatDates)) {
    if (isSabbatDay(name)) {
      return name.charAt(0).toUpperCase() + name.slice(1);
    }
  }
  return null;
}

/**
 * Check if there's a sabbat in the next N days
 * Returns the sabbat info including the exact date for scheduling
 */
export function getUpcomingSabbat(
  daysAhead: number = 7,
): UpcomingSabbat | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  for (const [name, { month, day }] of Object.entries(sabbatDates)) {
    // Check current year
    let sabbatDate = new Date(today.getFullYear(), month - 1, day);
    sabbatDate.setHours(0, 0, 0, 0);

    // If sabbat already passed this year, check next year
    if (sabbatDate < today) {
      sabbatDate = new Date(today.getFullYear() + 1, month - 1, day);
      sabbatDate.setHours(0, 0, 0, 0);
    }

    // Check if within range
    if (sabbatDate >= today && sabbatDate <= endDate) {
      const daysAway = Math.ceil(
        (sabbatDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        date: sabbatDate,
        daysAway,
      };
    }
  }

  return null;
}

/**
 * Get all sabbats in the next N days (for weekly planning)
 */
export function getUpcomingSabbats(daysAhead: number = 7): UpcomingSabbat[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + daysAhead);

  const upcoming: UpcomingSabbat[] = [];

  for (const [name, { month, day }] of Object.entries(sabbatDates)) {
    // Check current year
    let sabbatDate = new Date(today.getFullYear(), month - 1, day);
    sabbatDate.setHours(0, 0, 0, 0);

    // If sabbat already passed this year, check next year
    if (sabbatDate < today) {
      sabbatDate = new Date(today.getFullYear() + 1, month - 1, day);
      sabbatDate.setHours(0, 0, 0, 0);
    }

    // Check if within range
    if (sabbatDate >= today && sabbatDate <= endDate) {
      const daysAway = Math.ceil(
        (sabbatDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
      );
      upcoming.push({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        date: sabbatDate,
        daysAway,
      });
    }
  }

  // Sort by date
  return upcoming.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Generate sabbat post if today is a sabbat
 */
export async function generateSabbatPostIfToday(
  platform: string,
): Promise<EducationalPost | null> {
  const sabbat = getTodaysSabbat();
  if (!sabbat) return null;

  const snippet = getGrimoireSnippetBySlug(
    `wheel-of-the-year/${sabbat.toLowerCase()}`,
  );
  if (!snippet) return null;

  const content = condenseToSocialPost(snippet, platform);
  return { content, grimoireSnippet: snippet };
}

/**
 * Generate sabbat post for an upcoming sabbat (for weekly scheduling)
 * Returns the post AND the date it should be scheduled for
 */
export async function generateUpcomingSabbatPost(
  platform: string,
  daysAhead: number = 7,
): Promise<{ post: EducationalPost; scheduledDate: Date } | null> {
  const upcomingSabbat = getUpcomingSabbat(daysAhead);
  if (!upcomingSabbat) return null;

  const snippet = getGrimoireSnippetBySlug(
    `wheel-of-the-year/${upcomingSabbat.name.toLowerCase()}`,
  );
  if (!snippet) return null;

  const content = condenseToSocialPost(snippet, platform);
  return {
    post: { content, grimoireSnippet: snippet },
    scheduledDate: upcomingSabbat.date,
  };
}

/**
 * Generate all sabbat posts for the week ahead
 * Returns posts with their scheduled dates
 */
export async function generateWeeklySabbatPosts(
  platform: string,
  daysAhead: number = 7,
): Promise<Array<{ post: EducationalPost; scheduledDate: Date }>> {
  const upcomingSabbats = getUpcomingSabbats(daysAhead);
  const posts: Array<{ post: EducationalPost; scheduledDate: Date }> = [];

  for (const sabbat of upcomingSabbats) {
    const snippet = getGrimoireSnippetBySlug(
      `wheel-of-the-year/${sabbat.name.toLowerCase()}`,
    );
    if (snippet) {
      const content = condenseToSocialPost(snippet, platform);
      posts.push({
        post: { content, grimoireSnippet: snippet },
        scheduledDate: sabbat.date,
      });
    }
  }

  return posts;
}

/**
 * Get a carousel set of posts for deep-dive on one topic
 */
export async function generateTopicCarousel(
  topic: string,
  platform: string,
): Promise<EducationalPost[]> {
  const snippet = getGrimoireSnippetBySlug(topic);
  if (!snippet || !snippet.fullContent) return [];

  // Check sabbat restriction
  if (isSabbatContent(snippet)) {
    const sabbatName = getSabbatName(snippet);
    if (sabbatName && !isSabbatDay(sabbatName)) return [];
  }

  const config = platformConfigs[platform] || platformConfigs.instagram;
  const posts: EducationalPost[] = [];
  const useEmoji = config.useEmojis;

  // Get emoji for zodiac/rune/sabbat content
  const emoji = useEmoji
    ? getCategoryEmoji(snippet.category, snippet.slug, snippet.title)
    : '';
  const titlePrefix = emoji ? `${emoji} ` : '';

  // Slide 1: Overview
  const overview = `${titlePrefix}${snippet.title}\n\n${snippet.fullContent.description || snippet.summary}\n\nSwipe to learn more`;
  posts.push({ content: overview, grimoireSnippet: snippet });

  // Slide 2: Deeper meaning
  if (
    snippet.fullContent.spiritualMeaning ||
    snippet.fullContent.uprightMeaning
  ) {
    const meaning =
      snippet.fullContent.spiritualMeaning ||
      snippet.fullContent.uprightMeaning ||
      '';
    posts.push({
      content: `${snippet.title} - Deeper Meaning\n\n${meaning}`,
      grimoireSnippet: snippet,
    });
  }

  // Slide 3: Practical application
  if (
    snippet.fullContent.healingPractices ||
    snippet.fullContent.magicalUses ||
    snippet.fullContent.traditions
  ) {
    const practices =
      snippet.fullContent.healingPractices ||
      snippet.fullContent.magicalUses ||
      snippet.fullContent.traditions ||
      [];
    posts.push({
      content: `${snippet.title} - How to Work With This\n\n${practices
        .slice(0, 5)
        .map((p) => `• ${p}`)
        .join('\n')}`,
      grimoireSnippet: snippet,
    });
  }

  // Slide 4: In relationships/career (if available)
  if (snippet.fullContent.loveTrait || snippet.fullContent.careerTrait) {
    let slideContent = `${snippet.title} - Life Areas\n\n`;
    if (snippet.fullContent.loveTrait) {
      slideContent += `In Love: ${snippet.fullContent.loveTrait}\n\n`;
    }
    if (snippet.fullContent.careerTrait) {
      slideContent += `In Career: ${snippet.fullContent.careerTrait}`;
    }
    posts.push({ content: slideContent.trim(), grimoireSnippet: snippet });
  }

  // Slide 5: Affirmation
  if (snippet.fullContent.affirmation) {
    const affirmationSlide = `${snippet.title}\n\n"${snippet.fullContent.affirmation}"`;
    posts.push({ content: affirmationSlide, grimoireSnippet: snippet });
  }

  return posts;
}

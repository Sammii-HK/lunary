/**
 * Style instructions for social post generation
 */

import type { SocialPostType } from './types';

/**
 * Voice guidelines for authentic, varied content
 */
const VOICE_GUIDELINES = `
Voice guidelines:
- Mix sentence lengths dramatically: use fragments, short punchy lines, and longer explanations
- Use concrete, specific details instead of vague metaphors
- Write like you're texting someone who asked, not writing an article
- Occasional bold claims or contrarian takes are encouraged
- Let some posts be incomplete thoughts - humans don't always wrap everything perfectly
- Vary emotional tone: excited, matter-of-fact, conspiratorial, practical, challenging
- NEVER use emojis - no emojis in any content
- Never use em dashes`;

/**
 * Banned opening patterns to force variety
 */
const BANNED_OPENINGS = `
Never start with these patterns:
- "Ever notice [X]? It's [metaphor]..."
- "Seeing/Spotting/Noticed [number] lately?"
- "Many believe..."
- "In numerology..."
- "This [topic] is..."`;

/**
 * Post type specific frameworks
 */
const POST_TYPE_FRAMEWORKS: Partial<Record<SocialPostType, string>> = {
  educational_intro: `Format for educational_intro:
- Hook with contrarian or surprising angle
- Brief, clear explanation (2-3 sentences max)
- One specific, actionable insight
- Optional: genuine question that invites specific response
- Direct and informative, skip mystical language`,

  educational_deep_1: `Format for educational_deep_1:
- Straight definition approach
- What it means in practice (not theory)
- Keep under 280 characters
- No fluff, no purple prose
- Pattern: "X means Y. Here's when it matters: [specific scenario]"`,

  educational_deep_2: `Format for educational_deep_2:
- "When you see it" situational angle
- Describe a specific life context
- What to notice or pay attention to
- More personal, less clinical
- Pattern: Start with scenario, tie to meaning`,

  educational_deep_3: `Format for educational_deep_3:
- Uncommon interpretation or deeper layer
- Challenge assumptions or add nuance
- Can be slightly contrarian
- Focus on practical application
- Pattern: "Most people think X, but actually..."`,

  persona: `Format for persona (dear [audience] + Lunary intro):
- Start with "dear [varied audience terms]" on first line
- Use varied combinations like: "witches, star gazers, astrologers, tarot readers"
- Or: "crystal hoarders, moon lovers, chart nerds, cosmic wanderers"
- Mix up the order and terms each time for variety
- Second part introduces Lunary and mentions the current topic
- Conversational, lowercase, like texting your community
- Pattern: "dear [audience terms]\\n[Lunary intro mentioning topic and features]"
- Example: "dear tarot readers, witches, astrologers, and moon lovers\\ni built lunary for you. {topic} is just one tool inside."`,

  question: `Format for question (engagement):
- Specific, answerable question
- NOT vague or rhetorical
- Focuses on their experience, not general concepts
- Should inspire concrete responses
- Pattern: Direct question + optional brief context`,

  video_caption: `Format for video caption:
- Conversational, spoken-style language
- Contractions and natural speech patterns
- Hook in first line must be magnetic
- Build to payoff, don't frontload everything
- Write how you'd explain to a friend, not an essay`,
};

/**
 * Platform-specific character limits and guidance
 */
const PLATFORM_GUIDANCE: Record<string, string> = {
  threads: `Platform: Threads (500 chars max)
- Conversational and casual
- Keep it tight and punchy, 220-320 characters ideal
- Lead with something interesting or unexpected
- No formal structures or repeated patterns`,

  pinterest: `Platform: Pinterest (100-150 chars)
- Brief, conversational with hashtag
- Lead with the insight, not buildup`,

  twitter: `Platform: Twitter/X (280 chars)
- Punchy and direct
- Every word must earn its place`,

  bluesky: `Platform: Bluesky (280 chars)
- Similar to Twitter but slightly more conversational
- Community-focused tone`,

  instagram: `Platform: Instagram
- First line is the hook (critical for feed)
- 3-4 sentences max
- Natural and approachable`,

  linkedin: `Platform: LinkedIn (150-200 chars)
- Professional but warm
- Insight-forward`,
};

/**
 * Variety requirements to prevent repetitive content
 */
const VARIETY_REQUIREMENTS = `
Variety requirements:
- Each post about the same topic MUST use completely different angles - not just rephrased versions
- Rotate between hook styles: question, statement, scenario, contrarian take, direct definition
- Alternate between: formal/casual, long/short, metaphorical/literal
- Never repeat the same sentence structure twice in a set
- Questions must sound like genuine human curiosity, not rhetorical fluff
- SPECIFICITY TEST: Could this sentence work for 10 different topics by swapping the subject? If yes, it's too generic. Rewrite with details unique to THIS topic.`;

/**
 * Get style instruction based on platform and post type
 */
export const SOCIAL_POST_STYLE_INSTRUCTION = (
  platform: string,
  postType?: SocialPostType,
): string => {
  const baseGuidance = `Write naturally and conversationally. Share insights like you're explaining to a curious friend - clear, grounded, and genuinely helpful. Avoid marketing language, rigid formulas, or teaching from a distance.`;

  const platformNote = PLATFORM_GUIDANCE[platform] || '';
  const postTypeFramework = postType
    ? POST_TYPE_FRAMEWORKS[postType] || ''
    : '';

  const parts = [baseGuidance];

  if (platformNote) {
    parts.push(platformNote);
  }

  if (postTypeFramework) {
    parts.push(postTypeFramework);
  }

  parts.push(VOICE_GUIDELINES);
  parts.push(BANNED_OPENINGS);
  parts.push(VARIETY_REQUIREMENTS);

  return parts.join('\n\n');
};

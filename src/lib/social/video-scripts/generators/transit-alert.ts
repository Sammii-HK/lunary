/**
 * Transit Alert Video Generator
 *
 * Auto-generates videos for upcoming major transits (ingress, stations, etc.)
 * Creates evergreen content that mentions the date but focuses on the meaning
 */

import { generateContent } from '@/lib/ai/content-generator';
import type { VideoScript } from '../types';
import { getOptimalPostingHour } from '@/utils/posting-times';

export interface TransitEvent {
  type: 'ingress' | 'station' | 'retrograde' | 'aspect' | 'eclipse';
  planet: string;
  fromSign?: string;
  toSign?: string;
  date: Date;
  rarity: 'common' | 'rare' | 'very-rare'; // How often it happens
  significance: string; // Why it matters
  /** For retrograde events: whether the planet is stationing or actively Rx */
  retrogradePhase?: 'stations_retrograde' | 'stations_direct' | 'active';
}

/**
 * Generate transit alert video script
 */
export async function generateTransitAlertScript(
  transit: TransitEvent,
  scheduledDate: Date,
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript> {
  // Calculate days until transit
  const daysUntil = Math.ceil(
    (transit.date.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const dateStr = transit.date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // Retrograde detection (needed early for prompt construction)
  const isRetrograde = transit.type === 'retrograde';
  const isActiveRx = isRetrograde && transit.retrogradePhase === 'active';

  // Build transit description
  let transitDesc = '';
  if (isRetrograde) {
    if (transit.retrogradePhase === 'stations_retrograde') {
      transitDesc = `${transit.planet} stations retrograde in ${transit.toSign}`;
    } else if (transit.retrogradePhase === 'stations_direct') {
      transitDesc = `${transit.planet} stations direct in ${transit.toSign}`;
    } else {
      transitDesc = `${transit.planet} retrograde in ${transit.toSign}`;
    }
  } else if (transit.type === 'ingress') {
    transitDesc = `${transit.planet} moving from ${transit.fromSign} into ${transit.toSign}`;
  } else if (transit.type === 'station') {
    transitDesc = `${transit.planet} stationing in ${transit.toSign || transit.fromSign}`;
  }

  const rarityNote =
    transit.rarity === 'very-rare'
      ? "This doesn't happen often. It's a generational shift"
      : transit.rarity === 'rare' && isRetrograde
        ? `Mercury retrogrades happen 3-4 times a year, but the SIGN matters. ${transit.toSign} is where Mercury struggles most. It's in its detriment and fall here, meaning communication becomes intuitive rather than logical`
        : transit.rarity === 'rare'
          ? 'This is a significant transit worth paying attention to'
          : '';
  const timingContext = isActiveRx
    ? `${transit.planet} is currently retrograde in ${transit.toSign}. This is an active retrograde period. The planet stationed retrograde earlier and is still moving backward.`
    : daysUntil > 0
      ? `${transitDesc} on ${dateStr} (${daysUntil} days from now).`
      : daysUntil === 0
        ? `${transitDesc}, happening today, ${dateStr}.`
        : `${transitDesc}. This started on ${dateStr} and is still active.`;

  const prompt = `Create a 30-second TikTok script about ${isRetrograde ? `${transit.planet} retrograde` : 'an astrological transit'}.

${timingContext}
Significance: ${transit.significance}
${rarityNote ? `Rarity: ${rarityNote}` : ''}

Requirements:
- Hook (0-3s): Lead with the ONE most surprising or rarity-driven fact. Use a pattern interrupt or curiosity gap — NOT a generic opener like "Get ready for cosmic magic!"
- Meaning (3-20s): Explain WHAT this transit means in practical, relatable terms that people can apply to their daily life. Be SPECIFIC — name concrete effects, not vague "energy shifts"
- What to expect (20-27s): What people might actually feel, experience, or notice. Ground it in real life — relationships, decisions, communication, creativity
- CTA (27-30s): "Track this transit in Lunary — link in bio"
- Mention the date naturally but focus on the MEANING to stay evergreen
- Tone: Knowledgeable and grounded, like a friend who really understands astrology
- Style: Sentence case, authentic voice, conversational
- Lead with specificity — "Mercury retrograde in Pisces blurs the line between what you feel and what you remember" is better than "Get ready for some cosmic shifts!"

DO NOT:
- Start with "Get ready" or "Something big is happening" or "Did you know" or any generic opener
- Say Mercury retrograde is "rare" — it happens 3-4 times a year. What matters is the SIGN it's in
- Create fear or anxiety
- Use overly technical jargon
- Make definitive predictions
- Focus only on the date (make it evergreen)
- Use the words: cosmic magic, cosmic energy, celestial, universe has a plan, pretty rare, rare event
- Use em dashes. Use commas, full stops, or semicolons instead

Format as sections:

[HOOK] (0-3s)
{attention-grabbing opening — lead with rarity, specificity, or a pattern interrupt}

[MEANING] (3-20s)
{what this transit means in practical, relatable terms — be specific}

[WHAT TO EXPECT] (20-27s)
{what people might experience, feel, or notice — grounded in real life}

[CTA] (27-30s)
{call to action to track in Lunary}

Write naturally and make complex astrology feel accessible.`;

  const scriptText = await generateContent({
    systemPrompt: `You are a knowledgeable astrologer who makes complex transits accessible and empowering. You write in sentence case, avoid fear-mongering, and focus on practical wisdom. You lead with the most specific, surprising detail — not generic framing. For retrogrades, focus on what the SIGN reveals (dignity, detriment, fall) not the frequency. You never say retrogrades are "rare" because they happen multiple times a year — instead explain why THIS one in THIS sign matters.`,
    prompt,
    model: 'quality',
    temperature: 0.7,
    maxTokens: 600,
  });

  // Parse sections and strip em dashes (TTS reads them awkwardly)
  const sections = parseTransitSections(scriptText.replace(/\s*—\s*/g, ', '));

  // Rebuild fullScript from section content only, strip [HOOK], [MEANING] etc.
  // so TTS never reads the section markers aloud
  const cleanScript = sections
    .map((s) => s.content)
    .join('\n\n')
    .trim();

  const wordCount = cleanScript.split(/\s+/).length;

  return {
    themeId: 'transit-alert',
    themeName: 'Transit Alert',
    facetTitle: isRetrograde
      ? `${transit.planet} Retrograde in ${transit.toSign || ''}`
      : transit.type === 'ingress'
        ? `${transit.planet} into ${transit.toSign || ''}`
        : `${transit.planet} ${transit.toSign || ''}`,
    topic: transitDesc,
    angle: 'timely',
    aspect: 'awareness',
    contentType: 'transit-alert',
    platform: 'tiktok',
    sections,
    fullScript: cleanScript,
    wordCount,
    estimatedDuration: '30s',
    scheduledDate,
    status: 'draft',
    coverImageUrl: `${baseUrl}/api/og/transits/${transit.planet.toLowerCase()}-${transit.toSign?.toLowerCase() || 'station'}`,
    metadata: {
      theme: 'TRANSIT ALERT',
      title: `${transit.planet} ${transit.type}`,
      series: 'Transit Alert',
      summary: transit.significance,
      angle: 'timely',
      topic: transitDesc,
      aspect: 'awareness',
      scheduledHour: getOptimalPostingHour({
        contentType: 'transit-alert',
        scheduledDate,
        topic: transitDesc,
      }),
      targetAudience: 'discovery',
    },
  };
}

/**
 * Parse transit script sections
 */
function parseTransitSections(script: string) {
  const sections = [];

  const hookMatch = script.match(/\[HOOK\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (hookMatch) {
    sections.push({
      name: 'HOOK',
      duration: '0-3s',
      content: hookMatch[1].trim(),
    });
  }

  const meaningMatch = script.match(/\[MEANING\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (meaningMatch) {
    sections.push({
      name: 'MEANING',
      duration: '3-20s',
      content: meaningMatch[1].trim(),
    });
  }

  const expectMatch = script.match(
    /\[WHAT TO EXPECT\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i,
  );
  if (expectMatch) {
    sections.push({
      name: 'WHAT TO EXPECT',
      duration: '20-27s',
      content: expectMatch[1].trim(),
    });
  }

  const ctaMatch = script.match(/\[CTA\][^\n]*\n([\s\S]*?)(?=\n\[|$)/i);
  if (ctaMatch) {
    sections.push({
      name: 'CTA',
      duration: '27-30s',
      content: ctaMatch[1].trim(),
    });
  }

  if (sections.length === 0) {
    sections.push({
      name: 'FULL_SCRIPT',
      duration: '0-30s',
      content: script.trim(),
    });
  }

  return sections;
}

/**
 * Detect upcoming major transits from cosmic data
 * This should integrate with your existing transit detection system
 */
export async function detectUpcomingTransits(
  daysAhead: number = 14,
): Promise<TransitEvent[]> {
  // TODO: Integrate with your existing transit detection
  // For now, return example data structure
  const today = new Date();
  const saturnIngress = new Date(today);
  saturnIngress.setDate(today.getDate() + 9);

  return [
    {
      type: 'ingress',
      planet: 'Saturn',
      fromSign: 'Pisces',
      toSign: 'Aries',
      date: saturnIngress,
      rarity: 'very-rare',
      significance:
        'Saturn enters Aries for the first time since 1996, bringing major shifts in how we approach discipline, responsibility, and personal ambition',
    },
  ];
}

/**
 * Auto-generate transit videos for upcoming events
 */
export async function generateUpcomingTransitVideos(
  daysAhead: number = 14,
  leadTime: number = 7,
): Promise<VideoScript[]> {
  const transits = await detectUpcomingTransits(daysAhead);
  const scripts: VideoScript[] = [];

  for (const transit of transits) {
    // Generate video 7 days before the transit
    const videoDate = new Date(transit.date);
    videoDate.setDate(videoDate.getDate() - leadTime);

    // Only generate if video date is in the future
    if (videoDate > new Date()) {
      const script = await generateTransitAlertScript(
        transit,
        videoDate,
        'https://lunary.app',
      );
      scripts.push(script);
    }
  }

  return scripts;
}

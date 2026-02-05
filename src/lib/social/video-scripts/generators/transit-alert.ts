/**
 * Transit Alert Video Generator
 *
 * Auto-generates videos for upcoming major transits (ingress, stations, etc.)
 * Creates evergreen content that mentions the date but focuses on the meaning
 */

import { generateContent } from '@/lib/ai/content-generator';
import type { VideoScript } from '../types';

export interface TransitEvent {
  type: 'ingress' | 'station' | 'aspect' | 'eclipse';
  planet: string;
  fromSign?: string;
  toSign?: string;
  date: Date;
  rarity: 'common' | 'rare' | 'very-rare'; // How often it happens
  significance: string; // Why it matters
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

  // Build transit description
  let transitDesc = '';
  if (transit.type === 'ingress') {
    transitDesc = `${transit.planet} moving from ${transit.fromSign} into ${transit.toSign}`;
  } else if (transit.type === 'station') {
    transitDesc = `${transit.planet} stationing ${transit.fromSign}`;
  }

  const rarityNote =
    transit.rarity === 'very-rare'
      ? "This doesn't happen often"
      : transit.rarity === 'rare'
        ? 'This is a significant transit'
        : '';

  const prompt = `Create a 30-second TikTok script about an upcoming astrological transit.

Transit: ${transitDesc}
Date: ${dateStr} (${daysUntil} days from now)
Significance: ${transit.significance}
${rarityNote ? `Rarity: ${rarityNote}` : ''}

Requirements:
- Hook (0-3s): Attention-grabbing statement about the transit's significance
- Meaning (3-20s): Explain WHAT this transit means in practical terms
- What to expect (20-27s): What people might feel, experience, or notice
- CTA (27-30s): "Track this transit in Lunary - link in bio"
- Mention the date naturally but focus on the MEANING to stay evergreen
- Tone: Excited but grounded, empowering not fearful
- Style: Sentence case, authentic voice
- Focus: Make complex astrology accessible

DO NOT:
- Create fear or anxiety
- Use overly technical jargon
- Make definitive predictions
- Focus only on the date (make it evergreen)

Format as sections:

[HOOK] (0-3s)
{attention-grabbing opening about the transit}

[MEANING] (3-20s)
{what this transit means in practical, relatable terms}

[WHAT TO EXPECT] (20-27s)
{what people might experience, feel, or notice}

[CTA] (27-30s)
{call to action to track in Lunary}

Write naturally and make complex astrology feel accessible.`;

  const scriptText = await generateContent({
    systemPrompt: `You are an astrologer who makes complex transits accessible and empowering. You write in sentence case, avoid fear-mongering, and focus on practical wisdom. You explain WHY transits matter in ways regular people can understand and use.`,
    prompt,
    model: 'quality',
    temperature: 0.7,
    maxTokens: 600,
  });

  // Parse sections
  const sections = parseTransitSections(scriptText);

  const wordCount = scriptText.split(/\s+/).length;

  return {
    themeId: 'transit-alert',
    themeName: 'Transit Alert',
    facetTitle: `${transit.planet} ${transit.type === 'ingress' ? 'into' : ''} ${transit.toSign || ''}`,
    topic: transitDesc,
    angle: 'timely',
    aspect: 'awareness',
    contentType: 'educational-deepdive',
    platform: 'tiktok',
    sections,
    fullScript: scriptText,
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
      scheduledHour: 17, // Educational content time
      targetAudience: 'consideration',
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

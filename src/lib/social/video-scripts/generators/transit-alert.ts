/**
 * Transit Alert Video Generator
 *
 * Auto-generates videos for upcoming major transits (ingress, stations, etc.)
 * Creates evergreen content that mentions the date but focuses on the meaning.
 *
 * Accepts either a legacy TransitEvent or a full CalendarEvent for richer context.
 */

import { generateContent } from '@/lib/ai/content-generator';
import type { VideoScript } from '../types';
import { getOptimalPostingHour } from '@/utils/posting-times';
import type { CalendarEvent } from '@/lib/astro/event-calendar';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/astronomical-data';

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

export interface TransitAlertOptions {
  /** Full calendar event data for richer context */
  calendarEvent?: CalendarEvent;
  /** Other significant events happening the same day (for convergence) */
  convergenceEvents?: CalendarEvent[];
  /** Spoke angle for cornerstone-spoke differentiation */
  spokeAngle?: string;
}

/**
 * Generate transit alert video script.
 *
 * When a CalendarEvent is provided via options, uses the rich event data
 * (rarity score, historical context, sabbat data, hook suggestions,
 * convergence with other events) to produce a far more specific script.
 */
export async function generateTransitAlertScript(
  transit: TransitEvent,
  scheduledDate: Date,
  baseUrl: string = 'https://lunary.app',
  options?: TransitAlertOptions,
): Promise<VideoScript> {
  const cal = options?.calendarEvent;
  const convergence = options?.convergenceEvents || [];

  // Calculate days until transit
  const daysUntil = Math.ceil(
    (transit.date.getTime() - scheduledDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const dateStr = transit.date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
  });

  // Retrograde detection
  const isRetrograde = transit.type === 'retrograde';
  const isActiveRx = isRetrograde && transit.retrogradePhase === 'active';

  // Build transit description — prefer CalendarEvent name if available
  let transitDesc = cal?.name || '';
  if (!transitDesc) {
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
    } else {
      transitDesc = `${transit.planet} ${transit.toSign || ''}`.trim();
    }
  }

  // --- Current sky snapshot (when we have a CalendarEvent, we know the date) ---
  let skyContext = '';
  if (cal) {
    try {
      const eventDate = new Date(cal.date);
      const positions = getRealPlanetaryPositions(eventDate);
      const moonData = getAccurateMoonPhase(eventDate);
      const moonSign = (positions.Moon as any)?.sign || 'Unknown';

      // Next sign lookup for boundary detection
      const signOrder = [
        'Aries',
        'Taurus',
        'Gemini',
        'Cancer',
        'Leo',
        'Virgo',
        'Libra',
        'Scorpio',
        'Sagittarius',
        'Capricorn',
        'Aquarius',
        'Pisces',
      ];
      const nextSign = (sign: string) =>
        signOrder[(signOrder.indexOf(sign) + 1) % 12];

      const planets = [
        'Sun',
        'Moon',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
      ];
      const posLines = planets
        .map((p) => {
          const pos = positions[p] as any;
          if (!pos?.sign) return null;
          const rx = pos.retrograde ? ' Rx' : '';
          // Flag planets about to change sign (28-29°) — important for content accuracy
          const degree = pos.degree ?? 0;
          const enteringNote =
            degree >= 28 && !pos.retrograde
              ? ` (entering ${nextSign(pos.sign)} today)`
              : '';
          return `${p} in ${pos.sign}${rx}${enteringNote}`;
        })
        .filter(Boolean);

      skyContext = `CURRENT SKY: ${posLines.join(', ')}. Moon phase: ${moonData.name} in ${moonSign}.`;
    } catch {}
  }

  // --- Build rich context blocks ---

  const contextParts: string[] = [];

  // Current sky positions — gives the AI the full picture
  if (skyContext) contextParts.push(skyContext);

  // Timing
  if (isActiveRx) {
    contextParts.push(
      `${transit.planet} is currently retrograde in ${transit.toSign}. Active retrograde period.`,
    );
  } else if (daysUntil > 0) {
    contextParts.push(
      `${transitDesc} on ${dateStr} (${daysUntil} days from now).`,
    );
  } else if (daysUntil === 0) {
    contextParts.push(`${transitDesc}, happening today, ${dateStr}.`);
  } else {
    contextParts.push(
      `${transitDesc}. Started on ${dateStr} and is still active.`,
    );
  }

  // Significance
  contextParts.push(`Significance: ${transit.significance}`);

  // Rarity context from CalendarEvent
  if (cal) {
    if (cal.rarityFrame) contextParts.push(`Rarity: ${cal.rarityFrame}`);
    if (cal.historicalContext)
      contextParts.push(`Historical context: ${cal.historicalContext}`);
    if (cal.lastInThisSign)
      contextParts.push(`Last occurrence: ${cal.lastInThisSign}`);
    if (cal.hookSuggestions?.length) {
      contextParts.push(
        `Hook ideas to consider: ${cal.hookSuggestions.slice(0, 3).join(' | ')}`,
      );
    }
  } else {
    // Legacy rarity note
    const rarityNote =
      transit.rarity === 'very-rare'
        ? "This doesn't happen often. It's a generational shift"
        : transit.rarity === 'rare' && isRetrograde
          ? `Mercury retrogrades happen 3-4 times a year, but the SIGN matters. ${transit.toSign} is where Mercury struggles most`
          : transit.rarity === 'rare'
            ? 'This is a significant transit worth paying attention to'
            : '';
    if (rarityNote) contextParts.push(`Rarity: ${rarityNote}`);
  }

  // Sabbat context
  if (cal?.sabbatData) {
    const sd = cal.sabbatData;
    const sabbatParts = [
      `This coincides with ${cal.name}, a sabbat on the Wheel of the Year.`,
    ];
    if (sd.spiritualMeaning)
      sabbatParts.push(`Meaning: ${sd.spiritualMeaning}`);
    if (sd.crystals?.length)
      sabbatParts.push(
        `Associated crystals: ${sd.crystals.slice(0, 3).join(', ')}`,
      );
    if (sd.rituals?.length)
      sabbatParts.push(
        `Traditional rituals: ${sd.rituals.slice(0, 3).join(', ')}`,
      );
    if (sd.traditions?.length)
      sabbatParts.push(`Traditions: ${sd.traditions.slice(0, 3).join(', ')}`);
    contextParts.push(sabbatParts.join('\n'));
  } else if (cal?.eventType === 'sabbat') {
    contextParts.push(
      `This is ${cal.name}, a seasonal turning point on the Wheel of the Year.`,
    );
  }

  // Convergence — other big events happening today
  if (convergence.length > 0) {
    const others = convergence
      .map((e) => {
        const parts = [e.name];
        if (e.historicalContext) parts.push(e.historicalContext);
        return parts.join(': ');
      })
      .slice(0, 4);
    contextParts.push(
      `ALSO HAPPENING TODAY (use for convergence framing):\n${others.map((o) => `  - ${o}`).join('\n')}`,
    );
  }

  const fullContext = contextParts.join('\n\n');

  // Determine duration based on event significance
  const isHighSignificance =
    cal && (cal.rarity === 'CRITICAL' || cal.rarity === 'HIGH');
  const targetDuration = isHighSignificance ? '45-60' : '30';
  const wordTarget = isHighSignificance ? '110-150' : '75-100';

  // Determine spoke angle for cornerstone-spoke differentiation
  const spokeAngle = options?.spokeAngle;
  const spokeInstruction = spokeAngle
    ? `\nSPOKE ANGLE: This is one of multiple videos today. Your angle is: "${spokeAngle}". Do NOT cover the same ground as other videos. Stay focused on this specific angle.\n`
    : '';

  const prompt = `Create a ${targetDuration}-second TikTok script about: ${transitDesc}

GROUND TRUTH — PLANETARY POSITIONS (use these, do not contradict):
${skyContext || 'No sky data available.'}

If a planet says "entering [Sign] today", treat it as being IN that sign. Do not refer to it as being in the previous sign.

${spokeInstruction}CONTEXT:
${fullContext}

TARGET: ${wordTarget} words total.

Requirements:
- Hook (first 3 seconds): Lead with the ONE most surprising, specific, or rarity-driven fact. Pattern interrupt or curiosity gap. NOT a generic opener.
${cal?.hookSuggestions?.length ? `  Consider these angles: ${cal.hookSuggestions.slice(0, 2).join(' | ')}` : ''}
- Body (middle): Explain WHAT this means in practical, relatable terms. Be SPECIFIC about concrete effects on daily life. If multiple events converge today, call that out explicitly.
- What to expect: What people might actually feel, experience, or notice. Grounded in real life.
- CTA (last 3s): "Track this transit in Lunary" (do NOT say "link in bio" — platforms penalise it)
- Mention the date naturally but focus on MEANING to stay evergreen
- Tone: Knowledgeable and grounded, like a friend who really understands astrology
- Style: Sentence case, authentic voice, conversational

DO NOT:
- Start with "Get ready", "Something big is happening", "Did you know", or any generic opener
- Say Mercury retrograde is "rare" (it happens 3-4x/year, the SIGN is what matters)
- Contradict the GROUND TRUTH planetary positions above
- Create fear or anxiety
- Use overly technical jargon or make definitive predictions
- Use: cosmic magic, cosmic energy, celestial, universe has a plan, pretty rare, rare event
- Use em dashes. Use commas, full stops, or semicolons instead
- Be vague or generic. Every sentence should be specific to THIS transit on THIS date

Format as sections:

[HOOK] (0-3s)
{the most specific, attention-grabbing opening}

[MEANING] (3-20s)
{practical meaning, convergence context, historical weight}

[WHAT TO EXPECT] (20-${isHighSignificance ? '55' : '27'}s)
{real-life effects people will notice}

[CTA] (last 3s)
{call to action}

Write naturally and make complex astrology feel accessible.`;

  const scriptText = await generateContent({
    systemPrompt: `You are a knowledgeable astrologer who makes complex transits accessible and empowering. You write in sentence case, avoid fear-mongering, and focus on practical wisdom. You lead with the most specific, surprising detail — not generic framing. For retrogrades, focus on what the SIGN reveals (dignity, detriment, fall) not the frequency. You never say retrogrades are "rare" because they happen multiple times a year — instead explain why THIS one in THIS sign matters. TOPIC LOCK: Do NOT mention angel numbers, numerology, tarot, crystals, or any non-astrological content. This script is ONLY about the specific planetary transit.`,
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

  // Use CalendarEvent name for title if available, otherwise build from transit
  const facetTitle =
    cal?.name ||
    (isRetrograde
      ? `${transit.planet} Retrograde in ${transit.toSign || ''}`
      : transit.type === 'ingress'
        ? `${transit.planet} into ${transit.toSign || ''}`
        : transitDesc || `${transit.planet} ${transit.toSign || ''}`);

  return {
    themeId: 'transit-alert',
    themeName: 'Transit Alert',
    facetTitle,
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

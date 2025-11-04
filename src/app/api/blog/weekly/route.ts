import { NextRequest, NextResponse } from 'next/server';
import {
  generateWeeklyContent,
  WeeklyCosmicData,
} from '../../../../../utils/blog/weeklyContentGenerator';

export const dynamic = 'force-dynamic';

// Generate weekly cosmic blog content
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');
    const format = searchParams.get('format') || 'json'; // json, markdown, html

    // Parse date or default to start of current week (Monday)
    let startDate: Date;
    if (dateParam) {
      startDate = new Date(dateParam);
    } else {
      const today = new Date();
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday is 0, Monday is 1
      startDate = new Date(
        today.getTime() - daysToMonday * 24 * 60 * 60 * 1000,
      );
    }

    // Generate comprehensive weekly content
    const weeklyData = await generateWeeklyContent(startDate);

    if (format === 'markdown') {
      const markdown = generateMarkdownContent(weeklyData);
      return new Response(markdown, {
        headers: { 'Content-Type': 'text/markdown' },
      });
    }

    if (format === 'html') {
      const html = generateHTMLContent(weeklyData);
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    // Default JSON format
    return NextResponse.json({
      success: true,
      data: weeklyData,
      metadata: {
        generatedAt: weeklyData.generatedAt,
        weekNumber: weeklyData.weekNumber,
        year: weeklyData.year,
        contentSections: {
          planetaryHighlights: weeklyData.planetaryHighlights.length,
          retrogradeChanges: weeklyData.retrogradeChanges.length,
          majorAspects: weeklyData.majorAspects.length,
          moonPhases: weeklyData.moonPhases.length,
          dailyForecasts: weeklyData.dailyForecasts.length,
        },
      },
    });
  } catch (error) {
    console.error('Weekly content generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate weekly content',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// Generate blog post in Markdown format
function generateMarkdownContent(data: WeeklyCosmicData): string {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return `---
title: "${data.title}"
subtitle: "${data.subtitle}"
date: "${data.weekStart.toISOString()}"
author: "Lunary Cosmic Team"
category: "Weekly Forecast"
tags: ["astrology", "weekly-forecast", "cosmic-guidance", "planetary-transits"]
featured: true
week: ${data.weekNumber}
year: ${data.year}
---

# ${data.title}

*${data.subtitle}*

**Week of ${weekRange}**

${data.summary}

## 🌟 Major Planetary Highlights

${
  data.planetaryHighlights.length > 0
    ? data.planetaryHighlights
        .map(
          (highlight) =>
            `### ${highlight.planet} ${highlight.event.replace('-', ' ')}
**${highlight.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}**

${highlight.description}

*Significance: ${highlight.significance}*

${
  highlight.details.fromSign && highlight.details.toSign
    ? `This transition from ${highlight.details.fromSign} to ${highlight.details.toSign} brings ${getSignTransitionMeaning(highlight.details.fromSign, highlight.details.toSign)}.`
    : ''
}
`,
        )
        .join('\n')
    : 'No major planetary movements this week - a time for steady cosmic flow.'
}

## ♻️ Retrograde Activity

${
  data.retrogradeChanges.length > 0
    ? data.retrogradeChanges
        .map(
          (change) =>
            `### ${change.planet} ${change.action === 'begins' ? 'Stations Retrograde' : 'Stations Direct'}
**${change.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} in ${change.sign}**

${change.significance}

**Guidance:** ${change.guidance}
`,
        )
        .join('\n')
    : 'No retrograde changes this week - all planets maintain their current direction.'
}

## 🌙 Lunar Phases

${
  data.moonPhases.length > 0
    ? data.moonPhases
        .map(
          (phase) =>
            `### ${phase.phase}
**${phase.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${phase.time} in ${phase.sign}**

${phase.energy}

${phase.guidance}

**Ritual Suggestions:**
${phase.ritualSuggestions.map((suggestion) => `- ${suggestion}`).join('\n')}
`,
        )
        .join('\n')
    : 'No major moon phases this week.'
}

## 📅 Best Days For...

${Object.entries(data.bestDaysFor)
  .map(
    ([activity, guidance]) =>
      `**${activity.charAt(0).toUpperCase() + activity.slice(1)}:** ${(guidance as any).dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')} - ${(guidance as any).reason}`,
  )
  .join('\n\n')}

## 💎 Weekly Crystal Companions

${data.crystalRecommendations
  .map(
    (crystal) =>
      `**${crystal.date.toLocaleDateString('en-US', { weekday: 'long' })}:** ${crystal.crystal}
*${crystal.reason}*
Work with ${crystal.crystal} for ${crystal.intention}. ${crystal.usage}`,
  )
  .join('\n\n')}

## ⏰ Magical Timing

${
  data.magicalTiming.powerDays.length > 0
    ? `**Power Days:** ${data.magicalTiming.powerDays.map((d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')}`
    : ''
}

${
  data.magicalTiming.voidOfCourseMoon.length > 0
    ? `**Void of Course Moon:** Avoid major decisions during these times:
${data.magicalTiming.voidOfCourseMoon
  .map(
    (voidPeriod) =>
      `- ${voidPeriod.start.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })} to ${voidPeriod.end.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
  )
  .join('\n')}`
    : ''
}

## 🌊 Daily Flow

${data.dailyForecasts
  .map(
    (day) =>
      `### ${day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
*${day.planetaryRuler}'s Day - Moon in ${day.moonSign}*

${day.energy}

**Best for:** ${day.bestFor.join(', ')}
${day.avoid.length > 0 ? `**Avoid:** ${day.avoid.join(', ')}` : ''}

${day.guidance}
`,
  )
  .join('\n')}

---

*Generated with love by the Lunary cosmic intelligence system. For personalized guidance, visit [lunary.app](https://lunary.app)*
`;
}

function generateHTMLContent(data: WeeklyCosmicData): string {
  // Convert markdown to HTML (simplified version)
  const markdown = generateMarkdownContent(data);

  // Basic markdown to HTML conversion (in production, use a proper markdown parser)
  return `<!DOCTYPE html>
<html>
<head>
    <title>${data.title}</title>
    <meta name="description" content="${data.subtitle}">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; line-height: 1.6; }
        h1 { color: #2d3748; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        h2 { color: #4a5568; margin-top: 40px; }
        h3 { color: #718096; }
        .date { color: #a0aec0; font-style: italic; }
        .significance { background: #f7fafc; padding: 5px 10px; border-radius: 5px; font-size: 0.9em; }
        .guidance { background: #e6fffa; padding: 15px; border-radius: 8px; border-left: 4px solid #38b2ac; }
    </style>
</head>
<body>
    <div>${markdown.replace(/\n/g, '<br>').replace(/###/g, '<h3>').replace(/##/g, '<h2>').replace(/# /g, '<h1>')}</div>
</body>
</html>`;
}

function getSignTransitionMeaning(fromSign: string, toSign: string): string {
  // Provide meaning for sign transitions
  const transitionMeanings: { [key: string]: string } = {
    'Aries-Taurus': 'a shift from impulsive action to grounded determination',
    'Taurus-Gemini': 'movement from stability to curiosity and communication',
    'Gemini-Cancer': 'a transition from mental focus to emotional depth',
    'Cancer-Leo': 'evolution from nurturing to creative self-expression',
    'Leo-Virgo': 'refinement from bold expression to practical service',
    'Virgo-Libra': 'balance between perfectionism and harmony',
    'Libra-Scorpio':
      'deepening from surface harmony to transformative intensity',
    'Scorpio-Sagittarius':
      'expansion from deep transformation to philosophical exploration',
    'Sagittarius-Capricorn':
      'grounding from expansive vision to practical achievement',
    'Capricorn-Aquarius':
      'liberation from traditional structure to innovative freedom',
    'Aquarius-Pisces':
      'flow from intellectual detachment to intuitive connection',
    'Pisces-Aries': 'renewal from spiritual dissolution to fresh initiative',
  };

  return (
    transitionMeanings[`${fromSign}-${toSign}`] ||
    `a significant shift in cosmic energy from ${fromSign} to ${toSign}`
  );
}

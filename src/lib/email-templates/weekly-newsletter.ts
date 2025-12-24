import { WeeklyCosmicData } from '../../../utils/blog/weeklyContentGenerator';

const DEFAULT_BASE_URL = 'https://lunary.app';

type DateInput = Date | string;

function coerceDate(value: DateInput): Date {
  return value instanceof Date ? value : new Date(value);
}

function formatDate(
  value: DateInput,
  options: Intl.DateTimeFormatOptions,
): string {
  return coerceDate(value).toLocaleDateString('en-US', options);
}

const PLANET_THEMES: Record<string, string> = {
  Sun: 'identity and vitality',
  Moon: 'emotions and inner needs',
  Mercury: 'communication and mental focus',
  Venus: 'relationships, values, and care',
  Mars: 'energy, drive, and courage',
  Jupiter: 'growth, trust, and perspective',
  Saturn: 'structure, responsibility, and boundaries',
  Uranus: 'change, freedom, and innovation',
  Neptune: 'intuition, imagination, and sensitivity',
  Pluto: 'transformation and depth',
};

const SIGN_TONES: Record<string, string> = {
  Aries: 'direct and decisive',
  Taurus: 'steady and grounded',
  Gemini: 'curious and flexible',
  Cancer: 'protective and emotionally attuned',
  Leo: 'expressive and confident',
  Virgo: 'practical and precise',
  Libra: 'relational and balancing',
  Scorpio: 'intense and transformative',
  Sagittarius: 'expansive and candid',
  Capricorn: 'disciplined and long-term',
  Aquarius: 'innovative and clear-sighted',
  Pisces: 'sensitive and imaginative',
};

function getPrimaryTransit(data: WeeklyCosmicData): {
  title: string;
  description: string;
} | null {
  if (data.planetaryHighlights.length === 0) {
    return null;
  }

  const highlight = data.planetaryHighlights[0];
  const planet = highlight.planet;
  const theme = PLANET_THEMES[planet] || 'focus and momentum';

  if (highlight.event === 'enters-sign' && highlight.details?.toSign) {
    const sign = highlight.details.toSign;
    const tone = SIGN_TONES[sign] || 'steady and grounded';
    return {
      title: `${planet} enters ${sign}`,
      description: `${planet} shifts ${theme} toward a ${tone} approach. This favors clearer commitments, realistic expectations, and choices that can hold up over time.`,
    };
  }

  if (highlight.event === 'goes-retrograde') {
    return {
      title: `${planet} stations retrograde`,
      description: `${planet} slows to review ${theme}. It is a useful time to reassess patterns, refine priorities, and return to what needs more care.`,
    };
  }

  if (highlight.event === 'goes-direct') {
    return {
      title: `${planet} stations direct`,
      description: `${planet} moves forward again, bringing momentum to ${theme}. Expect clearer direction and an easier path for decisions that have been on hold.`,
    };
  }

  return {
    title: `${planet} shift`,
    description: `${planet} influences ${theme}, encouraging a more conscious approach to how you move through the week.`,
  };
}

function buildWeeklySummary(data: WeeklyCosmicData): string {
  const hasSquares = data.majorAspects.some(
    (aspect) => aspect.aspect === 'square',
  );
  const hasTrines = data.majorAspects.some(
    (aspect) => aspect.aspect === 'trine',
  );
  const hasConjunctions = data.majorAspects.some(
    (aspect) => aspect.aspect === 'conjunction',
  );

  const focusBits = new Set<string>();
  data.planetaryHighlights.forEach((highlight) => {
    const theme = PLANET_THEMES[highlight.planet];
    if (theme) {
      focusBits.add(theme);
    }
  });

  const focusText =
    focusBits.size > 0
      ? Array.from(focusBits).slice(0, 2).join(' and ')
      : 'inner alignment and steady progress';

  let tone = 'steady';
  if (hasSquares && hasTrines) {
    tone = 'balanced and clarifying';
  } else if (hasSquares) {
    tone = 'clarifying and practical';
  } else if (hasTrines) {
    tone = 'supportive and flowing';
  } else if (hasConjunctions) {
    tone = 'focused and consolidating';
  }

  return `This is a ${tone} week centered on ${focusText}. The emotional tone favors clear boundaries and sustainable choices, with enough movement to keep things evolving. Notice what feels realistic, supportive, and worth building on.`;
}

function getLunarPrompts(phase: string): [string, string] {
  const lower = phase.toLowerCase();

  if (lower.includes('new moon')) {
    return [
      'What intention is ready to be planted without rushing?',
      'Where can you commit to a small, consistent beginning?',
    ];
  }

  if (lower.includes('first quarter')) {
    return [
      'What needs a decisive step rather than more planning?',
      'Where can you act with clarity and follow-through?',
    ];
  }

  if (lower.includes('full moon')) {
    return [
      'What is ready to be acknowledged or released?',
      'Where can you celebrate progress without overextending?',
    ];
  }

  if (lower.includes('last quarter')) {
    return [
      'What is ready to be simplified or edited down?',
      'Where can you choose relief over perfection?',
    ];
  }

  if (lower.includes('waxing')) {
    return [
      'What needs steady attention to grow?',
      'Where can you take one small step forward today?',
    ];
  }

  if (lower.includes('waning')) {
    return [
      'What can be gently released to make space?',
      'Where would a quieter pace support you?',
    ];
  }

  return [
    'What feels most aligned with your priorities this week?',
    'Where can you slow down and listen more closely?',
  ];
}

function formatWeekRange(data: WeeklyCosmicData): string {
  return `${formatDate(data.weekStart, {
    month: 'long',
    day: 'numeric',
  })} - ${formatDate(data.weekEnd, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })}`;
}

export function generateWeeklyNewsletterHTML(
  data: WeeklyCosmicData,
  subject: string,
): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_BASE_URL;
  const weekRange = formatWeekRange(data);
  const primaryTransit = getPrimaryTransit(data);
  const moonPhase = data.moonPhases[0];
  const summary = buildWeeklySummary(data);
  const lunarPrompts = moonPhase
    ? getLunarPrompts(moonPhase.phase)
    : getLunarPrompts('');
  const aspectSummary =
    data.majorAspects.length > 0
      ? 'Several supportive and challenging aspects run throughout the week, reinforcing the central theme.'
      : 'The week feels steady and intentional, with enough movement to keep momentum alive.';
  const title = data.subtitle || data.title;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${subject}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            max-width: 620px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
          }
          .container {
            background: #ffffff;
            padding: 40px;
            border-radius: 16px;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }
          .header {
            text-align: center;
            margin-bottom: 32px;
          }
          .logo {
            max-width: 120px;
            height: auto;
            margin: 0 auto 18px;
            display: block;
          }
          .title {
            color: #111827;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
          }
          .subtitle {
            color: #6b7280;
            font-size: 16px;
            margin: 8px 0 0 0;
          }
          .week-range {
            color: #9ca3af;
            font-size: 14px;
            margin: 4px 0 0 0;
          }
          .section-title {
            color: #111827;
            font-size: 20px;
            margin: 28px 0 16px 0;
            border-left: 4px solid #7c3aed;
            padding-left: 12px;
          }
          .event-card {
            background: #f9fafb;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 14px;
            border: 1px solid #e5e7eb;
          }
          .event-date {
            font-weight: 600;
            color: #111827;
            margin-bottom: 6px;
          }
          .event-title {
            font-size: 16px;
            margin: 0 0 8px 0;
            color: #4b5563;
          }
          .recap-item {
            margin: 8px 0;
            color: #374151;
          }
          .badge {
            display: inline-block;
            background: #ede9fe;
            color: #5b21b6;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 6px;
          }
          .guidance {
            background: #eef2ff;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #e0e7ff;
            margin-top: 10px;
            font-size: 14px;
          }
          .cta {
            text-align: center;
            margin: 28px 0;
          }
          .cta a {
            background: #7c3aed;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 600;
            display: inline-block;
          }
          .footer {
            text-align: center;
            margin-top: 36px;
            color: #6b7280;
            font-size: 13px;
            border-top: 1px solid #e5e7eb;
            padding-top: 18px;
          }
          .footer a {
            color: #7c3aed;
            text-decoration: none;
          }
          ul {
            padding-left: 18px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${baseUrl}/logo.png" alt="Lunary" class="logo" />
            <h1 class="title">${title}</h1>
            <p class="subtitle">${weekRange}</p>
          </div>

          <p>${summary}</p>

          ${
            primaryTransit
              ? `
          <h2 class="section-title">Featured Transit</h2>
          <div class="event-card">
            <div class="event-title">${primaryTransit.title}</div>
            <p>${primaryTransit.description}</p>
          </div>
          `
              : ''
          }

          ${
            moonPhase
              ? `
          <h2 class="section-title">Lunar Phase and Reflection</h2>
          <div class="event-card">
            <div class="event-title">${moonPhase.phase} in ${moonPhase.sign}</div>
            <p>${moonPhase.energy}</p>
            <ul>
              <li>${lunarPrompts[0]}</li>
              <li>${lunarPrompts[1]}</li>
            </ul>
          </div>
          `
              : ''
          }

          <h2 class="section-title">How This Week May Feel</h2>
          <p>${aspectSummary}</p>

          <p>Inside Lunary, you can see how these themes interact with your birth chart and ongoing patterns.</p>

          <div class="footer">
            <p>Generated with care by Lunary.</p>
            <p>Visit <a href="${baseUrl}">lunary.app</a> for daily insights.</p>
            <p style="margin-top: 16px;">
              <a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateWeeklyNewsletterText(
  data: WeeklyCosmicData,
  subject: string,
  unsubscribeUrl?: string,
): string {
  const weekRange = formatWeekRange(data);
  const primaryTransit = getPrimaryTransit(data);
  const moonPhase = data.moonPhases[0];
  const summary = buildWeeklySummary(data);
  const lunarPrompts = moonPhase
    ? getLunarPrompts(moonPhase.phase)
    : getLunarPrompts('');
  const aspectSummary =
    data.majorAspects.length > 0
      ? 'Several supportive and challenging aspects run throughout the week, reinforcing the central theme.'
      : 'The week feels steady and intentional, with enough movement to keep momentum alive.';
  const title = data.subtitle || data.title;

  return `
${title}
${weekRange}

${summary}

FEATURED TRANSIT
================
${primaryTransit ? `${primaryTransit.title}\n${primaryTransit.description}` : 'No single dominant transit stands out this week.'}

LUNAR PHASE AND REFLECTION
==========================
${moonPhase ? `${moonPhase.phase} in ${moonPhase.sign}\n${moonPhase.energy}\n- ${lunarPrompts[0]}\n- ${lunarPrompts[1]}` : 'Use the Moon as a quiet anchor for reflection this week.'}

HOW THIS WEEK MAY FEEL
======================
${aspectSummary}

Inside Lunary, you can see how these themes interact with your birth chart and ongoing patterns.

---
Generated with care by Lunary
Visit lunary.app for daily insights

---
${unsubscribeUrl ? `Unsubscribe: ${unsubscribeUrl}` : 'Unsubscribe: https://lunary.app/unsubscribe'}
  `.trim();
}

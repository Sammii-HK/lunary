import { WeeklyCosmicData } from '../blog/weeklyContentGenerator';
import { getAppUrlWithUtm } from '../../src/config/substack';
import { generateExtendedPlanetaryAnalysis } from './planetaryAnalysis';
import { generateDetailedTransitInterpretations } from './planetaryAnalysis';
import { generateWeeklyRitualGuides } from './ritualGuides';
import { formatAstronomicalData } from './astronomicalData';

export interface SubstackPost {
  title: string;
  content: string;
  subtitle?: string;
  tags?: string[];
}

export function generateFreeSubstackPost(
  weeklyData: WeeklyCosmicData,
): SubstackPost {
  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const appUrl = getAppUrlWithUtm('free');

  const content = generateFreeContentFromWeeklyData(weeklyData, appUrl);

  return {
    title: `${weeklyData.title} | Week of ${weekRange}`,
    subtitle: weeklyData.subtitle,
    content,
    tags: ['astrology', 'weekly-forecast', 'cosmic-guidance'],
  };
}

// Generate the most dramatic hook for the week
function generateDramaticHook(data: WeeklyCosmicData): string {
  // Find the most significant event to lead with
  const majorMoon = data.moonPhases.find(
    (m) => m.phase.includes('Full') || m.phase.includes('New'),
  );
  const majorRetrograde = data.retrogradeChanges.find(
    (r) => r.action === 'begins',
  );
  const majorIngress = data.planetaryHighlights.find(
    (h) => h.significance === 'extraordinary' || h.significance === 'high',
  );

  if (majorMoon?.phase.includes('Full')) {
    return `✨ **The ${majorMoon.phase} in ${majorMoon.sign} illuminates the sky this week** — a powerful moment for release, clarity, and manifestation. But that's just the beginning...`;
  }
  if (majorMoon?.phase.includes('New')) {
    return `🌑 **A potent ${majorMoon.phase} in ${majorMoon.sign} marks the beginning of a new cycle** — the universe is handing you a blank canvas. Here's how to use it...`;
  }
  if (majorRetrograde) {
    return `⚠️ **${majorRetrograde.planet} stations retrograde this week** — before you panic, here's what this actually means for you and how to navigate it gracefully...`;
  }
  if (majorIngress) {
    return `🔥 **Major cosmic shift incoming: ${majorIngress.planet} enters ${majorIngress.details?.toSign || 'a new sign'}** — expect the energy to change dramatically. Here's your guide...`;
  }

  return `🌟 **This week brings ${data.planetaryHighlights.length + data.majorAspects.length} significant cosmic events** — here's everything you need to navigate them with intention...`;
}

// Generate week at a glance table
function generateWeekAtGlanceTable(data: WeeklyCosmicData): string {
  const dayAbbrevs = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const rows: string[] = [];

  // Get day by day events
  const currentDate = new Date(data.weekStart);
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(currentDate);
    dayDate.setDate(dayDate.getDate() + i);
    const dayStr = dayDate.toDateString();

    const dayEvents: string[] = [];

    // Check highlights
    data.planetaryHighlights.forEach((h) => {
      const eventDate = h.date instanceof Date ? h.date : new Date(h.date);
      if (eventDate.toDateString() === dayStr) {
        dayEvents.push(
          `${h.planet} ${h.event === 'enters-sign' ? 'enters ' + (h.details?.toSign || '') : h.event.replace('-', ' ')}`,
        );
      }
    });

    // Check moon phases
    data.moonPhases.forEach((m) => {
      const eventDate = m.date instanceof Date ? m.date : new Date(m.date);
      if (eventDate.toDateString() === dayStr) {
        dayEvents.push(`${m.phase} in ${m.sign}`);
      }
    });

    // Check retrogrades
    data.retrogradeChanges.forEach((r) => {
      const eventDate = r.date instanceof Date ? r.date : new Date(r.date);
      if (eventDate.toDateString() === dayStr) {
        dayEvents.push(
          `${r.planet} ${r.action === 'begins' ? 'Rx' : 'Direct'}`,
        );
      }
    });

    const dayName = dayAbbrevs[dayDate.getDay()];
    const dateNum = dayDate.getDate();
    const event = dayEvents.length > 0 ? dayEvents[0] : '—';
    const energy =
      dayEvents.length > 1 ? '🔥' : dayEvents.length === 1 ? '✨' : '🌿';

    rows.push(`| ${dayName} ${dateNum} | ${event} | ${energy} |`);
  }

  return `## 📅 This Week at a Glance

| Day | Key Event | Energy |
|-----|-----------|--------|
${rows.join('\n')}

`;
}

// Generate weekly affirmation
function generateWeeklyAffirmationForSubstack(data: WeeklyCosmicData): string {
  const majorMoon = data.moonPhases.find(
    (m) => m.phase.includes('Full') || m.phase.includes('New'),
  );

  if (majorMoon?.phase.includes('Full')) {
    return 'I release what no longer serves me and welcome the clarity this illumination brings.';
  }
  if (majorMoon?.phase.includes('New')) {
    return 'I plant seeds of intention with trust, knowing they will blossom in divine timing.';
  }
  if (data.retrogradeChanges.length > 0) {
    return 'I embrace this period of reflection and trust that revisiting the past leads to wiser choices ahead.';
  }

  const generalAffirmations = [
    'I move with the cosmic currents, trusting my inner wisdom to guide each step.',
    'I am aligned with the universe, open to the opportunities this week brings.',
    'I embrace change as a catalyst for growth and welcome new beginnings.',
  ];

  return generalAffirmations[data.weekNumber % generalAffirmations.length];
}

function generateFreeContentFromWeeklyData(
  data: WeeklyCosmicData,
  appUrl: string,
): string {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const dramaticHook = generateDramaticHook(data);
  const weekTable = generateWeekAtGlanceTable(data);
  const affirmation = generateWeeklyAffirmationForSubstack(data);

  return `
# ${data.title}

*${data.subtitle}*

**Week of ${weekRange}**

---

${dramaticHook}

---

${weekTable}

> **✨ Affirmation of the Week**
>
> *"${affirmation}"*

---

## The Big Picture

${data.summary}

${
  data.planetaryHighlights.length > 0
    ? '## 🌟 Major Planetary Movements\n\n' +
      data.planetaryHighlights
        .slice(0, 3)
        .map(
          (highlight) =>
            `### ${highlight.planet} ${highlight.event.replace('-', ' ')}\n**${highlight.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}**\n\n${highlight.description}\n\n*Significance: ${highlight.significance}*\n`,
        )
        .join('\n')
    : ''
}

${data.retrogradeChanges.length > 0 ? '## ♻️ Retrograde Activity\n\n' + data.retrogradeChanges.map((change) => `### ${change.planet} ${change.action === 'begins' ? 'Stations Retrograde' : 'Stations Direct'}\n**${change.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} in ${change.sign}**\n\n${change.significance}\n\n**Guidance:** ${change.guidance}\n`).join('\n') : ''}

${
  data.moonPhases.length > 0
    ? '## 🌙 Lunar Phases\n\n' +
      data.moonPhases
        .slice(0, 2)
        .map(
          (phase) =>
            `### ${phase.phase}\n**${phase.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${phase.time} in ${phase.sign}**\n\n${phase.energy}\n\n${phase.guidance}\n`,
        )
        .join('\n')
    : ''
}

## 💎 Weekly Crystal Companions

${data.crystalRecommendations
  .slice(0, 3)
  .map(
    (crystal) =>
      `**${crystal.date.toLocaleDateString('en-US', { weekday: 'long' })}:** ${crystal.crystal}\n*${crystal.reason}*\n`,
  )
  .join('\n')}

## 📅 Best Days For...

${Object.entries(data.bestDaysFor)
  .slice(0, 3)
  .map(
    ([activity, guidance]: [string, any]) =>
      `**${activity.charAt(0).toUpperCase() + activity.slice(1)}:** ${guidance.dates.map((d: Date) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')}\n*${guidance.reason}*\n`,
  )
  .join('\n')}

---

## 🔮 Want More? Here's What's in the Full Forecast...

**Paid subscribers this week get:**

- 📅 **Complete Daily Breakdowns** — Detailed guidance for all 7 days
- 💎 **All 7 Crystal Companions** — With specific usage rituals and affirmations
- 🕯️ **Weekly Ritual Guide** — Step-by-step practices aligned with this week's energy
- ⏰ **Void of Course Moon Times** — Know when to pause and when to act
- 🔮 **Extended Aspect Analysis** — Deep dive into what these transits mean for you
- ✨ **Journal Prompts** — Reflection questions for each major event

*[Upgrade to paid for $5/month →](https://lunary.substack.com/subscribe)*

---

## 💬 Your Turn!

**Which cosmic event are you most curious about this week?**

Drop a comment below — I read every single one and love hearing how these energies are showing up in your life! 👇

---

### 🌕 Get Your Personalized Cosmic Profile

**Ready for guidance tailored to YOUR birth chart?**

🌕 **[Open Lunary App →](${appUrl}?utm_source=substack&utm_medium=free_post&utm_campaign=cross_platform)**

- Complete birth chart analysis
- Personalized daily horoscopes
- How this week's transits affect YOUR signs
- Interactive cosmic profile

*Just £4.99/month — Upgrade from newsletter to full cosmic experience.*

---

**📧 Not subscribed yet?** Get free weekly cosmic insights: [lunary.substack.com](https://lunary.substack.com?utm_source=app&utm_medium=cta&utm_campaign=cross_platform)

*See you among the stars! ✨*
`.trim();
}

export function generatePaidSubstackPost(
  weeklyData: WeeklyCosmicData,
): SubstackPost {
  const weekRange = `${weeklyData.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weeklyData.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  const appUrl = getAppUrlWithUtm('paid');

  const extendedSummary = generateExtendedSummary(weeklyData);
  const planetaryAnalysis = generateExtendedPlanetaryAnalysis(weeklyData);
  const transitInterpretations =
    generateDetailedTransitInterpretations(weeklyData);
  const ritualGuides = generateWeeklyRitualGuides(weeklyData);
  const astronomicalData = formatAstronomicalData(weeklyData);

  const content = `
# ${weeklyData.title}

*${weeklyData.subtitle}*

**Week of ${weekRange}**

${extendedSummary}

${planetaryAnalysis}

${transitInterpretations}

${ritualGuides}

## 💎 Complete Crystal Guide

${generateFullCrystalGuide(weeklyData)}

## 🔮 Spell Recommendations

${generateSpellRecommendations(weeklyData)}

${astronomicalData}

## 📅 Extended Daily Breakdowns

${generateExtendedDailyBreakdowns(weeklyData)}

## ⏰ Magical Timing Deep Dive

${generateMagicalTimingDeepDive(weeklyData)}

---

---

### 🌕 Ready for Personalized Cosmic Guidance?

🌕 **[Open Lunary App →](${appUrl}?utm_source=substack&utm_medium=paid_post&utm_campaign=cross_platform)**

Get your complete birth chart analysis, personalized daily horoscopes, and interactive cosmic profile - just £4.99/month.

*Upgrade from newsletter to full cosmic experience.*

---

**📖 Read our weekly blog** for more cosmic insights: [lunary.app/blog](https://lunary.app/blog?utm_source=substack&utm_medium=cta&utm_campaign=cross_platform)
`.trim();

  return {
    title: `${weeklyData.title} | Full Week Ahead | ${weekRange}`,
    subtitle: `${weeklyData.subtitle} - Extended Analysis`,
    content,
    tags: [
      'astrology',
      'weekly-forecast',
      'cosmic-guidance',
      'planetary-transits',
      'rituals',
      'crystals',
    ],
  };
}

function convertHtmlToSubstackFormat(html: string, appUrl: string): string {
  let markdown = html;

  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1');
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1');
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1');
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
  markdown = markdown.replace(/<ul[^>]*>/gi, '');
  markdown = markdown.replace(/<\/ul>/gi, '');
  markdown = markdown.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
  markdown = markdown.replace(
    /<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    '[$2]($1)',
  );
  markdown = markdown.replace(
    /<div[^>]*class="cta"[^>]*>.*?<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>.*?<\/div>/gi,
    `\n\n**[$1](${appUrl})**\n\n`,
  );
  // Strip remaining HTML tags - this converts HTML to plain markdown for Substack,
  // not for security sanitization. Output is plain text for newsletter content.
  markdown = markdown.replace(/<[^>]+>/g, '');
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();

  return markdown;
}

function generateExtendedSummary(data: WeeklyCosmicData): string {
  return `
${data.summary}

This week brings significant cosmic shifts that will influence our collective and personal journeys. As we navigate these planetary movements, we're invited to align with the deeper rhythms of the cosmos and harness the transformative energies available to us.

The interplay between ${data.planetaryHighlights.length > 0 ? data.planetaryHighlights[0].planet : 'the planets'} and ${data.majorAspects.length > 0 ? `${data.majorAspects[0].planetA} and ${data.majorAspects[0].planetB}` : 'celestial forces'} creates a unique energetic signature for this week, offering both challenges and opportunities for growth.
`.trim();
}

function generateFullCrystalGuide(data: WeeklyCosmicData): string {
  return data.crystalRecommendations
    .map(
      (crystal) => `
### ${crystal.crystal}
**${crystal.date.toLocaleDateString('en-US', { weekday: 'long' })}**

${crystal.reason}

**Usage:** ${crystal.usage}

**Chakra:** ${crystal.chakra}

**Intention:** ${crystal.intention}
`,
    )
    .join('\n');
}

function generateSpellRecommendations(data: WeeklyCosmicData): string {
  const { getSpellsByCategory } = require('@/lib/spells/index');
  const categories = ['protection', 'manifestation', 'healing'];
  const spells: string[] = [];

  for (const category of categories) {
    const categorySpells = getSpellsByCategory(category);
    if (categorySpells.length > 0) {
      const spell = categorySpells[0];
      spells.push(`**${spell.title}** (${spell.category})`);
      spells.push(spell.description);
      if (spell.steps && spell.steps.length > 0) {
        spells.push(`\n*Quick ritual:* ${spell.steps.slice(0, 3).join(' → ')}`);
      }
      spells.push('');
    }
  }

  return (
    spells.join('\n') || 'No specific spell recommendations for this week.'
  );
}

function generateExtendedDailyBreakdowns(data: WeeklyCosmicData): string {
  return data.dailyForecasts
    .map(
      (day) => `
### ${day.date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
*${day.planetaryRuler}'s Day - Moon in ${day.moonSign}*

${day.energy}

${day.guidance}

${day.majorEvents.length > 0 ? `**Major Events:** ${day.majorEvents.join(', ')}` : ''}

${day.avoid.length > 0 ? `**Avoid:** ${day.avoid.join(', ')}` : ''}
`,
    )
    .join('\n');
}

function generateMagicalTimingDeepDive(data: WeeklyCosmicData): string {
  const parts: string[] = [];

  if (data.magicalTiming.powerDays.length > 0) {
    parts.push(
      `**Power Days:** ${data.magicalTiming.powerDays.map((d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })).join(', ')}`,
    );
    parts.push(
      'These days carry amplified cosmic energy, making them ideal for manifestation work, important decisions, and ritual practices.',
    );
  }

  if (data.magicalTiming.voidOfCourseMoon.length > 0) {
    parts.push('\n**Void of Course Moon Periods:**');
    data.magicalTiming.voidOfCourseMoon.forEach((voidPeriod) => {
      parts.push(
        `- ${voidPeriod.start.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })} to ${voidPeriod.end.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
      );
      parts.push(`  ${voidPeriod.guidance}`);
    });
  }

  return parts.join('\n\n') || 'Standard cosmic timing applies this week.';
}

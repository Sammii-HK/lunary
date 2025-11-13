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

function generateFreeContentFromWeeklyData(
  data: WeeklyCosmicData,
  appUrl: string,
): string {
  const weekRange = `${data.weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${data.weekEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  return `
# ${data.title}

*${data.subtitle}*

**Week of ${weekRange}**

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

**Want your personalized daily horoscope and full week ahead?**

Get complete birth chart analysis, personalized daily horoscopes, and interactive cosmic profile in the [Lunary app](${appUrl}) - just $4.99/month.

*Upgrade from newsletter to full cosmic experience.*
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

**Ready for personalized cosmic guidance?**

Get your complete birth chart analysis, personalized daily horoscopes, and interactive cosmic profile in the [Lunary app](${appUrl}) - just $4.99/month.

*Upgrade from newsletter to full cosmic experience.*
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
  const {
    getSpellsByCategory,
  } = require('../../src/constants/grimoire/spells');
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

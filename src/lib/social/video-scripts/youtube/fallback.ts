/**
 * YouTube fallback script generation
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';

/**
 * Build YouTube intro section
 */
export function buildYouTubeIntro(
  theme: WeeklyTheme,
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const category = theme.category;

  const intros: Record<string, string> = {
    zodiac: `The zodiac is more than sun signs and daily horoscopes. It is an ancient system of celestial mapping that has guided human understanding for millennia. Today, we explore ${theme.name}, examining the fundamental principles that form the backbone of astrological practice.`,
    tarot: `The tarot is a symbolic language, a mirror for the psyche, and a tool for contemplation. In this exploration of ${theme.name}, we move beyond fortune-telling into the realm of archetypal wisdom.`,
    lunar: `The moon governs tides, cycles, and the rhythm of life on Earth. Understanding lunar phases means understanding the natural pulse of existence. This week, we examine ${theme.name}.`,
    planetary: `The planets of our solar system have been observed, named, and mythologized across every culture. Their movements correspond to patterns in human experience. Today we explore ${theme.name}.`,
    crystals: `Crystals are concentrated forms of Earth's energy, formed over millions of years under immense pressure. Each carries distinct properties and uses. We explore ${theme.name}.`,
    numerology: `Numbers are not merely quantities. In numerology, they carry vibrational frequencies and symbolic significance. This week's focus: ${theme.name}.`,
    chakras: `The chakra system maps energy centers within the body, each governing specific physical, emotional, and spiritual functions. Our topic: ${theme.name}.`,
    sabbat: `The wheel of the year turns through eight sabbats, marking the seasonal rhythms that our ancestors lived by. Today we honor ${theme.name}.`,
  };

  return (
    intros[category] || `Today we explore ${theme.name}. ${theme.description}`
  );
}

/**
 * Build YouTube overview section
 */
export function buildYouTubeOverview(
  theme: WeeklyTheme,
  facets: DailyFacet[],
): string {
  const facetTitles = facets.slice(0, 5).map((f) => f.title);

  return `This deep dive covers several interconnected topics: ${facetTitles.join(', ')}. Each builds upon the last, creating a comprehensive understanding of ${theme.name.toLowerCase()}. We begin with foundational concepts, move into symbolic meaning, and conclude with practical applications you can integrate into your practice or study.`;
}

/**
 * Build YouTube foundations section
 */
export function buildYouTubeFoundations(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = `${facet.title}: `;
      if (grimoireData.description) {
        para += grimoireData.description.split('.').slice(0, 2).join('.') + '.';
      } else {
        para += facet.focus;
      }

      if (grimoireData.element) {
        para += ` Associated with the ${grimoireData.element} element.`;
      }
      if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
        para += ` Core themes include ${grimoireData.keywords.slice(0, 3).join(', ')}.`;
      }

      paragraphs.push(para);
    } else {
      paragraphs.push(`${facet.title}: ${facet.focus}`);
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * Build YouTube deeper meaning section
 */
export function buildYouTubeDeeperMeaning(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `Moving beyond surface definitions, we examine the deeper symbolic layers of ${theme.name.toLowerCase()}.`,
  );

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = '';
      if (grimoireData.mysticalProperties) {
        para = grimoireData.mysticalProperties;
      } else if (grimoireData.meaning) {
        para = grimoireData.meaning;
      } else if (grimoireData.symbolism) {
        para = `The symbolism of ${facet.title}: ${grimoireData.symbolism}`;
      } else {
        para = `${facet.title} represents ${facet.focus.toLowerCase()}.`;
      }
      paragraphs.push(para);
    }
  }

  return paragraphs.join('\n\n');
}

/**
 * Build YouTube practical section
 */
export function buildYouTubePractical(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `How does this knowledge apply practically? Understanding ${theme.name.toLowerCase()} offers several applications.`,
  );

  for (const { facet: _facet, data: grimoireData } of data) {
    if (grimoireData) {
      if (grimoireData.transitEffect) {
        paragraphs.push(grimoireData.transitEffect);
      } else if (grimoireData.houseMeaning) {
        paragraphs.push(grimoireData.houseMeaning);
      } else if (grimoireData.healingProperties) {
        paragraphs.push(
          `Healing applications: ${grimoireData.healingProperties}`,
        );
      } else if (grimoireData.usage) {
        paragraphs.push(`Practical usage: ${grimoireData.usage}`);
      } else if (grimoireData.affirmation) {
        paragraphs.push(
          `Practice this affirmation: "${grimoireData.affirmation}"`,
        );
      }
    }
  }

  if (paragraphs.length < 3) {
    paragraphs.push(
      `Integrate this knowledge gradually. Study, observe, and reflect on how these principles manifest in your experience.`,
    );
  }

  return paragraphs.join('\n\n');
}

/**
 * Build YouTube summary section
 */
export function buildYouTubeSummary(
  theme: WeeklyTheme,
  facets: DailyFacet[],
): string {
  const keyPoints = facets
    .slice(0, 4)
    .map((f) => f.title.toLowerCase())
    .join(', ');

  return `To summarize: we have explored ${theme.name.toLowerCase()}, covering ${keyPoints}, and more. Each of these elements interconnects, forming a coherent system of understanding. The key is not memorization, but integration. Allow this knowledge to deepen your perspective over time.`;
}

/**
 * Build YouTube outro section
 */
export function buildYouTubeOutro(theme: WeeklyTheme): string {
  return `For deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
}

/**
 * Generate full YouTube script fallback
 */
export function generateYouTubeScriptFallback(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const intro = buildYouTubeIntro(theme, allData);
  const overview = buildYouTubeOverview(theme, facets);
  const foundations = buildYouTubeFoundations(theme, allData.slice(0, 3));
  const deeperMeaning = buildYouTubeDeeperMeaning(theme, allData.slice(2, 5));
  const practical = buildYouTubePractical(theme, allData.slice(4, 7));
  const summary = buildYouTubeSummary(theme, facets);
  const outro = buildYouTubeOutro(theme);

  return `${intro}\n\n${overview}\n\n${foundations}\n\n${deeperMeaning}\n\n${practical}\n\n${summary}\n\n${outro}`;
}

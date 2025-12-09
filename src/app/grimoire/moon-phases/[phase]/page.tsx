import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { monthlyMoonPhases } from '../../../../../utils/moon/monthlyPhases';
import { stringToKebabCase } from '../../../../../utils/string';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

const phaseKeys = Object.keys(monthlyMoonPhases);

export async function generateStaticParams() {
  return phaseKeys.map((phase) => ({
    phase: stringToKebabCase(phase),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const phaseKey = phaseKeys.find(
    (p) => stringToKebabCase(p) === phase.toLowerCase(),
  );

  if (!phaseKey) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  const phaseName = phaseKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  return createGrimoireMetadata({
    title: `${phaseName} Moon: Meaning & Rituals - Lunary`,
    description: `Discover the complete guide to the ${phaseName} Moon phase. Learn about ${phaseName} meaning, energy, rituals, and how to work with this lunar phase.`,
    keywords: [
      `${phaseName} moon`,
      `${phaseName} meaning`,
      `${phaseName} phase`,
      `${phaseName} rituals`,
      `moon phase ${phaseName}`,
    ],
    url: `https://lunary.app/grimoire/moon-phases/${phase}`,
    ogImagePath: '/api/og/grimoire/moon',
    ogImageAlt: `${phaseName} Moon`,
  });
}

export default async function MoonPhasePage({
  params,
}: {
  params: Promise<{ phase: string }>;
}) {
  const { phase } = await params;
  const phaseKey = phaseKeys.find(
    (p) => stringToKebabCase(p) === phase.toLowerCase(),
  );

  if (!phaseKey) {
    notFound();
  }

  const phaseData =
    monthlyMoonPhases[phaseKey as keyof typeof monthlyMoonPhases];
  const phaseName = phaseKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  // Generate ritual suggestions based on phase
  const ritualTemplates: Record<string, string[]> = {
    newMoon: [
      'Set intentions for the new cycle. Write down your goals and desires.',
      'Create a vision board or manifestation list.',
      'Perform a new moon meditation focusing on what you want to attract.',
      'Light a white or silver candle and speak your intentions aloud.',
      'Plant seeds (literal or metaphorical) for future growth.',
    ],
    waxingCrescent: [
      'Take action on your new moon intentions.',
      'Build momentum with small, consistent steps.',
      'Gather resources and information for your goals.',
      'Connect with supportive people who can help you.',
      'Visualize your goals coming to fruition.',
    ],
    firstQuarter: [
      'Face challenges and obstacles with determination.',
      'Make decisions and take decisive action.',
      'Problem-solve and find creative solutions.',
      'Push through resistance and stay committed.',
      'Adjust your plans as needed while staying focused.',
    ],
    waxingGibbous: [
      'Refine and perfect your plans and projects.',
      'Review your progress and make improvements.',
      'Prepare for the full moon culmination.',
      'Be patient and stay dedicated to your goals.',
      'Fine-tune details and polish your work.',
    ],
    fullMoon: [
      'Celebrate achievements and express gratitude.',
      'Release what no longer serves you.',
      'Perform a full moon ritual or ceremony.',
      'Charge crystals and tools under the full moon.',
      "Reflect on what you've accomplished.",
    ],
    waningGibbous: [
      'Share your knowledge and wisdom with others.',
      'Express gratitude for your blessings.',
      'Give back to your community.',
      'Reflect on your journey and lessons learned.',
      'Help others with their goals.',
    ],
    lastQuarter: [
      'Release old patterns and habits.',
      'Forgive yourself and others.',
      'Let go of what no longer serves you.',
      'Clear out physical and emotional clutter.',
      'Prepare for the new cycle ahead.',
    ],
    waningCrescent: [
      'Rest and recharge your energy.',
      'Reflect on the completed cycle.',
      'Complete unfinished business.',
      'Practice self-care and introspection.',
      'Prepare for the new moon ahead.',
    ],
  };

  const rituals = ritualTemplates[phaseKey] || [];

  const faqs = [
    {
      question: `What does the ${phaseName} Moon mean?`,
      answer: `The ${phaseName} Moon represents ${phaseData.keywords.join(', ').toLowerCase()}. ${phaseData.information}`,
    },
    {
      question: `What should I do during the ${phaseName} Moon?`,
      answer: `During the ${phaseName} Moon, focus on ${phaseData.keywords.join(', ').toLowerCase()}. This is an ideal time for ${rituals[0]?.toLowerCase() || 'lunar work'}.`,
    },
    {
      question: `How long does the ${phaseName} Moon last?`,
      answer: `Each moon phase lasts approximately 3-4 days, transitioning gradually to the next phase in the lunar cycle.`,
    },
    {
      question: `What rituals work best during the ${phaseName} Moon?`,
      answer: `The ${phaseName} Moon is ideal for ${phaseData.keywords[0]?.toLowerCase() || 'lunar'} work. Focus on ${rituals.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What is the ${phaseName} Moon symbol?`,
      answer: `The ${phaseName} Moon is represented by the symbol ${phaseData.symbol}. This symbol reflects the moon's appearance during this phase.`,
    },
  ];

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      <SEOContentTemplate
        title={`${phaseName} Moon - Lunary`}
        h1={`${phaseName} Moon: Complete Guide`}
        description={`Discover everything about the ${phaseName} Moon phase. Learn about its meaning, energy, and rituals.`}
        keywords={[
          `${phaseName} moon`,
          `${phaseName} meaning`,
          `${phaseName} phase`,
          `${phaseName} rituals`,
        ]}
        canonicalUrl={`https://lunary.app/grimoire/moon-phases/${phase}`}
        intro={`The ${phaseName} Moon, represented by ${phaseData.symbol}, is a key phase in the lunar cycle. ${phaseData.information}`}
        tldr={`The ${phaseName} Moon (${phaseData.symbol}) represents ${phaseData.keywords.join(', ').toLowerCase()}.`}
        meaning={`The ${phaseName} Moon is one of the eight phases in the lunar cycle, each representing different energies and opportunities for magical and spiritual work.

${phaseData.information}

The lunar cycle moves through these phases approximately every 29.5 days, creating a rhythm that influences our emotions, energy levels, and spiritual practices. Understanding the ${phaseName} Moon helps you align your activities and intentions with the natural lunar rhythm.

During the ${phaseName} Moon, the energy is focused on ${phaseData.keywords.join(', ').toLowerCase()}. This makes it an ideal time for specific types of work, whether that's setting intentions, taking action, celebrating achievements, or releasing what no longer serves.

Working with the ${phaseName} Moon consciously allows you to harness its unique energy for personal growth, manifestation, and spiritual development. By aligning your practices with this phase, you can amplify your results and deepen your connection to lunar cycles.`}
        glyphs={[phaseData.symbol]}
        emotionalThemes={phaseData.keywords}
        howToWorkWith={[
          `Align your activities with ${phaseName} energy`,
          `Focus on ${phaseData.keywords.join(', ').toLowerCase()}`,
          `Perform ${phaseName} rituals and practices`,
          `Honor the lunar cycle's natural rhythm`,
          `Use ${phaseName} energy for growth`,
        ]}
        rituals={rituals}
        journalPrompts={[
          `How do I feel during the ${phaseName} Moon?`,
          `What does ${phaseName} energy inspire in me?`,
          `How can I work with ${phaseName} energy more consciously?`,
          `What intentions align with the ${phaseName} Moon?`,
          `What do I want to release or attract during this phase?`,
        ]}
        relatedItems={[
          {
            name: 'Moon Guide',
            href: '/grimoire/moon',
            type: 'Guide',
          },
          {
            name: 'Horoscope',
            href: '/horoscope',
            type: 'Daily Reading',
          },
          {
            name: 'Birth Chart',
            href: '/birth-chart',
            type: 'Guide',
          },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon Phases', href: '/grimoire/moon' },
          {
            label: phaseName,
            href: `/grimoire/moon-phases/${phase}`,
          },
        ]}
        internalLinks={[
          { text: "View Today's Moon Phase", href: '/horoscope' },
          { text: 'Explore Moon Rituals', href: '/grimoire/moon-rituals' },
          { text: 'Calculate Birth Chart', href: '/birth-chart' },
          { text: 'Grimoire Home', href: '/grimoire' },
        ]}
        ctaText={`Want personalized moon insights for your chart?`}
        ctaHref='/pricing'
        faqs={faqs}
      />
    </div>
  );
}

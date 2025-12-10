import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { monthlyMoonPhases } from '../../../../../../utils/moon/monthlyPhases';
import { stringToKebabCase } from '../../../../../../utils/string';
import { createCosmicEntitySchema, renderJsonLd } from '@/lib/schema';

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
}): Promise<Metadata> {
  const { phase } = await params;
  const phaseKey = phaseKeys.find(
    (p) => stringToKebabCase(p) === phase.toLowerCase(),
  );

  if (!phaseKey) {
    return {
      title: 'Not Found - Lunary Grimoire',
    };
  }

  const phaseData =
    monthlyMoonPhases[phaseKey as keyof typeof monthlyMoonPhases];
  const phaseName = phaseKey
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
  const displayName = phaseName.includes('Moon')
    ? phaseName
    : `${phaseName} Moon`;
  const title = `${displayName}: Meaning, Rituals & Manifestation - Lunary`;
  const description = `${displayName} meaning: energy, rituals & spiritual practices. Best activities, spell timing & manifestation guide for the ${phaseName.toLowerCase()} phase.`;

  return {
    title,
    description,
    keywords: [
      displayName.toLowerCase(),
      `${displayName.toLowerCase()} meaning`,
      `${displayName.toLowerCase()} rituals`,
      `${displayName.toLowerCase()} manifestation`,
      `moon phase ${phaseName.toLowerCase()}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/moon/phases/${phase}`,
      siteName: 'Lunary',
      images: [
        {
          url: '/api/og/grimoire/moon',
          width: 1200,
          height: 630,
          alt: displayName,
        },
      ],
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/api/og/cosmic'],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/moon/phases/${phase}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
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
  const displayName = phaseName.includes('Moon')
    ? phaseName
    : `${phaseName} Moon`;

  const ritualTemplates: Record<string, string[]> = {
    newMoon: [
      'Set intentions for the new cycle',
      'Create a vision board or manifestation list',
      'Perform a new moon meditation',
      'Light a white or silver candle and speak intentions',
      'Plant seeds for future growth',
    ],
    waxingCrescent: [
      'Take action on your new moon intentions',
      'Build momentum with consistent steps',
      'Gather resources for your goals',
      'Connect with supportive people',
      'Visualize goals coming to fruition',
    ],
    firstQuarter: [
      'Face challenges with determination',
      'Make decisions and take decisive action',
      'Problem-solve creatively',
      'Push through resistance',
      'Adjust plans while staying focused',
    ],
    waxingGibbous: [
      'Refine and perfect your plans',
      'Review progress and make improvements',
      'Prepare for the full moon culmination',
      'Practice patience and dedication',
      'Fine-tune details',
    ],
    fullMoon: [
      'Celebrate achievements and express gratitude',
      'Release what no longer serves you',
      'Perform a full moon ritual',
      'Charge crystals under the full moon',
      'Reflect on accomplishments',
    ],
    waningGibbous: [
      'Share knowledge with others',
      'Express gratitude for blessings',
      'Give back to your community',
      'Reflect on lessons learned',
      'Help others with their goals',
    ],
    lastQuarter: [
      'Release old patterns and habits',
      'Practice forgiveness',
      'Let go of what no longer serves',
      'Clear physical and emotional clutter',
      'Prepare for the new cycle',
    ],
    waningCrescent: [
      'Rest and recharge energy',
      'Reflect on the completed cycle',
      'Complete unfinished business',
      'Practice self-care',
      'Prepare for the new moon',
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
  ];

  // Entity schema for Knowledge Graph
  const moonPhaseSchema = createCosmicEntitySchema({
    name: displayName,
    description: `The ${displayName} is a lunar phase ideal for ${phaseData.keywords.slice(0, 3).join(', ').toLowerCase()}. Best for ${rituals[0]?.toLowerCase() || 'lunar rituals'}.`,
    url: `/grimoire/moon/phases/${phase}`,
    additionalType: 'https://en.wikipedia.org/wiki/Lunar_phase',
    keywords: [
      displayName.toLowerCase(),
      `${phaseName.toLowerCase()} phase`,
      'moon phase',
      'lunar cycle',
      ...phaseData.keywords.slice(0, 3),
    ],
  });

  return (
    <div className='p-4 md:p-6 lg:p-8 xl:p-10 min-h-full'>
      {renderJsonLd(moonPhaseSchema)}
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
        canonicalUrl={`https://lunary.app/grimoire/moon/phases/${phase}`}
        intro={`The ${phaseName} Moon, represented by ${phaseData.symbol}, is a key phase in the lunar cycle. ${phaseData.information}`}
        tldr={`The ${phaseName} Moon (${phaseData.symbol}) represents ${phaseData.keywords.join(', ').toLowerCase()}.`}
        meaning={`The ${phaseName} Moon is one of the eight phases in the lunar cycle, each representing different energies and opportunities for magical and spiritual work.

${phaseData.information}

The lunar cycle moves through these phases approximately every 29.5 days, creating a rhythm that influences our emotions, energy levels, and spiritual practices. Understanding the ${phaseName} Moon helps you align your activities and intentions with the natural lunar rhythm.

During the ${phaseName} Moon, the energy is focused on ${phaseData.keywords.join(', ').toLowerCase()}. This makes it an ideal time for specific types of work, whether that's setting intentions, taking action, celebrating achievements, or releasing what no longer serves.`}
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
        ]}
        relatedItems={[
          { name: 'Moon Guide', href: '/grimoire/moon', type: 'Guide' },
          { name: 'Horoscope', href: '/horoscope', type: 'Daily Reading' },
          { name: 'Birth Chart', href: '/birth-chart', type: 'Guide' },
        ]}
        breadcrumbs={[
          { label: 'Grimoire', href: '/grimoire' },
          { label: 'Moon', href: '/grimoire/moon' },
          { label: phaseName, href: `/grimoire/moon/phases/${phase}` },
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

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  HOUSES,
  PLANETS_FOR_HOUSES,
  PLANET_HOUSE_DISPLAY,
  HOUSE_DATA,
  getOrdinalSuffix,
  generateAllHouseParams,
  HousePlanet,
  House,
} from '@/constants/seo/houses';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

interface PageParams {
  planet: string;
  house: string;
}

export async function generateStaticParams() {
  return generateAllHouseParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { planet, house: houseStr } = await params;
  const house = parseInt(houseStr) as House;

  if (
    !PLANETS_FOR_HOUSES.includes(planet as HousePlanet) ||
    !HOUSES.includes(house)
  ) {
    return { title: 'House Placement Not Found | Lunary' };
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const houseData = HOUSE_DATA[house];
  const ordinal = getOrdinalSuffix(house);

  const title = `${planetName} in the ${ordinal} House: Meaning & Interpretation | Lunary`;
  const description = `${planetName} in the ${ordinal} House meaning in astrology. Learn how ${planetName} influences ${houseData.lifeArea.toLowerCase()} in your natal chart.`;

  return {
    title,
    description,
    keywords: [
      `${planetName.toLowerCase()} in ${ordinal} house`,
      `${planetName.toLowerCase()} ${ordinal} house`,
      `${ordinal} house ${planetName.toLowerCase()}`,
      `${planetName.toLowerCase()} house placement`,
      'natal chart houses',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/houses/${planet}/${house}`,
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/houses/${planet}/${house}`,
    },
  };
}

export default async function HousePlacementPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { planet, house: houseStr } = await params;
  const house = parseInt(houseStr) as House;

  if (
    !PLANETS_FOR_HOUSES.includes(planet as HousePlanet) ||
    !HOUSES.includes(house)
  ) {
    notFound();
  }

  const planetName = PLANET_HOUSE_DISPLAY[planet as HousePlanet];
  const houseData = HOUSE_DATA[house];
  const ordinal = getOrdinalSuffix(house);

  return (
    <SEOContentTemplate
      title={`${planetName} in the ${ordinal} House`}
      h1={`${planetName} in the ${ordinal} House`}
      description={`When ${planetName} is placed in the ${ordinal} House, it brings its energy to the area of ${houseData.lifeArea.toLowerCase()}. This placement shapes how you experience ${houseData.keywords[0]} and ${houseData.keywords[1]}.`}
      keywords={[`${planetName} ${ordinal} house`, ...houseData.keywords]}
      canonicalUrl={`https://lunary.app/grimoire/houses/${planet}/${house}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='House Placements'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Houses', href: '/grimoire/houses' },
        { label: `${planetName} in ${ordinal} House` },
      ]}
      whatIs={{
        question: `What does ${planetName} in the ${ordinal} House mean?`,
        answer: `${planetName} in the ${ordinal} House places ${planetName}'s energy in the realm of ${houseData.lifeArea.toLowerCase()}. The ${ordinal} House is naturally associated with ${houseData.naturalSign} and ruled by ${houseData.naturalRuler}. ${houseData.description}`,
      }}
      tldr={`${planetName} in House ${house} influences: ${houseData.lifeArea}. Natural sign: ${houseData.naturalSign}. Keywords: ${houseData.keywords.join(', ')}.`}
      meaning={`
## ${planetName} in the ${houseData.name}

${houseData.description}

When ${planetName} occupies this house, it brings its unique energy to these life areas.

### Life Areas Affected

This placement influences:
${houseData.keywords.map((k) => `- ${k.charAt(0).toUpperCase() + k.slice(1)}`).join('\n')}

### Expression of ${planetName} Energy

${planetName} in the ${ordinal} House expresses through ${houseData.lifeArea.toLowerCase()}. The way you approach ${houseData.keywords[0]} is colored by ${planetName}'s qualities.

### Natural Ruler Connection

The ${ordinal} House is naturally associated with ${houseData.naturalSign} and ruled by ${houseData.naturalRuler}. Having ${planetName} here creates a dialogue between ${planetName}'s energy and ${houseData.naturalRuler}'s themes.

This placement becomes clearer over time. Look for repeated patterns in the ${houseData.lifeArea.toLowerCase()} area - those are the themes your chart is asking you to develop.

If this placement feels challenging, focus on building skills rather than fixing yourself. Each house placement is a training ground with both gifts and lessons.

Over time, you can learn to express this placement more consciously by noticing what triggers it and what supports it. Awareness is the fastest path to balance.

Many people notice this placement most clearly during key life transitions. When you shift jobs, relationships, or routines, this planet-house combo often becomes more visible and easier to work with.

If you want to work with the placement intentionally, focus on skill-building. One small habit, practiced weekly, will create more growth than occasional big efforts.

Give yourself time. House placements mature with age and experience, so patience is part of the practice.

Track this placement yearly to see how it evolves with different life stages.

Patterns here often deepen as you gain experience.

Notice the long arc.
Small choices compound in this house, so track patterns over time.
Look for repeating themes during transits and returns.
      `}
      emotionalThemes={houseData.keywords.map(
        (k) => k.charAt(0).toUpperCase() + k.slice(1),
      )}
      signsMostAffected={[houseData.naturalSign]}
      howToWorkWith={[
        `Notice how ${planetName.toLowerCase()} themes appear in ${houseData.lifeArea.toLowerCase()}.`,
        `Use ${houseData.naturalSign} traits as a guide for balance.`,
        'Track transits to this house for timing and emphasis.',
        'Set one goal that honors this placement.',
      ]}
      rituals={[
        `Write a simple intention for ${houseData.lifeArea.toLowerCase()} and revisit it weekly.`,
        `Choose a symbol of ${planetName} and place it on your altar.`,
        `Journal one small action that supports this placement.`,
        `Set a weekly check-in focused on ${houseData.keywords[0]?.toLowerCase() || 'this theme'}.`,
      ]}
      journalPrompts={[
        `How does ${planetName} show up in my ${houseData.lifeArea.toLowerCase()}?`,
        `What feels most aligned with this ${ordinal} House placement?`,
        `Where do I need more confidence or clarity in this area?`,
        `What habit would help me express this placement more fully?`,
        `What boundary supports me in ${houseData.lifeArea.toLowerCase()}?`,
      ]}
      tables={[
        {
          title: `${ordinal} House Overview`,
          headers: ['Property', 'Value'],
          rows: [
            ['House', ordinal],
            ['Life Area', houseData.lifeArea],
            ['Natural Sign', houseData.naturalSign],
            ['Natural Ruler', houseData.naturalRuler],
            ['Keywords', houseData.keywords.join(', ')],
          ],
        },
        {
          title: `${planetName} in ${ordinal} House Focus`,
          headers: ['Theme', 'Prompt'],
          rows: [
            ['Energy', `How does ${planetName} express here?`],
            ['Growth', `What supports ${houseData.lifeArea.toLowerCase()}?`],
            ['Balance', `Where does moderation help?`],
          ],
        },
      ]}
      relatedItems={[
        {
          name: planetName,
          href: `/grimoire/astronomy/planets/${planet}`,
          type: 'Planet',
        },
        {
          name: `${houseData.naturalSign}`,
          href: `/grimoire/zodiac/${houseData.naturalSign.toLowerCase()}`,
          type: 'Zodiac',
        },
        { name: 'Houses Overview', href: '/grimoire/houses', type: 'Guide' },
      ]}
      internalLinks={[
        { text: 'Houses Overview', href: '/grimoire/houses/overview' },
        { text: 'Birth Chart Basics', href: '/grimoire/birth-chart' },
        { text: 'Planets', href: `/grimoire/astronomy/planets/${planet}` },
      ]}
      faqs={[
        {
          question: `Is ${planetName} in the ${ordinal} House good or bad?`,
          answer:
            'No placement is purely good or bad. Each has strengths and challenges that depend on awareness and how you work with the energy.',
        },
        {
          question: 'What if this house is empty in my chart?',
          answer:
            'Empty houses still matter. Transits will activate the house over time, and the house cusp sign still shapes it.',
        },
        {
          question: 'How does this placement show up day to day?',
          answer: `It tends to show up in ${houseData.lifeArea.toLowerCase()} choices, habits, and priorities. Watch where this theme repeats.`,
        },
        {
          question: 'What should I focus on to grow this placement?',
          answer: `Choose one habit that supports ${houseData.lifeArea.toLowerCase()} and practice it consistently. Small routines create lasting change.`,
        },
      ]}
      ctaText='Find your house placements'
      ctaHref='/birth-chart'
      sources={[{ name: 'Traditional house meanings' }]}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>
          {planetName} in Other Houses
        </h3>
        <p className='text-sm text-zinc-400 mb-4'>
          Comparing placements shows how the same planet shifts focus depending
          on life area. Use this as a quick way to see the range of expression.
        </p>
        <p className='text-sm text-zinc-400 mb-4'>
          Each house changes the context, but the planet stays the same. This
          helps you separate core energy from life setting.
        </p>
        <div className='flex flex-wrap gap-2'>
          {HOUSES.map((h) => (
            <Link
              key={h}
              href={`/grimoire/houses/${planet}/${h}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                h === house
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {getOrdinalSuffix(h)}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}

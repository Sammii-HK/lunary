import { notFound } from 'next/navigation';
import Link from 'next/link';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import {
  buildPlanetSignInterpretations,
  getPillarContent,
  getPlanetData,
  planetKeys,
} from '@/lib/grimoire/pillar-content';

export const revalidate = 2592000;
export const dynamicParams = false;

export function generateStaticParams() {
  return planetKeys.map((planet) => ({ planet }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const planetData = getPlanetData(planet);

  if (!planetData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${planetData.name} in the Signs: Complete Interpretation Guide | Lunary`,
    description: `Learn how ${planetData.name} changes across all twelve zodiac signs. Compare ${planetData.name} in Aries through ${planetData.name} in Pisces with chart-reading context.`,
    keywords: [
      `${planetData.name.toLowerCase()} in signs`,
      `${planetData.name.toLowerCase()} astrology`,
      `${planetData.name.toLowerCase()} interpretation`,
      `${planetData.name.toLowerCase()} in aries`,
      `${planetData.name.toLowerCase()} in pisces`,
    ],
    url: `https://lunary.app/grimoire/astronomy/planets/${planet}/in-signs`,
    ogImagePath: '/api/og/grimoire/planets',
    ogImageAlt: `${planetData.name} in the signs`,
  });
}

export default async function PlanetInSignsPage({
  params,
}: {
  params: Promise<{ planet: string }>;
}) {
  const { planet } = await params;
  const planetData = getPlanetData(planet);

  if (!planetData) {
    notFound();
  }

  const content = getPillarContent().planetInSigns;
  const sections = buildPlanetSignInterpretations(planet).filter(Boolean);

  return (
    <SEOContentTemplate
      title={`${planetData.name} in the Signs`}
      h1={`${planetData.name} in the Signs`}
      description={`Compare how ${planetData.name} behaves in each zodiac sign and use that difference in real chart reading.`}
      keywords={[
        `${planetData.name} in signs`,
        `${planetData.name} sign meanings`,
        `${planetData.name} chart interpretation`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/astronomy/planets/${planet}/in-signs`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Astronomy', href: '/grimoire/astronomy' },
        { label: 'Planets', href: '/grimoire/astronomy/planets' },
        {
          label: planetData.name,
          href: `/grimoire/astronomy/planets/${planet}`,
        },
        { label: 'In the Signs' },
      ]}
      whatIs={{
        question: `What does ${planetData.name} in a sign mean?`,
        answer: `${planetData.name} describes the function being expressed. The sign shows how that function behaves. ${planetData.name} in different signs changes tone, pacing, and instinct, but the core job of ${planetData.name.toLowerCase()} stays the same.`,
      }}
      tldr={`${planetData.name} stays ${planetData.name.toLowerCase()}, but every sign changes its style. Use this page to compare expression, then add house placement and aspects for a real reading.`}
      intro={content.introLead}
      meaning={`${planetData.houseMeaning}\n\n${planetData.transitEffect}\n\n${planetData.retrogradeEffect}\n\n${content.closingNote}`}
      meaningTitle='How to read this planet by sign'
      tableOfContents={[
        { label: 'Quick definition', href: '#what-is' },
        { label: 'How to read the sign shift', href: '#meaning' },
        ...sections.map((section) => ({
          label: section.signName,
          href: `#${section.signKey}`,
        })),
        { label: 'FAQ', href: '#faq' },
      ]}
      faqs={[
        {
          question: `Is ${planetData.name} in a sign enough to interpret the placement?`,
          answer: `No. ${planetData.name} in a sign is one layer. You still need the house, major aspects, and the condition of the sign ruler.`,
        },
        {
          question: `Should I read ${planetData.name} by sign before house or aspect?`,
          answer: `Read the planet first, the sign second, the house third, and the aspects after that. This keeps the interpretation structured instead of turning into keyword soup.`,
        },
      ]}
      internalLinks={[
        {
          text: `${planetData.name} Overview`,
          href: `/grimoire/astronomy/planets/${planet}`,
        },
        {
          text: 'Rulerships and Dignities',
          href: '/grimoire/astrology/rulerships-and-dignities',
        },
        { text: 'Placements', href: '/grimoire/placements' },
      ]}
      sources={[
        {
          name: 'Lunary chart-reading methodology',
          url: 'https://lunary.app/about/methodology',
        },
        { name: 'Traditional planetary and sign doctrine' },
      ]}
      ctaText={`Find your ${planetData.name} placement`}
      ctaHref='/birth-chart'
      childrenPosition='before-faqs'
    >
      <div className='space-y-6'>
        {sections.map((section) => (
          <section
            key={section.signKey}
            id={section.signKey}
            className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'
          >
            <h2 className='text-xl font-medium text-content-primary'>
              {section.title}
            </h2>
            <p className='mt-3 text-content-secondary leading-relaxed'>
              {section.summary}
            </p>
            <div className='mt-4 flex flex-wrap gap-3 text-sm'>
              <Link
                href={`/grimoire/zodiac/${section.signKey}`}
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                Read {section.signName}
              </Link>
              <Link
                href={`/grimoire/zodiac/${section.signKey}/in-the-chart`}
                className='text-lunary-primary-400 hover:text-lunary-primary-300'
              >
                {section.signName} in the chart
              </Link>
            </div>
          </section>
        ))}
      </div>
    </SEOContentTemplate>
  );
}

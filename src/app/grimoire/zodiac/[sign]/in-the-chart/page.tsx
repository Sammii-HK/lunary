import { notFound } from 'next/navigation';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';
import {
  buildSignAppliedInterpretations,
  getPillarContent,
  getSignRulershipSummary,
  getZodiacSignData,
  zodiacSignKeys,
} from '@/lib/grimoire/pillar-content';

export const revalidate = 2592000;
export const dynamicParams = false;

export function generateStaticParams() {
  return zodiacSignKeys.map((sign) => ({ sign }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signData = getZodiacSignData(sign);

  if (!signData) {
    return { title: 'Not Found - Lunary Grimoire' };
  }

  return createGrimoireMetadata({
    title: `${signData.name} in the Chart: Planets, Houses and Rising Meaning | Lunary`,
    description: `Learn how ${signData.name} changes meaning when it appears as a Sun sign, Moon sign, Rising sign, house cusp, or planetary placement.`,
    keywords: [
      `${signData.name.toLowerCase()} in the chart`,
      `${signData.name.toLowerCase()} rising`,
      `${signData.name.toLowerCase()} house cusp`,
      `${signData.name.toLowerCase()} placements`,
    ],
    url: `https://lunary.app/grimoire/zodiac/${sign}/in-the-chart`,
    ogImagePath: '/api/og/grimoire/zodiac',
    ogImageAlt: `${signData.name} in the chart`,
  });
}

export default async function SignInChartPage({
  params,
}: {
  params: Promise<{ sign: string }>;
}) {
  const { sign } = await params;
  const signData = getZodiacSignData(sign);

  if (!signData) {
    notFound();
  }

  const content = getPillarContent().signInChart;
  const applied = buildSignAppliedInterpretations(sign);

  return (
    <SEOContentTemplate
      title={`${signData.name} in the Chart`}
      h1={`${signData.name} in the Chart`}
      description={`See how ${signData.name} works as a rising sign, a planetary placement, and a house style in chart interpretation.`}
      keywords={[
        `${signData.name} in the chart`,
        `${signData.name} rising`,
        `${signData.name} placements`,
      ]}
      canonicalUrl={`https://lunary.app/grimoire/zodiac/${sign}/in-the-chart`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Zodiac', href: '/grimoire/zodiac' },
        { label: signData.name, href: `/grimoire/zodiac/${sign}` },
        { label: 'In the Chart' },
      ]}
      whatIs={{
        question: `What does ${signData.name} mean in a chart?`,
        answer: `${signData.name} describes a style of expression. In a chart, that style can show up through a planet, the Ascendant, or a house cusp. The interpretation changes with context, which is why ${signData.name} Sun, ${signData.name} Rising, and ${signData.name} on a house cusp are related but not interchangeable.`,
      }}
      tldr={`${signData.name} is chart language, not a complete personality reading. The planet tells you what is acting, the sign tells you how it acts, and the house shows where it acts.`}
      intro={content.introLead}
      meaning={`${signData.description}\n\nRulership: ${getSignRulershipSummary(signData.name)}\n\n${content.closingNote}`}
      meaningTitle={`How ${signData.name} works in chart reading`}
      tableOfContents={[
        { label: 'Quick definition', href: '#what-is' },
        { label: 'How to read the sign in context', href: '#meaning' },
        { label: `${signData.name} Rising`, href: '#rising-sign' },
        ...applied.planets.map((item) => ({
          label: item.planetName,
          href: `#planet-${item.planet}`,
        })),
        ...applied.houses.slice(0, 4).map((item) => ({
          label: item.title,
          href: `#house-${item.houseNumber}`,
        })),
        { label: 'FAQ', href: '#faq' },
      ]}
      faqs={[
        {
          question: `Is ${signData.name} Rising the same as having many planets in ${signData.name}?`,
          answer: `No. ${signData.name} Rising sets the angle and the chart ruler. Planets in ${signData.name} add emphasis, but they do not replace the role of the Ascendant.`,
        },
        {
          question: `How do I interpret ${signData.name} on a house cusp?`,
          answer: `Read the house topics first, then let ${signData.name} describe the style. After that, inspect the ruler of ${signData.name} to understand how those topics actually perform in the chart.`,
        },
      ]}
      internalLinks={[
        { text: `${signData.name} Overview`, href: `/grimoire/zodiac/${sign}` },
        {
          text: 'Rulerships and Dignities',
          href: '/grimoire/astrology/rulerships-and-dignities',
        },
        { text: 'Placements', href: '/grimoire/placements' },
        { text: 'Houses', href: '/grimoire/houses' },
      ]}
      sources={[
        {
          name: 'Lunary chart-reading methodology',
          url: 'https://lunary.app/about/methodology',
        },
        { name: 'Traditional sign, house, and rulership doctrine' },
      ]}
      ctaText={`Build your ${signData.name} chart`}
      ctaHref='/birth-chart'
      childrenPosition='before-faqs'
    >
      <div className='space-y-6'>
        <section
          id='rising-sign'
          className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'
        >
          <h2 className='text-xl font-medium text-content-primary'>
            {signData.name} Rising
          </h2>
          <p className='mt-3 text-content-secondary leading-relaxed'>
            {signData.name} Rising puts {signData.name.toLowerCase()} on the
            Ascendant, which means the sign colors instinctive approach,
            presentation, and the way the whole chart gets oriented. The ruler
            of {signData.name} becomes especially important because it carries a
            big part of the chart's operational logic.
          </p>
        </section>

        {applied.planets.map((item) => (
          <section
            key={item.planet}
            id={`planet-${item.planet}`}
            className='rounded-xl border border-stroke-subtle bg-surface-elevated/30 p-5'
          >
            <h2 className='text-xl font-medium text-content-primary'>
              {item.title}
            </h2>
            <p className='mt-3 text-content-secondary leading-relaxed'>
              {item.summary}
            </p>
          </section>
        ))}

        {applied.houses.map((item) => (
          <section
            key={item.houseNumber}
            id={`house-${item.houseNumber}`}
            className='rounded-xl border border-stroke-subtle bg-surface-elevated/20 p-5'
          >
            <h2 className='text-xl font-medium text-content-primary'>
              {item.title}
            </h2>
            <p className='mt-3 text-content-secondary leading-relaxed'>
              {item.summary}
            </p>
          </section>
        ))}
      </div>
    </SEOContentTemplate>
  );
}

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  NUMEROLOGY_MEANINGS,
  getUniversalYear,
  getYearRange,
} from '@/constants/seo/numerology';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

// 30-day ISR revalidation
export const revalidate = 2592000;
// Removed generateStaticParams - using pure ISR for faster builds
// Pages are generated on-demand and cached with 30-day revalidation

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  const yearNum = parseInt(year);
  const universalYear = getUniversalYear(yearNum);
  const data = NUMEROLOGY_MEANINGS[universalYear];

  if (!data) {
    return { title: 'Numerology Year Not Found | Lunary' };
  }

  const title = `${year} Numerology: Universal Year ${universalYear} Meaning | Lunary`;
  const description = `${year} is a Universal Year ${universalYear} in numerology - a year of ${data.theme}. Discover what this means for your life, relationships, career, and spiritual growth.`;

  return {
    title,
    description,
    keywords: [
      `${year} numerology`,
      `universal year ${universalYear}`,
      `${year} numerology meaning`,
      `numerology ${year}`,
      'universal year meaning',
      'numerology forecast',
    ],
    openGraph: {
      title,
      description,
      url: `https://lunary.app/grimoire/numerology/year/${year}`,
      images: [
        `/api/og/cosmic?title=${encodeURIComponent(`${year}: Universal Year ${universalYear}`)}`,
      ],
    },
    alternates: {
      canonical: `https://lunary.app/grimoire/numerology/year/${year}`,
    },
  };
}

export default async function NumerologyYearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const yearNum = parseInt(year);
  const universalYear = getUniversalYear(yearNum);
  const data = NUMEROLOGY_MEANINGS[universalYear];

  if (!data) {
    notFound();
  }

  return (
    <SEOContentTemplate
      title={`${year} Numerology: Universal Year ${universalYear}`}
      h1={`${year}: Universal Year ${universalYear} - ${data.theme}`}
      description={`${year} vibrates to the energy of Universal Year ${universalYear}. ${data.energy}`}
      keywords={[
        `${year} numerology`,
        `universal year ${universalYear}`,
        data.theme,
        'numerology',
      ]}
      canonicalUrl={`https://lunary.app/grimoire/numerology/year/${year}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Numerology'
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Numerology', href: '/grimoire/numerology' },
        { label: 'Personal Year', href: '/grimoire/numerology/year' },
        { label: `${year}` },
      ]}
      whatIs={{
        question: `What does ${year} mean in numerology?`,
        answer: `In numerology, ${year} is a Universal Year ${universalYear}. This is calculated by adding ${year.split('').join(' + ')} = ${universalYear}. Universal Year ${universalYear} is characterized by ${data.theme}. ${data.energy}`,
      }}
      tldr={`${year} = Universal Year ${universalYear}. Theme: ${data.theme}. Keywords: ${data.keywords.join(', ')}. Focus on: ${data.focus.slice(0, 2).join(', ')}.`}
      meaning={`
## Understanding ${year} as Universal Year ${universalYear}

${data.energy}

### The Energy of ${universalYear}

Universal Year ${universalYear} brings themes of ${data.theme.toLowerCase()}. This energy influences everyone on the planet, creating a collective backdrop for personal growth and societal shifts.

### Areas of Focus

During a ${universalYear} Universal Year, the universe supports:
${data.focus.map((f) => `- ${f}`).join('\n')}

### Potential Challenges

Be aware of these common challenges during a ${universalYear} year:
${data.challenges.map((c) => `- ${c}`).join('\n')}

### Opportunities to Embrace

${year} offers these special opportunities:
${data.opportunities.map((o) => `- ${o}`).join('\n')}
      `}
      rituals={[
        `Meditate on the number ${universalYear} and its energy`,
        `Set ${universalYear}-aligned intentions for the year`,
        `Work with ${universalYear} energy in your personal practice`,
      ]}
      emotionalThemes={data.keywords.map(
        (k) => k.charAt(0).toUpperCase() + k.slice(1),
      )}
      signsMostAffected={['All Signs']}
      tables={[
        {
          title: `${year} Universal Year Overview`,
          headers: ['Aspect', 'Details'],
          rows: [
            ['Universal Year', universalYear.toString()],
            ['Theme', data.theme],
            ['Keywords', data.keywords.join(', ')],
            ['Best For', data.opportunities.slice(0, 2).join(', ')],
            ['Watch For', data.challenges.slice(0, 2).join(', ')],
          ],
        },
        {
          title: 'Monthly Energies',
          headers: ['Month', 'Energy'],
          rows: data.months.map((m) => [m.month, m.energy]),
        },
      ]}
      relatedItems={[
        {
          name: `${yearNum - 1} Numerology`,
          href: `/grimoire/numerology/year/${yearNum - 1}`,
          type: 'Numerology',
        },
        {
          name: `${yearNum + 1} Numerology`,
          href: `/grimoire/numerology/year/${yearNum + 1}`,
          type: 'Numerology',
        },
        {
          name: 'Numerology Overview',
          href: '/grimoire/numerology',
          type: 'Guide',
        },
      ]}
      ctaText='Calculate your personal year number'
      ctaHref='/horoscope'
      sources={[
        { name: 'Pythagorean numerology' },
        { name: 'Universal year calculations' },
      ]}
    >
      <div className='mt-8'>
        <h3 className='text-lg font-medium mb-4'>Other Years</h3>
        <div className='flex flex-wrap gap-2'>
          {getYearRange().map((y) => (
            <Link
              key={y}
              href={`/grimoire/numerology/year/${y}`}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                y === yearNum
                  ? 'bg-lunary-primary-900/30 text-lunary-primary-200 border border-lunary-primary-600'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {y}
            </Link>
          ))}
        </div>
      </div>
    </SEOContentTemplate>
  );
}

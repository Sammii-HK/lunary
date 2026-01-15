import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  NUMEROLOGY_MEANINGS,
  getUniversalYear,
  getYearRange,
} from '@/constants/seo/numerology';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';

export async function generateStaticParams() {
  return getYearRange().map((year) => ({ year: String(year) }));
}

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
        `/api/og/educational/numerology?title=${encodeURIComponent(`${year}: Universal Year ${universalYear}`)}&subtitle=${encodeURIComponent(data.theme)}&format=landscape`,
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

Universal Years describe the collective tone, while your Personal Year describes your individual focus. Both are useful: the Universal Year sets the backdrop, and your Personal Year shows where you are working within that backdrop.

To calculate the Universal Year, add the digits of the year and reduce to a single digit. This method is the same across numerology traditions and gives a clear snapshot of the year's overall emphasis.

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

### How to Work With This Year

Choose one theme from the list above and build a simple, consistent practice around it. If this is a year of expansion, focus on steady growth. If it is a year of refinement, focus on quality and clarity.

### Relationships and Career

Universal Year ${universalYear} also colors relationships and work. Notice where the theme appears in group dynamics or big decisions, and align your choices with the supportive opportunities.

### Personal Year Contrast

Your Personal Year shows your individual focus, while the Universal Year shows the shared backdrop. If your Personal Year feels at odds with the Universal Year, prioritize self-care and choose smaller, achievable goals.
      `}
      rituals={[
        `Meditate on the number ${universalYear} and its energy`,
        `Set ${universalYear}-aligned intentions for the year`,
        `Work with ${universalYear} energy in your personal practice`,
        'Review your goals quarterly and adjust to the yearly theme',
        'Choose one keyword for the year and post it somewhere visible',
      ]}
      journalPrompts={[
        `Where do I see ${data.theme.toLowerCase()} showing up this year?`,
        'What one focus would make this year feel successful?',
        'Which challenge from this year is asking for my attention?',
        'How can I work with the collective energy while honoring my needs?',
        'What would I like to complete before this year ends?',
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
        {
          title: 'Universal vs Personal',
          headers: ['Type', 'What it describes'],
          rows: [
            ['Universal Year', 'Collective theme and timing'],
            ['Personal Year', 'Individual focus and priorities'],
          ],
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
      internalLinks={[
        { text: 'Personal Year Calculator', href: '/horoscope' },
        { text: 'Numerology Guide', href: '/grimoire/numerology' },
        { text: 'Core Numbers', href: '/grimoire/numerology/core-numbers/1' },
        { text: 'Grimoire Home', href: '/grimoire' },
      ]}
      faqs={[
        {
          question: `How do I calculate the Universal Year for ${year}?`,
          answer: `Add the digits of ${year} (${year.split('').join(' + ')}) until you reach a single digit. That total is Universal Year ${universalYear}.`,
        },
        {
          question: 'Is Universal Year the same as Personal Year?',
          answer:
            'No. Universal Year affects everyone collectively, while Personal Year is calculated from your birth date and shows your individual focus.',
        },
        {
          question: `How should I plan for Universal Year ${universalYear}?`,
          answer: `Pick one theme from ${data.theme} and build a few small habits that support it. Consistent action aligns best.`,
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

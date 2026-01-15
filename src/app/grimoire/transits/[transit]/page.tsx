import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  YEARLY_TRANSITS,
  getTransitsForYear,
  generateAllTransitParams,
} from '@/constants/seo/yearly-transits';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { createGrimoireMetadata } from '@/lib/grimoire-metadata';

export async function generateStaticParams() {
  return generateAllTransitParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ transit: string }>;
}) {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    return { title: 'Transit Not Found | Lunary' };
  }

  return createGrimoireMetadata({
    title: `${transit.title}: ${transit.transitType} Meaning & Dates | Lunary`,
    description: `${transit.title} (${transit.dates}). ${transit.description.slice(0, 150)}...`,
    keywords: [
      transit.title.toLowerCase(),
      transit.transitType.toLowerCase(),
      `${transit.planet.toLowerCase()} transit ${transit.year}`,
      ...transit.signs.map(
        (s) => `${transit.planet.toLowerCase()} in ${s.toLowerCase()}`,
      ),
    ],
    url: `https://lunary.app/grimoire/transits/${transitId}`,
    ogImagePath: '/api/og/grimoire/transits',
    ogImageAlt: transit.title,
  });
}

export default async function TransitPage({
  params,
}: {
  params: Promise<{ transit: string }>;
}) {
  const { transit: transitId } = await params;

  const transit = YEARLY_TRANSITS.find((t) => t.id === transitId);
  if (!transit) {
    notFound();
  }

  const sameYearTransits = getTransitsForYear(transit.year).filter(
    (t) => t.id !== transitId,
  );

  const faqs = [
    {
      question: `What is ${transit.title}?`,
      answer: `${transit.title} is a ${transit.transitType.toLowerCase()} transit occurring in ${transit.year}. ${transit.description.slice(0, 100)}...`,
    },
    {
      question: `When does ${transit.title} occur?`,
      answer: `${transit.title} occurs ${transit.dates}.`,
    },
    {
      question: `Which signs are most affected by ${transit.title}?`,
      answer: `${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} most directly impacted by this transit.`,
    },
    {
      question: `What should I do during ${transit.title}?`,
      answer: `During ${transit.title}, focus on ${transit.doList.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
    {
      question: `What should I avoid during ${transit.title}?`,
      answer: `During ${transit.title}, avoid ${transit.avoidList.slice(0, 2).join(' and ').toLowerCase()}.`,
    },
  ];

  return (
    <SEOContentTemplate
      title={transit.title}
      h1={transit.title}
      description={transit.description}
      keywords={[transit.transitType, transit.planet, ...transit.signs]}
      canonicalUrl={`https://lunary.app/grimoire/transits/${transitId}`}
      datePublished='2025-01-01'
      dateModified={new Date().toISOString().split('T')[0]}
      articleSection='Yearly Transits'
      intro={`This transit guide is designed to help you work with ${transit.title} in practical ways. Use it to plan timing, set intentions, and respond to the themes with clarity instead of overwhelm.`}
      breadcrumbs={[
        { label: 'Grimoire', href: '/grimoire' },
        { label: 'Transits', href: '/grimoire/transits' },
        {
          label: String(transit.year),
          href: `/grimoire/transits/year/${transit.year}`,
        },
        { label: transit.title },
      ]}
      whatIs={{
        question: `What is ${transit.title}?`,
        answer: transit.description,
      }}
      tldr={`${transit.title} (${transit.dates}). Planet: ${transit.planet}. Signs: ${transit.signs.join(', ')}. Key themes: ${transit.themes.join(', ')}.`}
      meaning={`
## ${transit.title}

${transit.description}

### When Does This Transit Occur?

${transit.dates}

### Signs Most Affected

${transit.signs.join(', ')} ${transit.signs.length > 1 ? 'are' : 'is'} directly impacted by this transit.

### Key Themes

${transit.themes.map((t) => `- ${t.charAt(0).toUpperCase() + t.slice(1)}`).join('\n')}

### What to Do During This Transit

${transit.doList.map((d) => `- ${d}`).join('\n')}

### What to Avoid

${transit.avoidList.map((a) => `- ${a}`).join('\n')}

### How to Work With This Transit

Notice where ${transit.planet} lands in your natal chart and the house it activates. That house shows where the themes will feel most personal. The signs listed above show who will feel the transit most strongly, but everyone can work with the energy through that house area.

### Timing Tips

The days around the exact transit tend to feel the most intense. Use that window for focused actions, decisions, or release work aligned with the themes.

### Integration

Journal what shifts during the transit so you can see patterns over the year. Many transits repeat in cycles, and tracking them helps you build long-term understanding.

### If You Feel Overwhelmed

Keep the practice simple. Choose one theme and one action. Transits are easier to work with when you focus on a single, realistic step.

### House Emphasis

If you know your birth chart, locate the house where this transit is happening. That house points to the life area receiving the strongest push. For example, a 4th house transit emphasizes home and family, while a 10th house transit emphasizes career and visibility.

### Supportive Approach

Transits are temporary. The goal is not to fix your life in a week, but to respond with awareness. Small adjustments made during the peak window often carry forward after the transit ends.

### Working with the Bigger Cycle

Some transits return in predictable cycles. When you track them year over year, you can see patterns in growth, relationships, and priorities. Use this transit as a data point, not a one-time event.

### Grounding the Energy

If the transit feels intense, slow down. Choose one small action, one simple ritual, and one clear boundary. Those three anchors will keep the energy productive instead of chaotic.

### If You Do Not Know Your Chart

You can still work with the general themes. Pick one area of life that matches the transit (relationships, work, home, or health) and focus your actions there. General timing still helps when applied with intention.

### Body and Energy Check

Transits can show up in mood, sleep, or motivation. Track small changes in energy levels so you can respond with care rather than pushing through.

### Reflection Window

After the peak dates pass, take ten minutes to review what shifted. This short reflection helps you carry the lesson forward instead of forgetting it.

### Optional Ritual

Write a short intention for the transit and keep it somewhere visible. A small reminder keeps the focus clear during the busiest days.

If you want extra clarity, review the transit after it ends and list one change you want to keep.

Small adjustments compound over time.
Stay flexible.
      `}
      howToWorkWith={[
        'Identify the house activated in your chart and name the life area.',
        'Choose one theme to focus on for the peak dates.',
        'Balance action with recovery so the shift is sustainable.',
        'Review the transit after it passes and note what changed.',
      ]}
      rituals={[
        ...transit.doList,
        `Set one intention tied to ${transit.planet.toLowerCase()} and revisit it weekly`,
        'Light a candle and reflect on the main theme for five minutes',
      ]}
      emotionalThemes={transit.themes.map(
        (t) => t.charAt(0).toUpperCase() + t.slice(1),
      )}
      signsMostAffected={transit.signs}
      tables={[
        {
          title: 'Transit Overview',
          headers: ['Property', 'Value'],
          rows: [
            ['Transit', transit.transitType],
            ['Planet', transit.planet],
            ['Year', String(transit.year)],
            ['Dates', transit.dates],
            ['Signs', transit.signs.join(', ')],
          ],
        },
        {
          title: 'Quick Guidance',
          headers: ['Do', 'Avoid'],
          rows: [
            [
              transit.doList.slice(0, 2).join(', '),
              transit.avoidList.slice(0, 2).join(', '),
            ],
          ],
        },
        {
          title: 'House Focus Examples',
          headers: ['House', 'Focus'],
          rows: [
            ['1st', 'Identity and self-image'],
            ['4th', 'Home and family'],
            ['7th', 'Relationships and agreements'],
            ['10th', 'Career and visibility'],
          ],
        },
        {
          title: 'Transit Pacing',
          headers: ['Phase', 'What to do'],
          rows: [
            ['Approach', 'Prepare and set intention'],
            ['Peak', 'Act or release with focus'],
            ['After', 'Review and integrate'],
          ],
        },
      ]}
      journalPrompts={[
        `Where do I feel ${transit.planet.toLowerCase()} themes most strongly right now?`,
        'What is this transit asking me to start or release?',
        'How do the themes show up in relationships or work?',
        'What small action can align me with this energy today?',
        'What boundary would help me respond more clearly?',
        'What house area feels most active right now?',
        'What would a supportive next step look like this week?',
      ]}
      relatedItems={[
        {
          name: transit.planet,
          href: `/grimoire/astronomy/planets/${transit.planet.toLowerCase()}`,
          type: 'Planet',
        },
        ...transit.signs.slice(0, 2).map((s) => ({
          name: s,
          href: `/grimoire/zodiac/${s.toLowerCase()}`,
          type: 'Zodiac' as const,
        })),
      ]}
      internalLinks={[
        {
          text: 'Transit Calendar',
          href: `/grimoire/transits/year/${transit.year}`,
        },
        {
          text: 'Planets',
          href: `/grimoire/astronomy/planets/${transit.planet.toLowerCase()}`,
        },
        { text: 'Zodiac Signs', href: '/grimoire/zodiac' },
        { text: 'Grimoire Home', href: '/grimoire' },
      ]}
      ctaText='See how this transit affects your chart'
      ctaHref='/horoscope'
      sources={[{ name: 'Ephemeris calculations' }]}
      faqs={faqs}
    >
      {sameYearTransits.length > 0 && (
        <div className='mt-8'>
          <h3 className='text-lg font-medium mb-4'>
            Other {transit.year} Transits
          </h3>
          <div className='flex flex-wrap gap-2'>
            {sameYearTransits.map((t) => (
              <Link
                key={t.id}
                href={`/grimoire/transits/${t.id}`}
                className='px-3 py-1.5 rounded-lg text-sm bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition-colors'
              >
                {t.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </SEOContentTemplate>
  );
}

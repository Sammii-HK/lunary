import { Metadata } from 'next';
import { SEOContentTemplate } from '@/components/grimoire/SEOContentTemplate';
import { synastryAspects, aspectTypes } from '@/constants/seo/synastry-aspects';
import { NavParamLink } from '@/components/NavParamLink';
import { Heart, Sparkles } from 'lucide-react';
import { Heading } from '@/components/ui/Heading';
import { createItemListSchema, renderJsonLd } from '@/lib/schema';

export const revalidate = 86400;

export const metadata: Metadata = {
  title: 'Synastry Aspects: Relationship Compatibility in Astrology - Lunary',
  description:
    'Explore synastry aspects and what they mean for relationship compatibility. Learn about Sun-Moon, Venus-Mars, and other key planetary aspects between charts.',
  keywords: [
    'synastry aspects',
    'relationship astrology',
    'compatibility aspects',
    'synastry chart aspects',
    'sun moon synastry',
    'venus mars synastry',
    'romantic compatibility astrology',
  ],
  openGraph: {
    title: 'Synastry Aspects: Relationship Compatibility in Astrology - Lunary',
    description:
      'Explore synastry aspects and what they mean for relationship compatibility.',
    type: 'article',
  },
  twitter: {
    card: 'summary',
    title: 'Synastry Aspects: Relationship Compatibility in Astrology - Lunary',
    description:
      'Explore synastry aspects and what they mean for relationship compatibility.',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/synastry/aspects',
  },
};

function ScoreDisplay({ score, label }: { score: number; label: string }) {
  const colorClass =
    score >= 8
      ? 'text-lunary-success'
      : score >= 6
        ? 'text-lunary-accent'
        : 'text-lunary-rose';
  return (
    <div className='text-center'>
      <div className={`text-lg font-medium ${colorClass}`}>{score}/10</div>
      <div className='text-xs text-zinc-500'>{label}</div>
    </div>
  );
}

export default function SynastryAspectsPage() {
  const itemListSchema = createItemListSchema({
    name: 'Synastry Aspects Guide',
    description:
      'Complete guide to synastry aspects for relationship compatibility in astrology.',
    url: 'https://lunary.app/grimoire/synastry/aspects',
    items: synastryAspects.map((aspect) => ({
      name: `${aspect.planet1} ${aspect.aspect} ${aspect.planet2} Synastry`,
      url: `https://lunary.app/grimoire/synastry/aspects/${aspect.slug}`,
      description: aspect.overview.slice(0, 150),
    })),
  });

  return (
    <>
      {renderJsonLd(itemListSchema)}
      <SEOContentTemplate
        title='Synastry Aspects: Relationship Compatibility in Astrology - Lunary'
        h1='Synastry Aspects'
        subtitle='Planetary Connections in Relationship Astrology'
        description='Explore synastry aspects and what they mean for relationship compatibility. Learn how planetary connections between two birth charts reveal attraction, challenges, and growth potential.'
        keywords={[
          'synastry aspects',
          'relationship astrology',
          'compatibility aspects',
          'synastry chart',
          'romantic compatibility',
        ]}
        canonicalUrl='https://lunary.app/grimoire/synastry/aspects'
        intro='Synastry aspects are the angular relationships between planets in two different birth charts. When you compare your chart with a partner, friend, or family member, these aspects reveal how your energies interact—showing areas of natural harmony, dynamic tension, and transformative growth.'
        whatIs={{
          question: 'What are synastry aspects?',
          answer:
            "Synastry aspects are the geometric angles formed between planets in two different birth charts. They reveal how two people's energies interact, showing compatibility, attraction patterns, challenges, and growth potential in any relationship.",
        }}
        meaning={`### Understanding Synastry Aspects

When comparing two birth charts, astrologers look at how the planets in one chart relate to the planets in the other. These relationships are called **aspects**, and each type has a different quality:

**Conjunction (0°)** — Planets merge their energies, creating intense focus and powerful connection
**Trine (120°)** — Easy, harmonious flow that feels natural and supportive
**Sextile (60°)** — Friendly, opportunistic energy that supports growth
**Square (90°)** — Dynamic tension that creates friction but also passion and growth
**Opposition (180°)** — Magnetic polarity that attracts and challenges simultaneously

### Key Planets in Synastry

Different planetary combinations reveal different relationship dynamics:

- **Sun-Moon**: Core identity meets emotional needs—fundamental compatibility
- **Venus-Mars**: Romantic and sexual attraction—the chemistry factor
- **Mercury-Mercury**: Communication style—how you understand each other
- **Saturn aspects**: Commitment, stability, and long-term potential
- **Jupiter aspects**: Growth, expansion, and shared joy

### Reading Synastry Aspects

No single aspect defines a relationship. A healthy relationship usually has a mix of harmonious aspects (trines, sextiles) for ease and challenging aspects (squares, oppositions) for growth and passion. The key is understanding how to work with each energy consciously.`}
        faqs={[
          {
            question: 'What is synastry in astrology?',
            answer:
              "Synastry is the comparison of two birth charts to understand relationship dynamics. It reveals how two people's planetary energies interact, showing areas of compatibility, attraction, and potential challenges.",
          },
          {
            question: 'What are the best synastry aspects for love?',
            answer:
              'Strong Venus-Mars aspects indicate romantic and sexual chemistry. Sun-Moon conjunctions create deep emotional bonds. Jupiter-Venus aspects bring joy and abundance. However, the "best" aspects depend on what each person values in a relationship.',
          },
          {
            question: 'Are challenging aspects bad in synastry?',
            answer:
              'No! Challenging aspects (squares, oppositions) create dynamic tension that can fuel passion and growth. Many successful relationships have significant challenging aspects—they just require conscious effort to navigate.',
          },
          {
            question: 'How do I read my synastry chart?',
            answer:
              'Start by identifying major aspects between personal planets (Sun, Moon, Mercury, Venus, Mars). Look for conjunctions, trines, and squares first. Consider the overall balance of harmonious vs. challenging aspects.',
          },
        ]}
        internalLinks={[
          { text: 'Synastry Overview', href: '/grimoire/synastry' },
          {
            text: 'Generate Synastry Chart',
            href: '/grimoire/synastry/generate',
          },
          { text: 'Zodiac Compatibility', href: '/grimoire/compatibility' },
          { text: 'Birth Chart Guide', href: '/grimoire/birth-chart' },
        ]}
        ctaText='Generate Your Synastry Chart'
        ctaHref='/grimoire/synastry/generate'
      >
        {/* Aspect Types Overview */}
        <section className='mb-12'>
          <Heading as='h2' variant='h2'>
            Aspect Types
          </Heading>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
            {Object.entries(aspectTypes).map(([key, type]) => (
              <div
                key={key}
                className='p-4 rounded-lg border border-zinc-800 bg-zinc-900/50'
              >
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-2xl font-astro text-lunary-primary-400'>
                    {type.symbol}
                  </span>
                  <div>
                    <div className='font-medium text-zinc-100 capitalize'>
                      {key}
                    </div>
                    <div className='text-xs text-zinc-500'>{type.degrees}°</div>
                  </div>
                </div>
                <p className='text-sm text-zinc-400'>{type.description}</p>
                <div className='mt-2'>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      type.nature === 'harmonious'
                        ? 'bg-lunary-success-900/30 text-lunary-success'
                        : type.nature === 'challenging'
                          ? 'bg-lunary-rose-900/30 text-lunary-rose'
                          : 'bg-lunary-accent-900/30 text-lunary-accent'
                    }`}
                  >
                    {type.nature}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* All Synastry Aspects */}
        <section>
          <Heading as='h2' variant='h2'>
            Explore Synastry Aspects
          </Heading>
          <div className='space-y-4 mt-6'>
            {synastryAspects.map((aspect) => (
              <NavParamLink
                key={aspect.slug}
                href={`/grimoire/synastry/aspects/${aspect.slug}`}
                className='block p-5 rounded-lg border border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-lunary-primary-600 transition-all group'
              >
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                      {aspect.planet1 === 'Venus' ||
                      aspect.planet2 === 'Venus' ? (
                        <Heart className='h-4 w-4 text-lunary-rose' />
                      ) : (
                        <Sparkles className='h-4 w-4 text-lunary-primary-400' />
                      )}
                      <h3 className='text-lg font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
                        {aspect.planet1} {aspect.aspect} {aspect.planet2}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          aspectTypes[aspect.aspectType].nature === 'harmonious'
                            ? 'bg-lunary-success-900/30 text-lunary-success'
                            : aspectTypes[aspect.aspectType].nature ===
                                'challenging'
                              ? 'bg-lunary-rose-900/30 text-lunary-rose'
                              : 'bg-lunary-accent-900/30 text-lunary-accent'
                        }`}
                      >
                        {aspect.aspectType}
                      </span>
                    </div>
                    <p className='text-sm text-zinc-400 line-clamp-2'>
                      {aspect.overview.slice(0, 150)}...
                    </p>
                    <div className='flex flex-wrap gap-2 mt-3'>
                      {aspect.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className='text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400'
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className='hidden sm:flex gap-4'>
                    <ScoreDisplay
                      score={aspect.scores.overall}
                      label='Overall'
                    />
                    <ScoreDisplay score={aspect.scores.love} label='Love' />
                    <ScoreDisplay
                      score={aspect.scores.emotional}
                      label='Emotional'
                    />
                  </div>
                </div>
              </NavParamLink>
            ))}
          </div>
        </section>
      </SEOContentTemplate>
    </>
  );
}

import { Metadata } from 'next';
import { NavParamLink } from '@/components/NavParamLink';
import { Heading } from '@/components/ui/Heading';
import {
  getAllRisingSigns,
  getPublicRisingSignSlug,
} from '@/lib/rising-signs/getRisingSign';
import { elementAstro, zodiacSymbol } from '@/constants/symbols';

export const revalidate = 2592000; // 30 days

export const metadata: Metadata = {
  title:
    'Rising Signs (Ascendant) Guide: All 12 Rising Signs Explained - Lunary',
  description:
    'Discover what your rising sign (ascendant) means. Learn how each of the 12 rising signs shapes first impressions, appearance, and outer personality.',
  keywords: [
    'rising signs',
    'ascendant',
    'rising sign meaning',
    'ascendant signs',
    'what is my rising sign',
    'rising sign calculator',
    'ascendant astrology',
  ],
  openGraph: {
    title: 'Rising Signs Guide: All 12 Ascendants Explained',
    description:
      'Complete guide to all 12 rising signs. Learn how your ascendant shapes first impressions and appearance.',
    type: 'article',
    url: 'https://lunary.app/grimoire/rising',
  },
  alternates: {
    canonical: 'https://lunary.app/grimoire/rising',
  },
};

const elementColors: Record<string, string> = {
  Fire: 'border-red-700 bg-red-950/30',
  Earth: 'border-green-700 bg-green-950/30',
  Air: 'border-sky-700 bg-sky-950/30',
  Water: 'border-blue-700 bg-blue-950/30',
};

const elementGlyphs: Record<'Fire' | 'Earth' | 'Air' | 'Water', string> = {
  Fire: elementAstro.fire,
  Earth: elementAstro.earth,
  Air: elementAstro.air,
  Water: elementAstro.water,
};

export default function RisingSignsPage() {
  const risingSigns = getAllRisingSigns();

  // Group by element
  const byElement = risingSigns.reduce(
    (acc, rising) => {
      if (!acc[rising.element]) acc[rising.element] = [];
      acc[rising.element].push(rising);
      return acc;
    },
    {} as Record<string, typeof risingSigns>,
  );

  return (
    <main className='max-w-4xl mx-auto px-4 py-8'>
      <div className='mb-8'>
        <nav className='text-sm text-content-muted mb-4'>
          <NavParamLink
            href='/grimoire'
            className='hover:text-content-secondary'
          >
            Grimoire
          </NavParamLink>
          <span className='mx-2'>/</span>
          <span className='text-content-secondary'>Rising Signs</span>
        </nav>

        <Heading as='h1' variant='h1'>
          Rising Signs (Ascendant) Guide
        </Heading>
        <p className='text-lg text-content-muted mt-4'>
          Your rising sign, or ascendant, is the zodiac sign that was rising on
          the eastern horizon at the moment of your birth. It shapes your first
          impressions, physical appearance, and how others perceive you.
        </p>
        <p className='text-content-muted mt-4 max-w-3xl'>
          The useful way to read an Ascendant is not just “what vibe do I give
          off?” Your rising sign sets the first house and the whole house
          sequence of the chart. That means the sign itself matters, but so does
          the ruler of that sign, the house that ruler lands in, and the aspects
          it makes. Lunary treats the Ascendant as the structural key to the
          chart, not a cosmetic extra.
        </p>
      </div>

      {/* What is a Rising Sign */}
      <section className='mb-12 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/50'>
        <Heading as='h2' variant='h3'>
          What is a Rising Sign?
        </Heading>
        <div className='mt-4 space-y-4 text-content-secondary'>
          <p>
            While your <strong>Sun sign</strong> represents your core identity
            and <strong>Moon sign</strong> reflects your emotional nature, your{' '}
            <strong>Rising sign</strong> (also called the Ascendant) is the mask
            you wear and the first impression you make.
          </p>
          <p>
            The Rising sign changes approximately every two hours, which is why
            knowing your exact birth time is essential for determining it. It
            sets the stage for your entire birth chart, determining which houses
            the planets fall into.
          </p>
          <p>
            If you want to read a rising sign properly, use this order: identify
            the Ascendant sign, find its ruler, locate that ruler by house and
            sign, then check the ruler&apos;s strongest aspects. That tells you
            how the outer style, first instinct, and chart direction actually
            work in practice.
          </p>
          <div className='grid md:grid-cols-3 gap-4 mt-6'>
            <div className='p-4 rounded-lg bg-surface-card/50'>
              <div className='font-medium text-content-primary mb-2'>
                First Impressions
              </div>
              <p className='text-sm text-content-muted'>
                How you come across when meeting new people
              </p>
            </div>
            <div className='p-4 rounded-lg bg-surface-card/50'>
              <div className='font-medium text-content-primary mb-2'>
                Physical Appearance
              </div>
              <p className='text-sm text-content-muted'>
                Influences your style, mannerisms, and physical traits
              </p>
            </div>
            <div className='p-4 rounded-lg bg-surface-card/50'>
              <div className='font-medium text-content-primary mb-2'>
                Life Approach
              </div>
              <p className='text-sm text-content-muted'>
                How you instinctively navigate the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Rising Signs by Element */}
      {(['Fire', 'Earth', 'Air', 'Water'] as const).map((element) => (
        <section key={element} className='mb-10'>
          <Heading as='h2' variant='h3'>
            <span className='font-astro mr-2 text-lunary-primary-400 leading-none'>
              {elementGlyphs[element]}
            </span>
            {element} Rising Signs
          </Heading>
          <p className='text-content-muted mt-2 mb-4'>
            {element === 'Fire' &&
              'Bold, energetic, and action-oriented first impressions.'}
            {element === 'Earth' &&
              'Grounded, reliable, and practical outer presence.'}
            {element === 'Air' &&
              'Intellectual, communicative, and socially engaging.'}
            {element === 'Water' &&
              'Intuitive, emotional, and deeply perceptive.'}
          </p>
          <div className='grid md:grid-cols-2 gap-4'>
            {byElement[element]?.map((rising) => {
              const signSlug = getPublicRisingSignSlug(rising.slug);
              const glyph = zodiacSymbol[signSlug as keyof typeof zodiacSymbol];

              return (
                <NavParamLink
                  key={rising.slug}
                  href={`/grimoire/rising/${signSlug}`}
                  className={`p-5 rounded-lg border ${elementColors[element]} hover:border-lunary-primary-600 transition-all`}
                >
                  <div className='flex items-center justify-between gap-3 mb-2'>
                    <span className='flex items-center gap-3 text-lg font-medium text-content-primary'>
                      {glyph && (
                        <span className='font-astro text-2xl text-lunary-primary-400 leading-none'>
                          {glyph}
                        </span>
                      )}
                      {rising.sign} Rising
                    </span>
                    <span className='text-xs text-content-muted'>
                      Ruled by {rising.ruler}
                    </span>
                  </div>
                  <p className='text-sm text-content-muted mb-3'>
                    {rising.firstImpression.slice(0, 120)}...
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    {rising.coreTraits.slice(0, 2).map((trait) => (
                      <span
                        key={trait}
                        className='text-xs px-2 py-1 rounded bg-surface-card text-content-muted'
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </NavParamLink>
              );
            })}
          </div>
        </section>
      ))}

      <section className='mb-12 p-6 rounded-lg border border-stroke-subtle bg-surface-elevated/40'>
        <Heading as='h2' variant='h3'>
          How Lunary Reads Rising Signs
        </Heading>
        <div className='mt-4 space-y-4 text-content-secondary'>
          <p>
            Lunary combines astronomical chart-angle calculation with
            traditional Ascendant doctrine. The sign on the Ascendant describes
            the entry point into life. The chart ruler shows how that sign
            actually behaves. The first house describes the body and immediate
            orientation to the world. Decans then refine the tone further when
            you need more precision.
          </p>
          <ul className='list-disc pl-5 space-y-2'>
            <li>Ascendant sign: outer style, approach, first reaction</li>
            <li>Chart ruler: the operating system behind the Ascendant</li>
            <li>First house: embodiment, instinct, and visibility</li>
            <li>Decans: nuance inside the sign once the basics are clear</li>
          </ul>
          <p className='text-sm text-content-muted'>
            Sources: Lunary Ascendant interpretation framework, Astronomy Engine
            chart-angle calculations, traditional Ascendant and chart-ruler
            doctrine.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-layer-deep/30 text-center'>
        <Heading as='h2' variant='h3'>
          Don&apos;t Know Your Rising Sign?
        </Heading>
        <p className='text-content-muted mt-2 mb-4'>
          Calculate your complete birth chart to discover your rising sign,
          along with your Moon sign and planetary placements.
        </p>
        <NavParamLink
          href='/birth-chart'
          className='inline-block px-6 py-3 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white font-medium transition-colors'
        >
          Calculate Your Birth Chart
        </NavParamLink>
        <div className='mt-4 flex flex-wrap items-center justify-center gap-3 text-sm'>
          <NavParamLink
            href='/grimoire/houses/1st-house'
            className='text-content-muted hover:text-content-secondary'
          >
            Read the 1st House
          </NavParamLink>
          <NavParamLink
            href='/grimoire/decans'
            className='text-content-muted hover:text-content-secondary'
          >
            Learn Decans
          </NavParamLink>
          <NavParamLink
            href='/grimoire/guides/birth-chart-complete-guide'
            className='text-content-muted hover:text-content-secondary'
          >
            Full Birth Chart Guide
          </NavParamLink>
        </div>
      </section>
    </main>
  );
}

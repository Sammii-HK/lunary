import { Metadata } from 'next';
import { NavParamLink } from '@/components/NavParamLink';
import { Heading } from '@/components/ui/Heading';
import { getAllRisingSigns } from '@/lib/rising-signs/getRisingSign';

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

const elementEmoji: Record<string, string> = {
  Fire: '🔥',
  Earth: '🌍',
  Air: '💨',
  Water: '💧',
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
        <nav className='text-sm text-zinc-500 mb-4'>
          <NavParamLink href='/grimoire' className='hover:text-zinc-300'>
            Grimoire
          </NavParamLink>
          <span className='mx-2'>/</span>
          <span className='text-zinc-300'>Rising Signs</span>
        </nav>

        <Heading as='h1' variant='h1'>
          Rising Signs (Ascendant) Guide
        </Heading>
        <p className='text-lg text-zinc-400 mt-4'>
          Your rising sign, or ascendant, is the zodiac sign that was rising on
          the eastern horizon at the moment of your birth. It shapes your first
          impressions, physical appearance, and how others perceive you.
        </p>
      </div>

      {/* What is a Rising Sign */}
      <section className='mb-12 p-6 rounded-lg border border-zinc-800 bg-zinc-900/50'>
        <Heading as='h2' variant='h3'>
          What is a Rising Sign?
        </Heading>
        <div className='mt-4 space-y-4 text-zinc-300'>
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
          <div className='grid md:grid-cols-3 gap-4 mt-6'>
            <div className='p-4 rounded-lg bg-zinc-800/50'>
              <div className='font-medium text-zinc-100 mb-2'>
                First Impressions
              </div>
              <p className='text-sm text-zinc-400'>
                How you come across when meeting new people
              </p>
            </div>
            <div className='p-4 rounded-lg bg-zinc-800/50'>
              <div className='font-medium text-zinc-100 mb-2'>
                Physical Appearance
              </div>
              <p className='text-sm text-zinc-400'>
                Influences your style, mannerisms, and physical traits
              </p>
            </div>
            <div className='p-4 rounded-lg bg-zinc-800/50'>
              <div className='font-medium text-zinc-100 mb-2'>
                Life Approach
              </div>
              <p className='text-sm text-zinc-400'>
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
            <span className='mr-2'>{elementEmoji[element]}</span>
            {element} Rising Signs
          </Heading>
          <p className='text-zinc-400 mt-2 mb-4'>
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
            {byElement[element]?.map((rising) => (
              <NavParamLink
                key={rising.slug}
                href={`/grimoire/rising/${rising.slug}`}
                className={`p-5 rounded-lg border ${elementColors[element]} hover:border-lunary-primary-600 transition-all`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-lg font-medium text-zinc-100'>
                    {rising.sign} Rising
                  </span>
                  <span className='text-xs text-zinc-500'>
                    Ruled by {rising.ruler}
                  </span>
                </div>
                <p className='text-sm text-zinc-400 mb-3'>
                  {rising.firstImpression.slice(0, 120)}...
                </p>
                <div className='flex flex-wrap gap-2'>
                  {rising.coreTraits.slice(0, 2).map((trait) => (
                    <span
                      key={trait}
                      className='text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-400'
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </NavParamLink>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className='mt-12 p-6 rounded-lg border border-lunary-primary-700 bg-lunary-primary-950/30 text-center'>
        <Heading as='h2' variant='h3'>
          Don&apos;t Know Your Rising Sign?
        </Heading>
        <p className='text-zinc-400 mt-2 mb-4'>
          Calculate your complete birth chart to discover your rising sign,
          along with your Moon sign and planetary placements.
        </p>
        <NavParamLink
          href='/birth-chart'
          className='inline-block px-6 py-3 rounded-lg bg-lunary-primary-600 hover:bg-lunary-primary-500 text-white font-medium transition-colors'
        >
          Calculate Your Birth Chart
        </NavParamLink>
      </section>
    </main>
  );
}
